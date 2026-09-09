const $=s=>document.querySelector(s);let tab;
async function getTab(){[tab]=await chrome.tabs.query({active:true,currentWindow:true});return tab;}
function setStatus(s){$('#status').textContent=s;}
$('#start').onclick=async()=>{tab=await getTab();if(!tab?.url?.includes('ttdevasthanams.ap.gov.in'))return setStatus('Open the TTD portal first.');await chrome.tabs.sendMessage(tab.id,{type:'START_RECORDING'});setStatus('Recording live DOM interactions…');};
$('#stop').onclick=async()=>{tab=await getTab();const r=await chrome.tabs.sendMessage(tab.id,{type:'STOP_RECORDING'});$('#out').value=JSON.stringify(r.events??[],null,2);setStatus(`${r.events?.length??0} events captured.`);};
$('#save').onclick=async()=>{try{const data=JSON.parse($('#out').value);await chrome.storage.local.set({lastRecording:data,recordedAt:Date.now()});setStatus('Recording saved locally.');}catch(e){setStatus('Invalid JSON in editor.');}};
