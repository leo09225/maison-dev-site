(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));

/* ---------- word splitting ---------- */
function splitEl(el){
  const walk=(node,wrapEm)=>{
    const out=document.createDocumentFragment();
    node.childNodes.forEach(n=>{
      if(n.nodeType===3){
        n.textContent.split(/(\s+)/).forEach(tok=>{
          if(!tok)return;
          if(/^\s+$/.test(tok)){out.appendChild(document.createTextNode(' '));return;}
          const w=document.createElement('span');w.className='w';const i=document.createElement('span');
          if(wrapEm){const e=document.createElement('em');e.textContent=tok;i.appendChild(e)}else i.textContent=tok;
          w.appendChild(i);out.appendChild(w);
        });
      }else if(n.nodeName==='EM'){out.appendChild(walk(n,true));}
      else out.appendChild(n.cloneNode(true));
    });
    return out;
  };
  const f=walk(el,false);el.innerHTML='';el.appendChild(f);
  el.querySelectorAll('.w>span').forEach((s,k)=>s.style.transitionDelay=(k*0.06)+'s');
}
function splitStatement(){
  const p=$('#stmt');if(!p)return;
  const txt=p.textContent;let acc=false;p.innerHTML='';
  txt.split(/(\s+)/).forEach(tok=>{
    if(!tok)return;if(/^\s+$/.test(tok)){p.appendChild(document.createTextNode(' '));return;}
    let t=tok,isAcc=acc;
    if(t.startsWith('*')){isAcc=true;acc=true;t=t.slice(1)}
    if(t.includes('*')){isAcc=true;acc=false;t=t.replace('*','')}
    const s=document.createElement('span');s.className='wd'+(isAcc?' acc':'');s.textContent=t;p.appendChild(s);
  });
}
function prepText(){
  $$('.split').forEach(el=>{const wasGo=el.classList.contains('go');el.classList.remove('go');splitEl(el);if(wasGo)requestAnimationFrame(()=>el.classList.add('go'))});
  splitStatement();
}
prepText();
document.addEventListener('langchange',prepText);

/* ---------- reveal ---------- */
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('go');io.unobserve(x.target);if(x.target.id==='ba')sweepBA()}}),{threshold:.18});
const heroItems=$$('.hero2 .fade-up, .hero2 .split');
heroItems.forEach((el,k)=>setTimeout(()=>el.classList.add('go'),RM?0:120+k*110));
$$('.fade-up, .split').forEach(el=>{if(!el.closest('.hero2'))io.observe(el)});
$$('.reveal').forEach(el=>el.classList.add('in'));

/* ---------- counters ---------- */
setTimeout(()=>$$('.count').forEach(c=>{const to=+c.dataset.to,t0=performance.now(),d=1400;
  const f=t=>{const u=clamp((t-t0)/d);c.textContent=Math.round(to*(1-Math.pow(1-u,3)));if(u<1)requestAnimationFrame(f)};requestAnimationFrame(f)}),RM?0:700);

/* ---------- before/after auto sweep ---------- */
function sweepBA(){const ba=$('#ba');if(!ba||RM)return;const inp=ba.querySelector('input');const t0=performance.now();
  const f=t=>{const u=(t-t0)/2600;if(u>1){ba.style.setProperty('--x','50%');inp.value=50;return}
    const x=50+38*Math.sin(u*Math.PI*2)*(1-u*.3);ba.style.setProperty('--x',x+'%');inp.value=x;requestAnimationFrame(f)};
  setTimeout(()=>requestAnimationFrame(f),400);}

/* ---------- mouse: blob, tilt, magnets ---------- */
const blob=$('#blob'),tilt=$('#tilt');
if(!RM&&matchMedia('(pointer:fine)').matches){
  addEventListener('mousemove',e=>{
    const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
    if(blob)blob.style.transform=`translate(${x*120}px,${y*90}px)`;
    if(tilt&&scrollY<innerHeight)tilt.style.transform=`rotateY(${x*10}deg) rotateX(${-y*8}deg)`;
  });
  $$('.magnet').forEach(b=>{
    b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});
    b.addEventListener('mouseleave',()=>b.style.transform='');
  });
}

/* ---------- scroll engine ---------- */
const prog=$('#prog'),hdr=$('#hdr'),build=$('#build'),bbar=$('#bbar'),steps=$$('.bstep'),hz=$('#services'),rail=$('#rail'),mq=$('#mq'),mfill=$('#mfill'),mline=$('#mline');
const darks=$$('[data-dark]');const pxs=$$('.px');
let lastY=scrollY,vel=0,mqX=0,lastT=performance.now();
const wide=()=>innerWidth>900;
function frame(t){
  const dt=Math.min(64,t-lastT);lastT=t;
  const y=scrollY,H=innerHeight,doc=document.documentElement.scrollHeight-H;
  vel+=((y-lastY)-vel)*.15;lastY=y;
  prog.style.width=(y/doc*100)+'%';
  hdr.classList.toggle('scrolled',y>30);
  // dark sections
  let dark=false;darks.forEach(s=>{const r=s.getBoundingClientRect();if(r.top<H*.55&&r.bottom>H*.45)dark=true});
  document.body.classList.toggle('dark',dark);
  // marquee
  if(mq&&!RM){mqX-=(0.04*dt)+Math.abs(vel)*.35;const w=mq.scrollWidth/2;if(-mqX>w)mqX+=w;mq.style.transform=`translateX(${mqX}px)`}
  // statement
  const st=$('#stmt');if(st){const r=st.getBoundingClientRect();const u=clamp((H*.85-r.top)/(r.height+H*.35));const ws=st.querySelectorAll('.wd');const n=Math.round(u*ws.length);ws.forEach((w,k)=>w.classList.toggle('on',RM||k<n))}
  // build
  if(build){
    let u;
    if(wide()&&!RM){const r=build.getBoundingClientRect();u=clamp(-r.top/(r.height-H))}
    else{const r=build.getBoundingClientRect();u=clamp((H*.7-r.top)/(r.height))}
    const s=Math.min(3,Math.floor(u*4.0001));
    if(build.dataset.s!=String(s)){build.dataset.s=s;steps.forEach((e,k)=>e.classList.toggle('on',k<=s))}
    bbar.style.width=(u*100)+'%';
  }
  // horizontal rail
  if(hz&&rail&&wide()&&!RM){const r=hz.getBoundingClientRect();const u=clamp(-r.top/(r.height-H));const max=rail.scrollWidth-innerWidth+Math.max(24,(innerWidth-1160)/2+24);rail.style.transform=`translateX(${-u*max}px)`}
  // method line
  if(mline&&mfill){const r=mline.getBoundingClientRect();mfill.style.width=(clamp((H*.8-r.top)/(H*.6))*100)+'%'}
  // parallax
  pxs.forEach(im=>{const r=im.getBoundingClientRect();const u=(r.top+r.height/2-H/2)/H;im.style.transform=`scale(1.1) translateY(${u*-30}px)`});
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
