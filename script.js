// Screen Navigation
function nextScreen(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    const options = currentScreen.querySelectorAll('.option-button.selected, .broker-card.selected');

    if (options.length === 0) {
        alert('Please select at least one option before proceeding.');
        return;
    }

    currentScreen.classList.remove('active');
    const next = document.getElementById(screenId);
    next.classList.add('active');

    updateProgress(screenId);
}

function previousScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Option Selection
function toggleOption(element) {
    element.classList.toggle('selected');
}

function selectSingle(element, group) {
    element.parentElement.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
}

function toggleBroker(element) {
    element.classList.toggle('selected');
}

// Tooltip
function showTooltip(event, text) {
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 30 + 'px';
    setTimeout(() => { tooltip.style.display = 'none'; }, 3000);
}

// Finish onboarding and go to dashboard
function finishOnboarding() {
    nextScreen('screen-dashboard');
}

// Progress Bar Update
function updateProgress(screenId) {
    const screenOrder = [
        'screen-preferences',
        'screen-portfolio-category',
        'screen-goals',
        'screen-experience',
        'screen-markets',
        'screen-risk',
        'screen-connect',
        'screen-dashboard'
    ];
    const index = screenOrder.indexOf(screenId);
    const percent = Math.min((index / (screenOrder.length - 1)) * 100, 100);

    document.querySelectorAll('.progress-fill').forEach(fill => {
        fill.style.width = `${percent}%`;
    });
}

/************ DASHBOARD TABBAR ************/
function initDashTabs() {
  const tabs = document.querySelectorAll('.dash-tab');
  const modal = document.getElementById('highlightsModal');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.tab === 'highlights') {
        openHighlights();
      }
      // 'recs' simply leaves the default card visible; no extra action needed
    });
  });
}

/************ TODAY'S RECOMMENDATIONS (MOCK) ************/
const MOCK_RECS = [
  { t: "NVDA", text: "Momentum continuation above 20-DMA; AI semi strength.", pct: "+1.9%" },
  { t: "XLE",  text: "Energy rotation on crude resilience; risk-on pocket.", pct: "+0.7%" },
  { t: "IWM",  text: "Small-caps bounce potential on breadth improvement.", pct: "+0.5%" },
  { t: "AAPL", text: "Defensive tech leadership; services growth tailwind.", pct: "+0.8%" }
];
function renderRecs() {
  const ul = document.getElementById('recsList');
  if (!ul) return;
  ul.innerHTML = "";
  MOCK_RECS.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="ticker">${r.t}</span>
      <span style="flex:1" class="muted">${r.text}</span>
      <span class="pct up">${r.pct}</span>`;
    ul.appendChild(li);
  });
}
function initRecs() {
  const btn = document.getElementById('refreshRecsBtn');
  if (btn) btn.addEventListener('click', renderRecs);
  renderRecs();
}

/************ PORTFOLIO PIE (CLICKABLE) ************/
const PIE_DATA = [
  { label: "US Stocks", value: 45 },
  { label: "Intl Stocks", value: 20 },
  { label: "Bonds", value: 20 },
  { label: "Cash", value: 10 },
  { label: "Crypto", value: 5 }
];
/* High-DPI, responsive canvas sizing */
function resizeCanvasToContainer(canvas, aspectRatio = 16/10) {
  const dpr = window.devicePixelRatio || 1;
  const parent = canvas.parentElement || canvas;
  const cssWidth = Math.max(260, Math.floor(parent.clientWidth || 320));
  const cssHeight = Math.floor(cssWidth / aspectRatio);

  // set CSS size
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  // set actual pixel size for crisp drawing
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  return { w: canvas.width, h: canvas.height, dpr };
}

/* simple debounce for resize */
function onResizeDebounced(fn, delay = 120) {
  let t; 
  window.addEventListener('resize', () => {
    clearTimeout(t); t = setTimeout(fn, delay);
  });
}

function drawPieChart() {
  const c = document.getElementById('pieChart');
  if (!c) return;

  const { w, h, dpr } = resizeCanvasToContainer(c, 1.2); // a little taller than wide
  const ctx = c.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0); // reset
  ctx.clearRect(0,0,w,h);

  const cx = Math.floor(w/2), cy = Math.floor(h/2) - 4*dpr;
  const R = Math.min(cx, cy) - 16*dpr;

  const total = PIE_DATA.reduce((s,d)=>s+d.value,0);
  let start = -Math.PI/2;
  PIE_DATA.forEach((d,i) => {
    const sweep = (d.value/total) * Math.PI*2;
    const end = start + sweep;

    // slice
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,R,start,end);
    ctx.closePath();
    ctx.fillStyle = `hsl(${i*65},70%,58%)`;
    ctx.fill();

    // leader & label
    const mid = (start+end)/2;
    const lx = cx + Math.cos(mid)*(R+10*dpr);
    const ly = cy + Math.sin(mid)*(R+10*dpr);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(mid)*R, cy + Math.sin(mid)*R);
    ctx.lineTo(lx, ly);
    ctx.strokeStyle = "#98A2B3";
    ctx.lineWidth = 1*dpr;
    ctx.stroke();

    ctx.fillStyle = "#344054";
    ctx.font = `${12*dpr}px ${getComputedStyle(document.body).fontFamily}`;
    const pct = Math.round((d.value/total)*100);
    const alignRight = Math.cos(mid) < 0;
    ctx.textAlign = alignRight ? "right" : "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${d.label} ${pct}%`, lx + (alignRight ? -6*dpr : 6*dpr), ly);

    d._start = start; d._end = end; d._cx = cx; d._cy = cy; d._r = R;
    start = end;
  });

  // click hit test stays the same, but use dpr-corrected coords:
  c.onclick = (e) => {
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left) * dpr - (c.width/2);
    const y = (e.clientY - rect.top) * dpr - (c.height/2 - 4*dpr);
    const dist = Math.sqrt(x*x + y*y);
    if (dist > PIE_DATA[0]._r) return;
    const ang = Math.atan2(y,x);
    let angle = ang + Math.PI; // normalize 0..2π
    if (angle < 0) angle += 2*Math.PI;
    const hit = PIE_DATA.find(d => angle >= (d._start+Math.PI/2) && angle <= (d._end+Math.PI/2));
    if (hit) alert(`${hit.label}: ${hit.value}% of portfolio`);
  };
}
function drawLineChart() {
  const c = document.getElementById('lineChart');
  if (!c) return;

  const { w, h, dpr } = resizeCanvasToContainer(c, 16/9);
  const ctx = c.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,w,h);

  const pad = 28*dpr;
  // axes
  ctx.strokeStyle = '#AAB4C3';
  ctx.lineWidth = 1*dpr;
  ctx.beginPath();
  ctx.moveTo(pad, h-pad); ctx.lineTo(w-pad, h-pad);
  ctx.moveTo(pad, pad);   ctx.lineTo(pad, h-pad);
  ctx.stroke();

  const min = Math.min(...PERF_POINTS), max = Math.max(...PERF_POINTS);
  const xStep = (w - 2*pad) / (PERF_POINTS.length - 1);
  const y = v => h - pad - ((v - min) / (max - min || 1)) * (h - 2*pad);

  // line
  ctx.beginPath();
  ctx.lineWidth = 2*dpr;
  ctx.strokeStyle = '#1a73e8';
  PERF_POINTS.forEach((v,i) => {
    const X = pad + i*xStep, Y = y(v);
    if (i === 0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
  });
  ctx.stroke();

  c.onclick = () => alert("Performance detail (mock).");
}
function drawProjectionChart(points){
  const c = document.getElementById('projectionChart'); if(!c) return;

  const { w, h, dpr } = resizeCanvasToContainer(c, 16/9);
  const ctx = c.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,w,h);

  const pad = 26*dpr;
  ctx.strokeStyle = '#AAB4C3';
  ctx.lineWidth = 1*dpr;
  ctx.beginPath();
  ctx.moveTo(pad, h-pad); ctx.lineTo(w-pad, h-pad);
  ctx.moveTo(pad, pad);   ctx.lineTo(pad, h-pad);
  ctx.stroke();

  const ys = points.map(p=>p.y), min=Math.min(...ys), max=Math.max(...ys);
  const xStep=(w-2*pad)/(points.length-1), y=v=>h-pad-((v-min)/(max-min||1))*(h-2*pad);

  ctx.beginPath();
  ctx.lineWidth = 2*dpr;
  ctx.strokeStyle = '#1a73e8';
  points.forEach((p,i)=>{ const X=pad+i*xStep, Y=y(p.y); if(i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y); });
  ctx.stroke();
}
onResizeDebounced(() => {
  drawPieChart();
  drawLineChart();
  updateProjection();  // this calls drawProjectionChart internally
});

  c.onclick = (e) => {
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    const dist = Math.sqrt(x*x + y*y);
    if (dist > R) return;
    const ang = Math.atan2(y,x);
    const angle = ang < -Math.PI/2 ? ang + Math.PI*2 : ang; // normalize around start
    const hit = PIE_DATA.find(d => angle>=d._start && angle<=d._end);
    if (hit) {
      alert(`${hit.label}: ${hit.value}% of portfolio`);
    }
  };
}

/************ PERFORMANCE LINE (CLICKABLE) ************/
const PERF_POINTS = [100, 104, 98, 110, 108, 115, 120, 118, 122, 125];
function drawLineChart() {
  const c = document.getElementById('lineChart');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height, pad = 28;
  ctx.clearRect(0,0,w,h);

  // axes
  ctx.strokeStyle = '#aab4c3';
  ctx.beginPath();
  ctx.moveTo(pad, h-pad); ctx.lineTo(w-pad, h-pad);
  ctx.moveTo(pad, pad);   ctx.lineTo(pad, h-pad);
  ctx.stroke();

  const min = Math.min(...PERF_POINTS), max = Math.max(...PERF_POINTS);
  const xStep = (w - 2*pad) / (PERF_POINTS.length - 1);
  const y = v => h - pad - ((v - min) / (max - min || 1)) * (h - 2*pad);

  // line
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1a73e8';
  PERF_POINTS.forEach((v,i) => {
    const X = pad + i*xStep;
    const Y = y(v);
    if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
  });
  ctx.stroke();

  c.onclick = () => {
    alert("Performance detail (mock): last 10 sessions with minor pullbacks and higher highs.");
  };
}

/************ MARKET HIGHLIGHTS MODAL ************/
function openHighlights() {
  document.getElementById('highlightsModal')?.classList.add('show');
  generateSummaries(); // ensure AI text is filled
  initProjection();    // ensure projection is drawn
}
function closeHighlights() {
  document.getElementById('highlightsModal')?.classList.remove('show');
}

function initHighlightsModal() {
  document.getElementById('closeHighlights')?.addEventListener('click', closeHighlights);
  document.querySelector('#highlightsModal .modal-backdrop')?.addEventListener('click', closeHighlights);

  // SMS toggle logic
  const toggle = document.getElementById('smsToggle');
  const row = document.getElementById('smsNumberRow');
  toggle?.addEventListener('change', () => {
    row.style.display = toggle.checked ? 'flex' : 'none';
  });
  document.getElementById('smsSave')?.addEventListener('click', () => {
    const num = (document.getElementById('smsNumber')?.value || '').trim();
    if (!num) return alert("Enter a phone number");
    alert(`Saved SMS number ${num} (mock).`);
  });

  // Regenerate AI summaries
  document.getElementById('regenSummaries')?.addEventListener('click', generateSummaries);
}

/************ AI SUMMARIES (MOCK) ************/
const GENERAL_SNIPPETS = [
  "Large-cap tech led gains while breadth improved across cyclicals.",
  "Yields steadied; energy and industrials outperformed defensives.",
  "Volatility eased; mega-caps provided index stability."
];
const PERSONAL_SNIPPETS = [
  "Your growth tilt benefited from semi strength and software resilience.",
  "Cash buffer reduced drawdowns in mid-session volatility.",
  "Watchlist triggered on above-average volume for two names."
];
function randPick(arr, n=2){
  const out = []; const pool = [...arr];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random()*pool.length);
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}
function generateSummaries(){
  const g = document.getElementById('aiGeneralSummary');
  const p = document.getElementById('aiPersonalSummary');
  if (g) g.textContent = randPick(GENERAL_SNIPPETS, 3).join(" ");
  if (p) p.textContent = randPick(PERSONAL_SNIPPETS, 3).join(" ");
}

/************ MOCK PORTFOLIO PROJECTION (used in modal) ************/
function compoundProjection(startBal, monthly, annualPct, years){
  const r = (annualPct/100)/12, months = Math.round(years*12);
  let V = startBal; for (let m=0; m<months; m++){ V = V*(1+r)+monthly; } return V;
}
function currency(x){ return x.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}); }
function drawProjectionChart(points){
  const c = document.getElementById('projectionChart'); if(!c) return;
  const ctx = c.getContext('2d'); const w=c.width, h=c.height, pad=26;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='#aab4c3'; ctx.beginPath();
  ctx.moveTo(pad,h-pad); ctx.lineTo(w-pad,h-pad); ctx.moveTo(pad,pad); ctx.lineTo(pad,h-pad); ctx.stroke();
  const ys = points.map(p=>p.y), min=Math.min(...ys), max=Math.max(...ys);
  const xStep=(w-2*pad)/(points.length-1), y=v=>h-pad-((v-min)/(max-min||1))*(h-2*pad);
  ctx.beginPath(); ctx.lineWidth=2; ctx.strokeStyle='#1a73e8';
  points.forEach((p,i)=>{ const X=pad+i*xStep, Y=y(p.y); if(i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y); }); ctx.stroke();
}
function updateProjection(){
  const s=Number(document.getElementById('startBal')?.value||0);
  const m=Number(document.getElementById('monthlyContrib')?.value||0);
  const a=Number(document.getElementById('annualReturn')?.value||0);
  const y1=compoundProjection(s,m,a,1), y3=compoundProjection(s,m,a,3), y5=compoundProjection(s,m,a,5);
  const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=currency(val); };
  set('proj1y',y1); set('proj3y',y3); set('proj5y',y5);
  const pts=[]; for(let yr=0; yr<=5; yr++) pts.push({x:yr,y:compoundProjection(s,m,a,yr)});
  drawProjectionChart(pts);
}
function initProjection(){
  ['startBal','monthlyContrib','annualReturn'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('input', updateProjection);
  });
  updateProjection();
}

/************ INIT ************/
document.addEventListener('DOMContentLoaded', () => {
  initDashTabs();
  initRecs();
  drawPieChart();
  drawLineChart();
  initHighlightsModal();
});

// Optional: initialize first screen progress
updateProgress('screen-preferences');
