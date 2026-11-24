import React, {useLayoutEffect, useRef} from 'react';
import {ArrowRight, ArrowUp, ArrowUpRight, FileDown} from 'lucide-react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {company} from './CompanyTech.jsx';
import {entries} from './navigation-content.js';
import {reducedMotion} from './site-motion.js';
import './home-editorial.css';

function RouteLink({to, lang, go, children, ...props}) {
  const url = new URL(to, location.origin);
  url.searchParams.set('lang', lang);
  const href = url.pathname + url.search + url.hash;
  return <a href={href} {...props} onClick={event => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      go(href);
    }
  }}>{children}</a>;
}

export function HomeContactChapter({lang, go}) {
  const root = useRef(null);
  const zh = lang === 'zh';
  useLayoutEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.mh-enquiry-photo img', {scale:1.08}, {scale:1, ease:'none',
        scrollTrigger:{trigger:root.current, start:'top bottom', end:'center center', scrub:0.65}
      });
    }, root);
    return () => media.revert();
  }, []);
  return <section ref={root} id="home-contact" className="mh-enquiry-panel" aria-labelledby="mh-enquiry-title">
    <div className="mh-enquiry-copy">
      <h2 id="mh-enquiry-title">{zh ? '联系我们' : 'Contact us'}<HeadingEnglish lang={lang}>Contact us</HeadingEnglish></h2>
      <p>{zh ? '告诉我们您需要的管路系列、管径和采购数量。' : 'Tell us which piping system, sizes and quantities you need.'}</p>
      <div className="mh-enquiry-actions">
        <RouteLink to="/contact?intent=distribution#contact-inquiry" lang={lang} go={go}>
          {zh ? '洽谈经销合作' : 'Distributor enquiries'}<ArrowRight size={17} aria-hidden="true"/>
        </RouteLink>
        <RouteLink to="/contact?intent=project#contact-inquiry" lang={lang} go={go}>
          {zh ? '咨询工程项目' : 'Discuss a project'}<ArrowUpRight size={17} aria-hidden="true"/>
        </RouteLink>
      </div>
    </div>
    <figure className="mh-enquiry-photo">
      <img loading="lazy" decoding="async" src="/assets/company/office-facade.webp" width="1365" height="1024"
        alt={zh ? '四川岷河办公楼正面及入口' : 'The entrance to the MH PIPE offices'}/>
    </figure>
  </section>;
}

const documents = [
  {path:'/downloads/mh-pipe-series-selection-en.pdf', zh:'管路系列选型表（英文）', en:'Series selection sheet (English)'},
  {path:'/downloads/minhe-company-brochure-2024-zh.pdf', zh:'公司画册（中文）', en:'Company brochure (Chinese)'}
];

export function HomeFooter({lang, go}) {
  const zh = lang === 'zh';
  const returnToTop = () => {
    const instant = reducedMotion();
    if (window.mhScroll) window.mhScroll.scrollTo(0, {immediate:instant, duration:1.05});
    else window.scrollTo({top:0, behavior:instant ? 'instant' : 'smooth'});
    document.querySelector('.sn-brand')?.focus({preventScroll:true});
  };
  return <footer className="mh-directory">
    <div className="mh-directory-main">
      <div className="mh-directory-identity">
        <RouteLink className="mh-directory-logo" to="/" lang={lang} go={go} aria-label={zh ? '四川岷河首页' : 'MH PIPE home'}>
          <span>MH PIPE</span>{zh && <span lang="zh">四川岷河</span>}
        </RouteLink>
        <p>{company.name[lang]}</p>
        <address>{company.address[lang]}</address>
        <a className="mh-directory-mail" href={'mailto:' + company.email}>{company.email}</a>
      </div>
      <nav aria-label={zh ? '底部网站导航' : 'Footer site navigation'}>
        <strong className="mh-directory-label">{zh ? '网站导航' : 'Explore MH PIPE'}</strong>
        <div className="mh-directory-links">
          {entries.slice(1).map(([to,en,cn]) =>
            <RouteLink key={to} to={to} lang={lang} go={go}>{zh ? cn : en}</RouteLink>
          )}
        </div>
      </nav>
      <div className="mh-directory-docs">
        <strong className="mh-directory-label">{zh ? '资料下载' : 'Downloads'}</strong>
        {documents.map(doc => <a key={doc.path} href={doc.path} download>
          <span>{zh ? doc.zh : doc.en}</span><FileDown size={16} aria-hidden="true"/>
        </a>)}
      </div>
    </div>
    <div className="mh-directory-base">
      <span>© MH PIPE</span>
      <button type="button" onClick={returnToTop}>{zh ? '返回顶部' : 'Back to top'}<ArrowUp size={16} aria-hidden="true"/></button>
    </div>
  </footer>;
}
