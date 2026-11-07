/* Maison Dev : animations et interactions, en JavaScript simple (aucune bibliothèque, aucune étape de build).
   Inspiré de l'architecture de FLOWZ : le M de « MAISON » est une fenêtre sur les sites réalisés et l'on zoome dedans,
   bandeau dont la vitesse suit le défilement, manifeste dont les mots s'allument, galerie horizontale,
   page qui devient terracotta sur les tarifs, planche d'atelier aux étapes déplaçables, logo qui se dessine en bas de page.
   Tout ce qui bouge est coupé si « réduire les animations » est activé. Chaque bloc ne s'active que si son élément existe. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOTION = root.classList.contains('motion') && !RM;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var FR = {
    'lf-sending': 'Envoi…', 'lf-ok': 'Merci ! Vous avez une réponse sous 24 h, et votre maquette sous 48 h.',
    'lf-err': 'Indiquez votre entreprise et un e-mail ou un téléphone.', 'lf-again': 'Vérifiez vos informations, puis cliquez à nouveau sur le bouton.',
    'lf-fail': "Le formulaire n'a pas pu partir : votre messagerie s'ouvre avec le message prêt à envoyer.",
    menu: 'Menu', close: 'Fermer', voir: 'Voir', glisser: 'Glisser', deplacer: 'Déplacer', copy: 'Copier', copied: 'Copié', selected: 'Sélectionné'
  };
  var t = function (k) { return (window.MD && window.MD.t(k)) || FR[k] || ''; };
  var lang = function () { return window.MD ? window.MD.lang : 'fr'; };
  var onLang = function (fn) { doc.addEventListener('langchange', fn); };
  var once = function (el, opts, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); } }, opts);
    io.observe(el);
  };
  var pageTop = function (el) { return el.getBoundingClientRect().top + scrollY; };

  /* ---------- moteur de défilement : une seule boucle, déclenchée par le défilement ---------- */
  var fx = [], measures = [], lastY = scrollY, queued = false;
  function frame() {
    queued = false;
    var y = scrollY, vh = innerHeight, dy = y - lastY;
    lastY = y;
    for (var i = 0; i < fx.length; i++) fx[i](y, vh, dy);
  }
  function request() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', request, { passive: true });
  function measureAll() { measures.forEach(function (m) { m(); }); request(); }
  var rz = 0;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(measureAll, 120); });
  addEventListener('load', measureAll);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measureAll);
  onLang(function () { setTimeout(measureAll, 30); });

  /* ---------- menu plein écran (téléphone) ---------- */
  var hd = $('#hd'), menuBtn = $('.hd__menu'), menu = $('#menu');
  function setMenu(open, focusBack) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = t(open ? 'close' : 'menu');
    doc.body.classList.toggle('menu-open', open);
    if (open) hd.classList.remove('is-hidden');
    if (!open && focusBack) menuBtn.focus();
  }
  if (hd && menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false, true); });
    matchMedia('(min-width: 760px)').addEventListener('change', function (m) { if (m.matches && !menu.hidden) setMenu(false); });
    onLang(function () { menuBtn.textContent = t(menu.hidden ? 'menu' : 'close'); });
  }

  /* ---------- en-tête : se cache en descendant, revient en remontant ; s'adapte aux sections claires ---------- */
  if (hd) {
    var tones = [], hdLast = scrollY;
    measures.push(function () {
      tones = $$('[data-tone], .prix').map(function (s) { var top = pageTop(s); return { a: top, b: top + s.offsetHeight, tone: s.classList.contains('prix') ? 'terra' : 'clair' }; });
    });
    fx.push(function (y) {
      if (!menu || menu.hidden) {
        if (y > hdLast + 2 && y > 160) hd.classList.add('is-hidden'); else if (y < hdLast - 2) hd.classList.remove('is-hidden');
      }
      hdLast = y;
      var line = y + 34, tone = '', tintEl = $('.bgtint');
      for (var i = 0; i < tones.length; i++) if (line >= tones[i].a && line < tones[i].b) tone = tones[i].tone;
      /* quand la page devient terracotta, l'en-tête passe en crème même au-dessus d'une section transparente */
      if (!tone && tintEl && +tintEl.style.opacity > 0.4) tone = 'terra';
      hd.classList.toggle('sur-clair', tone === 'clair');
      hd.classList.toggle('sur-terra', tone === 'terra');
    });
  }

  /* ---------- haut de page : la fenêtre de la maison et le zoom ---------- */
  var stage = $('.hero__stage');
  if (stage) (function hero() {
    var heroSec = $('.hero'), hsvg = $('.hero__svg'), hlogo = $('.hero__logo'), hwin = $('.hero__win'), hinn = $('.hero__logo .lg-in');
    var hbg = $('.hero__fond'), hshade = $('.hero__ombre'), photos = $('.hero__photos'), imgs = $$('.hero__img');
    var bar = $('.hero__bar'), foot = $('.hero__foot'), hstate = $('.hero__statement'), hdev = $('.hero__dev'), hdLogo = $('.hd__logo');
    var capNom = $('.hero__capnom'), capGenre = $('.hero__capgenre');
    var vb = $('.hd__logo svg').viewBox.baseVal, LX = vb.x, LY = vb.y, LW = vb.width, LH = vb.height;
    var fc = hsvg.getAttribute('data-fc').split(' ').map(Number), FCX = fc[0], FCY = fc[1], RMIN = +hsvg.getAttribute('data-rmin');
    var W = 0, H = 0, A = 1, OX = 0, OY = 0, FX = 0, FY = 0, SMAX = 10, portrait = null, prog = 0, heroTop = 0, heroLen = 1, cur = 0;
    var HB = { x: 25.6, y: -927.8, w: 1054, h: 950 }; /* la maison seule (téléphone) */
    var pos = [], letters = $('.hero__logo .lg-fill');
    var inOut = function (p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; };

    function setSources(force) {
      var p = W / H < 0.8;
      if (p === portrait && !force) return;
      portrait = p;
      imgs.forEach(function (im, i) {
        var src = im.getAttribute(p ? 'data-tel' : 'data-ordi');
        if (i === 0 || im.hasAttribute('data-ok')) im.setAttribute('href', src); else im.setAttribute('data-next', src);
      });
    }
    function layout() {
      W = stage.clientWidth; H = stage.clientHeight;
      if (!W || !H) return;
      hsvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      setSources();
      var sr = stage.getBoundingClientRect(), barTop = bar.getBoundingClientRect().top - sr.top;
      var mobile = W < 760, b = mobile ? HB : { x: LX, y: LY, w: LW, h: LH };
      var hdH = mobile ? 70 : 76, room = Math.max(120, barTop - hdH - 18);
      A = Math.min((W * (mobile ? 0.58 : 0.86)) / b.w, (room * (mobile ? 0.84 : 0.78)) / b.h);
      OX = (W - b.w * A) / 2 - b.x * A;
      OY = hdH + (room - b.h * A) / 2 - b.y * A;
      FX = OX + FCX * A; FY = OY + FCY * A;
      SMAX = (Math.hypot(W / 2, H / 2) / (RMIN * A)) * 1.16;
      letters.style.display = mobile ? 'none' : '';
      [hbg, hshade].forEach(function (r) { r.setAttribute('width', W); r.setAttribute('height', H); });
      /* chaque capture : cadrée sur son point fort dans la fenêtre au repos, plein écran à la fin du zoom */
      var ratio = portrait ? 780 / 1688 : 1920 / 1200;
      pos = imgs.map(function (im) {
        var fx0 = +im.getAttribute(portrait ? 'data-tfx' : 'data-fx') || 0.5, fy0 = +im.getAttribute(portrait ? 'data-tfy' : 'data-fy') || 0.5;
        var w = W, h = W / ratio;
        if (h < H) { h = H; w = H * ratio; }
        im.setAttribute('width', w.toFixed(1)); im.setAttribute('height', h.toFixed(1));
        im.setAttribute('preserveAspectRatio', 'none');
        return { x0: FX - fx0 * w, y0: FY - fy0 * h, x1: (W - w) / 2, y1: portrait ? 0 : (H - h) / 2 };
      });
      if (hdev) { hdev.style.setProperty('--dev-x', (OX + (LX + LW - 40) * A).toFixed(1) + 'px'); hdev.style.setProperty('--dev-y', (OY - 720 * A).toFixed(1) + 'px'); hdev.style.transform = 'translate(-100%,-100%)'; }
      heroTop = pageTop(heroSec); heroLen = Math.max(1, heroSec.offsetHeight - H);
      render(prog);
    }
    function render(p) {
      prog = p;
      var z = MOTION ? inOut(clamp01(p / 0.78)) : 0;
      var s = Math.exp(Math.log(SMAX) * z), k = A * s;
      var cx = FX + (W / 2 - FX) * z, cy = FY + (H / 2 - FY) * z;
      var m = 'matrix(' + k.toFixed(5) + ',0,0,' + k.toFixed(5) + ',' + (cx - FCX * k).toFixed(2) + ',' + (cy - FCY * k).toFixed(2) + ')';
      hlogo.setAttribute('transform', m); hwin.setAttribute('transform', m);
      var e = clamp01(z * 1.25);
      imgs.forEach(function (im, i) { var q = pos[i]; if (!q) return; im.setAttribute('x', (q.x0 + (q.x1 - q.x0) * e).toFixed(1)); im.setAttribute('y', (q.y0 + (q.y1 - q.y0) * e).toFixed(1)); });
      if (!MOTION) return;
      hinn.style.opacity = (1 - clamp01((s - 1) / 1.2)).toFixed(3);
      var f = 1 - clamp01(p / 0.08);
      bar.style.opacity = foot.style.opacity = f.toFixed(3);
      if (hdev) hdev.style.opacity = f.toFixed(3);
      bar.style.visibility = foot.style.visibility = f < 0.02 ? 'hidden' : '';
      var st = clamp01((p - 0.72) / 0.14);
      hstate.style.opacity = st.toFixed(3);
      hstate.style.transform = 'translateY(calc(-50% + ' + ((1 - st) * 40).toFixed(1) + 'px))';
      /* le site reste bien visible quand la fenêtre remplit l'écran, puis s'efface sous la phrase */
      hshade.setAttribute('opacity', clamp01((p - 0.62) / 0.26).toFixed(3));
      if (hdLogo) hdLogo.style.opacity = (W < 760 || p > 0.97) ? '1' : '0';
    }
    measures.push(layout);
    layout();
    if (MOTION) fx.push(function (y) { var p = clamp01((y - heroTop) / heroLen); if (p !== prog || p < 1) render(p); });

    /* les sites se succèdent dans la fenêtre */
    function caption() { var im = imgs[cur]; capNom.textContent = im.getAttribute('data-nom'); capGenre.textContent = t(im.getAttribute('data-genre')); }
    function loadRest() {
      imgs.forEach(function (im, i) {
        if (i === 0) return;
        var src = im.getAttribute('data-next') || im.getAttribute(portrait ? 'data-tel' : 'data-ordi');
        im.addEventListener('load', function () { im.setAttribute('data-ok', ''); }, { once: true });
        im.setAttribute('href', src); im.removeAttribute('data-next');
      });
    }
    imgs[0].setAttribute('data-ok', '');
    onLang(caption);
    if (MOTION) {
      var inView = true;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(stage);
      var startCycle = function () {
        loadRest();
        setInterval(function () {
          if (!inView || doc.hidden) return;
          var n = (cur + 1) % imgs.length;
          if (!imgs[n].hasAttribute('data-ok')) return;
          imgs[cur].classList.remove('is-on'); imgs[n].classList.add('is-on'); cur = n;
          /* la légende change au milieu du fondu, pour toujours nommer le site visible */
          var box = capNom.parentNode; box.style.opacity = '0';
          setTimeout(function () { caption(); box.style.opacity = ''; }, 330);
        }, 2600);
      };
      /* intro : le logo se dessine, puis la fenêtre s'éclaire */
      var uses = $$('.hero__logo use');
      heroSec.classList.add('intro');
      uses.forEach(function (u) { u.style.strokeDasharray = '1000'; u.style.strokeDashoffset = '1000'; });
      $('.hero__logo .lg-fill').style.fillOpacity = '0';
      photos.style.opacity = '0';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          uses.forEach(function (u, i) { u.style.transition = 'stroke-dashoffset 1.15s cubic-bezier(.65,0,.35,1) ' + (i * 0.12) + 's'; u.style.strokeDashoffset = '0'; });
        });
      });
      setTimeout(function () {
        var fill = $('.hero__logo .lg-fill');
        fill.style.transition = 'fill-opacity .6s ease, stroke-opacity .5s ease .3s';
        fill.style.fillOpacity = '1'; fill.style.strokeOpacity = '0';
        photos.style.transition = 'opacity .8s ease .2s'; photos.style.opacity = '1';
        setTimeout(function () { heroSec.classList.remove('intro'); }, 1200);
        if (doc.readyState === 'complete') startCycle(); else addEventListener('load', startCycle);
      }, 1350);
    } else if (hdLogo) hdLogo.style.opacity = '1';
  })();

  /* ---------- bandeau : sa vitesse suit celle du défilement ---------- */
  var track = $('.marquee__track'), set = $('.marquee__set');
  if (MOTION && track && set) (function marquee() {
    root.classList.add('mq-js');
    var x = 0, dir = -1, boost = 0, setW = set.offsetWidth, last = 0, running = false, visible = false;
    measures.push(function () { setW = set.offsetWidth; });
    fx.push(function (y, vh, dy) { if (dy) { dir = dy > 0 ? -1 : 1; boost = Math.min(Math.abs(dy) / 15, 7); } });
    function loop(now) {
      if (!visible) { running = false; return; }
      var dt = last ? Math.min(64, now - last) : 16; last = now;
      boost *= 0.93;
      x += dir * (0.05 + boost * 0.11) * dt;
      if (setW > 0) { while (x <= -setW) x += setW; while (x > 0) x -= setW; }
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      requestAnimationFrame(loop);
    }
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !running) { running = true; last = 0; requestAnimationFrame(loop); }
    }).observe($('.marquee'));
  })();

  /* ---------- titres : les lettres montent ---------- */
  function splitTitle(el) {
    var text = el.textContent.trim();
    el.textContent = '';
    var sr = doc.createElement('span'); sr.className = 'sr'; sr.textContent = text; el.appendChild(sr);
    var i = 0;
    text.split(' ').forEach(function (word, wi) {
      if (wi) el.appendChild(doc.createTextNode(' '));
      var w = doc.createElement('span'); w.className = 'wd'; w.setAttribute('aria-hidden', 'true'); w.style.whiteSpace = 'nowrap'; w.style.display = 'inline-block';
      Array.from(word).forEach(function (ch) {
        var s = doc.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; w.appendChild(s);
      });
      el.appendChild(w);
    });
    el.classList.add('split');
  }
  var nouns = $$('.title__noun');
  if (MOTION) {
    nouns.forEach(function (el) {
      splitTitle(el);
      /* l'état atténué ne s'applique qu'à l'approche : le titre reste lisible tant qu'on n'y est pas */
      once(el, { rootMargin: '0px 0px 120% 0px' }, function () {
        el.classList.add('arme');
        once(el, { rootMargin: '0px 0px -10% 0px' }, function () { el.classList.add('vu'); });
      });
    });
    onLang(function () { nouns.forEach(function (el) { splitTitle(el); el.classList.add('arme', 'vu'); }); });
  }

  /* ---------- la maison : les mots s'allument à la lecture ---------- */
  var mani = $('.mani__text');
  if (mani && MOTION) (function manifeste() {
    var words = [], top = 1e9, h = 1, armed = false;
    function split() {
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = doc.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
              var s = doc.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
        });
      };
      walk(mani);
      words = $$('.w', mani);
    }
    split();
    onLang(function () { split(); request(); });
    measures.push(function () { top = pageTop(mani); h = mani.offsetHeight; });
    fx.push(function (y, vh) {
      /* les mots ne s'éteignent qu'à l'approche du texte : avant, il reste lisible */
      if (!armed) { if (y > top - vh * 2.2) armed = true; else return; }
      var start = top - vh * 0.82, end = top + h - vh * 0.48;
      var p = clamp01((y - start) / Math.max(1, end - start)), n = words.length;
      for (var i = 0; i < n; i++) words[i].style.opacity = (0.16 + 0.84 * clamp01(p * n - i)).toFixed(3);
    });
  })();

  /* ---------- montée douce des blocs de texte ---------- */
  if (MOTION) $$('.rise').forEach(function (el) {
    once(el, { rootMargin: '0px 0px 120% 0px' }, function () {
      el.classList.add('arme');
      once(el, { rootMargin: '0px 0px -8% 0px' }, function () { el.classList.add('vu'); });
    });
  });

  /* ---------- repères : les chiffres comptent ---------- */
  var faits = $('#faits');
  if (faits && MOTION) once(faits, { threshold: 0.4 }, function () {
    var nums = $$('.n', faits);
    nums.forEach(function (n) { n.style.minWidth = n.getBoundingClientRect().width + 'px'; n.textContent = '0'; });
    var t0 = performance.now();
    (function step(now) {
      var u = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - u, 3);
      $$('.n', faits).forEach(function (n) { n.textContent = Math.round(e * +n.getAttribute('data-to')); });
      if (u < 1) requestAnimationFrame(step);
    })(t0);
  });

  /* ---------- réalisations : galerie horizontale (ordinateur), carrousel à glisser (téléphone) ---------- */
  var gal = $('.galerie'), gtrack = $('.galerie__track'), grail = $('.galerie__rail');
  if (gal && gtrack && grail) (function galerie() {
    var cards = $$('.card', gtrack), bar = $('.galerie__progress span');
    var wide = matchMedia('(min-width: 900px)'), on = false, dist = 0, gTop = 0, skew = 0, target = 0, settling = false;
    function settle() {
      skew += (target - skew) * 0.12; target *= 0.85;
      gtrack.style.setProperty('--sk', skew.toFixed(2) + 'deg');
      if (Math.abs(skew) > 0.02 || Math.abs(target) > 0.02) requestAnimationFrame(settle); else { settling = false; gtrack.style.setProperty('--sk', '0deg'); }
    }
    function setup() {
      on = MOTION && wide.matches;
      root.classList.toggle('galerie-h', on);
      gal.style.height = '';
      grail.style.transform = '';
      if (!on) return;
      dist = Math.max(0, grail.scrollWidth - innerWidth);
      gal.style.height = (innerHeight + dist) + 'px';
      gTop = pageTop(gal);
    }
    measures.push(setup);
    setup();
    wide.addEventListener('change', measureAll);
    fx.push(function (y, vh, dy) {
      if (!on) return;
      var p = clamp01((y - gTop) / Math.max(1, dist));
      grail.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (dy && p > 0 && p < 1) { target = Math.max(-5, Math.min(5, -dy * 60 / 450)); if (!settling) { settling = true; requestAnimationFrame(settle); } }
    });
    /* téléphone : les petits points */
    var dots = $$('#dots button');
    if (dots.length && 'IntersectionObserver' in window) {
      var dio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !on) dots.forEach(function (d, j) { d.setAttribute('aria-current', String(j === cards.indexOf(e.target))); }); });
      }, { root: gtrack, threshold: 0.6 });
      cards.forEach(function (c) { dio.observe(c); });
      dots.forEach(function (d, k) {
        d.addEventListener('click', function () {
          var x = cards[k].getBoundingClientRect().left - gtrack.getBoundingClientRect().left + gtrack.scrollLeft - (parseFloat(getComputedStyle(gtrack).paddingLeft) || 0);
          gtrack.scrollTo({ left: x, behavior: RM ? 'auto' : 'smooth' });
        });
      });
    }
    /* survol : la capture de la page entière défile (6 s, aller-retour) */
    if (MOTION && FINE) cards.forEach(function (card) {
      var media = $('.card__media', card), page = $('.card__page', card), anim = null, back = null;
      if (!media || !page) return;
      var run = function () {
        if (!card.matches(':hover') || anim) return;
        if (back) { back.cancel(); back = null; }
        page.classList.add('ready');
        var d = page.getBoundingClientRect().height - media.getBoundingClientRect().height;
        if (d <= 0) return;
        anim = page.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-d) + 'px)' }], { duration: 6000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' });
      };
      card.addEventListener('pointerenter', function () {
        if (page.hasAttribute('data-src')) { page.src = page.getAttribute('data-src'); page.removeAttribute('data-src'); }
        if (page.complete && page.naturalWidth > 1) run(); else page.addEventListener('load', run, { once: true });
      });
      card.addEventListener('pointerleave', function () {
        if (!anim) { page.classList.remove('ready'); return; }
        var y = new DOMMatrixReadOnly(getComputedStyle(page).transform).m42;
        anim.cancel(); anim = null;
        back = page.animate([{ transform: 'translateY(' + y + 'px)' }, { transform: 'translateY(0)' }], { duration: Math.min(700, 250 + Math.abs(y) / 8), easing: 'ease-out' });
        back.onfinish = function () { back = null; page.classList.remove('ready'); };
      });
    });
  })();

  /* ---------- avant / après ---------- */
  var ba = $('#ba');
  if (ba) {
    var range = $('input', ba), touchedBA = false;
    var setX = function (v) { ba.style.setProperty('--x', v + '%'); };
    range.addEventListener('input', function () { touchedBA = true; setX(range.value); });
    if (MOTION) once(ba, { threshold: 0.55 }, function () {
      setTimeout(function () {
        if (touchedBA) return;
        var t0 = performance.now();
        (function f(now) {
          if (touchedBA) return;
          var u = Math.min(1, (now - t0) / 1200), x = 50 + 12 * Math.sin(u * Math.PI);
          setX(u < 1 ? x : 50); range.value = Math.round(u < 1 ? x : 50);
          if (u < 1) requestAnimationFrame(f);
        })(t0);
      }, 250);
    });
  }

  /* ---------- tarifs : la page devient terracotta ---------- */
  var prix = $('.prix'), tint = $('.bgtint');
  if (prix && tint && MOTION) (function teinte() {
    var top = 0, h = 1;
    measures.push(function () { top = pageTop(prix); h = prix.offsetHeight; });
    fx.push(function (y, vh) {
      var start = top - vh * 0.72, end = top + h - vh * 0.28, p = (y - start) / Math.max(1, end - start), o;
      if (p <= 0 || p >= 1) o = 0; else if (p < 0.16) o = p / 0.16; else if (p > 0.84) o = (1 - p) / 0.16; else o = 1;
      tint.style.opacity = o.toFixed(3);
    });
  })();

  /* ---------- qui est derrière : le mot fantôme glisse, le prix d'agence se barre ---------- */
  var ghost = $('.fantome');
  if (ghost && MOTION) (function fantome() {
    var sec = ghost.parentElement, top = 0, h = 1;
    measures.push(function () { top = pageTop(sec); h = sec.offsetHeight; });
    fx.push(function (y, vh) { var p = clamp01((y + vh - top) / (vh + h)); ghost.style.transform = 'translate3d(' + (-62 * p).toFixed(2) + '%,0,0)'; });
  })();
  var cmp = $('#cmp');
  if (cmp && MOTION && cmp.getBoundingClientRect().top > innerHeight) { cmp.classList.add('anim'); once(cmp, { threshold: 0.8 }, function () { cmp.classList.add('vu'); }); }

  /* ---------- méthode : on attrape une étape et on la déplace (souris, doigt ou flèches du clavier) ---------- */
  var board = $('#board');
  if (board) (function planche() {
    var wide = matchMedia('(min-width: 760px)'), z = 10;
    $$('.pin', board).forEach(function (pin) {
      var drag = false, pid = null, sx = 0, sy = 0, ox = 0, oy = 0;
      var read = function () { return [parseFloat(pin.style.getPropertyValue('--dx')) || 0, parseFloat(pin.style.getPropertyValue('--dy')) || 0]; };
      var place = function (dx, dy) {
        var bw = board.clientWidth, bh = board.clientHeight, pw = pin.offsetWidth, ph = pin.offsetHeight;
        dx = Math.max(-pin.offsetLeft - pw * 0.25, Math.min(bw - pin.offsetLeft - pw * 0.75, dx));
        dy = Math.max(-pin.offsetTop - ph * 0.25, Math.min(bh - pin.offsetTop - ph * 0.6, dy));
        pin.style.setProperty('--dx', dx.toFixed(1) + 'px'); pin.style.setProperty('--dy', dy.toFixed(1) + 'px');
      };
      pin.addEventListener('pointerdown', function (e) {
        if (!wide.matches || e.button) return;
        drag = true; pid = e.pointerId; pin.setPointerCapture(pid); pin.classList.add('is-drag'); pin.style.zIndex = ++z;
        var r = read(); ox = r[0]; oy = r[1]; sx = e.clientX; sy = e.clientY;
      });
      pin.addEventListener('pointermove', function (e) { if (drag && e.pointerId === pid) place(ox + e.clientX - sx, oy + e.clientY - sy); });
      var end = function (e) { if (drag && e.pointerId === pid) { drag = false; pin.classList.remove('is-drag'); } };
      pin.addEventListener('pointerup', end); pin.addEventListener('pointercancel', end);
      pin.addEventListener('keydown', function (e) {
        if (!wide.matches) return;
        var step = e.shiftKey ? 40 : 14, r = read(), m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (!m) return;
        e.preventDefault(); pin.style.zIndex = ++z; place(r[0] + m[0], r[1] + m[1]);
      });
    });
  })();

  /* ---------- FAQ : ouverture en douceur, le « + » tourne en « × » ---------- */
  $$('.q button').forEach(function (b) {
    b.addEventListener('click', function () {
      var q = b.closest('.q'), open = !q.classList.contains('open');
      q.classList.toggle('open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- pied de page : le grand logo se dessine ---------- */
  var flogo = $('.ft__logo');
  if (flogo && MOTION) (function logoBas() {
    var uses = $$('use', flogo), fill = $('.lg-fill', flogo), top = 0, h = 1;
    uses.forEach(function (u) { u.style.strokeDasharray = '1000'; u.style.strokeDashoffset = '1000'; });
    fill.style.fillOpacity = '0';
    measures.push(function () { top = pageTop(flogo); h = flogo.getBoundingClientRect().height; });
    fx.push(function (y, vh) {
      var start = top - vh * 0.98, end = Math.max(start + 1, Math.min(top + h - vh, doc.documentElement.scrollHeight - vh));
      var p = clamp01((y - start) / (end - start));
      uses.forEach(function (u, i) { u.style.strokeDashoffset = (1000 * (1 - clamp01(p * 1.3 - i * 0.08))).toFixed(1); });
      fill.style.fillOpacity = clamp01((p - 0.6) / 0.4).toFixed(3);
    });
  })();

  /* ---------- copier l'adresse e-mail ---------- */
  $$('[data-copy]').forEach(function (btn) {
    var label = $('.copier__label', btn);
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var show = function (k) { label.textContent = t(k); setTimeout(function () { label.textContent = t('copy'); }, 1800); };
      var fallback = function () {
        var a = $('#mailbtn');
        if (a) { var r = doc.createRange(); r.selectNodeContents(a); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        show('selected');
      };
      try { navigator.clipboard.writeText(text).then(function () { show('copied'); }, fallback); } catch (e) { fallback(); }
    });
  });

  /* ---------- curseur « Voir » et boutons aimantés (souris uniquement) ---------- */
  if (FINE && MOTION) (function curseur() {
    var cur = $('.cursor'), label = $('.cursor__label');
    if (!cur) return;
    root.classList.add('has-cursor');
    var tx = -200, ty = -200, cx = -200, cy = -200, moving = false;
    function loop() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) requestAnimationFrame(loop); else moving = false;
    }
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (!moving) { moving = true; requestAnimationFrame(loop); } }, { passive: true });
    doc.addEventListener('pointerover', function (e) {
      var el = e.target.closest('[data-cursor]');
      if (el) { label.textContent = t(el.getAttribute('data-cursor')); cur.classList.add('is-on'); }
    });
    doc.addEventListener('pointerout', function (e) {
      var el = e.target.closest('[data-cursor]');
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) cur.classList.remove('is-on');
    });
    $$('[data-magnetic]').forEach(function (el) {
      el.style.transition = (el.style.transition ? el.style.transition + ',' : '') + 'transform .6s cubic-bezier(.3,1.6,.5,1)';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.38).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  })();

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
      measureAll();
    };
    onLang(function () { if (!done.hidden) done.textContent = t('lf-ok'); });
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

  /* ---------- tampons : le texte fait exactement le tour du cercle, quelle que soit la langue ---------- */
  function fitTampons() {
    $$('.tampon textPath').forEach(function (tp) {
      var path = doc.getElementById((tp.getAttribute('href') || '').slice(1)), txt = tp.parentNode;
      if (!path || !path.getTotalLength || !tp.getComputedTextLength) return;
      txt.style.letterSpacing = '0px';
      var n = tp.textContent.length, gap = (path.getTotalLength() - tp.getComputedTextLength()) / Math.max(1, n);
      txt.style.letterSpacing = Math.max(0, gap).toFixed(3) + 'px';
    });
  }
  fitTampons();
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitTampons);
  onLang(fitTampons);

  /* première image : on mesure d'abord, pour que chaque effet parte de vraies positions */
  measureAll();
})();
