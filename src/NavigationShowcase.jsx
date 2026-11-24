import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';

// Decode first, and discard stale requests before committing a new preview.
export default function NavigationShowcase({item,type,lang,reduced,href,onFollow}) {
  const [displayed,setDisplayed]=useState(item),[previous,setPrevious]=useState(null),[failed,setFailed]=useState(false);
  const live=useRef(item),request=useRef(0),expiry=useRef(),stage=useRef(null),depth=useRef(null),parallax=useRef(null),bounds=useRef(null);
  const key=`${type}-${item.id}`;
  useEffect(()=>{
    const ticket=++request.current;let active=true,timeout;
    const image=new Image();image.src=item.image;
    Promise.race([image.decode(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Preview timed out')),4000);})]).then(()=>{
      if(!active||ticket!==request.current)return;
      clearTimeout(timeout);clearTimeout(expiry.current);setFailed(false);setPrevious(reduced?null:live.current);live.current=item;setDisplayed(item);
      expiry.current=setTimeout(()=>setPrevious(null),520);
    }).catch(()=>{if(active&&ticket===request.current){setFailed(true);setPrevious(null);live.current=item;setDisplayed(item);}});
    return()=>{active=false;clearTimeout(timeout);clearTimeout(expiry.current);};
  },[key,reduced]);
  useLayoutEffect(()=>{
    const gsap=window.gsap;if(reduced||!gsap)return;
    const ctx=gsap.context(()=>{
      if(type==='products'&&!displayed.photograph){
        gsap.fromTo('.sn-preview-current',{opacity:0,x:28,y:4,z:-90,rotationY:9,rotationZ:1.2},{opacity:1,x:0,y:0,z:0,rotationY:0,rotationZ:0,duration:.58,ease:'power3.out',clearProps:'transform,opacity'});
      }else{
        gsap.fromTo('.sn-preview-current',{opacity:.2,x:12,scale:1.045},{opacity:1,x:0,scale:1,duration:.72,ease:'power2.out',clearProps:'transform,opacity'});
      }
      gsap.fromTo('.sn-preview-caption',{opacity:.4},{opacity:1,duration:.3,clearProps:'opacity'});
    },stage);return()=>ctx.revert();
  },[displayed,reduced,type]);
  useEffect(()=>{
    const gsap=window.gsap,el=depth.current;
    if(reduced||!gsap){gsap?.set(el,{x:0,y:0});parallax.current=null;return;}
    const x=gsap.quickTo(el,'x',{duration:.6,ease:'power3.out'}),y=gsap.quickTo(el,'y',{duration:.6,ease:'power3.out'});
    parallax.current={x,y};return()=>{x.tween.kill();y.tween.kill();gsap.set(el,{clearProps:'transform'});parallax.current=null;};
  },[reduced]);
  useEffect(()=>()=>clearTimeout(expiry.current),[]);
  function move(event){
    if(event.pointerType!=='mouse'||!parallax.current)return;
    const box=bounds.current;if(!box)return;
    parallax.current.x((event.clientX-box.left-box.width/2)*.012);
    parallax.current.y((event.clientY-box.top-box.height/2)*.012);
  }
  return <a className={`sn-showcase sn-showcase-${displayed.photograph?'manufacturing':type}`} ref={stage} href={href(displayed.path)}
    onClick={e=>onFollow(e,displayed)} onPointerEnter={()=>{bounds.current=stage.current.getBoundingClientRect();}} onPointerMove={move}
    onPointerLeave={()=>{parallax.current?.x(0);parallax.current?.y(0);bounds.current=null;}}
    aria-label={displayed.name[lang]} aria-busy={displayed.id!==item.id} data-preview={displayed.id}>
    <div className="sn-preview-viewport" aria-hidden="true"><div className="sn-preview-art" ref={depth}>
      {previous&&previous.id!==displayed.id&&<img className="sn-preview-previous" data-product={previous.id} key={previous.id} src={previous.image} alt="" draggable="false"/>}
      {!failed&&<img className="sn-preview-current" data-product={displayed.id} key={displayed.image} src={displayed.image} alt="" draggable="false"/>}
    </div></div>
    <div className="sn-preview-caption"><strong>{displayed.name[lang]}</strong><p>{failed?(lang==='zh'?'查看详情':'View details'):displayed.description[lang]}</p></div>
    <span className="sn-preview-explore" aria-hidden="true"><ArrowRight size={27} strokeWidth={1.5}/></span>
  </a>;
}
