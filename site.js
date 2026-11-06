/* Maison Dev : scripts du site, sans framework ni étape de build.
   La page défile toujours normalement : les animations sont courtes, déclenchées une seule fois
   à l'arrivée à l'écran (IntersectionObserver) ou par le visiteur, en transform et opacity seulement,
   et coupées si prefers-reduced-motion est activé. Chaque bloc ne s'active que si son élément existe. */
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FR = { 'lf-sending': 'Envoi…', 'lf-ok': 'Merci\u00a0! Vous avez une réponse sous 24\u00a0h, et votre maquette sous 48\u00a0h.', 'lf-err': 'Indiquez votre entreprise et un e-mail ou un téléphone.', 'lf-again': 'Vérifiez vos informations, puis cliquez à nouveau sur le bouton.', 'lf-fail': "Le formulaire n'a pas pu partir\u00a0: votre messagerie s'ouvre avec le message prêt à envoyer.", pause: 'Mettre en pause le défilement des sites', play: 'Relancer le défilement des sites' };
  var t = function (k) { return (window.MD && window.MD.t(k)) || FR[k] || ''; };
  var lang = function () { return window.MD ? window.MD.lang : 'fr'; };
  var once = function (el, threshold, fn) {
    if (!el || !('IntersectionObserver' in window)) { if (el) fn(); return; }
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); } }, { threshold: threshold });
    io.observe(el);
  };
  var below = function (el) { return el.getBoundingClientRect().top > innerHeight * 0.92; };

  /* ---------- en-tête : fond sable après 40 px, menu sur téléphone ---------- */
  var hd = $('#hd');
  if (hd) {
    var ticking = false;
    var onScroll = function () { hd.classList.toggle('scrolled', scrollY > 40); ticking = false; };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    var burger = $('.burger', hd), menu = $('#menu');
    var setMenu = function (open, focusBack) {
      hd.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      if (!open && focusBack) burger.focus();
    };
    if (burger && menu) {
      burger.addEventListener('click', function () { setMenu(!hd.classList.contains('open')); });
      $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('open')) setMenu(false, true); });
      doc.addEventListener('click', function (e) { if (hd.classList.contains('open') && !hd.contains(e.target)) setMenu(false); });
      matchMedia('(min-width: 961px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
    }
  }

  /* ---------- haut de page : les trois repères comptent jusqu'à leur valeur (900 ms) ---------- */
  var facts = $('#facts');
  if (facts && !RM && performance.now() < 2500) {
    var nums = $$('.n', facts);
    nums.forEach(function (n) { n.style.minWidth = n.getBoundingClientRect().width + 'px'; n.textContent = '0'; });
    setTimeout(function () {
      var t0 = performance.now();
      var step = function (now) {
        var u = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - u, 3);
        $$('.n', facts).forEach(function (n) { n.textContent = Math.round(e * +n.getAttribute('data-to')); });
        if (u < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 420);
  }

  /* ---------- haut de page : les captures se succèdent en fondu toutes les 4 s ---------- */
  var stage = $('#stage');
  if (stage) {
    var shots = $$('.screens img', stage), caps = $$('.caps > span', stage), pauseBtn = $('.pause', stage);
    var cur = 0, hovering = false, paused = false, inView = true;
    var labelPause = function () { pauseBtn.setAttribute('aria-label', t(paused ? 'play' : 'pause')); pauseBtn.setAttribute('aria-pressed', paused); };
    if (RM) { pauseBtn.hidden = true; }
    else {
      var show = function (n) {
        shots[cur].classList.remove('on'); caps[cur].classList.remove('on');
        cur = n;
        shots[cur].classList.add('on'); caps[cur].classList.add('on');
      };
      var start = function () {
        shots.forEach(function (im) {
          if (!im.hasAttribute('data-src')) return;
          im.srcset = im.getAttribute('data-srcset'); im.src = im.getAttribute('data-src');
          im.removeAttribute('data-src'); im.removeAttribute('data-srcset');
        });
        setInterval(function () {
          if (hovering || paused || !inView || doc.hidden) return;
          var n = (cur + 1) % shots.length;
          if (shots[n].complete && shots[n].naturalWidth) show(n);
        }, 4000);
      };
      if (doc.readyState === 'complete') setTimeout(start, 600); else addEventListener('load', function () { setTimeout(start, 600); });
      stage.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
      stage.addEventListener('pointerleave', function () { hovering = false; });
      stage.addEventListener('focusin', function () { hovering = true; });
      stage.addEventListener('focusout', function () { hovering = false; });
      pauseBtn.addEventListener('click', function () { paused = !paused; labelPause(); });
      doc.addEventListener('langchange', labelPause);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(stage);
    }
  }

  /* ---------- réalisations ---------- */
  var works = $('#works');
  if (works) {
    var cards = $$('.work', works);
    /* les 4 cartes montent de 24 px en fondu, l'une après l'autre (100 ms d'écart) */
    if (!RM && below(works)) {
      cards.forEach(function (c, k) { c.classList.add('rv-wait'); c.style.setProperty('--rd', k * 100 + 'ms'); });
      once(works, 0.12, function () {
        cards.forEach(function (c) { c.classList.add('rv-in'); });
        setTimeout(function () { cards.forEach(function (c) { c.classList.remove('rv-wait', 'rv-in'); c.style.removeProperty('--rd'); }); }, 1200);
      });
    }
    /* au survol, la capture défile du haut vers le bas de la page (6 s, aller-retour) */
    if (!RM && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      cards.forEach(function (card) {
        var view = $('.view', card), full = $('.full', card), anim = null, back = null;
        if (!view || !full) return;
        var run = function () {
          if (!card.matches(':hover') || anim) return;
          if (back) { back.cancel(); back = null; }
          full.classList.add('ready');
          var dist = full.getBoundingClientRect().height - view.getBoundingClientRect().height;
          if (dist <= 0) return;
          anim = full.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-dist) + 'px)' }], { duration: 6000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' });
        };
        card.addEventListener('pointerenter', function () {
          if (full.hasAttribute('data-src')) { full.src = full.getAttribute('data-src'); full.removeAttribute('data-src'); }
          if (full.complete && full.naturalWidth) run(); else full.addEventListener('load', run, { once: true });
        });
        card.addEventListener('pointerleave', function () {
          if (!anim) { full.classList.remove('ready'); return; }
          var y = new DOMMatrixReadOnly(getComputedStyle(full).transform).m42;
          anim.cancel(); anim = null;
          back = full.animate([{ transform: 'translateY(' + y + 'px)' }, { transform: 'translateY(0)' }], { duration: Math.min(700, 250 + Math.abs(y) / 8), easing: 'ease-out' });
          back.onfinish = function () { back = null; full.classList.remove('ready'); };
        });
      });
    }
    /* téléphone : carrousel à faire glisser, avec des petits points */
    var dots = $$('#dots button');
    if (dots.length && 'IntersectionObserver' in window) {
      var setDot = function (k) { dots.forEach(function (d, j) { d.setAttribute('aria-current', j === k); }); };
      var dio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setDot(cards.indexOf(e.target)); });
      }, { root: works, threshold: 0.6 });
      cards.forEach(function (c) { dio.observe(c); });
      dots.forEach(function (d, k) {
        d.addEventListener('click', function () {
          var pad = parseFloat(getComputedStyle(works).paddingLeft) || 0;
          var x = cards[k].getBoundingClientRect().left - works.getBoundingClientRect().left + works.scrollLeft - pad;
          works.scrollTo({ left: x, behavior: RM ? 'auto' : 'smooth' });
        });
      });
    }
  }

  /* ---------- avant / après : curseur à faire glisser ---------- */
  var ba = $('#ba');
  if (ba) {
    var range = $('input', ba), touchedBA = false;
    var setX = function (v) { ba.style.setProperty('--x', v + '%'); };
    range.addEventListener('input', function () { touchedBA = true; setX(range.value); });
    /* à l'arrivée à l'écran, la poignée fait une fois 50 % → 62 % → 50 % (1,2 s) */
    if (!RM) once(ba, 0.55, function () {
      setTimeout(function () {
        if (touchedBA) return;
        var t0 = performance.now();
        var f = function (now) {
          if (touchedBA) return;
          var u = Math.min(1, (now - t0) / 1200), x = 50 + 12 * Math.sin(u * Math.PI);
          setX(u < 1 ? x : 50); range.value = Math.round(u < 1 ? x : 50);
          if (u < 1) requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      }, 250);
    });
  }

  /* ---------- méthode : le trait se dessine, chaque numéro s'allume quand il l'atteint ---------- */
  var steps = $('#steps');
  if (steps && !RM && below(steps)) {
    var horiz = matchMedia('(min-width: 1024px)');
    var place = function () {
      var r = steps.getBoundingClientRect();
      $$('.step', steps).forEach(function (s) {
        var d = $('.dot', s).getBoundingClientRect(), p;
        if (horiz.matches) p = (d.left + d.width / 2 - r.left) / r.width;
        else p = (d.top + d.height / 2 - r.top - 22) / Math.max(1, r.height - 22);
        s.style.setProperty('--d', Math.round(Math.max(0, Math.min(1, p)) * 1200) + 'ms');
      });
    };
    steps.classList.add('anim');
    once(steps, 0.35, function () { place(); requestAnimationFrame(function () { steps.classList.add('drawn'); }); });
  }

  /* ---------- qui est derrière : le prix d'agence se barre (600 ms) ---------- */
  var cmp = $('#cmp');
  if (cmp && !RM && below(cmp)) {
    cmp.classList.add('anim');
    once(cmp, 0.8, function () { cmp.classList.add('in'); });
  }

  /* ---------- FAQ : ouverture en douceur, le « + » tourne en « × » ---------- */
  $$('.q button').forEach(function (b) {
    b.addEventListener('click', function () {
      var q = b.closest('.q'), open = !q.classList.contains('open');
      q.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- formulaire de maquette gratuite ----------
     Envoyé par FormSubmit (gratuit, sans compte) à contact@maison-dev.com. S'il échoue pour une raison
     quelconque, la messagerie du visiteur s'ouvre avec le même message : une demande n'est jamais perdue. */
  var SPAM_WORDS = 'casino, viagra, cialis, porn, backlinks, bitcoin investment, forex signals, crypto investment';
  var form = $('#leadform');
  if (form) {
    var msg = $('#lf-msg'), fields = $('#lf-fields'), done = $('#lf-done'), submit = $('button[type=submit]', form);
    var offre = new URLSearchParams(location.search).get('offre');
    if (offre) $('#lf-offre').value = offre.slice(0, 40);
    /* anti-spam : un champ piège rempli reçoit un faux « merci » ; un envoi moins de 1,5 s après la première saisie
       (les robots remplissent tout d'un coup) demande un second clic au lieu d'être jeté : une vraie demande n'est jamais perdue */
    var touched = 0;
    var touch = function () { touched = touched || Date.now(); };
    form.addEventListener('focusin', touch);
    form.addEventListener('input', touch);
    var finish = function () {
      msg.textContent = '';
      done.textContent = t('lf-ok');
      fields.hidden = true;
      done.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { done.classList.add('on'); }); });
      done.focus({ preventScroll: true });
    };
    doc.addEventListener('langchange', function () { if (!done.hidden) done.textContent = t('lf-ok'); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = String(v); });
      if (d._honey) { finish(); return; }
      if (!touched || Date.now() - touched < 1500) { touch(); msg.textContent = t('lf-again'); return; }
      if (!(d.entreprise || '').trim() || !/@|\d{6,}/.test((d.contact || '').replace(/[\s.()+-]/g, ''))) { msg.textContent = t('lf-err'); return; }
      var L = lang();
      var lines = ['Entreprise : ' + d.entreprise, 'Site actuel : ' + (d.site_actuel || '-'), 'Contact : ' + d.contact, d.offre ? 'Offre : ' + d.offre : '', 'Langue : ' + L].filter(Boolean);
      var mailto = function () { location.href = 'mailto:contact@maison-dev.com?subject=' + encodeURIComponent('Maquette gratuite : ' + d.entreprise) + '&body=' + encodeURIComponent(lines.join('\n')); };
      msg.textContent = t('lf-sending');
      submit.disabled = true;
      fetch('https://formsubmit.co/ajax/contact@maison-dev.com', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: 'Maquette gratuite : ' + d.entreprise, _template: 'table', _captcha: 'false', _blacklist: SPAM_WORDS, entreprise: d.entreprise, site_actuel: d.site_actuel, contact: d.contact, offre: d.offre, langue: L })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || r.status);
          finish();
        });
      }).catch(function (e) {
        console.warn(e);
        msg.textContent = t('lf-fail');
        submit.disabled = false;
        mailto();
      });
    });
  }
})();
