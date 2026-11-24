import React,{useLayoutEffect,useRef} from 'react';
import {scrollDestination} from './site-motion.js';
import './boot-sequence.css';

// Full document-entry sequence. SPA routes use the shorter PageLoadTransition.
export default function BootSequence({lang,onComplete}){
 const root=useRef(),finishRef=useRef(()=>{}),complete=useRef(onComplete);complete.current=onComplete;
 useLayoutEffect(()=>{
  const el=root.current,g=window.gsap,html=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cancelled=false,closing=false,ended=false,unlocked=false,observer,timer,context,completed=0;
  const previousOverflow=document.body.style.overflow;
  html.dataset.booting='true';document.body.style.overflow='hidden';window.mhScroll?.stop();
  const unlock=()=>{if(unlocked)return;unlocked=true;delete html.dataset.booting;document.body.style.overflow=previousOverflow;if(html.dataset.dialogOpen!=='true')window.mhScroll?.start()};
  const end=()=>{
   if(cancelled||ended)return;ended=true;clearTimeout(timer);observer?.disconnect();
   // Release the assembly clock after the common title and product reveal.
   el.style.visibility='hidden';el.style.pointerEvents='none';
   unlock();complete.current();
   window.dispatchEvent(new Event('mh-intro-ready'));
   window.ScrollTrigger?.refresh();
  };
  const finish=()=>{
   if(cancelled||closing)return;closing=true;clearTimeout(timer);observer?.disconnect();
   if(location.hash)scrollDestination(location.hash);
   const mark=el.querySelector('.boot-wordmark'),target=document.querySelector('.sn-brand-text'),from=mark.getBoundingClientRect(),to=target?.getBoundingClientRect();
   if(!g||reduced){end();return}
   context.add(()=>{
    const exit=g.timeline({onComplete:end});
    exit.to('.boot-track,.boot-skip',{opacity:0,duration:.18},0)
      .to('.boot-cover',{opacity:0,duration:.8,ease:'power2.inOut'},.12);
    if(to)exit.to(mark,{x:to.left-from.left,y:to.top-from.top,scale:to.width/from.width,duration:1.02,ease:'power3.inOut'},0);
    else exit.to(mark,{opacity:0,y:-24,duration:.65},0);
    if(target)exit.to(mark,{color:getComputedStyle(target).color,duration:.3,ease:'power1.inOut'},.65);
   });
  };finishRef.current=finish;
  const progress=()=>{if(cancelled||closing)return;completed++;const value=completed/4;if(g)g.to(el.querySelector('.boot-progress'),{scaleX:value,duration:.3,ease:'power2.out',overwrite:true});else el.querySelector('.boot-progress').style.transform=`scaleX(${value})`;if(completed===4)finish()};
  if(g)context=g.context(()=>{
   g.set('.boot-progress',{scaleX:0});
   g.timeline({onComplete:progress}).fromTo('.boot-wordmark span',{yPercent:115,x:index=>index*8,opacity:.3},{yPercent:0,x:0,opacity:1,duration:reduced?0:.72,stagger:reduced?0:.045,ease:'power3.out'});
  },el);else progress();
  Promise.resolve(document.fonts?.ready).then(progress,progress);
  const visibleImages=[...document.querySelectorAll('.route-content img')].filter(image=>{
   if(image.closest('.sh-hero .precision-product'))return false;
   const box=image.getBoundingClientRect();return box.width>32&&box.height>32&&box.top<innerHeight&&box.bottom>0;
  });
  // The inline hero poster is sufficient for the first painted frame.
  const uniqueImages=[...new Map(visibleImages.map(image=>[image.currentSrc||image.src,image])).values()].slice(0,8);
  Promise.allSettled(uniqueImages.map(image=>Promise.resolve(image.decode?.()))).then(progress);
  const viewer=document.querySelector('.sh-poster-preview')?null:document.querySelector('.precision-product');
  if(!viewer||['ready','fallback'].includes(viewer.dataset.state))progress();
  else {observer=new MutationObserver(()=>{if(['ready','fallback'].includes(viewer.dataset.state)){observer.disconnect();progress()}});observer.observe(viewer,{attributes:true,attributeFilter:['data-state']})}
  timer=setTimeout(finish,6000);
  const key=e=>{if(e.key==='Escape')finish()};document.addEventListener('keydown',key);
  return()=>{cancelled=true;finishRef.current=()=>{};clearTimeout(timer);observer?.disconnect();document.removeEventListener('keydown',key);context?.revert();g?.killTweensOf(el.querySelector('.boot-progress'));unlock()};
 },[]);
 return <div className="boot-sequence" ref={root} role="status" aria-label={lang==='zh'?'正在加载 MH PIPE':'Loading MH PIPE'}>
  <div className="boot-cover"/>
  <div className="boot-lockup"><div className="boot-wordmark" aria-hidden="true">{'MH PIPE'.split('').map((letter,index)=><span key={index}>{letter===' '?'\u00a0':letter}</span>)}</div><div className="boot-track" aria-hidden="true"><span className="boot-progress"/></div></div>
  <button className="boot-skip" onClick={()=>finishRef.current()}>{lang==='zh'?'跳过动画':'Skip intro'}</button>
 </div>;
}
