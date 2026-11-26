import {routePathname} from './site-routes.js';
import React,{useLayoutEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import PageLoadMark from './PageLoadMark.jsx';
import {registerPageLoader,scrollDestination,reducedMotion} from './site-motion.js';

const labels={
 '/':['Home','首页'],'/applications':['Solutions','解决方案'],'/products':['Products','产品中心'],
 '/services':['Services','服务体系'],'/company':['About us','关于我们'],'/manufacturing':['Manufacturing','生产制造'],
 '/news':['News','新闻中心'],'/contact':['Contact','联系我们'],
};

// Wait for visible page media, not every below-the-fold picture. A slow or
// missing asset cannot keep the visitor behind a permanent loading cover.
function pageReady(signal){
 const visible=el=>{
  const box=el.getBoundingClientRect();
  return box.width>32&&box.height>32&&box.top<innerHeight&&box.bottom>0;
 };
 const images=[...document.querySelectorAll('.route-content img')].filter(image=>{
  if(image.closest('.sh-hero .precision-product'))return false;
  return visible(image);
 }).slice(0,8);
 const resources=images.map(image=>Promise.resolve(image.decode?.()).catch(()=>{}));
 resources.push(Promise.resolve(document.fonts?.ready));
 const viewers=[...document.querySelectorAll('.route-content .precision-product[data-state="loading"]')].filter(el=>!el.closest('.sh-hero')&&visible(el));
 let observer;
 if(viewers.length)resources.push(new Promise(resolve=>{
  const ready=()=>{if(viewers.every(el=>!el.isConnected||['ready','fallback'].includes(el.dataset.state))){observer?.disconnect();resolve()}};
  observer=new MutationObserver(ready);viewers.forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['data-state']}));ready();
 }));
 return new Promise(resolve=>{
  let done=false;
  const finish=()=>{if(done)return;done=true;clearTimeout(timer);observer?.disconnect();signal.removeEventListener('abort',finish);resolve()};
  const timer=setTimeout(finish,2400);
  signal.addEventListener('abort',finish,{once:true});
  if(signal.aborted)finish();else Promise.allSettled(resources).then(finish);
 });
}

export default function PageLoadTransition({enabled=true,lang='en'}){
 const root=useRef(null),active=useRef(null),lock=useRef(null),sequence=useRef(0),languageRef=useRef(lang);languageRef.current=lang;
 const [view,setView]=useState({phase:'idle',label:'',lang});
 useLayoutEffect(()=>{
  if(!enabled)return;
  const element=root.current,html=document.documentElement,g=window.gsap;
  let disposed=false;
  const phase=value=>{element.dataset.phase=value;setView(previous=>({...previous,phase:value}))};
  const acquire=()=>{
   if(lock.current)return;
   const content=document.querySelector('.site-content');
   // Navigation dismisses existing dialogs. Their temporary scroll lock must
   // not be restored once that dialog has disappeared on the destination.
   const overflow=document.querySelector('.modal-backdrop')?'':document.body.style.overflow;
   lock.current={overflow,content,inert:content?.inert,busy:content?.getAttribute('aria-busy')};
   document.body.style.overflow='hidden';if(content){content.inert=true;content.setAttribute('aria-busy','true')}
   html.dataset.pageTransition='loading';html.dataset.pageLoading='true';window.mhScroll?.stop();
  };
  const release=()=>{
   const previous=lock.current;if(!previous)return;lock.current=null;
   delete html.dataset.pageTransition;delete html.dataset.pageLoading;delete html.dataset.booting;
   document.body.style.overflow=previous.overflow;
   if(previous.content){previous.content.inert=previous.inert;if(previous.busy===null)previous.content.removeAttribute('aria-busy');else previous.content.setAttribute('aria-busy',previous.busy)}
   if(html.dataset.dialogOpen!=='true')window.mhScroll?.start();
  };
  async function navigate(update,options={}){
   const replacing=Boolean(active.current),ticket=++sequence.current;active.current?.cancel();
   const abort=new AbortController(),animations=new Set();let fast=reducedMotion(),skipped;
   const skipWait=new Promise(resolve=>{skipped=resolve});
   const run={cancel(){abort.abort();animations.forEach(a=>a.kill())},skip(){fast=true;skipped();animations.forEach(a=>a.progress(1))}};
   active.current=run;acquire();
   const current=()=>!disposed&&!abort.signal.aborted&&ticket===sequence.current;
   const language=options.lang||languageRef.current,path=options.path||routePathname();
   const label=(labels[path]||labels['/contact'])[language==='zh'?1:0];
   flushSync(()=>setView({phase:'covering',label,lang:language}));
   const cover=element.querySelector('.pl-cover'),caption=element.querySelector('.pl-center');
   const tween=(targets,vars)=>new Promise(resolve=>{
    if(!current()){resolve(false);return}
    if(!g||fast){if(g)g.set(targets,{...vars,duration:0,onComplete:undefined});else if(targets===cover&&Number.isFinite(vars.yPercent))cover.style.transform=`translate3d(0,${vars.yPercent}%,0)`;resolve(true);return}
    let animation,finished=false;
    const finish=value=>{if(finished)return;finished=true;abort.signal.removeEventListener('abort',cancel);animations.delete(animation);resolve(value)};
    const cancel=()=>{animation?.kill();finish(false)};
    animation=g.to(targets,{...vars,onComplete:()=>finish(true)});animations.add(animation);abort.signal.addEventListener('abort',cancel,{once:true});
   });
   try{
    element.style.pointerEvents='auto';element.style.visibility='visible';element.style.opacity='1';
    if(g){
     // A route replacement continues from the current sheet position, rather
     // than resetting offscreen and flashing the page underneath.
     if(!replacing)g.set(cover,{y:0,yPercent:fast?0:102});
     g.set(caption,{opacity:1});
    }else cover.style.transform='translate3d(0,0,0)';
    // The same sheet enters and leaves upwards. Navigation stays above it,
    // while the body swaps only once the surface is fully opaque.
    await tween(cover,{yPercent:0,duration:.27,ease:'power2.inOut'});
    if(!current())return;
    html.dataset.booting='true';phase('loading');update();document.body.style.overflow='hidden';
    scrollDestination(location.hash,options);
    // There is no artificial brand hold. A delayed resource keeps the small
    // indeterminate path moving; a ready page immediately continues the shot.
    await Promise.race([pageReady(abort.signal),skipWait]);
    if(!current())return;
    // Resolve font and image reflow under the opaque sheet. The first
    // destination frame must already be framed at the requested chapter.
    if(location.hash || Number.isFinite(options.restoreY))scrollDestination(location.hash,options);
    phase('revealing');
    const content=document.querySelector('.route-content');
    const home=Boolean(content?.querySelector('.sh-hero'));
    if(home&&g)await tween(element,{opacity:0,duration:.32,ease:'power2.inOut'});
    else await tween(cover,{yPercent:-102,duration:.4,ease:'power2.inOut'});
    if(!current())return;
    animations.forEach(animation=>animation.kill());animations.clear();
    element.style.visibility='hidden';element.style.opacity='0';element.style.pointerEvents='none';phase('idle');release();
    window.dispatchEvent(new Event('mh-intro-ready'));
    if(content){content.style.removeProperty('transform');content.style.removeProperty('opacity');content.focus({preventScroll:true})}
    window.ScrollTrigger?.refresh();
    active.current=null;
   }catch(error){
    if(current()){element.style.visibility='hidden';element.style.opacity='0';element.style.pointerEvents='none';phase('idle');release();delete html.dataset.booting;window.dispatchEvent(new Event('mh-intro-ready'));active.current=null;console.warn('MH PIPE page loading:',error.message)}
   }
  }
  const unregister=registerPageLoader(navigate),escape=event=>{if(event.key==='Escape')active.current?.skip()};
  document.addEventListener('keydown',escape);
  return()=>{disposed=true;sequence.current++;active.current?.cancel();active.current=null;unregister();document.removeEventListener('keydown',escape);release();element.style.visibility='hidden';element.style.opacity='0';element.style.pointerEvents='none'};
 },[enabled]);
 return <PageLoadMark ref={root} label={view.label} lang={view.lang} state={view.phase}/>;
}
