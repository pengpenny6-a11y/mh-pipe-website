import React, {useLayoutEffect, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import CompanyProfile from './CompanyProfile.jsx';
import {businessEmail} from '../worker/contact-address.js';
import {Maximize2} from 'lucide-react';
import {facilityRendering} from './company-facility.js';
import './company-tech.css';

const t=(l,en,zh)=>l==='zh'?zh:en;
export const company={email:businessEmail,name:{en:'Sichuan Minhe Pipeline Construction Engineering Co., Ltd.',zh:'四川岷河管道建设工程有限公司'},address:{en:'Ganmei Industrial Park South, Dongpo District, Meishan, Sichuan, China',zh:'四川省眉山市东坡区甘眉工业园区南区'}};
const brochure='/downloads/minhe-company-brochure-2024-zh.pdf';
function internal(e,path,go){if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.shiftKey){e.preventDefault();go(path)}}

export function CompanyOverview({lang,go,full=false,onPhoto}){
 const root=useRef();const Heading=full?'h1':'h2';
 useLayoutEffect(()=>{
  const nodes=[...root.current.querySelectorAll('.co-number')];const g=window.gsap;
  if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches){nodes.forEach(n=>n.textContent=n.dataset.value);return}
  const ctx=g.context(()=>{nodes.forEach((el,i)=>{
   const target=Number(el.dataset.value),counter={value:1};el.textContent='1';
   g.to(counter,{value:target,duration:2.25,delay:i*.12,ease:'power2.out',onUpdate:()=>{el.textContent=String(Math.round(counter.value))},onComplete:()=>{el.textContent=String(target)},scrollTrigger:{trigger:el.closest('.co-metric'),start:'top 87%',once:true}});
  })},root);return()=>ctx.revert();
 },[lang]);
 useLayoutEffect(()=>{const g=window.gsap;if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const ctx=g.context(()=>{
  g.fromTo('.co-photo img',{scale:1.07,yPercent:2},{scale:1,yPercent:-2,ease:'none',scrollTrigger:{trigger:root.current,start:'top bottom',end:'bottom top',scrub:1.3}});
  g.fromTo('.co-photo',{clipPath:'inset(0 10% 0 0)'},{clipPath:'inset(0 0% 0 0)',ease:'none',scrollTrigger:{trigger:root.current,start:'top 90%',end:'top 25%',scrub:1.05}});
 },root);return()=>ctx.revert()},[]);
 return <section className={'co-root'+(full?' co-full':'')} ref={root}>
  <div className="co-intro"><Heading>{t(lang,<>Manufacturing<br/>since 2000.</>,<>岷河制造，<br/>始于2000年。</>)}<HeadingEnglish lang={lang}>Manufacturing since 2000</HeadingEnglish></Heading><div><CompanyProfile lang={lang}/>{!full&&<a href={'/company?lang='+lang} onClick={e=>internal(e,'/company',go)}>{t(lang,'Meet MH PIPE','了解岷河')}<span>+</span></a>}</div></div>
  <div className="co-campus"><figure className="co-photo">
    <img src={'/assets/company/'+facilityRendering.file} alt={facilityRendering.alt[lang]} width="1448" height="1086"/>
    <figcaption>{facilityRendering.caption[lang]}</figcaption>
    {onPhoto && <button className="co-campus-open" type="button" onClick={()=>onPhoto(facilityRendering.file)}>
      <span><Maximize2 size={17} aria-hidden="true"/>{t(lang,'View full rendering','查看完整效果图')}</span>
    </button>}
  </figure>
   <div className="co-capacity"><div className="co-metric"><strong aria-label={t(lang,'More than 30 million','3000余万')}><span className="co-number" data-value={lang==='zh'?3000:30} aria-hidden="true">{lang==='zh'?'3000':'30'}</span><span className="co-unit" aria-hidden="true">{lang==='zh'?'万+':'M+'}</span></strong><p>{t(lang,'Metres of pipe per year','米管材 / 年')}</p></div><div className="co-metric"><strong aria-label={t(lang,'50 million','5000万')}><span className="co-number" data-value={lang==='zh'?5000:50} aria-hidden="true">{lang==='zh'?'5000':'50'}</span><span className="co-unit" aria-hidden="true">{lang==='zh'?'万':'M'}</span></strong><p>{t(lang,'Fittings & accessories per year','件管件及附件 / 年')}</p></div><p className="co-source">{t(lang,'Annual production figures published in the 2024 company brochure.','年生产规模据2024版公司画册。')}</p></div>
  </div>
  {full&&<div className="co-identity"><p>{company.name[lang]}</p><p>{company.address[lang]}</p></div>}
 </section>
}

const tests=[
 {id:'hydrostatic',file:'hydrostatic.webp',name:{en:'Hydrostatic testing',zh:'水压检测'},description:{en:'Equipment for checking pressure resistance and leak tightness.',zh:'用于管材耐压与密封性检验。'}},
 {id:'spectrometry',file:'spectrometry.webp',name:{en:'Material analysis',zh:'光谱检测'},description:{en:'Spectrometry equipment for checking material composition.',zh:'用于核对材料化学成分。'}},
 {id:'eddy-current',file:'eddy-current.webp',name:{en:'Eddy-current inspection',zh:'涡流检测'},description:{en:'Inspection equipment on the tube production line.',zh:'查看制管生产线上的涡流检测设备。'}}
];
export function QualityStudio({lang,onPhoto}){
 const [active,setActive]=useState(0);const [previous,setPrevious]=useState(tests[0].file);const picture=useRef(),tween=useRef();const current=tests[active];
 useLayoutEffect(()=>{const g=window.gsap;if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches)return;tween.current=g.fromTo(picture.current,{opacity:0},{opacity:1,duration:.9,ease:'sine.inOut'});return()=>tween.current?.kill()},[active]);
 return <section className="qc-root"><div className="qc-heading"><h2>{t(lang,<>Quality,<br/>in practice.</>,<>检验，<br/>落实到细节。</>)}</h2><p>{t(lang,'From material analysis to pressure testing, explore the equipment behind the products.','从材料分析到压力检验，走近产品背后的检测环节。')}</p></div><div className="qc-layout"><button className="qc-photo" style={{backgroundImage:`url(/assets/company/${previous})`}} onClick={()=>onPhoto(current.file)} aria-label={t(lang,'Enlarge: ','放大：')+current.name[lang]}><img key={current.id} ref={picture} src={'/assets/company/'+current.file} alt={current.name[lang]} loading="lazy"/><span>{t(lang,'View photograph','查看实拍')} +</span></button><div className="qc-tests" role="group" aria-label={t(lang,'Inspection equipment','检测设备')}>{tests.map((test,i)=><button key={test.id} aria-pressed={i===active} onClick={()=>{if(i!==active){setPrevious(current.file);setActive(i)}}}><span>{test.name[lang]}</span><b aria-hidden="true">{i===active?'−':'+'}</b>{i===active&&<p>{test.description[lang]}</p>}</button>)}<p className="qc-note">{t(lang,'Testing requirements and reports are confirmed for the selected product and application.','具体检验项目与报告，按所选产品及用途核对。')}</p></div></div></section>
}

export function Literature({lang,compact=false}){
 return <section className={'lit-root'+(compact?' lit-compact':'')}><div><h2>{t(lang,'The complete picture.','进一步了解岷河。')}</h2><p>{t(lang,'Company, product families, manufacturing and inspection.','企业介绍、产品系列、制造与检测资料。')}</p></div><a className="lit-document" href={brochure} target="_blank" rel="noreferrer"><img src="/assets/company/brochure-cover-2024.png" alt="" loading="lazy"/><div><h3>{t(lang,'Company brochure','公司画册')}</h3><p>{t(lang,'Chinese · 2024 edition · PDF','中文 · 2024版 · PDF')}</p><span>{t(lang,'Open brochure','打开画册')} +</span></div></a></section>
}

export function BusinessContact({lang,onOpen,full=false}){
 const Heading=full?'h1':'h2';const root=useRef();
 useLayoutEffect(()=>{const g=window.gsap;if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const ctx=g.context(()=>{
  g.from('.bc-title-line>span',{yPercent:105,duration:1.1,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:root.current,start:'top 85%',once:true}});
 },root);return()=>ctx.revert()},[]);
 return <section className={'bc-root'+(full?' bc-full':'')} ref={root}><div className="bc-opening"><Heading>{[t(lang,'Let’s talk','连接，从'),t(lang,'piping.','一次沟通开始。')].map(line=><span className="bc-title-line" key={line}><span>{line}</span></span>)}<HeadingEnglish lang={lang}>Let’s talk piping</HeadingEnglish></Heading><div><p>{t(lang,'For importers, distributors and project teams.','面向进口商、经销商与工程团队。')}</p><a className="bc-email" href={'mailto:'+company.email}>{company.email}</a>{full&&<button className="bc-brief" onClick={()=>onOpen()}>{t(lang,'Prepare an inquiry','整理询盘需求')}<span>+</span></button>}</div></div>{full&&<div className="bc-information"><div><h2>{t(lang,'Visit MH PIPE','来到岷河')}</h2><p>{company.name[lang]}</p><address>{company.address[lang]}</address></div><img src="/assets/company/factory-front.webp" alt={t(lang,'MH PIPE office and factory entrance','岷河办公楼与厂区入口')} loading="lazy"/></div>}</section>
}
