import {routeHref} from './site-routes.js';
import React, { useLayoutEffect, useRef, useState } from 'react';
import './precision-manufacturing.css';

const FACILITY = 'facility-rendering-refined.png';
const STANDARD = 'https://std.samr.gov.cn/gb/search/gbDetailedCNF?id=71F772D81B07D3A7E05397BE0A0AB82A';
const chapters = [
  { id: 'material', file: 'tube-making.webp', title: { en: 'Material', zh: '原料' }, caption: { en: 'Stainless steel coils at the tube production lines.', zh: '制管生产线上的不锈钢卷材。' }, position: '64% 70%' },
  { id: 'forming', file: 'forming.webp', title: { en: 'Forming', zh: '成型' }, caption: { en: 'A forming station on the factory floor.', zh: '厂内成型设备与生产工位。' }, position: '56% 65%' },
  { id: 'inspection', file: 'laboratory.webp', title: { en: 'Inspection', zh: '检验' }, caption: { en: 'Inside the MH PIPE materials laboratory.', zh: '岷河材料实验室。' }, position: '60% 57%' },
];

export default function PrecisionManufacturing({ lang = 'en', onPhoto, go }) {
  const zh = lang === 'zh';
  const root = useRef(null);
  const facility = useRef(null);
  const metrics = useRef(null);
  const film = useRef(null);
  const filmControl = useRef(null);
  const counted = useRef(false);
  const [selected, setSelected] = useState(-1);
  const [reduced, setReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  useLayoutEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);

  useLayoutEffect(() => {
    const g = window.gsap;
    const numbers = [...root.current.querySelectorAll('.pm-number')];
    const targets = zh ? [3000, 5000] : [30, 50];
    const finalValues = () => numbers.forEach((el, index) => { el.textContent = String(targets[index]); });
    if (!g || reduced) { finalValues(); counted.current = true; return undefined; }

    let inView = false;
    let counterTween;
    let observer;
    const context = g.context(() => {
      const st = window.ScrollTrigger;
      if (st) {
        g.registerPlugin(st);
        g.fromTo(root.current.querySelector('.pm-facility-photo'), { scale: 1.055, yPercent: -1.5 }, {
          scale: 1, yPercent: 1.5, ease: 'none',
          scrollTrigger: { trigger: facility.current, start: 'top 95%', end: 'bottom 10%', scrub: 1.15, invalidateOnRefresh: true },
        });
      }
      if (counted.current) { finalValues(); return; }
      const values = { a: 1, b: 1 };
      numbers.forEach(el => { el.textContent = '1'; });
      counterTween = g.to(values, {
        a: targets[0], b: targets[1], duration: 2.5, ease: 'power2.out', paused: true,
        onUpdate: () => { numbers[0].textContent = String(Math.round(values.a)); numbers[1].textContent = String(Math.round(values.b)); },
        onComplete: () => { counted.current = true; finalValues(); },
      });
    }, root);
    const sync = () => {
      if (!counterTween || counted.current) return;
      counterTween.paused(!inView || document.hidden || document.documentElement.dataset.dialogOpen === 'true');
    };
    observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: .2 });
    observer.observe(metrics.current);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('mh-dialog-change', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('mh-dialog-change', sync);
      context.revert();
    };
  }, [zh, reduced]);

  useLayoutEffect(() => {
    const g = window.gsap;
    const element = film.current;
    const panels = [...element.querySelectorAll('.pm-shot')];
    const images = panels.map(panel => panel.querySelector('img'));
    const labels = panels.map(panel => panel.querySelector('.pm-shot-copy'));
    const captions = panels.map(panel => panel.querySelector('.pm-shot-caption'));
    let tween;
    let filmVisible = false;
    let width = element.clientWidth;
    const ranges = { a: .46, b: .76 };
    const render = () => {
      const edges = [0, ranges.a, ranges.b, 1];
      panels.forEach((panel, index) => {
        const left = edges[index];
        const right = edges[index + 1];
        // Each photograph keeps its natural proportions. Only the observation
        // window and its centre travel, avoiding a stretched accordion image.
        panel.style.clipPath = `inset(0 ${(1 - right) * width + (index === 2 ? 0 : 1)}px 0 ${left * width + (index === 0 ? 0 : 1)}px)`;
        images[index].style.transform = `translate3d(${((left + right) / 2 - .5) * 100}%,0,0) scale(1.035)`;
        labels[index].style.transform = `translate3d(${left * width + 24}px,0,0)`;
        labels[index].style.width = `${Math.max(120, (right - left) * width - 48)}px`;
      });
    };
    const context = g?.context(() => {}, root);
    const select = index => {
      const sizes = index < 0 ? [.46, .30, .24] : chapters.map((_, i) => i === index ? .58 : .21);
      const next = { a: sizes[0], b: sizes[0] + sizes[1] };
      tween?.kill();
      if (!g || reduced) {
        Object.assign(ranges, next); render();
        captions.forEach((caption, i) => { caption.style.opacity = i === index ? '1' : '0'; caption.style.visibility = i === index ? 'visible' : 'hidden'; });
        return;
      }
      context.add(() => {
        tween = g.to(ranges, { ...next, duration: .8, ease: 'power3.inOut', overwrite: true, onUpdate: render });
        captions.forEach((caption, i) => g.to(caption, { autoAlpha: i === index ? 1 : 0, y: i === index ? 0 : 8, duration: i === index ? .6 : .22, delay: i === index ? .2 : 0, ease: 'power2.out', overwrite: true }));
      });
    };
    const resize = new ResizeObserver(() => { width = element.clientWidth; render(); });
    const sync = () => { tween?.paused(!filmVisible || document.hidden || document.documentElement.dataset.dialogOpen === 'true'); };
    const visibility = new IntersectionObserver(([entry]) => { filmVisible = entry.isIntersecting; sync(); }, { threshold: .05 });
    render();
    filmControl.current = select;
    select(selected);
    resize.observe(element);
    visibility.observe(element);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('mh-dialog-change', sync);
    return () => {
      resize.disconnect(); visibility.disconnect(); tween?.kill(); context?.revert(); filmControl.current = null;
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('mh-dialog-change', sync);
    };
  }, [reduced]);

  function select(index) { setSelected(index); filmControl.current?.(index); }
  function leaveFilm() {
    const focused = [...film.current.querySelectorAll('.pm-shot')].indexOf(document.activeElement);
    select(focused);
  }
  function navigate(event) {
    if (!go || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault(); go('/manufacturing');
  }
  function moveFocus(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...film.current.querySelectorAll('.pm-shot')];
    const current = Math.max(0, buttons.indexOf(document.activeElement));
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : Math.max(0, Math.min(2, current + (event.key === 'ArrowRight' ? 1 : -1)));
    buttons[next].focus({ preventScroll: true });
  }

  return <section className="pm-root" ref={root} aria-labelledby="pm-heading" data-pm-reduced={reduced}>
    <div className="pm-overview">
     <div className="pm-edge">
      <h2 id="pm-heading" className="pm-heading"><span>{zh ? '岷河制造。' : 'Manufacturing.'}</span><span>{zh ? '始于2000年。' : 'Since 2000.'}</span></h2>
      <div className="pm-metrics" ref={metrics}>
        <div className="pm-metric"><strong aria-label={zh ? '3000余万米管材每年' : 'More than 30 million metres of pipe per year'}><span className="pm-number" aria-hidden="true">{zh ? '3000' : '30'}</span><span aria-hidden="true">{zh ? '万+' : 'M+'}</span></strong><p>{zh ? '米管材 / 年' : 'Metres of pipe per year'}</p></div>
        <div className="pm-metric"><strong aria-label={zh ? '5000万件管件及附件每年' : '50 million fittings and accessories per year'}><span className="pm-number" aria-hidden="true">{zh ? '5000' : '50'}</span><span aria-hidden="true">{zh ? '万' : 'M'}</span></strong><p>{zh ? '件管件及附件 / 年' : 'Fittings & accessories per year'}</p></div>
      </div>
      <div className="pm-evidence-note"><p>{zh ? '年生产规模据2024版公司画册。' : 'Annual production figures from the 2024 company brochure.'}</p><a href={STANDARD} target="_blank" rel="noreferrer">{zh ? '国家标准 GB/T 33926–2017 主要起草单位之一' : 'Co-drafter of national standard GB/T 33926–2017'}</a></div>
     </div>
     <button className="pm-facility" ref={facility} type="button" onClick={() => onPhoto?.(FACILITY)} aria-label={zh ? '放大岷河厂区效果图' : 'Enlarge the MH PIPE facility rendering'}>
      <img className="pm-facility-photo" src={`/assets/company/${FACILITY}`} alt={zh ? '岷河厂区建筑效果图，包含规划建筑，经过视觉优化' : 'Retouched architectural rendering of the MH PIPE facility, including planned buildings'} loading="lazy" decoding="async" />
      <span className="pm-facility-label">{zh ? '厂区效果图 · 含规划建筑' : 'Facility rendering · includes planned buildings'}</span>
     </button>
    </div>
    <div className="pm-gallery-row">
     <div className="pm-gallery-entry"><p>{zh ? '生产现场实拍' : 'From the factory floor'}</p><a className="pm-more" href={routeHref('/manufacturing',zh ? 'zh' : 'en')} onClick={navigate}><span>{zh ? '走进制造现场' : 'Inside manufacturing'}</span></a></div>
     <div className="pm-film" ref={film} onPointerLeave={leaveFilm} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) select(-1); }} onKeyDown={moveFocus} aria-label={zh ? '制造现场实拍' : 'Photographs from the factory floor'} data-pm-selected={selected}>
      {chapters.map((chapter, index) => <button className={`pm-shot${selected === index ? ' pm-shot-selected' : ''}`} key={chapter.id} type="button" onPointerEnter={event => { if (event.pointerType !== 'touch') select(index); }} onFocus={() => select(index)} onClick={() => onPhoto?.(chapter.file)} aria-label={zh ? `查看${chapter.title.zh}现场照片：${chapter.caption.zh}` : `View ${chapter.title.en.toLowerCase()} photograph: ${chapter.caption.en}`}>
        <img src={`/assets/company/${chapter.file}`} alt="" aria-hidden="true" loading="lazy" decoding="async" style={{ objectPosition: chapter.position }} />
        <span className="pm-shot-copy"><span className="pm-shot-title">{chapter.title[zh ? 'zh' : 'en']}</span><span className="pm-shot-caption">{chapter.caption[zh ? 'zh' : 'en']}</span></span>
      </button>)}
     </div>
    </div>
  </section>;
}
