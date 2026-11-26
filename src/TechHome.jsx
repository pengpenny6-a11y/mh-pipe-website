import {routeHref} from './site-routes.js';
import React,{useState,useRef,useLayoutEffect} from 'react';
import {products} from './content.js';
import './product-motion.css';
const txt=(lang,en,zh)=>lang==='zh'?zh:en;
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

export function HeroTech({lang,go,onProduct}){
 const root=useRef();const pointer=useRef(null);
 useLayoutEffect(()=>{
  const g=window.gsap;if(!g)return;let observer;let resume;let media;
  const ctx=g.context(()=>{
   media=g.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{
    const q=g.utils.selector(root),floating=[];
    const intro=g.timeline({defaults:{ease:'power3.out'}});
    intro.from(q('.hero-title-line span'),{yPercent:110,duration:.95,stagger:.1})
     .from(q('.hero-wordmark span'),{yPercent:110,duration:1.15},.12)
     .from(q('.hero-product'),{y:80,rotation:-7,opacity:0,duration:1.25,stagger:.12},.3)
     .from(q('.hero-bottom'),{y:20,opacity:0,duration:.8},.65);
    g.timeline({scrollTrigger:{trigger:root.current,start:'top top',end:'bottom top',scrub:1.15}})
     .to(q('.hero-wordmark'),{yPercent:10,ease:'none'},0)
     .to(q('.hero-primary'),{y:-45,x:12,rotation:2,scale:1.025,ease:'none'},0)
     .to(q('.hero-secondary'),{y:-28,rotation:-2,ease:'none'},0)
     .to(q('.hero-pipe'),{x:40,y:8,ease:'none'},0);
    q('.hero-float').forEach((el,i)=>floating.push(g.to(el,{y:i===1?11:-14,rotation:i===1?-.7:.65,duration:3.6+i*.5,delay:.9+i*.35,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true})));
    let visible=false,focused=true;
    resume=()=>{const play=visible&&focused&&!document.hidden&&document.documentElement.dataset.dialogOpen!=='true';floating.forEach(t=>play?t.resume():t.pause());root.current?.setAttribute('data-hero-floating',String(play))};
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume?.()},{threshold:.06});observer.observe(root.current);
    const blur=()=>{focused=false;resume?.()},focus=()=>{focused=true;resume?.()};
    window.addEventListener('blur',blur);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',resume);window.addEventListener('mh-dialog-change',resume);
    pointer.current=q('.product-hover').map((target,i)=>({factor:[.024,-.012,.016][i],x:g.quickTo(target,'x',{duration:.95,ease:'power3.out'}),y:g.quickTo(target,'y',{duration:.95,ease:'power3.out'})}));
    return()=>{observer?.disconnect();window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',resume);window.removeEventListener('mh-dialog-change',resume);pointer.current=null;root.current?.setAttribute('data-hero-floating','false')};
   });
  },root);
  return()=>{pointer.current=null;observer?.disconnect();media?.revert();ctx.revert()};
 },[]);
 function move(e){if(!pointer.current||e.pointerType==='touch')return;const b=root.current.getBoundingClientRect();pointer.current.forEach(p=>{p.x((e.clientX-b.left-b.width/2)*p.factor);p.y((e.clientY-b.top-b.height/2)*p.factor)})}
 return <section className="hero" ref={root} onPointerMove={move} onPointerLeave={()=>pointer.current?.forEach(p=>{p.x(0);p.y(0)})}>
  <h1 className="hero-title"><span className="hero-title-line"><span>{txt(lang,'Stainless steel','不锈钢管道')}</span></span><span className="hero-title-line"><span>{txt(lang,'piping systems.','系统解决方案。')}</span></span></h1>
  <div className="hero-wordmark" aria-hidden="true"><span>MH PIPE</span></div>
  {['tee','coupling','pipe'].map((id,i)=>{const p=products.find(x=>x.id===id);return <button key={id} className={'hero-product '+['hero-primary','hero-secondary','hero-pipe'][i]} onClick={()=>onProduct(p)} aria-label={txt(lang,'Explore ','查看')+p.name[lang]}><span className="product-hover"><span className="hero-float"><img src={p.image} alt={p.name[lang]} fetchPriority={i===0?'high':'auto'} draggable="false"/></span></span><span className="product-caption">{p.name[lang]}<span>+</span></span></button>})}
  <div className="hero-bottom"><a className="button primary" href={routeHref('/products',lang)} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go('/products')}}}>{txt(lang,'Explore products','探索产品')}</a></div>
 </section>
}

export function ProductStage({lang,onProduct,onInquiry,go,full=false,expanded=false}){
 const [active,setActive]=useState('coupling');const root=useRef(),plane=useRef(),typeShift=useRef(),gesture=useRef(),drag=useRef(null),activeRef=useRef('coupling'),controller=useRef(null);
 const p=products.find(p=>p.id===active);const order=['pipe','coupling','elbow','tee'];
 const labels={pipe:txt(lang,'Pipes','管材'),coupling:txt(lang,'Couplings','直通'),elbow:txt(lang,'Elbows','弯头'),tee:txt(lang,'Tees','三通')};const Heading=full?'h1':'h2';
 useLayoutEffect(()=>{
  const g=window.gsap;if(!g)return;
  const ctx=g.context(self=>{
   const layers=[...root.current.querySelectorAll('.ps-product-layer')];
   const dragX=g.quickSetter(plane.current,'x','px'),typeX=g.quickSetter(typeShift.current,'x','px');
   const resetPlane=()=>g.to([plane.current,typeShift.current],{x:0,rotation:0,duration:reduce()?0:.75,ease:'power3.out',overwrite:true});
   g.set(layers,{autoAlpha:i=>order[i]===activeRef.current?1:0,x:0,scale:1});
   let timeline;
   self.add('select',(next,direction)=>{
    const incoming=layers[order.indexOf(next)];const candidates=layers.filter(el=>el!==incoming);const outgoing=candidates.sort((a,b)=>Number(g.getProperty(b,'opacity'))-Number(g.getProperty(a,'opacity')))[0];
    timeline?.kill();g.killTweensOf(layers);resetPlane();
    if(reduce()){g.set(layers,{autoAlpha:i=>order[i]===next?1:0,x:0,scale:1});return;}
    layers.forEach(el=>{if(el!==outgoing&&el!==incoming)g.set(el,{autoAlpha:0})});
    const distance=Math.min(gesture.current.clientWidth*.32,280);
    g.set(outgoing,{autoAlpha:1,zIndex:1});g.set(incoming,{autoAlpha:0,x:direction*distance,scale:.97,zIndex:2});
    timeline=g.timeline({defaults:{ease:'power3.inOut',overwrite:'auto'}})
     .to(outgoing,{x:-direction*distance*.7,scale:.97,autoAlpha:0,duration:.78},0)
     .to(incoming,{x:0,scale:1,autoAlpha:1,duration:.95},.04);
   });
   self.add('reset',resetPlane);
   self.add('drag',dx=>{g.killTweensOf([plane.current,typeShift.current]);dragX(Math.max(-210,Math.min(210,dx*.58)));typeX(-dx*.1)});
   controller.current=self;
   if(!reduce()){
    g.fromTo('.ps-type',{xPercent:2},{xPercent:-7,ease:'none',scrollTrigger:{trigger:root.current,start:'top bottom',end:'bottom top',scrub:1.25}});
    g.fromTo('.ps-object-shell',{y:20},{y:-15,ease:'none',scrollTrigger:{trigger:root.current,start:'top bottom',end:'bottom top',scrub:1.2}});
   }
  },root);
  return()=>{controller.current=null;drag.current=null;ctx.revert()};
 },[]);
 const select=(id,direction)=>{if(id===activeRef.current){controller.current?.reset();return;}const d=direction|| (order.indexOf(id)>order.indexOf(activeRef.current)?1:-1);activeRef.current=id;setActive(id);controller.current?.select(id,d)};
 const step=direction=>select(order[(order.indexOf(activeRef.current)+direction+order.length)%order.length],direction);
 function pointerDown(e){if(e.button!==0||e.isPrimary===false)return;drag.current={pointer:e.pointerId,x:e.clientX,y:e.clientY,dx:0,intent:false};e.currentTarget.setAttribute('data-pointer-focus','true');e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.focus({preventScroll:true});}
 function pointerMove(e){const d=drag.current;if(!d||d.pointer!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.intent&&Math.abs(dx)>9&&Math.abs(dx)>Math.abs(dy)*1.15)d.intent=true;if(!d.intent)return;if(e.cancelable)e.preventDefault();d.dx=dx;e.currentTarget.setAttribute('data-dragging','true');controller.current?.drag(dx);}
 function pointerEnd(e,cancelled=false){const d=drag.current;if(!d||d.pointer!==e.pointerId)return;drag.current=null;e.currentTarget.removeAttribute('data-dragging');if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(!cancelled&&d.intent&&Math.abs(d.dx)>65)step(d.dx<0?1:-1);else controller.current?.reset();}
 function keyboard(e){e.currentTarget.removeAttribute('data-pointer-focus');if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();select(order[e.key==='Home'?0:3])}else if(e.key==='Enter'){e.preventDefault();onProduct(products.find(x=>x.id===activeRef.current))}}
 return <section className={'ps-root'+(full?' ps-full':'')} ref={root}>
  <div className="ps-heading"><Heading>{txt(lang,'Pipes & fittings','管材与管件')}</Heading><p className="section-summary">{txt(lang,'Browse product forms, then review drawings, connection types and the requirements for your application.','浏览管材与管件形式，结合应用场景核对尺寸、连接方式与产品图纸。')}</p></div>
  <div className="ps-studio"><div className="ps-type" aria-hidden="true"><span ref={typeShift}>{active==='pipe'?'PIPE':'CONNECT'}</span></div><div className="ps-object-shell"><div className="ps-gesture" ref={gesture} role="group" aria-roledescription={txt(lang,'Product carousel','产品轮播')} tabIndex={0} aria-label={txt(lang,'Drag or use left and right arrow keys to switch products. Enter opens product details.','拖动或使用左右方向键切换产品，回车查看详情。')} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={e=>pointerEnd(e,true)} onLostPointerCapture={e=>{if(drag.current)pointerEnd(e,true)}} onKeyDown={keyboard} onBlur={e=>e.currentTarget.removeAttribute('data-pointer-focus')}>
   <div className="ps-drag-plane" ref={plane}>{order.map(id=>{const item=products.find(x=>x.id===id);return <div key={id} className={'ps-product-layer'+(id===active?' ps-object':'')} data-product={id} aria-hidden={id!==active}><img className={id===active?'ps-current-image':undefined} src={item.image} alt={id===active?item.name[lang]:''} draggable="false"/></div>})}</div><span className="ps-drag-hint" aria-hidden="true">{txt(lang,'Drag to explore','拖动切换')}</span></div></div><div className="ps-product-name"><button className="ps-details" onClick={()=>onProduct(p)}>{p.name[lang]}<span>+</span></button></div></div>
  <div className="ps-controls" role="group" aria-label={txt(lang,'Product forms','产品类型')}>{order.map(id=><button key={id} aria-pressed={active===id} onClick={()=>select(id)}><span>{labels[id]}</span><span>{active===id?'−':'+'}</span></button>)}</div>
  {!full&&<div className="ps-bottom"><a href={routeHref('/products',lang)} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go('/products')}}}>{txt(lang,'All products','全部产品')} +</a></div>}
  {full&&!expanded&&<div className="ps-bottom"><button onClick={()=>onInquiry({interest:txt(lang,'Please share the ring-press product range and drawings.','请提供环压产品目录与图纸。')})}>{txt(lang,'Request ring-press range','索取环压产品目录')} +</button></div>}
  {full&&!expanded&&<div className="catalogue">{products.map(p=><button className="catalogue-item" key={p.id} onClick={()=>onProduct(p)}><img src={p.image} alt={p.name[lang]} loading="lazy"/><div><h2>{p.name[lang]}</h2><span>+</span></div><p>{p.description[lang]}</p></button>)}</div>}
 </section>
}

export function ContactTech({lang,items,onOpen,go,full=false,expanded=false}){
 const root=useRef();const Heading=full?'h1':'h2';
 useLayoutEffect(()=>{if(!window.gsap||reduce())return;const ctx=window.gsap.context(()=>{window.gsap.fromTo('.ct-pipe',{x:110,rotation:-5},{x:-30,rotation:5,ease:'none',scrollTrigger:{trigger:root.current,start:'top bottom',end:'bottom top',scrub:.7}})},root);return()=>ctx.revert()},[]);
 return <section className={'ct-root'+(full?' ct-full':'')} ref={root}>
  <div className="ct-word"><Heading>{txt(lang,<>Build the next<br/>connection.</>,<>下一次连接，<br/>从这里开始。</>)}</Heading><p>{txt(lang,'For distributors, importers and project partners.','面向经销商、进口商与工程合作伙伴。')}</p></div>
  <img className="ct-pipe" src="/assets/products/pipe.png" alt="" aria-hidden="true"/>
  <div className="ct-actions"><button onClick={()=>onOpen()}>{txt(lang,'Discuss your requirements','沟通您的需求')}<span>+</span></button><a href={routeHref('/products',lang)} onClick={e=>{if(!e.metaKey&&!e.ctrlKey){e.preventDefault();go('/products')}}}>{txt(lang,'Build your product list','整理产品清单')}<span>+</span></a></div>
 </section>
}
