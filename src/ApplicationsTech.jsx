import React,{useState,useRef,useLayoutEffect,useEffect} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {products,scenes} from './content.js';
import {solutionScenes,solutionCopy} from './solution-content.js';
import './applications-tech.css';
const t=(l,en,zh)=>l==='zh'?zh:en;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export default function ApplicationsTech({lang='en',onProduct,onInquiry,full=false,story=false,expanded=false}){
 const start=new URLSearchParams(location.search).get('scene');
 const [id,setId]=useState(scenes.some(s=>s.id===start)?start:'industry');
 const [previous,setPrevious]=useState(null);const [node,setNode]=useState(null);const [loaded,setLoaded]=useState('');
 const root=useRef(),viewport=useRef(),camera=useRef(),current=useRef(),cameraTween=useRef(),selection=useRef(0),panPlane=useRef(),panTarget=useRef({x:0,y:0}),drag=useRef(null),card=useRef();const scene=scenes.find(s=>s.id===id);const product=node?products.find(p=>p.id===node.product):null;
 const [dimensions,setDimensions]=useState({width:1440,height:960,left:0,top:0});const Heading=full?'h1':'h2';const solution=solutionScenes.find(s=>s.id===id);
 useLayoutEffect(()=>{const el=viewport.current;const measure=()=>{const r=el.getBoundingClientRect();const w=Math.max(r.width,r.height*1.5);setDimensions({width:w,height:w/1.5,left:(r.width-w)/2,top:(r.height-w/1.5)/2})};const observer=new ResizeObserver(measure);observer.observe(el);measure();return()=>observer.disconnect()},[]);
 useEffect(()=>{const plane=panPlane.current;scenes.forEach(s=>{const i=new Image();i.src=s.image;i.decode?.().catch(()=>{})});return()=>{selection.current++;cameraTween.current?.kill();window.gsap?.killTweensOf(plane)}},[]);
 useLayoutEffect(()=>{const g=window.gsap;if(!g)return;if(loaded===id){
  const animation=g.fromTo(current.current,{opacity:reduced()?1:0},{opacity:1,duration:reduced()?0:1.1,ease:'sine.inOut',overwrite:true});
  return()=>animation.kill();
 }},[id,loaded]);
 useLayoutEffect(()=>{const g=window.gsap;if(!g)return;cameraTween.current?.kill();const box=viewport.current.getBoundingClientRect(),scale=node?1.65:1;
  const x=node?box.width*.55-(dimensions.left+dimensions.width*.5+(node.x/100-.5)*dimensions.width*scale):0;
  const y=node?box.height*.47-(dimensions.top+dimensions.height*.5+(node.y/100-.5)*dimensions.height*scale):0;
  cameraTween.current=g.to(camera.current,{scale,x,y,transformOrigin:'50% 50%','--ap-point-scale':1/scale,duration:reduced()?0:1.25,ease:'power2.inOut',overwrite:true});
  return()=>cameraTween.current?.kill();
 },[node,dimensions,id]);
 useLayoutEffect(()=>{
  drag.current=null;root.current?.classList.remove('ap-dragging');panTarget.current={x:0,y:0};
  const g=window.gsap;if(!g)return;g.to(panPlane.current,{x:0,y:0,duration:reduced()?0:.6,ease:'power2.inOut',overwrite:true});
  if(!node||!card.current)return;
  if(reduced()){g.set(card.current,{autoAlpha:1,clipPath:'inset(0)'});return}
  const ctx=g.context(()=>{
   g.set(card.current,{autoAlpha:0,clipPath:'inset(0 0 100% 0)'});
   g.timeline().set(card.current,{autoAlpha:1},.32)
    .to(card.current,{clipPath:'inset(0 0 0% 0)',duration:.68,ease:'power3.out'},.32)
    .fromTo(card.current.querySelector('img'),{y:18,scale:.94,opacity:0},{y:0,scale:1,opacity:1,duration:.7,ease:'power3.out'},.44)
    .fromTo(card.current.querySelectorAll('h3,.ap-node-details'),{y:10,opacity:0},{y:0,opacity:1,duration:.5,stagger:.08,ease:'power2.out'},.65);
  },root);return()=>ctx.revert();
 },[node?.id,id]);
 function panLimits(){
  const box=viewport.current.getBoundingClientRect(),image=camera.current.getBoundingClientRect(),scale=Math.max(1,Number(window.gsap?.getProperty(camera.current,'scale'))||1),rangeX=Math.min(90,box.width*.09)/scale,rangeY=Math.min(65,box.height*.1)/scale;
  return {scale,minX:Math.max(-rangeX,Math.min(0,(box.right-image.right)/scale)),maxX:Math.min(rangeX,Math.max(0,(box.left-image.left)/scale)),minY:Math.max(-rangeY,Math.min(0,(box.bottom-image.bottom)/scale)),maxY:Math.min(rangeY,Math.max(0,(box.top-image.top)/scale))};
 }
 function panTo(x,y,limits=panLimits()){
  const next={x:Math.max(limits.minX,Math.min(limits.maxX,x)),y:Math.max(limits.minY,Math.min(limits.maxY,y))};panTarget.current=next;
  if(window.gsap)window.gsap.to(panPlane.current,{...next,duration:reduced()?0:.38,ease:'power3.out',overwrite:true});
 }
 function startPan(e){
  if(!node||e.button!==0||e.pointerType==='touch'||e.target.closest('button,a'))return;
  const g=window.gsap;if(!g)return;g.killTweensOf(panPlane.current);
  drag.current={pointer:e.pointerId,startX:e.clientX,startY:e.clientY,x:Number(g.getProperty(panPlane.current,'x'))||0,y:Number(g.getProperty(panPlane.current,'y'))||0,limits:panLimits()};
  viewport.current.setPointerCapture(e.pointerId);viewport.current.focus({preventScroll:true});root.current.classList.add('ap-dragging');
 }
 function movePan(e){const d=drag.current;if(!d||e.pointerId!==d.pointer)return;panTo(d.x+(e.clientX-d.startX)/d.limits.scale,d.y+(e.clientY-d.startY)/d.limits.scale,d.limits)}
 function finishPan(e){if(drag.current?.pointer!==e.pointerId)return;drag.current=null;root.current.classList.remove('ap-dragging');if(viewport.current.hasPointerCapture(e.pointerId))viewport.current.releasePointerCapture(e.pointerId)}
 function keyPan(e){
  if(!node||e.target!==viewport.current)return;
  const directions={ArrowLeft:[24,0],ArrowRight:[-24,0],ArrowUp:[0,24],ArrowDown:[0,-24]};
  if(directions[e.key]){e.preventDefault();const [x,y]=directions[e.key];panTo(panTarget.current.x+x,panTarget.current.y+y)}
  if(e.key==='Home'){e.preventDefault();panTo(0,0)}
  if(e.key==='Escape'){e.preventDefault();setNode(null);root.current.querySelector('.ap-explore')?.focus({preventScroll:true})}
 }
 async function choose(next){if(next===id)return;const ticket=++selection.current;const target=scenes.find(s=>s.id===next),img=new Image();img.src=target.image;try{await img.decode()}catch{}if(ticket!==selection.current)return;
  setPrevious({scene,dimensions,transform:camera.current.style.transform,pan:panPlane.current.style.transform});setNode(null);setLoaded('');setId(next);const u=new URL(location);u.searchParams.set('scene',next);history.replaceState({},'',u);window.dispatchEvent(new CustomEvent('mh-scene-change',{detail:{id:next}}))}
 const onTab=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const i=scenes.findIndex(s=>s.id===id);const n=e.key==='Home'?0:e.key==='End'?scenes.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+scenes.length)%scenes.length;choose(scenes[n].id);e.currentTarget.parentElement.children[n].focus()};
 return <section id="applications" className={'ap-root'+(full?' ap-full':'')+(story?' ap-story':'')+(node?' ap-focused':'')} ref={root}>
  {story&&<div className="ap-story-heading"><Heading>{t(lang,'Application solutions','应用解决方案')}<HeadingEnglish lang={lang}>Application solutions</HeadingEnglish></Heading><p>{t(lang,'Explore piping and connections by application, then prepare your product and project requirements.','查看不同场景中的管路与连接位置，整理对应的产品和项目需求。')}</p></div>}
  <div className="ap-stage">
   <div className="ap-viewport" ref={viewport} tabIndex={node?0:-1} role="group" aria-label={t(lang,'Application scene. When enlarged, drag or use arrow keys to inspect. Home resets the view.','应用场景。放大后可拖动或使用方向键查看，Home 键复位。')} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={finishPan} onPointerCancel={finishPan} onLostPointerCapture={finishPan} onKeyDown={keyPan}>
    {previous&&<div className="ap-previous-camera" style={{...previous.dimensions,transform:previous.transform}} aria-hidden="true"><div className="ap-previous-pan" style={{transform:previous.pan}}><img src={previous.scene.image} alt=""/></div></div>}
    <div className="ap-current" ref={current} style={{opacity:loaded===id?1:0}}><div className="ap-camera" ref={camera} style={dimensions}><div className="ap-pan-layer" ref={panPlane}>
     <img key={id} className="ap-image" src={scene.image} alt={scene.description[lang]} onLoad={()=>setLoaded(id)} draggable="false"/>
     {scene.hotspots.map(h=><button className={'ap-hotspot'+(node?.id===h.id?' ap-active':'')} key={h.id} onClick={()=>setNode(h)} style={{left:h.x+'%',top:h.y+'%'}} disabled={loaded!==id} aria-label={t(lang,'Explore ','查看')+products.find(p=>p.id===h.product).name[lang]}><span>+</span></button>)}
    </div></div></div>
   </div>
   <div className="ap-title-copy">{!story&&<><p>{t(lang,'Piping applications','管道系统应用')}</p><Heading>{scene.name[lang]}.</Heading></>}<button className="ap-explore" onClick={()=>setNode(node?null:scene.hotspots[0])}>{node?t(lang,'Back to full view','返回全景'):t(lang,'Explore the connections','探索连接细节')}<span>{node?'−':'+'}</span></button></div>
   {product&&<div className="ap-node-card" ref={card}><button className="ap-close" onClick={()=>setNode(null)} aria-label={t(lang,'Back to full view','返回全景')}>×</button><img src={product.image} alt={product.name[lang]}/><h3>{product.name[lang]}<HeadingEnglish lang={lang}>{product.name.en}</HeadingEnglish></h3><button className="ap-node-details" onClick={()=>onProduct(product,id)}>{t(lang,'View product','查看产品')}<span>+</span></button></div>}
   <div className="ap-study">{t(lang,'Application study','应用示意')}</div>
  </div>
  <div className="ap-tabs" role="tablist" aria-label={t(lang,'Application areas','应用领域')}>{scenes.map(s=><button key={s.id} role="tab" tabIndex={s.id===id?0:-1} aria-selected={s.id===id} onClick={()=>choose(s.id)} onKeyDown={onTab}><span>{s.name[lang]}</span><span className="ap-tab-symbol">{s.id===id?'−':'+'}</span></button>)}</div>
  {story&&!expanded&&<div className="ap-story-context"><p>{solution.description[lang]}</p><div className="ap-requirements" aria-label={solutionCopy.requirementsHeading[lang]}>{solution.requirements.map(r=><span key={r.id}>{r.name[lang]}</span>)}{onInquiry&&<button onClick={()=>onInquiry({interest:solution.name[lang]+' — '+solution.requirements.map(r=>r.name[lang]).join(' / ')})}>{solutionCopy.inquiryAction[lang]}<span>+</span></button>}</div></div>}
  {full&&!story&&<div className="ap-information"><div><h2>{t(lang,'Connect the system.','连接完整系统。')}</h2><p>{scene.description[lang]}</p><p>{t(lang,'Share your layout, required sizes and operating conditions to discuss product selection.','提供管路布置、所需尺寸与使用条件，进一步沟通产品选型。')}</p></div><div className="ap-products">{products.slice(0,3).map(p=><button key={p.id} onClick={()=>onProduct(p,id)}><img src={p.image} alt={p.name[lang]}/><span>{p.name[lang]}</span></button>)}</div></div>}
 </section>
}
