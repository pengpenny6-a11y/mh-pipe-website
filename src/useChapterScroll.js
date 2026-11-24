import {useLayoutEffect} from 'react';

// One physical wheel gesture advances one chapter. Keep document scrolling so
// the existing ScrollTriggers, focus, anchors and offscreen renderers still work.
export function useChapterScroll(root,applicationScroll) {
 useLayoutEffect(()=>{
  const el=root.current;
  const desktop=matchMedia('(min-width: 1000px) and (pointer: fine)');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const chapters=[...el.children];
  let stops=[],frame=0,tween=null,moving=false,lastWheel=0,total=0,direction=0,spent=false,disposed=false;
  let active=false;
  const blocked=()=>{
   const d=document.documentElement.dataset;
   return d.booting==='true'||d.dialogOpen==='true'||d.navOpen==='true'||Boolean(d.pageTransition)||document.hidden;
  };
  const measure=()=>{
   const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
   stops=[];
   chapters.forEach((node,index)=>{
    const box=node.getBoundingClientRect();
    const top=index===0?0:Math.max(0,Math.min(max,box.top+scrollY));
    stops.push({y:top,index});
    // Short windows / browser zoom must never make the bottom of a chapter
    // unreachable. Traverse any overflow before advancing to the next section.
    const end=Math.min(max,box.bottom+scrollY-innerHeight);
    if(index>0&&end>top+24){
     for(let y=top+Math.max(280,innerHeight-150);y<end-24;y+=Math.max(280,innerHeight-150))stops.push({y,index});
     stops.push({y:end,index});
    }
   });
   stops=stops.filter((stop,i)=>i===0||stop.y>stops[i-1].y+2);
  };
  const nearest=()=>stops.reduce((best,stop,i)=>Math.abs(stop.y-scrollY)<Math.abs(stops[best].y-scrollY)?i:best,0);
  const paint=()=>{
   frame=0;if(!active||!stops.length)return;
   el.dataset.chapter=String(stops[nearest()].index);
  };
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(paint)};
  const finish=()=>{moving=false;delete el.dataset.chapterMoving;paint()};
  const cancel=()=>{
   if(!moving)return;
   tween?.kill();tween=null;
   // Reset only the animation; start/stop belongs to dialog/loading locks.
   // Unlike scrollTo(currentY), reset also works before the first tween frame.
   window.mhScroll?.reset();
   finish();
  };
  const travel=target=>{
   if(!active||blocked())return;
   cancel();
   moving=true;el.dataset.chapterMoving='true';
   if(window.mhScroll){
    window.mhScroll.scrollTo(target,{duration:1.05,easing:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,immediate:reduce.matches,force:true,onComplete:finish});
   }else if(window.gsap&&!reduce.matches){
    const position={y:scrollY};
    tween=window.gsap.to(position,{y:target,duration:1.05,ease:'power2.inOut',onUpdate:()=>window.scrollTo({top:position.y,behavior:'instant'}),onComplete:finish});
   }else{window.scrollTo({top:target,behavior:'instant'});finish()}
  };
  const goTo=index=>{measure();const stop=stops.find(s=>s.index===index);if(stop)travel(stop.y)};
  const step=dir=>{
   measure();if(!stops.length)return;
   const current=stops[nearest()];
   // At the applications stop, the same gesture explores the six rooms first.
   // The scene controller consumes an in-flight camera move without queuing it.
   if(current.index===1&&Math.abs(current.y-scrollY)<30&&applicationScroll?.current?.advance(dir))return;
   // An anchor or scrollbar may have left us between stops. Continue in the
   // requested direction instead of snapping backwards to a stale index.
   const target=dir>0?stops.find(s=>s.y>scrollY+28):[...stops].reverse().find(s=>s.y<scrollY-28);
   if(target)travel(target.y);
  };
  const editable=target=>target instanceof Element&&target.closest('input,textarea,select,[contenteditable=true],[role=textbox],[data-chapter-scroll-ignore]');
  const nestedScroller=target=>{
   for(let node=target instanceof Element?target:null;node&&node!==document.body;node=node.parentElement){
    if(node.scrollHeight>node.clientHeight+2&&/auto|scroll/.test(getComputedStyle(node).overflowY))return true;
   }
   return false;
  };
  const wheel=({event,deltaX,deltaY})=>{
   if(!active||event.type!=='wheel'||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||blocked()){cancel();return true}
   if(editable(event.target)||nestedScroller(event.target)){cancel();return false}
   // Horizontal trackpad tail events must not replace an in-flight Lenis
   // scroll and orphan its completion callback. Horizontal UI stays native.
   if(Math.abs(deltaX)>Math.abs(deltaY)||!deltaY){if(moving)return false;return true}
   if(event.cancelable)event.preventDefault();
   const now=performance.now(),dir=Math.sign(deltaY);
   if(now-lastWheel>240){spent=false;total=0;direction=dir}
   lastWheel=now;
   // Extend the gesture lock throughout an inertial tail, even after arrival.
   if(moving||spent){spent=true;return false}
   if(dir!==direction){total=0;direction=dir}
   total+=Math.abs(deltaY);
   if(total>=24){spent=true;total=0;step(dir)}
   return false;
  };
  const fallbackWheel=event=>{if(!window.mhScroll)wheel({event,deltaX:event.deltaX,deltaY:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1)})};
  const keyboard=event=>{
   if(event.key==='Tab')cancel();
   if(!active||blocked()||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||editable(event.target)||nestedScroller(event.target))return;
   // Arrows belong to the 3D viewer / product tabs while they have focus.
   if(event.target instanceof Element&&event.target.closest('button,a,[role=tablist],[role=group],.spa-viewport,.pp-stage'))return;
   const dir=['ArrowDown','PageDown',' '].includes(event.key)?(event.shiftKey?-1:1):['ArrowUp','PageUp'].includes(event.key)?-1:0;
   if(!dir&&!['Home','End'].includes(event.key))return;
   event.preventDefault();if(moving||event.repeat)return;
   if(event.key==='Home')goTo(0);else if(event.key==='End')goTo(chapters.length-1);else step(dir);
  };
  const resize=()=>{if(disposed)return;cancel();measure();window.ScrollTrigger?.refresh();paint()};
  const toggle=()=>{
   active=desktop.matches;
   if(active){el.dataset.chapterScroll='true';window.mhChapterScroll=api;measure();paint()}
   else{cancel();delete el.dataset.chapterScroll;delete el.dataset.chapter;if(window.mhChapterScroll===api)delete window.mhChapterScroll}
  };
  const overlay=()=>{if(blocked())cancel()};
  const pointer=()=>{if(moving){cancel();spent=true}};
  const api={wheel,goTo};
  toggle();
  const observer=new ResizeObserver(()=>{measure()});observer.observe(el);
  const listeners=[[window,'wheel',fallbackWheel,{passive:false}],[window,'keydown',keyboard],[window,'scroll',onScroll,{passive:true}],[window,'resize',resize],[window,'pointerdown',pointer],[window,'mh-dialog-change',overlay],[window,'mh-navigation-change',overlay],[window,'mh-intro-ready',resize],[document,'visibilitychange',overlay]];
  listeners.forEach(([node,type,fn,opts])=>node.addEventListener(type,fn,opts));
  desktop.addEventListener('change',toggle);reduce.addEventListener('change',cancel);
  document.fonts.ready.then(()=>{if(!disposed)resize()});
  return()=>{
   disposed=true;cancel();observer.disconnect();cancelAnimationFrame(frame);
   listeners.forEach(([node,type,fn,opts])=>node.removeEventListener(type,fn,opts));
   desktop.removeEventListener('change',toggle);reduce.removeEventListener('change',cancel);
   if(window.mhChapterScroll===api)delete window.mhChapterScroll;
   delete el.dataset.chapterScroll;delete el.dataset.chapter;
  };
 },[root,applicationScroll]);
}
