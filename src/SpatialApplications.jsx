import {routeHref} from './site-routes.js';
import React, {lazy, Suspense, useCallback, useEffect, useId, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import ApplicationSceneRail from './ApplicationSceneRail.jsx';
import {useApplicationTour} from './useApplicationTour.js';
import {areas, destination, ids, initialScene} from './application-areas.js';
import {DOMESTIC_PLATES} from './application-domestic-plates.js';
import {TECHNICAL_PLATES} from './application-technical-plates.js';
import {FIRE_GAS_PLATES} from './application-fire-gas-plates.js';
import {useApplicationOrbitHandoff} from './useApplicationOrbitHandoff.js';
import './spatial-applications.css';

const Orbit = lazy(() => import('./ApplicationOrbit.jsx').catch(() => ({default: StaticOverview})));
const plates = {...DOMESTIC_PLATES, ...TECHNICAL_PLATES, ...FIRE_GAS_PLATES};
const plateUrl = id => '/assets/applications/plates/' + id + '.webp';
const fallbackUrl = id => '/assets/applications/scene-' + id + '.webp';
const decoded = new Map();

function StaticOverview({id, lang, onReady}) {
  const finish = () => onReady('fallback');
  return <div className="orbit-stage" data-renderer="fallback">
    <img className="orbit-fallback" src={fallbackUrl(id)} alt="" onLoad={finish} onError={finish}/>
    <p className="orbit-status">{lang === 'zh' ? '当前设备显示静态管路图' : 'Static pipework view on this device'}</p>
  </div>;
}

function loadPlate(id) {
  if (!decoded.has(id)) {
    const picture = new Image();
    picture.src = plateUrl(id);
    const promise = picture.decode().then(() => true, () => {
      decoded.delete(id);
      return false;
    });
    decoded.set(id, promise);
  }
  return decoded.get(id);
}

function Illustration({id, current, lang, activeRoute, onRoute, pinned, onPin}) {
  const [failed, setFailed] = useState(false);
  const paths = plates[id]?.paths || [];
  const heading = areas.find(item => item.id === id).name[lang];
  return <div className="app-plate" data-plate={id} data-current={current} data-fallback={failed} aria-hidden={!current} inert={!current}>
    <img className="app-plate-image" src={failed ? fallbackUrl(id) : plateUrl(id)}
      alt={heading} draggable={false} onError={() => setFailed(true)}/>
    {!failed && <svg className="app-routes" viewBox="0 0 1000 562.5" preserveAspectRatio="xMidYMin slice"
      aria-label={lang === 'zh' ? '管路走向' : 'Pipe routes'}>
      {paths.map((d, index) => <g key={index} data-emphasis={current && activeRoute === index}
          style={{'--flow-delay': (index === 0 ? 0 : 0.9 + index * 0.22) + 's'}}>
        <path className="app-route-lit" d={d} aria-hidden="true"/>
        <path className="app-route-glint" d={d} pathLength="100" aria-hidden="true"/>
        <path className="app-route-hit" d={d} role="button" tabIndex={current ? 0 : -1}
          aria-label={(lang === 'zh' ? '高亮管路 ' : 'Highlight pipe route ') + (index + 1)}
          aria-pressed={pinned === index}
          onPointerEnter={e => { if(e.pointerType !== 'touch') onRoute(index); }}
          onPointerLeave={() => onRoute(null)} onFocus={() => onRoute(index)} onBlur={() => onRoute(null)}
          onClick={() => onPin(index)} onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPin(index); }
            if (e.key === 'Escape') { onPin(null); onRoute(null); e.currentTarget.blur(); }
          }}/>
      </g>)}
    </svg>}
  </div>;
}

export default function SpatialApplications({lang='en', go, sceneRequest, onSceneChange, matchMarker, holdTour=false}) {
  const uid = useId();
  const root = useRef(null);
  const spread = useRef(null);
  const viewRef = useRef('plate');
  const camera = useRef(null);
  const drag = useRef(null);
  const request = useRef(0);
  const [frame, setFrame] = useState(() => ({id: initialScene(), before: null, take: 0}));
  const [orbitId, setOrbitId] = useState(null);
  const [orbitDrag, setOrbitDrag] = useState(false);
  const [linkHover, setLinkHover] = useState(false);
  const [hover, setHover] = useState(null);
  const [pin, setPin] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const {view, progressRef, enter, leave, onReady, advance} = useApplicationOrbitHandoff(root, reduced);
  viewRef.current = view;
  const orbit = view !== 'plate';
  const current = areas.find(item => item.id === frame.id);
  const zh = lang === 'zh';
  const activeRoute = hover ?? pin;
  const observing = pin !== null || focused || dragging || orbitDrag || linkHover;
  const playing = visible && enabled && ready && !observing && !busy && !holdTour && !reduced;

  const choose = useCallback(async id => {
    if (!ids.includes(id)) return;
    const ticket = ++request.current;
    setBusy(true);
    await loadPlate(id);
    if (ticket !== request.current) return;
    setBusy(false);
    setHover(null);
    setPin(null);
    setDragging(false);
    setOrbitDrag(false);
    const previousView = viewRef.current;
    setFrame(old => ({id, before: old.id !== id && previousView !== 'orbit' ? old.id : null, take: old.take + 1}));
    advance();
    const url = new URL(location.href);
    url.searchParams.set('scene', id);
    history.replaceState(history.state, '', url);
  }, [advance]);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      const flags = document.documentElement.dataset;
      setEnabled(!document.hidden && flags.booting !== 'true' &&
        flags.navOpen !== 'true' && flags.dialogOpen !== 'true');
    };
    const syncMedia = () => setReduced(media.matches);
    const locationChanged = () => choose(initialScene());
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .30),
      {threshold: [0,.30]});
    observer.observe(spread.current);
    const events = ['mh-intro-ready','mh-navigation-change','mh-dialog-change'];
    for (const event of events) window.addEventListener(event, syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    window.addEventListener('popstate', locationChanged);
    media.addEventListener('change', syncMedia);
    syncMotion();
    return () => {
      ++request.current;
      observer.disconnect();
      for (const event of events) window.removeEventListener(event, syncMotion);
      document.removeEventListener('visibilitychange', syncMotion);
      window.removeEventListener('popstate', locationChanged);
      media.removeEventListener('change', syncMedia);
    };
  }, [choose]);

  useEffect(() => {
    if (sceneRequest?.id) choose(sceneRequest.id);
  }, [sceneRequest, choose]);

  useEffect(() => { onSceneChange?.(frame.id); }, [frame.id, onSceneChange]);

  useEffect(() => {
    let cancelled = false;
    loadPlate(frame.id).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [frame.id]);

  useEffect(() => {
    if (!visible) return;
    loadPlate(ids[(ids.indexOf(frame.id) + 1) % ids.length]);
  }, [visible, frame.id]);

  function openOrbit() {
    setHover(null);
    setPin(null);
    setOrbitId(frame.id);
    enter();
  }

  useApplicationTour({
    take: frame.take, view, running: playing, reduced,
    onEnter: openOrbit,
    onNext: () => choose(ids[(ids.indexOf(frame.id) + 1) % ids.length]),
  });

  useEffect(() => {
    if (!frame.before) return;
    const timer = setTimeout(() => setFrame(old => ({...old, before: null})), reduced ? 0 : 560);
    return () => clearTimeout(timer);
  }, [frame.before, frame.take, reduced]);

  useEffect(() => {
    if (!orbitDrag) return;
    const release = () => setOrbitDrag(false);
    const events = ['pointerup', 'pointercancel', 'blur'];
    events.forEach(type => window.addEventListener(type, release));
    return () => events.forEach(type => window.removeEventListener(type, release));
  }, [orbitDrag]);

  function returnToPlate() {
    const viewportFocused = root.current?.querySelector('.app-orbit-view')?.contains(document.activeElement);
    if (viewportFocused) root.current.querySelector('[data-scene-choice][aria-current="true"]')?.focus({preventScroll: true});
    leave();
  }

  function startPan(event) {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('.app-route-hit')) return;
    setPin(null);
    drag.current = {id:event.pointerId,x:event.clientX,y:event.clientY};
  }

  function movePan(event) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX-start.x, dy = event.clientY-start.y;
    if (!dragging && Math.abs(dx) < 6) return;
    if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) { finishPan(event); return; }
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    if (!reduced) camera.current.style.transform =
      'translate('+Math.max(-10,Math.min(10,dx*.045))+'px,'+Math.max(-6,Math.min(6,dy*.035))+'px) scale(1.018)';
  }

  function finishPan(event) {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (camera.current) camera.current.style.transform = '';
    setDragging(false);
  }

  const link = destination(frame.id) + '&lang=' + lang;
  return <section id="applications" className="pa-root pa-spatial" data-scroll-align="start" ref={root} data-scene={frame.id} data-view={view}
      data-playing={playing} data-observing={observing} data-animate={visible && enabled && !reduced && !orbit}
      aria-labelledby={uid+'-title'}
      onPointerDownCapture={() => setFocused(false)}
      onFocusCapture={e => setFocused(e.target.matches(':focus-visible'))}
      onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
      onKeyDown={e => { if (e.key === 'Escape' && orbit) { e.preventDefault(); returnToPlate(); } }}>
    <header className="app-directory">
      <h2 className="home-chapter-title" id={uid+'-title'}>{zh?'应用领域':'Applications'}<HeadingEnglish lang={lang}>Applications</HeadingEnglish></h2>
      <ApplicationSceneRail lang={lang} activeId={frame.id} onSelect={choose}/>
    </header>
    <div className="app-spread" ref={spread}>
      <div className="app-art" inert={orbit} onPointerDown={startPan} onPointerMove={movePan}
        onPointerUp={finishPan} onPointerCancel={finishPan}
        onPointerLeave={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) finishPan(event); }}>
        <div className="app-camera" ref={camera} data-dragging={dragging}>
          {[frame.before,frame.id].filter(Boolean).map(id => <Illustration key={id} id={id} current={id===frame.id}
            lang={lang} activeRoute={activeRoute} onRoute={setHover} pinned={pin}
            onPin={index=>setPin(old=>old===index?null:index)}/>)}
        </div>
      </div>
      <div className="app-caption" hidden={view === 'orbit'} inert={orbit} data-changing={Boolean(frame.before)}>
        <div className="app-typeset" key={frame.id}>
          <div className="app-heading">
            <h3 data-long={current.name[lang].length > (zh?4:13)}>{current.name[lang]}<HeadingEnglish lang={lang}>{current.name.en}</HeadingEnglish></h3>
          </div>
          <p className="app-copy">{current.copy[lang]}</p>
        </div>
        <a className="app-solution" href={routeHref(link)} onPointerEnter={()=>setLinkHover(true)} onPointerLeave={()=>setLinkHover(false)}
           onClick={e=>{if(go&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();go(destination(frame.id));}}}>
          {zh?'了解方案':'View solution'}
        </a>
      </div>
      {reduced && <button type="button" className="app-view-toggle"
          onClick={() => orbit ? returnToPlate() : openOrbit()}>
        {orbit ? (zh?'返回场景':'Back to scene') : (zh?'查看三维管路':'View 3D pipework')}
      </button>}
      {orbit && <div className="app-orbit-shell" role="region" aria-label={current.name[lang] + (zh?'三维管路':' 3D pipework')}>
        <div className="app-orbit-view" inert={view !== 'orbit'} aria-busy={view === 'loading'}
            onPointerDownCapture={() => setOrbitDrag(true)}>
          <Suspense fallback={null}>
            <Orbit key={orbitId} id={orbitId} lang={lang} progressRef={progressRef} onReady={onReady}/>
          </Suspense>
        </div>
      </div>}
      {matchMarker}
    </div>
  </section>;
}
