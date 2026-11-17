const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadApi(request) {
    const source = fs.readFileSync('src/features/services/servicesApi.ts', 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const result = {};
    vm.runInNewContext(compiled, { exports: result, require: () => ({ apiRequest: request }) });
    return result;
}

test('services and types use server pagination, preserve filters, and return API metadata', async () => {
    const calls = [];
    const response = { data: [{ id: 1, name: 'Монтаж' }], pagination: { page: 2, size: 5, total: 12, pages: 3, hasNext: true, hasPrev: true } };
    const api = loadApi(async (...args) => { calls.push(args); return response; });
    for (const directory of ['services', 'serviceTypes']) {
        const query = { page: 2, size: 5, search: 'Монтаж', ...(directory === 'services' ? { service_type: 3 } : {}) };
        assert.equal(await api.searchDirectory(directory, query), response);
        assert.deepEqual(calls.at(-1), [`/${directory}/search`, 'POST', query]);
    }
});

test('create, update and delete target documented endpoints for both directories', async () => {
    const calls = [];
    const api = loadApi(async (...args) => { calls.push(args); return { success: true }; });
    for (const directory of ['services', 'serviceTypes']) {
        const input = { name: 'Монтаж', ...(directory === 'services' ? { service_type: 3 } : {}) };
        await api.saveDirectoryRecord(directory, null, input);
        assert.deepEqual(calls.at(-1), [`/${directory}/create`, 'POST', input]);
        await api.saveDirectoryRecord(directory, 7, input);
        assert.deepEqual(calls.at(-1), [`/${directory}/update/7`, 'PUT', input]);
        await api.deleteDirectoryRecord(directory, 7);
        assert.deepEqual(calls.at(-1), [`/${directory}/delete/7`, 'DELETE']);
    }
});

test('backend errors propagate to the caller for keeping forms open and showing errors', async () => {
    const error = new Error('Запись используется в смете');
    const api = loadApi(async () => { throw error; });
    await assert.rejects(api.deleteDirectoryRecord('services', 7), error);
    await assert.rejects(api.saveDirectoryRecord('serviceTypes', 1, { name: 'Монтаж' }), error);
    await assert.rejects(api.searchDirectory('services', { page: 1, size: 10, search: '' }), error);
});
