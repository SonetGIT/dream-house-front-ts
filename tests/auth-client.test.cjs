const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/features/auth/authClient.ts'), 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
const moduleExports = {};
vm.runInNewContext(compiled, {exports: moduleExports, require, URL, Headers, AbortSignal, atob, crypto, Date, Set, Error});
const {createAuthClient, AUTH_SESSION_KEY, AUTH_INTENT_KEY} = moduleExports;
const NOW = Date.parse('2026-10-01T12:00:00Z');
const response = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json', ...headers}});
const pair = (n, user = 7) => ({success: true, data: {id: user}, accessToken: `access-${n}`, refreshToken: `v1.${n}`, accessTokenExpiresAt: new Date(NOW + 60000).toISOString()});
const deferred = () => { let resolve; const promise = new Promise(r => {resolve = r}); return {promise, resolve}; };
function fixture(handler) {
    const records = new Map();
    const storage = {getItem: k => records.get(k) ?? null, setItem: (k,v) => records.set(k,String(v)), removeItem: k => records.delete(k)};
    let queue = Promise.resolve();
    const lock = work => { const next = queue.then(work); queue = next.catch(() => {}); return next; };
    const calls = [];
    let sequence = 0;
    const options = {baseUrl: 'https://api.test/api', allowedOrigins: ['https://api.test','https://reports.test'], storage, lock,
        now: () => NOW, id: () => `intent-${++sequence}`, notify: () => {},
        fetch: async (url, init) => { calls.push({url: String(url), init}); return handler(String(url), init, calls); }};
    const first = createAuthClient(options);
    const second = createAuthClient(options);
    const seed = (overrides = {}) => {
        storage.setItem(AUTH_INTENT_KEY, 'original');
        storage.setItem(AUTH_SESSION_KEY, JSON.stringify({accessToken: 'access-old', refreshToken: 'v1.old', userId: '7',
            generation: 'original', accessTokenExpiresAt: NOW - 1000, ...overrides}));
    };
    return {first, second, storage, calls, seed, options};
}

test('parallel refreshes in different tabs consume a refresh token once', async () => {
    let count = 0;
    const f = fixture(async () => { count++; return response(pair(1)); });
    f.seed();
    const result = await Promise.all([f.first.refreshAccessToken(), f.second.refreshAccessToken(), f.first.refreshAccessToken()]);
    assert.deepEqual(result, ['access-1','access-1','access-1']);
    assert.equal(count, 1);
    assert.equal(f.second.getSession().refreshToken, 'v1.1');
});

test('late 401 reuses a rotated access token instead of rotating again', async () => {
    let count = 0;
    const f = fixture(async () => { count++; return response(pair(1)); });
    f.seed();
    await f.first.refreshAccessToken();
    assert.equal(await f.second.refreshAccessToken('access-old', 'SESSION_REVOKED'), 'access-1');
    assert.equal(count, 1);
});

test('a revoked session is not refreshed, avoiding revocation of other devices', async () => {
    const f = fixture(async () => { throw new Error('Unexpected network request'); });
    f.seed();
    await assert.rejects(f.first.refreshAccessToken('access-old','SESSION_REVOKED'), {code: 'SESSION_REVOKED'});
    assert.equal(f.first.getSession(), null);
    assert.equal(f.calls.length, 0);
});

test('logout during refresh cannot resurrect session and revokes the new pair', async () => {
    const entered = deferred(); const finish = deferred();
    const f = fixture(async url => {
        if (url.endsWith('/refresh')) { entered.resolve(); await finish.promise; return response(pair(1)); }
        return response({success: true});
    });
    f.seed();
    const refresh = f.first.refreshAccessToken();
    const rejected = assert.rejects(refresh);
    await entered.promise;
    const logout = f.second.logout();
    assert.equal(f.first.getSession(), null);
    finish.resolve();
    await Promise.all([rejected, logout]);
    assert.equal(f.first.getSession(), null);
    const revoked = f.calls.filter(c=>c.url.endsWith('/logout')).map(c=>JSON.parse(c.init.body).refreshToken);
    assert.ok(revoked.includes('v1.1'));
});

test('a lost refresh response is never retried with its consumed token', async () => {
    const f = fixture(async () => { throw new TypeError('Network lost'); });
    f.seed();
    await assert.rejects(f.first.refreshAccessToken(), {code: 'REFRESH_RESULT_UNKNOWN'});
    await assert.rejects(f.second.refreshAccessToken());
    assert.equal(f.calls.length, 1);
});

test('a crashed tab refresh marker prevents reuse after restart', async () => {
    const f = fixture(async () => { throw new Error('Unexpected network request'); });
    f.seed({refreshing: true});
    await assert.rejects(f.first.refreshAccessToken(), {code:'REFRESH_RESULT_UNKNOWN'});
    assert.equal(f.calls.length, 0);
});

test('429 preserves the pair and shares Retry-After across tabs', async () => {
    const f = fixture(async () => response({message:'Limited'}, 429, {'Retry-After':'120'}));
    f.seed();
    await assert.rejects(f.first.refreshAccessToken(), {code:'AUTH_RATE_LIMITED'});
    assert.equal(f.first.getSession().refreshToken, 'v1.old');
    await assert.rejects(f.second.refreshAccessToken(), {code:'AUTH_RATE_LIMITED'});
    assert.equal(f.calls.length, 1);
});

test('an ordinary network failure does not clear the session or replay a mutation', async () => {
    const f = fixture(async () => { throw new TypeError('offline'); });
    f.seed({accessTokenExpiresAt: NOW + 60000});
    await assert.rejects(f.first.authenticatedFetch('https://api.test/api/items', {method:'POST', body:'{}'}));
    assert.ok(f.first.getSession());
    assert.equal(f.calls.length, 1);
});

test('401 replays FormData once using the new access token', async () => {
    let requests = 0;
    const f = fixture(async (url, init) => {
        if (url.endsWith('/refresh')) return response(pair(1));
        requests++;
        return requests === 1 ? response({code:'ACCESS_TOKEN_EXPIRED'},401) : response({success:true});
    });
    f.seed({accessTokenExpiresAt:NOW + 60000});
    const body = new FormData(); body.append('file',new Blob(['abc']), 'test.txt');
    const res = await f.first.authenticatedFetch('https://api.test/api/upload', {method:'POST',body});
    assert.equal(res.status,200);
    const calls = f.calls.filter(c=>c.url.endsWith('/upload'));
    assert.equal(calls.length,2);
    assert.equal(calls[0].init.body,body);
    assert.equal(calls[1].init.body,body);
    assert.equal(calls[1].init.headers.get('Authorization'),'Bearer access-1');
});

test('403 is a permission error and never refreshes', async () => {
    const f = fixture(async () => response({message:'Forbidden'},403));
    f.seed({accessTokenExpiresAt:NOW + 60000});
    assert.equal((await f.first.authenticatedFetch('https://api.test/api/items')).status,403);
    assert.equal(f.calls.length,1);
    assert.ok(f.first.getSession());
});

test('bearer token is never sent to an unconfigured origin', async () => {
    const f = fixture(async () => response({})); f.seed();
    await assert.rejects(f.first.authenticatedFetch('https://untrusted.test/report'),{code:'AUTH_ORIGIN_INVALID'});
    assert.equal(f.calls.length,0);
});

test('login completion after logout cannot restore credentials', async () => {
    const entered = deferred(); const finish = deferred();
    const f = fixture(async url => {
        if (url.endsWith('/login')) { entered.resolve(); await finish.promise; return response(pair(1)); }
        return response({success:true});
    });
    const login = f.first.login('user','password'); const rejection = assert.rejects(login);
    await entered.promise; const logout = f.second.logout(); finish.resolve();
    await Promise.all([rejection,logout]); assert.equal(f.first.getSession(),null);
});

test('unknown storage capability fails before credentials are sent', async () => {
    const f = fixture(async () => response(pair(1)));
    const client = createAuthClient({...f.options, lock:null});
    await assert.rejects(client.login('user','password'),{code:'AUTH_LOCK_UNAVAILABLE'});
    assert.equal(f.calls.length,0);
});

test('legacy access token works until expiry without sending a fake refresh', async () => {
    const f = fixture(async () => response({success:true}));
    const payload = Buffer.from(JSON.stringify({exp: (NOW+60000)/1000})).toString('base64url');
    f.storage.setItem('token',`header.${payload}.signature`);
    assert.equal((await f.first.authenticatedFetch('https://api.test/api/profile')).status,200);
    await assert.rejects(f.first.refreshAccessToken(f.first.getSession().accessToken));
    assert.equal(f.calls.length,1);
});

function loadModule(file, mocks = {}) {
    const text = fs.readFileSync(path.join(__dirname, '../src/',file),'utf8');
    const js = ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    const exports = {};
    vm.runInNewContext(js,{exports,require: name => name in mocks ? mocks[name] : require(name),Map,Error,console});
    return exports;
}

test('login keeps both tokens out of Redux state and result', async () => {
    const {configureStore} = require('@reduxjs/toolkit');
    const f = fixture(async () => response(pair(1)));
    const auth = loadModule('features/auth/authSlice.ts',{
        './authSession':{authClient:f.first}, './getToken':{getToken:()=>f.first.getSession()?.accessToken ?? null},
        '@/utils/apiRequest':{apiRequest: async()=>({data:{id:7}})},
    });
    const store = configureStore({reducer:{auth:auth.default}});
    f.options.notify = () => {
        const session = f.first.getSession();
        store.dispatch(auth.syncSession(session ? {generation:session.generation,userId:session.userId}:null));
    };
    const result = await store.dispatch(auth.authUser({username:'user',password:'password'}));
    assert.equal(result.type,'auth/authUser/fulfilled');
    assert.equal(result.payload.refreshToken,undefined);
    assert.equal(store.getState().auth.user.id,7);
    assert.equal(result.payload.token,undefined);
    assert.equal(store.getState().auth.token,undefined);
    await store.dispatch(auth.logout());
    assert.equal(store.getState().auth.user,null);
});

test('a profile response after logout is ignored by Redux', async () => {
    const {configureStore} = require('@reduxjs/toolkit');
    const finish=deferred();const f=fixture(async()=>response({success:true}));f.seed({accessTokenExpiresAt:NOW+60000});
    const auth=loadModule('features/auth/authSlice.ts',{
        './authSession':{authClient:f.first}, './getToken':{getToken:()=>f.first.getSession()?.accessToken ?? null},
        '@/utils/apiRequest':{apiRequest: async()=>{await finish.promise;return {data:{id:7}}}},
    });
    const store=configureStore({reducer:{auth:auth.default}});
    f.options.notify=()=>store.dispatch(auth.syncSession(null));
    const profile=store.dispatch(auth.fetchProfile());
    await store.dispatch(auth.logout());finish.resolve();await profile;
    assert.equal(store.getState().auth.user,null);
    assert.equal(store.getState().auth.token,undefined);
});

test('late domain responses cannot populate a different login', () => {
    const {sessionActionGuard}=loadModule('features/auth/sessionActionGuard.ts');
    let generation='first';const actions=[];
    const middleware=sessionActionGuard({getState:()=>({auth:{generation}})})(a=>actions.push(a));
    middleware({type:'projects/fetch/pending',meta:{requestId:'id',requestStatus:'pending'}});
    generation='second';
    middleware({type:'projects/fetch/fulfilled',payload:['private data'],meta:{requestId:'id',requestStatus:'fulfilled'}});
    assert.equal(actions.length,1);
});

test('password change invokes server logout and clears the session', async () => {
    const {configureStore}=require('@reduxjs/toolkit');
    const f=fixture(async()=>response({success:true}));f.seed({accessTokenExpiresAt:NOW+60000});
    const auth=loadModule('features/auth/authSlice.ts',{
        './authSession':{authClient:f.first}, './getToken':{getToken:()=>f.first.getSession()?.accessToken ?? null},
        '@/utils/apiRequest':{apiRequest:async()=>({data:{},message:'Changed'})},
    });
    const store=configureStore({reducer:{auth:auth.default}});
    f.options.notify=()=>store.dispatch(auth.syncSession(null));
    const result=await store.dispatch(auth.changeOwnPassword({oldPassword:'old',newPassword:'new'}));
    assert.equal(result.type,'auth/changeOwnPassword/fulfilled');
    assert.equal(f.first.getSession(),null);
    assert.equal(f.calls.filter(c=>c.url.endsWith('/logout')).length,1);
});

test('refresh-only session restores access before a protected request', async () => {
    const f = fixture(async url => url.endsWith('/refresh') ? response(pair(1)) : response({success:true}));
    f.seed({accessToken:undefined,accessTokenExpiresAt:NOW+60000});
    assert.equal((await f.first.authenticatedFetch('https://api.test/api/profile')).status,200);
    assert.equal(f.calls.length,2);
    assert.equal(f.calls[1].init.headers.get('Authorization'),'Bearer access-1');
});
test('invalid expiry triggers refresh instead of sending an unverified access token', async () => {
    const f=fixture(async url=>url.endsWith('/refresh')?response(pair(1)):response({success:true}));
    f.seed({accessTokenExpiresAt:null});
    await f.first.authenticatedFetch('https://api.test/api/profile');
    assert.ok(f.calls[0].url.endsWith('/refresh'));
});
test('legacy migration uses a stable generation without embedding credentials', () => {
    const f=fixture(async()=>response({}));
    f.storage.setItem('token','legacy-secret');
    const session=f.first.getSession();
    assert.equal(f.second.getSession().generation,session.generation);
    assert.ok(!session.generation.includes('legacy-secret'));
    assert.equal(f.storage.getItem('token'),null);
});
test('ambiguous refresh server failure never reuses the old refresh token', async () => {
    const f=fixture(async()=>response({success:false},500)); f.seed();
    await assert.rejects(f.first.refreshAccessToken());
    await assert.rejects(f.second.refreshAccessToken());
    assert.equal(f.calls.length,1);
});
