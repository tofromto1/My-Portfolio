// 페이지를 새로 열면 항상 TOP에서 시작
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }

  window.scrollTo(0, 0);
});

const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const clamp = (n,min,max)=>Math.min(max,Math.max(min,n));

// Hero intro: blurred scene -> two circles roll in -> scene focuses -> title rises.
// Stages are deliberately separated so the motion is visible instead of finishing during page load.
window.addEventListener('load',()=>{
  setTimeout(()=>document.body.classList.add('intro-circles'),220);
  setTimeout(()=>document.body.classList.add('intro-focus'),1750);
  setTimeout(()=>document.body.classList.add('intro-copy'),2650);
});

// Skills: only edit data-level="75" in HTML; bar + number follow automatically.
const skillObserver = new IntersectionObserver((entries,obs)=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    const skill=entry.target, target=clamp(Number(skill.dataset.level)||0,0,100);
    $('.skill-fill',skill).style.width=target+'%';
    const value=$('.skill-value',skill); let start=null;
    const tick=t=>{if(!start)start=t;const p=clamp((t-start)/1100,0,1);value.textContent=Math.round(target*(1-Math.pow(1-p,3)))+'%';if(p<1)requestAnimationFrame(tick)};
    requestAnimationFrame(tick); obs.unobserve(skill);
  });
},{threshold:.45});
$$('.skill').forEach(s=>skillObserver.observe(s));

// Desktop works: normal vertical scroll drives the horizontal screening track.
// The previous prototype tried to parse --page-x (= clamp(...)) as a number, which became NaN, so the track stayed still.
const works=$('.works'), track=$('#worksTrack'), progressBar=$('#worksProgress');
let worksMaxMove=0;
function configureWorks(){
  if(innerWidth<=820){
    works.style.height='auto';
    worksMaxMove=0;
    track.style.transform='none';
    return;
  }
  worksMaxMove=Math.max(0,track.scrollWidth-innerWidth);
  // Give roughly one vertical pixel of scroll for one horizontal pixel of travel, plus a short breathing hold.
  works.style.height=Math.ceil(innerHeight + worksMaxMove + innerHeight*.42)+'px';
}
function updateWorks(){
  if(innerWidth<=820){track.style.transform='none';return;}
  const rect=works.getBoundingClientRect();
  const scrollable=Math.max(1,works.offsetHeight-innerHeight);
  const progress=clamp(-rect.top/scrollable,0,1);
  track.style.transform=`translate3d(${-worksMaxMove*progress}px,0,0)`;
  progressBar.style.width=(progress*100)+'%';
}

// Ending: blur -> email -> black wipe -> END -> -ing.
const ending=$('.ending'), endingSticky=$('#endingSticky');
function updateEnding(){
  const r=ending.getBoundingClientRect(); const total=ending.offsetHeight-innerHeight; const p=clamp(-r.top/total,0,1);
  const contact = p<.17?0 : p<.32?(p-.17)/.15 : p<.48?1 : p<.59?1-(p-.48)/.11:0;
  const blur=clamp(p/.45,0,1); const curtain=clamp((p-.44)/.25,0,1);
  // Keep the email -> END timing almost unchanged, but let END breathe much longer before -ing.
  const endOpacity=p<.69?0:p<.77?(p-.69)/.08:p<.91?1:p<.95?1-(p-.91)/.04:0;
  const ingOpacity=p<.972?0:clamp((p-.972)/.023,0,1);
  endingSticky.style.setProperty('--contact-opacity',contact.toFixed(3));
  endingSticky.style.setProperty('--end-blur',blur.toFixed(3));
  endingSticky.style.setProperty('--darkness',clamp((p-.36)/.3,0,1).toFixed(3));
  endingSticky.style.setProperty('--curtain',curtain.toFixed(3));
  endingSticky.style.setProperty('--end-opacity',endOpacity.toFixed(3));
  endingSticky.style.setProperty('--end-y',(p>.91?(-72*clamp((p-.91)/.055,0,1)):0)+'px');
  endingSticky.style.setProperty('--ing-opacity',ingOpacity.toFixed(3));
  endingSticky.style.setProperty('--ing-y',(48*(1-ingOpacity))+'px');
  endingSticky.style.setProperty('--credit-opacity',p>.71?clamp((p-.71)/.08,0,.72):0);
}

// Header tone follows bright/dark sections.
const header=$('#siteHeader');
function updateHeader(){
  const y=innerHeight*.18;
  const dark = [works,ending].some(sec=>{const r=sec.getBoundingClientRect();return r.top<y&&r.bottom>y});
  header.classList.toggle('nav-light',dark);
}
let ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{updateWorks();updateEnding();updateHeader();ticking=false})}
function onResize(){configureWorks();onScroll()}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onResize);
configureWorks();
requestAnimationFrame(onScroll);

// Project modal skeleton. Replace the # hrefs with project-01.html etc. later.
const modal=$('#projectModal'), closeBtn=$('.modal-close'), modalVisual=$('#modalVisual'), viewProject=$('#viewProject');
function openModal(card,index){
  $('#modalTitle').textContent=card.dataset.title; $('#modalCategory').textContent=card.dataset.category; $('#modalDesc').textContent=card.dataset.desc;
  $('#modalNumber').textContent=String(index+1).padStart(2,'0'); modalVisual.style.setProperty('--modal-art',card.dataset.art); modalVisual.style.background=card.dataset.art;
  const href=card.dataset.href||'#'; modalVisual.href=href; viewProject.href=href;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; closeBtn.focus();
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
$$('.work-card').forEach((card,i)=>{card.addEventListener('click',()=>openModal(card,i));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(card,i)}})});
closeBtn.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
modal.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.getAttribute('href')==='#')e.preventDefault()});
