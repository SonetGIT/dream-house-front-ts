const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/features/projects/pto/projectBlocks/estimatess/estimatesSlice.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function fixture(failure) {
    const result = {};
    const calls = [];
    vm.runInNewContext(compiled, { exports: result, require: (name) => {
        if (name === '@reduxjs/toolkit') return require(name);
        if (name === '../copyBlockStructure') return { copyBlockStructure: { fulfilled: 'copy/fulfilled' } };
        if (name === '@/utils/apiRequest') return { apiRequest: async (...args) => {
            calls.push(JSON.parse(JSON.stringify(args)));
            if (failure) throw failure;
            return { success: true };
        } };
        throw new Error(name);
    } });
    return { ...result, calls };
}

test('rename sends only the trimmed name and preserves status, signatures and positions', async () => {
    const f = fixture();
    const original = { id: 7, block_id: 24, name: 'Старая', status: 3, signed_by_general_director: true, items: [{ id: 9 }] };
    let state = f.default(undefined, f.createEstimate.fulfilled(original, 'create', {}));
    const action = await f.updateEstimate({ id: 7, data: { name: '  Новая смета  ', status: 1, block_id: 99 } })(() => {}, () => ({}), undefined);
    assert.equal(action.type, f.updateEstimate.fulfilled.type);
    assert.deepEqual(f.calls, [['/materialEstimates/update/7', 'PUT', { name: 'Новая смета' }]]);
    state = f.default(state, action);
    assert.deepEqual(JSON.parse(JSON.stringify(state.data[0])), { ...original, name: 'Новая смета' });
});

test('empty names and failed requests do not change the stored name', async () => {
    for (const [name, failure] of [['  ', null], ['Новая', new Error('Недостаточно прав')]]) {
        const f = fixture(failure);
        let state = f.default(undefined, f.createEstimate.fulfilled({ id: 7, name: 'Старая' }, 'create', {}));
        const action = await f.updateEstimate({ id: 7, data: { name } })(() => {}, () => ({}), undefined);
        assert.equal(action.type, f.updateEstimate.rejected.type);
        state = f.default(state, action);
        assert.equal(state.data[0].name, 'Старая');
        if (!name.trim()) assert.equal(f.calls.length, 0);
    }
});
