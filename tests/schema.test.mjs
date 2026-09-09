import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const load=()=>fs.readFile(new URL('../flows/ttd/special-entry-darshan-v0.json',import.meta.url),'utf8').then(JSON.parse);
test('TTD flow has versioned identity and safety boundary',async()=>{const f=await load();assert.equal(f.id,'ttd.special-entry-darshan');assert.ok(f.version>=1);assert.equal(f.safety.stopBeforePayment,true);});
test('flow fixture contains manual fallback',async()=>{const f=await load();assert.ok(f.steps.some(s=>s.action.failureMode==='manual'));});
test('selector ordering prefers explicit selectors',()=>{const s=[{kind:'text',value:'Continue',priority:5},{kind:'id',value:'continue',priority:1}];assert.equal([...s].sort((a,b)=>(a.priority??999)-(b.priority??999))[0].kind,'id');});
