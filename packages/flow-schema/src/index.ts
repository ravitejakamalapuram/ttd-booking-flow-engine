export type SelectorKind = 'css' | 'xpath' | 'id' | 'text' | 'role' | 'name';
export interface Selector { kind: SelectorKind; value: string; priority?: number; }
export type EventName = 'input' | 'change' | 'blur' | 'focusout';
export type ActionType = 'wait'|'wait_for_element'|'wait_for_text'|'click'|'set_value'|'select_option'|'check'|'uncheck'|'dispatch_events'|'verify'|'manual';
export interface Action { type: ActionType; selector?: Selector[]; value?: string|number|boolean; text?: string; events?: EventName[]; success?: Condition[]; timeoutMs?: number; retry?: number; waitAfterMs?: number; failureMode?: 'stop'|'manual'|'skip'; }
export type Condition =
  | {type:'element_exists'; selector:Selector[]}
  | {type:'element_gone'; selector:Selector[]}
  | {type:'text_exists'; text:string}
  | {type:'url_contains'; value:string};
export interface FlowStep { id:string; name:string; action:Action; enabled?:boolean; }
export interface FlowDefinition {
  id:string; platform:string; name:string; version:number; enabled:boolean;
  match:{hosts:string[]; paths?:string[]};
  variables?:Record<string,string|number|boolean>;
  steps:FlowStep[];
  safety?:{stopBeforePayment?:boolean};
}
export interface PilgrimProfile { id:string; name:string; age:number; gender:string; idType:'aadhaar'|'passport'|'other'; idNumber:string; }
export interface ProfileGroup { id:string; name:string; pilgrimIds:string[]; }
export interface BookingStrategy { id:string; name:string; preferredDates:string[]; preferredSlots:string[]; minimumPeople?:number; allowFallback?:boolean; }
export interface BookingSession { id:string; flowId:string; flowVersion:number; profileGroupId:string; strategyId:string; startedAt:number; status:'running'|'manual'|'completed'|'failed'; }
export function validateFlow(flow:FlowDefinition):string[] {
  const errors:string[]=[];
  if(!flow.id) errors.push('flow.id is required');
  if(!flow.platform) errors.push('flow.platform is required');
  if(!flow.name) errors.push('flow.name is required');
  if(!Number.isInteger(flow.version)||flow.version<1) errors.push('flow.version must be >= 1');
  if(!flow.match?.hosts?.length) errors.push('flow.match.hosts must not be empty');
  if(!Array.isArray(flow.steps)||!flow.steps.length) errors.push('flow.steps must not be empty');
  const ids=new Set<string>();
  for(const step of flow.steps??[]){
    if(!step.id) errors.push('step.id is required');
    if(ids.has(step.id)) errors.push(`duplicate step id: ${step.id}`); ids.add(step.id);
    if(!step.action?.type) errors.push(`step ${step.id}: action.type is required`);
    for(const s of step.action?.selector??[]) if(!s.kind||!s.value) errors.push(`step ${step.id}: selector is incomplete`);
  }
  return errors;
}
export function flowMatchesLocation(flow:FlowDefinition, url:string):boolean {
  try { const u=new URL(url); return flow.match.hosts.includes(u.hostname) && (!flow.match.paths?.length || flow.match.paths.some(p=>u.pathname===p||u.pathname.startsWith(`${p}/`))); }
  catch { return false; }
}
