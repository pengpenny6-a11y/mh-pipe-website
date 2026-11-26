import {routeHref} from './site-routes.js';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {companyProfileParagraphs} from './CompanyProfile.jsx';
import {facilityRendering, facilityStandards} from './company-facility.js';
import './about-film.css';

const scenes = [
  {id:'intro', tab:['公司简介','Profile'], title:['关于我们','About MH PIPE'],
    photo:'eddy-current.webp', alt:['岷河技术人员在生产线上操作涡流探伤设备','An MH PIPE technician operating the eddy-current inspection station']},
  {id:'campus', tab:['厂区概览','Our campus'], title:['岷河厂区','Our campus'],
    photo:facilityRendering.file, alt:[facilityRendering.alt.zh, facilityRendering.alt.en]},
  {id:'standards', tab:['认证标准','Certifications'], title:['认证标准','Certifications'],
    photo:'lab-metallography.webp', alt:['实验室工作人员在显微镜和显示屏前进行金相分析','A technician performing metallographic analysis in the laboratory']}
];
const figures = [
  [2000,'创立年份','Year founded'],
  [18,'画册列示的检测项目','Tests in our brochure'],
  [20,'画册收录的合作企业','Partners in our brochure']
];
const imageRoot = '/assets/company/';

function ArchiveFigures({lang}) {
  const host = useRef(null);
  useLayoutEffect(() => {
    const media = window.gsap?.matchMedia();
    media?.add('(prefers-reduced-motion: no-preference)', () => {
      const fields = host.current.querySelectorAll('[data-count]');
      fields.forEach(el => {
        const value = {n:1};
        window.gsap.to(value,{n:Number(el.dataset.count),duration:.8,ease:'power2.out',
          onUpdate:()=>{el.textContent=String(Math.round(value.n));}});
      });
      return () => fields.forEach(el=>{el.textContent=el.dataset.count;});
    });
    return () => media?.revert();
  }, []);
  return <dl className="mh-film-figures" ref={host}>
    {figures.map(([value,zh,en],i)=><div key={value}>
      <dt>{lang==='zh'?zh:en}</dt><dd aria-label={String(value)}><span aria-hidden="true" data-count={i?value:undefined}>{value}</span></dd>
    </div>)}
  </dl>;
}

export default function AboutFilm({lang,go,onPhoto}) {
  const zh=lang==='zh', l=zh?0:1;
  const stage=useRef(null), photos=useRef(null);
  const [request,setRequest]=useState(0);
  const [{index,under},setFrame]=useState({index:0,under:null});
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible,setVisible]=useState(false), [reading,setReading]=useState(false), [focus,setFocus]=useState(false);
  const scene=scenes[index];
  const advance=step=>setRequest(current=>(current+step+scenes.length)%scenes.length);

  useEffect(()=>{
    const pref=matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion=()=>setReduced(pref.matches);
    let intersects=false;
    const sync=()=>setVisible(intersects && !document.hidden && document.documentElement.dataset.dialogOpen!=='true' && document.documentElement.dataset.navOpen!=='true');
    const observer=new IntersectionObserver(entries=>{
      const entry=entries[entries.length-1];
      intersects=entry.isIntersecting && entry.intersectionRatio>=.35;
      sync();
    },{threshold:[0,.35]});
    observer.observe(stage.current);
    pref.addEventListener('change',syncMotion);
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('mh-dialog-change',sync);
    window.addEventListener('mh-navigation-change',sync);
    return ()=>{observer.disconnect();pref.removeEventListener('change',syncMotion);document.removeEventListener('visibilitychange',sync);window.removeEventListener('mh-dialog-change',sync);window.removeEventListener('mh-navigation-change',sync);};
  },[]);

  useEffect(()=>{
    if(under!==null){
      if(reduced || !visible) setFrame({index,under:null});
      return;
    }
    if(request===index)return;
    let active=true;
    const photo=photos.current.children[request].querySelector('.mh-film-photo');
    photo.decode().then(()=>{
      if(active)setFrame({index:request,under:reduced || !visible?null:index});
    }).catch(()=>{if(active)setRequest(index);});
    return ()=>{active=false;};
  },[request,index,under,reduced,visible]);

  useEffect(()=>{
    if(!visible || reading || focus || reduced || under!==null || request!==index)return;
    const timer=setTimeout(()=>setRequest((index+1)%scenes.length),9500);
    return ()=>clearTimeout(timer);
  },[index,request,under,visible,reading,focus,reduced]);

  const detailsUrl='/company?lang='+lang+'#cd-history-title';
  function company(event){
    if(event.button===0 && !event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey){
      event.preventDefault();go(detailsUrl);
    }
  }
  function keys(event){
    if(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)return;
    const move=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0;
    if(move){event.preventDefault();advance(move);}
  }
  const ctaContent=label=><>{label}<span aria-hidden="true"/></>;
  return <div ref={stage} className="mh-about-film" data-current={scene.id} aria-label={zh?'关于我们图集':'About MH PIPE slideshow'} role="region"
    onPointerEnter={e=>{if(e.pointerType!=='touch')setReading(true);}} onPointerLeave={()=>setReading(false)}
    onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocus(false);}} onKeyDown={keys}>
    <div className="mh-film-photos" ref={photos}>
      {scenes.map((item,i)=><div key={item.id} className={'mh-film-frame mh-film-'+item.id} aria-hidden={i!==index}
        data-active={i===index} data-under={i===under} data-entering={i===index && under!==null}
        onAnimationEnd={e=>{if(e.target===e.currentTarget && e.animationName==='mh-film-dissolve')setFrame(frame=>({...frame,under:null}));}}>
        {i===0 && <img className="mh-film-atmosphere" src={imageRoot+item.photo} alt="" loading="lazy" decoding="async"/>}
        <img className="mh-film-photo" src={imageRoot+item.photo} alt={item.alt[l]} loading="lazy" decoding="async"/>
      </div>)}
    </div>
    <div className="mh-film-shade" aria-hidden="true"/>
    <div className="mh-film-lettering" aria-hidden="true">ABOUT<br/>US</div>
    <div className="mh-film-layout">
      <div className="mh-film-column">
        <div className="mh-film-tabs" role="group" aria-label={zh?'选择关于我们内容':'Choose an about section'}>
          {scenes.map((item,i)=><button type="button" key={item.id} data-about-slide={item.id} aria-pressed={i===index}
            aria-controls="mh-about-story" onClick={()=>setRequest(i)}>{item.tab[l]}</button>)}
        </div>
        <div className="mh-film-story" id="mh-about-story" key={scene.id}>
          <h2 className="home-chapter-title">{scene.title[l]}<HeadingEnglish lang={lang}>{scene.title[1]}</HeadingEnglish></h2>
          {index<2 ? <div className="mh-company-profile">
            {(index===0?companyProfileParagraphs.slice(0,1):companyProfileParagraphs.slice(1)).map(p=><p key={p.zh}>{p[lang]}</p>)}
          </div> : <ArchiveFigures lang={lang}/>}
        </div>
        <div className="mh-film-arrows">
          <button type="button" className="mh-about-prev" aria-label={zh?'上一张':'Previous slide'} onClick={()=>advance(-1)}><ChevronLeft aria-hidden="true"/></button>
          <button type="button" className="mh-about-next" aria-label={zh?'下一张':'Next slide'} onClick={()=>advance(1)}><ChevronRight aria-hidden="true"/></button>
        </div>
      </div>
      <div className="mh-film-actions">
        {index===0 ? <a href={routeHref(detailsUrl)} onClick={company}>{ctaContent(zh?'查看发展历程':'Explore our history')}</a>
          : index===1 ? <button type="button" aria-haspopup="dialog" onClick={()=>onPhoto(facilityRendering.file)}>{ctaContent(zh?'查看厂区全景':'View campus rendering')}</button>
          : <a href="/downloads/minhe-company-brochure-2024-zh.pdf" target="_blank" rel="noopener noreferrer">{ctaContent(zh?'阅读企业画册':'Company brochure (Chinese PDF)')}</a>}
      </div>
    </div>
    {index===2 && <ul className="mh-intro-standards" aria-label={zh?'认证证书':'Certificates'}>
      {facilityStandards.map(item=><li key={item.code}><button type="button" aria-haspopup="dialog"
        aria-label={(zh?'查看 ':'View ')+item.code+' '+item[lang]} onClick={()=>onPhoto(item.file)}>
        <img src={imageRoot+item.file} alt="" width="28" height="38" decoding="async"/><span>{item.code}</span>
      </button></li>)}
    </ul>}
    <div className="mh-film-index" aria-hidden="true"><span style={{transform:'translateX('+index*100+'%)'}}/></div>
  </div>;
}
