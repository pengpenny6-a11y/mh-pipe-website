import {useCallback, useEffect, useRef, useState} from 'react';

function smoothRange(value, start, end) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

// The section compositor and the Three.js camera sample the same reversible playhead.
// Keep DOM updates out of React's render loop and keep the plate visible until a real frame is ready.
export function useApplicationOrbitHandoff(root, reduced) {
  const [view, setView] = useState('plate');
  const state = useRef('plate');
  const progressRef = useRef({current: 0, wake: null}).current;
  const animation = useRef(0);
  const staticView = useRef(false);
  const opacity = useRef(0);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const publish = useCallback(next => {
    state.current = next;
    setView(next);
  }, []);

  const apply = useCallback(value => {
    progressRef.current = value;
    const style = root.current?.style;
    opacity.current = staticView.current ? smoothRange(value, 0, 1) : smoothRange(value, .06, .36);
    if (style) {
      style.setProperty('--orbit-opacity', opacity.current.toFixed(4));
      style.setProperty('--plate-type-opacity', (1 - smoothRange(value, 0, .22)).toFixed(4));
      style.setProperty('--overview-backdrop', smoothRange(value, .35, .90).toFixed(4));
    }
    progressRef.wake?.();
  }, [root, progressRef]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animation.current);
    animation.current = 0;
    apply(0);
    publish('plate');
  }, [apply, publish]);

  const travel = useCallback(target => {
    cancelAnimationFrame(animation.current);
    const from = progressRef.current;
    const finish = () => {
      if (target === 0) reset();
      else { apply(1); publish('orbit'); }
    };
    if (reducedRef.current || Math.abs(target - from) < .002) { finish(); return; }
    publish(target === 1 ? 'entering' : 'leaving');
    const duration = (staticView.current ? 340 : 1150) * Math.abs(target - from);
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / duration);
      apply(from + (target - from) * t);
      if (t < 1 && !reducedRef.current) animation.current = requestAnimationFrame(step);
      else finish();
    };
    animation.current = requestAnimationFrame(step);
  }, [apply, publish, reset]);

  const enter = useCallback(() => {
    if (state.current !== 'plate') return;
    staticView.current = false;
    apply(0);
    publish('loading');
  }, [apply, publish]);

  const onReady = useCallback(status => {
    if (state.current !== 'loading') return;
    staticView.current = status === 'fallback';
    travel(1);
  }, [travel]);

  const leave = useCallback(() => {
    if (state.current === 'loading') reset();
    else if (state.current === 'orbit' || state.current === 'entering') travel(0);
  }, [reset, travel]);

  // The next photograph is already decoded and mounted underneath the outgoing
  // model. Hold its camera here so the tour moves directly to the new location.
  const advance = useCallback(() => {
    cancelAnimationFrame(animation.current);
    const from = opacity.current;
    if (from < .01 || reducedRef.current) { reset(); return; }
    publish('advancing');
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / 480);
      opacity.current = from * (1 - smoothRange(t, 0, 1));
      root.current?.style.setProperty('--orbit-opacity', opacity.current.toFixed(4));
      root.current?.style.setProperty('--plate-type-opacity', (1-opacity.current).toFixed(4));
      if (t < 1 && !reducedRef.current) animation.current = requestAnimationFrame(step);
      else reset();
    };
    animation.current = requestAnimationFrame(step);
  }, [publish, reset, root]);

  useEffect(() => () => { cancelAnimationFrame(animation.current); }, []);
  return {view, progressRef, enter, onReady, leave, advance};
}
