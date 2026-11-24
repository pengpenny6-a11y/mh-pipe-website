import React,{useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import './hero-neighborhood.css';

const ART='/assets/hero-neighborhood/neighborhood-road.png';
const CART='/assets/hero-neighborhood/service-cart.png';
// Percentages describe the shared image footprint, so art, light and hit areas
// stay registered when the miniature is resized. These are illustrative scenes.
const SCENES=[
 {id:'water',en:'Building water',zh:'建筑给水',box:[19,47,13,30],clip:'polygon(18% 46%,33% 46%,33% 78%,18% 78%)'},
 {id:'gas',en:'Building gas',zh:'建筑燃气',box:[8,67,9,19],clip:'polygon(7% 66%,18% 66%,18% 87%,7% 87%)'},
 {id:'fire',en:'Fire protection',zh:'消防',box:[34,62,6,18],clip:'polygon(33% 61%,41% 61%,41% 81%,33% 81%)'},
 {id:'industry',en:'Industry',zh:'工业',box:[49,33,18,29],clip:'polygon(48% 32%,68% 32%,68% 63%,48% 63%)'},
 {id:'cooling',en:'Liquid-cooled data centre',zh:'液冷数据中心',box:[72,48,23,29],clip:'polygon(71% 47%,96% 47%,96% 78%,71% 78%)'},
];
const lightStyle=scene=>{
 const [x,y,width,height]=scene.box;
 const mask=`radial-gradient(ellipse ${width/2}% ${height/2}% at ${x+width/2}% ${y+height/2}%, #000 38%, transparent 100%)`;
 return {clipPath:scene.clip,maskImage:mask,WebkitMaskImage:mask};
};

export default function HeroNeighborhood({lang='en',onSceneSelect,entranceRef}){
 const root=useRef(null),control=useRef(null),assets=useRef({base:false,cart:false});
 const [baseReady,setBaseReady]=useState(false),[cartReady,setCartReady]=useState(false);
 const [hovered,setHovered]=useState(null),[focused,setFocused]=useState(null),[dismissed,setDismissed]=useState(false);
 const active=focused||hovered,activeRef=useRef(active);activeRef.current=active;
 const prefix=useId(),zh=lang==='zh';
 const loaded=kind=>{assets.current[kind]=true;if(kind==='base')setBaseReady(true);else setCartReady(true);control.current?.sync()};
 useEffect(()=>{control.current?.sync()},[active,baseReady,cartReady]);

 useLayoutEffect(()=>{
  const el=root.current,g=window.gsap;if(!el)return;
  if(!g){el.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'paused';return}
  const media=g.matchMedia();
  media.add({reduce:'(prefers-reduced-motion: reduce)',motion:'(prefers-reduced-motion: no-preference)'},context=>{
   const reduced=context.conditions.reduce,art=el.querySelector('.hn-art'),cart=el.querySelector('.hn-cart-travel');
   const lights=Object.fromEntries([...el.querySelectorAll('.hn-light')].map(light=>[light.dataset.scene,light]));
   const entryHost=el.closest('.sh-hero');
   let windowFocused=true,navigationOpen=document.documentElement.dataset.navOpen==='true',started=entranceRef?entranceRef.current.complete:document.documentElement.dataset.booting!=='true',entered=Boolean(entranceRef),disposed=false;
   let entry,ambient;const cleanup=[];
   const available=()=>{
    // Read the current footprint at lifecycle events. A cached intersection
    // from the image's pre-decode zero-height box can otherwise strand entry.
    const box=el.getBoundingClientRect();
    const visible=box.width>0&&box.height>0&&box.bottom>0&&box.top<innerHeight&&box.right>0&&box.left<innerWidth;
    return visible&&windowFocused&&!navigationOpen&&!document.hidden&&document.documentElement.dataset.dialogOpen!=='true'&&started&&assets.current.base;
   };
   function sync(){
    if(disposed)return;
    if(reduced){el.dataset.motion='reduced';el.dataset.entry=started?'complete':'waiting';return}
    const allowed=available(),moving=allowed&&!activeRef.current;
    el.dataset.motion=moving&&entered?'running':'paused';
    el.dataset.entry=!started?'waiting':entered?'complete':allowed?'running':'paused';
    if(allowed&&!entered)entry?.play();else entry?.pause();
    if(moving&&entered&&assets.current.cart)ambient.play();else ambient.pause();
   }
   if(reduced){if(!entranceRef)g.set(art,{autoAlpha:1,y:0});g.set(cart,{xPercent:0,yPercent:0});g.set(Object.values(lights),{opacity:0});entered=true}
   else{
    if(!entranceRef)entry=g.timeline({paused:true,defaults:{ease:'power3.out'},onComplete:()=>{entered=true;sync()}})
     .fromTo(art,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:1.15,immediateRender:false},0);
    g.set(cart,{xPercent:0,yPercent:0});g.set(Object.values(lights),{opacity:0});
    // The cart follows the same short foreground route in both directions.
    // Endpoint pauses and a closed return path avoid a repeat-position jump.
    ambient=g.timeline({paused:true,repeat:-1,repeatDelay:1.2,defaults:{ease:'sine.inOut'}})
     .addLabel('home',0).addLabel('gas',3).addLabel('fire',6).addLabel('workshop',9).addLabel('cooling',14)
     .to(cart,{xPercent:145,yPercent:-10,duration:9},.2)
     .to(cart,{xPercent:0,yPercent:0,duration:9},11.2);
    for(const [id,label] of [['water','home'],['gas','gas'],['fire','fire'],['industry','workshop'],['cooling','cooling']]){
     ambient.to(lights[id],{opacity:.54,duration:1.1},label)
      .to(lights[id],{opacity:0,duration:1.4},label+'+=1.65');
    }
   }
   const begin=()=>{started=true;sync()},blur=()=>{windowFocused=false;sync()},focus=()=>{windowFocused=true;sync()};
   const navigationChange=event=>{navigationOpen=typeof event.detail?.open==='boolean'?event.detail.open:document.documentElement.dataset.navOpen==='true';sync()};
   for(const [target,event,handler] of [[entranceRef?entryHost:window,entranceRef?'mh-hero-settled':'mh-intro-ready',begin],[window,'mh-dialog-change',sync],[window,'mh-navigation-change',navigationChange],[document,'visibilitychange',sync],[window,'blur',blur],[window,'focus',focus]]){
    target.addEventListener(event,handler);cleanup.push(()=>target.removeEventListener(event,handler));
   }
   const observer=new IntersectionObserver(sync,{threshold:[0,.03]});observer.observe(el);
   const resize=new ResizeObserver(sync);resize.observe(el);
   control.current={sync};sync();
   return()=>{disposed=true;control.current=null;observer.disconnect();resize.disconnect();cleanup.forEach(fn=>fn());entry?.kill();ambient?.kill()};
  },el);
  return()=>{control.current=null;media.revert()};
 },[]);

 const activeScene=SCENES.find(scene=>scene.id===active);
 return <div ref={root} className="hero-neighborhood" data-motion="paused" data-entry="waiting" data-ready={baseReady} data-active={active||undefined} role="group" aria-label={zh?'建筑与工业应用场景':'Building and industrial applications'}>
  <div className="hn-art">
   <img className="hn-base" src={ART} width="1774" height="887" alt="" draggable="false" onLoad={()=>loaded('base')} decoding="async"/>
   <div className="hn-light-layer" aria-hidden="true">
    {SCENES.map(scene=><img key={scene.id} className="hn-light" data-scene={scene.id} src={ART} alt="" draggable="false" style={lightStyle(scene)}/>)}
    {activeScene&&<img className="hn-active-light" src={ART} alt="" draggable="false" style={lightStyle(activeScene)}/>}
   </div>
   <div className="hn-cart-position" aria-hidden="true"><div className="hn-cart-travel"><div className="hn-cart-reveal"><img src={CART} className="hn-cart" width="1167" height="990" alt="" draggable="false" data-ready={cartReady} onLoad={()=>loaded('cart')}/></div></div></div>
   <div className="hn-hotspots">
    {SCENES.map(scene=>{
     const label=zh?scene.zh:scene.en,show=active===scene.id&&!dismissed;
     return <button key={scene.id} type="button" className={'hn-hotspot hn-hotspot--'+scene.id} data-scene={scene.id} aria-label={label} aria-describedby={show?prefix+'-'+scene.id:undefined}
      style={{left:scene.box[0]+'%',top:scene.box[1]+'%',width:scene.box[2]+'%',height:scene.box[3]+'%'}}
      onPointerEnter={()=>{setHovered(scene.id);setDismissed(false)}} onPointerLeave={()=>setHovered(null)}
      onFocus={()=>{setFocused(scene.id);setDismissed(false)}} onBlur={()=>setFocused(null)}
      onKeyDown={event=>{if(event.key==='Escape')setDismissed(true)}} onClick={()=>onSceneSelect?.(scene.id)}>
      <span id={prefix+'-'+scene.id} role="tooltip" className="hn-tooltip" data-visible={show}>{label}</span>
     </button>;
    })}
   </div>
  </div>
 </div>;
}
