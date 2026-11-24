import React, {useEffect, useRef, useState} from 'react';
import {Rotate3d} from 'lucide-react';
import './thick-wall-study.css';

const mediaPath = '/assets/product-series/thick-wall-';
const motionQuery = '(prefers-reduced-motion: reduce)';

export default function ThickWallStudy({lang = 'en'}) {
  const zh = lang === 'zh';
  const host = useRef(null);
  const player = useRef(null);
  const [reduced, setReduced] = useState(() => window.matchMedia(motionQuery).matches);
  const [pose, setPose] = useState(() => reduced ? 'end' : 'side');
  const [target, setTarget] = useState('end');
  const [playing, setPlaying] = useState(false);
  const moving = target !== pose;

  useEffect(() => {
    const media = window.matchMedia(motionQuery);
    const onChange = () => setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!moving) return;
    const video = player.current;
    function settle() {
      setPlaying(false);
      setPose(target);
    }
    if (reduced || !video) {
      settle();
      return;
    }

    let visible = false;
    let disposed = false;
    function syncPlayback() {
      if (visible && !document.hidden) {
        video.play().catch(error => {
          // A visibility change can cancel a pending play without losing its progress.
          if (!disposed && error.name !== 'AbortError') settle();
        });
      } else {
        video.pause();
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, {threshold: 0.06});
    observer.observe(host.current);
    document.addEventListener('visibilitychange', syncPlayback);
    video.addEventListener('ended', settle);
    video.addEventListener('error', settle);
    if (video.error) settle();
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      video.removeEventListener('ended', settle);
      video.removeEventListener('error', settle);
      video.pause();
    };
  }, [reduced, moving, target]);

  const returnToSide = pose === 'end';
  const action = returnToSide
    ? (zh ? '转至管身侧面' : 'Turn to the side view')
    : (zh ? '查看管端尺寸' : 'View the pipe-end dimensions');
  return <div ref={host} className="wall-study" data-pose={pose} data-moving={moving}
      role="group" aria-label={zh ? '厚壁管端截面示意' : 'Illustrated thick-wall pipe section'}>
    <div className="wall-film-frame">
      {['side','end'].map(view => <img key={view} className="wall-film-poster"
        data-current={pose === view} src={mediaPath + view + '.webp'}
        alt="" draggable="false" decoding="async"/>)}
      {moving && !reduced && <video key={target} ref={player} className="wall-film"
        data-playing={playing} src={mediaPath + (target === 'end' ? 'to-end' : 'to-side') + '.mp4'}
        preload="none" muted playsInline aria-hidden="true" onPlaying={() => setPlaying(true)}/>}
      <div className="wall-dimensions" aria-hidden={moving || pose !== 'end'}>
        {/* Witnesses attach to the projected upper/lower outside edges and to both edges of the cut wall. */}
        <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
          <g className="wall-witnesses">
            <path d="M674 151H329 M674 729H329"/>
          </g>
          <g className="wall-measures">
            <path d="M343 151V729 M336 158l14-14 M336 736l14-14"/>
            <path d="M832 284L880 233 927 177H1003"/>
            <path d="M826 278l12 12 M874 227l12 12"/>
          </g>
        </svg>
        <span className="wall-label wall-label-od">{zh ? '外径' : 'Outside diameter'}</span>
        <span className="wall-label wall-label-thickness">{zh ? '壁厚' : 'Wall thickness'}</span>
      </div>
      <button type="button" className="wall-turn" aria-label={action} title={action}
        aria-disabled={moving} onClick={() => {
          if (moving) return;
          setPlaying(false);
          setTarget(returnToSide ? 'side' : 'end');
        }}>
        <Rotate3d size={23} strokeWidth={1.45} aria-hidden="true"/>
      </button>
    </div>
  </div>;
}
