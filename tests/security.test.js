// Bridge: simulate a hostile page posting messages, check what reaches storage/popup.
const vm = require('vm'), fs = require('fs');
const posted = [], listeners = {}; let storage = { enabled: 'yes', snippets: false, evil: '<img onerror=alert(1)>' };
const ctx = {
  window: { location: { origin: 'https://leetcode.com' }, postMessage: (m, o) => posted.push([m, o]),
            addEventListener: (t, f) => { listeners.msg = f; } },
  chrome: { runtime: { id: 'me', onMessage: { addListener: (f) => { listeners.rt = f; } } },
            storage: { local: { get: (d, cb) => cb(Object.assign({}, d, storage)) }, onChanged: { addListener() {} } } },
};
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/../extension/defaults.js', 'utf8') + fs.readFileSync(__dirname + '/../extension/bridge.js', 'utf8'), ctx);
let ok = true; const t = (c, m) => { if (!c) { ok = false; console.log('FAIL', m); } };
const [msg, origin] = posted[0];
t(origin === 'https://leetcode.com', 'settings posted to own origin only');
t(msg.settings.enabled === true && msg.settings.snippets === false && !('evil' in msg.settings), 'settings sanitized: ' + JSON.stringify(msg.settings));
const W = ctx.window;
listeners.msg({ source: W, origin: 'https://leetcode.com', data: { __lcac: 'toBridge', type: 'status', status: { state: 'active', lang: '<b>x</b>', typed: 'no', extra: 'secret code' } } });
let got; listeners.rt({ type: 'lcac:getStatus' }, { id: 'me' }, (r) => { got = r; });
t(JSON.stringify(got) === '{"state":"active"}', 'status sanitized: ' + JSON.stringify(got));
listeners.msg({ source: W, origin: 'https://evil.com', data: { __lcac: 'toBridge', type: 'status', status: { state: 'off' } } });
listeners.rt({ type: 'lcac:getStatus' }, { id: 'me' }, (r) => { got = r; });
t(got.state === 'active', 'foreign-origin message ignored');
got = undefined; listeners.rt({ type: 'lcac:getStatus' }, { id: 'other-extension' }, (r) => { got = r; });
t(got === undefined, 'other extensions get no answer');

// Page script: prototype-pollution / bad-type settings are ignored.
global.window = globalThis; window.postMessage = () => {};
const ls = []; window.addEventListener = (ty, f) => ls.push(f);
window.monaco = undefined;
require(__dirname + '/../extension/core.js'); require(__dirname + '/../extension/inject.js');
t(window.__lcAC === undefined, 'helper removed from page globals');
ls.forEach((f) => f({ source: window, data: JSON.parse('{"__lcac":"toPage","type":"settings","settings":{"__proto__":{"polluted":true},"enabled":"yes"}}') }));
t(({}).polluted === undefined, 'no prototype pollution');
console.log(ok ? 'security checks passed' : 'SECURITY CHECKS FAILED');
process.exit(ok ? 0 : 1);
