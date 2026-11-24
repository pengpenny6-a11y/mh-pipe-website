import React,{useRef,useLayoutEffect} from 'react';
import ApplicationsTech from './ApplicationsTech.jsx';
import {products} from './content.js';
import './flow-experience.css';

const t=(l,en,zh)=>l==='zh'?zh:en;
export default function FlowExperience({lang,onProduct,onInquiry}){
 const root=useRef(),assembly=useRef(),hero=useRef(),motion=useRef();
 useLayoutEffect(()=>{
  const g=window.gsap;if(!g)return;
  let observer,active=false;
  const ctx=g.context(()=>{
   const media=g.matchMedia();
   media.add('(prefers-reduced-motion: no-preference)',()=>{
    const q=g.utils.selector(root);
    g.timeline({defaults:{ease:'power3.out'}})
     .from(q('.fx-title-line>span'),{yPercent:108,duration:1.1,stagger:.13},0)
     .from(q('.fx-assembly-intro'),{clipPath:'inset(0 49% 0 49%)',duration:1.65,ease:'power3.inOut'},.15)
     .from(q('.fx-word'),{y:50,opacity:0,duration:1.25},.2)
     .from(q('.fx-hero-bottom'),{y:18,opacity:0,duration:.8},.8);
    const drift=g.to(q('.fx-object-drift'),{y:-9,rotation:.35,duration:4.2,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true});
    const sync=()=>{const play=active&&!document.hidden&&document.documentElement.dataset.dialogOpen!=='true';drift.paused(!play);hero.current?.setAttribute('data-hero-floating',String(play))};
    observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;sync()},{threshold:.08});observer.observe(hero.current);
    document.addEventListener('visibilitychange',sync);window.addEventListener('mh-dialog-change',sync);
    // One shared object traverses the opening, then clears the application
    // inspection window. The document keeps its normal vertical travel.
    g.timeline({scrollTrigger:{trigger:hero.current,start:'top top',end:'bottom top',scrub:1.05,invalidateOnRefresh:true}})
     .to(assembly.current,{y:()=>hero.current.offsetHeight*.54,xPercent:17,scale:.58,rotation:3,duration:.76,ease:'none'},0)
     .to(assembly.current,{autoAlpha:0,duration:.22,ease:'none'},.36)
     .to(q('.fx-word'),{xPercent:-12,y:65,duration:.9,ease:'none'},0)
     .to(q('.fx-title'),{y:-45,opacity:.12,duration:.85,ease:'none'},.05);
    g.fromTo(q('.ap-story .ap-stage'),{clipPath:'inset(12% 12% 12% 12%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:root.current.querySelector('.ap-story'),start:'top 90%',end:'top 15%',scrub:1.05}});
    motion.current={x:g.quickTo(root.current.querySelector('.fx-object-pointer'),'x',{duration:1.1,ease:'power3.out'}),y:g.quickTo(root.current.querySelector('.fx-object-pointer'),'y',{duration:1.1,ease:'power3.out'})};
    return()=>{motion.current=null;observer?.disconnect();document.removeEventListener('visibilitychange',sync);window.removeEventListener('mh-dialog-change',sync);drift.kill()};
   });
   return()=>media.revert();
  },root);
  return()=>{observer?.disconnect();motion.current=null;ctx.revert()};
 },[]);
 function explore(e){e.preventDefault();const el=root.current.querySelector('#applications');if(window.mhScroll)window.mhScroll.scrollTo(el,{offset:-35,duration:1.35,lerp:0,easing:v=>v<.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2});else el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}
 function point(e){if(!motion.current||e.pointerType==='touch')return;const r=hero.current.getBoundingClientRect();motion.current.x((e.clientX-r.width*.5)*.013);motion.current.y((e.clientY-r.top-r.height*.5)*.012)}
 return <div className="fx-experience" ref={root}>
  <section className="fx-hero hero" ref={hero} onPointerMove={point} onPointerLeave={()=>{motion.current?.x(0);motion.current?.y(0)}}>
   <h1 className="fx-title">{(lang==='zh'?['不锈钢管道','系统解决方案。']:['Stainless steel.','Connected systems.']).map(line=><span className="fx-title-line" key={line}><span>{line}</span></span>)}</h1>
   <div className="fx-word" aria-hidden="true">MH PIPE</div>
   <div className="fx-hero-bottom"><p>{t(lang,<>Pipes and fittings.<br/>Made to work together.</>,<>从管材到连接件，<br/>构建完整的输送系统。</>)}</p><button type="button" className="fx-explore" onClick={explore}><span>{t(lang,'Explore applications','探索应用')}</span><span className="fx-action-mark" aria-hidden="true">+</span></button></div>
  </section>
  <div className="fx-assembly" ref={assembly}><div className="fx-assembly-intro"><button className="fx-object-control" onClick={()=>onProduct(products.find(p=>p.id==='coupling'))} aria-label={t(lang,'Explore the straight coupling','查看直通连接件')}><span className="fx-object-pointer"><span className="fx-object-drift"><img src="/assets/flow/connection-system-polished.png" alt={t(lang,'Visual study of straight pipes joined by a coupling','直管与直通连接件的组合视觉示意')} fetchPriority="high" draggable="false"/><span data-product-origin aria-hidden="true" className="fx-detail-origin"/></span></span></button></div></div>
  <ApplicationsTech lang={lang} onProduct={onProduct} onInquiry={onInquiry} story/>
 </div>
}
