const $$ = (s) => document.querySelector(s);

const SCENARIOS = {
  low: [
    { tag: 'signal', label: 'SIGNAL', text: 'GPS shows <b>0 km/h</b> for 90s near MG Road — off usual pace for this route.' },
    { tag: 'signal', label: 'SIGNAL', text: 'Accelerometer flat. Time is <b>9:40 PM</b>, area lighting rated moderate.' },
    { tag: 'reason', label: 'REASONING', text: 'Single stationary signal, well-lit area, no route deviation. Severity assessed as <b>low</b>.' },
    { tag: 'reason', label: 'REASONING', text: 'Policy: low severity → ask before acting. A silent escalation here would likely be a false alarm.' },
    { tag: 'tool', label: 'TOOL CALL', text: 'invoke <b>send_checkin_prompt()</b> → private prompt shown to user, 15s response window.' },
    { tag: 'decision', label: 'DECISION', text: 'Waiting on user response before any contact is made. <b>No one else notified yet.</b>' },
  ],
  high: [
    { tag: 'signal', label: 'SIGNAL', text: 'GPS shows <b>0 km/h</b> for 4 min, <b>310m off</b> the planned route.' },
    { tag: 'signal', label: 'SIGNAL', text: 'Area flagged low-light. Time is <b>11:52 PM</b>. No motion on accelerometer.' },
    { tag: 'reason', label: 'REASONING', text: 'Multiple compounding signals: off-route + prolonged stop + low light + late hour. Severity assessed as <b>high</b>.' },
    { tag: 'reason', label: 'REASONING', text: 'Policy: high severity → check in, but do not wait passively. Prepare escalation in parallel.' },
    { tag: 'tool', label: 'TOOL CALL', text: 'invoke <b>send_checkin_prompt()</b> with a shortened 15s window.' },
    { tag: 'tool', label: 'TOOL CALL', text: 'no response received → invoke <b>notify_guardian(tier=1)</b>: voice + SMS with live location.' },
    { tag: 'tool', label: 'TOOL CALL', text: 'guardian unacknowledged at 14s → invoke <b>notify_parent(tier=2)</b> and surface <b>call 112</b> shortcut.' },
    { tag: 'decision', label: 'DECISION', text: '<b>Escalating now.</b> This sequence runs without further user input — it is the agentic part of the system.' },
  ],
};

function renderTrace(kind) {
  const trace = $$('#trace');
  trace.replaceChildren();
  const steps = SCENARIOS[kind];
  steps.forEach((step, i) => {
    const row = document.createElement('div');
    row.className = 'trace-line';
    row.style.animationDelay = `${i * 0.45}s`;
    const tag = document.createElement('span');
    tag.className = `trace-tag ${step.tag}`;
    tag.textContent = step.label;
    const text = document.createElement('span');
    text.className = 'trace-text';
    text.innerHTML = step.text;
    row.append(tag, text);
    trace.append(row);
  });
}

$$('#run-low')?.addEventListener('click', () => renderTrace('low'));
$$('#run-high')?.addEventListener('click', () => renderTrace('high'));

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));
}
