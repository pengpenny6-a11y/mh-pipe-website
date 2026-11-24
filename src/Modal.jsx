import React,{useLayoutEffect,useRef} from 'react';
import {reducedMotion} from './site-motion.js';
export default function Modal({children,close,label,kind='',origin}){
 const ref=useRef(),backdrop=useRef(),closing=useRef(false),closeAnimation=useRef(),closeRef=useRef(close);closeRef.current=close;
 function dismiss(){
  if(closing.current)return;const g=window.gsap;if(!g||reducedMotion()){closeRef.current();return}closing.current=true;
  const picture=ref.current.querySelector('.detail-image img');
  if(origin&&picture){
   g.killTweensOf(picture);g.killTweensOf(ref.current.querySelectorAll('.detail-copy,.modal-close'));const rect=picture.getBoundingClientRect();
   const target={x:Number(g.getProperty(picture,'x'))+origin.x+origin.width/2-rect.x-rect.width/2,y:Number(g.getProperty(picture,'y'))+origin.y+origin.height/2-rect.y-rect.height/2,scaleX:Number(g.getProperty(picture,'scaleX'))*origin.width/rect.width,scaleY:Number(g.getProperty(picture,'scaleY'))*origin.height/rect.height};
   g.set(ref.current,{overflow:'visible',background:'transparent'});g.set(ref.current.querySelector('.detail-image'),{overflow:'visible',background:'transparent'});
   const timeline=g.timeline({onComplete:()=>closeRef.current()});closeAnimation.current=timeline;
   timeline.to(ref.current.querySelectorAll('.detail-copy,.modal-close'),{opacity:0,duration:.18},0)
    .to(backdrop.current,{backgroundColor:'rgba(7,17,38,0)',backdropFilter:'blur(0px)',duration:.55},0)
    .to(picture,{...target,duration:.65,ease:'power3.inOut'},0);
  }else closeAnimation.current=g.to(backdrop.current,{opacity:0,duration:.25,ease:'power2.out',onComplete:()=>closeRef.current()});
 }
 useLayoutEffect(()=>{
  const previous=document.activeElement;document.body.style.overflow='hidden';ref.current?.querySelector('button,input,a')?.focus({preventScroll:true});
  const g=window.gsap;const ctx=g?.context(()=>{
   if(reducedMotion())return;const picture=ref.current.querySelector('.detail-image img');
   if(origin&&picture){const target=picture.getBoundingClientRect();g.set(ref.current,{overflow:'visible'});g.set('.detail-image',{overflow:'visible'});
    g.fromTo(picture,{x:origin.x+origin.width/2-target.x-target.width/2,y:origin.y+origin.height/2-target.y-target.height/2,scaleX:origin.width/target.width,scaleY:origin.height/target.height},{x:0,y:0,scaleX:1,scaleY:1,duration:.85,ease:'power3.inOut',onComplete:()=>{if(!closing.current){g.set(ref.current,{overflow:'auto'});g.set('.detail-image',{overflow:'hidden'})}}});
    g.from('.detail-copy',{opacity:0,y:18,duration:.65,delay:.3});
   }else g.fromTo(ref.current,{y:25,opacity:0},{y:0,opacity:1,duration:.55,ease:'power3.out'});
  },ref);
  function key(e){if(e.key==='Escape')dismiss();if(e.key==='Tab'){const all=[...ref.current.querySelectorAll('button,a,input,select,textarea')].filter(x=>!x.disabled);if(e.shiftKey&&(document.activeElement===all[0]||!ref.current.contains(document.activeElement)||document.activeElement===ref.current)){e.preventDefault();all.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===all.at(-1)){e.preventDefault();all[0]?.focus()}}}
  document.addEventListener('keydown',key);return()=>{closeAnimation.current?.kill();ctx?.revert();g?.killTweensOf(backdrop.current);document.body.style.overflow='';document.removeEventListener('keydown',key);previous?.focus({preventScroll:true})};
 },[]);
 return <div ref={backdrop} className={'modal-backdrop '+kind} onClick={e=>{if(e.target===e.currentTarget)dismiss()}} data-lenis-prevent><div className="modal" ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}><button className="modal-close" onClick={dismiss} aria-label={document.documentElement.lang==='zh'?'关闭':'Close'}>×</button>{children}</div></div>
}
