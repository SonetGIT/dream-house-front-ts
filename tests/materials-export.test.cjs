const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup(response) {
    const calls = [];
    const link = { click() { calls.push('click'); }, remove() { calls.push('remove'); } };
    const source = fs.readFileSync('src/features/materials/downloadMaterialsExcel.ts', 'utf8')
        .replace('import.meta.env.VITE_API_URL', "'https://example.test/api/'");
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const result = {};
    vm.runInNewContext(compiled, {
        exports: result,
        require: () => ({ authenticatedFetch: async (url, init) => {
            calls.push({ url, method: init.method });
            if (response instanceof Error) throw response;
            return response;
        } }),
        document: { createElement: () => link, body: { appendChild: () => calls.push('append') } },
        window: {
            URL: { createObjectURL: (blob) => { calls.push(blob); return 'blob:test'; }, revokeObjectURL: (url) => calls.push(url) },
            setTimeout: (callback) => callback(),
        },
    });
    return { download: result.downloadMaterialsExcel, calls, link };
}

test('downloads backend blob via authenticated GET with the fixed Russian filename', async () => {
    const blob = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    const { download, calls, link } = setup({ ok: true, blob: async () => blob });
    await download();
    assert.equal(calls[0].url, 'https://example.test/api/materials/export.xlsx');
    assert.equal(calls[0].method, 'GET');
    assert.equal(link.download, 'Материалы.xlsx');
    assert.equal(link.href, 'blob:test');
    assert.equal(calls[1], blob);
    assert.deepEqual(calls.slice(2), ['append', 'click', 'remove', 'blob:test']);
});

test('HTTP and network errors do not trigger a download', async () => {
    for (const response of [{ ok: false }, new Error('Offline')]) {
        const { download, calls } = setup(response);
        await assert.rejects(download());
        assert.equal(calls.length, 1);
    }
});

test('JSON and HTML error responses are not saved as Excel', async () => {
    for (const type of ['application/json', 'text/html']) {
        const { download, calls } = setup({ ok: true, blob: async () => ({ type }) });
        await assert.rejects(download(), /Не удалось выгрузить материалы в Excel/);
        assert.equal(calls.length, 1);
    }
});
