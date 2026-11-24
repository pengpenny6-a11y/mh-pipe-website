import React,{useEffect,useRef,useState} from 'react';
import {ids} from './application-areas.js';
import {createArchitectureKit} from './application-scene-kit.js';
import {createBuildingModels} from './application-models-building.js';
import {createTechnicalModels} from './application-models-technical.js';
import {createPipeFlow} from './application-pipe-flow.js';
import {createAmbientRenderer} from './application-ambient-renderer.js';
import {createApplicationStage} from './application-stage.js';
import {applicationLandmarks} from './application-landmarks.js';


const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const views=[
 {angle:.22,elevation:.10,scale:2.23},
 {angle:.3,elevation:.57,scale:2.22},
 {angle:.19,elevation:.19,scale:2.11},
 {angle:.28,elevation:.21,scale:2.19},
 {angle:-.32,elevation:.24,scale:2.16},
 {angle:.48,elevation:.26,scale:2.29},
];

// Reuse the decoded panorama across the six independent WebGL contexts.
// Each context still owns and disposes its own PMREM target.
let panorama;
function loadPanorama(){
 if(panorama)return panorama;
 const controller=new AbortController();
 let timer;
 const read=Promise.all([
  import(/* @vite-ignore */ new URL('/assets/vendor/RGBELoader.js',location.origin).href),
  fetch('/assets/environments/studio-small-09-1k.hdr',{signal:controller.signal}).then(response=>{
   if(!response.ok)throw new Error('HDR unavailable');
   return response.arrayBuffer();
  }),
 ]).then(([{RGBELoader},bytes])=>new RGBELoader().parse(bytes));
 const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('HDR timed out'));},3000);});
 panorama=Promise.race([read,timeout]).catch(()=>{panorama=null;return null;}).finally(()=>clearTimeout(timer));
 return panorama;
}

// Mount the architectural overview when the active scene reaches its 3D view.
export default function ApplicationOrbit({id, lang, progressRef, onReady}) {
 const root = useRef(null);
 const viewport = useRef(null);
 const canvasHost = useRef(null);
 const reducedRef = useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [status, setStatus] = useState('loading');
 useEffect(()=>{
  let disposed=false,renderer,scene,camera,pmrem,environment,hdr,studio,kit,flow,ambient,stage,models=[],raf=0,last=0,resizeObserver,intersectionObserver;
  let visible=false,bootReady=document.documentElement.dataset.booting!=='true',contextLost=false;
  const current=0;
  let clock=0,drag=null,needsRender=true;
  let yaw=0,pitch=0,yawTarget=0,pitchTarget=0,drift=0,previousShadow=0,lastHover=0,renderCount=0,renderedReady=false,lastDebug=0;
  const listeners=[],media=matchMedia('(prefers-reduced-motion: reduce)');
  const live=()=>visible&&!document.hidden&&bootReady&&!contextLost&&document.documentElement.dataset.navOpen!=='true'&&document.documentElement.dataset.dialogOpen!=='true';
  const listen=(el,event,handler,options)=>{el.addEventListener(event,handler,options);listeners.push(()=>el.removeEventListener(event,handler,options));};
  function fallback(){
   if(disposed)return;
   setStatus('fallback');
   onReady('fallback');
  }
  const resources={geometry:new Set(),material:new Set(),texture:new Set()};
  function collect(object){object?.traverse(node=>{if(node.geometry)resources.geometry.add(node.geometry);for(const mat of (Array.isArray(node.material)?node.material:[node.material]))if(mat){resources.material.add(mat);for(const value of Object.values(mat))if(value?.isTexture)resources.texture.add(value);}});}
  async function load(){
   try{
    const T=await import(/* @vite-ignore */ new URL('/assets/vendor/three.module.js',location.origin).href);if(disposed)return;
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    const lighting=loadPanorama();
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#faf9f6',0);
    renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;renderer.shadowMap.autoUpdate=false;
    renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.dataset.cursor='rotate';canvasHost.current.appendChild(renderer.domElement);
    scene=new T.Scene();camera=new T.PerspectiveCamera(32,1,.1,220);ambient=createAmbientRenderer(T,renderer);
    const focus=new T.Vector3(),desiredPosition=new T.Vector3(),desiredFocus=new T.Vector3(),pointer=new T.Vector2(),raycaster=new T.Raycaster();
    scene.add(new T.HemisphereLight('#fffcf5','#a2a5a6',1.3));
    const key=new T.DirectionalLight('#fff3df',1.9);key.position.set(-8,18,14);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-12;key.shadow.camera.right=12;key.shadow.camera.top=13;key.shadow.camera.bottom=-12;key.shadow.camera.near=.5;key.shadow.camera.far=65;key.shadow.bias=-.00008;key.shadow.normalBias=.02;key.shadow.radius=5;key.shadow.blurSamples=12;
    scene.add(key,key.target);
    const fill=new T.DirectionalLight('#dbe8f5',.75);fill.position.set(9,8,-8);scene.add(fill);
    stage=createApplicationStage(T);scene.add(stage.group);
    studio=new T.Scene();studio.background=new T.Color('#818995');
    studio.add(new T.Mesh(new T.BoxGeometry(80,36,70),new T.MeshBasicMaterial({color:'#828c99',side:T.BackSide})));
    const softbox=(w,h,x,y,z,rx,ry,intensity)=>{const material=new T.MeshBasicMaterial({color:new T.Color('#ffffff').multiplyScalar(intensity),side:T.DoubleSide});const box=new T.Mesh(new T.PlaneGeometry(w,h),material);box.position.set(x,y,z);box.rotation.set(rx,ry,0);studio.add(box);};
    softbox(28,10,0,15,0,-Math.PI/2,0,3);softbox(28,5,-3,5,20,0,0,2.4);softbox(6,20,-18,6,0,0,Math.PI/2,2.1);
    pmrem=new T.PMREMGenerator(renderer);
    kit=createArchitectureKit(T);
    const factory=ids.indexOf(id)<3?createBuildingModels:createTechnicalModels;
    const [active]=factory(T,kit,id);
    if(!active)throw new Error('Missing scene '+id);
    if(id==='gas')active.group.userData.flowColor='#e8b46f';
    if(id==='fire')active.group.userData.flowColor='#f09d72';
    if(id==='cooling')active.group.traverse(node=>{if(node.userData.flowReverse)node.userData.flowColor='#dfb078';});
    kit.batchStatic(active.group);
    scene.add(active.group);
    models=[active];
    flow=createPipeFlow(T,models);root.current.dataset.flowRoutes=String(flow.stats?.routes||flow.stats?.paths||'ready');

    // Keep the photograph on screen while the final 3D lighting is prepared.
    // Generating two environments previously changed reflections mid-transition.
    const parsed=await lighting;
    if(disposed)return;
    if(parsed){
     hdr=new T.DataTexture(parsed.data,parsed.width,parsed.height,T.RGBAFormat,parsed.type);
     hdr.colorSpace=T.LinearSRGBColorSpace;hdr.minFilter=hdr.magFilter=T.LinearFilter;
     hdr.generateMipmaps=false;hdr.flipY=true;hdr.needsUpdate=true;
     environment=pmrem.fromEquirectangular(hdr);
    }else{
     environment=pmrem.fromScene(studio,.03,.1,100);
    }
    scene.environment=environment.texture;
    root.current.dataset.environment=parsed?'photographic-studio':'studio-fallback';

    const landmark=applicationLandmarks[id], projected=new T.Vector3();
    const nearFocus=new T.Vector3(),nearPosition=new T.Vector3();
    function alignToPlate(width,height){
     const section=root.current.closest('#applications');
     const overlay=section?.querySelector('.app-plate[data-current="true"] .app-routes');
     const matrix=overlay?.getScreenCTM();
     const bounds=canvasHost.current.getBoundingClientRect();
     let u=landmark.plate[0]/1000,v=landmark.plate[1]/562.5;
     if(matrix&&bounds.width&&bounds.height){
      const pixel=new DOMPoint(...landmark.plate).matrixTransform(matrix);
      u=(pixel.x-bounds.left)/bounds.width;
      v=(pixel.y-bounds.top)/bounds.height;
     }
     const halfHeight=landmark.distance*Math.tan(camera.fov*Math.PI/360);
     nearFocus.fromArray(landmark.model);
     nearFocus.x-=(u*2-1)*halfHeight*width/height;
     nearFocus.y+=(v*2-1)*halfHeight;
     nearPosition.copy(nearFocus);
     nearPosition.z+=landmark.distance;
    }
    function targetPose(index){
     const model=models[index],center=model.center||[0,3,0],view=views[ids.indexOf(id)];
     const distance=(model.radius||7)*view.scale*Math.max(1,1.47/camera.aspect),theta=view.angle+yaw+drift,elevation=view.elevation+pitch;
     desiredFocus.set(model.group.position.x+center[0],center[1]-.12,center[2]);
     desiredPosition.set(desiredFocus.x+Math.sin(theta)*Math.cos(elevation)*distance,desiredFocus.y+Math.sin(elevation)*distance,desiredFocus.z+Math.cos(theta)*Math.cos(elevation)*distance);
     const t=clamp((progressRef.current-.28)/.72,0,1);
     const towardPlate=1-t*t*(3-2*t);
     desiredFocus.lerp(nearFocus,towardPlate);
     desiredPosition.lerp(nearPosition,towardPlate);
    }
    function shadows(force=false){if(!force&&clock-previousShadow<.16)return;previousShadow=clock;const x=focus.x;key.position.set(x-8,18,14);key.target.position.set(x,3,0);fill.position.set(x+9,8,-8);renderer.shadowMap.needsUpdate=true;}
    function wake(){if(!disposed&&!raf&&live()){last=0;raf=requestAnimationFrame(tick);}}
    progressRef.wake=()=>{needsRender=true;wake();};
    function tick(now){
     raf=0;if(disposed||!live())return;
     const dt=last?Math.min((now-last)/1000,.04):0;last=now;if(!reducedRef.current)clock+=dt;
     const smoothing=reducedRef.current?1:1-Math.exp(-dt*8);
     yaw+=(yawTarget-yaw)*smoothing;pitch+=(pitchTarget-pitch)*smoothing;
     // Keep the architectural viewpoint still: flow, not camera drift, carries
     // the resting scene. The visitor can still orbit it directly.
     drift=0;
     const settling=Math.abs(yawTarget-yaw)+Math.abs(pitchTarget-pitch)>.00015;
     targetPose(current);
     camera.position.copy(desiredPosition);
     focus.copy(desiredFocus);
     camera.lookAt(focus);
     for(let i=0;i<models.length;i++)if(models[i].group.visible)models[i].update?.(reducedRef.current?0:clock,1);
     flow.update(clock,reducedRef.current,current);stage.update(clock,reducedRef.current);
     if(!reducedRef.current||needsRender||settling){
      shadows();
      const frame = ambient.render(scene, camera);
      if (root.current.dataset.followJoint === 'true') {
        projected.fromArray(landmark.model).applyMatrix4(active.group.matrixWorld).project(camera);
        root.current.dataset.jointU=((projected.x+1)/2).toFixed(5);
        root.current.dataset.jointV=((1-projected.y)/2).toFixed(5);
      }
      renderCount++;
      if(now-lastDebug>200||!renderedReady||reducedRef.current){lastDebug=now;Object.assign(root.current.dataset,{renderCount:String(renderCount),drawCalls:String(frame.calls),triangles:String(frame.triangles),camera:[camera.position.x,camera.position.y,camera.position.z].map(n=>n.toFixed(3)).join(','),flowTime:clock.toFixed(2),visibleModels:'1'});}
      needsRender=false;if(!renderedReady){renderedReady=true;setStatus('webgl');onReady('webgl');}
     }
     if((!reducedRef.current||settling)&&!raf)raf=requestAnimationFrame(tick);
    }
    function resize() {
     if (!renderer || !canvasHost.current) return;
     const {clientWidth: width, clientHeight: height} = canvasHost.current;
     if (!width || !height) return;
     renderer.setSize(width, height, false);
     ambient.resize(width, height);
     camera.aspect = width / height;
     camera.updateProjectionMatrix();
     alignToPlate(width,height);
     needsRender = true;
     shadows(true);
     wake();
    }
    function observe(){const allowed=live();root.current.dataset.motion=allowed?'running':'paused';root.current.dataset.playing=String(allowed&&!reducedRef.current);if(!allowed){cancelAnimationFrame(raf);raf=0;last=0;}else wake();}
    const stopDrag=()=>{const pointer=drag;drag=null;if(pointer){if(renderer.domElement.hasPointerCapture(pointer.id))renderer.domElement.releasePointerCapture(pointer.id);}root.current.dataset.dragging='false';};
    const down=event=>{if(!live()||event.button!==0||event.isPrimary===false)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:yawTarget,pitch:pitchTarget,committed:event.pointerType!=='touch'};if(drag.committed){renderer.domElement.setPointerCapture(event.pointerId);viewport.current.focus({preventScroll:true});root.current.dataset.dragging='true';}};
    const move=event=>{if(!live())return;if(!drag){if(event.timeStamp-lastHover>60){lastHover=event.timeStamp;const bounds=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=flow.hover(raycaster,current);root.current.dataset.pipeHover=String(hit);needsRender=true;wake();}return;}if(event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.committed){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>7){stopDrag();return;}if(Math.abs(dx)<7)return;drag.committed=true;renderer.domElement.setPointerCapture(event.pointerId);root.current.dataset.dragging='true';}yawTarget=clamp(drag.yaw-dx*.002,-.25,.25);pitchTarget=clamp(drag.pitch+dy*.0015,-.07,.13);if(event.cancelable)event.preventDefault();needsRender=true;wake();};
    const keydown=event=>{if(event.target!==viewport.current||!live()||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;event.preventDefault();if(event.key==='Home')yawTarget=pitchTarget=0;if(event.key==='ArrowLeft')yawTarget=clamp(yawTarget-.06,-.25,.25);if(event.key==='ArrowRight')yawTarget=clamp(yawTarget+.06,-.25,.25);if(event.key==='ArrowUp')pitchTarget=clamp(pitchTarget+.04,-.07,.13);if(event.key==='ArrowDown')pitchTarget=clamp(pitchTarget-.04,-.07,.13);needsRender=true;wake();};
    listen(renderer.domElement,'pointerleave',()=>{if(!drag){flow.clear();root.current.dataset.pipeHover='false';needsRender=true;wake();}});listen(renderer.domElement,'pointerdown',down);listen(renderer.domElement,'pointermove',move);listen(renderer.domElement,'pointerup',stopDrag);listen(renderer.domElement,'pointercancel',stopDrag);listen(renderer.domElement,'lostpointercapture',stopDrag);listen(viewport.current,'keydown',keydown);
    listen(window,'blur',stopDrag);listen(document,'visibilitychange',observe);listen(window,'mh-intro-ready',()=>{bootReady=true;observe();});listen(window,'mh-navigation-change',()=>{stopDrag();observe();});listen(window,'mh-dialog-change',()=>{stopDrag();observe();});
    listen(media,'change',()=>{reducedRef.current=media.matches;if(media.matches){yaw=yawTarget;pitch=pitchTarget;}needsRender=true;observe();});
    listen(renderer.domElement,'webglcontextlost',event=>{event.preventDefault();contextLost=true;renderedReady=false;cancelAnimationFrame(raf);raf=0;fallback();});
    listen(renderer.domElement,'webglcontextrestored',()=>{contextLost=false;environment?.dispose();environment=hdr?pmrem.fromEquirectangular(hdr):pmrem.fromScene(studio,.03,.1,100);scene.environment=environment.texture;needsRender=true;renderer.shadowMap.needsUpdate=true;observe();});
    intersectionObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>.12;observe();},{threshold:[0,.12,.3]});intersectionObserver.observe(viewport.current);resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvasHost.current);resize();observe();
   }catch(error){if(!disposed){root.current.dataset.rendererError=String(error.message||error);fallback();}}
  }
  load();
  return()=>{disposed=true;progressRef.wake=null;cancelAnimationFrame(raf);resizeObserver?.disconnect();intersectionObserver?.disconnect();listeners.forEach(fn=>fn());flow?.dispose();ambient?.dispose();stage?.dispose();collect(scene);collect(studio);resources.texture.forEach(texture=>texture.dispose());resources.geometry.forEach(geometry=>geometry.dispose());resources.material.forEach(material=>material.dispose());scene?.traverse(node=>node.shadow?.dispose());kit?.dispose?.();environment?.dispose();hdr?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();};
 },[id, progressRef, onReady]);

 return <div className="orbit-stage" ref={root} data-renderer={status}>
   <div className="spa-viewport" ref={viewport} role="region" tabIndex={0}
     aria-label={lang==='zh'?'三维管路，拖动或使用方向键转动视角':'3D pipework. Drag or use arrow keys to rotate.'}>
     <img className="orbit-fallback" src={'/assets/applications/scene-'+id+'.webp'} alt=""/>
     <div className="spa-canvas" ref={canvasHost}/>
     {status==='fallback' && <p className="orbit-status">{lang==='zh'?'当前设备显示静态管路图':'Static pipework view on this device'}</p>}
   </div>
 </div>;
}
