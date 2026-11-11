/* ═══════════════════════════════════════════════════════════════
   Modèle « Auberge et hôtel » · Maison Dev
   Ce script lit contenu.json et dessine la page.
   Pour un nouveau client, il n'y a rien à modifier ici.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const doc = document;
  const racine = doc.documentElement;
  const $ = (s, r) => (r || doc).querySelector(s);
  const $$ = (s, r) => Array.from((r || doc).querySelectorAll(s));
  const calme = window.matchMedia('(prefers-reduced-motion: reduce)');
  const NBSP = ' ';
  let C = null; // le contenu

  /* ───────── Petits outils ───────── */
  /* Typographie française automatique : apostrophes courbes et espaces insécables
     (devant ? ! : ; » € %, après «, et dans « 10 h 30 », « 24 m² »). On tape donc
     des espaces et des apostrophes ordinaires dans contenu.json. */
  const typo = (s) => String(s == null ? '' : s)
    .replace(/(\p{L})'(?=\p{L})/gu, '$1’')
    .replace(/ (?=[?!:;»€%])/g, NBSP)
    .replace(/« /g, '«' + NBSP)
    .replace(/(\d) (?=(?:h|m²|min)(?![\p{L}]))/gu, '$1' + NBSP)
    .replace(/(\d h) (?=\d)/g, '$1' + NBSP);
  const brut = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const esc = (s) => brut(typo(s));
  const lire = (o, chemin) => chemin.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const icone = (nom) => `<svg class="icone" aria-hidden="true" focusable="false"><use href="#i-${esc(nom)}"/></svg>`;
  const euros = (n) => `${esc(n)}${NBSP}€`;

  const cadreVide = (legende) =>
    `<div class="cadre-vide"><strong>Photo à venir</strong>${legende ? `<span>${esc(legende)}</span>` : ''}</div>`;

  const TAILLES = {
    arche: '(max-width: 900px) 46vw, 23vw',
    chambre: '(max-width: 700px) 82vw, 384px',
    restaurant: '(max-width: 900px) 84vw, 40vw',
    restaurant2: '(max-width: 900px) 42vw, 20vw',
    offre: '(max-width: 900px) 92vw, 31vw',
    galerie: '(max-width: 700px) 50vw, 25vw',
    galerieGrande: '(max-width: 700px) 100vw, 50vw'
  };

  function image(p, tailles) {
    if (!p || !p.src) return cadreVide(p && p.alt);
    const jeu = p.petite ? ` srcset="${brut(p.petite)} 800w, ${brut(p.src)} 1600w" sizes="${tailles}"` : '';
    const cadrage = p.position ? ` style="object-position:${brut(p.position)}"` : ''; // facultatif : "70% 50%"
    return `<img src="${brut(p.petite || p.src)}"${jeu}${cadrage} alt="${esc(p.alt || '')}" loading="lazy" decoding="async">`;
  }

  /* Dates */
  const aujourdhui = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const deIso = (s) => { const [a, m, j] = s.split('-').map(Number); return new Date(a, m - 1, j); };
  const ajouter = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const dateLisible = (s) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(deIso(s));
  const nuits = (a, d) => Math.round((deIso(d) - deIso(a)) / 86400000);

  /* ═══════════════ Dessin des sections ═══════════════ */

  function sUnivers(u) {
    return `
<section class="section" id="univers" aria-labelledby="univers-titre">
  <div class="conteneur">
    <div class="section__tete" data-apparition>
      <h2 class="titre" id="univers-titre">${esc(u.titre)}</h2>
      ${u.intro ? `<p class="intro">${esc(u.intro)}</p>` : ''}
    </div>
    <ul class="arcade" data-arcade>
      ${u.panneaux.map((p, i) => `
      <li class="arche" id="${brut(p.id)}" style="--i:${i}">
        <div class="arche__porte">${image(p.photo, TAILLES.arche)}</div>
        <div class="arche__texte">
          <h3 class="arche__titre">${esc(p.titre)}</h3>
          <p class="arche__phrase">${esc(p.phrase)}</p>
          ${p.demande
            ? `<button class="lien arche__lien" type="button" data-demande="${esc(p.demande)}">${esc(p.bouton)}</button>`
            : `<a class="lien arche__lien" href="${brut(p.lien)}">${esc(p.bouton)}</a>`}
        </div>
      </li>`).join('')}
    </ul>
  </div>
</section>`;
  }

  function sChambres(c) {
    const eq = c.equipements || {};
    return `
<section class="section section--surface" id="chambres" aria-labelledby="chambres-titre">
  <div class="conteneur">
    <div class="section__tete tete-defile" data-apparition>
      <div class="tete-defile__texte">
        <h2 class="titre" id="chambres-titre">${esc(c.titre)}</h2>
        ${c.intro ? `<p class="intro">${esc(c.intro)}</p>` : ''}
      </div>
      <div class="fleches">
        <button class="fleche" type="button" data-defile="chambres-piste" data-sens="-1" aria-label="${esc(c.precedent)}" disabled>${icone('fleche-g')}</button>
        <button class="fleche" type="button" data-defile="chambres-piste" data-sens="1" aria-label="${esc(c.suivant)}">${icone('fleche-d')}</button>
      </div>
    </div>
  </div>
  <ul class="defile" id="chambres-piste" tabindex="0" aria-label="${esc(c.titre)}">
    ${c.liste.map((ch) => `
    <li class="chambre">
      <div class="cadre">${image(ch.photo, TAILLES.chambre)}</div>
      <div class="chambre__corps">
        <h3 class="chambre__nom">${esc(ch.nom)}</h3>
        <p class="chambre__desc">${esc(ch.description)}</p>
        <ul class="chambre__faits">
          <li>${icone('surface')}${esc(ch.surface)}${NBSP}m²</li>
          <li>${icone('personnes')}${esc(ch.personnes)}</li>
        </ul>
        <ul class="equipements" aria-label="Équipements">
          ${(ch.equipements || []).map((k) => `<li title="${esc(eq[k] || k)}">${icone(k)}<span class="vh">${esc(eq[k] || k)}</span></li>`).join('')}
        </ul>
        <div class="chambre__pied">
          <p class="prix">${esc(c.prixAvant)} <strong>${euros(ch.prix)}<small>${esc(c.prixApres)}</small></strong></p>
          <button class="bouton bouton--contour" type="button" data-demande="sejour" data-chambre="${esc(ch.nom)}">${esc(c.bouton)}</button>
        </div>
      </div>
    </li>`).join('')}
  </ul>
</section>`;
  }

  function sRestaurant(r) {
    return `
<section class="section" id="restaurant" aria-labelledby="restaurant-titre">
  <div class="conteneur restaurant__grille">
    <div class="restaurant__photos" data-apparition>
      <div class="cadre cadre--zoom">${image(r.photo, TAILLES.restaurant)}</div>
      ${r.photo2 ? `<div class="cadre">${image(r.photo2, TAILLES.restaurant2)}</div>` : ''}
    </div>
    <div class="restaurant__texte" data-apparition>
      <h2 class="titre" id="restaurant-titre">${esc(r.titre)}</h2>
      <p>${esc(r.texte)}</p>
      <div class="carte">
        <h3 class="carte__titre">${esc(r.carteTitre)}</h3>
        <ul>
          ${r.carte.map((l) => `<li><span class="carte__plat">${esc(l.plat)}</span><span class="carte__points" aria-hidden="true"></span><span class="carte__prix">${euros(l.prix)}</span></li>`).join('')}
        </ul>
        ${r.menu ? `<p class="carte__menu"><span class="carte__plat">${esc(r.menu.nom)}</span><span class="carte__points" aria-hidden="true"></span><span class="carte__prix">${euros(r.menu.prix)}</span></p>` : ''}
      </div>
      <div class="horaires">
        <h3 class="horaires__titre">${esc(r.horairesTitre)}</h3>
        <dl>${r.horaires.map((h) => `<div><dt>${esc(h.jours)}</dt><dd>${esc(h.heures)}</dd></div>`).join('')}</dl>
      </div>
      <button class="bouton bouton--plein" type="button" data-demande="table">${esc(r.bouton)}</button>
    </div>
  </div>
</section>`;
  }

  function sAvis(a) {
    return `
<section class="section section--accent" id="avis" aria-labelledby="avis-titre">
  <div class="conteneur avis__grille">
    <div class="avis__cote" data-apparition>
      <h2 class="titre" id="avis-titre">${esc(a.titre)}</h2>
      ${a.explication ? `<p class="avis__explication">${esc(a.explication)}</p>` : ''}
    </div>
    <div data-apparition>
      <ul class="avis__piste" id="avis-piste" tabindex="0" aria-label="${esc(a.titre)}">
        ${a.liste.map((v) => `
        <li class="avis__carte">
          ${a.mention ? `<span class="etiquette">${esc(a.mention)}</span>` : ''}
          <blockquote class="avis__texte">«${NBSP}${esc(v.texte)}${NBSP}»</blockquote>
          <p class="avis__auteur">${esc(v.auteur)}<span class="avis__detail">${esc(v.detail)}</span></p>
        </li>`).join('')}
      </ul>
      <div class="avis__commandes">
        <button class="fleche" type="button" data-defile="avis-piste" data-sens="-1" aria-label="${esc(a.precedent)}" disabled>${icone('fleche-g')}</button>
        <button class="fleche" type="button" data-defile="avis-piste" data-sens="1" aria-label="${esc(a.suivant)}">${icone('fleche-d')}</button>
        <span class="avis__compteur" id="avis-compteur">1 / ${a.liste.length}</span>
      </div>
    </div>
  </div>
</section>`;
  }

  function sOffres(o) {
    return `
<section class="section" id="offres" aria-labelledby="offres-titre">
  <div class="conteneur">
    <div class="section__tete" data-apparition>
      <h2 class="titre" id="offres-titre">${esc(o.titre)}</h2>
      ${o.intro ? `<p class="intro">${esc(o.intro)}</p>` : ''}
    </div>
    <ul class="offres" data-apparition>
      ${o.liste.map((f) => `
      <li class="offre">
        <div class="cadre">${image(f.photo, TAILLES.offre)}</div>
        <div class="offre__corps">
          <h3 class="offre__titre">${esc(f.titre)}</h3>
          <p class="offre__texte">${esc(f.texte)}</p>
          <p class="offre__prix">${esc(f.prix)}</p>
          <button class="bouton bouton--contour" type="button" data-demande="${esc(f.demande || 'sejour')}" data-offre="${esc(f.titre)}">${esc(f.bouton)}</button>
        </div>
      </li>`).join('')}
    </ul>
  </div>
</section>`;
  }

  function sGalerie(g) {
    return `
<section class="section section--surface" id="galerie" aria-labelledby="galerie-titre">
  <div class="conteneur">
    <div class="section__tete" data-apparition>
      <h2 class="titre" id="galerie-titre">${esc(g.titre)}</h2>
      ${g.intro ? `<p class="intro">${esc(g.intro)}</p>` : ''}
    </div>
    <div class="galerie" data-apparition>
      ${g.photos.map((p, i) => `<button class="galerie__photo" type="button" data-photo="${i}">${image(p, i % 10 === 0 || i % 10 === 5 ? TAILLES.galerieGrande : TAILLES.galerie)}</button>`).join('')}
    </div>
  </div>
</section>`;
  }

  function sFaq(f) {
    return `
<section class="section" id="faq" aria-labelledby="faq-titre">
  <div class="conteneur faq__grille">
    <div class="faq__cote" data-apparition>
      <h2 class="titre" id="faq-titre">${esc(f.titre)}</h2>
      ${f.intro ? `<p class="intro">${esc(f.intro)}</p>` : ''}
    </div>
    <div class="faq__liste" data-apparition>
      ${f.questions.map((q) => `
      <details>
        <summary><span>${esc(q.q)}</span><span class="faq__signe" aria-hidden="true"></span></summary>
        <p class="faq__reponse">${esc(q.r)}</p>
      </details>`).join('')}
    </div>
  </div>
</section>`;
  }

  function sContact(k, e) {
    const a = e.adresse || {};
    const lieu = [a.rue, `${a.codePostal || ''} ${a.ville || ''}`.trim()].filter(Boolean);
    const recherche = (k.carte && k.carte.recherche) || lieu.join(', ');
    const carte = `https://www.google.com/maps?q=${encodeURIComponent(recherche)}&z=11&output=embed`;
    const itineraire = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(recherche)}`;
    return `
<section class="section section--surface" id="contact" aria-labelledby="contact-titre">
  <div class="conteneur contact__grille">
    <div class="contact__infos" data-apparition>
      <h2 class="titre" id="contact-titre">${esc(k.titre)}</h2>
      <dl class="contact__blocs">
        <div class="contact__bloc"><dt>${esc(k.telephoneTitre)}</dt><dd class="contact__grand"><a href="tel:${brut(e.telephoneLien)}">${esc(e.telephone)}</a></dd></div>
        <div class="contact__bloc"><dt>${esc(k.emailTitre)}</dt><dd><a href="mailto:${brut(e.email)}">${esc(e.email)}</a></dd></div>
        <div class="contact__bloc"><dt>${esc(k.adresseTitre)}</dt><dd>${lieu.map(esc).join('<br>')}${a.region ? `<br>${esc(a.region)}` : ''}</dd></div>
        <div class="contact__bloc"><dt>${esc(k.receptionTitre)}</dt><dd>${k.reception.map((h) => `${esc(h.jours)}, ${esc(h.heures)}`).join('<br>')}</dd></div>
      </dl>
    </div>
    <div class="contact__carte" data-apparition>
      <div class="cadre"><iframe src="${brut(carte)}" title="${esc(k.carte.titre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
      ${k.acces ? `<p class="contact__acces">${esc(k.acces)}</p>` : ''}
      <p><a class="lien" href="${brut(itineraire)}" target="_blank" rel="noopener">${esc(k.carte.itineraire)}</a></p>
    </div>
  </div>
</section>`;
  }

  function dessinerPied() {
    const e = C.etablissement, p = C.piedDePage, m = C.modele || {}, a = e.adresse || {};
    $('#pied').innerHTML = `
<div class="conteneur">
  <div class="pied__grille">
    <div class="pied__marque">
      <a class="logo" href="#accueil"><svg class="logo__feuille" aria-hidden="true" focusable="false"><use href="#i-feuille"/></svg><span>${esc(e.nom)}</span></a>
      <p class="pied__phrase">${esc(p.phrase)}</p>
      <p>${esc(a.rue)}<br>${esc(a.codePostal)} ${esc(a.ville)}</p>
    </div>
    <nav class="pied__colonne" aria-label="${esc(p.liensTitre)}">
      <p class="pied__colonne-titre">${esc(p.liensTitre)}</p>
      ${C.menu.map((l) => `<a href="${brut(l.lien)}">${esc(l.texte)}</a>`).join('')}
    </nav>
    <div class="pied__colonne">
      <p class="pied__colonne-titre">${esc(p.reseauxTitre)}</p>
      ${(e.reseaux || []).map((r) => `<a href="${brut(r.lien)}" target="_blank" rel="noopener">${esc(r.nom)}</a>`).join('')}
      <a href="tel:${brut(e.telephoneLien)}">${esc(e.telephone)}</a>
      <a href="mailto:${brut(e.email)}">${esc(e.email)}</a>
    </div>
  </div>
  <div class="pied__bas">
    <span>© ${new Date().getFullYear()} ${esc(e.nom)}. ${esc(p.droits)}</span>
    <button class="lien-pied" type="button" data-ouvre="mentions">${esc(p.mentionsLien)}</button>
    ${m.signature ? `<a href="${brut(m.signatureLien || '#')}" target="_blank" rel="noopener">${esc(m.signature)}</a>` : ''}
  </div>
  ${m.actif && m.mention ? `<p class="pied__modele">${esc(m.mention)}</p>` : ''}
</div>`;
    $('#mentions-titre').textContent = p.mentions.titre;
    $('#mentions-texte').innerHTML = p.mentions.paragraphes.map((t) => `<p>${esc(t)}</p>`).join('');
  }

  /* Textes des parties fixes (barre du haut, accueil, fenêtres) */
  function relierTextes() {
    const e = C.etablissement;
    $$('[data-c]').forEach((el) => {
      const v = lire(C, el.dataset.c);
      if (typeof v === 'string' && v) el.textContent = typo(v);
    });
    $$('[data-c-tel]').forEach((el) => {
      el.href = 'tel:' + e.telephoneLien;
      if (el.dataset.cTel !== 'lien') el.textContent = e.telephone;
    });

    if (C.referencement) {
      if (C.referencement.titre) doc.title = typo(C.referencement.titre);
      const d = $('meta[name="description"]');
      if (d && C.referencement.description) d.content = typo(C.referencement.description);
    }

    const ph = C.accueil.photo || {};
    const img = $('#accueil-image'), source = $('#accueil-source');
    if (ph.src && img) {
      const jeu = ph.petite ? `${ph.petite} 800w, ${ph.src} 1600w` : '';
      if (img.getAttribute('srcset') !== jeu) { if (jeu) img.srcset = jeu; else img.removeAttribute('srcset'); }
      if (img.getAttribute('src') !== (ph.petite || ph.src)) img.src = ph.petite || ph.src;
      img.alt = ph.alt || '';
      if (source) { if (ph.mobile) { if (source.getAttribute('srcset') !== ph.mobile) source.srcset = ph.mobile; } else source.remove(); }
    }

    $('#menu-liste').innerHTML = C.menu.map((l) => `<li><a href="${brut(l.lien)}">${esc(l.texte)}</a></li>`).join('');
    $('#menu-plein-liste').innerHTML = C.menu.map((l, i) => `<li style="--i:${i}"><a href="${brut(l.lien)}">${esc(l.texte)}</a></li>`).join('');

    const ch = C.reservation.demande.champs;
    $('#d-chambre').innerHTML = [`<option value="">${esc(ch.chambreIndifferente)}</option>`]
      .concat(C.chambres.liste.map((c) => `<option>${esc(c.nom)}</option>`)).join('');
    $('#d-service').innerHTML = ch.services.map((s) => `<option>${esc(s)}</option>`).join('');
    $('#d-type').innerHTML = ch.typesEvenement.map((s) => `<option>${esc(s)}</option>`).join('');

    const m = C.modele || {};
    ['#demande-modele', '#merci-modele'].forEach((s) => {
      const el = $(s);
      el.hidden = !(m.actif && C.reservation.demande.mentionModele);
      el.textContent = C.reservation.demande.mentionModele || '';
    });
  }

  /* ═══════════════ Comportements ═══════════════ */

  /* Barre du haut : transparente sur la photo, pleine ensuite */
  function suivreEntete() {
    const entete = $('#entete'), sentinelle = $('#sentinelle');
    if (!('IntersectionObserver' in window) || !sentinelle) { entete.classList.add('entete--pleine'); return; }
    new IntersectionObserver((es) => entete.classList.toggle('entete--pleine', !es[0].isIntersecting)).observe(sentinelle);
  }

  /* Apparition douce des blocs, une seule fois, sans jamais retenir le défilement */
  function suivreApparitions() {
    const blocs = $$('[data-apparition], [data-arcade]');
    if (!('IntersectionObserver' in window)) { blocs.forEach((b) => b.classList.add('vu')); return; }
    const obs = new IntersectionObserver((es) => {
      es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('vu'); obs.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    blocs.forEach((b) => obs.observe(b));
  }

  /* Carrousels : le doigt fait défiler nativement, les flèches aident à la souris */
  function majDefile(piste) {
    const fin = piste.scrollWidth - piste.clientWidth - 2;
    $$(`[data-defile="${piste.id}"]`).forEach((b) => {
      b.disabled = b.dataset.sens === '-1' ? piste.scrollLeft <= 2 : piste.scrollLeft >= fin;
    });
    if (piste.id === 'avis-piste') {
      const n = piste.children.length;
      const i = Math.min(n - 1, Math.round(piste.scrollLeft / Math.max(1, piste.clientWidth)));
      $('#avis-compteur').textContent = `${i + 1} / ${n}`;
    }
  }
  function suivreDefiles() {
    $$('.defile, .avis__piste').forEach((piste) => {
      let attente = false;
      piste.addEventListener('scroll', () => {
        if (attente) return;
        attente = true;
        requestAnimationFrame(() => { attente = false; majDefile(piste); });
      }, { passive: true });
      majDefile(piste);
    });
    window.addEventListener('resize', () => $$('.defile, .avis__piste').forEach(majDefile), { passive: true });
  }
  function avancer(piste, sens) {
    const premier = piste.firstElementChild;
    if (!premier) return;
    const ecart = parseFloat(getComputedStyle(piste).columnGap) || 0;
    piste.scrollBy({ left: sens * (premier.getBoundingClientRect().width + ecart), behavior: calme.matches ? 'auto' : 'smooth' });
  }

  /* ───────── Panneau de réservation de l'accueil ───────── */
  const pA = $('#p-arrivee'), pD = $('#p-depart');

  function lierDates(arrivee, depart) {
    arrivee.addEventListener('change', () => {
      if (!arrivee.value) return;
      const min = iso(ajouter(deIso(arrivee.value), 1));
      depart.min = min;
      if (!depart.value || depart.value < min) depart.value = iso(ajouter(deIso(arrivee.value), 2));
    });
  }

  function preparerDates() {
    const auj = aujourdhui();
    let a = ajouter(auj, 2);
    while (a.getDay() !== 5) a = ajouter(a, 1); // le prochain vendredi : la plupart des demandes sont des week-ends
    pA.min = iso(auj); pA.value = iso(a);
    pD.min = iso(ajouter(a, 1)); pD.value = iso(ajouter(a, 2));
    ['#d-arrivee', '#d-date-table', '#d-date-evenement'].forEach((s) => { $(s).min = iso(auj); });
    lierDates(pA, pD);
    lierDates($('#d-arrivee'), $('#d-depart'));
  }

  function verifierSejour(arrivee, depart) {
    const e = C.reservation.demande.erreurs, auj = iso(aujourdhui()), err = {};
    if (!arrivee) err.arrivee = e.obligatoire;
    else if (arrivee < auj) err.arrivee = e.datePassee;
    if (!depart) err.depart = e.obligatoire;
    else if (arrivee && depart <= arrivee) err.depart = e.departAvantArrivee;
    return err;
  }

  function borner(champ) {
    const min = Number(champ.min || 0), max = Number(champ.max || 99);
    const v = Math.round(Number(champ.value));
    champ.value = String(Math.min(max, Math.max(min, Number.isFinite(v) ? v : min)));
  }

  /* ───────── Fenêtre de demande ───────── */
  const fenetre = $('#demande'), formulaire = $('#demande-form'), merci = $('#demande-merci');
  let mode = 'sejour', offre = '';

  function effacerErreurs() {
    $$('.champ__erreur', formulaire).forEach((p) => { p.textContent = ''; });
    $$('[aria-invalid]', formulaire).forEach((c) => { c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); });
    $('#demande-erreur').textContent = '';
  }

  function ouvrirDemande(m, options) {
    const o = options || {}, d = C.reservation.demande;
    mode = ['sejour', 'table', 'evenement'].indexOf(m) >= 0 ? m : 'sejour';
    offre = o.offre || '';
    $('#demande-titre').textContent = typo(d.titres[mode]);
    $('#demande-explication').textContent = typo(d.explications[mode]);
    $$('fieldset[data-mode]', formulaire).forEach((f) => { f.hidden = f.dataset.mode !== mode; });
    const zone = $('#demande-offre');
    zone.hidden = !offre;
    zone.textContent = offre ? typo(`${d.champs.offre} : ${offre}`) : '';

    if (mode === 'sejour') {
      $('#d-arrivee').value = pA.value; $('#d-depart').value = pD.value;
      if (pA.value) $('#d-depart').min = iso(ajouter(deIso(pA.value), 1));
      $('#d-adultes').value = $('#p-adultes').value; $('#d-enfants').value = $('#p-enfants').value;
      $('#d-chambre').value = o.chambre || '';
    }
    effacerErreurs();
    merci.hidden = true; formulaire.hidden = false;
    const envoyer = $('#demande-envoyer');
    envoyer.disabled = false; envoyer.textContent = d.envoyer;

    const menu = $('#menu-plein');
    if (menu.open) menu.close();
    if (!fenetre.open) fenetre.showModal();
    fenetre.scrollTop = 0;
    const premier = mode === 'sejour' ? $('#d-nom') : $('fieldset[data-mode="' + mode + '"] input, fieldset[data-mode="' + mode + '"] select', formulaire);
    if (premier) premier.focus({ preventScroll: true });
  }

  function verifierDemande() {
    const e = C.reservation.demande.erreurs, auj = iso(aujourdhui()), err = {};
    const v = (id) => $('#' + id).value.trim();
    if (mode === 'sejour') {
      const s = verifierSejour(v('d-arrivee'), v('d-depart'));
      if (s.arrivee) err['d-arrivee'] = s.arrivee;
      if (s.depart) err['d-depart'] = s.depart;
      if (!(Number(v('d-adultes')) >= 1)) err['d-adultes'] = e.obligatoire;
    } else if (mode === 'table') {
      if (!v('d-date-table')) err['d-date-table'] = e.obligatoire;
      else if (v('d-date-table') < auj) err['d-date-table'] = e.datePassee;
      if (!(Number(v('d-couverts')) >= 1)) err['d-couverts'] = e.obligatoire;
    } else {
      if (!(Number(v('d-personnes')) >= 1)) err['d-personnes'] = e.obligatoire;
      if (v('d-date-evenement') && v('d-date-evenement') < auj) err['d-date-evenement'] = e.datePassee;
    }
    if (!v('d-nom')) err['d-nom'] = e.obligatoire;
    if (!v('d-email')) err['d-email'] = e.obligatoire;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('d-email'))) err['d-email'] = e.email;
    const chiffres = v('d-telephone').replace(/\D/g, '');
    if (!v('d-telephone')) { if (mode !== 'sejour') err['d-telephone'] = e.obligatoire; }
    else if (chiffres.length < 9) err['d-telephone'] = e.telephone;
    return err;
  }

  function montrerErreurs(err) {
    effacerErreurs();
    const ids = Object.keys(err);
    ids.forEach((id) => {
      const champ = $('#' + id), zone = $('#' + id + '-err');
      if (zone) zone.textContent = typo(err[id]);
      if (champ) { champ.setAttribute('aria-invalid', 'true'); if (zone) champ.setAttribute('aria-describedby', zone.id); }
    });
    if (ids.length) $('#' + ids[0]).focus();
    return ids.length === 0;
  }

  function lignesDemande() {
    const ch = C.reservation.demande.champs, v = (id) => $('#' + id).value.trim(), l = [];
    if (mode === 'sejour') {
      const n = nuits(v('d-arrivee'), v('d-depart'));
      l.push([ch.arrivee, dateLisible(v('d-arrivee'))], [ch.depart, `${dateLisible(v('d-depart'))} (${n} nuit${n > 1 ? 's' : ''})`]);
      l.push([ch.adultes, v('d-adultes')], [ch.enfants, v('d-enfants') || '0']);
      l.push([ch.chambre, v('d-chambre') || ch.chambreIndifferente]);
    } else if (mode === 'table') {
      l.push([ch.date, dateLisible(v('d-date-table'))], [ch.service, v('d-service')], [ch.couverts, v('d-couverts')]);
    } else {
      l.push([ch.typeEvenement, v('d-type')], [ch.personnes, v('d-personnes')]);
      if (v('d-date-evenement')) l.push([ch.date, dateLisible(v('d-date-evenement'))]);
    }
    if (offre) l.push([ch.offre, offre]);
    l.push([ch.nom, v('d-nom')], [ch.email, v('d-email')]);
    if (v('d-telephone')) l.push([ch.telephone, v('d-telephone')]);
    if (v('d-message')) l.push(['Message', v('d-message')]);
    return l;
  }

  function montrerMerci(lignes) {
    $('#merci-recap').innerHTML = lignes.filter((x) => x[0] !== 'Message').map((x) => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('');
    formulaire.hidden = true; merci.hidden = false;
    fenetre.scrollTop = 0;
    $('#merci-titre').focus({ preventScroll: true });
  }

  function envoyerDemande(ev) {
    ev.preventDefault();
    if (!montrerErreurs(verifierDemande())) return;
    const d = C.reservation.demande, e = C.etablissement;
    const lignes = lignesDemande();
    if ($('#d-piege').value) { montrerMerci(lignes); return; } // robot : faux merci, rien n'est envoyé

    const titre = d.titres[mode];
    const sujet = `${C.reservation.sujet} : ${titre}`;
    const corps = { _subject: sujet, _template: 'table', _captcha: 'false', _replyto: $('#d-email').value.trim() };
    lignes.forEach((x) => { corps[x[0]] = x[1]; });
    const courriel = `mailto:${e.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(lignes.map((x) => x[0] + ' : ' + x[1]).join('\n'))}`;

    const bouton = $('#demande-envoyer'), erreur = $('#demande-erreur');
    bouton.disabled = true; bouton.textContent = d.envoi; erreur.textContent = '';
    const adresse = (C.reservation.formsubmit || '').trim();

    const echec = (raison) => {
      console.warn('Demande non envoyée :', raison);
      bouton.disabled = false; bouton.textContent = d.envoyer;
      erreur.innerHTML = `${esc(d.erreurs.envoi)} <a href="${brut(courriel)}">${esc(e.email)}</a>`;
    };
    if (!adresse) { echec('aucune adresse FormSubmit dans contenu.json'); return; }

    fetch('https://formsubmit.co/ajax/' + adresse, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(corps)
    }).then((r) => r.json().catch(() => ({})).then((j) => {
      if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || r.status);
      montrerMerci(lignes);
    })).catch(echec);
  }

  /* ───────── Visionneuse de la galerie ───────── */
  const vis = $('#visionneuse');
  let rang = 0;

  function montrerPhoto(i) {
    const photos = C.galerie.photos, n = photos.length;
    rang = (i + n) % n;
    const p = photos[rang], img = $('#vis-image');
    if (p.petite) { img.srcset = `${p.petite} 800w, ${p.src} 1600w`; img.sizes = '100vw'; } else img.removeAttribute('srcset');
    img.src = p.src; img.alt = p.alt || '';
    $('#vis-legende').textContent = p.legende || '';
    $('#vis-compteur').textContent = `${rang + 1} / ${n}`;
    const suivante = photos[(rang + 1) % n];
    if (suivante && suivante.src) { const pre = new Image(); pre.src = window.innerWidth > 900 || !suivante.petite ? suivante.src : suivante.petite; }
  }

  function suivreVisionneuse() {
    $('#vis-prec').setAttribute('aria-label', C.galerie.precedent);
    $('#vis-suiv').setAttribute('aria-label', C.galerie.suivant);
    $('#vis-prec').addEventListener('click', () => montrerPhoto(rang - 1));
    $('#vis-suiv').addEventListener('click', () => montrerPhoto(rang + 1));
    vis.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); montrerPhoto(rang - 1); }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); montrerPhoto(rang + 1); }
    });
    // glisser du doigt (ou de la souris) vers la gauche ou la droite
    const figure = $('#vis-figure');
    let x0 = null, y0 = 0;
    figure.addEventListener('pointerdown', (ev) => { x0 = ev.clientX; y0 = ev.clientY; });
    figure.addEventListener('pointerup', (ev) => {
      if (x0 === null) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) montrerPhoto(rang + (dx < 0 ? 1 : -1));
    });
    figure.addEventListener('pointercancel', () => { x0 = null; });
  }

  /* ───────── Clics (un seul écouteur pour toute la page) ───────── */
  function suivreClics() {
    doc.addEventListener('click', (ev) => {
      const t = ev.target instanceof Element ? ev.target : null;
      if (!t) return;

      const dem = t.closest('[data-demande]');
      if (dem) { ev.preventDefault(); ouvrirDemande(dem.dataset.demande, { chambre: dem.dataset.chambre, offre: dem.dataset.offre }); return; }

      const ferme = t.closest('[data-fermer]');
      if (ferme) { const d = ferme.closest('dialog'); if (d) d.close(); return; }

      const fl = t.closest('[data-defile]');
      if (fl) { const piste = doc.getElementById(fl.dataset.defile); if (piste) avancer(piste, Number(fl.dataset.sens)); return; }

      const photo = t.closest('[data-photo]');
      if (photo) { montrerPhoto(Number(photo.dataset.photo)); if (!vis.open) vis.showModal(); return; }

      const ouvre = t.closest('[data-ouvre]');
      if (ouvre) { const d = doc.getElementById(ouvre.dataset.ouvre); if (d && !d.open) d.showModal(); return; }

      if (t.closest('#ouvrir-menu')) { $('#menu-plein').showModal(); return; }
      if (t.closest('#menu-plein-liste a')) { $('#menu-plein').close(); return; }

      const pas = t.closest('[data-pas]');
      if (pas) { const champ = doc.getElementById(pas.dataset.pour); champ.value = String(Number(champ.value || 0) + Number(pas.dataset.pas)); borner(champ); return; }

      // clic sur le fond d'une fenêtre : on la ferme
      if (t.tagName === 'DIALOG' || t.id === 'vis-figure') { const d = t.closest('dialog'); if (d && d.open) d.close(); }
    });

    $$('#p-adultes, #p-enfants, #d-adultes, #d-enfants, #d-couverts, #d-personnes').forEach((c) => c.addEventListener('change', () => borner(c)));

    $('#panneau').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const err = verifierSejour(pA.value, pD.value);
      const message = err.arrivee || err.depart || '';
      $('#panneau-erreur').textContent = typo(message);
      if (message) { (err.arrivee ? pA : pD).focus(); return; }
      ouvrirDemande('sejour');
    });
    [pA, pD].forEach((c) => c.addEventListener('input', () => { $('#panneau-erreur').textContent = ''; }));

    formulaire.addEventListener('submit', envoyerDemande);
    $('#merci-nouvelle').addEventListener('click', () => { formulaire.reset(); ouvrirDemande(mode); });

    // une photo qui ne charge pas devient un cadre « photo à venir »
    doc.addEventListener('error', (ev) => {
      const img = ev.target;
      if (!(img instanceof HTMLImageElement)) return;
      const hote = img.closest('.cadre, .arche__porte, .galerie__photo');
      if (hote && !hote.querySelector('.cadre-vide')) { img.insertAdjacentHTML('afterend', cadreVide(img.alt)); img.remove(); }
    }, true);
  }

  /* ═══════════════ Démarrage ═══════════════ */
  function demarrer(contenu) {
    C = contenu;
    relierTextes();
    $('#sections').innerHTML = [
      sUnivers(C.univers), sChambres(C.chambres), sRestaurant(C.restaurant), sAvis(C.avis),
      sOffres(C.offres), sGalerie(C.galerie), sFaq(C.faq), sContact(C.contact, C.etablissement)
    ].join('');
    dessinerPied();
    preparerDates();
    suivreClics();
    suivreVisionneuse();
    suivreDefiles();
    suivreApparitions();
    racine.classList.add('pret');

    // lien direct vers une section (#chambres…) : on y va une fois la page dessinée
    if (location.hash.length > 1) {
      const cible = doc.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (cible) cible.scrollIntoView();
    }
  }

  suivreEntete();

  fetch('contenu.json')
    .then((r) => { if (!r.ok) throw new Error('contenu.json : ' + r.status); return r.json(); })
    .then(demarrer)
    .catch((erreur) => {
      console.error('Le contenu n\'a pas pu être affiché :', erreur);
      racine.classList.add('sans-contenu'); // le contenu de secours du HTML prend le relais
    });
})();
