import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './manufacturing-story.css';

// The sequence uses company photographs, not generated footage. Captions only
// describe the equipment and work visible in each image; no process performance
// or certification is inferred from a photograph.
const chapters = [
  {
    id: 'material', file: 'tube-making.webp', position: '50% 62%',
    title: { en: 'Material', zh: '原料' },
    caption: { en: 'Stainless steel coils. The start of the line.', zh: '不锈钢卷料，走进制管车间。' },
    alt: { en: 'Stainless steel coils and tube production equipment in the MH PIPE workshop.', zh: '岷河车间内的不锈钢卷料与制管设备。' },
  },
  {
    id: 'forming', file: 'forming.webp', position: '50% 49%',
    title: { en: 'Forming', zh: '成型' },
    caption: { en: 'A closer view of the forming workstation.', zh: '走近成型设备与生产工位。' },
    alt: { en: 'An MH PIPE operator beside forming equipment in the workshop.', zh: '岷河工作人员与车间内的成型设备。' },
  },
  {
    id: 'inspection', file: 'laboratory.webp', position: '50% 53%',
    title: { en: 'Inspection', zh: '检验' },
    caption: { en: 'From the workshop to the laboratory.', zh: '从生产现场，到实验室。' },
    alt: { en: 'MH PIPE laboratory staff working with testing equipment.', zh: '岷河实验室内操作检验设备的工作人员。' },
  },
  {
    id: 'marking', file: 'laser-marking.webp', position: '50% 50%',
    title: { en: 'Marking', zh: '标识' },
    caption: { en: 'Product marking on the workshop floor.', zh: '生产现场的激光打标工位。' },
    alt: { en: 'An MH PIPE operator at the laser marking workstation.', zh: '岷河工作人员操作激光打标设备。' },
  },
];

const FACILITY_FILE = 'facility-rendering-refined.png';
const HOLD_SECONDS = 6.8;

export default function ManufacturingStory({ lang = 'en', go, onPhoto }) {
  const language = lang === 'zh' ? 'zh' : 'en';
  const text = (en, zh) => language === 'zh' ? zh : en;
  const headingId = useId();
  const windowId = useId();
  const root = useRef(null);
  const frame = useRef(null);
  const navigation = useRef(null);
  const progress = useRef(null);
  const facility = useRef(null);
  const timeline = useRef(null);
  const transit = useRef(null);
  const clock = useRef(null);
  const choose = useRef(null);
  const selected = useRef(0);
  const running = useRef(false);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [inView, setInView] = useState(false);
  const [pageActive, setPageActive] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [travelling, setTravelling] = useState(false);
  const playing = !reduced && inView && pageActive && !hovered && !focused && !paused && !dialogOpen;
  running.current = playing;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const readMotion = () => setReduced(query.matches || !window.gsap);
    readMotion();
    query.addEventListener('change', readMotion);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= .32), { threshold: [0, .32] });
    observer.observe(frame.current);
    const hide = () => setPageActive(false);
    const show = () => setPageActive(!document.hidden);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    document.addEventListener('visibilitychange', show);
    const readDialog = () => setDialogOpen(Boolean(document.querySelector('.modal-backdrop, dialog[open], [aria-modal="true"]')) || document.body.style.overflow === 'hidden');
    readDialog();
    // Only the modal host/body is observed, not GSAP's per-frame style writes.
    const dialogObserver = new MutationObserver(readDialog);
    dialogObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'aria-modal'] });
    const bodyObserver = new MutationObserver(readDialog);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => {
      query.removeEventListener('change', readMotion);
      observer.disconnect();
      dialogObserver.disconnect();
      bodyObserver.disconnect();
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
      document.removeEventListener('visibilitychange', show);
    };
  }, []);

  useLayoutEffect(() => {
    if (reduced || !window.gsap) {
      choose.current = index => {
        selected.current = index;
        setActive(index);
        setTravelling(false);
      };
      return () => { choose.current = null; };
    }
    const g = window.gsap;
    const panels = [...root.current.querySelectorAll('.ms-panel')];
    const images = panels.map(panel => panel.querySelector('.ms-photograph'));
    const captions = [...root.current.querySelectorAll('.ms-caption-line')];
    const context = g.context(() => {}, root);
    context.add(() => {
      g.set(panels, { clipPath: index => index ? 'inset(0% 0% 0% 100%)' : 'inset(0% 0% 0% 0%)', visibility: 'visible' });
      g.set(images, { xPercent: 0, scale: 1.04 });
      g.set(captions, { yPercent: index => index ? 105 : 0, autoAlpha: index => index ? 0 : 1 });
      const master = g.timeline({ paused: true });
      master.addLabel('chapter-0', 0);
      for (let index = 1; index < chapters.length; index++) {
        const start = index - 1;
        master
          .fromTo(panels[index], { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut', immediateRender: false }, start)
          .fromTo(images[index], { xPercent: 9, scale: 1.1 }, { xPercent: 0, scale: 1.04, duration: 1, ease: 'power2.inOut', immediateRender: false }, start)
          .to(images[index - 1], { xPercent: -5, duration: 1, ease: 'power2.inOut' }, start)
          .to(captions[index - 1], { yPercent: -105, autoAlpha: 0, duration: .35, ease: 'power2.in' }, start)
          .fromTo(captions[index], { yPercent: 105, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .5, ease: 'power3.out', immediateRender: false }, start + .5)
          .addLabel(`chapter-${index}`, index);
      }
      timeline.current = master;
      master.time(selected.current, false);
      context.add('selectChapter', index => {
        const distance = Math.abs(index - master.time());
        selected.current = index;
        setActive(index);
        transit.current?.kill();
        clock.current?.kill();
        setTravelling(distance > .002);
        if (distance <= .002) return;
        // A single playhead makes reverse navigation and rapid choices retrace
        // the same reveal rather than restarting a new opacity transition.
        transit.current = master.tweenTo(index, {
          duration: Math.min(1.85, .95 + distance * .22),
          ease: 'power2.inOut',
          onComplete: () => setTravelling(false),
        });
      });
      choose.current = context.selectChapter;
      const ScrollTrigger = window.ScrollTrigger;
      if (ScrollTrigger) {
        g.registerPlugin(ScrollTrigger);
        g.fromTo(root.current.querySelector('.ms-heading-last'), { xPercent: 6 }, {
          xPercent: 0, ease: 'none',
          scrollTrigger: { trigger: root.current.querySelector('.ms-header'), start: 'top bottom', end: 'bottom center', scrub: 1 },
        });
        // Scroll opens the facility view in place; it never pins or repositions
        // the page. The same timeline contracts again when scrolling back.
        const opening = g.timeline({ scrollTrigger: { trigger: facility.current, start: 'top 92%', end: 'top 12%', scrub: 1.05 } });
        opening
          .fromTo(root.current.querySelector('.ms-facility-frame'), { clipPath: 'inset(0% 7.5% 0% 7.5%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' }, 0)
          .fromTo(root.current.querySelector('.ms-facility-image'), { scale: 1.085, yPercent: -3 }, { scale: 1, yPercent: 0, duration: 1, ease: 'none' }, 0);
      }
    });
    return () => {
      choose.current = null;
      transit.current?.kill();
      timeline.current = null;
      context.revert();
    };
  }, [reduced]);

  useLayoutEffect(() => {
    if (reduced || travelling || !window.gsap) return undefined;
    const timer = window.gsap.fromTo(progress.current, { scaleX: 0 }, {
      scaleX: 1, duration: HOLD_SECONDS, ease: 'none', paused: !running.current,
      onComplete: () => choose.current?.((selected.current + 1) % chapters.length),
    });
    clock.current = timer;
    return () => { timer.kill(); if (clock.current === timer) clock.current = null; };
  }, [active, reduced, travelling]);

  useEffect(() => { clock.current?.paused(!playing); }, [playing]);

  // Manual chapter travel remains responsive to a hovered/focused control;
  // passive travel pauses for hidden pages, modals or an offscreen window.
  useEffect(() => {
    transit.current?.paused(!inView || !pageActive || dialogOpen);
  }, [inView, pageActive, dialogOpen]);

  const select = index => {
    if (index === selected.current) {
      clock.current?.restart().paused(!running.current);
      return;
    }
    choose.current?.(Math.max(0, Math.min(chapters.length - 1, index)));
  };

  const navigate = event => {
    if (!go || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go('/manufacturing');
  };

  return (
    <section className="ms-root" ref={root} data-ms-lang={language} data-ms-reduced={reduced ? 'true' : 'false'} data-ms-playing={playing ? 'true' : 'false'} data-ms-active={chapters[active].id} aria-labelledby={headingId}>
      <header className="ms-header">
        <h2 className="ms-heading" id={headingId}>
          <span>{text('From material.', '从材料，')}</span>
          <span className="ms-heading-last">{text('To product.', '到成品。')}</span>
        </h2>
        <div className="ms-header-note">
          <p>{text('Inside MH PIPE manufacturing.', '走进岷河制造。')}</p>
          <a href={`/manufacturing?lang=${language}`} onClick={navigate}>{text('Explore the factory', '了解制造现场')}<span aria-hidden="true">＋</span></a>
        </div>
      </header>

      <div className="ms-process" ref={frame}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onPointerDownCapture={() => setFocused(false)}
        onFocusCapture={event => setFocused(event.target.matches(':focus-visible'))}
        onKeyDownCapture={() => setFocused(true)}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <div className="ms-observation-window" id={windowId}>
          {reduced && <img className="ms-static-photo" src={`/assets/company/${chapters[active].file}`} alt="" aria-hidden="true" style={{ objectPosition: chapters[active].position }} draggable="false" decoding="async" />}
          <div className="ms-scene-stack" aria-hidden="true">
            {chapters.map((chapter, index) => (
              <div className={`ms-panel${active === index ? ' ms-panel-current' : ''}`} key={chapter.id} style={{ zIndex: index + 1 }}>
                <img className="ms-photograph" src={`/assets/company/${chapter.file}`} alt="" style={{ objectPosition: chapter.position }} draggable="false" decoding="async" />
              </div>
            ))}
          </div>
          <div className="ms-shade" aria-hidden="true" />
          {reduced && <div className="ms-caption ms-static-caption" aria-hidden="true"><p>{chapters[active].caption[language]}</p></div>}
          <div className="ms-caption ms-animated-caption" aria-hidden="true">
            {chapters.map((chapter, index) => <p className={`ms-caption-line${active === index ? ' ms-caption-current' : ''}`} key={chapter.id}>{chapter.caption[language]}</p>)}
          </div>
          <button className="ms-view-photo" type="button" onClick={() => onPhoto?.(chapters[active].file)} aria-label={text(`Enlarge photograph: ${chapters[active].alt.en}`, `放大照片：${chapters[active].alt.zh}`)}><span>{text('View photograph', '查看照片')}</span></button>
          {!reduced && <button className="ms-play-toggle" type="button" aria-pressed={paused} aria-label={paused ? text('Resume chapter playback', '继续章节播放') : text('Pause chapter playback', '暂停章节播放')} onClick={() => setPaused(value => !value)}>
            {paused ? text('Play', '播放') : text('Pause', '暂停')}
          </button>}
        </div>
        <div className="ms-chapters" ref={navigation} role="group" aria-label={text('Manufacturing chapters', '制造章节')} style={{ '--ms-active': active }} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const buttons = [...navigation.current.querySelectorAll('button')];
          const index = Math.max(0, buttons.indexOf(document.activeElement));
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? chapters.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + chapters.length) % chapters.length;
          select(next);
          buttons[next].focus({ preventScroll: true });
        }}>
          {chapters.map((chapter, index) => <button className="ms-chapter" type="button" key={chapter.id} aria-pressed={active === index} aria-controls={windowId} onClick={() => select(index)}><span className="ms-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{chapter.title[language]}</span></button>)}
          <span className="ms-progress-slot" aria-hidden="true"><span ref={progress} /></span>
        </div>
        <p className="ms-accessible-caption" aria-live={focused || paused ? 'polite' : 'off'}>{chapters[active].alt[language]}</p>
      </div>

      <figure className="ms-facility" ref={facility}>
        <figcaption className="ms-facility-heading">
          <h3>{text('The MH PIPE site.', '岷河厂区。')}</h3>
        </figcaption>
        <button className="ms-facility-frame" type="button" onClick={() => onPhoto?.(FACILITY_FILE)} aria-label={text('Enlarge the MH PIPE facility rendering', '放大岷河厂区效果图')}>
          <img className="ms-facility-image" src={`/assets/company/${FACILITY_FILE}`} alt={text('Visually refined architectural rendering of the MH PIPE facility, including translucent planned building volumes.', '经视觉优化的岷河厂区建筑效果图，含以半透明体块表达的规划建筑。')} loading="lazy" decoding="async" draggable="false" />
          <span className="ms-facility-tag">{text('Facility rendering · retouched', '厂区效果图 · 视觉优化')}</span>
        </button>
      </figure>
    </section>
  );
}
