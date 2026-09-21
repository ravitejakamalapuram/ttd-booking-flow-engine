(() => {
  const recorder=globalThis.BookingFlowRecorder;
  let recording=false;
  let events=[];
  let sequence=0;
  let lastUrl='';
  let nextElementKey=1;
  const elementKeys=new WeakMap();
  const listeners=[];
  const pendingInputs=new Map();
  const historyRestorers=[];

  const addListener=(target,type,handler,options)=>{
    target.addEventListener(type,handler,options);
    listeners.push(()=>target.removeEventListener(type,handler,options));
  };
  const elementKey=(element)=>{
    if(!elementKeys.has(element)) elementKeys.set(element,`element.${nextElementKey++}`);
    return elementKeys.get(element);
  };
  const actionableElement=(element)=>element.closest?.('button,a,input,select,textarea,label,[role="button"],[role="option"],[role="combobox"]')||element;
  const isRecorderElement=(element)=>!!element?.closest?.('[data-booking-flow-admin]');
  const push=(event)=>{if(recording)events.push({...event,sequence:sequence++});};
  const currentSanitizedUrl=()=>recorder.sanitizeUrl(location.href);

  const recordNavigation=(toUrl,kind,fromUrl=lastUrl)=>{
    const url=recorder.sanitizeUrl(toUrl);
    if(!url||url===fromUrl)return;
    push({type:'navigation',navigationType:kind,fromUrl:fromUrl||undefined,url});
    lastUrl=url;
  };
  const observeLocation=(kind)=>{
    const url=currentSanitizedUrl();
    if(url!==lastUrl)recordNavigation(url,kind,lastUrl);
  };
  const patchHistory=()=>{
    for(const method of ['pushState','replaceState']){
      const original=history[method];
      const wrapped=function(...args){
        const result=original.apply(this,args);
        setTimeout(()=>observeLocation(method),0);
        return result;
      };
      history[method]=wrapped;
      historyRestorers.push(()=>{history[method]=original;});
    }
  };

  const flushInput=(key)=>{
    const pending=pendingInputs.get(key);
    if(!pending)return;
    clearTimeout(pending.timer);
    pendingInputs.delete(key);
    const value=recorder.captureValue(pending.element);
    push({
      type:'input',
      sourceTypes:[...pending.sourceTypes],
      url:currentSanitizedUrl(),
      element:recorder.describeElement(pending.element),
      ...value
    });
  };
  const captureField=(element,type)=>{
    const key=elementKey(element);
    const pending=pendingInputs.get(key);
    if(pending){
      pending.sourceTypes.add(type);
      clearTimeout(pending.timer);
      pending.timer=setTimeout(()=>flushInput(key),300);
      return;
    }
    pendingInputs.set(key,{element,sourceTypes:new Set([type]),timer:setTimeout(()=>flushInput(key),300)});
  };
  const captureClick=(event)=>{
    if(!recording)return;
    const raw=event.target instanceof Element?event.target:null;
    const element=actionableElement(raw);
    if(!element||isRecorderElement(element))return;
    push({type:'click',url:currentSanitizedUrl(),element:recorder.describeElement(element)});
    const anchor=element.closest?.('a[href]');
    if(anchor?.href)recordNavigation(anchor.href,'anchor',lastUrl);
    else setTimeout(()=>observeLocation('click'),0);
  };
  const captureInput=(event)=>{
    if(!recording)return;
    const element=event.target instanceof Element?event.target:null;
    if(!element||isRecorderElement(element)||!['INPUT','TEXTAREA','SELECT'].includes(element.tagName))return;
    captureField(element,event.type);
  };
  const start=()=>{
    if(recording)return;
    recording=true;
    events=[];
    sequence=0;
    lastUrl=currentSanitizedUrl();
    pendingInputs.clear();
    push({type:'navigation',navigationType:'start',url:lastUrl});
    addListener(document,'click',captureClick,true);
    addListener(document,'input',captureInput,true);
    addListener(document,'change',captureInput,true);
    addListener(window,'popstate',()=>observeLocation('popstate'));
    addListener(window,'hashchange',()=>observeLocation('hashchange'));
    patchHistory();
  };
  const stop=()=>{
    for(const key of [...pendingInputs.keys()])flushInput(key);
    recording=false;
    for(const remove of listeners.splice(0))remove();
    for(const restore of historyRestorers.splice(0))restore();
    return recorder.normalizeRecordedEvents(events);
  };
  const snapshot=()=>recorder.normalizeRecordedEvents([...events,...pendingInputs.values().map((pending)=>({type:'input',url:currentSanitizedUrl(),element:recorder.describeElement(pending.element),...recorder.captureValue(pending.element)}))]);

  chrome.runtime.onMessage.addListener((message,_,send)=>{
    if(message.type==='START_RECORDING'){start();send({ok:true,recording});}
    else if(message.type==='STOP_RECORDING'){send({ok:true,events:stop()});}
    else if(message.type==='GET_RECORDING'){send({ok:true,recording,events:snapshot()});}
    return true;
  });
  chrome.runtime.onMessage.addListener((m)=>{if(m.type==='HIGHLIGHT_SELECTOR'){document.querySelectorAll('[data-flow-highlight]').forEach(e=>e.removeAttribute('data-flow-highlight'));try{const e=document.querySelector(m.selector);if(e){e.setAttribute('data-flow-highlight','true');e.scrollIntoView({block:'center'});}}catch{}}});
  const style=document.createElement('style');style.textContent='[data-flow-highlight]{outline:3px solid #7c3aed!important;outline-offset:3px!important}';document.documentElement.appendChild(style);
})();
