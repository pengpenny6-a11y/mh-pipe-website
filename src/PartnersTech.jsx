import React, {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import partnerSource from '../public/assets/partners/SOURCES.json';
import './partners-tech.css';

// The logos below are display crops of the unchanged, user-supplied brochure.
// They are not reconstructed, redrawn, or taken to prove a current endorsement.
const partners = partnerSource.logos;
const brochure = '/assets/partners/brochure-partners-original.jpg';
const sourceWidth = partnerSource.source_dimensions[0];
const sourceHeight = partnerSource.source_dimensions[1];

function PartnerMark({partner, lang, hidden = false, names = false}) {
  const {x, y, width, height} = partner.crop;
  return <span className="pt-identity" aria-hidden={hidden || undefined}>
    <span className="pt-mark" style={{width, height}}><img src={brochure} alt={hidden || names ? '' : partner[lang]} width={sourceWidth} height={sourceHeight}
      style={{left: -x, top: -y, width: sourceWidth, height: sourceHeight}}
      draggable="false" decoding="async" /></span>
    {names && <span className="pt-identity-names"><span>{partner[lang]}</span><span lang={lang==='zh'?'en':'zh'}>{partner[lang==='zh'?'en':'zh']}</span></span>}
  </span>;
}

export default function PartnersTech({lang = 'en', title, englishTitle, compact=false, names=false}) {
  const language = lang === 'zh' ? 'zh' : 'en';
  const text = (en, zh) => language === 'zh' ? zh : en;
  const root = useRef(null);
  const logos = useRef(null);
  const layout = useRef(null);
  const previousHeight = useRef(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageActive, setPageActive] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [all, setAll] = useState(false);
  const [reduced, setReduced] = useState(false);
  const titleId = useId(), logosId = useId();

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    change(); media.addEventListener('change', change);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {threshold: 0.05});
    observer.observe(root.current);
    const hide = () => setPageActive(false);
    const show = () => setPageActive(!document.hidden);
    window.addEventListener('blur', hide); window.addEventListener('focus', show); document.addEventListener('visibilitychange', show);
    return () => { media.removeEventListener('change', change); observer.disconnect(); window.removeEventListener('blur', hide); window.removeEventListener('focus', show); document.removeEventListener('visibilitychange', show); };
  }, []);

  const toggleAll = () => {
    previousHeight.current = logos.current.getBoundingClientRect().height;
    layout.current?.kill();
    setAll(value => !value);
  };
  useLayoutEffect(() => {
    const el = logos.current, g = window.gsap;
    if (!el) return undefined;
    layout.current?.kill();
    const from = previousHeight.current;
    previousHeight.current = null;
    el.style.height = 'auto';
    const height = el.getBoundingClientRect().height;
    const refresh = () => { el.style.height = ''; el.style.overflow = ''; window.ScrollTrigger?.refresh(); };
    if (!g || reduced || from == null) { refresh(); return undefined; }
    // Measure both real layouts; animate only the containing height. The same
    // unchanged logo artwork remains readable throughout the expansion.
    const timeline = g.timeline({onComplete: refresh});
    layout.current = timeline;
    timeline.fromTo(el, {height: from, overflow: 'hidden'}, {height, duration: .72, ease: 'power3.inOut'}, 0);
    timeline.fromTo(el.querySelectorAll(all ? '.pt-grid li' : '.pt-lane'), {opacity: 0, y: all ? 12 : 0}, {opacity: 1, y: 0, duration: .55, stagger: all ? .018 : .05, ease: 'power2.out', clearProps: 'opacity,transform'}, .08);
    return () => {timeline.kill();};
  }, [all, reduced]);
  const staticView = all || reduced;
  const moving = !paused && !hovered && !focused && inView && pageActive;
  const lanes = compact ? [partners] : [partners.slice(0, 10), partners.slice(10)];
  return <section className={'pt-root'+(compact?' pt-compact':'')} ref={root} aria-labelledby={titleId} data-partners-moving={moving && !staticView ? 'true' : 'false'}>
    <div className="pt-heading">
      <div><h2 id={titleId}>{title || text('Working together.', '合作伙伴')}<HeadingEnglish lang={language}>{englishTitle || 'Working together.'}</HeadingEnglish></h2><p>{text('Partners featured in our company brochure.', '公司画册展示的合作伙伴。')}</p></div>
      <div className="pt-actions">
        {!staticView && <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} className="pt-play">{paused ? text('Play', '继续播放') : text('Pause', '暂停播放')}</button>}
        {!reduced && <button type="button" onClick={toggleAll} aria-expanded={all} aria-controls={logosId}>{all ? text('Show less', '收起') : text('View all partners', '查看全部伙伴')}</button>}
      </div>
    </div>
    <div id={logosId} ref={logos} className={'pt-logos' + (staticView ? ' pt-static' : '')}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}
      tabIndex={staticView ? undefined : 0} aria-label={text('Company logos. Focus or hover to pause scrolling.', '合作伙伴标识，移入鼠标或聚焦可暂停滚动。')}>
      {staticView ? <ul className="pt-grid">{partners.map(partner => <li key={partner.id}><PartnerMark partner={partner} lang={language} names={names}/></li>)}</ul>
        : lanes.map((lane, index) => <div className={'pt-lane pt-lane-' + index} key={index}>
          <div className="pt-track" style={{animationPlayState: moving ? 'running' : 'paused'}}>
            {[0, 1].map(copy => <ul key={copy} className="pt-logo-set" aria-hidden={copy === 1 || undefined}>{lane.map(partner => <li key={partner.id}><PartnerMark partner={partner} lang={language} hidden={copy === 1} names={names}/></li>)}</ul>)}
          </div>
        </div>)}
    </div>
  </section>;
}
