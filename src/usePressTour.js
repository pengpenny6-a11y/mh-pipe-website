import {useEffect, useState} from 'react';

export const pressTourOrder = ['coupling', 'tee', 'elbow', 'pipe'];
const stations = [null, ...pressTourOrder];
const dwell = station => station ? 3800 : 2400;
const hoverTargets = '.run-pin, .series-catalog';
const focusTargets = hoverTargets + ', .run-inspect';

// The tour is display state. Only parts chosen by the visitor belong in their
// catalogue filter or browser history.
export function usePressTour(stage, enabled) {
  const [form, setForm] = useState(null);
  const [restart, setRestart] = useState(0);

  useEffect(() => {
    setForm(null);
    if (!enabled || !stage.current) return;

    const panel = stage.current;
    const chapter = panel.closest('.home-series');
    const root = document.documentElement;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let station = 0;
    let remaining = dwell(stations[station]);
    let timer = null;
    let started = 0;
    let hovering = Boolean(chapter.querySelector(':is(' + hoverTargets + '):hover'));

    function sync() {
      const focused = document.activeElement;
      const interacting = hovering || (chapter.contains(focused) &&
        focused?.matches(focusTargets) && focused.matches(':focus-visible'));
      const flags = root.dataset;
      const canPlay = inView && !motion.matches && !document.hidden && !interacting &&
        flags.booting !== 'true' && flags.pageLoading !== 'true' &&
        flags.navOpen !== 'true' && flags.dialogOpen !== 'true';

      if (!canPlay) {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
          remaining = Math.max(0, remaining - (performance.now() - started));
        }
        return;
      }
      if (timer !== null) return;
      started = performance.now();
      timer = setTimeout(() => {
        timer = null;
        station = (station + 1) % stations.length;
        setForm(stations[station]);
        remaining = dwell(stations[station]);
        sync();
      }, remaining);
    }
    function pointerOver(event) {
      hovering = Boolean(event.target.closest(hoverTargets));
      sync();
    }
    function pointerOut(event) {
      hovering = Boolean(chapter.contains(event.relatedTarget) && event.relatedTarget?.closest?.(hoverTargets));
      sync();
    }
    function preferenceChanged() {
      if (motion.matches) {
        sync();
        station = 0;
        remaining = dwell(null);
        setForm(null);
      } else sync();
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .45;
      sync();
    }, {threshold:[0,.45]});
    observer.observe(panel);
    const overlays = new MutationObserver(sync);
    overlays.observe(root,{attributes:true,attributeFilter:['data-booting','data-page-loading','data-nav-open','data-dialog-open']});
    chapter.addEventListener('pointerover',pointerOver);
    chapter.addEventListener('pointerout',pointerOut);
    chapter.addEventListener('focusin',sync);
    chapter.addEventListener('focusout',sync);
    document.addEventListener('visibilitychange',sync);
    motion.addEventListener('change',preferenceChanged);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      overlays.disconnect();
      chapter.removeEventListener('pointerover',pointerOver);
      chapter.removeEventListener('pointerout',pointerOut);
      chapter.removeEventListener('focusin',sync);
      chapter.removeEventListener('focusout',sync);
      document.removeEventListener('visibilitychange',sync);
      motion.removeEventListener('change',preferenceChanged);
    };
  },[stage, enabled, restart]);

  function restartFromOverview() {
    setForm(null);
    setRestart(value => value + 1);
  }
  return {form, restartFromOverview};
}
