/* ═══════════════════════════════════════
   main.js
   App entry point: loader, smooth scroll,
   theme, progress bar, nav highlight,
   radar chart, mobile menu, project
   modals, and contact form.
═══════════════════════════════════════ */

/* ═══ LOADER ═══ */
let loadPct = 0;
const lpct   = document.getElementById('lpct');
const lbarEl = document.getElementById('lbar');

const lIv = setInterval(() => {
  loadPct = Math.min(loadPct + (Math.random() * 18 + 4), 99);
  if (lpct) lpct.textContent = Math.floor(loadPct) + '%';
}, 120);

window.addEventListener('load', () => {
  clearInterval(lIv);
  if (lpct) lpct.textContent = '100%';
  setTimeout(() => {
  document.getElementById('loader').classList.add('hide');
  if (window._portfolio) {
    window._portfolio.splitText();
    window._portfolio.startTyping();
    window._portfolio.initScramble();
  }
  // Trigger hero counters after loader hides
  document.querySelectorAll('.hstats [data-target]').forEach(el => {
    const v = parseInt(el.dataset.target);
    if (!isNaN(v)) animCount(el, v);
  });
}, 2400);
  // setTimeout(() => {
  //   document.getElementById('loader').classList.add('hide');
  //   /* Trigger hero animations */
  //   if (window._portfolio) {
  //     window._portfolio.splitText();
  //     window._portfolio.startTyping();
  //     window._portfolio.initScramble();
  //   }
  // }, 2400);
});

/* ═══ LENIS SMOOTH SCROLL ═══ */
let lenis;
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    duration:       1.4,
    easing:         t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:    true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  /* Smooth anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80, duration: 1.6 }); }
    });
  });
}
initLenis();

/* ═══ DARK / LIGHT THEME TOGGLE ═══ */
function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  const icon    = document.getElementById('themeicon');
  if (icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('sk-theme', isLight ? 'light' : 'dark');
  updateThreeColors(isLight);
}

function updateThreeColors(isLight) {
  if (window._updateThreeColor) window._updateThreeColor(isLight);
}

/* Restore saved theme preference */
(function () {
  const saved = localStorage.getItem('sk-theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    const icon = document.getElementById('themeicon');
    if (icon) icon.className = 'fas fa-moon';
  }
})();

/* ═══ PROGRESS BAR + NAV SCROLL HIGHLIGHT ═══ */
const SECTIONS = ['hero','about','skills','experience','projects','certifications','publications','contact'];
const ACCENTS  = [
  { c: '#00f5d4', cd: 'rgba(0,245,212,.07)',   cg: 'rgba(0,245,212,.22)' },
  { c: '#00f5d4', cd: 'rgba(0,245,212,.07)',   cg: 'rgba(0,245,212,.22)' },
  { c: '#7c63ff', cd: 'rgba(124,99,255,.08)',  cg: 'rgba(124,99,255,.25)' },
  { c: '#00f5d4', cd: 'rgba(0,245,212,.07)',   cg: 'rgba(0,245,212,.22)' },
  { c: '#ff6b35', cd: 'rgba(255,107,53,.07)',  cg: 'rgba(255,107,53,.25)' },
  { c: '#7c63ff', cd: 'rgba(124,99,255,.08)',  cg: 'rgba(124,99,255,.25)' },
  { c: '#00f5d4', cd: 'rgba(0,245,212,.07)',   cg: 'rgba(0,245,212,.22)' },
  { c: '#ff6b35', cd: 'rgba(255,107,53,.07)',  cg: 'rgba(255,107,53,.25)' },
];

function setAcc(idx) {
  const a = ACCENTS[idx] || ACCENTS[0];
  const r = document.documentElement.style;
  r.setProperty('--acc', a.c);
  r.setProperty('--acd', a.cd);
  r.setProperty('--acg', a.cg);
}

window.addEventListener('scroll', () => {
  const pct = scrollY / (document.body.scrollHeight - innerHeight) * 100;
  document.getElementById('pbar').style.width = pct + '%';
  document.getElementById('nav').classList.toggle('sc', scrollY > 60);
  document.getElementById('bt').classList.toggle('show', scrollY > 450);

  let ci = 0;
  SECTIONS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 140) ci = i;
  });
  document.querySelectorAll('.npill a').forEach(a =>
    a.classList.toggle('act', a.getAttribute('href') === '#' + SECTIONS[ci])
  );
  setAcc(ci);
}, { passive: true });

/* ═══ RADAR CHART (Chart.js) ═══
   EDIT: labels and data to match your real skills */
(function initRadar() {
  const ctx = document.getElementById('radarChart');
  if (!ctx || typeof Chart === 'undefined') return;
  new Chart(ctx, {
    type: 'radar',
    data: {
      /* EDIT: labels and values (0–100) */
      labels:   ['Python', 'ML', 'Deep Learning', 'Data Analysis', 'NLP', 'Research'],
      datasets: [{
        label:              'Skill Level',
        data:               [90, 85, 75, 88, 70, 80], /* EDIT these numbers */
        backgroundColor:    'rgba(0,245,212,.12)',
        borderColor:        'rgba(0,245,212,.7)',
        borderWidth:        1.5,
        pointBackgroundColor: '#00f5d4',
        pointBorderColor:   'transparent',
        pointRadius:        4,
        pointHoverRadius:   6,
      }],
    },
    options: {
      responsive: true,
      plugins:    { legend: { display: false } },
      scales: {
        r: {
          beginAtZero: true, min: 0, max: 100,
          ticks:       { display: false, stepSize: 20 },
          grid:        { color: 'rgba(255,255,255,.06)' },
          angleLines:  { color: 'rgba(255,255,255,.06)' },
          pointLabels: { color: 'rgba(144,144,168,.8)', font: { family: 'JetBrains Mono', size: 10 } },
        },
      },
    },
  });
})();

/* ═══ MOBILE MENU ═══ */
function togMenu() {
  ['hbg', 'mdr', 'mov'].forEach(id => document.getElementById(id).classList.toggle('open'));
}

/* ═══ PROJECT MODALS ═══
   EDIT: Fill in your real project details below */
const MODAL_DATA = [
  {
    num:   '// 01',
    /* EDIT: Project name */
    title: 'Project Name Here',
    /* EDIT: Full description for the modal pop-up */
    desc:  'This is where you write a longer, more detailed description of the project. Explain the problem you were solving, your approach, the methodology, key challenges you overcame, and the results you achieved.',
    /* EDIT: Tech stack — use classes: tc, tv, to, tw2 */
    stack: [
      { label: 'Python',        cls: 'tc' },
      { label: 'Machine Learning', cls: 'tv' },
      { label: 'Pandas',        cls: 'tw2' },
      { label: 'Scikit-learn',  cls: 'tv' },
    ],
    /* EDIT: Links */
    github: 'YOUR_GITHUB_REPO',
    demo:   'YOUR_LIVE_DEMO', /* set to '' to hide the demo button */
  },
  {
    num:   '// 02',
    title: 'Project Name Here',
    desc:  'Detailed description of project 2. Explain what it does, the tech stack, challenges faced, and the final outcome or metrics achieved.',
    stack: [{ label: 'Python', cls: 'tc' }, { label: 'TensorFlow', cls: 'tv' }, { label: 'NumPy', cls: 'tw2' }],
    github: 'YOUR_GITHUB_REPO',
    demo:   '',
  },
  {
    num:   '// 03',
    title: 'Project Name Here',
    desc:  'Detailed description of project 3. Explain the approach, what data you used, how you processed it, and what insights or model performance you achieved.',
    stack: [{ label: 'Python', cls: 'tc' }, { label: 'SQL', cls: 'to' }, { label: 'Matplotlib', cls: 'tw2' }],
    github: 'YOUR_GITHUB_REPO',
    demo:   '',
  },
];

function openModal(i) {
  const d = MODAL_DATA[i];
  if (!d) return;
  document.getElementById('mNum').textContent   = d.num;
  document.getElementById('mTitle').textContent = d.title;
  document.getElementById('mDesc').textContent  = d.desc;
  document.getElementById('mStack').innerHTML   = d.stack.map(s => `<span class="tag ${s.cls}">${s.label}</span>`).join('');
  document.getElementById('mLinks').innerHTML   =
    `<a href="${d.github}" target="_blank" class="modal-link ml-primary rph"><i class="fab fa-github"></i>View Code</a>` +
    (d.demo ? `<a href="${d.demo}" target="_blank" class="modal-link ml-ghost rph"><i class="fas fa-external-link-alt"></i>Live Demo</a>` : '');
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e) { if (e.target.id === 'modalOverlay') closeModal(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ═══ CONTACT FORM (Formspree) ═══ */
const cf = document.getElementById('cf');
if (cf) {
  cf.addEventListener('submit', async e => {
    e.preventDefault();
    const b = cf.querySelector('.bsend');
    b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    b.disabled  = true;
    try {
      const r = await fetch(cf.action, { method: 'POST', body: new FormData(cf), headers: { Accept: 'application/json' } });
      if (r.ok) {
        document.getElementById('fsuc').style.display = 'block';
        cf.reset();
        b.innerHTML = '<i class="fas fa-check"></i> Sent!';
        setTimeout(() => { b.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; b.disabled = false; }, 1200);
      } else {
        b.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        b.disabled  = false;
      }
    } catch {
      b.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      b.disabled  = false;
    }
  });
}