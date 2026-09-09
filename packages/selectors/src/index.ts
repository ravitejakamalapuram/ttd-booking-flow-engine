import type { Selector } from '../../flow-schema/src/index.js';

function byText(text:string):Element|null {
  const needle=text.trim().toLowerCase();
  return [...document.querySelectorAll('button,a,input,select,textarea,[role="button"],[role="option"]')].find(el=>
    (el.textContent??'').trim().toLowerCase()===needle || (el.getAttribute('aria-label')??'').trim().toLowerCase()===needle)??null;
}
export function resolveSelector(selectors:Selector[]):Element|null {
  for(const s of [...selectors].sort((a,b)=>(a.priority??999)-(b.priority??999))) {
    try {
      if(s.kind==='css'){const e=document.querySelector(s.value);if(e)return e;}
      if(s.kind==='id'){const e=document.getElementById(s.value.replace(/^#/,''));if(e)return e;}
      if(s.kind==='name'){const e=document.querySelector(`[name="${CSS.escape(s.value)}"]`);if(e)return e;}
      if(s.kind==='role'){const e=document.querySelector(`[role="${CSS.escape(s.value)}"]`);if(e)return e;}
      if(s.kind==='xpath'){const e=document.evaluate(s.value,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;if(e instanceof Element)return e;}
      if(s.kind==='text'){const e=byText(s.value);if(e)return e;}
    } catch { /* try fallback */ }
  }
  return null;
}
function cssPath(el:Element):string {
  if(el.id) return `#${CSS.escape(el.id)}`;
  const parts:string[]=[]; let n:Element|null=el;
  while(n&&n!==document.body&&n.parentElement){
    let index=1; for(let s=n.previousElementSibling;s;s=s.previousElementSibling) if(s.tagName===n.tagName) index++;
    parts.unshift(`${n.tagName.toLowerCase()}:nth-of-type(${index})`); n=n.parentElement;
  }
  return parts.join(' > ');
}
function xpath(el:Element):string {
  if(el.id) return `//*[@id=${JSON.stringify(el.id)}]`;
  const parts:string[]=[]; let n:Element|null=el;
  while(n&&n.nodeType===1){let i=1;for(let s=n.previousElementSibling;s;s=s.previousElementSibling)if(s.tagName===n.tagName)i++;parts.unshift(`${n.tagName.toLowerCase()}[${i}]`);n=n.parentElement;}
  return `/${parts.join('/')}`;
}
export function describeElement(el:Element){
  const input=el as HTMLInputElement;
  const text=(el.textContent??'').trim().replace(/\s+/g,' ').slice(0,120);
  const selectors:Selector[]=[];
  if(el.id) selectors.push({kind:'id',value:el.id,priority:1});
  if(input.name) selectors.push({kind:'name',value:input.name,priority:2});
  selectors.push({kind:'css',value:cssPath(el),priority:3});
  selectors.push({kind:'xpath',value:xpath(el),priority:4});
  if(text) selectors.push({kind:'text',value:text,priority:5});
  return {tag:el.tagName.toLowerCase(),text,selectors,attributes:{id:el.id||undefined,name:input.name||undefined,type:input.type||undefined,role:el.getAttribute('role')||undefined}};
}
