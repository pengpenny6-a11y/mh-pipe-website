import React, {useEffect, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight, Pause, Play} from 'lucide-react';
import HeadingEnglish from './HeadingEnglish.jsx';
import source from '../public/assets/partners/SOURCES.json';
import './home-partner-wall.css';

const perGroup = 10;
const groups = Math.ceil(source.logos.length / perGroup);
const [sheetWidth, sheetHeight] = source.source_dimensions;
const sheet = '/assets/partners/' + source.asset;
const wrap = value => ((value % groups) + groups) % groups;
const belt = Array.from({length:3 * groups * perGroup}, (_, i) => source.logos[i % source.logos.length]);

function Mark({partner, lang, visible}) {
  const {x, y, width, height} = partner.crop;
  return <li className="pw-tile" aria-hidden={!visible || undefined} title={partner[lang]}>
    <span className="pw-mark" style={{aspectRatio:width+'/'+height}}>
      <img src={sheet} alt={lang === 'zh' ? partner.zh : ''} width={sheetWidth} height={sheetHeight}
        decoding="async" loading="lazy" draggable="false" style={{
          width:100*sheetWidth/width+'%', height:100*sheetHeight/height+'%',
          left:-100*x/width+'%', top:-100*y/height+'%'
        }}/>
    </span>
    {lang === 'en' && <span className="pw-name">{partner.en}</span>}
  </li>;
}

export default function HomePartnerWall({lang}) {
  const section = useRef(null);
  const track = useRef(null);
  const movement = useRef(null);
  const destination = useRef(0);
  const [group, setGroup] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(false);
  const [reading, setReading] = useState(false);
  const [focused, setFocused] = useState(false);
  const zh = lang === 'zh';

  function advance(direction) {
    const rail = track.current;
    const next = wrap(destination.current + direction);
    destination.current = next;
    const width = rail.getBoundingClientRect().width;
    // Read the actual presentation position so an interrupted glide starts exactly there.
    const matrix = new DOMMatrixReadOnly(getComputedStyle(rail).transform);
    const current = width ? -matrix.m41 / width : groups + group;
    movement.current?.cancel();
    setGroup(next);
    rail.style.setProperty('--position', groups + next);
    if (reduced || !width) return;
    const start = groups + wrap(current);
    const delta = next - wrap(current);
    const distance = delta - Math.round(delta / groups) * groups;
    if (Math.abs(distance) < .001) return;
    const offset = n => 'translateX(' + (-100 * n) + '%)';
    movement.current = rail.animate([{transform:offset(start)}, {transform:offset(start + distance)}], {
      duration:Math.min(850, 400 + 240 * Math.abs(distance)),
      easing:'cubic-bezier(.25,.72,.22,1)', fill:'backwards'
    });
  }
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => setReduced(preference.matches);
    let intersects = false;
    const update = () => setVisible(intersects && !document.hidden);
    const observer = new IntersectionObserver(entries => {
      intersects = entries.at(-1).isIntersecting;
      update();
    }, {threshold:.12});
    observer.observe(section.current);
    preference.addEventListener('change', motionChange);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', motionChange);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    if (reduced || !visible) movement.current?.cancel();
    return () => movement.current?.cancel();
  }, [reduced, visible]);

  const playing = visible && !paused && !reduced && !reading && !focused;
  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => advance(1), 5200);
    return () => clearInterval(interval);
  }, [playing]);

  const position = String(group + 1).padStart(2,'0')+' / '+String(groups).padStart(2,'0');
  return <section className="pw-section" id="partners" data-scroll-align="start" ref={section} data-in-view={visible} aria-labelledby="pw-title"
      onPointerEnter={e => {if (e.pointerType !== 'touch') setReading(true);}}
      onPointerLeave={() => setReading(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={e => {if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);}}>
    <header className="pw-heading">
      <h2 className="home-chapter-title" id="pw-title">
        {zh ? '战略合作伙伴' : 'Strategic partners'}
        <HeadingEnglish lang={lang}>Strategic partners</HeadingEnglish>
      </h2>
      <div className="pw-controls" role="group" aria-label={zh ? '浏览合作伙伴' : 'Browse partners'}>
        <button aria-controls="pw-wall" aria-label={zh ? '上一组合作伙伴' : 'Previous partners'}
          type="button" onClick={() => advance(-1)}><ChevronLeft aria-hidden="true"/></button>
        <span className="pw-position" aria-live={playing ? 'off' : 'polite'}>{position}</span>
        <button aria-controls="pw-wall" aria-label={zh ? '下一组合作伙伴' : 'Next partners'}
          type="button" onClick={() => advance(1)}><ChevronRight aria-hidden="true"/></button>
        {!reduced && <button className="pw-playback" type="button" aria-controls="pw-wall" aria-label={
          paused ? (zh?'继续轮播':'Resume rotation') : (zh?'暂停轮播':'Pause rotation')
        } onClick={() => setPaused(value => !value)}>
          {paused ? <Play aria-hidden="true"/> : <Pause aria-hidden="true"/>}
        </button>}
      </div>
    </header>
    <div className="pw-gallery">
      <div id="pw-wall" className="pw-window">
        <ul className="pw-marks" ref={track} style={{'--position':groups + group}}>
          {belt.map((partner,i) => {
            const active = Math.floor(i / perGroup) === groups + group;
            return <Mark key={i} partner={partner} lang={lang} visible={active}/>;
          })}
        </ul>
      </div>

    </div>
  </section>;
}
