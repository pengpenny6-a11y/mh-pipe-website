import React from 'react';
import {ArrowDownToLine, ArrowUp} from 'lucide-react';
import {company} from './CompanyTech.jsx';
import {entries} from './navigation-content.js';
import {reducedMotion} from './site-motion.js';
import './home-directory.css';

const publications = [
  {
    id:'selection', title:{zh:'管路系列选型表',en:'Piping series selection sheet'},
    language:{zh:'英文',en:'English'}, file:'mh-pipe-series-selection-en.pdf',
    cover:'selection-front-thumb.webp', width:241, height:340
  },
  {
    id:'brochure', title:{zh:'公司画册',en:'Company brochure'},
    language:{zh:'中文',en:'Chinese'}, file:'minhe-company-brochure-2024-zh.pdf',
    cover:'brochure-front-thumb.webp', width:300, height:410
  }
];

export default function HomeDirectory({lang,go}) {
  const zh = lang==='zh';
  const href = path => path+'?lang='+lang;
  function follow(event) {
    if (event.button!==0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    go(event.currentTarget.getAttribute('href'));
  }
  function backToTop() {
    const immediate=reducedMotion();
    if(window.mhScroll) window.mhScroll.scrollTo(0,{immediate,duration:1.05});
    else window.scrollTo({top:0,behavior:immediate?'instant':'smooth'});
    document.querySelector('.sn-brand')?.focus({preventScroll:true});
  }

  return <footer className="mh-colophon" role="contentinfo">
    <div className="mh-colophon-inner">
      <div className="mh-colophon-menu">
        <nav className="mh-colophon-nav" aria-label={zh?'底部网站导航':'Footer navigation'}>
          {entries.slice(1).map(([path,en,cn])=><a key={path} href={href(path)} onClick={follow}>{zh?cn:en}</a>)}
        </nav>
        <button type="button" className="mh-colophon-top" onClick={backToTop}>
          <span>{zh?'返回顶部':'Back to top'}</span><ArrowUp size={17} strokeWidth={1.7} aria-hidden="true"/>
        </button>
      </div>
      <div className="mh-colophon-body">
        <div className="mh-colophon-company">
          <a className="mh-colophon-wordmark" href={href('/')} onClick={follow} aria-label={zh?'四川岷河首页':'MH PIPE home'}>MH PIPE</a>
          <div className="mh-colophon-identity">
            <span>© {company.name[lang]}</span>
            <address>{company.address[lang]}</address>
            <a href={'mailto:'+company.email}>{company.email}</a>
          </div>
        </div>
        <div className="mh-colophon-files" role="group" aria-labelledby="mh-colophon-resources">
          <div className="mh-colophon-shelf" aria-hidden="true">
            {publications.map(doc=><img key={doc.id} className={'mh-colophon-paper paper-'+doc.id}
              src={'/assets/company/'+doc.cover} alt="" width={doc.width} height={doc.height} loading="lazy" decoding="async"/>)}
          </div>
          <div className="mh-colophon-catalogues">
            <strong id="mh-colophon-resources">{zh?'技术资料':'Technical literature'}</strong>
            {publications.map(doc=><a key={doc.id} data-publication={doc.id} download href={'/downloads/'+doc.file}>
              <span>{doc.title[lang]}</span>
              <small>{doc.language[lang]} PDF</small>
              <ArrowDownToLine size={17} strokeWidth={1.6} aria-hidden="true"/>
            </a>)}
          </div>
        </div>
      </div>
    </div>
  </footer>;
}
