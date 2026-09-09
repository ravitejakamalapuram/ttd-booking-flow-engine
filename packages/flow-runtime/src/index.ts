import type {Action,Condition,FlowDefinition,FlowStep} from '../../flow-schema/src/index.js';
import {resolveSelector} from '../../selectors/src/index.js';
export type RuntimeEvent={type:'flow_started'|'step_started'|'step_succeeded'|'step_failed'|'manual_required'|'flow_completed'|'flow_failed';sessionId:string;stepId?:string;at:number;durationMs?:number;error?:string};
export interface RuntimeHooks {onEvent?:(event:RuntimeEvent)=>void;manualTakeover?:(step:FlowStep,reason:string)=>Promise<boolean>;}
const sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));
function interpolate(input:unknown,vars:Record<string,unknown>):unknown { if(typeof input!=='string')return input; return input.replace(/\{\{\s*([\w.]+)\s*\}\}/g,(_,key)=>String(key.split('.').reduce((a:any,p:string)=>a?.[p],vars)??'')); }
async function waitForElement(selectors:Action['selector'],timeout:number){const start=Date.now();while(Date.now()-start<timeout){const e=selectors?.length?resolveSelector(selectors):null;if(e)return e;await sleep(40);}throw new Error('element timeout');}
function conditionMet(c:Condition){if(c.type==='element_exists')return !!resolveSelector(c.selector);if(c.type==='element_gone')return !resolveSelector(c.selector);if(c.type==='text_exists')return document.body.innerText.includes(c.text);if(c.type==='url_contains')return location.href.includes(c.value);return false;}
async function execute(action:Action,vars:Record<string,unknown>):Promise<void>{
  const timeout=action.timeoutMs??5000;
  if(action.type==='wait'){await sleep(Number(interpolate(action.value,vars)??0));return;}
  if(action.type==='wait_for_text'){const start=Date.now();while(Date.now()-start<timeout){if(document.body.innerText.includes(String(interpolate(action.text??'',vars))))return;await sleep(40);}throw new Error('text timeout');}
  if(action.type==='wait_for_element'){await waitForElement(action.selector,timeout);return;}
  const target=action.selector?.length?await waitForElement(action.selector,timeout):null;
  switch(action.type){
    case 'click': if(!(target instanceof HTMLElement))throw new Error('click target not found'); target.click(); return;
    case 'set_value': {if(!(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement))throw new Error('set_value target not form field');const value=String(interpolate(action.value,vars)??'');const proto=Object.getPrototypeOf(target);const setter=Object.getOwnPropertyDescriptor(proto,'value')?.set;if(setter)setter.call(target,value);else target.value=value;for(const ev of action.events??['input','change','blur','focusout'])target.dispatchEvent(new Event(ev,{bubbles:true}));return;}
    case 'select_option': if(!(target instanceof HTMLSelectElement))throw new Error('select target not select');target.value=String(interpolate(action.value,vars)??'');target.dispatchEvent(new Event('change',{bubbles:true}));return;
    case 'check':case 'uncheck': if(!(target instanceof HTMLInputElement)||target.type!=='checkbox')throw new Error('checkbox target not found');target.checked=action.type==='check';target.dispatchEvent(new Event('change',{bubbles:true}));return;
    case 'dispatch_events': if(!target)throw new Error('event target not found');for(const ev of action.events??[])target.dispatchEvent(new Event(ev,{bubbles:true}));return;
    case 'verify': if(!action.success?.every(conditionMet))throw new Error('verification failed');return;
    case 'manual': throw new Error('manual action');
    default: throw new Error(`unsupported action: ${action.type}`);
  }
}
async function runStep(step:FlowStep,vars:Record<string,unknown>){const retries=step.action.retry??0;let last:unknown;for(let attempt=0;attempt<=retries;attempt++){try{await execute(step.action,vars);if(step.action.success&&!step.action.success.every(conditionMet))throw new Error('verification failed');if(step.action.waitAfterMs)await sleep(step.action.waitAfterMs);return;}catch(e){last=e;if(attempt<retries)await sleep(Math.min(250*(attempt+1),1000));}}throw last instanceof Error?last:new Error(String(last));}
export async function runFlow(flow:FlowDefinition,hooks:RuntimeHooks={}):Promise<void>{const sessionId=crypto.randomUUID();const vars=flow.variables??{};hooks.onEvent?.({type:'flow_started',sessionId,at:Date.now()});try{for(const step of flow.steps){if(step.enabled===false)continue;const started=Date.now();hooks.onEvent?.({type:'step_started',sessionId,stepId:step.id,at:started});try{await runStep(step,vars);hooks.onEvent?.({type:'step_succeeded',sessionId,stepId:step.id,at:Date.now(),durationMs:Date.now()-started});}catch(e){const reason=e instanceof Error?e.message:String(e);hooks.onEvent?.({type:'step_failed',sessionId,stepId:step.id,at:Date.now(),error:reason});if(step.action.failureMode==='manual'&&hooks.manualTakeover){hooks.onEvent?.({type:'manual_required',sessionId,stepId:step.id,at:Date.now(),error:reason});if(await hooks.manualTakeover(step,reason))continue;}if(step.action.failureMode==='skip')continue;throw e;}}hooks.onEvent?.({type:'flow_completed',sessionId,at:Date.now()});}catch(e){hooks.onEvent?.({type:'flow_failed',sessionId,at:Date.now(),error:e instanceof Error?e.message:String(e)});throw e;}}
