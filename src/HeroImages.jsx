import React,{useLayoutEffect,useRef} from 'react';
import './hero-images.css';

const images=[
 {id:'architecture',src:'/assets/scenes/water-building.png',path:'/applications?scene=water',en:'Building water',zh:'建筑给水',label:{en:'Explore building water solutions',zh:'探索建筑给水解决方案'},depth:{x:9,y:4}},
 {id:'factory',src:'/assets/company/tube-making.webp',path:'/manufacturing',en:'Manufacturing',zh:'岷河制造',label:{en:'Explore MH PIPE manufacturing',zh:'走进岷河制造现场'},depth:{x:-5,y:-2.5}}
];

export default function HeroImages({lang='en',go}){
 const root=useRef(),hasEntered=useRef(false);
 useLayoutEffect(()=>{
  const el=root.current,hero=el?.closest('.ph-hero'),g=window.gsap;
  if(!el||!hero||!g)return;
  const context=g.context(()=>{
   const media=g.matchMedia();
   media.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)',()=>{
    let visible=false;
    const slots=[...el.querySelectorAll('.phi-slot')],depths=[...el.querySelectorAll('.phi-depth')];
    const move=depths.map(node=>({x:g.quickTo(node,'x',{duration:.75,ease:'power3.out'}),y:g.quickTo(node,'y',{duration:.75,ease:'power3.out'})}));
    const intro=g.timeline({paused:true}).fromTo(slots,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.85,stagger:.12,ease:'power3.out',clearProps:'opacity,visibility,transform'},.6);
    const enter=()=>{hasEntered.current=true;intro.play()};
    window.addEventListener('mh-intro-ready',enter,{once:true});
    if(hasEntered.current||document.documentElement.dataset.booting!=='true')enter();
    const reset=()=>move.forEach(m=>{m.x(0);m.y(0)});
    const pointer=e=>{
     if(!visible||e.pointerType==='touch')return;
     const r=hero.getBoundingClientRect(),x=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2)),y=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
     move.forEach((m,i)=>{m.x(x*images[i].depth.x);m.y(y*images[i].depth.y)});
    };
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)reset()},{threshold:.05});observer.observe(el);
    hero.addEventListener('pointermove',pointer,{passive:true});hero.addEventListener('pointerleave',reset);
    return()=>{window.removeEventListener('mh-intro-ready',enter);hero.removeEventListener('pointermove',pointer);hero.removeEventListener('pointerleave',reset);observer.disconnect();intro.kill();move.forEach(m=>{m.x.tween.kill();m.y.tween.kill()})};
   });
  },root);
  return()=>context.revert();
 },[]);
 function href(path){const url=new URL(path,location.origin);url.searchParams.set('lang',lang);return url.pathname+url.search}
 function follow(e,path){if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();go(path)}
 return <div className="phi-root" ref={root}>
  {images.map(item=><div className={'phi-slot phi-'+item.id} key={item.id}><div className="phi-depth"><a className="phi-window" href={href(item.path)} onClick={e=>follow(e,item.path)} aria-label={item.label[lang]}><span className="phi-photo"><img src={item.src} alt="" draggable="false" decoding="async"/></span><span className="phi-caption" aria-hidden="true">{item[lang]}</span></a></div></div>)}
 </div>
}
