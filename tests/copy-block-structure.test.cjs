const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { configureStore, combineReducers } = require('@reduxjs/toolkit');

const base = 'src/features/projects/pto/projectBlocks/';
function fixture(handler, role = 10) {
    const modules = new Map();
    const calls = [];
    function load(filename) {
        filename = path.resolve(__dirname, '..', filename);
        if (modules.has(filename)) return modules.get(filename);
        const exports = {};
        modules.set(filename, exports);
        const source = fs.readFileSync(filename, 'utf8');
        const compiled = ts.transpileModule(source.replaceAll('import.meta.env.VITE_API_URL', "'https://api.test'"), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }).outputText;
        const localRequire = (name) => {
            if (name === '../auth/getToken') return { getToken: () => 'test-access' };
            if (name === '@/features/auth/authSession') return { authenticatedFetch: () => { throw new Error('Unexpected request'); } };
            if (name === '@/utils/apiRequest') return {
                apiRequest: async (endpoint, method, body) => {
                    calls.push({ endpoint, method, body });
                    return handler(endpoint, method, body);
                },
            };
            if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
            if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`));
            return require(name);
        };
        vm.runInNewContext(compiled, { exports, require: localRequire, Error, Set, Number });
        return exports;
    }
    const feature = load(`${base}copyBlockStructure.ts`);
    const reducers = {
        projectBlocks: load(`${base}projectBlocksSlice.ts`),
        blockStages: load(`${base}blockStages/blockStagesSlice.ts`),
        stageSubsections: load(`${base}blockStages/subStages/stageSubsectionsSlice.ts`),
        estimates: load(`${base}estimatess/estimatesSlice.ts`),
        estimateItems: load(`${base}estimatess/estimateItems/estimateItemsSlice.ts`),
        reference: load('src/features/reference/referenceSlice.ts'),
    };
    const reducer = combineReducers({
        auth: (state = { user: { role_id: role } }) => state,
        ...Object.fromEntries(Object.entries(reducers).map(([key, value]) => [key, value.default])),
    });
    const store = configureStore({ reducer });
    return { feature, reducers, store, calls };
}

const result = { blockFrom: 18, blockTo: 24, stages: 5, subsections: 12, items: 28 };
const success = () => ({ success: true, message: 'Структура и позиции сметы скопированы', data: result });
const deferred = () => {
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    return { promise, resolve };
};

test('copies once with the documented payload and returns counts', async () => {
    const f = fixture(success);
    assert.equal(typeof f.feature.copyBlockStructure, 'function');
    const value = await f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 })).unwrap();
    assert.deepEqual(value, result);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].endpoint, '/projectBlocks/copyStructure');
    assert.equal(f.calls[0].method, 'POST');
    assert.deepEqual(f.calls[0].body, { blockFrom: 18, blockTo: 24 });
    assert.equal(f.store.getState().projectBlocks.copying, false);
});

test('rejects roles outside 1, 10, 11 and invalid or identical block IDs before requesting', async () => {
    for (const role of [2, 3, 9, 12, null]) {
        const f = fixture(success, role);
        assert.equal(typeof f.feature.copyBlockStructure, 'function');
        await assert.rejects(f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 })).unwrap());
        assert.equal(f.calls.length, 0);
    }
    for (const role of [1, 10, 11]) {
        const f = fixture(success, role);
        await f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 })).unwrap();
        assert.equal(f.calls.length, 1);
    }
    for (const [blockFrom, blockTo] of [[18, 18], [0, 24], [18, -1], [18, 2.5], [NaN, 24]]) {
        const f = fixture(success);
        await assert.rejects(f.store.dispatch(f.feature.copyBlockStructure({ blockFrom, blockTo })).unwrap());
        assert.equal(f.calls.length, 0);
    }
});

test('a pending copy prevents a second mutation even from another component', async () => {
    const response = deferred();
    const f = fixture(() => response.promise);
    assert.equal(typeof f.feature.copyBlockStructure, 'function');
    const first = f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 }));
    assert.equal(f.store.getState().projectBlocks.copying, true);
    const second = await f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 30 }));
    assert.equal(second.meta.condition, true);
    assert.equal(f.calls.length, 1);
    assert.equal(f.store.getState().projectBlocks.copying, true);
    response.resolve(success());
    await first.unwrap();
    assert.equal(f.store.getState().projectBlocks.copying, false);
});

test('server errors preserve their message and leave cached data intact', async () => {
    const f = fixture(() => { throw new Error('В блоке назначения есть действующие этапы'); });
    assert.equal(typeof f.feature.copyBlockStructure, 'function');
    const before = f.store.getState().estimateItems;
    await assert.rejects(
        f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 })).unwrap(),
        (error) => error === 'В блоке назначения есть действующие этапы',
    );
    assert.equal(f.store.getState().estimateItems, before);
    assert.equal(f.store.getState().projectBlocks.copying, false);
    assert.equal(f.calls.length, 1);
});

test('block options include subsequent pages and stay within the selected project', async () => {
    const f = fixture((endpoint, method, body) => ({
        data: body.page === 1
            ? [{ id: 18, project_id: 7, name: 'Источник' }]
            : [{ id: 24, project_id: 7, name: 'Назначение' }, { id: 99, project_id: 8, name: 'Чужой проект' }],
        pagination: { page: body.page, size: 100, total: 3, pages: 2, hasNext: body.page === 1, hasPrev: body.page > 1 },
    }));
    assert.equal(typeof f.feature.loadProjectBlockOptions, 'function');
    const blocks = await f.feature.loadProjectBlockOptions(7);
    assert.deepEqual(Array.from(blocks, (block) => block.id), [18, 24]);
    assert.deepEqual(f.calls.map((call) => call.body.page), [1, 2]);
    assert.ok(f.calls.every((call) => call.endpoint === '/projectBlocks/search' && call.body.project_id === 7));
});

test('destination projects include every page without the source-project filter', async () => {
    const f = fixture((endpoint, method, body) => {
        assert.equal(endpoint, '/projects/search');
        assert.equal(method, 'POST');
        assert.equal(body.project_id, undefined);
        return {
            data: body.page === 1
                ? [{ id: 7, name: 'Мадрид', deleted: false }]
                : [{ id: 12, name: 'Новый объект', deleted: false }, { id: 13, name: 'Удалённый', deleted: true }],
            pagination: { page: body.page, size: 100, total: 3, pages: 2, hasNext: body.page === 1, hasPrev: body.page > 1 },
        };
    });
    assert.equal(typeof f.feature.loadCopyStructureProjects, 'function');
    const projects = await f.feature.loadCopyStructureProjects();
    assert.deepEqual(Array.from(projects, (project) => project.id), [7, 12]);
    assert.deepEqual(f.calls.map((call) => call.body.page), [1, 2]);
});

test('copying to another project loads its blocks and keeps the API payload unchanged', async () => {
    const f = fixture((endpoint, method, body) => {
        if (endpoint === '/projectBlocks/search') {
            assert.equal(body.project_id, 12);
            return { data: [{ id: 24, project_id: 12, name: 'Блок Б' }], pagination: null };
        }
        return success();
    });
    const blocks = await f.feature.loadProjectBlockOptions(12);
    await f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: blocks[0].id })).unwrap();
    assert.deepEqual(f.calls[1], {
        endpoint: '/projectBlocks/copyStructure', method: 'POST', body: { blockFrom: 18, blockTo: 24 },
    });
});

test('success invalidates structure and estimate caches and ignores pre-copy responses', async () => {
    const f = fixture(success);
    assert.equal(typeof f.feature.copyBlockStructure, 'function');
    const { blockStages, stageSubsections, estimates, estimateItems } = f.reducers;
    // Start searches before copying: their eventual results must not restore old data.
    const searches = [
        [blockStages.fetchBlockStages, { block_id: 24, page: 1, size: 10 }, { data: [{ id: 2, block_id: 24 }] }],
        [stageSubsections.fetchStageSubsections, { stage_id: 2, page: 1, size: 10 }, { stageId: 2, data: [{ id: 3, stage_id: 2 }] }],
        [estimates.fetchEstimates, { block_id: 24, page: 1, size: 10 }, { data: [{ id: 4, block_id: 24 }] }],
        [estimateItems.fetchEstimateItems, undefined, [{ id: 5, material_estimate_id: 4 }]],
    ];
    for (const [thunk, arg, payload] of searches) {
        f.store.dispatch(thunk.pending('seed', arg));
        f.store.dispatch(thunk.fulfilled(payload, 'seed', arg));
        f.store.dispatch(thunk.pending('old-request', arg));
    }
    await f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 })).unwrap();
    for (const [thunk, arg, payload] of searches) {
        f.store.dispatch(thunk.fulfilled(payload, 'old-request', arg));
    }
    const state = f.store.getState();
    assert.equal(state.blockStages.data.length, 0);
    assert.equal(state.estimates.data.length, 0);
    assert.equal(Object.keys(state.stageSubsections.byStageId).length, 0);
    assert.equal(Object.keys(state.estimateItems.byEstimateId).length, 0);
    // Fresh destination data still loads after invalidation.
    f.store.dispatch(blockStages.fetchBlockStages.pending('new-request', { block_id: 24, page: 1, size: 10 }));
    f.store.dispatch(blockStages.fetchBlockStages.fulfilled({ data: [{ id: 20, block_id: 24 }] }, 'new-request', { block_id: 24, page: 1, size: 10 }));
    assert.equal(f.store.getState().blockStages.data[0].id, 20);
});

test('success signals active pages to reload even if the original dialog was unmounted', async () => {
    const f = fixture(success);
    const before = f.store.getState().projectBlocks.structureVersion ?? 0;
    await f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 })).unwrap();
    assert.equal(f.store.getState().projectBlocks.structureVersion, before + 1);
});

test('success clears related reference caches and ignores their old responses', async () => {
    const f = fixture(success);
    const { fetchEnum } = f.reducers.reference;
    for (const name of ['blockStages', 'stageSubsections', 'materialEstimates', 'projectBlocks', 'materials']) {
        f.store.dispatch(fetchEnum.pending('seed', name));
        f.store.dispatch(fetchEnum.fulfilled([{ id: 1, name: 'Старое значение' }], 'seed', name));
        f.store.dispatch(fetchEnum.pending('old-request', name));
    }
    await f.store.dispatch(f.feature.copyBlockStructure({ blockFrom: 18, blockTo: 24 })).unwrap();
    for (const name of ['blockStages', 'stageSubsections', 'materialEstimates', 'projectBlocks']) {
        f.store.dispatch(fetchEnum.fulfilled([{ id: 1, name: 'Старое значение' }], 'old-request', name));
        assert.equal(f.store.getState().reference.data[name], undefined);
        assert.equal(f.store.getState().reference.loading[name] ?? false, false);
    }
    assert.equal(f.store.getState().reference.data.materials[0].name, 'Старое значение');
    f.store.dispatch(fetchEnum.pending('fresh', 'blockStages'));
    f.store.dispatch(fetchEnum.fulfilled([{ id: 20, name: 'Новый этап' }], 'fresh', 'blockStages'));
    assert.equal(f.store.getState().reference.data.blockStages[0].name, 'Новый этап');
});
