import {routeHref} from './site-routes.js';
import React, {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {ArrowUpRight, ChevronLeft, ChevronRight, Maximize2} from 'lucide-react';
import HomeLaboratory from './HomeLaboratory.jsx';
import './home-manufacturing-chapter.css';

const stations = [
  {file:'tube-making.webp', position:'54% 55%', title:['Tube mill','制管生产线'],
    caption:['Stainless steel strip feeds from the coils into the tube mill.','不锈钢带从卷料架送入制管机组。']},
  {file:'forming.webp', position:'56% 48%', title:['Hydroforming','管件水胀成形'],
    caption:['At the hydroforming press, the die gives each fitting its shape.','管坯装入模具，在内压作用下成形。']},
  {file:'heat-treatment.webp', position:'54% 51%', title:['Heat treatment','热处理工位'],
    caption:['A row of fittings moves through the furnace on the conveyor.','一排管件随输送带通过热处理炉。']},
];

const stationAt = cursor => stations[((cursor % stations.length) + stations.length) % stations.length];

function ProductionFigures({zh}) {
  const band = useRef(null);
  const completed = useRef(false);

  useEffect(() => {
    const numbers = [...band.current.querySelectorAll('[data-value]')];
    const gsap = window.gsap;
    if (!gsap || completed.current) return;
    const preferences = gsap.matchMedia();
    preferences.add('(prefers-reduced-motion: no-preference)', () => {
      const counter = {progress:0};
      const draw = value => numbers.forEach(node => {
        node.textContent = Math.round(1 + (Number(node.dataset.value) - 1) * value);
      });
      draw(0);
      const tween = gsap.to(counter, {
        progress:1, duration:1.55, ease:'power2.out', paused:true,
        onUpdate:() => draw(counter.progress),
        onComplete:() => { completed.current = true; },
      });
      const root = document.documentElement;
      let visible = false;
      const sync = () => tween.paused(!visible || document.hidden ||
        root.dataset.dialogOpen === 'true' || root.dataset.navOpen === 'true');
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting; sync();
      });
      observer.observe(band.current);
      const overlays = new MutationObserver(sync);
      overlays.observe(root,{attributes:true,attributeFilter:['data-nav-open','data-dialog-open']});
      document.addEventListener('visibilitychange',sync);
      return () => {
        observer.disconnect(); overlays.disconnect();
        document.removeEventListener('visibilitychange',sync);
        tween.kill(); draw(1);
      };
    });
    return () => preferences.revert();
  }, [zh]);

  return <div className="hmf-figures" ref={band}>
    <div className="hmf-stat">
      <span>{zh?'管材年生产规模':'Annual pipe production'}</span>
      <strong aria-label={zh?'三千余万米':'More than thirty million metres'}>
        <b aria-hidden="true"><span data-value={zh?3000:30}>{zh?3000:30}</span>{!zh && '+'}</b>
        <em aria-hidden="true">{zh?'余万米':'million metres'}</em>
      </strong>
    </div>
    <div className="hmf-stat">
      <span>{zh?'管件及附件年生产规模':'Annual fittings and accessories production'}</span>
      <strong aria-label={zh?'五千万件':'Fifty million pieces'}>
        <b data-value={zh?5000:50} aria-hidden="true">{zh?5000:50}</b>
        <em aria-hidden="true">{zh?'万件':'million pieces'}</em>
      </strong>
    </div>
    <a className="hmf-source" href="/downloads/minhe-company-brochure-2024-zh.pdf" target="_blank" rel="noreferrer">
      {zh?'数据来源：2024 版公司画册':'Source: 2024 company brochure (Chinese)'}<ArrowUpRight size={16} aria-hidden="true"/>
    </a>
  </div>;
}

function WorkshopGallery({lang, onPhoto}) {
  const l = lang === 'zh' ? 1 : 0;
  const [cursor,setCursor] = useState(0);
  const [requested,setRequested] = useState(0);
  const [inView,setInView] = useState(false);
  const [hovered,setHovered] = useState(false);
  const [keyboardFocus,setKeyboardFocus] = useState(false);
  const gallery = useRef(null);
  const heading = useId();
  const shot = stationAt(cursor);
  const next = stationAt(cursor+1);

  // Keep neighbours in the strip until the current photograph has landed.
  // Further clicks change the destination without dropping a visible slide.
  useLayoutEffect(() => {
    const distance = (requested - cursor) % stations.length;
    if (!distance) return;
    let current = true;
    const proceed = () => {
      if (current) setCursor(cursor + Math.sign(distance));
    };
    const slide = gallery.current.querySelector('.hmf-slide[data-current=true]');
    const travel = slide.getAnimations().find(animation => animation.transitionProperty === 'transform');
    if (travel) travel.finished.then(proceed, proceed);
    else proceed();
    return () => { current = false; };
  }, [cursor, requested]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= .35),{threshold:.35});
    observer.observe(gallery.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hovered || keyboardFocus) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    let timer;
    function schedule() {
      clearTimeout(timer);
      if (motion.matches || document.hidden || root.dataset.dialogOpen === 'true' || root.dataset.navOpen === 'true') return;
      timer = setTimeout(() => setRequested(value => value + 1), 7200);
    }
    schedule();
    const overlays = new MutationObserver(schedule);
    overlays.observe(root,{attributes:true,attributeFilter:['data-dialog-open','data-nav-open']});
    document.addEventListener('visibilitychange',schedule);
    motion.addEventListener('change',schedule);
    return () => {
      clearTimeout(timer);
      overlays.disconnect();
      document.removeEventListener('visibilitychange',schedule);
      motion.removeEventListener('change',schedule);
    };
  }, [inView,hovered,keyboardFocus,cursor]);

  function moveWithKeys(event) {
    const step = {ArrowLeft:-1,ArrowRight:1}[event.key];
    if (step) {event.preventDefault();setRequested(value => value + step);}
  }
  const currentIndex = stations.indexOf(shot);
  const label = l ? '放大现场照片' : 'Enlarge workshop photograph';
  return <div className="hmf-gallery" ref={gallery} role="group" aria-labelledby={heading}
      onKeyDown={moveWithKeys} onPointerEnter={e=>setHovered(e.pointerType !== 'touch')} onPointerLeave={()=>setHovered(false)}
      onFocusCapture={e=>setKeyboardFocus(e.target.matches(':focus-visible'))} onBlurCapture={e=>{
        if (!e.currentTarget.contains(e.relatedTarget)) setKeyboardFocus(false);
      }}>
    <div className="hmf-window">
      {[-2,-1,0,1,2].map(slot => {
        const frame = cursor + slot;
        const item = stationAt(frame);
        return <div key={frame} className="hmf-slide" style={{'--slot':slot}} data-current={slot===0}
            aria-hidden={slot !== 0}>
          <img src={'/assets/company/'+item.file} alt={slot===0?item.title[l]:''} width="2200" height="1238"
            style={{objectPosition:item.position}} loading={inView ? 'eager' : 'lazy'} decoding="async" draggable="false"/>
        </div>;
      })}
      <button type="button" className="hmf-expand" onClick={()=>onPhoto?.(shot.file)} aria-label={label+' · '+shot.title[l]}>
        <Maximize2 size={18} aria-hidden="true"/>
      </button>
      <button type="button" className="hmf-peek" onClick={()=>setRequested(value=>value+1)}
        aria-label={(l?'下一处现场':'Next station')+' · '+next.title[l]}/>
    </div>
    <div className="hmf-card">
      <div className="hmf-description" key={cursor}>
        <h3 id={heading}>{shot.title[l]}<HeadingEnglish lang={lang}>{shot.title[0]}</HeadingEnglish></h3>
        <p>{shot.caption[l]}</p>
      </div>
      <div className="hmf-index" aria-hidden="true">{String(currentIndex+1).padStart(2,'0')} <span>/</span> {String(stations.length).padStart(2,'0')}</div>
      <div className="hmf-controls">
        <button className="hmf-prev" type="button" aria-label={l?'上一处生产现场':'Previous production station'} onClick={()=>setRequested(value=>value-1)}>
          <ChevronLeft size={20} aria-hidden="true"/>
        </button>
        <button className="hmf-next" type="button" aria-label={l?'下一处生产现场':'Next production station'} onClick={()=>setRequested(value=>value+1)}>
          <ChevronRight size={20} aria-hidden="true"/>
        </button>
      </div>
    </div>
  </div>;
}

export default function HomeManufacturingChapter({lang='en',go,onPhoto}) {
  const zh = lang === 'zh', id = useId();
  const route = '/manufacturing?lang='+lang;
  function follow(event) {
    if (!go || event.button!==0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();go(route);
  }
  return <section id="home-strength" data-scroll-align="start" className="hmf-chapter" aria-labelledby={id}>
    <div className="hmf-workshop">
      <header className="hmf-header">
        <h2 id={id}>{zh?'工厂生产现场':'Factory floor'}<HeadingEnglish lang={lang}>Factory floor</HeadingEnglish></h2>
        <a className="hmf-link" href={routeHref(route)} onClick={follow}>{zh?'了解制造工艺':'Explore manufacturing'}<ArrowUpRight size={18} aria-hidden="true"/></a>
      </header>
      <WorkshopGallery lang={lang} onPhoto={onPhoto}/>
      <ProductionFigures zh={zh}/>
    </div>
    <HomeLaboratory lang={lang}/>
  </section>;
}
