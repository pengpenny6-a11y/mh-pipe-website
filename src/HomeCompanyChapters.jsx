import React from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import AboutFilm from './AboutFilm.jsx';
import {FileText, PackageCheck, Ruler, Waypoints} from 'lucide-react';
import './home-company-intro.css';

const support=[
  {id:'selection',icon:Waypoints,title:['产品选型','Product selection'],description:['按介质、管径和连接方式选配。','Match the medium, pipe size and connection.']},
  {id:'drawings',icon:Ruler,title:['图纸确认','Drawing review'],description:['核对接口尺寸与配套管材。','Check dimensions and the mating pipe.']},
  {id:'coordination',icon:PackageCheck,title:['订单沟通','Order coordination'],description:['沟通采购数量、包装和交期。','Discuss quantities, packaging and delivery.']},
  {id:'documents',icon:FileText,title:['资料支持','Technical documents'],description:['查阅画册，索取项目所需资料。','Find literature and request project documents.']}
];
function navigate(event,url,go) {
  if(event.button===0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey){
    event.preventDefault();go(url);
  }
}
export function HomeAboutChapter({lang,go,onPhoto}) {
  return <section id="home-about" className="mh-intro" data-scroll-align="start" aria-label={lang==='zh'?'关于我们':'About MH PIPE'}>
    <AboutFilm lang={lang} go={go} onPhoto={onPhoto}/>
  </section>;
}
export function HomeSupportChapter({lang,go}) {
  const l=lang==='zh'?0:1;
  return <section className="mh-intro-support" id="home-support" data-scroll-align="start" aria-labelledby="home-support-title">
      <h2 id="home-support-title" className="home-chapter-title">{l?'Help & Support':'服务与支持'}<HeadingEnglish lang={lang}>Help &amp; Support</HeadingEnglish></h2>
      <div className="mh-support-photo">
        <img src="/assets/services/technical-review-home.webp" loading="lazy" decoding="async"
          alt={l?'Illustration of a team reviewing engineering drawings':'工程团队核对图纸的服务场景示意'}/>
      </div>
      <nav aria-label={l?'Project support':'项目服务'}>
        {support.map(({id,icon:Icon,title,description})=>{
          const url='/services?stage='+id+'&lang='+lang+'#service-detail';
          return <a className="mh-support-link" key={id} href={url} onClick={e=>navigate(e,url,go)}>
            <span className="mh-support-symbol"><Icon aria-hidden="true"/></span>
            <strong>{title[l]}</strong><span className="mh-support-copy">{description[l]}</span>
          </a>;
        })}
      </nav>
  </section>;
}
