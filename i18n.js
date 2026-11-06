/* Maison Dev : traductions.
   Le français est écrit dans les pages (attributs data-i) et reste la langue par défaut.
   L'anglais s'affiche avec le bouton EN ou l'adresse ?lang=en ; le choix est gardé dans le navigateur.
   data-i="clé"            remplace le texte (data-html : remplace le HTML)
   data-i-attr="alt:clé"   remplace un attribut (alt, placeholder, aria-label…), plusieurs séparés par « ; » */
(function () {
  var EN = {
    /* commun */
    skip: 'Skip to content', logo: 'Maison Dev, home', nav: 'Main navigation', lang: 'Language',
    'nav-real': 'Work', 'nav-serv': 'Services', 'nav-tarifs': 'Pricing', 'nav-faq': 'FAQ', 'nav-cta': 'My free mockup',
    sister: 'Sister studio of', legal: 'Legal notice', privacy: 'Privacy', terms: 'Terms',
    'c-cta': 'Get my free mockup',

    /* haut de page */
    'h-k': 'Websites for craftspeople, restaurants and shops',
    'h-h': 'Your website, <em>finally truly yours.</em>',
    'h-p1': 'A clear, fast website that looks great on phones, so your customers find you and call you.',
    'h-p2': 'About €200 per website, free mockup within 48 h.',
    'h-cta': 'Get my free mockup', 'h-link': 'See our work',
    f1v: '<span class="n" data-to="48">48</span>&nbsp;h', f1: 'to receive your mockup',
    f2v: '<span class="n" data-to="7">7</span>&nbsp;days', f2: 'to go live',
    f3v: '€<span class="n" data-to="10">10</span>/month', f3: 'hosting and changes',
    pause: 'Pause the slideshow of websites', play: 'Play the slideshow of websites',
    alt1: "Homepage of Cédric Le Calvé's website, a writer: his name in large letters, his portrait and three of his novels on a cream background.",
    alt2: "Homepage of the FLOWZ website, a clothing brand: the FLOWZ logo in large letters on black, with a photo of the collection inside the logo's flower.",
    alt3: 'Homepage of the Maison Motion website, an animated video studio: the headline “Votre marque, en mouvement.” on cream, above a blue video.',
    alt4: 'Homepage of the Atelier Delorme mockup, a joinery in Annecy: the headline “Du bois massif, pensé pour votre maison.” on a dark wood background.',
    alt1t: "Cédric Le Calvé's website on a phone.", alt2t: 'The FLOWZ website on a phone.',
    alt3t: 'The Maison Motion website on a phone.', alt4t: 'The Atelier Delorme mockup on a phone.',

    /* réalisations */
    'r-k': 'Our work', 'r-h': 'They <em>trusted us.</em>',
    'r-p': 'Websites made by hand, one at a time. Click to visit them.',
    'r1-job': 'Writer', 'r2-job': 'Clothing brand', 'r3-job': 'Animated video studio', 'r4-job': 'Joinery · Annecy', 'r4-cap': 'Mockup',
    'r-voir': 'View the site', 'r-voir-m': 'View the mockup', 'r-tag': 'Mockup',
    'r1-sr': ' of Cédric Le Calvé (new tab)', 'r2-sr': ' of FLOWZ', 'r3-sr': ' of Maison Motion (new tab)', 'r4-sr': ' of Atelier Delorme',
    'r4-note': 'Mockup made by Maison Dev to show its work.', dots: 'Choose a project',

    /* avant / après */
    'ba-h': 'Picture your website, <em>tomorrow.</em>',
    'ba-p1': "Drag the slider: on the left, a bakery's website today. On the right, the same site rebuilt by Maison Dev.",
    'ba-p2': "That's what you get, for free, with your mockup.",
    'ba-range': 'Compare before and after', 'ba-before': 'Before', 'ba-after': 'After',
    'ba-note': 'Fictional example · every mockup is designed for your business.',
    'b-o1': '*** Welcome to our website !!! ***', 'b-o2': 'Home', 'b-o3': 'Our products', 'b-o4': 'Opening hours', 'b-o5': 'Contact', 'b-o6': 'Links',
    'b-o7': 'Welcome to Martin Bakery',
    'b-o8': 'We are a traditional bakery. Click the links on the left to discover our products. Site under construction, thank you for your understanding.',
    'b-o9': 'You are visitor no. 004127 · Last updated: 2014',
    'b-n1': 'Bread · Pastries · Hours', 'b-n2': 'Order', 'b-n3': 'ARTISAN BAKERY · SINCE 1987',
    'b-n4': 'The neighbourhood bread, <em>warm from 6 am</em>.', 'b-n5': 'Natural sourdough, local flour, home-made pastries.',
    'b-n6': 'Order for tomorrow', 'b-n7': '4.9 · 212 Google reviews', 'b-n8': 'Open', 'b-n9': 'until 7:30 pm',

    /* services */
    'sv-k': 'Services', 'sv-h': 'What we build <em>for you.</em>',
    'sv-p1': 'A website designed for one thing: turning your visitors into customers.',
    'sv-p2': 'We handle everything, from mockup to launch.',
    sv1h: 'Business website', sv1p: 'For shops, trades, practices and freelancers: present your business, build trust and get found on Google.',
    sv2h: 'Single page', sv2p: 'One page to launch a product, an offer or an event, and turn every visit into a request.',
    sv3h: 'Redesign', sv3p: "Your site already exists but it's slow, dated or unreadable on phones? We rebuild it, with your content.",
    sv4h: 'Care plan', sv4p: 'Hosting, security, backups and small changes. One email is enough, we handle the rest.',
    'p-big': '€200 per website, on average.',
    'p-big-t1': 'Between €150 and €250 depending on the content:',
    'p-big-t2': 'a simple page costs less, a site with many pages or connected information a little more.',
    'p-month': '<strong>€10 per month</strong>, no commitment: hosting, domain name and changes.',
    'p-link': 'See detailed pricing',

    /* méthode */
    'm-k': 'Process', 'm-h': 'Simple, from start <em>to finish.</em>',
    'm-p': 'Nothing technical for you to handle. We do everything, you approve.',
    s1h: 'Free mockup', s1p: 'Within 48 h, you get a mockup of your future homepage. Free, no commitment.',
    s2h: 'Approval', s2p: 'We fine-tune the texts, colours and photos with you. Two rounds of changes included.',
    s3h: 'Launch', s3p: 'Your site goes live on your own domain name, fast and secure.',
    s4h: 'We stay around', s4p: 'A change, a new photo, an offer to add? One email is enough.',

    /* qui est derrière */
    'ab-k': 'Who is behind it', 'ab-h': 'An engineering student, <em>not an agency.</em>',
    'ab-p1a': 'Maison Dev is Léo, a computer engineering student at INSA Lyon.',
    'ab-p1b': 'I design and code every website myself, from mockup to launch: you always talk to the same person.',
    'ab-p2': "No office or sales team to pay for: that's why my prices are far below an agency's.",
    'ab-c1': 'Business website at an agency:', 'ab-c1v': '€1,500 to €5,000',
    'ab-c2': 'With Maison Dev:', 'ab-c2v': 'about €200',

    /* FAQ */
    'q-k': 'FAQ', 'q-h': 'Frequently asked <em>questions.</em>',
    q1: 'How long does it take?', q1a: 'The mockup arrives within 48 h. The full site is live 5 to 7 days after you approve it.',
    q2: 'I have no texts or photos, is that a problem?', q2a: 'No. We write the texts with you after a short chat, and use your photos or quality royalty-free images.',
    q3: 'Can I edit my site myself?', q3a: "Yes, if you want to. Otherwise, with the €10/month care plan, just send an email and it's done.",
    q4: 'Are the domain name and hosting included?', q4a1: 'Yes, for the first year.',
    q4a2: 'After that, the €10/month care plan covers hosting, or you can move everything to your own host.',
    q5: 'How does payment work?', q5a: '50% when you approve the mockup, 50% at launch. You pay nothing to receive the mockup.',
    q6: 'How much does a website cost, exactly?', q6a: 'About €200, between €150 and €250 depending on the content. You know the exact price before you say yes.',

    /* contact */
    'c-h': 'Your mockup, <em>on us.</em>',
    'c-p1': 'Three lines are enough.', 'c-p2': 'You get a mockup of your future homepage within 48 h, free and with no commitment.',
    'lf-biz': 'Your business and city', 'lf-biz-ph': 'Martin Bakery, Lyon',
    'lf-site': 'Current website (optional)', 'lf-site-ph': 'martin-bakery.com',
    'lf-contact': 'Your email or phone', 'lf-contact-ph': 'you@example.com', 'lf-or': 'Prefer to write?',
    'lf-sending': 'Sending…', 'lf-ok': "Thank you! You'll hear from us within 24 h, and your mockup follows within 48 h.",
    'lf-err': 'Please fill in your business and an email or phone number.',
    'lf-again': 'Please check your details, then click the button again.',
    'lf-fail': 'The form could not be sent, so your mail app opens with the message ready.',
    'mail-subject': 'My free mockup',

    /* tarifs */
    't-k': 'Pricing', 't-h': 'Clear prices, <em>no surprises.</em>',
    't-p1': 'You first get a free mockup of your homepage.',
    't-p2': 'You know the exact price before you say yes, and you pay nothing until you like the mockup.',
    't1-h': 'Your website', 't1-from': 'about', 't1-p': 'Between €150 and €250 depending on the content.',
    't1-l1': 'A simple page', 't1-l1v': 'from €150', 't1-l2': 'Many pages or connected information', 't1-l2v': 'up to €250',
    't1-i1': 'Homepage mockup on us, within 48 h', 't1-i2': 'Two rounds of changes included',
    't1-i3': 'Online on your own domain name within 7 days', 't1-i4': 'Domain name and hosting included the first year',
    't2-h': 'Care plan', 't2-u': 'per month', 't2-p': 'No commitment: hosting, domain name and changes.',
    't2-i1': 'Hosting, security and backups', 't2-i2': 'Small changes: a text, a photo, an offer',
    't2-i3': 'One email is enough, we handle the rest',
    't3-h': 'Payment', 't3-p': '50% when you approve the mockup, 50% at launch. You pay nothing to receive the mockup.',
    't-vs': 'For comparison: an agency often charges <s>€1,500 to €5,000</s> for a business website. Here it is <b>about €200</b>, with a free mockup.',
    't-ch': 'Your mockup, <em>on us.</em>',

    /* 404 */
    'nf-h': "This page <em>doesn't exist.</em>",
    'nf-p': 'The link may be incomplete. Everything else is here: our websites, our prices, and your free mockup within 48 h.',
    'nf-home': 'Back to the homepage'
  };

  /* textes qui ne sont pas dans la page (messages du formulaire, boutons) */
  var FR_JS = {
    'lf-sending': 'Envoi…', 'lf-ok': 'Merci\u00a0! Vous avez une réponse sous 24\u00a0h, et votre maquette sous 48\u00a0h.',
    'lf-err': 'Indiquez votre entreprise et un e-mail ou un téléphone.',
    'lf-again': 'Vérifiez vos informations, puis cliquez à nouveau sur le bouton.',
    'lf-fail': "Le formulaire n'a pas pu partir\u00a0: votre messagerie s'ouvre avec le message prêt à envoyer.",
    pause: 'Mettre en pause le défilement des sites', play: 'Relancer le défilement des sites',
    'mail-subject': 'Ma maquette gratuite'
  };

  var doc = document, root = doc.documentElement, FR = {};
  var each = function (sel, fn) { Array.prototype.forEach.call(doc.querySelectorAll(sel), fn); };
  var attrPairs = function (el) {
    return el.getAttribute('data-i-attr').split(';').map(function (p) { var i = p.indexOf(':'); return [p.slice(0, i).trim(), p.slice(i + 1).trim()]; });
  };
  each('[data-i]', function (el) { var k = el.getAttribute('data-i'); if (!(k in FR)) FR[k] = el.hasAttribute('data-html') ? el.innerHTML : el.textContent; });
  each('[data-i-attr]', function (el) { attrPairs(el).forEach(function (p) { if (!(p[1] in FR)) FR[p[1]] = el.getAttribute(p[0]) || ''; }); });
  for (var k in FR_JS) if (!(k in FR)) FR[k] = FR_JS[k];

  var TITLE_FR = doc.title;
  var api = {
    lang: 'fr',
    t: function (key) { var v = (api.lang === 'en' ? EN : FR)[key]; return v != null ? v : FR[key]; },
    set: setLang
  };

  function setLang(l) {
    var D = l === 'en' ? EN : FR;
    api.lang = l;
    root.lang = l;
    each('[data-i]', function (el) {
      var v = D[el.getAttribute('data-i')]; if (v == null) return;
      if (el.hasAttribute('data-html')) { if (el.innerHTML !== v) el.innerHTML = v; } else if (el.textContent !== v) el.textContent = v;
    });
    each('[data-i-attr]', function (el) { attrPairs(el).forEach(function (p) { var v = D[p[1]]; if (v != null) el.setAttribute(p[0], v); }); });
    var fr = doc.getElementById('b-fr'), en = doc.getElementById('b-en');
    if (fr) fr.setAttribute('aria-pressed', l === 'fr');
    if (en) en.setAttribute('aria-pressed', l === 'en');
    var mb = doc.getElementById('mailbtn');
    if (mb) mb.href = 'mailto:contact@maison-dev.com?subject=' + encodeURIComponent(api.t('mail-subject'));
    doc.title = l === 'en' ? (root.getAttribute('data-title-en') || TITLE_FR) : TITLE_FR;
    try { localStorage.setItem('lang', l); } catch (e) { /* stockage indisponible : la langue reste celle de la page */ }
    doc.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  }

  var fr = doc.getElementById('b-fr'), en = doc.getElementById('b-en');
  if (fr) fr.addEventListener('click', function () { setLang('fr'); });
  if (en) en.addEventListener('click', function () { setLang('en'); });

  /* français par défaut : cette adresse est la page française (les moteurs de recherche l'indexent en français) */
  var L = 'fr';
  try { L = localStorage.getItem('lang') || 'fr'; } catch (e) { /* idem */ }
  var q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'fr') setLang(q);
  else if (L === 'en') setLang('en');

  window.MD = api;
})();
