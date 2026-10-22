const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.join(__dirname, '../src/features/projects/pto/projectBlocks/estimatess/estimateItems/estimateItemsView.ts');
const exported = {};
if (fs.existsSync(filename)) {
    const source = fs.readFileSync(filename, 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(compiled, { exports: exported, require });
}

// Page selection must not alter quantities, prices or the full source collection.
const row = (id, type, stage, subsection) => ({
    id, material_estimate_id: 3, item_type: type, stage_id: stage, subsection_id: subsection,
    entry_type: 1, service_type: null, service_id: null, material_type: 1, material_id: id,
    unit_of_measure: 1, quantity_planned: 2, coefficient: 1, currency: 1, currency_rate: 1,
    price: 100, comment: null, remaining: 2, deleted: false,
});
const page = (...args) => {
    assert.equal(typeof exported.getEstimateItemsPage, 'function');
    return exported.getEstimateItemsPage(...args);
};
const ids = (items) => Array.from(items, (item) => item.id);

test('materials are grouped by stage and subsection before pagination', () => {
    const items = [row(1, 1, 10, 20), row(2, 1, 11, 30), row(3, 1, 10, 21), row(4, 1, 10, 20), row(5, 2, 10, 20)];
    const original = JSON.stringify(items);
    const first = page(items, 1, 1, 2);
    const second = page(items, 1, 2, 2);
    assert.deepEqual(ids(first.items), [1, 4]);
    assert.deepEqual(ids(second.items), [3, 2]);
    assert.equal(first.pagination.total, 4);
    assert.equal(first.pagination.pages, 2);
    assert.equal(first.pagination.hasNext, true);
    assert.equal(second.pagination.hasPrev, true);
    assert.equal(JSON.stringify(items), original);
    assert.equal(first.items[0], items[0]);
});

test('groups with no subsection remain distinct for different stages and missing stage', () => {
    const items = [row(1, 1, 10, null), row(2, 1, 11, null), row(3, 1, 10, null), row(4, 1, null, null), row(5, 1, 11, 20)];
    assert.deepEqual(ids(page(items, 1, 1, 10).items), [1, 3, 2, 5, 4]);
});

test('a large material group can span pages without losing or repeating positions', () => {
    const items = [row(1, 1, 10, 20), row(2, 1, 10, 20), row(3, 1, 10, 20), row(4, 1, 11, 30)];
    assert.deepEqual(ids(page(items, 1, 1, 2).items), [1, 2]);
    assert.deepEqual(ids(page(items, 1, 2, 2).items), [3, 4]);
});

test('service pagination has its own total and preserves the service order', () => {
    const items = [row(1, 1, 10, 20), row(2, 2, 11, 30), row(3, 2, 10, 20), row(4, 1, 10, 20), row(5, 2, 11, 30)];
    const services = page(items, 2, 2, 2);
    assert.deepEqual(ids(services.items), [5]);
    assert.equal(services.pagination.total, 3);
    assert.equal(services.pagination.page, 2);
    assert.equal(services.pagination.hasNext, false);
    assert.deepEqual(ids(page(items, 1, 1, 10).items), [1, 4]);
});

test('deleting the last row on a page falls back to the last nonempty page', () => {
    const items = [row(1, 2, 10, 20), row(2, 2, 10, 20)];
    const result = page(items, 2, 2, 2);
    assert.equal(result.pagination.page, 1);
    assert.equal(result.pagination.hasPrev, false);
    assert.deepEqual(ids(result.items), [1, 2]);
});

test('an empty list has a usable first page and zero records', () => {
    const result = page([], 1, 5, 10);
    assert.deepEqual(ids(result.items), []);
    assert.equal(result.pagination.total, 0);
    assert.equal(result.pagination.page, 1);
    assert.equal(result.pagination.pages, 1);
    assert.equal(result.pagination.hasNext, false);
    assert.equal(result.pagination.hasPrev, false);
});
