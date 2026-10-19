// Chrome Web Store limits for manifest fields.
const m = require('../extension/manifest.json');
const checks = [
  ['name', m.name, 75],
  ['short_name', m.short_name, 12],
  ['description', m.description, 132],
];
let ok = true;
for (const [field, value, max] of checks) {
  if (value !== undefined && value.length > max) {
    ok = false;
    console.log(`FAIL manifest ${field} is ${value.length} characters (max ${max})`);
  }
}
if (!/^\d+(\.\d+){0,3}$/.test(m.version)) { ok = false; console.log('FAIL manifest version format'); }
console.log(ok ? 'manifest checks passed' : 'MANIFEST CHECKS FAILED');
process.exit(ok ? 0 : 1);
