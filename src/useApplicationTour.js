import {useLayoutEffect, useRef} from 'react';

const plateHold = 2550;
const overviewHold = 1700;

// A paused scene keeps its unused viewing time. The camera owns its transition
// between the two still intervals.
export function useApplicationTour({take, view, running, reduced, onEnter, onNext}) {
  const interval = useRef(null);
  const actions = useRef({onEnter, onNext});
  useLayoutEffect(() => { actions.current = {onEnter, onNext}; }, [onEnter, onNext]);

  useLayoutEffect(() => {
    if (view !== 'plate' && view !== 'orbit') {
      interval.current = null;
      return;
    }
    if (!interval.current || interval.current.take !== take || interval.current.view !== view) {
      interval.current = {take, view, remaining: view === 'orbit' ? overviewHold : plateHold, finished: false};
    }
    const dwell = interval.current;
    if (reduced || !running || dwell.finished) return;

    const started = performance.now();
    const timer = setTimeout(() => {
      dwell.finished = true;
      if (view === 'orbit') actions.current.onNext();
      else actions.current.onEnter();
    }, dwell.remaining);
    return () => {
      clearTimeout(timer);
      dwell.remaining = Math.max(0, dwell.remaining - (performance.now() - started));
    };
  }, [take, view, running, reduced]);
}
