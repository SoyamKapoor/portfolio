/* ═══════════════════════════════════════
   animations.js
   All visual effects & interaction logic:
   cursor, parallax, scroll reveal,
   skill bars, card glow, 3D tilt,
   drag scroll, counters, scramble, typing
═══════════════════════════════════════ */

/* ═══ CUSTOM CURSOR ═══ */
const CD = document.getElementById('cdot');
const CR = document.getElementById('cring');
const CL = document.getElementById('clabel');

if (CD && CR && CL) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    CL.style.left = mx + 'px';
    CL.style.top  = my + 'px';
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cc2'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cc2'));

  (function animCursor() {
    CD.style.left = mx + 'px';
    CD.style.top  = my + 'px';
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    CR.style.left = rx + 'px';
    CR.style.top  = ry + 'px';
    requestAnimationFrame(animCursor);
  })();

  document.querySelectorAll('a, button, .btn, .fsb, .atile, .pc, .cc, .pmore').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('ch');
      const lb = el.dataset.label;
      if (lb) { CL.textContent = lb; CL.classList.add('show'); }
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('ch');
      CL.classList.remove('show');
    });
  });
}

/* ═══ RIPPLE EFFECT ═══ */
document.querySelectorAll('.rph').forEach(el => {
  el.addEventListener('click', e => {
    const r = el.getBoundingClientRect();
    const c = document.createElement('span');
    c.className = 'rc';
    const s = Math.max(r.width, r.height);
    c.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    el.appendChild(c);
    setTimeout(() => c.remove(), 650);
  });
});

/* ═══ MAGNETIC BUTTONS ═══ */
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) * 0.3;
    const dy = (e.clientY - r.top  - r.height / 2) * 0.3;
    btn.style.transform = `translate(${dx}px,${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

/* ═══ PARALLAX ON SCROLL ═══ */
// function initParallax() {
//   window.addEventListener('scroll', () => {
  function initParallax() {
  if (window.innerWidth < 768) return;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const b1 = document.getElementById('pb1');
    const b2 = document.getElementById('pb2');
    const b3 = document.getElementById('pb3');
    const pc = document.getElementById('photocol');
    if (b1) b1.style.transform = `translateY(${sy * 0.12}px)`;
    if (b2) b2.style.transform = `translateY(${sy * 0.08}px)`;
    if (b3) b3.style.transform = `translateY(${sy * 0.18}px)`;
    if (pc) pc.style.transform = `translateY(${sy * 0.07}px)`;
  }, { passive: true });
}
initParallax();

/* ═══ SCROLL REVEAL ═══ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(x => { if (x.isIntersecting) x.target.classList.add('on'); });
}, { threshold: 0.08 });
document.querySelectorAll('.rv,.rvl,.rvr,.rvs,.rvc').forEach(el => revealObserver.observe(el));

/* ═══ SKILL BARS ═══ */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(x => {
    if (x.isIntersecting) {
      x.target.querySelectorAll('.sbf').forEach(b => {
        b.style.width = b.dataset.width + '%';
        setTimeout(() => b.classList.add('filled'), 1500);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.sk').forEach(el => barObserver.observe(el));

/* ═══ SKILL CARD RADIAL GLOW ═══ */
document.querySelectorAll('.sk').forEach(sk => {
  sk.addEventListener('mousemove', e => {
    const r = sk.getBoundingClientRect();
    sk.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
    sk.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
  });
});

/* ═══ 3D TILT PROJECT CARDS ═══ */
// document.querySelectorAll('[data-tilt]').forEach(card => {
//   card.addEventListener('mousemove', e => {
  document.querySelectorAll('[data-tilt]').forEach(card => {
  if (window.innerWidth < 768) return;
  card.addEventListener('mousemove', e => {
    const r   = card.getBoundingClientRect();
    const rx2 =  (e.clientY - r.top  - r.height / 2) / r.height * 10;
    const ry2 = -(e.clientX - r.left - r.width  / 2) / r.width  * 10;
    card.style.transform = `perspective(900px) translateY(-10px) rotateX(${rx2}deg) rotateY(${ry2}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* ═══ HORIZONTAL PROJECT DRAG SCROLL ═══ */
const ps = document.getElementById('projScroll');
if (ps) {
  let dragging = false, startX = 0, scrollL = 0;
  ps.addEventListener('mousedown',  e  => { dragging = true; startX = e.pageX - ps.offsetLeft; scrollL = ps.scrollLeft; ps.classList.add('dragging'); });
  ps.addEventListener('mousemove',  e  => { if (!dragging) return; e.preventDefault(); ps.scrollLeft = scrollL - (e.pageX - ps.offsetLeft - startX) * 1.2; });
  ['mouseup','mouseleave'].forEach(ev => ps.addEventListener(ev, () => { dragging = false; ps.classList.remove('dragging'); }));
}

/* ═══ COUNTER ANIMATION ═══ */
function animCount(el, target) {
  const hasPls = el.textContent.includes('+');
  let s = 0;
  const iv = setInterval(() => {
    s = Math.min(s + 1, target);
    el.textContent = s + (hasPls && s >= target ? '+' : '');
    if (s >= target) clearInterval(iv);
  }, 1600 / target);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(x => {
    if (x.isIntersecting) {
      x.target.querySelectorAll('[data-target]').forEach(el => {
        const v = parseInt(el.dataset.target);
        if (!isNaN(v)) animCount(el, v);
      });
      counterObserver.unobserve(x.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.hstats,.atiles').forEach(el => counterObserver.observe(el));

/* ═══ TEXT SCRAMBLE EFFECT ═══ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';

function scramble(el, finalText, duration = 1200) {
  const frames = Math.floor(duration / 40);
  let f = 0;
  const iv = setInterval(() => {
    const progress = f / frames;
    el.textContent = finalText.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      if (i / finalText.length < progress) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    f++;
    if (f >= frames) { el.textContent = finalText; clearInterval(iv); }
  }, 40);
}

function initScramble() {
  const so = new IntersectionObserver(entries => {
    entries.forEach(x => {
      if (x.isIntersecting) {
        const final = x.target.dataset.scramble;
        if (final) scramble(x.target, final);
        so.unobserve(x.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-scramble]').forEach(el => so.observe(el));
}

/* ═══ SPLIT TEXT HERO ANIMATION ═══
   EDIT: Change line1/line2 to your name  */
function splitText() {
  const line1 = 'SOYAM', line2 = 'KAPOOR.';

  function render(id, text, baseDelay, isGrad) {
    const el = document.getElementById(id);
    if (!el) return;
    text.split('').forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'split-char' + (isGrad ? ' grd' : '');
      s.textContent = ch === ' ' ? '\u00a0' : ch;
      s.style.transitionDelay = (baseDelay + i * 0.055) + 's';
      el.appendChild(s);
      setTimeout(() => s.classList.add('on'), (baseDelay + i * 0.055) * 1000);
    });
  }
  render('hl1', line1, 0.1,  false);
  render('hl2', line2, 0.55, true);
}

/* ═══ TYPING EFFECT ═══
   EDIT: Change roles[] to your own titles */
function startTyping() {
  const roles = [
    'Aspiring Data Scientist',
    'Python Developer',
    'Passionate About Building Tech Solutions',
    'Final Year Computer Systems Enigineering Student',
    /* Add or remove roles here */
  ];
  let ri = 0, ci = 0, del = false;
  const tel = document.getElementById('tel');
  if (!tel) return;

  function type() {
    const w = roles[ri];
    tel.textContent = del ? w.slice(0, --ci) : w.slice(0, ++ci);
    if (!del && ci === w.length)    { del = true; setTimeout(type, 2100); return; }
    if (del  && ci === 0)           { del = false; ri = (ri + 1) % roles.length; }
    setTimeout(type, del ? 48 : 88);
  }
  type();
}

/* Export for use in main.js */
window.animCount = animCount;
window._portfolio = { splitText, startTyping, initScramble };