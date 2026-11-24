import {useEffect,useLayoutEffect} from 'react';
let pageLoader;
export const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function resetScroll(){if(window.mhScroll){window.mhScroll.resize();window.mhScroll.scrollTo(0,{immediate:true,force:true})}else window.scrollTo({top:0,behavior:'instant'})}
export function scrollDestination(hash, {animate=false,restoreY}={}) {
 let target;
 if(hash){
  try { target=document.getElementById(decodeURIComponent(hash.slice(1))); }
  catch { return; }
 }
 const inset=target?.dataset.scrollAlign==='start'?0:110;
 const top=Number.isFinite(restoreY) ? restoreY : target ? Math.max(0,target.getBoundingClientRect().top+window.scrollY-inset) : 0;
 const immediate=!animate || reducedMotion();
 if(window.mhScroll){
  if(immediate)window.mhScroll.resize();
  window.mhScroll.scrollTo(top,{immediate,force:immediate,
   duration:Math.min(.94,.32+Math.abs(top-window.scrollY)/2400),
   easing:t=>1-(1-t)**3});
 }else window.scrollTo({top,behavior:immediate?'instant':'smooth'});
}
export function registerPageLoader(loader){
 pageLoader=loader;return()=>{if(pageLoader===loader)pageLoader=null};
}
export function transitionPage(update,options={}){
 if(pageLoader)return pageLoader(update,options);
 update();scrollDestination(location.hash,options);window.ScrollTrigger?.refresh();
}
export function useSiteMotion(blocked){
 useLayoutEffect(()=>{
  if(!window.Lenis||!window.gsap)return;
  const lenis=new window.Lenis({lerp:.14,smoothWheel:true,syncTouch:false,respectReducedMotion:true,stopInertiaOnNavigate:true,prevent:node=>node.classList?.contains('modal')});
  window.mhScroll=lenis;
  const tick=time=>lenis.raf(time*1000);const update=()=>window.ScrollTrigger?.update();
  lenis.on('scroll',update);window.gsap.ticker.add(tick);window.gsap.ticker.lagSmoothing(0);
  return()=>{window.gsap.ticker.remove(tick);lenis.destroy();if(window.mhScroll===lenis)delete window.mhScroll};
 },[]);
 useEffect(()=>{document.documentElement.dataset.dialogOpen=String(blocked);if(blocked||document.documentElement.dataset.booting==='true')window.mhScroll?.stop();else window.mhScroll?.start();window.dispatchEvent(new Event('mh-dialog-change'))},[blocked]);
}
