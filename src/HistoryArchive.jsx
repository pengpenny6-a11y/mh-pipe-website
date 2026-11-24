import React,{useEffect,useRef} from 'react';
import {Hand} from 'lucide-react';
import {typesetMilestone, makeFoldSurface, paintCanvasFold} from './history-print.js';

const bounded = value=>Math.min(1,Math.max(0,value));

export default function HistoryArchive({events, lang, active, onChange, tabId, panelId}) {
  const stage=useRef(null), still=useRef(null), fold=useRef(null), commands=useRef(null), tabs=useRef(null);
  const selected=useRef(active);selected.current=active;
  const zh=lang==='zh', l=zh?0:1;
  const year=e=>e.year || (zh?'今天':'Today');
  useEffect(()=>{
    const area=stage.current, paper=still.current, moving=fold.current, context=paper.getContext('2d');
    if (!context) return;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const photos=[], plates=new Map();
    let current=selected.current, wanted=current, turn=null, pointer=null, frame=0, surface=null, initialized=false, stopped=false;
    let width=0,height=0,ratio=1;
    const project=index=>{
      if(!plates.has(index) && photos[index]?.complete && photos[index]?.naturalWidth && width && height){
        plates.set(index,typesetMilestone(events[index],photos[index],lang,width,height,ratio));
      }
      return plates.get(index);
    };
    function showStill(index) {
      const plate=project(index);
      area.dataset.ready=String(Boolean(plate));
      area.dataset.flipping='false';area.dataset.progress='0';
      if(plate)context.drawImage(plate,0,0,paper.width,paper.height);
    }
    function settle(index) {
      cancelAnimationFrame(frame);frame=0;turn=null;current=index;wanted=index;
      showStill(index);onChange(index);
    }
    function drawTurn(progress) {
      if(!turn)return;
      turn.p=bounded(progress);
      const from=project(turn.from),to=project(turn.to);
      if(!from || !to || motion.matches) return;
      area.dataset.flipping='true';area.dataset.progress=turn.p.toFixed(3);
      const forward=turn.to>turn.from,base=forward?to:from,sheet=forward?from:to,foldProgress=forward?turn.p:1-turn.p;
      if(surface)surface.paint(base,sheet,foldProgress);
      else paintCanvasFold(context,base,sheet,foldProgress);
    }
    function animate(goal) {
      if(!turn)return;
      cancelAnimationFrame(frame);
      const start=performance.now(),initial=turn.p, destination=goal===1?turn.to:turn.from;
      wanted=destination;
      if(motion.matches || !project(turn.from) || !project(turn.to)){settle(destination);return;}
      const duration=Math.max(160,940*Math.abs(initial-goal));
      const step=now=>{
        const t=bounded((now-start)/duration),ease=t*t*(3-2*t);
        drawTurn(initial+(goal-initial)*ease);
        if(t<1)frame=requestAnimationFrame(step);else settle(destination);
      };
      frame=requestAnimationFrame(step);
    }
    function choose(index){
      index=Math.min(events.length-1,Math.max(0,index));
      if(turn && index===turn.from){animate(0);return;}
      if(turn && index===turn.to){animate(1);return;}
      if(turn)settle(turn.p>.5?turn.to:turn.from);
      if(index===current)return;
      turn={from:current,to:index,p:0};animate(1);
    }
    function resize() {
      if(!initialized)return;
      const w=area.clientWidth,h=area.clientHeight;
      if(!w||!h|| (w===width&&h===height))return;
      width=w;height=h;ratio=Math.min(1.65,window.devicePixelRatio||1,2160/w);
      paper.width=moving.width=Math.round(w*ratio);paper.height=moving.height=Math.round(h*ratio);
      plates.clear();surface?.clear();showStill(current);if(turn)drawTurn(turn.p);
    }
    function initialize(){
      if(initialized || stopped)return;
      initialized=true;
      try{surface=makeFoldSurface(moving);}catch{surface=null;}
      area.dataset.surface=surface?'paper':'canvas';
      resize();
      events.forEach((item,index)=>{
        const photo=new Image();photos[index]=photo;photo.decoding='async';
        photo.onload=()=>{if(!stopped && current===index&&!turn)showStill(current);};
        photo.src=item.art || '/assets/company/'+item.photo;
      });
    }
    function down(e){
      if(!e.isPrimary || e.button!==0 || pointer)return;
      if(turn)settle(turn.p>.5?turn.to:turn.from);
      pointer={id:e.pointerId,x:e.clientX,y:e.clientY,axis:null};
    }
    function move(e){
      if(pointer?.id!==e.pointerId)return;
      const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
      if(!pointer.axis && Math.max(Math.abs(dx),Math.abs(dy))>7){
        if(Math.abs(dy)>Math.abs(dx)){pointer=null;return;}
        pointer.axis='x';area.setPointerCapture(e.pointerId);area.dataset.dragging='true';
      }
      if(pointer.axis!=='x')return;
      const target=current+(dx<0?1:-1);
      if(target<0 || target>=events.length){turn=null;showStill(current);return;}
      if(!turn || turn.to!==target)turn={from:current,to:target,p:0};
      drawTurn(Math.abs(dx)/Math.max(180,width*.52));
    }
    function release(e) {
      if(pointer?.id!==e.pointerId)return;
      if(area.hasPointerCapture(e.pointerId))area.releasePointerCapture(e.pointerId);
      pointer=null;area.dataset.dragging='false';
      if(turn)animate(e.type!=='pointercancel'&&turn.p>=.14?1:0);
    }
    const leave=e=>{if(pointer?.id===e.pointerId&&!pointer.axis)pointer=null;};
    function pause(){if(document.hidden&&turn)settle(wanted);}
    function contextLost(e){e.preventDefault();surface=null;area.dataset.surface='canvas';settle(wanted);}
    function contextRestored(){try{surface=makeFoldSurface(moving);}catch{surface=null;}area.dataset.surface=surface?'paper':'canvas';showStill(current);}
    function pref(){if(motion.matches && turn)settle(wanted);}
    commands.current={choose, selected:()=>wanted};
    const intersect=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting)initialize();else if(turn){pointer=null;area.dataset.dragging='false';settle(wanted);}
    },{rootMargin:'250px 0px'});intersect.observe(area);
    const resizing=new ResizeObserver(resize);resizing.observe(area);
    const actions={pointerdown:down,pointermove:move,pointerup:release,pointercancel:release,pointerleave:leave};
    Object.entries(actions).forEach(([name,handler])=>area.addEventListener(name,handler));
    moving.addEventListener('webglcontextlost',contextLost);moving.addEventListener('webglcontextrestored',contextRestored);
    document.addEventListener('visibilitychange',pause);motion.addEventListener('change',pref);
    return()=>{
      stopped=true;intersect.disconnect();resizing.disconnect();cancelAnimationFrame(frame);surface?.dispose();plates.clear();
      Object.entries(actions).forEach(([name,handler])=>area.removeEventListener(name,handler));
      moving.removeEventListener('webglcontextlost',contextLost);moving.removeEventListener('webglcontextrestored',contextRestored);
      document.removeEventListener('visibilitychange',pause);motion.removeEventListener('change',pref);commands.current=null;
    };
  },[events,lang,onChange]);

  function change(index){if(commands.current)commands.current.choose(index);else onChange(index);}
  function key(e,index,focus) {
    const last=events.length-1;
    const next={ArrowRight:Math.min(last,index+1),ArrowLeft:Math.max(0,index-1),Home:0,End:last}[e.key];
    if(next===undefined)return;e.preventDefault();
    change(next);if(focus)tabs.current.children[next].focus({preventScroll:true});
  }
  const item=events[active];
  return <>
    <div className="archive-stage" ref={stage} tabIndex={0} role="group" aria-label={zh?'企业历程影像，左右拖动或按方向键翻阅':'Company archive. Drag horizontally or use the arrow keys to turn the page.'}
        onKeyDown={e=>key(e,commands.current?.selected() ?? active,false)}>
      <div className="archive-preview" aria-hidden="true">
        <img src={item.art || '/assets/company/'+item.photo} alt="" loading="lazy" style={{objectPosition:item.position}}/>
        <b>{year(item)}</b><span>{item.title[l]}</span>
      </div>
      <canvas className="archive-still" ref={still} aria-hidden="true"/>
      <canvas className="archive-fold" ref={fold} aria-hidden="true"/>
      <span className="archive-corner" aria-hidden="true"/>
    </div>
    <div className="archive-controls">
      <div ref={tabs} role="tablist" className="archive-years" aria-label={zh?'选择历程节点':'Choose a milestone'} style={{'--selected-year':active}}>
        {events.map((event,i)=><button key={event.year||'today'} type="button" role="tab" id={tabId+i} aria-controls={panelId}
            tabIndex={active===i?0:-1} aria-selected={active===i} aria-label={year(event)+' · '+event.tab[l]}
            onClick={()=>change(i)} onKeyDown={e=>key(e,i,true)}>
          <span>{year(event)}</span><small>{event.tab[l]}</small>
        </button>)}
      </div>
      <span className="archive-gesture" aria-hidden="true"><Hand size={17} strokeWidth={1.5}/>{zh?'拖动画面翻阅':'Drag to turn the page'}</span>
    </div>
  </>;
}
