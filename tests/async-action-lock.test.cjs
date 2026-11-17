const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/utils/asyncActionLock.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exported = {};
vm.runInNewContext(compiled, { exports: exported });
const { createAsyncActionLock } = exported;

test('rapid repeated save clicks issue only one operation while pending', async () => {
    const lock = createAsyncActionLock();
    let resolve;
    let calls = 0;
    const action = () => { calls++; return new Promise((done) => { resolve = done; }); };
    const first = lock.run(action);
    assert.equal(lock.isLocked(), true);
    assert.equal(await lock.run(action), undefined);
    assert.equal(await lock.run(action), undefined);
    assert.equal(calls, 1);
    resolve('saved');
    assert.equal(await first, 'saved');
    assert.equal(lock.isLocked(), false);
    assert.equal(await lock.run(async () => 'next save'), 'next save');
});

test('failed save unlocks and allows retry without suppressing the error', async () => {
    const lock = createAsyncActionLock();
    const error = new Error('Network failure');
    await assert.rejects(lock.run(async () => { throw error; }), error);
    assert.equal(lock.isLocked(), false);
    assert.equal(await lock.run(async () => 'retry'), 'retry');
});

test('synchronous failures also release the lock', async () => {
    const lock = createAsyncActionLock();
    await assert.rejects(lock.run(() => { throw new Error('Validation failed'); }), /Validation failed/);
    assert.equal(lock.isLocked(), false);
});
