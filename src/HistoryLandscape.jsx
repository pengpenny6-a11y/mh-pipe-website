import React, {useLayoutEffect, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {createPortal} from 'react-dom';
import Modal from './Modal.jsx';
import {events} from './company-archive/events.js';
import './history-landscape.css';

const periods = [
  {record:events[0], until:'2007', name:['管件起步','First fittings'], text:['2000 年 7 月，公司成立，开始生产有色金属管件。','Founded in July 2000, Minhe began by manufacturing non-ferrous metal fittings.']},
  {record:events[1], until:'2009', name:['薄壁与卡压','Thin-wall and press systems'], text:['2008 年，岷河薄壁不锈钢管与卡压管件完成四川建设领域技术备案。','In 2008, Minhe registered its thin-wall stainless steel pipes and press fittings for construction use in Sichuan.']},
  {record:events[2], until:'2016', name:['燃气管路','Gas piping'], text:['2010 年进入港华采购网络，燃气用焊接管件同年完成技术备案。','Minhe joined the Towngas procurement network in 2010 and registered its welded gas fittings that year.']},
  {record:events[3], until:'2023', name:['参与国标起草','Standards development'], text:['2017 年，《不锈钢环压式管件》国家标准 GB/T 33926–2017 发布，岷河列名主要起草单位。','In 2017, China published GB/T 33926–2017 for ring-press fittings, with Minhe listed among the drafting organisations.']},
  {record:{
    year:'2024', title:['2024版企业画册','The 2024 company brochure'],
    copy:['2024版公司画册汇集企业介绍、产品系列、生产现场与检测设备资料。','The 2024 company brochure covers the company, pipe and fitting ranges, workshop photographs and inspection equipment.'],
    credit:['岷河企业画册 · 2024版','MH PIPE company brochure · 2024 edition'],
    src:'/assets/company/brochure-cover-2024.png', specimen:true, url:'/downloads/minhe-company-brochure-2024-zh.pdf', action:['阅读企业画册','Read the brochure (Chinese PDF)']
  }, name:['企业画册','Company brochure'], text:['2024版企业画册收录岷河的管路产品、生产现场和检测设备。','The 2024 brochure documents our piping products, production floor and testing equipment.']}
];

function HistoryArchive({item,language,close}) {
  return createPortal(<Modal kind="ridge-document" label={item.title[language]} close={close}>
    <figure className={item.specimen?'ridge-specimen':''}>
      <img src={item.src} alt={item.credit[language]}/>
      <figcaption>{item.credit[language]}</figcaption>
    </figure>
    <div className="ridge-document-text">
      <span>{item.year}</span>
      <h3>{item.title[language]}</h3>
      <p>{item.copy[language]}</p>
      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">{item.action[language]}</a>}
    </div>
  </Modal>,document.body);
}

export default function HistoryLandscape({lang}) {
  const host=useRef(null);
  const [opened,setOpened]=useState(null);
  const language=lang==='zh'?0:1;
  useLayoutEffect(()=>{
    const gsap=window.gsap;
    if(!gsap || !window.ScrollTrigger)return;
    gsap.registerPlugin(window.ScrollTrigger);
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const root=host.current;
      const guide=root.querySelectorAll('.ridge-guide');
      const copy=root.querySelectorAll('.ridge-copy');
      const entrance=gsap.timeline({scrollTrigger:{trigger:root,start:'top 78%',once:true},defaults:{ease:'power3.out'}});
      entrance.fromTo(guide,{scaleY:0},{scaleY:1,duration:1.05,stagger:.1},0)
        .fromTo(copy,{opacity:0,y:17},{opacity:1,y:0,duration:.8,stagger:.12,clearProps:'transform,opacity'},.07);
      gsap.fromTo(root.querySelector('.ridge-panorama'),{yPercent:4.5},{yPercent:0,ease:'none',
        scrollTrigger:{trigger:root,start:'top bottom',end:'bottom 65%',scrub:.65}});
    },host);
    return ()=>media.revert();
  },[]);

  return <section ref={host} className="ridge-history" lang={lang} aria-labelledby="cd-history-title">
      <header className="ridge-heading">
        <p>{language?'Company archive':'企业档案'}</p>
        <h2 id="cd-history-title" className="home-chapter-title">{language?'Development History':'发展历程'}<HeadingEnglish lang={lang}>Development History</HeadingEnglish></h2>
      </header>
      <div className="ridge-panorama" aria-hidden="true">
        <img src="/assets/history/ridge.webp" width="2164" height="555" alt="" decoding="async" loading="lazy"/>
      </div>
      <ol className="ridge-milestones">
        {periods.map((period,index)=>{
          const record=period.record;
          return <li className="ridge-year" key={record.year} style={{'--offset':periods.length-1-index}}>
            <span className="ridge-guide" aria-hidden="true"/>
            <div className="ridge-copy">
              <h3><button type="button" className="ridge-open" id={'cd-year-'+record.year} aria-haspopup="dialog"
                aria-label={language?'Open archive: '+record.year+', '+period.name[language]:'查看'+record.year+'年档案，'+period.name[language]}
                onClick={()=>setOpened(index)}>
                <span className="ridge-period">{record.year}<span className="ridge-dash">–</span>{period.until || (language?'Today':'至今')}</span>
                <span className="ridge-name">{period.name[language]}</span>
              </button></h3>
              <p>{period.text[language]}</p>
            </div>
          </li>;
        })}
      </ol>
      {opened!==null && <HistoryArchive item={periods[opened].record} language={language} close={()=>setOpened(null)}/>}
  </section>;
}
