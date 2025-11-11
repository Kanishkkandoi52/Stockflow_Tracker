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

// Optional: initialize first screen progress
updateProgress('screen-preferences');


/************ DAILY PICKS & OVERVIEW ************/
const MOCK_GENERAL = [
  { t: "AAPL", name: "Apple", pct: +1.2 },
  { t: "MSFT", name: "Microsoft", pct: -0.4 },
  { t: "NVDA", name: "NVIDIA", pct: +2.1 },
  { t: "SPY",  name: "S&P 500 ETF", pct: +0.3 }
];

const MOCK_PERSONAL = [
  { t: "TSLA", name: "Tesla", pct: +1.8 },
  { t: "QQQ",  name: "Invesco QQQ", pct: +0.6 },
  { t: "COIN", name: "Coinbase", pct: -1.1 }
];

function renderDaily(list, rows){
  list.innerHTML = "";
  rows.forEach(r => {
    const li = document.createElement('li');
    const dir = r.pct >= 0 ? 'up' : 'down';
    li.innerHTML = `
      <span class="ticker">${r.t}</span>
      <span class="muted" style="flex:1">${r.name}</span>
      <span class="pct ${dir}">${r.pct.toFixed(1)}%</span>
    `;
    list.appendChild(li);
  });
}

function initDailyPicks(){
  const list = document.getElementById('dailyList');
  const tabs = document.querySelectorAll('#daily-picks .tabbar .tab');
  if (!list || tabs.length === 0) return;

  const setTab = (key) => {
    renderDaily(list, key === 'general' ? MOCK_GENERAL : MOCK_PERSONAL);
    tabs.forEach(b => b.classList.toggle('active', b.dataset.tab === key));
  };

  tabs.forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  setTab('general');

  const seeMore = document.getElementById('seeMoreAppBtn');
  if (seeMore) seeMore.addEventListener('click', () => {
    alert("We’ll send you a link in SMS to open the full view in the app.");
  });
}

/************ SMS NOTIFS TEASER ************/
function initSms(){
  const btn = document.getElementById('smsSendBtn');
  const phone = document.getElementById('smsPhone');
  if (!btn || !phone) return;
  btn.addEventListener('click', () => {
    const val = (phone.value || "").trim();
    if (!val) { alert("Enter a phone number."); return; }
    // Placeholder: real impl would POST to backend/SMS provider
    alert(`Preview: would send one-time link to ${val}.`);
  });
}

/************ AI SUMMARIES (MOCKED) ************/
const GENERAL_SNIPPETS = [
  "Equities were mixed with large-cap tech showing resilience.",
  "Rates stabilized intraday while energy ticked higher.",
  "Breadth narrowed; defensives outperformed cyclicals.",
  "Earnings guidance remained a key driver of dispersion."
];

const PERSONAL_SNIPPETS = [
  "Your growth tilt benefited from semiconductor strength.",
  "Your cash allocation dampened downside in afternoon trade.",
  "Your watchlist names showed elevated volume vs 20-day.",
  "Your risk score remains within your selected tolerance."
];

function randPick(arr, n=2){
  const out = []; const pool = [...arr];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
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

function initAISummaries(){
  const btn = document.getElementById('refreshSummariesBtn');
  if (btn) btn.addEventListener('click', generateSummaries);
  generateSummaries();
}

/************ MOCK PORTFOLIO PROJECTION ************/
function compoundProjection(startBal, monthly, annualPct, years){
  // monthly compounding
  const r = (annualPct/100) / 12;
  const months = Math.round(years*12);
  let value = startBal;
  for (let m = 0; m < months; m++){
    value = value * (1 + r) + monthly;
  }
  return value;
}

function currency(x){
  return x.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function drawProjectionChart(points){
  const c = document.getElementById('projectionChart');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height, pad = 24;

  // clear
  ctx.clearRect(0,0,w,h);

  // axes
  ctx.strokeStyle = '#888';
  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.stroke();

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const xStep = (w - 2*pad) / (points.length - 1);
  const yMap = v => h - pad - ( (v - minY) / (maxY - minY || 1) ) * (h - 2*pad);

  // line
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1a73e8';
  points.forEach((p,i) => {
    const x = pad + i*xStep;
    const y = yMap(p.y);
    if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

function updateProjection(){
  const startBal = Number(document.getElementById('startBal')?.value || 0);
  const monthly   = Number(document.getElementById('monthlyContrib')?.value || 0);
  const annualPct = Number(document.getElementById('annualReturn')?.value || 0);

  const y1 = compoundProjection(startBal, monthly, annualPct, 1);
  const y3 = compoundProjection(startBal, monthly, annualPct, 3);
  const y5 = compoundProjection(startBal, monthly, annualPct, 5);

  const p1 = document.getElementById('proj1y');
  const p3 = document.getElementById('proj3y');
  const p5 = document.getElementById('proj5y');
  if (p1) p1.textContent = currency(y1);
  if (p3) p3.textContent = currency(y3);
  if (p5) p5.textContent = currency(y5);

  // series over 5y for chart (yearly points)
  const points = [];
  for (let yr = 0; yr <= 5; yr++){
    points.push({ x: yr, y: compoundProjection(startBal, monthly, annualPct, yr) });
  }
  drawProjectionChart(points);
}

function initProjection(){
  ['startBal','monthlyContrib','annualReturn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateProjection);
  });
  updateProjection();
}

/************ INIT ALL NEW WIDGETS ON DASHBOARD LOAD ************/
document.addEventListener('DOMContentLoaded', () => {
  // if user lands directly on dashboard:
  initDailyPicks();
  initSms();
  initAISummaries();
  initProjection();
});

// also run when onboarding finishes (your existing finishOnboarding calls nextScreen)
// append this inside finishOnboarding() if you want to re-init after navigation:
//   initDailyPicks(); initSms(); initAISummaries(); initProjection();

