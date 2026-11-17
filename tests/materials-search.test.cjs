const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/features/materials/materialsSlice.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const result = {};
const requests = [];
vm.runInNewContext(compiled, { exports: result, require: (name) => {
    if (name === '@reduxjs/toolkit') return require(name);
    if (name === '@/utils/apiRequest') return { apiRequest: async (...args) => { requests.push(args); return { data: [] }; } };
    if (name === './materialPayload') return { materialPayload() { throw new Error('Not used in search'); } };
    throw new Error(name);
} });
const reducer = result.default;
const fetchMaterials = result.fetchMaterials;
const query = { name: 'Бетон', description: 'Фундамент', type: 3, unit_of_measure: 2, page: 1, size: 10 };

test('search sends documented name, description, type and unit filters', async () => {
    const action = await fetchMaterials(query)(() => {}, () => ({}), undefined);
    assert.equal(action.type, fetchMaterials.fulfilled.type);
    assert.equal(requests.at(-1)[0], '/materials/search');
    assert.equal(requests.at(-1)[1], 'POST');
    assert.equal(requests.at(-1)[2], query);
});

test('late search results and errors cannot replace the latest filter results', () => {
    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, fetchMaterials.pending('old', query));
    state = reducer(state, fetchMaterials.pending('new', { ...query, type: 4 }));
    state = reducer(state, fetchMaterials.fulfilled({ data: [{ id: 2, name: 'Новый' }] }, 'new', query));
    state = reducer(state, fetchMaterials.fulfilled({ data: [{ id: 1, name: 'Старый' }] }, 'old', query));
    assert.equal(state.data[0].id, 2);
    state = reducer(state, fetchMaterials.rejected(new Error('Old error'), 'old', query));
    assert.equal(state.error, null);
    assert.equal(state.loading, false);
});
