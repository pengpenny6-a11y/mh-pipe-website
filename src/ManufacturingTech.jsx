import {routeHref} from './site-routes.js';
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import './manufacturing-tech.css';

// These are verified company photographs. Captions describe what is visible;
// they do not imply production capacity, certifications or test results.
const manufacturingViews = [
  {
    id: 'production', file: 'tube-making.webp', position: '50% 52%',
    label: { en: 'Production', zh: '生产' },
    title: { en: 'Tube production', zh: '制管现场' },
    description: { en: 'Inside the production workshop.', zh: '走进不锈钢管材生产车间。' },
    alt: { en: 'Stainless steel coils and tube production equipment at MH PIPE.', zh: '岷河制管车间内的不锈钢卷料与生产设备。' },
  },
  {
    id: 'inspection', file: 'laboratory.webp', position: '56% 50%',
    label: { en: 'Inspection', zh: '检验' },
    title: { en: 'Laboratory inspection', zh: '实验室检验' },
    description: { en: 'A closer look at the laboratory.', zh: '从生产现场，走进检验环节。' },
    alt: { en: 'MH PIPE staff working with laboratory testing equipment.', zh: '岷河工作人员在实验室操作检验设备。' },
  },
  {
    id: 'marking', file: 'laser-marking.webp', position: '50% 52%',
    label: { en: 'Marking', zh: '标识' },
    title: { en: 'Laser marking', zh: '激光打标' },
    description: { en: 'Product marking on the workshop floor.', zh: '生产现场的产品标识工序。' },
    alt: { en: 'An MH PIPE operator at the laser marking workstation.', zh: '岷河工作人员操作激光打标设备。' },
  },
  {
    id: 'facility', file: 'factory.webp', position: '50% 69%',
    label: { en: 'Facility', zh: '厂区' },
    title: { en: 'The MH PIPE facility', zh: '岷河厂区' },
    description: { en: 'The place behind the products.', zh: '产品背后的制造现场。' },
    alt: { en: 'An aerial photograph of the MH PIPE factory and office buildings.', zh: '岷河厂房与办公楼的航拍实景。' },
  },
];

export default function ManufacturingTech({ lang = 'en', onPhoto, go, full = false }) {
  const language = lang === 'zh' ? 'zh' : 'en';
  const text = (en, zh) => language === 'zh' ? zh : en;
  const views = useMemo(() => full ? manufacturingViews : [manufacturingViews[0], manufacturingViews[1]], [full]);
  const [active, setActive] = useState(0);
  const [motion, setMotion] = useState('static');
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageActive, setPageActive] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const root = useRef(null);
  const frame = useRef(null);
  const selectors = useRef(null);
  const selection = useRef(null);
  const activeIndex = useRef(0);
  const caption = useRef(null);
  const progress = useRef(null);
  const playback = useRef(null);
  const cameraDrift = useRef(null);
  const running = useRef(false);
  const titleId = useId();
  const Heading = full ? 'h1' : 'h2';
  const playing = motion === 'ambient' && inView && pageActive && !paused && !hovered && !focused && !dialogOpen;
  running.current = playing;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= .35), {threshold: [0, .35]});
    observer.observe(frame.current);
    const hide = () => setPageActive(false);
    const show = () => setPageActive(!document.hidden);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    document.addEventListener('visibilitychange', show);
    const dialog = new MutationObserver(() => setDialogOpen(document.body.style.overflow === 'hidden'));
    dialog.observe(document.body, {attributes: true, attributeFilter: ['style']});
    return () => { observer.disconnect(); dialog.disconnect(); window.removeEventListener('blur', hide); window.removeEventListener('focus', show); document.removeEventListener('visibilitychange', show); };
  }, []);

  useLayoutEffect(() => {
    const g = window.gsap;
    if (!g || motion !== 'ambient') return undefined;
    const clock = g.fromTo(progress.current, {scaleX: 0}, {scaleX: 1, duration: 6.2, ease: 'none', paused: !running.current, onComplete: () => selection.current?.((activeIndex.current + 1) % views.length)});
    playback.current = clock;
    const image = root.current.querySelectorAll('.mf-photograph')[active];
    const drift = g.fromTo(image, {scale: 1.015, xPercent: 0}, {scale: 1.055, xPercent: active % 2 ? .4 : -.4, duration: 6.2, ease: 'none', paused: !running.current});
    cameraDrift.current = drift;
    return () => {clock.kill(); drift.kill(); playback.current = null; cameraDrift.current = null;};
  }, [active, motion, views]);

  useEffect(() => {
    playback.current?.paused(!playing);
    cameraDrift.current?.paused(!playing);
  }, [playing]);

  useLayoutEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    activeIndex.current = 0;
    setActive(0);
    if (!gsap) return undefined;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    let media;
    const context = gsap.context(() => {
      media = gsap.matchMedia();
      media.add({
        always: '(min-width: 0px)',
        reduce: '(prefers-reduced-motion: reduce)',
      }, match => {
        const { reduce } = match.conditions;
        const panels = [...root.current.querySelectorAll('.mf-panel')];
        const photographs = panels.map(panel => panel.querySelector('.mf-photograph'));
        const show = index => {
          if (activeIndex.current !== index) {
            activeIndex.current = index;
            setActive(index);
          }
        };

        if (reduce) {
          setMotion('static');
          selection.current = show;
          return () => { selection.current = null; };
        }

        setMotion('ambient');
        gsap.set(panels, { autoAlpha: index => index === activeIndex.current ? 1 : 0, zIndex: index => index === activeIndex.current ? 1 : 0 });
        gsap.set(photographs, { scale: 1 });
        // Native page travel stays uninterrupted: no pin, scroll-to-tab or
        // per-image refresh. Image dimensions are fixed by the stage CSS.
        if (ScrollTrigger) {
          gsap.fromTo('.mf-depth', { scale: 1.035, yPercent: -1 }, {
            scale: 1, yPercent: 1, ease: 'none',
            scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: 1.1 },
          });
        }
        const changes = gsap.context(() => {}, root);
        let transition;
        changes.add('select', index => {
          if (index === activeIndex.current) return;
          const previous = activeIndex.current;
          transition?.kill();
          gsap.killTweensOf(panels);
          // The outgoing photograph remains opaque under the incoming one;
          // dissolving cannot expose a dark stage or create a brightness dip.
          gsap.set(panels, { autoAlpha: i => i === previous ? 1 : 0, zIndex: i => i === previous ? 1 : 0 });
          gsap.set(panels[index], { autoAlpha: 0, zIndex: 2 });
          show(index);
          transition = gsap.timeline({ defaults: { overwrite: 'auto' } })
            .to(panels[index], { autoAlpha: 1, duration: 1.1, ease: 'sine.inOut' }, 0)
            .set(panels[previous], { autoAlpha: 0 }, 1.1);
        });
        selection.current = changes.select;
        return () => { selection.current = null; changes.revert(); };
      });
    }, root);

    return () => {
      selection.current = null;
      media?.revert();
      context.revert();
    };
  }, [full, views]);

  useLayoutEffect(() => {
    if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = window.gsap.context(() => {
      window.gsap.fromTo(caption.current, { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: .65, delay: .15, ease: 'power2.out' });
    }, root);
    return () => context.revert();
  }, [active]);

  const select = index => {
    const next = Math.max(0, Math.min(views.length - 1, index));
    if (next === activeIndex.current) { playback.current?.restart().paused(!running.current); cameraDrift.current?.restart().paused(!running.current); }
    if (selection.current) selection.current(next);
    else {
      activeIndex.current = next;
      setActive(next);
    }
  };

  const navigate = (event, path) => {
    if (!go || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(path);
  };

  return (
    <section className={`mf-root${full ? ' mf-full' : ''}`} ref={root} data-mf-motion={motion} data-mf-playing={playing ? 'true' : 'false'} data-mf-lang={language} aria-labelledby={titleId}>
      <div className="mf-header">
        <Heading className="mf-heading" id={titleId}>
          {text(<><span>Inside</span><span>manufacturing</span></>, <><span>走进</span><span>岷河制造</span></>)}
          <HeadingEnglish lang={lang}>Inside manufacturing</HeadingEnglish>
        </Heading>
        <div className="mf-introduction">
          <p>{text('From the production floor to the laboratory.', '从生产车间，到检验现场。')}</p>
          {!full && <a className="mf-link" href={routeHref('/manufacturing',language)} onClick={event => navigate(event, '/manufacturing')}>{text('Manufacturing process', '制造流程')}<span className="mf-link-mark" aria-hidden="true">+</span></a>}
        </div>
      </div>

      <div className="mf-frame" ref={frame} style={{ '--mf-count': views.length, '--mf-selected': active }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onPointerDownCapture={() => setFocused(false)} onFocusCapture={event => setFocused(event.target.matches(':focus-visible'))}
        onKeyDownCapture={() => setFocused(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}>
        <div className="mf-stage">
          {motion === 'static' && <img className="mf-static-photograph" src={`/assets/company/${views[active].file}`} alt={views[active].alt[language]} style={{ objectPosition: views[active].position }} draggable="false" />}
          <div className="mf-depth" aria-hidden={motion === 'static' ? true : undefined}>
            {views.map((view, index) => (
              <div className={`mf-panel${active === index ? ' mf-is-active' : ''}`} key={view.id} aria-hidden={active !== index}>
                <img className="mf-photograph" src={`/assets/company/${view.file}`} alt={view.alt[language]} style={{ objectPosition: view.position }} decoding="async" draggable="false" />
              </div>
            ))}
          </div>
          <span className="mf-photo-shade" aria-hidden="true" />
          <button className="mf-photo-button" type="button" aria-label={text(`Enlarge photograph: ${views[active].title.en}`, `放大照片：${views[active].title.zh}`)} onClick={() => onPhoto?.(views[active].file)}>
            <span className="mf-enlarge" aria-hidden="true">{text('Enlarge', '查看大图')}</span>
          </button>
          <div className="mf-caption" ref={caption}><h3 className="mf-caption-title">{views[active].title[language]}</h3></div>
          {motion === 'ambient' && <button className="mf-play" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? text('Play sequence', '继续播放') : text('Pause sequence', '暂停播放')}</button>}
        </div>

        <div className="mf-selectors" ref={selectors} role="group" aria-label={text('Manufacturing photographs', '制造影像')} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const focused = [...selectors.current.querySelectorAll('button')].indexOf(document.activeElement);
          const index = focused < 0 ? active : focused;
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? views.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + views.length) % views.length;
          select(next);
          selectors.current.querySelectorAll('button')[next]?.focus({ preventScroll: true });
        }}>
          {views.map((view, index) => <button className="mf-selector" key={view.id} type="button" aria-pressed={active === index} onClick={() => select(index)}><span>{view.label[language]}</span><span className="mf-selector-sign" aria-hidden="true">{active === index ? '−' : '+'}</span></button>)}
          <span className="mf-selector-line" aria-hidden="true"><span className="mf-progress" ref={progress} /></span>
        </div>
      </div>

    </section>
  );
}
