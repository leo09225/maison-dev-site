/* Maison Dev — site v3 (3D, scroll-driven)
   Build: NODE_PATH=<node_modules> esbuild src/app.js --bundle --minify --format=iife --target=es2019 --outfile=js/app.js */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import Lenis from 'lenis';

/* ---------------- utils ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const lum = c => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
const cdist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const wait = ms => new Promise(r => setTimeout(r, ms));

const QS = new URLSearchParams(location.search);
const TEST = QS.has('test');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const NOANIM = document.documentElement.classList.contains('no-anim');
let vw = innerWidth, vh = innerHeight;

const COL = {
  ink: hex('#0B0B10'), ivory: hex('#F2EDE4'), orange: hex('#FF5A1F'),
  indigo: hex('#15123A'), klein: hex('#2230FF')
};
const STEP_COL = [COL.indigo, COL.klein, COL.ivory, COL.orange, COL.ink];

/* ---------------- i18n ---------------- */
const EN = {
  'see-short': 'View', nav0: 'Process', nav6: 'Work', nav1: 'Services', nav5: 'Pricing', nav3: 'FAQ', navcta: 'My free mockup',
  eyebrow: 'Web studio · Lyon — Stockholm',
  h1: 'Websites people <em>remember</em>.',
  lead: 'Maison Dev designs fast, elegant, living websites for businesses. You see the mockup before you pay anything.',
  cta1: 'Get my free mockup', cta2: 'See how we build ↓',
  f1u: 'days', f1b: 'to go live', f2b: 'load time', f3b: 'mobile-ready', scroll: 'SCROLL',
  g1a: 'Fast', g1b: 'Tailor-made', g1c: 'Mobile', g1d: 'Fast',
  g2a: 'Found on Google', g2b: 'Unforgettable', g2c: 'Found on Google',
  stmt: "Your website is often the first thing customers see of you. Let's make it <em>memorable</em>.",
  bw0: 'Structure', bw1: 'Design', bw2: 'Content', bw3: 'Motion', bw4: 'Live',
  bk: 'How we build your website',
  b1h: 'Structure', b1p: 'We lay the foundations: the sections that bring in customers, in the right order.',
  b2h: 'Design', b2p: 'Your colours, your fonts, your mood. A site that feels like you, not a template.',
  b3h: 'Content', b3p: 'Copy that makes people act, your photos, clear information: hours, prices, contact.',
  b4h: 'Motion', b4p: 'Buttons that react, smooth transitions: the detail that makes the difference.',
  b5h: 'Live', b5p: 'Fast, secure, perfect on mobile. And found on Google.',
  live1: 'Live', live2: 'Google Lighthouse score',
  'e-h': "On launch day, it's <em>live</em>.",
  'e-p': "On your own domain, with https, ready to share. Step inside, we're open.",
  'ba-h': 'Picture <em>your</em> website, tomorrow.',
  'ba-p': "Drag the slider: on the left, a bakery's website today. On the right, the same site rebuilt by Maison Dev. That's what you get, for free, with your mockup.",
  'ba-before': 'Before', 'ba-after': 'After', 'ba-note': 'Fictional example · every mockup is designed for your business.',
  'b-o1': '*** Welcome to our website !!! ***', 'b-o2': 'Home', 'b-o3': 'Our products', 'b-o4': 'Opening hours', 'b-o5': 'Contact', 'b-o6': 'Links',
  'b-o7': 'Welcome to Martin Bakery',
  'b-o8': 'We are a traditional bakery. Click the links on the left to discover our products. Site under construction, thank you for your understanding.',
  'b-o9': 'You are visitor no. 004127 · Last updated: 2014',
  'b-n1': 'Bread · Pastries · Hours', 'b-n2': 'Order', 'b-n3': 'ARTISAN BAKERY · SINCE 1987',
  'b-n4': 'The neighbourhood bread, <em>warm from 6 am</em>.', 'b-n5': 'Natural sourdough, local flour, home-made pastries.',
  'b-n6': 'Order for tomorrow', 'b-n7': '4.9 · 212 Google reviews', 'b-n8': 'Open', 'b-n9': 'until 7:30 pm',
  'w-k': 'Work', 'w-h': 'Websites <em>crafted</em> down to the last detail.',
  'w-note': 'Saison and Atelier Delorme are examples imagined by Maison Dev. Maison Motion is a real, live website.',
  'sv-k': 'Services', 'sv-h': 'What we <em>build</em> for you.',
  'sv-p': 'A website designed for one thing: turning your visitors into customers. We handle everything, from mockup to launch.',
  sv1h: 'Business website', sv1p: 'For shops, trades, practices and freelancers: present your business, build trust and get found on Google.',
  sv2h: 'Landing page', sv2p: 'A single page to launch a product, an offer or an event, and turn every visit into a lead.',
  sv3h: 'Redesign', sv3p: "Your site already exists but it's slow, dated or unreadable on phones? We rebuild it with your content.",
  sv4h: 'Care plan', sv4p: 'Hosting, security, backups and small changes. One email is enough, we handle the rest.',
  'sv-from': 'From <em>€329 excl. VAT</em>, fixed price agreed before we start.', 'sv-link': 'See pricing →',
  'm-k': 'Process', 'm-h': 'Simple, <em>start to finish</em>.', 'm-p': 'Nothing technical for you to handle. We do everything, you approve.',
  s1h: 'Free mockup', s1p: 'Within 48 h you get a mockup of your future homepage. Free, no commitment.',
  s2h: 'Approval', s2p: 'We fine-tune texts, colours and photos with you. Two rounds of changes included.',
  s3h: 'Launch', s3p: 'Your site goes live on your own domain, fast and secure (https).',
  s4h: 'We stay around', s4p: 'A change, a new photo, a new offer? One email is enough.',
  'q-k': 'FAQ', 'q-h': 'Frequently asked <em>questions</em>.',
  q1: 'How long does it take?', q1a: 'The mockup arrives within 48 h. The full site is live 5 to 7 days after you approve it.',
  q2: 'I have no texts or photos, is that a problem?', q2a: 'Not at all. We write the texts with you after a short chat, and use your photos or quality royalty-free images.',
  q3: 'Can I edit my site myself?', q3a: "Yes, if you want to. Otherwise, with the €15/month care plan, just send an email and it's done.",
  q4: 'Are the domain and hosting included?', q4a: 'Yes, for the first year. After that, the €15/month care plan covers hosting, or you can move everything to your own host.',
  q5: 'How does payment work?', q5a: '50% when you approve the mockup, 50% at launch. The mockup itself is free.',
  q6: 'Do animations slow the site down?', q6a: "No. Every effect is tailored to your business and optimised to load fast, even on an old phone. A joiner doesn't need the same thing as a fashion brand: we choose together.",
  'c-k': 'Contact', 'c-h': 'Your mockup, <em>on us</em>.',
  'c-p': "Send us your company name and your current website if you have one. You'll get a mockup of your future homepage within 48 h.",
  'c-cta': 'Request my mockup', sister: 'Sister studio of', legal: 'Legal notice'
};
const FR = {};
$$('[data-i]').forEach(e => { const k = e.dataset.i; if (!(k in FR)) FR[k] = e.hasAttribute('data-html') ? e.innerHTML : e.textContent; });
let LANG = 'fr';

function splitEl(el) {
  const walk = node => {
    const f = document.createDocumentFragment();
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { f.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = tok; w.appendChild(s); f.appendChild(w);
        });
      } else if (n.nodeName === 'EM') { const em = document.createElement('em'); em.appendChild(walk(n)); f.appendChild(em); }
      else f.appendChild(n.cloneNode(true));
    });
    return f;
  };
  const fr = walk(el); el.innerHTML = ''; el.appendChild(fr);
  el.querySelectorAll('.w>span').forEach((s, i) => { s.style.transitionDelay = (i * 0.045) + 's'; });
}
const splitAll = () => $$('.split').forEach(splitEl);

function setLang(l, init) {
  LANG = l;
  const D = l === 'en' ? EN : FR;
  document.documentElement.lang = l;
  $$('[data-i]').forEach(e => {
    const v = D[e.dataset.i]; if (v == null) return;
    if (e.hasAttribute('data-html')) e.innerHTML = v; else e.textContent = v;
  });
  $('#b-fr').setAttribute('aria-pressed', l === 'fr');
  $('#b-en').setAttribute('aria-pressed', l === 'en');
  $('#mailbtn').href = 'mailto:contact@maison-dev.com?subject=' + encodeURIComponent(l === 'en' ? 'My free mockup' : 'Ma maquette gratuite');
  document.title = l === 'en' ? 'Maison Dev — Websites people remember' : "Maison Dev — Des sites qu'on n'oublie pas";
  try { localStorage.setItem('lang', l); } catch (e) { /* ignore */ }
  splitAll();
  if (!init) { $$('.split').forEach(e => e.classList.add('in')); measure(); setCaption(capIdx, true); }
}

/* ---------------- layout metrics ---------------- */
const secEls = $$('main > section, main > footer');
let S = [];          // [{el,id,top,h,pin,bg}]
const byId = {};
let docH = 1;
function measure() {
  vw = innerWidth; vh = innerHeight;
  S = secEls.map(el => {
    const r = el.getBoundingClientRect();
    const o = { el, id: el.id, top: r.top + scrollY, h: r.height, pin: el.classList.contains('pin'), bg: el.dataset.bg ? hex(el.dataset.bg) : null };
    byId[o.id] = o; return o;
  });
  docH = document.documentElement.scrollHeight;
  measureGiants();
}
const pinProg = (o, y) => clamp((y - o.top) / Math.max(1, o.h - vh));
const anchorPx = (o, y) => { const end = o.top + o.h - vh; return y < o.top ? o.top - y : y > end ? end - y : 0; };

/* ---------------- scroll state helpers ---------------- */
function manifesteP(y) { return pinProg(byId.manifeste, y); }
function constrQ(y) { return pinProg(byId.construction, y); }
const BUILD = 0.6; // share of the construction pin used by the 5 build steps
function buildState(q) {
  const b = clamp(q / BUILD), e = clamp((q - BUILD) / (1 - BUILD));
  return { b, e, stepf: b * 5 };
}

function colorFor(o, y) {
  if (o.id === 'manifeste') {
    const p = manifesteP(y);
    let c = mixc(COL.ink, COL.orange, sstep(0.06, 0.3, p));
    return mixc(c, STEP_COL[0], sstep(0.8, 1, p));
  }
  if (o.id === 'construction') {
    const q = constrQ(y), { e, stepf } = buildState(q);
    if (q < BUILD) {
      const i = Math.min(4, Math.floor(stepf)), f = stepf - i;
      return i >= 4 ? STEP_COL[4] : mixc(STEP_COL[i], STEP_COL[i + 1], sstep(0.72, 1, f));
    }
    return mixc(COL.ink, COL.ivory, sstep(0.9, 0.985, e));
  }
  if (o.id === 'realisations') return COL.ink;
  return o.bg || COL.ink;
}
function bgAt(y) {
  const c = y + vh * 0.5, band = vh * 0.2;
  let i = S.findIndex(o => c >= o.top && c < o.top + o.h);
  if (i < 0) i = c < 0 ? 0 : S.length - 1;
  const o = S[i]; let col = colorFor(o, y);
  if (i > 0 && c - o.top < band) col = mixc(colorFor(S[i - 1], y), col, sstep(-band, band, c - o.top));
  if (i < S.length - 1 && o.top + o.h - c < band) col = mixc(col, colorFor(S[i + 1], y), sstep(-band, band, c - (o.top + o.h)));
  return col;
}

/* ---------------- DOM refs ---------------- */
const body = document.body;
const elProg = $('#prog'), elNav = $('#nav'), elFlash = $('#flash'), elGlow = $('#glow');
const g1 = $('#g1'), g2 = $('#g2');
let g1w = 0, g2w = 0;
function measureGiants() { g1w = g1.scrollWidth; g2w = g2.scrollWidth; }
const stps = $$('.stp'), bwords = $$('.bword'), dots = $$('.dots i');
const elLive = $('#live'), elEtxt = $('#etxt'), elConstrSticky = $('#construction .sticky');
const mfill = $('#mfill'), mline = $('#mline'), contactH2 = $('#contact h2');

/* ---------------- phones data / caption ---------------- */
const PH = [
  { img: 'img/phone-saison.jpg', t: { fr: 'Saison', en: 'Saison' }, m: { fr: 'Restaurant · Lyon · exemple', en: 'Restaurant · Lyon · example' }, href: 'exemples/restaurant/', l: { fr: 'Voir le site', en: 'View the site' } },
  { img: 'img/phone-delorme.jpg', t: { fr: 'Atelier Delorme', en: 'Atelier Delorme' }, m: { fr: 'Menuiserie · Annecy · exemple', en: 'Joinery · Annecy · example' }, href: 'exemples/menuiserie/', l: { fr: 'Voir le site', en: 'View the site' } },
  { img: 'img/phone-motion.jpg', t: { fr: 'Maison Motion', en: 'Maison Motion' }, m: { fr: 'Studio vidéo · site bilingue · en ligne', en: 'Video studio · bilingual site · live' }, href: 'https://maison-motion.fr', ext: true, l: { fr: 'Voir le site', en: 'View the site' } },
  { img: null, t: { fr: 'Votre site ?', en: 'Your website?' }, m: { fr: 'Maquette offerte en 48 h', en: 'Free mockup within 48 h' }, href: '#contact', l: { fr: 'Demander ma maquette', en: 'Get my mockup' } }
];
let capIdx = 0;
const capT = $('#capt'), capI = $('#cap-i'), capH = $('#cap-h'), capM = $('#cap-m'), capA = $('#cap-a'), capL = $('#cap-l');
function fillCaption(i) {
  const d = PH[i];
  capI.textContent = String(i + 1).padStart(2, '0');
  capH.textContent = d.t[LANG]; capM.textContent = d.m[LANG]; capL.textContent = d.l[LANG];
  capA.setAttribute('href', d.href);
  if (d.ext) { capA.target = '_blank'; capA.rel = 'noopener'; } else { capA.removeAttribute('target'); }
}
let capTimer = 0;
function setCaption(i, force) {
  if (i === capIdx && !force) return;
  capIdx = i;
  if (force) { fillCaption(i); return; }
  capT.classList.add('swap'); clearTimeout(capTimer);
  capTimer = setTimeout(() => { fillCaption(capIdx); capT.classList.remove('swap'); }, 260);
}
function openLink(href, ext) {
  if (ext) { window.open(href, '_blank', 'noopener'); return; }
  if (href.startsWith('#')) { scrollToTarget(href); return; }
  $('#curtain').classList.add('cover'); setTimeout(() => { location.href = href; }, 560);
}

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!RM && !TEST) {
  try { lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, autoRaf: false }); } catch (e) { lenis = null; }
}
function scrollToTarget(h) {
  const t = h === '#top' ? 0 : $(h);
  if (t == null) return;
  if (lenis) lenis.scrollTo(t, { duration: 1.8 });
  else if (t === 0) scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
  else t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  if (a.id === 'cap-a') return;
  e.preventDefault(); scrollToTarget(a.getAttribute('href'));
}));
capA.addEventListener('click', e => { e.preventDefault(); const d = PH[capIdx]; openLink(d.href, d.ext); });
$$('a[data-page]').forEach(a => a.addEventListener('click', e => {
  if (a.id === 'cap-a' || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault(); openLink(a.getAttribute('href'));
}));
addEventListener('pageshow', () => $('#curtain').classList.remove('cover'));

/* ---------------- small interactions ---------------- */
let mx = 0, my = 0, tmx = 0, tmy = 0, px = -100, py = -100;
addEventListener('pointermove', e => { tmx = (e.clientX / vw) * 2 - 1; tmy = (e.clientY / vh) * 2 - 1; px = e.clientX; py = e.clientY; });
const cursor = $('#cursor');
let cx = -100, cy = -100, cursorBig = false;
if (FINE && !RM) {
  addEventListener('pointermove', () => cursor.classList.add('on'), { once: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('on'));
  document.addEventListener('mouseenter', () => cursor.classList.add('on'));
  $$('.magnet').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
  $$('.card').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
} else cursor.style.display = 'none';

$$('.q button').forEach(b => b.addEventListener('click', () => {
  const q = b.parentNode, open = !q.classList.contains('open');
  q.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
}));

const ba = $('#ba'), baIn = $('#ba input');
let baTouched = false;
baIn.addEventListener('input', () => { baTouched = true; ba.style.setProperty('--x', baIn.value + '%'); });
function sweepBA() {
  if (RM || baTouched) return;
  const t0 = performance.now();
  const f = t => {
    if (baTouched) return;
    const u = (t - t0) / 2800;
    if (u > 1) { ba.style.setProperty('--x', '50%'); baIn.value = 50; return; }
    const x = 50 + 36 * Math.sin(u * Math.PI * 2) * (1 - u * 0.35);
    ba.style.setProperty('--x', x + '%'); baIn.value = x; requestAnimationFrame(f);
  };
  setTimeout(() => requestAnimationFrame(f), 350);
}

/* reveals */
const heroEls = $$('.hero .rv, .hero .split');
const io = new IntersectionObserver(es => es.forEach(x => {
  if (!x.isIntersecting) return;
  x.target.classList.add('in'); io.unobserve(x.target);
  if (x.target.id === 'ba') sweepBA();
}), { threshold: 0.18 });
function observeReveals() { $$('.rv, .split').forEach(el => { if (!heroEls.includes(el) && !el.classList.contains('in')) io.observe(el); }); }

/* ======================================================================
   3D
   ====================================================================== */
let G = null; // three state

const TW = 1280, TH = 800;
const SERIF = '"Instrument Serif", Georgia, serif', SANS = 'Inter, system-ui, sans-serif';
function canvas2d(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }

/* --- website layers (a fictional bistro, "Saison") --- */
function drawStructure(ctx) {
  ctx.clearRect(0, 0, TW, TH);
  rr(ctx, 4, 4, TW - 8, TH - 8, 34); ctx.fillStyle = 'rgba(150,160,255,0.10)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(205,210,255,0.85)'; ctx.stroke();
  ctx.save(); rr(ctx, 4, 4, TW - 8, TH - 8, 34); ctx.clip();
  const cw = (TW - 168 - 11 * 20) / 12;
  ctx.fillStyle = 'rgba(255,90,31,0.10)';
  for (let i = 0; i < 12; i++) ctx.fillRect(84 + i * (cw + 20), 0, cw, TH);
  ctx.setLineDash([14, 10]); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(238,240,255,0.92)';
  ctx.font = `600 17px ${SANS}`; ctx.fillStyle = 'rgba(238,240,255,0.95)';
  const box = (x, y, w, h, label, cross) => {
    ctx.strokeRect(x, y, w, h);
    if (cross) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h); ctx.moveTo(x + w, y); ctx.lineTo(x, y + h); ctx.stroke(); }
    ctx.fillText(label, x + 14, y + 28);
  };
  box(84, 66, 1112, 52, 'NAV');
  box(84, 150, 560, 290, 'ACCROCHE');
  box(84, 516, 300, 66, 'BOUTON');
  box(700, 110, 496, 450, 'IMAGE', true);
  box(84, 600, 346, 160, 'MENU');
  box(466, 600, 346, 160, 'PRODUCTEURS');
  box(848, 600, 346, 160, 'AVIS');
  ctx.restore();
}
function drawDesign(ctx) {
  ctx.clearRect(0, 0, TW, TH);
  ctx.save(); rr(ctx, 0, 0, TW, TH, 34); ctx.clip();
  ctx.fillStyle = '#F6EFE3'; ctx.fillRect(0, 0, TW, TH);
  ctx.fillStyle = '#E8DFD0'; ctx.fillRect(0, 0, TW, 56);
  [['#FF6159', 34], ['#FFBD2E', 58], ['#28C941', 82]].forEach(([c, x]) => { ctx.fillStyle = c; circle(ctx, x, 28, 8); ctx.fill(); });
  rr(ctx, 470, 13, 340, 30, 15); ctx.fillStyle = '#F6EFE3'; ctx.fill();
  ctx.fillStyle = '#7A6E5E'; ctx.font = `500 15px ${SANS}`; ctx.textAlign = 'center'; ctx.fillText('votre-entreprise.fr', 640, 33); ctx.textAlign = 'left';
  ctx.fillStyle = '#1F3A2E'; circle(ctx, 100, 92, 14); ctx.fill();
  ctx.fillStyle = '#E9A03B'; ctx.beginPath(); ctx.moveTo(100, 82); ctx.quadraticCurveTo(110, 92, 100, 103); ctx.quadraticCurveTo(90, 92, 100, 82); ctx.fill();
  const g = ctx.createRadialGradient(880, 250, 30, 940, 330, 240);
  g.addColorStop(0, '#F6C978'); g.addColorStop(0.55, '#E9A03B'); g.addColorStop(1, '#D98A24');
  ctx.fillStyle = g; circle(ctx, 950, 335, 225); ctx.fill();
  rr(ctx, 84, 516, 300, 66, 33); ctx.fillStyle = '#E9A03B'; ctx.fill();
  rr(ctx, 84, 600, 346, 160, 24); ctx.fillStyle = '#1F3A2E'; ctx.fill();
  [466, 848].forEach(x => { rr(ctx, x, 600, 346, 160, 24); ctx.fillStyle = '#FFF9EF'; ctx.fill(); ctx.strokeStyle = 'rgba(27,26,23,.10)'; ctx.lineWidth = 2; ctx.stroke(); });
  ctx.fillStyle = '#E9A03B'; circle(ctx, 390, 760, 70); ctx.fill();
  ctx.restore();
}
function drawContent(ctx) {
  ctx.clearRect(0, 0, TW, TH);
  ctx.fillStyle = '#1B1A17'; ctx.font = `400 38px ${SERIF}`; ctx.fillText('Saison', 126, 105);
  ctx.font = `500 18px ${SANS}`; ctx.fillStyle = '#62594C';
  [['La carte', 820], ['Le lieu', 930], ['Producteurs', 1030]].forEach(([t, x]) => ctx.fillText(t, x, 99));
  ctx.fillStyle = '#D2553A'; ctx.font = `600 15px ${SANS}`; ctx.fillText('BISTROT DE SAISON  ·  LYON', 86, 186);
  ctx.fillStyle = '#1B1A17'; ctx.font = `400 84px ${SERIF}`;
  ctx.fillText('Une cuisine', 82, 268);
  ctx.fillStyle = '#D2553A'; ctx.font = `italic 400 84px ${SERIF}`; ctx.fillText('de saison,', 82, 348);
  ctx.fillStyle = '#1B1A17'; ctx.font = `400 84px ${SERIF}`; ctx.fillText('au cœur de Lyon.', 82, 428);
  ctx.fillStyle = '#62594C'; ctx.font = `400 21px ${SANS}`;
  ctx.fillText('Produits du marché, carte courte qui change', 86, 474);
  ctx.fillText('chaque semaine et vins de petits vignerons.', 86, 503);
  ctx.fillStyle = '#1B1A17'; ctx.font = `600 20px ${SANS}`; ctx.textAlign = 'center'; ctx.fillText('Réserver une table  →', 234, 556); ctx.textAlign = 'left';
  // plate
  ctx.save(); ctx.shadowColor = 'rgba(90,45,10,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#FFFDF8'; circle(ctx, 950, 335, 168); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#E6D9C3'; ctx.lineWidth = 4; circle(ctx, 950, 335, 128); ctx.stroke();
  ctx.save(); ctx.translate(950, 335);
  ctx.fillStyle = '#E98A2E'; ctx.beginPath(); ctx.ellipse(-12, -12, 82, 48, -0.35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F7B565'; ctx.beginPath(); ctx.ellipse(-30, -26, 46, 12, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#D9732A'; ctx.beginPath(); ctx.ellipse(18, 52, 62, 34, 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2E5A3A';
  [[-60, -58, -0.6], [52, -66, 0.4], [78, 30, -0.9], [-70, 46, 0.3]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, 28, 11, r, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#8B5A2B';
  [[-40, 20], [10, -36], [44, 6], [-8, 70], [60, 70]].forEach(([x, y]) => { circle(ctx, x, y, 7); ctx.fill(); });
  ctx.restore();
  // cards
  ctx.fillStyle = '#FFF9EF'; ctx.font = `400 36px ${SERIF}`; ctx.fillText('Le menu du midi', 116, 662);
  ctx.fillStyle = 'rgba(255,249,239,.7)'; ctx.font = `400 16px ${SANS}`; ctx.fillText('Entrée · plat · dessert', 118, 692);
  ctx.fillStyle = '#E9A03B'; ctx.font = `400 50px ${SERIF}`; ctx.fillText('24 €', 116, 744);
  ctx.fillStyle = '#1B1A17'; ctx.font = `400 34px ${SERIF}`; ctx.fillText('Nos producteurs', 498, 662);
  ctx.fillStyle = '#62594C'; ctx.font = `400 16px ${SANS}`; ctx.fillText('Tous à moins de 80 km', 500, 692);
  [['#FBE3C2', 518], ['#E4EDD8', 566], ['#F6DCD5', 614], ['#EEE4D2', 662]].forEach(([c, x]) => { ctx.fillStyle = c; circle(ctx, x, 728, 18); ctx.fill(); });
  ctx.fillStyle = '#E9A03B'; ctx.font = `400 24px ${SANS}`; ctx.fillText('★★★★★', 880, 652);
  ctx.fillStyle = '#1B1A17'; ctx.font = `400 44px ${SERIF}`; ctx.fillText('4,8 sur 5', 878, 706);
  ctx.fillStyle = '#62594C'; ctx.font = `400 16px ${SANS}`; ctx.fillText('386 avis Google', 880, 738);
}
function drawCursor(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(16, 41); ctx.lineTo(22, 38); ctx.lineTo(15, 23); ctx.lineTo(27, 23); ctx.closePath();
  ctx.fillStyle = '#0B0B10'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
}
function drawAnim(ctx, full) {
  ctx.clearRect(0, 0, TW, TH);
  ctx.save(); ctx.shadowColor = 'rgba(233,160,59,.95)'; ctx.shadowBlur = 34;
  rr(ctx, 78, 510, 312, 78, 39); ctx.strokeStyle = 'rgba(255,170,70,.95)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
  drawCursor(ctx, 350, 552, 1.15);
  // badge
  ctx.fillStyle = '#FFF9EF'; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 24; circle(ctx, 1130, 150, 66); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#1F3A2E'; circle(ctx, 1130, 150, 34); ctx.fill();
  ctx.fillStyle = '#FFF9EF'; ctx.font = `400 26px ${SERIF}`; ctx.textAlign = 'center'; ctx.fillText('24 €', 1130, 159);
  ctx.fillStyle = '#1F3A2E'; ctx.font = `600 11px ${SANS}`;
  const txt = 'MENU DU MIDI · ENTRÉE PLAT DESSERT · ';
  for (let i = 0; i < txt.length; i++) {
    const a = (i / txt.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save(); ctx.translate(1130 + Math.cos(a) * 51, 150 + Math.sin(a) * 51); ctx.rotate(a + Math.PI / 2); ctx.fillText(txt[i], 0, 0); ctx.restore();
  }
  ctx.textAlign = 'left';
  if (full) {
    ctx.strokeStyle = 'rgba(255,90,31,.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    [[-2.6, -1.9], [-0.6, 0.1], [1.2, 1.8]].forEach(([a0, a1]) => { ctx.beginPath(); ctx.arc(950, 335, 252, a0, a1); ctx.stroke(); });
    ctx.setLineDash([10, 12]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,90,31,.85)';
    rr(ctx, 458, 592, 362, 176, 28); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#FF5A1F';
    [[660, 140], [1210, 420], [440, 470], [1180, 560]].forEach(([x, y]) => { ctx.fillRect(x - 2, y - 12, 4, 24); ctx.fillRect(x - 12, y - 2, 24, 4); });
    ctx.fillStyle = 'rgba(255,90,31,.9)'; ctx.font = `600 15px ${SANS}`; ctx.fillText('hover', 470, 586);
  }
}
function siteComposite() {
  const [c, ctx] = canvas2d(TW, TH);
  const [a, actx] = canvas2d(TW, TH); drawDesign(actx); ctx.drawImage(a, 0, 0);
  drawContent(actx); ctx.drawImage(a, 0, 0);
  drawAnim(actx, false); ctx.drawImage(a, 0, 0);
  return c;
}
function shadowCanvas() {
  const [c, ctx] = canvas2d(320, 200);
  ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 36; ctx.shadowOffsetX = 1000;
  rr(ctx, 40 - 1000, 36, 240, 128, 14); ctx.fill();
  return c;
}
function keyboardCanvas() {
  const [c, ctx] = canvas2d(1024, 420);
  ctx.fillStyle = '#121317'; rr(ctx, 0, 0, 1024, 420, 18); ctx.fill();
  const rows = 6, kh = 54, gap = 10, top = 16;
  for (let r = 0; r < rows; r++) {
    const n = r === 5 ? 1 : 14; let x = 14;
    const kw = r === 5 ? 0 : (1024 - 28 - gap * (n - 1)) / n;
    if (r === 5) {
      [[96], [96], [116], [404], [116], [96]].forEach(([w]) => { rr(ctx, x, top + r * (kh + gap), w, kh, 8); ctx.fillStyle = '#22242a'; ctx.fill(); x += w + gap; });
      continue;
    }
    for (let k = 0; k < n; k++) { rr(ctx, x, top + r * (kh + gap), kw, r === 0 ? kh * 0.6 : kh, 8); ctx.fillStyle = '#22242a'; ctx.fill(); x += kw + gap; }
  }
  return c;
}
function logoCanvas() {
  const [c, ctx] = canvas2d(512, 512);
  ctx.translate(256 - 100 * 1.6, 256 - 92 * 1.6); ctx.scale(1.6, 1.6);
  ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 18;
  ctx.beginPath(); [[20, 166], [20, 64], [65, 19], [100, 54], [135, 19], [180, 64], [180, 166]].forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 12;
  ctx.beginPath(); [[48, 166], [48, 84], [65, 67], [100, 102], [135, 67], [152, 84], [152, 166]].forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  return c;
}
function roundedImageCanvas(img, w, h, r) {
  const [c, ctx] = canvas2d(w, h);
  ctx.save(); rr(ctx, 0, 0, w, h, r); ctx.clip();
  if (img) ctx.drawImage(img, 0, 0, w, h);
  else {
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#FF5A1F'); g.addColorStop(1, '#FF9A5C');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0B0B10';
    ctx.font = `600 22px ${SANS}`; ctx.fillText('MAISON DEV', 48, 120);
    ctx.font = `400 108px ${SERIF}`; ctx.fillText(LANG === 'en' ? 'Your' : 'Votre', 44, 420);
    ctx.fillText(LANG === 'en' ? 'website,' : 'site,', 44, 520);
    ctx.font = `italic 400 108px ${SERIF}`; ctx.fillText(LANG === 'en' ? 'here.' : 'ici.', 44, 620);
    ctx.font = `400 28px ${SANS}`; ctx.fillStyle = 'rgba(11,11,16,.78)';
    ctx.fillText(LANG === 'en' ? 'Free mockup' : 'Maquette offerte', 48, 720); ctx.fillText(LANG === 'en' ? 'within 48 h.' : 'en 48 h.', 48, 758);
    rr(ctx, 44, 960, w - 88, 96, 48); ctx.fillStyle = '#0B0B10'; ctx.fill();
    ctx.fillStyle = '#F2EDE4'; ctx.font = `600 30px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText(LANG === 'en' ? 'I want mine  →' : 'Je la veux  →', w / 2, 1018); ctx.textAlign = 'left';
  }
  ctx.restore();
  return c;
}
const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

/* --- logo geometry from the brand SVG strokes --- */
function strokeShape(pts, w) {
  const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [-dy / l, dx / l]; };
  const L = [], R = [], h = w / 2;
  for (let i = 0; i < pts.length; i++) {
    let n;
    if (i === 0) n = nrm(pts[0], pts[1]);
    else if (i === pts.length - 1) n = nrm(pts[i - 1], pts[i]);
    else {
      const n0 = nrm(pts[i - 1], pts[i]), n1 = nrm(pts[i], pts[i + 1]);
      let m = [n0[0] + n1[0], n0[1] + n1[1]]; const ml = Math.hypot(m[0], m[1]); m = [m[0] / ml, m[1] / ml];
      const k = 1 / (m[0] * n0[0] + m[1] * n0[1]); n = [m[0] * k, m[1] * k];
    }
    L.push([pts[i][0] + n[0] * h, pts[i][1] + n[1] * h]); R.push([pts[i][0] - n[0] * h, pts[i][1] - n[1] * h]);
  }
  const poly = L.concat(R.reverse());
  const s = new THREE.Shape();
  poly.forEach((q, i) => { const x = (q[0] - 100) / 100, y = -(q[1] - 92) / 100; if (i) s.lineTo(x, y); else s.moveTo(x, y); });
  s.closePath(); return s;
}

function initGL() {
  const canvas = $('#gl');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  if (!renderer || !renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, vw < 760 ? 1.6 : 1.8));
  renderer.setSize(vw, vh, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const FOV = 30, CAMZ = 12;
  const camera = new THREE.PerspectiveCamera(FOV, vw / vh, 0.05, 100);
  camera.position.set(0, 0, CAMZ);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 7); scene.add(key);
  const rim = new THREE.PointLight(0xff5a1f, 40, 40, 2); rim.position.set(-5, 2.5, -2); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };

  /* logo */
  const OUT = [[20, 166], [20, 64], [65, 19], [100, 54], [135, 19], [180, 64], [180, 166]];
  const INN = [[48, 166], [48, 84], [65, 67], [100, 102], [135, 67], [152, 84], [152, 166]];
  const bev = { bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.022, bevelSegments: 4, curveSegments: 1 };
  const gOut = new THREE.ExtrudeGeometry(strokeShape(OUT, 18), { depth: 0.26, ...bev }); gOut.translate(0, 0, -0.13);
  const gIn = new THREE.ExtrudeGeometry(strokeShape(INN, 12), { depth: 0.4, ...bev }); gIn.translate(0, 0, -0.2);
  gOut.computeBoundingBox(); const ctr = new THREE.Vector3(); gOut.boundingBox.getCenter(ctr);
  gOut.translate(-ctr.x, -ctr.y, 0); gIn.translate(-ctr.x, -ctr.y, 0);
  const matIvory = new THREE.MeshPhysicalMaterial({ color: 0xF2EDE4, roughness: 0.2, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06 });
  const matOrange = new THREE.MeshPhysicalMaterial({ color: 0xFF5A1F, roughness: 0.26, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0x4a1000, emissiveIntensity: 0.5 });
  const logo = new THREE.Group();
  logo.add(new THREE.Mesh(gOut, matIvory), new THREE.Mesh(gIn, matOrange));
  scene.add(logo);

  /* website layers */
  const LWd = 4.0, LHt = 2.5;
  const layerDraw = [drawStructure, drawDesign, drawContent, c => drawAnim(c, true)];
  const shadowTex = tex(shadowCanvas());
  const stack = new THREE.Group(); scene.add(stack);
  const layers = layerDraw.map((fn, i) => {
    const [c, ctx] = canvas2d(TW, TH); fn(ctx);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(LWd, LHt), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    m.renderOrder = 10 + i * 2;
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(LWd * 1.25, LHt * 1.35), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.4, toneMapped: false }));
    sh.position.set(0.12, -0.16, -0.02); sh.renderOrder = 9 + i * 2;
    const g = new THREE.Group(); g.add(sh, m); stack.add(g);
    return { g, m, sh, lift: 0 };
  });
  layers[0].sh.visible = false;

  /* laptop */
  const LW = 4.6, LD = 3.05, BT = 0.13, LT = 0.075;
  const alu = new THREE.MeshPhysicalMaterial({ color: 0x3b3f47, metalness: 0.85, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.2 });
  const laptop = new THREE.Group(); scene.add(laptop);
  const base = new THREE.Mesh(new RoundedBoxGeometry(LW, BT, LD, 4, 0.055), alu); base.position.y = -BT / 2; laptop.add(base);
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(LW * 0.88, LW * 0.88 * 420 / 1024), new THREE.MeshStandardMaterial({ map: tex(keyboardCanvas()), roughness: 0.7, metalness: 0.2 }));
  kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.003, -LD * 0.13); laptop.add(kb);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(LW * 0.34, LD * 0.27), new THREE.MeshStandardMaterial({ color: 0x31343b, roughness: 0.45, metalness: 0.6 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.003, LD * 0.3); laptop.add(pad);
  const hinge = new THREE.Group(); hinge.position.set(0, 0, -LD / 2 + 0.05); laptop.add(hinge);
  const lidG = new RoundedBoxGeometry(LW, LD, LT, 4, 0.04); lidG.translate(0, LD / 2, -LT / 2);
  hinge.add(new THREE.Mesh(lidG, alu));
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.1, LD - 0.1), new THREE.MeshBasicMaterial({ color: 0x050507, toneMapped: false }));
  bezel.position.set(0, LD / 2, 0.002); hinge.add(bezel);
  const SW = 4.24, SH = SW / 1.6;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: tex(siteComposite()), toneMapped: false }));
  screen.position.set(0, LD / 2 + 0.06, 0.004); hinge.add(screen);
  const lidLogo = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: tex(logoCanvas()), transparent: true, toneMapped: false }));
  lidLogo.position.set(0, LD / 2, -LT - 0.003); lidLogo.rotation.y = Math.PI; hinge.add(lidLogo);

  /* phones */
  const phones = [];
  const PW = 1.0, PSW = 0.93, PSH = PSW * 1169 / 540, PHH = PSH + 0.15;
  const pBody = new THREE.MeshPhysicalMaterial({ color: 0x24252b, metalness: 0.7, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  const pGeo = new RoundedBoxGeometry(PW, PHH, 0.1, 4, 0.13);
  const phoneGroup = new THREE.Group(); scene.add(phoneGroup);
  PH.forEach((d, i) => {
    const g = new THREE.Group();
    const bodyM = new THREE.Mesh(pGeo, pBody); bodyM.userData.i = i;
    const scrM = new THREE.Mesh(new THREE.PlaneGeometry(PSW, PSH), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }));
    scrM.position.z = 0.052;
    g.add(bodyM, scrM); phoneGroup.add(g);
    phones.push({ g, bodyM, scrM, hov: 0 });
  });
  async function loadPhoneTextures() {
    await Promise.all(PH.map(async (d, i) => {
      const img = d.img ? await loadImg(d.img) : null;
      const t = tex(roundedImageCanvas(img, 540, 1169, 70));
      phones[i].scrM.material.map = t; phones[i].scrM.material.needsUpdate = true;
    }));
  }
  function redrawYourSitePhone() {
    const t = tex(roundedImageCanvas(null, 540, 1169, 70));
    const m = phones[3].scrM.material; if (m.map) m.map.dispose(); m.map = t; m.needsUpdate = true;
  }

  const ray = new THREE.Raycaster();
  const v3 = new THREE.Vector3(), q4 = new THREE.Quaternion(), s3 = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler();
  return { renderer, scene, camera, FOV, CAMZ, logo, matOrange, stack, layers, laptop, hinge, screen, phones, phoneGroup, ray, v3, q4, s3, tmpQ, tmpE, LD, loadPhoneTextures, redrawYourSitePhone };
}

function glResize() {
  if (!G) return;
  G.renderer.setSize(vw, vh, false);
  G.camera.aspect = vw / vh; G.camera.updateProjectionMatrix();
}

/* ---------------- per-frame 3D choreography ---------------- */
let introT0 = null;
const camBase = new THREE.Vector3(), camTarget = new THREE.Vector3(), lookAt = new THREE.Vector3();
const stackPos = new THREE.Vector3(), stackQuat = new THREE.Quaternion();
let hovered = -1;

function updateGL(t, y) {
  const { camera, logo, stack, layers, laptop, hinge, screen, phones, phoneGroup } = G;
  const visH = 2 * G.CAMZ * Math.tan((G.FOV * Math.PI) / 360), visW = visH * (vw / vh), upp = visH / vh;
  const mob = vw < 760;
  camera.position.set(0, 0, G.CAMZ); camera.lookAt(0, 0, 0);

  const bg = bgAt(y);
  const orangeness = clamp(1 - cdist(bg, COL.orange) / 140);
  G.matOrange.color.setRGB(...mixc([255, 90, 31], [11, 11, 16], orangeness).map(v => v / 255)).convertSRGBToLinear();

  /* ---- logo ---- */
  const man = byId.manifeste, con = byId.contact;
  const p = manifesteP(y);
  const aHero = clamp(y / Math.max(1, man.top));
  const lScale = 1.5 * clamp(visW / 8.2, 0.55, 1);
  const intro = introT0 === null ? 0 : easeOut(clamp((performance.now() - introT0) / 1500));
  let lx, ly, lz = 0, ls, ry, rx, vis = true;
  const heroX = mob ? 0 : visW * 0.27, heroY = mob ? visH * 0.27 : 0.05;
  const idleY = Math.sin(t * 1.1) * 0.06;
  if (y < man.top + man.h) {
    const a = easeInOut(aHero);
    lx = lerp(heroX, 0, a); ly = lerp(heroY, mob ? 0.4 : 0.36, a) + idleY;
    ls = lScale * lerp(1, 1.18, a) * (0.25 + 0.75 * intro);
    ry = Math.sin(t * 0.45) * 0.3 * (1 - a) + mx * 0.5 + a * Math.PI + p * Math.PI * 2 + (1 - intro) * Math.PI * 1.5;
    rx = my * 0.25 + Math.sin(t * 0.7) * 0.05;
    ls *= 1 + sstep(0.2, 0.55, p) * 0.12;
    const fly = easeInOut(sstep(0.78, 0.98, p));
    lz = fly * 10.5; rx += fly * 0.9; ly += fly * 0.4;
    vis = p < 0.985;
    G.logoMode = 'top';
  } else {
    // contact: floats above the headline, scrolls with it
    const r = con.top - y; // section top relative to viewport (px)
    const centerPx = contactH2.getBoundingClientRect().top - Math.min(vh * 0.19, 175);
    ly = -(centerPx - vh / 2) * upp; lx = 0;
    ls = lScale * 0.72; ry = Math.sin(t * 0.6) * 0.5 + mx * 0.5; rx = my * 0.2 + 0.08;
    vis = r < vh && r + con.h > 0;
  }
  logo.visible = vis;
  logo.position.set(lx, ly, lz); logo.scale.setScalar(ls); logo.rotation.set(rx, ry, 0);

  /* glow follows the logo */
  let glowO = 0;
  if (vis) {
    const sp = logo.position.clone().project(camera);
    const gx = (sp.x * 0.5) * vw, gy = (-sp.y * 0.5) * vh;
    elGlow.style.transform = `translate(${gx}px,${gy}px) scale(${0.6 + ls * 0.3})`;
    glowO = (1 - orangeness) * (lum(bg) < 0.3 ? 1 : 0) * (1 - sstep(0.7, 0.9, p));
  }
  elGlow.style.opacity = glowO;

  /* ---- construction: layers + laptop ---- */
  const C = byId.construction, q = constrQ(y), { e, stepf } = buildState(q);
  const anchor = -anchorPx(C, y) * upp;
  const inC = y + vh > C.top && y < C.top + C.h;
  stack.visible = false;
  laptop.visible = inC && q < 1 && e > 0;
  if (inC) {
    const k = clamp(visW / 4.8, 0.52, 1);
    const m = easeInOut(sstep(4.05, 4.75, stepf));
    const gap = 0.6 * (1 - m);
    const si = Math.min(4, Math.floor(stepf));
    layers.forEach((L, i) => {
      const a = i === 0 ? 1 : easeOut(sstep(i - 0.3, i + 0.2, stepf));
      const active = (i === si && m < 0.5) ? 1 : 0;
      L.lift += (active - L.lift) * 0.12;
      L.g.position.z = i * gap + (1 - a) * 3.2 + L.lift * 0.22 + i * 0.004;
      L.m.material.opacity = i === 0 ? 1 - m : a;
      L.sh.material.opacity = 0.42 * a * (1 - m);
    });
    // exploded pose -> merged card
    const sx = mob ? 0 : lerp(visW * 0.17, visW * 0.15, m);
    const sy = mob ? lerp(visH * 0.16, visH * 0.17, m) : lerp(-0.25, 0.08, m);
    const sc = k * lerp(1, mob ? 1.12 : 1.16, m);
    G.tmpE.set(lerp(-0.98, 0, m) + my * 0.08 * (1 - m), lerp(-0.2, 0, m) + mx * 0.14 * (1 - m * 0.6) + Math.sin(t * 0.4) * 0.04 * (1 - m), lerp(0.42, 0, m));
    stackQuat.setFromEuler(G.tmpE);
    stackPos.set(sx, sy + anchor + Math.sin(t * 0.8) * 0.04 * (1 - m), 0);
    let stackScale = sc;

    // laptop
    const lk = clamp(visW / 5.6, 0.48, 1);
    const rise = easeOut(sstep(0, 0.16, e));
    const open = easeInOut(sstep(0.12, 0.36, e));
    const dolly = easeInOut(sstep(0.62, 0.985, e));
    laptop.scale.setScalar(lk);
    laptop.position.set(mob ? 0 : visW * 0.13, lerp(-visH, mob ? visH * 0.08 : -0.85, rise) + anchor, 0);
    laptop.rotation.set(lerp(0.36, 0.12, sstep(0.3, 0.7, e)) * (1 - dolly), lerp(lerp(0.6, 0.2, sstep(0, 0.4, e)), 0, dolly) + mx * 0.05 * (1 - dolly), 0);
    hinge.rotation.x = lerp(Math.PI / 2, -0.24, open);
    laptop.updateMatrixWorld(true);

    // fly the merged card into the screen
    const fk = easeInOut(sstep(0.14, 0.38, e));
    if (fk > 0) {
      screen.matrixWorld.decompose(G.v3, G.q4, G.s3);
      stackPos.lerp(G.v3, fk);
      stackQuat.slerp(G.q4, fk);
      stackScale = lerp(stackScale, G.s3.x * (4.24 / 4.0), fk);
    }
    screen.visible = fk >= 0.995;
    stack.visible = inC && fk < 0.995;
    stack.position.copy(stackPos); stack.quaternion.copy(stackQuat); stack.scale.setScalar(stackScale);

    // camera dive into the screen
    if (dolly > 0 && laptop.visible) {
      screen.updateMatrixWorld(true);
      screen.getWorldPosition(G.v3);
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(screen.getWorldQuaternion(G.tmpQ));
      camTarget.copy(G.v3).addScaledVector(n, 1.35 * lk);
      camBase.set(0, 0, G.CAMZ);
      camera.position.lerpVectors(camBase, camTarget, dolly);
      lookAt.set(0, 0, 0).lerp(G.v3, Math.min(1, dolly * 1.6));
      camera.lookAt(lookAt);
    }
  }

  /* ---- réalisations: phone coverflow ---- */
  const R = byId.realisations, r = pinProg(R, y);
  const inR = y + vh > R.top && y < R.top + R.h;
  phoneGroup.visible = inR;
  if (inR) {
    const anchorR = -anchorPx(R, y) * upp;
    const k = mob ? clamp(visW / 3.4, 0.5, 0.9) : clamp(visW / 8.4, 0.75, 1.14);
    const sp = clamp((r - 0.2) / 0.68) * 3;
    setCaption(clamp(Math.round(sp), 0, 3));
    const spacing = mob ? 1.15 : 1.75;
    phones.forEach((P, i) => {
      const a = easeOut(sstep(0.0 + i * 0.04, 0.18 + i * 0.04, r));
      const d = i - sp, w = Math.max(0, 1 - Math.abs(d));
      P.hov += ((hovered === i ? 1 : 0) - P.hov) * 0.15;
      const x = d * spacing * k + (1 - a) * visW * 0.9;
      const yy = (mob ? 0.25 : -0.02) + Math.sin(t * 1.2 + i * 1.3) * 0.05 + P.hov * 0.12 - (1 - a) * 1.2;
      const z = -Math.abs(d) * 0.9 + w * 0.5;
      P.g.position.set(x, yy + anchorR, z);
      P.g.rotation.set(my * 0.06, -d * 0.38 + mx * 0.12 + (1 - a) * 1.4, (1 - a) * 0.35);
      P.g.scale.setScalar(k * (1 + w * 0.12 + P.hov * 0.05));
    });
  }

  G.renderer.render(G.scene, camera);
}

/* hover / click on phones */
function pickPhone(clientX, clientY) {
  if (!G || !G.phoneGroup.visible) return -1;
  const ndc = new THREE.Vector2((clientX / vw) * 2 - 1, -(clientY / vh) * 2 + 1);
  G.ray.setFromCamera(ndc, G.camera);
  const hit = G.ray.intersectObjects(G.phones.map(p => p.bodyM), false)[0];
  return hit ? hit.object.userData.i : -1;
}
const rlSticky = $('#rlsticky');
rlSticky.addEventListener('pointermove', e => { hovered = pickPhone(e.clientX, e.clientY); });
rlSticky.addEventListener('pointerleave', () => { hovered = -1; });
rlSticky.addEventListener('click', e => {
  if (e.target.closest('a')) return;
  const i = pickPhone(e.clientX, e.clientY);
  if (i >= 0) { const d = PH[i]; openLink(d.href, d.ext); }
});

/* ---------------- per-frame DOM ---------------- */
let lastTone = '', lastOr = null, lastStep = -2, lastEcr = null, lastLive = null, lastEt = null;
function updateDOM(y) {
  const bg = bgAt(y);
  body.style.backgroundColor = rgb(bg);
  body.style.setProperty('--bgc', rgb(bg));
  const tone = lum(bg) > 0.42 ? 'light' : 'dark';
  if (tone !== lastTone) { body.dataset.tone = tone; lastTone = tone; }
  const onOr = cdist(bg, COL.orange) < 70;
  if (onOr !== lastOr) { body.classList.toggle('on-orange', onOr); lastOr = onOr; }
  elProg.style.width = (y / Math.max(1, docH - vh)) * 100 + '%';
  elNav.classList.toggle('solid', y > 40);

  // manifeste giant words
  const M = byId.manifeste;
  if (y + vh > M.top && y < M.top + M.h) {
    const p = manifesteP(y);
    g1.style.transform = `translate3d(${lerp(vw * 0.12, -g1w * 0.55, p)}px,0,0)`;
    g2.style.transform = `translate3d(${lerp(-g2w * 0.5, vw * 0.05, p)}px,0,0)`;
  }

  // construction steps
  const C = byId.construction;
  if (y + vh > C.top && y < C.top + C.h) {
    const q = constrQ(y), { e, stepf } = buildState(q);
    const ecr = q >= BUILD - 0.005;
    const si = ecr ? -1 : Math.min(4, Math.floor(stepf));
    if (si !== lastStep) {
      stps.forEach((s, i) => s.classList.toggle('on', i === si));
      bwords.forEach((w, i) => w.classList.toggle('on', i === si));
      dots.forEach((d, i) => d.classList.toggle('on', i <= si));
      lastStep = si;
    }
    if (ecr !== lastEcr) { elConstrSticky.classList.toggle('ecr', ecr); lastEcr = ecr; }
    const live = !ecr && stepf > 4.35;
    if (live !== lastLive) { elLive.classList.toggle('on', live); lastLive = live; }
    const et = ecr && e > 0.34 && e < 0.62;
    if (et !== lastEt) { elEtxt.classList.toggle('on', et); lastEt = et; }
    elFlash.style.opacity = G && q < 1 ? sstep(0.9, 0.985, e) : 0;
  } else elFlash.style.opacity = 0;

  // méthode line
  if (mline) {
    const r = mline.getBoundingClientRect();
    mfill.style.width = clamp((vh * 0.85 - r.top) / (vh * 0.6)) * 100 + '%';
  }
}

/* ---------------- loop ---------------- */
let raf = 0;
function frame(now) {
  if (lenis) lenis.raf(now);
  mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
  const y = window.scrollY;
  updateDOM(y);
  if (G) updateGL(now / 1000, y);
  if (FINE && !RM) {
    cx += (px - cx) * 0.22; cy += (py - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px,${cy}px)`;
    const big = hovered >= 0;
    if (big !== cursorBig) { cursor.classList.toggle('big', big); cursorBig = big; }
  }
  raf = requestAnimationFrame(frame);
}

/* ---------------- resize ---------------- */
let rzT = 0, lastW = vw, lastH = vh;
addEventListener('resize', () => {
  clearTimeout(rzT);
  rzT = setTimeout(() => {
    const w = innerWidth, h = innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 120) { vh = h; measure(); return; } // mobile URL bar
    lastW = w; lastH = h; measure(); glResize();
  }, 120);
});

/* ---------------- boot ---------------- */
async function boot() {
  const t0 = performance.now();
  const pct = $('#pct');
  let shown = 0, target = 8;
  const tick = () => { shown += (target - shown) * 0.12; pct.textContent = Math.round(shown); if (shown < 99.5) requestAnimationFrame(tick); else pct.textContent = 100; };
  if (!NOANIM) requestAnimationFrame(tick);

  // language
  let L = 'fr';
  try { L = localStorage.getItem('lang') || ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en'); } catch (e) { /* ignore */ }
  const ql = QS.get('lang'); if (ql === 'en' || ql === 'fr') L = ql;
  setLang(L, true);
  $('#b-fr').onclick = () => { setLang('fr'); if (G) G.redrawYourSitePhone(); };
  $('#b-en').onclick = () => { setLang('en'); if (G) G.redrawYourSitePhone(); };
  fillCaption(0);

  // fonts (needed for canvas textures)
  try {
    await Promise.race([
      Promise.all(['400 80px "Instrument Serif"', 'italic 400 80px "Instrument Serif"', '400 20px Inter', '500 20px Inter', '600 20px Inter', '800 80px Inter'].map(f => document.fonts.load(f))),
      wait(3000)
    ]);
  } catch (e) { /* ignore */ }
  target = 45;
  measure();

  // WebGL
  try { G = initGL(); } catch (e) { console.warn(e); G = null; }
  if (!G) document.documentElement.classList.add('no-gl');
  else { await Promise.race([G.loadPhoneTextures(), wait(4000)]); }
  target = 100;

  observeReveals();
  raf = requestAnimationFrame(frame);

  const minT = NOANIM ? 0 : 1300;
  const el = performance.now() - t0;
  if (el < minT) await wait(minT - el);
  const loader = $('#loader');
  if (!NOANIM) { loader.classList.add('out'); setTimeout(() => loader.remove(), 1100); } else loader.remove();
  try { sessionStorage.setItem('md-seen', '1'); } catch (e) { /* ignore */ }
  introT0 = performance.now() + (NOANIM ? -1e5 : 250);
  heroEls.forEach((el2, i) => setTimeout(() => el2.classList.add('in'), (NOANIM ? 0 : 380) + i * 90));
  setTimeout(measure, 600);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
window.__md = { get G() { return G; }, measure };
