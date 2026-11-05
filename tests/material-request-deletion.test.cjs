const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/features/projects/material_request/materialRequestApproval.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(compiled, { exports: exportsObject });
const { canDeleteMaterialRequest } = exportsObject;
const request = { status: 1, deleted: false };
test('only administrator and PTO can delete pending requests', () => {
    for (let role_id = 1; role_id <= 20; role_id++) {
        assert.equal(canDeleteMaterialRequest(request, { role_id }), role_id === 1 || role_id === 10);
    }
    assert.equal(canDeleteMaterialRequest(request, null), false);
    for (const status of [0, 2, 3, 4, 5]) {
        assert.equal(canDeleteMaterialRequest({ ...request, status }, { role_id: 1 }), false);
    }
    assert.equal(canDeleteMaterialRequest({ ...request, deleted: true }, { role_id: 10 }), false);
});
test('every signature or signature timestamp hides deletion, including disabled site manager stage', () => {
    for (const stage of ['foreman', 'planning_engineer', 'main_engineer', 'purchasing_agent', 'site_manager']) {
        for (const role_id of [1, 10]) {
            assert.equal(canDeleteMaterialRequest({ ...request, [`approved_by_${stage}`]: true }, { role_id }), false);
            assert.equal(canDeleteMaterialRequest({ ...request, [`approved_by_${stage}_time`]: '2026-11-05' }, { role_id }), false);
        }
    }
});
