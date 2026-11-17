const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(path, request) {
    const source = fs.readFileSync(path, 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const result = {};
    vm.runInNewContext(compiled, { exports: result, require: () => ({ apiRequest: request }) });
    return result;
}
const { materialPayload, validateMaterial } = loadModule('src/features/materials/materialPayload.ts');
const base = { name: '  Бетон  ', type: '', unit_of_measure: 2, coefficient: '', description: '' };
const plain = (value) => JSON.parse(JSON.stringify(value));

test('material creation omits optional blanks and sends numeric coeffitient, including zero', () => {
    assert.deepEqual(plain(materialPayload(base, true)), { name: 'Бетон', unit_of_measure: 2, description: '' });
    for (const [value, expected] of [['0', 0], ['1.25', 1.25]]) {
        const payload = plain(materialPayload({ ...base, type: 3, coefficient: value }, true));
        assert.equal(payload.coeffitient, expected);
        assert.equal(payload.type, 3);
        assert.equal('coefficient' in payload, false);
    }
});

test('material validation rejects missing required fields, invalid ids and invalid coefficients', () => {
    for (const change of [
        { name: '  ' }, { unit_of_measure: '' }, { unit_of_measure: 0 },
        { unit_of_measure: -1 }, { unit_of_measure: 1.2 }, { type: 0 },
        { coefficient: '.' }, { coefficient: 'Infinity' }, { coefficient: '-1' },
    ]) {
        assert.ok(validateMaterial({ ...base, ...change }, true));
        assert.throws(() => materialPayload({ ...base, ...change }, true));
    }
    assert.equal(validateMaterial(base, true), null);
});

test('material update sends documented fields and never sends a coefficient', () => {
    assert.deepEqual(plain(materialPayload({ ...base, type: 3, coefficient: '2.5' }, false)), {
        name: 'Бетон', type: 3, unit_of_measure: 2, description: '',
    });
});

test('material types use name search, preserve pagination and target CRUD endpoints', async () => {
    const calls = [];
    const response = { data: [], pagination: { page: 2, size: 5, total: 6 } };
    const api = loadModule('src/features/materials/materialTypesApi.ts', async (...args) => {
        calls.push(plain(args)); return response;
    });
    const query = { name: 'Бетон', page: 2, size: 5 };
    assert.equal(await api.searchMaterialTypes(query), response);
    assert.deepEqual(calls.at(-1), ['/materialTypes/search', 'POST', query]);
    await api.saveMaterialType(null, '  Сыпучие  ');
    assert.deepEqual(calls.at(-1), ['/materialTypes/create', 'POST', { name: 'Сыпучие' }]);
    await api.saveMaterialType(4, 'Бетон');
    assert.deepEqual(calls.at(-1), ['/materialTypes/update/4', 'PUT', { name: 'Бетон' }]);
    await api.deleteMaterialType(4);
    assert.deepEqual(calls.at(-1), ['/materialTypes/delete/4', 'DELETE']);
    assert.throws(() => api.saveMaterialType(null, '  '));
    assert.equal(calls.length, 4);
});

test('material type API preserves backend errors', async () => {
    const error = new Error('Тип используется');
    const api = loadModule('src/features/materials/materialTypesApi.ts', async () => { throw error; });
    await assert.rejects(api.deleteMaterialType(4), error);
    await assert.rejects(api.saveMaterialType(4, 'Бетон'), error);
});
