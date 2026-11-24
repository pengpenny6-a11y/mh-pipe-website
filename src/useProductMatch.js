import {useEffect, useState} from 'react';
import {applicationLandmarks} from './application-landmarks.js';

const clamp = (number, min, max) => Math.min(max,Math.max(min,number));
const ease = value => {
  const t = clamp(value,0,1);
  return t*t*(3-2*t);
};

// During the overlap, align the two actual subjects horizontally. Reading
// and wheel position remain independent of the scene and product controls.
export function useProductMatch(home, marker, scene) {
  const [holdTour,setHoldTour] = useState(false);
  const [entryForm,setEntryForm] = useState('tee');
  useEffect(() => {
    const page = home.current, light = marker.current;
    const app = page.querySelector('#applications'), products = page.querySelector('#home-products');
    const spread = app.querySelector('.app-spread');
    const subject = applicationLandmarks[scene];
    if (!light || !subject) return;
    const media = matchMedia('(min-width:851px) and (prefers-reduced-motion:no-preference)');
    let frame = 0, near = false, holding = false, following = null;
    function hold(next) {
      if (holding === next) return;
      holding = next;
      setHoldTour(next);
    }
    function clear() {
      hold(false);
      light.hidden = true;
      products.style.removeProperty('--entry-pan');
      if (following) { delete following.dataset.followJoint; following = null; }
    }
    function draw() {
      frame = 0;
      const h = innerHeight, boundary = products.getBoundingClientRect().top;
      const start = .92*h, end = .08*h;
      const box = spread.getBoundingClientRect();
      const appTop = box.top;
      const crossing = boundary < start && boundary > end && appTop < 0;
      // An overhead joint passes behind the navigation well before a lower
      // riser tee. Catch its reflection while the whole scene can still play.
      const overhead = subject.plate[1] < 180 && appTop < h*.24 && appTop > -h*.30;
      const flags = document.documentElement.dataset;
      const allowed = media.matches && !document.hidden && flags.booting !== 'true' &&
        flags.navOpen !== 'true' && flags.dialogOpen !== 'true';
      if (!near || !allowed || products.dataset.series !== 'press' || products.dataset.form ||
          (!crossing && !overhead)) {
        clear(); return;
      }
      if (crossing && !holding) setEntryForm(subject.form);
      hold(crossing);
      const phase = clamp((start-boundary)/(start-end),0,1);
      const overlay = spread.querySelector('.app-plate[data-current="true"] .app-routes');
      const matrix = overlay?.getScreenCTM();
      let point = matrix && new DOMPoint(...subject.plate).matrixTransform(matrix);
      const orbit = spread.querySelector('.orbit-stage[data-renderer="webgl"]');
      const blend = Number(app.style.getPropertyValue('--orbit-opacity')) || 0;
      if (orbit && blend > 0) {
        const u = Number(orbit.dataset.jointU), v = Number(orbit.dataset.jointV);
        if (Number.isFinite(u) && Number.isFinite(v)) {
          const model = orbit.querySelector('.spa-canvas').getBoundingClientRect();
          const x = model.left + u*model.width, y = model.top + v*model.height;
          point = point ? {x:point.x+(x-point.x)*blend,y:point.y+(y-point.y)*blend} : {x,y};
        } else if (blend > .5) point = null;
      } else if (blend > .5) point = null;

      const render = products.querySelector('.series-render');
      const pin = render?.querySelector('[data-run-hotspot="'+subject.form+'"]');
      if (crossing && render && pin && point && !pin.hidden) {
        const targetX = render.getBoundingClientRect().left + parseFloat(pin.style.left);
        const left = Math.max(0,Number(render.dataset.panLeft || 0)-24);
        const right = Math.max(0,Number(render.dataset.panRight || 0)-24);
        const shift = clamp(point.x-targetX,-left,right)*(1-ease((phase-.42)/.58));
        if (Number.isFinite(shift)) products.style.setProperty('--entry-pan',shift.toFixed(2)+'px');
      } else products.style.removeProperty('--entry-pan');
      if (orbit && blend > 0 && following !== orbit) {
        if (following) delete following.dataset.followJoint;
        following = orbit;
        orbit.dataset.followJoint = 'true';
      }
      light.hidden = !point || point.y < 78 || point.y > box.bottom || app.dataset.observing === 'true';
      if (!light.hidden) {
        light.style.translate = (point.x-box.left)+'px '+(point.y-box.top)+'px';
        const catchLight = overhead ? ease((h*.24-appTop)/(h*.12)) : 0;
        light.style.opacity = String(Math.max(catchLight,ease(phase/.15))*(1-ease((phase-.54)/.29)));
      }
      if (app.dataset.view === 'entering' || app.dataset.view === 'leaving' ||
          (orbit && !orbit.dataset.jointU && box.bottom > h*.2)) request();
    }
    function request() { if (!frame && near) frame = requestAnimationFrame(draw); }
    const observer = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) request(); else clear();
    });
    observer.observe(app);
    const changes = new MutationObserver(request);
    changes.observe(app,{subtree:true,attributes:true,attributeFilter:['data-scene','data-view','data-ready','data-observing']});
    changes.observe(products,{attributes:true,attributeFilter:['data-series','data-form']});
    window.addEventListener('scroll',request,{passive:true});
    window.addEventListener('resize',request);
    window.addEventListener('mh-dialog-change',request);
    window.addEventListener('mh-navigation-change',request);
    document.addEventListener('visibilitychange',request);
    media.addEventListener('change',request);
    return () => {
      cancelAnimationFrame(frame); clear();
      observer.disconnect(); changes.disconnect();
      window.removeEventListener('scroll',request);
      window.removeEventListener('resize',request);
      window.removeEventListener('mh-dialog-change',request);
      window.removeEventListener('mh-navigation-change',request);
      document.removeEventListener('visibilitychange',request);
      media.removeEventListener('change',request);
    };
  },[home,marker,scene]);
  return {holdTour,entryForm};
}
