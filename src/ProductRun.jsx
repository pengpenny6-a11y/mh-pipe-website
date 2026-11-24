import React, {useEffect, useRef, useState} from 'react';
import {runLandmarks, pinLayout, placePins} from './product-run-hotspots.js';
import stillLandmarks from './product-run-stills.json';
import {buildPressRun} from './press-exhibition.js';
import {fitRunOverview} from './product-run-overview.js';
import {fitRunDetail, detailLandmarks} from './product-run-detail.js';
import './product-run.css';

// The moving reflection overlaps the camera's arrival, then settles on the metal.
const lightLeadMs = 760;
const lightDurationMs = 960;

function loadStudioExposure(family, signal) {
  return new Promise(resolve => {
    const worker = new Worker('/assets/environments/product-lighting-worker.js', {type:'module'});
    const stop = () => finish(null);
    const timeout = setTimeout(stop, 2400);
    function finish(exposure) {
      clearTimeout(timeout);
      signal.removeEventListener('abort', stop);
      worker.terminate();
      resolve(exposure);
    }
    signal.addEventListener('abort', stop, {once:true});
    worker.onmessage = event => finish(event.data);
    worker.onerror = stop;
    worker.postMessage(family === 'press' ? .045 : .16);
  });
}

function stillHit(image, x, y, rect) {
  if (!image?.complete || !image.naturalWidth) return null;
  const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  const u = Math.floor((x - (rect.width - image.naturalWidth * scale) / 2) / scale);
  const v = Math.floor((y - (rect.height - image.naturalHeight * scale) / 2) / scale);
  if (u < 0 || v < 0 || u >= image.naturalWidth || v >= image.naturalHeight) return false;
  const tile = document.createElement('canvas');
  tile.width = tile.height = 1;
  const ctx = tile.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(image, u, v, 1, 1, 0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data[3] > 32;
}

function buildWallStudy(T, scene, metal) {
  // An illustrative open-ended tube with a true inner surface; no nominal dimensions.
  const profile = [[.95,-3.83],[.95,3.83],[.946,3.85],[.735,3.85],[.729,3.83],
    [.729,3.15],[.729,.1],[.729,-3.15],[.729,-3.83],[.735,-3.85],[.946,-3.85],[.95,-3.83]];
  const geometry = new T.LatheGeometry(profile.map(([r,y]) => new T.Vector2(r,y)),120);
  const values=[1,1,1,1,.72,.26,.035,.26,.72,1,1,1];
  const colors=[];
  for(let i=0;i<geometry.attributes.position.count;i++){
    const light=values[i%profile.length];
    colors.push(light,light,light);
  }
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  metal.vertexColors=true;
  const innerMetal=metal.clone();
  innerMetal.roughness=.52;
  innerMetal.envMapIntensity=.58;
  const stripCount=profile.length-1;
  const surface=[],bore=[];
  const indices=geometry.index.array;
  for(let sector=0;sector<120;sector++){
    for(let strip=0;strip<stripCount;strip++){
      const offset=(sector*stripCount+strip)*6;
      const group=strip>=4 && strip<8 ? bore : surface;
      group.push(...indices.subarray(offset,offset+6));
    }
  }
  geometry.setIndex([...surface,...bore]);
  geometry.addGroup(0,surface.length,0);
  geometry.addGroup(surface.length,bore.length,1);
  const pipe = new T.Mesh(geometry,[metal,innerMetal]);
  pipe.rotation.z = -Math.PI/2;
  scene.add(pipe);
}

// Draw on demand: changing a station or viewport moves the camera; a settled
// product does not keep rendering while the customer reads its information.
export default function ProductRun({family, form, entryForm='tee', fallback, lang, forms = [], onSelect, onInspect, onReset, holdOnInspect = false}) {
  const host = useRef(null), controls = useRef(null), chosen = useRef(form);
  const pins = useRef({}), previousForm = useRef(null);
  const cue = useRef(entryForm);
  const activation = useRef(null), still = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!form) previousForm.current = null;
    else if (chosen.current !== form) previousForm.current = chosen.current;
    chosen.current = form;
    cue.current = entryForm;
    if (family === 'press' && form !== (activation.current?.id ?? null)) {
      activation.current = form ? {id: form, start: performance.now()} : null;
    }
    controls.current?.update();
  }, [form,entryForm,lang,family]);

  function activateStage(event) {
    if (event.detail === 0) { onInspect?.(); return; } // Native keyboard activation of the product image.
    const surface = ready ? host.current.querySelector('canvas') : still.current;
    const rect = (surface || host.current).getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    const hit = ready && controls.current?.hit
      ? controls.current.hit(2 * x / rect.width - 1, 1 - 2 * y / rect.height)
      : stillHit(still.current, x, y, rect);
    if (typeof hit === 'string') {
      if (hit === form) onInspect?.();
      else onSelect(hit);
    } else if (hit === true) onInspect?.();
    else if (hit === false) onReset();
  }
  useEffect(() => {
    if (family !== 'press' || ready) return;
    const target=host.current, plate=stillLandmarks[form || 'overview'];
    if (!plate) return;
    const fit=()=>{
      const layout=pinLayout(target);
      const scale=Math.min(layout.width/plate.width,layout.height/plate.height);
      const dx=(layout.width-plate.width*scale)/2,dy=(layout.height-plate.height*scale)/2;
      const points={};
      for(const [id,[x,y]] of Object.entries(plate.points))points[id]=[dx+x*scale,dy+y*scale];
      placePins(pins.current, points, layout, form, previousForm.current, entryForm);
      if (!form) {
        const [left,right]=plate.horizontalExtent;
        target.dataset.panLeft=String(dx + left * scale);
        target.dataset.panRight=String(layout.width - dx - right * scale);
      }
    };
    fit();
    const observer=new ResizeObserver(fit);
    observer.observe(target);
    return ()=>observer.disconnect();
  }, [ready,form,entryForm,family,lang]);
  useEffect(() => {
    const target = host.current;
    let gone = false, visible = false, started = false, raf = 0;
    let renderer, scene, pmrem, environment, studio, observer;
    const abort = new AbortController();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const clean = [];
    setReady(false);
    async function load() {
      if (started || gone) return;
      started = true;
      try {
        const T = await import(/* @vite-ignore */ new URL('/assets/vendor/three.module.js',location.origin).href);
        if (gone) return;
        renderer = new T.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: import.meta.env.DEV});
        renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
        renderer.setClearColor(0,0);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.04;
        renderer.domElement.setAttribute('aria-hidden','true');
        target.append(renderer.domElement);
        scene = new T.Scene();
        studio = new T.Scene();
        studio.background = new T.Color('#8a9297');
        function softbox(w,h,x,y,z,color,strength) {
          const panel = new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color: new T.Color(color).multiplyScalar(strength),side: T.DoubleSide}));
          panel.position.set(x,y,z); panel.lookAt(0,0,0); studio.add(panel);
        }
        softbox(36,4,0,9,3,'#ffffff',4);
        softbox(30,3,0,1,10,'#26323b',.6);
        softbox(36,1.6,0,-2,9,'#f6faff',3);
        softbox(30,9,0,-9,-1,'#374046',.75);
        softbox(10,10,-8,5,-7,'#ffffff',3);
        softbox(9,18,12,1,2,'#f1f6fa',1.7);
        pmrem = new T.PMREMGenerator(renderer);
        try {
          const pixels = await loadStudioExposure(family, abort.signal);
          if (pixels && !gone) {
            const map = new T.DataTexture(pixels.data,pixels.width,pixels.height,T.RGBAFormat,pixels.type);
            map.colorSpace=T.LinearSRGBColorSpace;map.mapping=T.EquirectangularReflectionMapping;
            map.minFilter=map.magFilter=T.LinearFilter;map.flipY=true;map.needsUpdate=true;
            try { environment = pmrem.fromEquirectangular(map); }
            finally { map.dispose(); }
          }
        } catch { /* Use the built-in lighting rig when the studio map is unavailable. */ }
        if (gone) return;
        if (!environment) environment = pmrem.fromScene(studio,.012,.1,70);
        scene.environment = environment.texture;
        if (family==='press') scene.environmentRotation.set(-.1,2.48,0);
        const camera = new T.PerspectiveCamera(30,1,.05,100);
        const focus = new T.Vector3(), eye = new T.Vector3(), dest = new T.Vector3(), aim = new T.Vector3();
        const marker = new T.Vector3();
        const fromEye = new T.Vector3(), fromFocus = new T.Vector3();
        const previousDest = new T.Vector3(Infinity,Infinity,Infinity);
        const previousAim = new T.Vector3(Infinity,Infinity,Infinity);
        let moveStarted = 0;
        const raycaster = family === 'press' ? new T.Raycaster() : null;
        const pointer = new T.Vector2();
        let layout, press, overview, details={};
        if (family === 'press') {
          press = buildPressRun(T,scene);
        } else {
          const metal=new T.MeshStandardMaterial({color:'#e0e2e2',metalness:1,roughness:.125,side:T.DoubleSide});
          buildWallStudy(T,scene,metal);
        }
        let first = true, pinsNeedUpdate = true;
        function frame(now) {
          raf = 0;
          if (!visible || gone || document.hidden) return;
          let sweeping = false;
          if (family === 'press') {
            const detail = details[chosen.current];
            if (detail) {
              aim.copy(detail.aim);
              dest.copy(detail.eye);
            } else {
              aim.copy(overview.aim);
              dest.copy(overview.eye);
            }
            const active = activation.current;
            if (press && active) {
              const phase = media.matches ? 1 : (now - active.start - lightLeadMs) / lightDurationMs;
              sweeping = phase < 1;
              press.setSelectionLight(active.id, Math.min(1, Math.max(0, phase)));
            } else if (press) {
              press.setSelectionLight(null, 0);
            }
          } else {
            aim.set(-.98,0,0);
            dest.set(-1.45,.35,1).normalize().multiplyScalar(9.4*Math.max(1,1.75/camera.aspect)).add(aim);
          }
          if (!dest.equals(previousDest) || !aim.equals(previousAim)) {
            fromEye.copy(eye); fromFocus.copy(focus); moveStarted=now;
            previousDest.copy(dest); previousAim.copy(aim);
            pinsNeedUpdate = true;
          }
          const progress=first || media.matches ? 1 : Math.min(1,(now-moveStarted)/980);
          const ease=progress*progress*progress*(progress*(progress*6-15)+10);
          eye.lerpVectors(fromEye,dest,ease); focus.lerpVectors(fromFocus,aim,ease);
          const moving=progress<1;
          const motionState = moving ? 'moving' : 'settled';
          if (target.dataset.motionState !== motionState) target.dataset.motionState = motionState;
          camera.position.copy(eye); camera.lookAt(focus);
          renderer.render(scene,camera);
          if (family==='press' && layout && (moving || pinsNeedUpdate)) {
            const points={};
            for(const [id,world] of Object.entries(runLandmarks)){
              marker.fromArray(id===chosen.current && detailLandmarks[id] || world).project(camera);
              points[id]=[(marker.x+1)*layout.width/2,(1-marker.y)*layout.height/2];
            }
            placePins(pins.current,points,layout,chosen.current,previousForm.current,cue.current);
            if (!chosen.current) {
              const screenX=(x,y)=> (marker.set(x,y,0).project(camera).x+1)*layout.width/2;
              const margin=layout.width*.04;
              target.dataset.panLeft=String(Math.max(0,screenX(-10.4,0)-margin));
              target.dataset.panRight=String(Math.max(0,layout.width-Math.max(screenX(4.82,-4.45),screenX(4.82,0))-margin));
            }
            // The reflection keeps sweeping after the camera settles. Its
            // last frames need no DOM updates to the projected buttons.
            pinsNeedUpdate = moving;
          }
          if (first) { first = false; setReady(true); }
          if (sweeping || moving) raf=requestAnimationFrame(frame);
        }
        function update() { if (!gone && visible && !document.hidden && !raf) raf=requestAnimationFrame(frame); }
        let lastWidth = 0, lastHeight = 0;
        function resize() {
          const w=target.clientWidth,h=target.clientHeight;
          if (!w || !h || (w === lastWidth && h === lastHeight)) return;
          lastWidth = w; lastHeight = h; pinsNeedUpdate = true;
          renderer.setSize(w,h,false); camera.aspect=w/h;
          if (family==='press' && w>650) camera.setViewOffset(w,h,-w*.14,-h*.035,w,h);
          else camera.clearViewOffset();
          camera.updateProjectionMatrix();
          if (family==='press') {
            layout=pinLayout(target);
            overview=fitRunOverview(T,camera,w,h);
            details=Object.fromEntries(Object.keys(runLandmarks).map(id=>[id,fitRunDetail(T,camera,id,w,h)]));
          }
          update();
        }
        const updateLayout=()=>{ if(family==='press')layout=pinLayout(target);pinsNeedUpdate=true;update(); };
        controls.current = {
          update:updateLayout,
          hit:raycaster && ((x,y) => {
            raycaster.setFromCamera(pointer.set(x,y),camera);
            const hit=raycaster.intersectObjects(scene.children, false)[0];
            return hit ? hit.object.userData.productForm || true : false;
          }),
        };
        if(family==='press')layout=pinLayout(target);
        observer = new ResizeObserver(resize); observer.observe(target);
        media.addEventListener('change',update); document.addEventListener('visibilitychange',update);
        const lost = () => {setReady(false);cancelAnimationFrame(raf);raf=0;controls.current=null;visible=false;};
        renderer.domElement.addEventListener('webglcontextlost',lost);
        clean.push(()=>{media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);renderer.domElement.removeEventListener('webglcontextlost',lost);});
        resize();
      } catch { if (!gone) setReady(false); }
    }
    const intersection = new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      target.dataset.inView=String(visible);
      if (visible) {load();controls.current?.update();}
    },{rootMargin:'150px'});
    intersection.observe(target);
    return () => {
      gone=true; abort.abort();controls.current=null;cancelAnimationFrame(raf);
      observer?.disconnect();intersection.disconnect();clean.forEach(fn=>fn());
      const geometries=new Set(), materials=new Set();
      for(const world of [studio,scene]) world?.traverse(o=>{
        if(o.geometry)geometries.add(o.geometry);
        if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);
      });
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
      environment?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();
    };
  },[family]);

  const stillSrc = family === 'press' && form && !ready
    ? '/assets/product-series/run-' + form + '-selected.webp' : fallback;
  const inspectVerb = holdOnInspect ? (lang === 'zh' ? '停留查看' : 'Hold view on ') : (lang === 'zh' ? '查看' : 'View ');
  return <div ref={host} className="series-render" data-ready={ready} data-product-family={family}>
    {fallback && <img ref={still} src={stillSrc} className="series-render-still" alt="" draggable="false"/>}
    {!fallback && <span className="series-render-alternative">{lang==='zh'?'厚壁管端截面':'Thick-wall pipe section'}</span>}
    {family==='press' && <>
      <button className="series-inspect run-inspect" type="button" onClick={activateStage}
        tabIndex={form ? 0 : -1}
        aria-label={form ? inspectVerb + (forms.find(p=>p.id===form)?.name[lang] || '')
          : (lang==='zh'?'选择管路部件':'Select a pipe component')}/>
      <div className="run-pins" role="group" aria-label={lang==='zh'?'在管路上选择产品':'Select a product on the pipe run'}>
        {forms.map(p=><button key={p.id} ref={node=>{pins.current[p.id]=node;}} type="button" hidden
            className="run-pin" data-run-hotspot={p.id} aria-pressed={p.id===form}
            data-marked={p.id===form}
            aria-label={(lang==='zh'?'选择':'Select ')+p.name[lang]} onClick={()=>onSelect(p.id)}>
          <span className="run-pin-dot" aria-hidden="true"/>
          <span className="run-selection-name" aria-hidden="true">{p.name[lang]}</span>
          <span className="run-pin-label" aria-hidden="true">
            {p.cataloguePhoto && <img src={p.cataloguePhoto} alt="" decoding="async" loading="lazy"/>}
            {p.name[lang]}
          </span>
        </button>)}
      </div>
    </>}
  </div>;
}
