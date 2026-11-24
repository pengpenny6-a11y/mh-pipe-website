import React, {useEffect, useRef, useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {markets} from './history-atlas/markets.js';
import worldLand from './history-atlas/world-land.svg?url';
import './home-contact-atlas.css';

const intents = [
  {id:'distribution', name:['经销合作','Distribution'], copy:['按您的市场和渠道，洽谈管材与管件供货。','Discuss pipe and fitting supply for your market and sales channels.']},
  {id:'project', name:['工程项目','Project enquiry'], copy:['提供应用场景、管径和数量，洽谈工程配套。','Discuss your application, pipe sizes and quantities with our project team.']},
];
export default function HomeContactAtlas({lang,go}) {
  const locale=lang==='zh'?0:1;
  const [intent,setIntent]=useState(intents[0]);
  const [selected,setSelected]=useState(null);
  const [arrived,setArrived]=useState(false);
  const section=useRef(null);
  const chosen=markets[selected];
  const params=new URLSearchParams({intent:intent.id,lang});
  if(chosen)params.set('market',chosen.name[locale]);
  const href='/contact?'+params.toString()+'#contact-inquiry';

  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      if(entries.at(-1).isIntersecting){
        setArrived(true);
        observer.disconnect();
      }
    });
    observer.observe(section.current);
    return ()=>observer.disconnect();
  },[]);

  function follow(e) {
    if(e.button===0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey){
      e.preventDefault();go(href);
    }
  }

  return <section id="home-contact" data-scroll-align="start" className="mh-contact-atlas" ref={section}
    data-arrived={arrived} aria-labelledby="mh-contact-atlas-title">
    <span className="mh-contact-atlas-alias" id="home-global" data-scroll-align="start" aria-hidden="true"/>
    <div className="mh-contact-atlas-grid">
      <div className="mh-contact-atlas-copy">
        <h2 id="mh-contact-atlas-title" className="home-chapter-title">
          {locale?'Contact us':'联系我们'}<HeadingEnglish lang={lang}>Contact us</HeadingEnglish>
        </h2>
        <fieldset className="mh-contact-intents">
          <legend className="mh-contact-screenreader">{locale?'Enquiry type':'咨询类型'}</legend>
          {intents.map(option=><label key={option.id}>
            <input name="home-enquiry-type" type="radio" value={option.id}
              checked={option.id===intent.id} onChange={()=>setIntent(option)}/>
            <span>{option.name[locale]}</span>
          </label>)}
        </fieldset>
        <p key={intent.id} className="mh-contact-intent-copy">{intent.copy[locale]}</p>
        <a className="mh-contact-atlas-action" href={href} onClick={follow}>
          {locale?'Start an enquiry':'填写询盘'}<ArrowUpRight size={18} aria-hidden="true"/>
        </a>
      </div>

      <div className="mh-contact-market">
        <p className="mh-contact-market-prompt" id="mh-market-label">
          {locale?'Choose your region':'选择所在地区'}
          <span>{locale?'Optional':'选填'}</span>
        </p>
        <div className="mh-contact-map" role="group" aria-labelledby="mh-market-label">
          <img className="mh-contact-land" src={worldLand} alt="" width="1000" height="445" decoding="async" draggable="false"/>
          {markets.map((market,i)=><button key={market.name[1]} type="button"
            className={'mh-contact-market-pin mh-contact-pin-'+i}
            style={{left:market.x+'%',top:market.y+'%'}}
            aria-label={market.name[locale]} aria-pressed={selected===i}
            onClick={()=>setSelected(selected===i?null:i)}>
            <span className="mh-contact-dot" aria-hidden="true"/>
            <span className="mh-contact-market-name">{(market.label || market.name)[locale]}</span>
          </button>)}
        </div>
      </div>
    </div>
  </section>;
}
