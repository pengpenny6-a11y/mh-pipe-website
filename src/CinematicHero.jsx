import React, {useLayoutEffect, useRef, useState} from 'react';
import PrecisionProduct from './PrecisionProduct.jsx';
import {scenes} from './content.js';
import './cinematic-hero.css';

export default function CinematicHero({lang='en',go}) {
  const zh=lang==='zh',root=useRef(null),introStarted=useRef(false);
  const [hovered,setHovered]=useState(null),[focused,setFocused]=useState(null);
  const requested=new URLSearchParams(location.search).get('scene');
  const defaultScene=scenes.some(scene=>scene.id===requested)?requested:'water';
  const active=focused||hovered||defaultScene;

  useLayoutEffect(()=>{
    const g=window.gsap;if(!g)return;
    const context=g.context(()=>{
      const media=g.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)',()=>{
        const intro=g.fromTo('.cinema-copy',{opacity:0,y:12},{opacity:1,y:0,duration:.72,ease:'power2.out',paused:true,clearProps:'opacity,transform'});
        const reveal=()=>{if(intro.isActive()||intro.progress()===1)return;introStarted.current=true;intro.play()};
        window.addEventListener('mh-intro-ready',reveal,{once:true});
        if(introStarted.current||document.documentElement.dataset.booting!=='true')reveal();
        if(window.ScrollTrigger){
          g.registerPlugin(window.ScrollTrigger);
          g.to('.ph-cinema-stage',{yPercent:4,ease:'none',scrollTrigger:{trigger:root.current,start:'top top',end:'bottom top',scrub:1.15,invalidateOnRefresh:true}});
        }
        return()=>window.removeEventListener('mh-intro-ready',reveal);
      });
    },root);
    return()=>context.revert();
  },[lang]);

  function navigate(event,to){
    if(!go||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
    event.preventDefault();go(to);
  }
  const href=to=>{const url=new URL(to,location.origin);url.searchParams.set('lang',lang);return url.pathname+url.search};

  return <section className="ph-hero cinema-hero" ref={root} aria-labelledby="cinema-title">
    <div className="ph-cinema-stage"><PrecisionProduct lang={lang} exploded presentation="cinematic" fallbackImage="/assets/products/cinematic-assembly.webp"/></div>
    <div className="cinema-readability" aria-hidden="true"/>
    <div className="cinema-copy">
      <h1 id="cinema-title" className="cinema-title"><span>{zh?'不锈钢管道':'Stainless steel'}</span><span>{zh?'系统解决方案。':'piping systems.'}</span></h1>
      <p className="cinema-description">{zh?'从建筑用水，到工业输送。':'From building water to industrial flow.'}</p>
      <a className="ph-products cinema-products" href={href('/products')} onClick={event=>navigate(event,'/products')}>{zh?'探索产品':'Explore products'}</a>
    </div>
    <nav className="cinema-applications" aria-label={zh?'探索应用领域':'Explore applications'} onPointerLeave={()=>setHovered(null)}>
      {scenes.map(scene=><a key={scene.id} className="cinema-scene" data-active={active===scene.id} href={href('/applications?scene='+scene.id)} onClick={event=>navigate(event,'/applications?scene='+scene.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')setHovered(scene.id)}} onFocus={()=>setFocused(scene.id)} onBlur={()=>setFocused(null)}><span>{scene.name[lang]||scene.name.en}</span></a>)}
    </nav>
  </section>;
}
