import {routeHref} from './site-routes.js';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ChevronDown,ArrowUpRight,Minus,Menu,X} from 'lucide-react';
import {entries,catalogue} from './navigation-content.js';
import NavigationShowcase from './NavigationShowcase.jsx';
import './site-navigation.css';

const normalClick=e=>e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey;
export default function SiteNavigation({lang='en',route='/',go,onLanguage,onInquiry,itemCount=0}) {
  const zh=lang==='zh',text=(en,cn)=>zh?cn:en;
  const shell=useRef(null),panel=useRef(null),nav=useRef(null),list=useRef(null);
  const openTimer=useRef(),closeTimer=useRef(),exitTimer=useRef(),focusFrame=useRef(),pendingIntent=useRef(null);
  const restore=useRef(null),focusPanel=useRef(false),openRef=useRef(null),mobileRef=useRef(false);
  const [open,setOpen]=useState(null),[present,setPresent]=useState(null),[choice,setChoice]=useState(catalogue.products[0].id);
  const [mobile,setMobile]=useState(false),[scrolled,setScrolled]=useState(false);
  const [hoverPath,setHoverPath]=useState(null);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);

  const shown=present||'products',items=catalogue[shown],chosen=items.find(i=>i.id===choice)||items[0];
  const entry=entries.find(e=>e[3]===shown);
  const allPath=shown==='products'?'/products#product-selection':entry[0];
  const href=path=>routeHref(path,lang);
  function cancelIntent(){clearTimeout(openTimer.current);clearTimeout(closeTimer.current);pendingIntent.current=null;}
  function close(returnFocus=false){cancelIntent();openRef.current=null;mobileRef.current=false;setOpen(null);setMobile(false);if(returnFocus)restore.current?.focus({preventScroll:true});}
  function show(type,trigger,keyboard=false){
    cancelIntent();clearTimeout(exitTimer.current);
    restore.current=trigger?.matches('a,button')?trigger:trigger?.querySelector('.sn-disclosure');focusPanel.current=keyboard;
    if(openRef.current!==type)setChoice(catalogue[type][0].id);
    openRef.current=type;mobileRef.current=false;setPresent(type);setOpen(type);setMobile(false);
    if(keyboard&&open===type){cancelAnimationFrame(focusFrame.current);focusFrame.current=requestAnimationFrame(()=>panel.current?.querySelector('.sn-mega-list>a')?.focus({preventScroll:true}));}
  }
  function intend(type,event){
    if(event.pointerType!=='mouse'||openRef.current===type||pendingIntent.current===type)return;
    cancelIntent();pendingIntent.current=type;
    const trigger=event.currentTarget.querySelector('.sn-disclosure');
    openTimer.current=setTimeout(()=>show(type,trigger),160);
  }
  function leave(){
    cancelIntent();setHoverPath(null);
    closeTimer.current=setTimeout(()=>{if(!panel.current?.contains(document.activeElement))close();},180);
  }
  function enter(){clearTimeout(closeTimer.current);}
  function follow(event,path){if(!normalClick(event))return;event.preventDefault();close();go(path);}
  function followItem(event,item){
    follow(event,item.path);
  }
  function keyOpen(event,type){if(event.key==='ArrowDown'){event.preventDefault();show(type,event.currentTarget,true);}}
  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)'),size=matchMedia('(min-width: 1081px)');
    const media=()=>{setReduced(motion.matches);close();};
    const scroll=()=>{clearTimeout(openTimer.current);pendingIntent.current=null;setScrolled(previous=>window.scrollY>(previous?75:170));};
    const outside=event=>{if(!shell.current?.contains(event.target)){close();}};
    const key=event=>{if(event.key==='Escape'&&(openRef.current||mobileRef.current)){event.preventDefault();close(true);}};
    const dialog=()=>{if(document.documentElement.dataset.dialogOpen==='true')close();};
    scroll();motion.addEventListener('change',media);size.addEventListener('change',media);window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);window.addEventListener('mh-dialog-change',dialog);
    return()=>{cancelIntent();clearTimeout(exitTimer.current);cancelAnimationFrame(focusFrame.current);motion.removeEventListener('change',media);size.removeEventListener('change',media);window.removeEventListener('scroll',scroll);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);window.removeEventListener('mh-dialog-change',dialog);};
  },[]);
  useEffect(()=>{close();setHoverPath(null);},[route,lang]);
  useEffect(()=>{
    const active=Boolean(open||mobile);document.documentElement.dataset.navOpen=String(active);window.dispatchEvent(new CustomEvent('mh-navigation-change',{detail:{open:active}}));
    return()=>{delete document.documentElement.dataset.navOpen;};
  },[open,mobile]);
  useEffect(()=>{clearTimeout(exitTimer.current);if(!open)exitTimer.current=setTimeout(()=>setPresent(null),reduced?0:300);return()=>clearTimeout(exitTimer.current);},[open,reduced]);
  useLayoutEffect(()=>{
    if(!open||!focusPanel.current)return;focusPanel.current=false;focusFrame.current=requestAnimationFrame(()=>panel.current?.querySelector('.sn-mega-list>a')?.focus({preventScroll:true}));return()=>cancelAnimationFrame(focusFrame.current);
  },[open]);
  useLayoutEffect(()=>{
    const el=nav.current;if(!el)return;
    const update=()=>{const path=hoverPath||entries.find(e=>e[3]===open)?.[0]||route;const target=[...el.querySelectorAll('.sn-nav-item')].find(i=>i.dataset.path===path);if(target){el.style.setProperty('--sn-marker-x',`${target.offsetLeft}px`);el.style.setProperty('--sn-marker-w',`${target.offsetWidth}px`);}};
    update();const resize=new ResizeObserver(update);resize.observe(el);document.fonts.ready.then(update);return()=>resize.disconnect();
  },[route,open,hoverPath,lang]);
  useLayoutEffect(()=>{
    const el=list.current;if(!el)return;const update=()=>{const a=el.querySelector('.sn-selected');if(a){el.style.setProperty('--sn-row-y',`${a.offsetTop}px`);el.style.setProperty('--sn-row-h',`${a.offsetHeight}px`);}};
    update();const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect();
  },[choice,present,lang]);
  useLayoutEffect(()=>{
    if(!open||reduced||!window.gsap)return;
    const ctx=window.gsap.context(()=>window.gsap.fromTo('.sn-mega-heading,.sn-mega-list>a,.sn-all-link',{y:8,opacity:0},{y:0,opacity:1,duration:.3,stagger:.025,ease:'power2.out'}),panel);return()=>ctx.revert();
  },[open,reduced]);
  return <div className="sn-shell" ref={shell} data-nav-open={open||''} data-nav-home={route==='/'} data-compact={scrolled}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))close();}}>
    <div className="sn-spacer" aria-hidden="true"/>
    <div className="sn-backdrop" data-open={Boolean(open||mobile)} onPointerDown={()=>{close();}} aria-hidden="true"/>
    <header className={`site-header sn-header${open?' sn-open':''}`} onPointerEnter={enter} onPointerLeave={leave}>
      <div className="sn-inner">
        <a className={`brand sn-brand${zh?' sn-brand--zh':''}`} href={href('/')} onClick={e=>follow(e,'/')} aria-label={text('MH PIPE home','四川岷河 MH PIPE 首页')}><span className="sn-brand-text">MH PIPE</span>{zh&&<span className="sn-brand-cn" lang="zh-CN">四川岷河</span>}</a>
        <nav className="sn-main-nav" ref={nav} aria-label={text('Main navigation','主导航')}>
          <span className="sn-nav-marker" aria-hidden="true"/>
          {entries.map(([path,en,cn,type])=><div key={path} className="sn-nav-item" data-path={path} data-menu={type} data-expanded={Boolean(type&&open===type)} onPointerEnter={()=>{setHoverPath(path);if(!type)close();}} onPointerMove={event=>type&&intend(type,event)} onPointerLeave={()=>{clearTimeout(openTimer.current);pendingIntent.current=null;}}>
            <a href={href(path)} className={route===path?'current':''} aria-current={route===path?'page':undefined} onClick={e=>follow(e,path)} onFocus={()=>{cancelIntent();setHoverPath(path);if(openRef.current&&openRef.current!==type)close();}} onKeyDown={e=>type&&keyOpen(e,type)}><span className="sn-link-label">{text(en,cn)}</span></a>
            {type&&<button className="sn-disclosure" aria-expanded={open===type} aria-controls="sn-explore-menu" aria-label={text(`Explore ${en.toLowerCase()}`,`浏览${cn}`)} onClick={e=>open===type?close():show(type,e.currentTarget,true)} onKeyDown={e=>keyOpen(e,type)}><ChevronDown size={12} strokeWidth={1.6} aria-hidden="true"/></button>}
          </div>)}
        </nav>
        <div className="header-actions sn-actions">
          <button className="language-switch" onClick={()=>{close();onLanguage();}} aria-label={text('Switch to Chinese','切换至英文')}>{zh?'EN':'中文'}</button>
          <button className="inquiry-count" onClick={()=>{close();onInquiry();}} aria-label={text('Your inquiry','询盘清单')}><span className="sn-inquiry-label">{text('Inquiry','商务咨询')}</span><span className="sn-inquiry-number" hidden={!itemCount}>{itemCount}</span></button>
          <button className="sn-mobile-toggle" aria-expanded={mobile} aria-controls="sn-mobile-menu" aria-label={text('Navigation menu','导航菜单')} onClick={e=>{cancelIntent();setOpen(null);openRef.current=null;restore.current=e.currentTarget;mobileRef.current=!mobile;setMobile(!mobile);}}>{mobile?<X size={22}/>:<Menu size={22}/>}</button>
        </div>
      </div>
      {present&&<div id="sn-explore-menu" ref={panel} className={`sn-mega sn-mega-${shown}`} data-open={Boolean(open)} aria-hidden={!open} inert={!open} onPointerEnter={enter}>
        <div className="sn-mega-copy"><h2 className="sn-mega-heading">{text(entry[1],entry[2])}</h2>
          <div className="sn-mega-list" ref={list} aria-label={text(entry[1],entry[2])}><span className="sn-row-marker" aria-hidden="true"/>
            {items.map(item=><a key={item.id} href={href(item.path)} className={choice===item.id?'sn-selected':''} onPointerEnter={()=>setChoice(item.id)} onFocus={()=>setChoice(item.id)} onClick={e=>followItem(e,item)}><span>{item.name[lang]}</span><ArrowUpRight className="sn-row-arrow" size={21} strokeWidth={1.4} aria-hidden="true"/></a>)}
          </div>
          <a className="sn-all-link" href={href(allPath)} onClick={e=>follow(e,allPath)}><Minus size={25}/>{shown==='products'?text('Browse catalogue','浏览产品目录'):text(`Explore ${entry[1].toLowerCase()}`,shown==='applications'?'全部解决方案':`了解${entry[2]}`)}</a>
        </div>
        <NavigationShowcase key={shown} item={chosen} type={shown} lang={lang} reduced={reduced} href={href} onFollow={followItem}/>
        <button className="sn-menu-close" onClick={()=>close(true)} aria-label={text('Close menu','关闭菜单')}><X size={25} strokeWidth={1.5}/></button>
      </div>}
      <div className="sn-mobile-menu" id="sn-mobile-menu" hidden={!mobile}>
        {entries.map(([path,en,cn])=><a key={path} href={href(path)} onClick={e=>follow(e,path)} aria-current={route===path?'page':undefined}>{text(en,cn)}<ArrowUpRight size={20}/></a>)}<button onClick={()=>{close();onInquiry();}}>{text('Business inquiry','商务咨询')}</button>
      </div>
    </header>
  </div>;
}
