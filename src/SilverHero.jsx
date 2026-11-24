import React,{useLayoutEffect,useRef} from 'react';
import PrecisionProduct from './PrecisionProduct.jsx';
import openPreview from './assets/banner-open-preview.webp?inline';
import joinedPreview from './assets/banner-joined-preview.webp?inline';
import './silver-hero.css';

export default function SilverHero({lang='en',go}){
 const root=useRef(null),entrance=useRef({progress:1,complete:false}),zh=lang==='zh';
 const href=path=>{const url=new URL(path,location.origin);url.searchParams.set('lang',lang);return url.pathname+url.search};
 const follow=(event,path)=>{if(go&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();go(path)}};
 useLayoutEffect(()=>{
  const el=root.current,g=window.gsap;
  const start=()=>{
   if(entrance.current.complete||document.documentElement.dataset.booting==='true')return;
   entrance.current.complete=true;
   el.dataset.entry='complete';el.dataset.entryStage='interactive';
   el.dispatchEvent(new Event('mh-hero-settled'));
  };
  // The loading cover reveals the complete composition. Only assembly
  // playback waits for it to clear.
  window.addEventListener('mh-intro-ready',start);
  start();
  const media=g?.matchMedia();
  if(media&&window.ScrollTrigger){
   g.registerPlugin(window.ScrollTrigger);
   media.add('(prefers-reduced-motion: no-preference)',()=>{
    g.to('.sh-wordmark-depth',{y:28,ease:'none',scrollTrigger:{trigger:el,start:'top top',end:'bottom top',scrub:.7}});
    g.to('.sh-model-depth',{y:-38,ease:'none',scrollTrigger:{trigger:el,start:'top top',end:'bottom top',scrub:.7}});
   },el);
  }
  return()=>{window.removeEventListener('mh-intro-ready',start);media?.revert()};
 },[]);
 return <section className="sh-hero" ref={root} aria-labelledby="sh-title" data-entry="waiting" data-entry-stage="waiting">
  <div className="sh-heading">
   <h1 id="sh-title" className="sh-title"><span className="sh-title-line"><span>{zh?'不锈钢管道':'Stainless steel'}</span></span><span className="sh-title-line"><span>{zh?'系统解决方案。':'piping systems.'}</span></span></h1>
   <div className="sh-intro">
    <p className="sh-context">{zh?'不锈钢管材与管件制造，服务工程配套与经销合作。':'Pipes and fittings. Manufactured for projects and distribution.'}</p>
    <a className="sh-product-link" href={href('/products')} onClick={event=>follow(event,'/products')}><span>{zh?'探索产品':'Explore products'}</span></a>
   </div>
  </div>
  <div className="sh-wordmark-depth" aria-hidden="true"><span className="sh-wordmark">PIPE</span></div>
  <div className="sh-model-depth" onLoadCapture={event=>{
    if(event.target.matches('.precision-product-fallback'))event.currentTarget.dataset.posterLoaded='true';
  }}>
   <picture className="sh-poster-preview" aria-hidden="true">
    <source media="(prefers-reduced-motion: reduce)" srcSet={joinedPreview}/>
    <img src={openPreview} alt="" draggable="false"/>
   </picture>
   <PrecisionProduct lang={lang} exploded presentation="connection-stage" openingImage="/assets/products/connection-stage-open.webp" fallbackImage="/assets/products/connection-stage.webp" entranceRef={entrance}/>
  </div>
 </section>;
}
