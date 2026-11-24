import React, {useEffect, useRef} from 'react';
import {MoveHorizontal, Move, Maximize2, Scan, ArrowUpRight} from 'lucide-react';
import './interaction-cursor.css';

const COPY = {
  zh: {rotate:'拖动旋转', drag:'左右拖动', pan:'拖动视角', inspect:'查看连接', zoom:'放大查看', open:'打开'},
  en: {rotate:'Drag to rotate', drag:'Drag sideways', pan:'Drag to move', inspect:'Inspect connection', zoom:'Enlarge image', open:'Open'},
};
const FORM = 'input,textarea,select,option,[contenteditable="true"],[role="textbox"],[role="slider"]';
const CHROME = '.site-header,nav,[role="menu"],.modal-backdrop,[inert],[data-cursor="none"]';
const PHOTO = '.pm-facility,.pm-shot,.qc-photo,.mf-photo-button,.ms-facility-frame';
const CONTROL = 'button,a,[role="button"],[role="tab"],summary';
const CONTEXT = new Set(['rotate','drag','pan','view','open']);

/** Object-specific pointer aid. The exact pointer center never trails the hand. */
export default function InteractionCursor({lang='en', disabled=false}) {
  const root=useRef(null),label=useRef(null),api=useRef(null);
  const options=useRef({lang,disabled});options.current={lang,disabled};
  useEffect(()=>{api.current?.refresh();},[lang,disabled]);
  useEffect(()=>{
    const el=root.current,fine=matchMedia('(hover: hover) and (pointer: fine)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
    const seen=new WeakMap();
    let frame=0,refreshFrame=0,hintTimer=0,hintEnd=0,settleTimer=0,lastFrame=0;
    let visible=false,known=false,keyboard=false,focused=true,activeTarget=null,watchedTarget=null,lock=null,mode='idle',kind='idle';
    let clientX=0,clientY=0,angle=0,angleTarget=0,drift=0,driftTarget=0;
    const blocked=()=>{
      const data=document.documentElement.dataset;
      const menu=data.navOpen&&!['false','none','closed'].includes(data.navOpen);
      return options.current.disabled||!fine.matches||motion.matches||!focused||document.hidden||data.booting==='true'||data.dialogOpen==='true'||data.pageLoading==='true'||menu;
    };
    const cancelHint=()=>{clearTimeout(hintTimer);clearTimeout(hintEnd);el.dataset.hint='false';};
    const removeOverride=()=>{activeTarget?.removeAttribute('data-mh-cursor-active');activeTarget=null;};
    const conceal=()=>{
      visible=false;lock=null;el.dataset.visible='false';el.dataset.pressed='false';
      cancelHint();removeOverride();cancelAnimationFrame(frame);clearTimeout(settleTimer);frame=0;lastFrame=0;
    };
    const draw=()=>{
      el.style.transform=`translate3d(${clientX.toFixed(2)}px,${clientY.toFixed(2)}px,0)`;
      el.style.setProperty('--mh-cursor-angle',angle.toFixed(2)+'deg');
      el.style.setProperty('--mh-cursor-drift',drift.toFixed(2)+'px');
    };
    const tick=now=>{
      frame=0;if(!visible||blocked()){conceal();return;}
      const dt=Math.min(40,now-(lastFrame||now-16));lastFrame=now;
      const ease=1-Math.exp(-dt/65);angle+=(angleTarget-angle)*ease;drift+=(driftTarget-drift)*ease;draw();
      if(Math.abs(angleTarget-angle)>.1||Math.abs(driftTarget-drift)>.05)frame=requestAnimationFrame(tick);else lastFrame=0;
    };
    const wake=()=>{if(!frame&&visible)frame=requestAnimationFrame(tick);};
    const identify=target=>{
      if(!(target instanceof Element)||target.closest(FORM+','+CHROME))return null;
      const control=target.closest(CONTROL);
      if(control?.matches(':disabled,[aria-disabled="true"]'))return null;
      const override=target.closest('[data-cursor]');
      if(override&&CONTEXT.has(override.dataset.cursor)){
        const value=override.dataset.cursor;
        return {mode:value,kind:value==='view'?(override.closest('.spa-viewport')?'inspect':'zoom'):value,target:override};
      }
      const photo=target.closest(PHOTO);
      if(photo)return {mode:'view',kind:'zoom',target:photo};
      // The product object and its surrounding stage share a horizontal gesture;
      // ordinary page links and buttons still keep their native pointer.
      const carousel=target.closest('.hpch-stage,.ps-gesture');
      if(carousel&&(!control||control.matches('.hpch-product')))return {mode:'drag',kind:'drag',target:carousel};
      if(control)return null;
      const product=target.closest('.precision-product[data-state="ready"]');
      if(product)return product.dataset.hit==='true'||product.dataset.dragging==='true'?{mode:'rotate',kind:'rotate',target:product}:null;
      const camera=target.closest('.spa-viewport,.pa-viewport,.ap-root.ap-focused .ap-viewport');
      if(camera)return {mode:'pan',kind:'pan',target:camera};
      return null;
    };
    const scheduleRefresh=()=>{if(known&&!refreshFrame)refreshFrame=requestAnimationFrame(()=>{refreshFrame=0;refresh();});};
    const hitObserver=new MutationObserver(scheduleRefresh);
    const watch=target=>{
      const next=target instanceof Element?(target.closest('.precision-product')||target.closest('[data-cursor]')):null;
      if(next===watchedTarget)return;
      hitObserver.disconnect();watchedTarget=next;
      if(next)hitObserver.observe(next,{attributes:true,attributeFilter:['data-cursor','data-hit','data-state','data-dragging']});
    };
    const offerHint=(target,hintKind)=>{
      cancelHint();if(seen.get(target)?.has(hintKind))return;
      hintTimer=setTimeout(()=>{
        if(!visible||activeTarget!==target||kind!==hintKind||lock||blocked())return;
        let modes=seen.get(target);if(!modes){modes=new Set();seen.set(target,modes);}modes.add(hintKind);
        el.dataset.hint='true';hintEnd=setTimeout(()=>{el.dataset.hint='false';},1800);
      },460);
    };
    function refresh(target){
      if(!known||keyboard||blocked()){watch(null);conceal();return;}
      const current=target||document.elementFromPoint(clientX,clientY);watch(current);
      const match=lock||identify(current);
      if(!match){conceal();return;}
      const changed=activeTarget!==match.target||kind!==match.kind;
      if(activeTarget!==match.target){removeOverride();if(match.target?.isConnected){activeTarget=match.target;activeTarget.dataset.mhCursorActive='true';}}
      mode=match.mode;kind=match.kind;el.dataset.mode=mode;el.dataset.kind=kind;
      label.current.textContent=(COPY[options.current.lang]||COPY.en)[kind]||'';
      el.dataset.tone=kind==='zoom'||match.target?.closest('.cinema-hero')?'light':'dark';
      el.dataset.flipped=String(clientX>innerWidth-175);el.dataset.visible='true';
      if(!visible){angle=angleTarget=drift=driftTarget=0;visible=true;}
      draw();if(changed)offerHint(match.target,kind);wake();
    }
    const move=event=>{
      if(event.pointerType!=='mouse'){known=false;watch(null);conceal();return;}
      const dx=known?event.clientX-clientX:0;
      clientX=event.clientX;clientY=event.clientY;
      if(clientX<0||clientY<0||clientX>innerWidth||clientY>innerHeight){watch(null);conceal();return;}
      keyboard=false;known=true;refresh(event.target);
      if(visible){
        angleTarget=Math.max(-24,Math.min(24,dx*1.6));driftTarget=Math.max(-2.5,Math.min(2.5,dx*.3));
        clearTimeout(settleTimer);settleTimer=setTimeout(()=>{angleTarget=driftTarget=0;wake();},110);draw();wake();
      }
    };
    const down=event=>{
      if(event.pointerType!=='mouse'||event.button!==0||!visible)return;
      const match=identify(event.target);
      if(match&&['rotate','drag','pan'].includes(match.mode))lock=match;
      cancelHint();el.dataset.pressed='true';wake();
    };
    const up=event=>{lock=null;el.dataset.pressed='false';if(event.pointerType==='mouse')refresh();};
    const key=event=>{if(event.key==='Tab'||event.key==='Escape'){keyboard=true;watch(null);conceal();}};
    const leave=event=>{if(!event.relatedTarget){known=false;watch(null);conceal();}};
    const blur=()=>{focused=false;known=false;watch(null);conceal();};
    const focus=()=>{focused=true;};
    const visibility=()=>{if(document.hidden){watch(null);conceal();}else refresh();};
    const queryChange=()=>{if(blocked()){watch(null);conceal();}else refresh();};
    const observer=new MutationObserver(()=>refresh());
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-booting','data-nav-open','data-dialog-open','data-page-loading','data-page-transition']});
    const listeners=[
      [document,'pointermove',move,{passive:true}],[document,'pointerover',move,{passive:true}],
      [document,'pointerdown',down,{passive:true}],[document,'pointerup',up,{passive:true}],
      [document,'pointercancel',up,{passive:true}],[document,'pointerout',leave,{passive:true}],
      [document,'keydown',key,true],[window,'blur',blur],[window,'focus',focus],
      [window,'scroll',scheduleRefresh,{passive:true}],[window,'resize',scheduleRefresh,{passive:true}],
      [document,'visibilitychange',visibility],[fine,'change',queryChange],[motion,'change',queryChange],
    ];
    listeners.forEach(([target,type,handler,option])=>target.addEventListener(type,handler,option));
    api.current={refresh:()=>refresh()};
    return()=>{
      api.current=null;conceal();cancelAnimationFrame(refreshFrame);observer.disconnect();hitObserver.disconnect();
      listeners.forEach(([target,type,handler,option])=>target.removeEventListener(type,handler,option));
    };
  },[]);

  return <div ref={root} className="mh-cursor" data-visible="false" data-mode="idle" data-kind="idle" data-pressed="false" data-hint="false" aria-hidden="true">
    <span className="mh-cursor-point"/>
    <span className="mh-cursor-mark mh-cursor-orbit"/>
    <Scan className="mh-cursor-mark mh-cursor-inspect" size={29} strokeWidth={1.3}/>
    <Maximize2 className="mh-cursor-mark mh-cursor-zoom" size={23} strokeWidth={1.35}/>
    <MoveHorizontal className="mh-cursor-mark mh-cursor-drag" size={29} strokeWidth={1.35}/>
    <Move className="mh-cursor-mark mh-cursor-pan" size={26} strokeWidth={1.25}/>
    <ArrowUpRight className="mh-cursor-mark mh-cursor-open" size={23} strokeWidth={1.35}/>
    <span ref={label} className="mh-cursor-label"/>
  </div>;
}
