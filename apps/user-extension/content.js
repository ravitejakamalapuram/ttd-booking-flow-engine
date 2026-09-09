(() => {
  const engine=globalThis.BOOKING_FLOW_ENGINE; let resume;
  const ui=document.createElement('div');ui.id='booking-flow-ui';Object.assign(ui.style,{position:'fixed',top:'12px',right:'12px',zIndex:2147483647,font:'12px system-ui'});document.documentElement.appendChild(ui);
  const show=(message,manual=false)=>{ui.innerHTML=`<div style="background:#111827;color:#fff;padding:10px 12px;border-radius:10px;box-shadow:0 5px 20px #0003;max-width:300px">${message}${manual?'<br><button id="bfr-resume" style="margin-top:8px;padding:5px 9px">I completed it — continue</button>':''}</div>`;if(manual)ui.querySelector('#bfr-resume').onclick=()=>{ui.textContent='Resuming…';resume?.()}};
  const run=async(flow)=>{const events=[];const sessionId=crypto.randomUUID();show(`Running <b>${flow.name}</b> v${flow.version}`);try{await engine.run(flow,{event:e=>{events.push({...e,sessionId});if(e.type==='step_succeeded')show(`✓ ${e.stepId}`)},manual:(step,reason)=>{show(`Manual action required:<br>${step.name}<br><small>${reason}</small>`,true);}});show('Flow completed');await chrome.storage.local.set({lastSession:{sessionId,events,completedAt:Date.now()}})}catch(e){show(`Flow stopped: ${e.message}`);await chrome.storage.local.set({lastSession:{sessionId,events,failedAt:Date.now(),error:e.message}})}};
  chrome.runtime.onMessage.addListener((m,_,send)=>{if(m.type==='RUN_FLOW'){run(m.flow);send({ok:true})}else if(m.type==='PING'){send({ok:true})}return true});
  globalThis.__bookingFlowManualResume=()=>resume?.();
})();
