const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.join(__dirname, '../src/features/projects/material_request/materialRequestApproval.ts');
const approval = {};
if (fs.existsSync(filename)) {
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(compiled, { exports: approval, require });
}

const request = (overrides = {}) => ({
    approved_by_foreman: false, foreman_user_id: null,
    approved_by_purchasing_agent: false, purchasing_agent_user_id: null,
    approved_by_planning_engineer: false, planning_engineer_user_id: null,
    approved_by_main_engineer: false, main_engineer_user_id: null,
    approved_by_site_manager: false, site_manager_user_id: null,
    ...overrides,
});
const user = (role_id, id = 5) => ({ id, role_id });

test('an unsigned site manager does not prevent completion of the four active approvals', () => {
    assert.equal(typeof approval.isMaterialRequestFullyApproved, 'function');
    const signed = request({
        approved_by_foreman: true, approved_by_purchasing_agent: true,
        approved_by_planning_engineer: true, approved_by_main_engineer: true,
    });
    for (const value of [null, false, true]) {
        assert.equal(approval.isMaterialRequestFullyApproved({ ...signed, approved_by_site_manager: value }), true);
    }
    for (const field of ['approved_by_foreman', 'approved_by_purchasing_agent', 'approved_by_planning_engineer', 'approved_by_main_engineer']) {
        assert.equal(approval.isMaterialRequestFullyApproved({ ...signed, [field]: false }), false);
    }
});

test('administrator signing skips site manager and preserves the active signing order', () => {
    assert.equal(typeof approval.getPendingMaterialRequestSignStages, 'function');
    assert.deepEqual(Array.from(approval.getPendingMaterialRequestSignStages(request())), [
        'foreman', 'planning_engineer', 'main_engineer', 'purchasing_agent',
    ]);
    assert.deepEqual(Array.from(approval.getPendingMaterialRequestSignStages(request({
        approved_by_foreman: true, approved_by_main_engineer: true,
    }))), ['planning_engineer', 'purchasing_agent']);
});

test('site manager cannot sign while active roles retain their stage and assignment checks', () => {
    assert.equal(typeof approval.canSignMaterialRequest, 'function');
    assert.equal(approval.canSignMaterialRequest(request(), user(9)), false);
    assert.equal(approval.getMaterialRequestSignStage(user(9)), null);
    const roles = [
        [4, 'foreman', 'foreman_user_id', 'approved_by_foreman'],
        [7, 'purchasing_agent', 'purchasing_agent_user_id', 'approved_by_purchasing_agent'],
        [10, 'planning_engineer', 'planning_engineer_user_id', 'approved_by_planning_engineer'],
        [11, 'main_engineer', 'main_engineer_user_id', 'approved_by_main_engineer'],
    ];
    for (const [role, stage, assignedField, approvedField] of roles) {
        assert.equal(approval.getMaterialRequestSignStage(user(role)), stage);
        assert.equal(approval.canSignMaterialRequest(request(), user(role)), true);
        assert.equal(approval.canSignMaterialRequest(request({ [assignedField]: 5 }), user(role)), true);
        assert.equal(approval.canSignMaterialRequest(request({ [assignedField]: 6 }), user(role)), false);
        assert.equal(approval.canSignMaterialRequest(request({ [approvedField]: true }), user(role)), false);
    }
    assert.equal(approval.canSignMaterialRequest(request(), user(1)), true);
    assert.equal(approval.canSignMaterialRequest(request(), user(2)), false);
    assert.equal(approval.canSignMaterialRequest(request(), null), false);
});
