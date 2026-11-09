/* Maison Dev · comportements communs des maquettes.
   Optionnel dans la page : window.HORAIRES = {1:[["09:00","12:00"],["14:00","18:00"]], ...} (0 = dimanche),
   window.SAISON = {debut:"2026-12-12", fin:"2027-04-16"} pour un commerce saisonnier. */
(function(){
  var d=document;
  // Navigation opaque au défilement
  var nav=d.querySelector('.nav');
  function onScroll(){
    if(nav)nav.classList.toggle('solid',scrollY>20);
    var bar=d.querySelector('.callbar'),hero=d.querySelector('.hero');
    if(bar&&hero)bar.classList.toggle('show',scrollY>hero.offsetHeight*0.6);
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Titres découpés en mots qui montent
  d.querySelectorAll('.hl').forEach(function(h){
    var html=h.innerHTML.split(/(<[^>]+>)/).map(function(part){
      if(part.charAt(0)==='<')return part;
      return part.split(/(\s+)/).map(function(w){return /^\s*$/.test(w)?w:'<span class="w"><span>'+w+'</span></span>'}).join('');
    }).join('');
    h.innerHTML=html;
    h.querySelectorAll('.w>span').forEach(function(s,i){s.style.transitionDelay=(i*0.06)+'s'});
  });

  // Apparitions
  var els=d.querySelectorAll('.rv,.hl');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){io.observe(e)});
  }else els.forEach(function(e){e.classList.add('in')});
  setTimeout(function(){d.querySelectorAll('.hero .rv,.hero .hl').forEach(function(e){e.classList.add('in')})},60);

  // Heure de Paris
  function parisNow(){
    try{
      var p=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',weekday:'short',hour:'2-digit',minute:'2-digit',year:'numeric',month:'2-digit',day:'2-digit',hour12:false}).formatToParts(new Date());
      var o={};p.forEach(function(x){o[x.type]=x.value});
      var days={'dim.':0,'lun.':1,'mar.':2,'mer.':3,'jeu.':4,'ven.':5,'sam.':6};
      return {day:days[o.weekday],min:(+o.hour%24)*60+(+o.minute),date:o.year+'-'+o.month+'-'+o.day};
    }catch(e){var n=new Date();return {day:n.getDay(),min:n.getHours()*60+n.getMinutes(),date:n.toISOString().slice(0,10)}}
  }
  function hh(s){return s.replace(/^0/,'').replace(':','h').replace('h00','h')}
  function toMin(s){var a=s.split(':');return +a[0]*60+(+a[1])}
  var now=parisNow();

  // Ligne du jour dans le tableau des horaires
  var row=d.querySelector('.hours tr[data-day="'+now.day+'"]');if(row)row.classList.add('today');

  // Pastille « ouvert / fermé »
  var pill=d.querySelector('[data-status]');
  if(pill&&window.HORAIRES){
    var txt=pill.querySelector('span'),H=window.HORAIRES,S=window.SAISON;
    var noms=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    var horsSaison=S&&(now.date<S.debut||now.date>S.fin);
    if(horsSaison&&now.date<S.debut){
      var j=Math.ceil((new Date(S.debut+'T09:00:00')-new Date())/864e5);
      txt.textContent=pill.getAttribute('data-avant')||('Ouverture de la saison dans '+j+' jours');
      txt.textContent=txt.textContent.replace('{j}',j);
    }else{
      var plages=H[now.day]||[],ouvert=false,fin='';
      plages.forEach(function(p){if(now.min>=toMin(p[0])&&now.min<toMin(p[1])){ouvert=true;fin=p[1]}});
      if(ouvert){pill.classList.add('open');txt.textContent='Ouvert maintenant · jusqu’à '+hh(fin)}
      else{
        var msg='Fermé pour le moment';
        for(var k=0;k<8;k++){
          var dd=(now.day+k)%7,pl=H[dd]||[];
          for(var m=0;m<pl.length;m++){
            if(k===0&&toMin(pl[m][0])<=now.min)continue;
            msg='Fermé · ouvre '+(k===0?'à ':k===1?'demain à ':noms[dd]+' à ')+hh(pl[m][0]);
            k=9;break;
          }
        }
        txt.textContent=msg;
      }
    }
  }

  // Photo qui ne charge pas : on la remplace par un cadre « vos photos ici »
  d.querySelectorAll('figure.ph-img img').forEach(function(img){
    function fallback(){
      var f=img.closest('figure');if(!f||f.dataset.done)return;f.dataset.done=1;
      var div=d.createElement('div');div.className=('ph '+f.className.replace('ph-img','')+(f.classList.contains('rv')?' in':'')).replace(/\s+/g,' ').trim();if(f.getAttribute('style'))div.setAttribute('style',f.getAttribute('style'));
      div.innerHTML='<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></svg><b>Vos photos ici</b><small>'+(img.alt||'')+'</small></div>';
      f.replaceWith(div);
    }
    if(img.complete&&img.naturalWidth===0)fallback();else img.addEventListener('error',fallback);
  });

  // Bloc « fonction en option » : boutons à choix et envoi simulé
  d.querySelectorAll('.chips').forEach(function(c){
    c.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.preventDefault();
      if(!c.hasAttribute('data-multi'))c.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});
      b.classList.toggle('on')});
  });
  d.querySelectorAll('form[data-demo]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();var ok=f.querySelector('.ok');if(ok){ok.style.display='block'}});
  });

  // Année du pied de page
  d.querySelectorAll('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
})();
