const $ = (s) => document.querySelector(s);
let tripId = null, countdownTimer = null, callTimer = null;
const api = async (url, options) => { const r = await fetch(url, options); if (!r.ok) throw new Error('Service unavailable'); return r.json(); };
const toast = (message) => { const el=$('#toast'); el.textContent=message; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),3400); };
const protectionState = (label) => { $('#protection-state').lastChild.textContent=` ${label}`; };
const initials = (name) => name.split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase();

async function loadGuardian(){
  try { const contacts=await api('/api/contacts'); const guardian=contacts.find(contact=>contact.role==='guardian'); if(!guardian) return; $('.contact b').textContent=guardian.name; $('.contact small').textContent=`Primary Guardian · ${guardian.language.toUpperCase()}`; $('.contact .avatar').textContent=initials(guardian.name); }
  catch { /* Default demo contact remains visible when offline. */ }
}
loadGuardian();

$('#route-btn').addEventListener('click', async () => {
  const origin=$('#origin').value, destination=$('#destination').value;
  try { const route=await api(`/api/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`); $('#route-result').replaceChildren(); const summary=document.createElement('b'); summary.textContent=`${route.safety_index}/100 — safest route`; $('#route-result').append(summary,document.createElement('br'),document.createTextNode(`${route.distance} · ${route.duration} · ${route.reasons[0]}`)); $('#directions').replaceChildren(...route.steps.map(step=>{const item=document.createElement('li');item.textContent=step;return item;})); $('#route-result').classList.remove('hidden'); $('#directions').classList.remove('hidden'); }
  catch { toast('Could not calculate route. Is the server running?'); }
});

$('#arm-btn').addEventListener('click', async () => {
  try { const trip=await api('/api/trips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:$('#origin').value,destination:$('#destination').value})}); tripId=trip.id; $('#trip-state').textContent='ARMED'; protectionState('LIVE PROTECTION'); $('#guardian-status').textContent='AI Guardian is watching'; $('#guardian-copy').textContent='Route monitoring and gentle check-ins are active.'; $('#arm-btn').textContent='Guardian armed ✓'; $('#arm-btn').disabled=true; $('#simulate-btn').disabled=false; $('#complete-btn').classList.remove('hidden'); toast('AI Guardian armed — your safety net is active.'); }
  catch { toast('Start the Python server first: python run.py'); }
});

$('#language').addEventListener('change', async (e) => {
  try { const t=await api('/api/translate/'+e.target.value); $('#checkin-text').textContent=t.safe; $('#guardian-status').textContent=t.armed; toast(t.alert+' · Language updated'); } catch { toast('Language will update when connected to the server.'); }
});

$('#simulate-btn').addEventListener('click', async () => {
  if(!tripId) return; try { await api(`/api/trips/${tripId}/check-in`,{method:'POST'}); showCheckin(); } catch { toast('Unable to begin check-in.'); }
});
$('#complete-btn').addEventListener('click', async () => {
  if(!tripId) return; try { await api(`/api/trips/${tripId}/complete`,{method:'POST'}); tripId=null; $('#trip-state').textContent='DISARMED'; protectionState('PROTECTION READY'); $('#guardian-status').textContent='Trip completed safely'; $('#guardian-copy').textContent='Your safety monitoring has been turned off.'; $('#arm-btn').textContent='Arm AI Guardian ⌁'; $('#arm-btn').disabled=false; $('#simulate-btn').disabled=true; $('#complete-btn').classList.add('hidden'); toast('Trip completed and AI Guardian disarmed.'); } catch { toast('Unable to complete this trip.'); }
});

function showCheckin(){ $('#checkin-modal').classList.remove('hidden'); $('#safe-btn').focus(); let seconds=15; $('#countdown').textContent=seconds; clearInterval(countdownTimer); countdownTimer=setInterval(()=>{ seconds--; $('#countdown').textContent=seconds; if(seconds<=0){clearInterval(countdownTimer); $('#checkin-modal').classList.add('hidden'); escalate(1);} },1000); }
$('#safe-btn').addEventListener('click',()=>{ clearInterval(countdownTimer); $('#checkin-modal').classList.add('hidden'); toast('Thank you — your trip is continuing safely.'); });
$('#escalate-btn').addEventListener('click',()=>{ clearInterval(countdownTimer); $('#checkin-modal').classList.add('hidden'); escalate(1); });

async function escalate(tier){
  try { const result=await api('/api/escalations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trip_id:tripId,tier})}); showCall(tier,result.targets); }
  catch { toast('Unable to contact your safety circle.'); }
}
function showCall(tier, targets){
  const parent=tier===2, person=targets?.[0]; $('#call-tier').textContent=parent?'HIGH-PRIORITY SOS DISPATCH':'AI VOICE DISPATCH'; $('#call-name').textContent=parent?`Calling ${person?.name||'Parents'}`:`Calling ${person?.name||'Aarav Sharma'}`; $('#call-number').textContent=person?.phone||'+91 98765 43210'; $('#call-script').textContent=parent?'High-priority alert: Ananya remains unresponsive near MG Road. Her live location has been sent.':'Attention: this is the AI Safety Guardian. Ananya’s cab stopped unexpectedly near MG Road and she did not respond to her safety check-in. A location link was sent by SMS.'; $('#call-modal').classList.remove('hidden'); let sec=0; clearInterval(callTimer); callTimer=setInterval(()=>{sec++;$('#call-timer').textContent=`00:${String(sec).padStart(2,'0')}`; if(sec===6&&!parent){toast('SMS location link sent to guardian.');} if(sec===14&&!parent){clearInterval(callTimer); $('#call-modal').classList.add('hidden'); toast('No acknowledgement — escalating to parents.'); setTimeout(()=>escalate(2),500);}},1000);
  if('speechSynthesis' in window){ setTimeout(()=>speechSynthesis.speak(new SpeechSynthesisUtterance($('#call-script').textContent)),400); }
}
$('#end-call').addEventListener('click',()=>{clearInterval(callTimer);speechSynthesis?.cancel();$('#call-modal').classList.add('hidden');toast('Demo call closed. Dispatch was logged.');});
if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(p=>{const lat=p.coords.latitude,lon=p.coords.longitude;document.querySelector('.map-label b').textContent=`${Math.abs(lat).toFixed(4)}° ${lat>=0?'N':'S'}, ${Math.abs(lon).toFixed(4)}° ${lon>=0?'E':'W'}`;},()=>{}); }
