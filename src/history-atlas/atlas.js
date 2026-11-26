import {routeHref} from '../site-routes.js';
import worldLand from './world-land.svg?url';
import './atlas.css';

import {markets} from './markets.js';

const metrics = [
  {value:3, label:['管路系列','Piping series']},
  {value:6, label:['应用领域','Applications']},
  {value:2000, label:['创立年份','Year founded']}
];

export function mountAtlas(host, {lang='en', onInquire}={}) {
  const root = document.createElement('div');
  root.className = 'mh-atlas';
  const illustration = new URL(worldLand, location.href).href;
  root.innerHTML = `<div class="mh-atlas__inside">
    <div class="mh-atlas__head">
      <div class="mh-atlas__intro"><h2></h2><p></p></div>
      <dl class="mh-atlas__facts"></dl>
    </div>
    <div class="mh-atlas__map">
      <img class="mh-atlas__land" alt="" aria-hidden="true">
      <div class="mh-atlas__light" aria-hidden="true"><img alt=""></div>
      <nav class="mh-atlas__markets"></nav>
    </div>
  </div>`;
  host.replaceChildren(root);
  const title=root.querySelector('h2'), intro=root.querySelector('.mh-atlas__intro p');
  const titleEnglish = document.createElement('small');
  titleEnglish.className = 'mh-heading-english';
  titleEnglish.lang = 'en';
  titleEnglish.setAttribute('aria-hidden','true');
  titleEnglish.textContent = 'Global distribution';
  const facts=root.querySelector('.mh-atlas__facts'), map=root.querySelector('.mh-atlas__map');
  const light=root.querySelector('.mh-atlas__light'), nav=root.querySelector('nav');
  root.querySelectorAll('.mh-atlas__map img').forEach(image => {
    image.src=illustration; image.decoding='async'; image.draggable=false;
  });
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let locale=0, hovered=null, focused=null;
  let numberFrame=0, focusFrame=0, targetX=50, targetY=45, pointX=50, pointY=45;
  const numbers=metrics.map(metric => {
    const group=document.createElement('div'), term=document.createElement('dt'), number=document.createElement('dd');
    group.append(term, number); facts.append(group);
    number.textContent=String(metric.value);
    return {term, number};
  });
  const links=markets.map((market,index) => {
    const link=document.createElement('a'), dot=document.createElement('span');
    const caption=document.createElement('span');
    link.className='mh-atlas__pin';
    link.style.left=market.x+'%'; link.style.top=market.y+'%';
    link.style.setProperty('--delay',index*90+'ms');
    dot.className='mh-atlas__point'; caption.className='mh-atlas__caption';
    link.append(dot,caption);nav.append(link);
    link.addEventListener('pointerenter', event=>{
      if(event.pointerType!=='touch'){hovered=index; highlight();}
    });
    link.addEventListener('pointerleave', ()=>{hovered=null; highlight();});
    link.addEventListener('focus', ()=>{focused=index;highlight();});
    link.addEventListener('blur', ()=>{focused=null;highlight();});
    link.addEventListener('click', event=>{
      if(typeof onInquire!=='function' || event.defaultPrevented || event.button!==0 ||
          event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault(); event.stopPropagation(); onInquire(market.name[locale]);
    });
    return {link, caption};
  });
  function setLight(x,y) {
    light.style.setProperty('--focus-x',x+'%');
    light.style.setProperty('--focus-y',y+'%');
  }
  function highlight() {
    const index=hovered ?? focused;
    if(index==null) {
      map.removeAttribute('data-active');cancelAnimationFrame(focusFrame);return;
    }
    const market=markets[index];
    targetX=market.x; targetY=market.y;
    if (!map.hasAttribute('data-active') || motion.matches) {
      pointX=targetX;pointY=targetY;setLight(pointX,pointY);
    }
    map.dataset.active=String(index);
    links.forEach(({link},i)=>link.classList.toggle('is-active',index===i));
    cancelAnimationFrame(focusFrame);
    if(!motion.matches) {
      const ox=pointX,oy=pointY,start=performance.now();
      function step(now) {
        const t=Math.min((now-start)/480,1), eased=1-(1-t)**3;
        pointX=ox+(targetX-ox)*eased;pointY=oy+(targetY-oy)*eased;
        setLight(pointX,pointY);
        if (t<1) focusFrame=requestAnimationFrame(step);
      }
      focusFrame=requestAnimationFrame(step);
    }
  }
  function completeNumbers() {
    cancelAnimationFrame(numberFrame);
    numbers.forEach(({number},i)=>{number.textContent=String(metrics[i].value);});
  }
  function animateNumbers() {
    if(motion.matches){completeNumbers();return;}
    const start=performance.now();
    function step(now) {
      const t=Math.min((now-start)/780,1), eased=1-(1-t)**3;
      // A founding year is a date and stays fixed while the two quantities count up.
      numbers.slice(0,2).forEach(({number},i)=>{
        number.textContent=String(1+Math.floor((metrics[i].value-1)*eased));
      });
      if(t<1)numberFrame=requestAnimationFrame(step);
    }
    numberFrame=requestAnimationFrame(step);
  }
  function update(language) {
    locale=language==='zh'?0:1;
    title.textContent=locale===0?'全球经销合作':titleEnglish.textContent;
    if (locale===0) title.append(titleEnglish);
    intro.textContent=['选择您所在的地区，与岷河洽谈经销合作。','Select your region to discuss distribution with MH PIPE.'][locale];
    nav.setAttribute('aria-label',['按地区洽谈经销合作','Distribution enquiries by region'][locale]);
    host.setAttribute('aria-label',title.textContent);
    numbers.forEach(({term},i)=>{term.textContent=metrics[i].label[locale];});
    links.forEach(({link,caption},i)=>{
      const name=markets[i].name[locale];
      const query=new URLSearchParams({intent:'distribution',market:name,lang:locale?'en':'zh'});
      link.href=routeHref('/contact?'+query.toString()+'#contact-inquiry');
      link.setAttribute('aria-label',locale?'Discuss distribution in '+name:name+'经销合作咨询');
      caption.textContent=name;
    });
  }
  const numbersObserver = new IntersectionObserver(([entry])=>{
    if(entry.intersectionRatio<.2)return;
    numbersObserver.disconnect();animateNumbers();
  },{threshold:.2});
  const mapObserver = new IntersectionObserver(([entry])=>{
    root.classList.toggle('in-view',entry.isIntersecting);
    if(entry.intersectionRatio>=.075)root.classList.add('arrived');
  },{threshold:[0,.075]});
  const preference=()=>{if(motion.matches){completeNumbers();cancelAnimationFrame(focusFrame);if(map.hasAttribute('data-active'))setLight(targetX,targetY);}};
  motion.addEventListener('change',preference);
  update(lang); numbersObserver.observe(facts); mapObserver.observe(map);
  return {update, dispose(){
    numbersObserver.disconnect();mapObserver.disconnect();cancelAnimationFrame(numberFrame);cancelAnimationFrame(focusFrame);
    motion.removeEventListener('change',preference);root.remove();
  }};
}

