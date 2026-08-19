const $ = (s) => document.querySelector(s);
let tripId = null, countdownTimer = null, callTimer = null;
const api = async (url, options) => { const r = await fetch(url, options); if (!r.ok) throw new Error('Service unavailable'); return r.json(); };
const toast = (message) => { const el=$('#toast'); el.textContent=message; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),3400); };

$('#route-btn').addEventListener('click', async () => {
  const origin=$('#origin').value, destination=$('#destination').value;
  try { const route=await api(`/api/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`); $('#route-result').innerHTML=`<b>${route.safety_index}/100 — safest route</b><br>${route.distance} · ${route.duration} · ${route.reasons[0]}`; $('#directions').innerHTML=route.steps.map(step=>`<li>${step}</li>`).join(''); $('#route-result').classList.remove('hidden'); $('#directions').classList.remove('hidden'); }
  catch { toast('Could not calculate route. Is the server running?'); }
});

$('#arm-btn').addEventListener('click', async () => {
  try { const trip=await api('/api/trips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:$('#origin').value,destination:$('#destination').value})}); tripId=trip.id; $('#trip-state').textContent='ARMED'; $('#guardian-status').textContent='AI Guardian is watching'; $('#guardian-copy').textContent='Route monitoring and gentle check-ins are active.'; $('#arm-btn').textContent='Guardian armed ✓'; $('#arm-btn').disabled=true; $('#simulate-btn').disabled=false; $('#complete-btn').classList.remove('hidden'); toast('AI Guardian armed — your safety net is active.'); }
  catch { toast('Start the Python server first: python run.py'); }
});

$('#language').addEventListener('change', async (e) => {
  try { const t=await api('/api/translate/'+e.target.value); $('#checkin-text').textContent=t.safe; $('#guardian-status').textContent=t.armed; toast(t.alert+' · Language updated'); } catch { toast('Language will update when connected to the server.'); }
});

$('#simulate-btn').addEventListener('click', async () => {
  if(!tripId) return; try { await api(`/api/trips/${tripId}/check-in`,{method:'POST'}); showCheckin(); } catch { toast('Unable to begin check-in.'); }
});
$('#complete-btn').addEventListener('click', async () => {
  if(!tripId) return; try { await api(`/api/trips/${tripId}/complete`,{method:'POST'}); tripId=null; $('#trip-state').textContent='DISARMED'; $('#guardian-status').textContent='Trip completed safely'; $('#guardian-copy').textContent='Your safety monitoring has been turned off.'; $('#arm-btn').textContent='Arm AI Guardian ⌁'; $('#arm-btn').disabled=false; $('#simulate-btn').disabled=true; $('#complete-btn').classList.add('hidden'); toast('Trip completed and AI Guardian disarmed.'); } catch { toast('Unable to complete this trip.'); }
});

function showCheckin(){ $('#checkin-modal').classList.remove('hidden'); let seconds=15; $('#countdown').textContent=seconds; clearInterval(countdownTimer); countdownTimer=setInterval(()=>{ seconds--; $('#countdown').textContent=seconds; if(seconds<=0){clearInterval(countdownTimer); $('#checkin-modal').classList.add('hidden'); escalate(1);} },1000); }
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
if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(p=>document.querySelector('.map-label b').textContent=`${p.coords.latitude.toFixed(4)}° N, ${p.coords.longitude.toFixed(4)}° E`,()=>{}); }
