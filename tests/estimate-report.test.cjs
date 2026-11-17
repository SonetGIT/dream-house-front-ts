const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function fixture(response) {
    const requests = [];
    const downloads = [];
    const revoked = [];
    const source = fs.readFileSync('src/features/projects/pto/projectBlocks/estimatess/downloadEstimateReport.ts', 'utf8')
        .replace('import.meta.env.VITE_REPORTS_URL', "'https://reports.test/'");
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exported = {};
    vm.runInNewContext(compiled, {
        exports: exported, URLSearchParams,
        require: () => ({ reportRequest: async (url) => {
            requests.push(url);
            if (response instanceof Error) throw response;
            return response;
        } }),
        document: {
            createElement: () => ({ click() { downloads.push(this.download); }, remove() {} }),
            body: { appendChild() {} },
        },
        window: {
            URL: { createObjectURL: () => 'blob:estimate', revokeObjectURL: (url) => revoked.push(url) },
            setTimeout: (callback) => callback(),
        },
    });
    return { download: exported.downloadEstimateReport, requests, downloads, revoked };
}
const excel = { blob: new Blob(['excel']), fileName: null, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

test('exports the current block using the same endpoint and parameters as mobile', async () => {
    const f = fixture(excel);
    await f.download(37, 'Блок / А');
    assert.deepEqual(f.requests, ['https://reports.test/report/estimate-stage?blockId=37&format=xlsx']);
    assert.deepEqual(f.downloads, ['Смета — Блок _ А.xlsx']);
    assert.deepEqual(f.revoked, ['blob:estimate']);
});
test('uses server filename when provided', async () => {
    const f = fixture({ ...excel, fileName: 'estimate-stage.xlsx' });
    await f.download(24, 'А');
    assert.deepEqual(f.downloads, ['estimate-stage.xlsx']);
});
test('errors propagate without saving a false Excel file', async () => {
    for (const response of [new Error('Нет доступа'), { ...excel, contentType: 'application/json' }, { ...excel, contentType: 'text/html' }]) {
        const f = fixture(response);
        await assert.rejects(f.download(24, 'А'));
        assert.equal(f.downloads.length, 0);
    }
});
test('invalid block identifiers never issue report requests', async () => {
    const f = fixture(excel);
    for (const id of [0, -1, NaN, 1.5]) await assert.rejects(f.download(id, 'А'));
    assert.equal(f.requests.length, 0);
});
