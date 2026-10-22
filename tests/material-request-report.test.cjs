const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function fixture(report, clickError) {
    const exported = {};
    const requests = [];
    const downloads = [];
    const revoked = [];
    let removed = false;
    const filename = path.join(__dirname, '../src/features/projects/material_request/downloadMaterialRequestReport.ts');
    if (fs.existsSync(filename)) {
        const source = fs.readFileSync(filename, 'utf8').replaceAll('import.meta.env.VITE_REPORTS_URL', "'https://reports.test'");
        const compiled = ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }).outputText;
        vm.runInNewContext(compiled, {
            exports: exported,
            require: (name) => {
                assert.equal(name, '../reports/reportRequest');
                return { reportRequest: async (url) => {
                    requests.push(url);
                    if (report instanceof Error) throw report;
                    return report;
                } };
            },
            document: {
                createElement: () => ({
                    click() {
                        if (clickError) throw clickError;
                        downloads.push({ href: this.href, name: this.download });
                    },
                    remove() { removed = true; },
                }),
                body: { appendChild: () => {} },
            },
            window: {
                URL: { createObjectURL: () => 'blob:report', revokeObjectURL: (url) => revoked.push(url) },
                setTimeout: (callback) => callback(),
            },
            Error,
        });
    }
    return {
        async download(request) {
            assert.equal(typeof exported.downloadMaterialRequestReport, 'function');
            await exported.downloadMaterialRequestReport(request);
        },
        requests, downloads, revoked, removed: () => removed,
    };
}

const excel = (fileName = null) => ({
    blob: new Blob(['excel-file']), fileName,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

test('requests Excel by technical ID and downloads with the filename returned by the server', async () => {
    const f = fixture(excel('Заявка_00042.xlsx'));
    await f.download({ id: 380, number: '00042' });
    assert.deepEqual(f.requests, ['https://reports.test/report/materialRequest/380?format=xlsx']);
    assert.deepEqual(f.downloads, [{ href: 'blob:report', name: 'Заявка_00042.xlsx' }]);
    assert.equal(f.removed(), true);
    assert.deepEqual(f.revoked, ['blob:report']);
});

test('fallback filenames use number without losing leading zeros or retaining path separators', async () => {
    const f = fixture(excel());
    await f.download({ id: 380, number: 'ЗМ/00042' });
    assert.equal(f.downloads[0].name, 'Заявка-на-материалы-ЗМ_00042.xlsx');
});

test('a missing document number never uses its technical ID as the fallback number', async () => {
    const f = fixture(excel());
    await f.download({ id: 380, number: null });
    assert.equal(f.downloads[0].name, 'Заявка-на-материалы.xlsx');
});

test('server failures remain visible and do not trigger a file download', async () => {
    const f = fixture(new Error('Нет доступа к отчёту по заявке'));
    await assert.rejects(f.download({ id: 380, number: 42 }), { message: 'Нет доступа к отчёту по заявке' });
    assert.equal(f.downloads.length, 0);
    assert.equal(f.revoked.length, 0);
});

test('a JSON error with status 200 is reported instead of being saved as Excel', async () => {
    const f = fixture({
        blob: new Blob([JSON.stringify({ success: false, message: 'Заявка не найдена' })]),
        fileName: null, contentType: 'application/json',
    });
    await assert.rejects(f.download({ id: 380, number: 42 }), { message: 'Заявка не найдена' });
    assert.equal(f.downloads.length, 0);
});

test('temporary download resources are released even if the browser download fails', async () => {
    const f = fixture(excel(), new Error('Download blocked'));
    await assert.rejects(f.download({ id: 380, number: 42 }), { message: 'Download blocked' });
    assert.equal(f.removed(), true);
    assert.deepEqual(f.revoked, ['blob:report']);
});
