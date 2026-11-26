import {routeHref} from './site-routes.js';
import React, {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {ArrowUpRight, ArrowLeft} from 'lucide-react';
import {scenes as originalScenes} from './content.js';
import './precision-applications.css';

const text=(lang,en,zh)=>lang==='zh'?zh:en;
const sceneIds=['water','home-water','gas','fire','industry','cooling'];
const sceneImage=id=>'/assets/gallery/'+({water:'water-v3','home-water':'water-v2',fire:'fire-v2'}[id]||id)+'.webp';
const sceneSolution=id=>id==='home-water'?'/applications?scene=water&application=home-water':'/applications?scene='+id;
const initialScene=()=>{const id=new URLSearchParams(location.search).get('scene');return sceneIds.includes(id)?id:null;};

// These are crops of the scene photograph itself, never a substitute installation drawing.
// Coordinates are percentages in the 1536 × 1024 source image, before camera movement.
export const PIPE_REGIONS={
 water:[
  'polygon(43.9% 1%,45.4% 1%,45.4% 99%,43.9% 99%)',
  'polygon(44.3% 19.5%,61.2% 19.5%,61.2% 21.6%,44.3% 21.6%)',
  'polygon(44.3% 50.2%,61.2% 50.2%,61.2% 52.4%,44.3% 52.4%)',
  'polygon(44.3% 82.5%,61.2% 82.5%,61.2% 84.7%,44.3% 84.7%)',
 ],
 'home-water':[
  'polygon(23.7% 0%,26.7% 0%,26.7% 79%,23.7% 79%)',
  'polygon(25% 42%,32.5% 42%,32.5% 46.5%,25% 46.5%)',
 ],
 gas:[
  'polygon(10% 14.6%,61% 14.6%,65% 17.5%,65% 39%,61.4% 39%,61.4% 21%,59.5% 18.6%,10% 18.6%)',
  'polygon(69% 42.7%,83% 42.7%,83% 46.4%,69% 46.4%)',
 ],
 fire:[
  'polygon(0% 9.5%,100% 9.5%,100% 14.4%,0% 14.4%)',
  'polygon(63% 11%,66.5% 11%,68.9% 16%,68.9% 98%,65.3% 98%,65.3% 17%,63% 15%)',
  'polygon(13.2% 13%,16.2% 13%,16.2% 22%,13.2% 22%)',
  'polygon(46.6% 13%,49.7% 13%,49.7% 22%,46.6% 22%)',
  'polygon(87.8% 13%,90.3% 13%,90.3% 22%,87.8% 22%)',
 ],
 industry:[
  'polygon(6% 0%,10% 0%,10% 19%,12% 22%,94% 24%,97% 27%,97% 57%,93% 57%,93% 29%,91% 28%,10% 26%,6% 21%)',
  'polygon(56% 24%,60% 24%,60% 44%,56% 44%)',
 ],
 cooling:[
  'polygon(2.5% 28%,2.5% 18%,4% 12%,8.2% 9%,88.5% 9%,93.8% 12%,95.5% 17%,95.5% 93%,90.5% 93%,90.5% 18%,88% 16%,9% 16%,7% 18%,7% 28%)',
  'polygon(8.2% 28%,8.8% 23%,12.8% 19.3%,83.8% 19.3%,88% 23%,89.6% 28%,89.6% 94%,85% 94%,85% 28%,82% 24%,14% 24%,12% 26%,12% 28%)',
  'polygon(81% 43%,97.8% 43%,97.8% 51.5%,81% 51.5%)',
  'polygon(81% 54%,90% 54%,90% 59.8%,81% 59.8%)',
  'polygon(81% 63%,90% 63%,90% 70%,81% 70%)',
  'polygon(81% 73%,90% 73%,90% 80%,81% 80%)',
 ],
};
const galleryScenes=[
 {id:'water',name:{zh:'建筑给水',en:'Building water'},description:{zh:'从立管到用水终端，连接建筑中的日常。',en:'From risers to outlets, connecting everyday water use.'},focal:.46},
 {id:'home-water',name:{zh:'家庭活水',en:'Home water'},description:{zh:'从厨房到卫浴，连接家中的日常用水。',en:'Connecting everyday water use, from kitchen to bathroom.'},focal:.50,light:'polygon(48.8% 59.7%,50.8% 59.7%,50.8% 75.2%,48.8% 75.2%)'},
 {id:'gas',name:{zh:'建筑燃气',en:'Building gas'},description:{zh:'从楼栋立管到室内支管，延伸至用气空间。',en:'From building risers to the spaces where gas is used.'},focal:.59},
 {id:'fire',name:{zh:'消防',en:'Fire protection'},description:{zh:'从建筑管网到消防末端，贯穿公共空间。',en:'Building pipework serving fire-protection systems.'},focal:.50},
 {id:'industry',name:{zh:'工业',en:'Industry'},description:{zh:'连接生产设备与厂务管路。',en:'Connecting production equipment and plant utilities.'},focal:.58,light:'polygon(73.1% 57.1%,76.5% 57.1%,76.5% 61.1%,73.1% 61.1%)'},
 {id:'cooling',name:{zh:'液冷数据中心',en:'Liquid cooling'},description:{zh:'连接冷却分配与机柜，走近数据中心。',en:'Pipework connecting cooling distribution and server racks.'},focal:.50,lights:['polygon(14.5% 43%,18.5% 43%,18.5% 88%,14.5% 88%)','polygon(77.7% 44%,80% 44%,80% 86%,77.7% 86%)']},
];

/** Architectural windows share one continuous exhibition, with no scroll locking. */
export default function PrecisionApplications({lang='en',go,sceneRequest}){
 const [active,setActive]=useState(initialScene),[hover,setHover]=useState(null),[pipework,setPipework]=useState(false);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [dimensions,setDimensions]=useState({width:1320,height:500});
 const [moving,setMoving]=useState(false);
 const root=useRef(null),frame=useRef(null),panels=useRef([]),layoutMotion=useRef(null),detailMotion=useRef(null),pipeMotion=useRef(null),pointerMotion=useRef([]),hoverIntent=useRef(null),pointerBounds=useRef(null);
 const firstLayout=useRef(true),activeRef=useRef(active),detail=useRef(null),headerAction=useRef(null),buttonRefs=useRef([]),pauseState=useRef({inView:false,focused:!document.hidden});
 const uid=useId();
 const selected=galleryScenes.find(scene=>scene.id===active),spotlight=active||hover;
 const sceneCount=galleryScenes.length;
 const {width,height}=dimensions, gap=width<780?8:12,available=width-gap*(sceneCount-1);
 const planeWidth=Math.max(width*.55,height*1.5),planeHeight=planeWidth/1.5;
 const expanded=Boolean(active),preview=Boolean(!active&&hover);
 const layoutKey=active?'selected:'+active:'overview:'+(hover||'');
 const sizes=galleryScenes.map(scene=>available*(expanded?(scene.id===active ? .48 : (1-.48)/(sceneCount-1)):preview?(scene.id===hover ? .195 : (1-.195)/(sceneCount-1)):1/sceneCount));
 const labelWidth=Math.max(70,Math.min(available/sceneCount,available*(1-.48)/(sceneCount-1))-12);
 activeRef.current=active;

 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(media.matches);
  media.addEventListener('change',update);
  galleryScenes.forEach(scene=>{const image=new Image();image.src=sceneImage(scene.id);image.decode?.().catch(()=>{});});
  return()=>{media.removeEventListener('change',update);clearTimeout(hoverIntent.current);};
 },[]);

 useLayoutEffect(()=>{
  const el=frame.current;
  const measure=()=>{
   const labelHeight=parseFloat(getComputedStyle(el).getPropertyValue('--pa-label-height'))||99;
   const next={width:el.clientWidth,height:el.clientHeight-labelHeight};
   const bounds=el.getBoundingClientRect();pointerBounds.current={left:bounds.left,top:bounds.top+window.scrollY,width:bounds.width};
   setDimensions(prev=>Math.abs(prev.width-next.width)<.5&&Math.abs(prev.height-next.height)<.5?prev:next);
  };
  const observer=new ResizeObserver(measure);observer.observe(el);measure();
  return()=>observer.disconnect();
 },[]);

 useEffect(()=>{
  const state=pauseState.current;
  const update=()=>{
   const next=!reduced&&state.inView&&state.focused&&!document.hidden&&document.documentElement.dataset.navOpen!=='true'&&document.documentElement.dataset.dialogOpen!=='true';
   setMoving(next);
   [layoutMotion.current,detailMotion.current,pipeMotion.current].forEach(timeline=>next?timeline?.resume():timeline?.pause());
   if(!next)clearTimeout(hoverIntent.current);
  };
  const observer=new IntersectionObserver(([entry])=>{state.inView=entry.isIntersecting;update();},{threshold:.04});observer.observe(frame.current);
  const hide=()=>{state.focused=false;update();};const show=()=>{state.focused=!document.hidden;update();};
  window.addEventListener('blur',hide);window.addEventListener('focus',show);document.addEventListener('visibilitychange',show);
  window.addEventListener('mh-navigation-change',update);window.addEventListener('mh-dialog-change',update);update();
  return()=>{observer.disconnect();window.removeEventListener('blur',hide);window.removeEventListener('focus',show);document.removeEventListener('visibilitychange',show);window.removeEventListener('mh-navigation-change',update);window.removeEventListener('mh-dialog-change',update);};
 },[reduced]);

 useLayoutEffect(()=>{
  const g=window.gsap;if(!g)return;
  layoutMotion.current?.kill();
  let x=0;const immediate=firstLayout.current||reduced;
  const tl=g.timeline({defaults:{duration:expanded ? .9 : .55,ease:expanded?'power3.inOut':'power3.out'}});
  galleryScenes.forEach((scene,index)=>{
   const el=panels.current[index];if(!el)return;
   const w=sizes[index],target={x,clipPath:`inset(0px ${Math.max(0,planeWidth-w)}px 0px 0px)`};
   const imageX=(w-planeWidth)*scene.focal;
   const labelX=(w-planeWidth)/2;
   const stagger=expanded?0:index%2?28:0;
   const values=[
    [el,target],
    [el.querySelector('.pa-scene-button'),{width:w}],
    [el.querySelector('.pa-window'),{clipPath:`inset(${stagger}px 0px 0px 0px)`}],
    [el.querySelector('.pa-photo'),{x:imageX,y:(height-planeHeight)/2}],
    [el.querySelector('.pa-camera'),{scale:scene.id===active?1.035:scene.id===hover?1.012:1}],
    [el.querySelector('.pa-label'),{x:labelX,scale:scene.id===active?1.06:1}],
   ];
   values.forEach(([target,value])=>immediate?g.set(target,value):tl.to(target,value,0));
   x+=w+gap;
  });
  firstLayout.current=false;layoutMotion.current=tl;
  if(!moving&&!immediate)tl.progress(1);
  return()=>tl.kill();
 },[layoutKey,width,height,reduced]);

 useLayoutEffect(()=>{
  const g=window.gsap;if(!g||reduced)return;
  const ctx=g.context(()=>{
   g.fromTo('.pa-heading-word',{yPercent:110},{yPercent:0,duration:.9,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:root.current.querySelector('.pa-header'),start:'top 88%',once:true}});
   g.fromTo('.pa-entry',{y:24,autoAlpha:0},{y:0,autoAlpha:1,duration:.85,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:frame.current,start:'top 91%',once:true}});
   g.fromTo('.pa-scroll-depth',{scale:1.04,y:index=>index%2?12:7},{scale:1,y:index=>index%2?-8:-4,ease:'none',scrollTrigger:{trigger:frame.current,start:'top bottom',end:'bottom top',scrub:.85,invalidateOnRefresh:true}});
  },root);
  return()=>ctx.revert();
 },[reduced]);

 useLayoutEffect(()=>{
  const g=window.gsap;if(!g||!detail.current)return;
  detailMotion.current?.kill();
  if(reduced){g.set(detail.current,{opacity:1,y:0});return;}
  detailMotion.current=g.fromTo(detail.current,{opacity:0,y:12},{opacity:1,y:0,duration:.6,delay:active ? .23 : 0,ease:'power3.out'});
  return()=>detailMotion.current?.kill();
 },[active,lang,reduced]);

 useLayoutEffect(()=>{
  const g=window.gsap;if(!g)return;
  pipeMotion.current?.kill();
  const tl=g.timeline({defaults:{ease:'power2.inOut'}});
  galleryScenes.forEach((scene,index)=>{
   const el=panels.current[index],opened=scene.id===active&&pipework;
   const environment=el.querySelector('.pa-environment');
   const reveals=el.querySelectorAll('.pa-pipe-reveal');
   if(reduced){g.set(environment,{opacity:opened ? .24 : 1});g.set(reveals,{clipPath:opened?'inset(0% 0% 0% 0%)':'inset(0% 100% 0% 0%)'});return;}
   tl.to(environment,{opacity:opened ? .24 : 1,duration:.5},0);
   reveals.forEach((reveal,i)=>{
    const vertical=(scene.id==='water'||scene.id==='home-water')?i===0:i>0;
    const closed=vertical?'inset(0% 0% 100% 0%)':'inset(0% 100% 0% 0%)';
    if(!opened&&scene.id!==active){g.set(reveal,{clipPath:closed});return;}
    tl.to(reveal,{clipPath:opened?'inset(0% 0% 0% 0%)':closed,duration:opened ? .72 : .38},opened ? .08+i*.13 : 0);
   });
  });
  pipeMotion.current=tl;if(!moving)tl.progress(1);
  return()=>tl.kill();
 },[active,pipework,reduced]);

 useLayoutEffect(()=>{
  const g=window.gsap;if(!g)return;
  pointerMotion.current.forEach(motion=>{motion.x?.tween.kill();motion.y?.tween.kill();});
  pointerMotion.current=panels.current.map(el=>({
   x:g.quickTo(el.querySelector('.pa-pointer'), 'x',{duration:.9,ease:'power3.out'}),
   y:g.quickTo(el.querySelector('.pa-pointer'), 'y',{duration:.9,ease:'power3.out'}),
  }));
  return()=>{pointerMotion.current.forEach(motion=>{motion.x?.tween.kill();motion.y?.tween.kill();});};
 },[width,height]);

 const updateUrl=id=>{const url=new URL(location.href);if(id)url.searchParams.set('scene',id);else url.searchParams.delete('scene');history.replaceState(history.state,'',url);};
 function choose(id){clearTimeout(hoverIntent.current);setActive(id);setHover(null);setPipework(false);updateUrl(id);}
 function overview(restoreFocus=false){clearTimeout(hoverIntent.current);const previous=activeRef.current;setActive(null);setPipework(false);updateUrl(null);if(restoreFocus)buttonRefs.current[sceneIds.indexOf(previous)]?.focus({preventScroll:true});setHover(null);}
 useEffect(()=>{if(sceneRequest&&sceneIds.includes(sceneRequest.id))choose(sceneRequest.id);},[sceneRequest]);
 useEffect(()=>{const sync=()=>{clearTimeout(hoverIntent.current);setActive(initialScene());setPipework(false);setHover(null);};window.addEventListener('popstate',sync);window.addEventListener('mh-intro-ready',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('mh-intro-ready',sync);};},[]);

 function sceneKey(event,index){
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%sceneCount;
  if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+sceneCount-1)%sceneCount;
  if(event.key==='Home')next=0;if(event.key==='End')next=sceneCount-1;
  if(next!==undefined){event.preventDefault();buttonRefs.current[next]?.focus();}
 }
 function pointerMove(event,index){
  if(reduced||!moving||active!==galleryScenes[index].id)return;
  const rect=pointerBounds.current;if(!rect)return;
  const center=Math.max(-.5,Math.min(.5,(event.clientX-rect.left)/rect.width-.5));
  const y=Math.max(-.5,Math.min(.5,(event.clientY+window.scrollY-rect.top)/height-.5));
  pointerMotion.current[index]?.x(center*-16);pointerMotion.current[index]?.y(y*-10);
 }
 function requestHover(id,immediate=false){
  clearTimeout(hoverIntent.current);
  if(activeRef.current)return;
  if(immediate||reduced)setHover(id);else hoverIntent.current=setTimeout(()=>{if(!activeRef.current)setHover(id);},100);
 }
 function pointerEnter(id){const bounds=frame.current.getBoundingClientRect();pointerBounds.current={left:bounds.left,top:bounds.top+window.scrollY,width:bounds.width};requestHover(id);}
 function pointerLeave(index){requestHover(null);pointerMotion.current[index]?.x(0);pointerMotion.current[index]?.y(0);}
 function openSolution(event){if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&go){event.preventDefault();go(sceneSolution(active));}}
 const pipeAvailable=active&&(PIPE_REGIONS[active]?.length>0);

 return <section id="applications" ref={root} className="pa-root pa-gallery" data-scene={active||'overview'} data-motion={moving?'running':'paused'} data-pipework={pipework} aria-labelledby={uid+'-title'} onKeyDown={event=>{if(event.key==='Escape'&&active){event.preventDefault();overview(true);}}}>
  <header className="pa-header">
   <h2 id={uid+'-title'} className="pa-chapter-title"><span><span className="pa-heading-word">{text(lang,'Applications','应用领域')}</span></span></h2>
   <div className="pa-header-action" ref={headerAction}>{active?<button className="pa-overview" onClick={()=>overview()}><ArrowLeft size={20} strokeWidth={1.6}/>{text(lang,'All applications','返回总览')}</button>:<p>{text(lang,'Choose a space. Explore its pipework.','选择一个场景，走近管道应用。')}</p>}</div>
  </header>
  <div className="pa-frame" ref={frame} role="group" aria-label={text(lang,'Explore six application areas','探索六大应用领域')}>
   {galleryScenes.map((scene,index)=>{
    const isSelected=scene.id===active,isLit=scene.id===spotlight;
    return <div className="pa-panel" key={scene.id} ref={el=>panels.current[index]=el} style={{width:planeWidth}} data-id={scene.id} data-selected={isSelected} data-lit={isLit}>
     <div className="pa-entry">
      <button className="pa-scene-button" ref={el=>buttonRefs.current[index]=el} onClick={()=>choose(scene.id)} onPointerEnter={()=>pointerEnter(scene.id)} onPointerMove={event=>pointerMove(event,index)} onPointerLeave={()=>pointerLeave(index)} onFocus={()=>requestHover(scene.id,true)} onBlur={()=>requestHover(null)} onKeyDown={event=>sceneKey(event,index)} aria-pressed={isSelected} aria-controls={uid+'-detail'} aria-label={text(lang,'Explore ','探索')+scene.name[lang]}>
       <span className="pa-window" style={{height,width:planeWidth}}>
        <span className="pa-photo" style={{width:planeWidth,height:planeHeight}}>
         <span className="pa-scroll-depth"><span className="pa-camera"><span className="pa-pointer">
          <img className="pa-environment" src={sceneImage(scene.id)} alt="" draggable="false" width="1536" height="1024" onError={event=>{const fallback=originalScenes.find(item=>item.id===(scene.id==='home-water'?'water':scene.id))?.image;if(fallback&&!event.currentTarget.dataset.fallback){event.currentTarget.dataset.fallback='true';event.currentTarget.src=fallback;}}}/>
          {PIPE_REGIONS[scene.id]?.map((region,i)=><span className="pa-pipe-reveal" key={i} aria-hidden="true"><img className="pa-pipe-crop" src={sceneImage(scene.id)} style={{clipPath:region}} alt="" draggable="false"/></span>)}
          {(scene.lights||(scene.light?[scene.light]:[])).map((region,i)=><span className="pa-local-mask" key={i} style={{clipPath:region}} aria-hidden="true"><img className="pa-local-light" src={sceneImage(scene.id)} style={{animationDelay:(i*1.7)+'s'}} alt="" draggable="false"/></span>)}
         </span></span></span>
        </span>
       </span>
       <span className="pa-label" style={{top:height+18,width:planeWidth}}><span style={{maxWidth:labelWidth}}>{scene.id==='cooling'&&lang==='zh'?<><span className="pa-label-word">液冷</span><wbr/><span className="pa-label-word">数据中心</span></>:scene.name[lang]}</span></span>
      </button>
     </div>
    </div>;
   })}
  </div>
  <div className="pa-information" id={uid+'-detail'} aria-live="polite" ref={detail}>
   {selected?<>
    <div className="pa-description"><h3>{selected.name[lang]}</h3><p>{selected.description[lang]}</p></div>
    <div className="pa-actions">
     {pipeAvailable&&<button className="pa-pipe-toggle" aria-pressed={pipework} onClick={()=>setPipework(value=>!value)}>{pipework?text(lang,'Show the space','查看场景'):text(lang,'View pipework','查看管路')}</button>}
     <a className="pa-solution-link" href={routeHref(sceneSolution(active),lang)} onClick={openSolution}>{text(lang,'Explore solution','探索解决方案')}<ArrowUpRight size={23} strokeWidth={1.6}/></a>
    </div>
   </>:<span className="pa-note">{text(lang,'Illustrative application environments','应用场景示意')}</span>}
  </div>
 </section>;
}
