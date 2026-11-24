import React, {useEffect, useRef, useState} from 'react';
import './precision-product.css';

// A presentation model. The geometry explains mating parts, not a press profile,
// installation sequence, product drawing, or a manufacturing tolerance.
export default function PrecisionProduct({lang='en', exploded=false, onReady, rotation, onRotate, presentation='standard', fallbackImage, openingImage, entranceRef}) {
  const cinematic=presentation==='cinematic',whiteStage=presentation==='white-stage',connectionStage=presentation==='connection-stage',litStage=whiteStage||connectionStage,assembly=exploded||cinematic||litStage;
  const host=useRef(null), canvasHost=useRef(null), controls=useRef(null), onReadyRef=useRef(onReady);
  const onRotateRef=useRef(onRotate);onRotateRef.current=onRotate;
  const entranceSource=useRef(entranceRef);entranceSource.current=entranceRef;
  const [status,setStatus]=useState('loading');
  const [contextVersion,setContextVersion]=useState(0);
  const everRendered=useRef(false);
  const [showJoinedPoster,setShowJoinedPoster]=useState(false);
  onReadyRef.current=onReady;
  const explodedRef=useRef(assembly);explodedRef.current=assembly;
  useEffect(()=>{controls.current?.explode(assembly)},[assembly]);
  useEffect(()=>{if(Number.isFinite(rotation))controls.current?.rotate(rotation)},[rotation]);
  useEffect(()=>{controls.current?.wake()},[entranceRef]);
  useEffect(()=>{
    let gone=false,renderer,environment,photographicStudio,pmrem,scene,reflectionTarget,stageLight,frame=0,observer,resizeObserver,ready=false;
    let visible=true,focused=true,contextLost=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const media=matchMedia('(prefers-reduced-motion: reduce)'),cleanup=[],meshes=[],materials=[];
    const state={yaw:0,pitch:0,yawTarget:0,pitchTarget:0,spread:explodedRef.current?1:0,spreadTarget:explodedRef.current?1:0,light:0,lightTarget:0,hoverX:0,hoverY:0,hover:0,approach:0,intro:0};
    let drag=null,last=0,idle=0,cycle=everRendered.current?3.1:0,keyboardInspection=false,hovered=false,couplingHovered=false,introAllowed=document.documentElement.dataset.booting!=='true';
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const controlledEntrance=()=>litStage?entranceSource.current?.current:null;
    const entryLocked=()=>Boolean(!reduced&&controlledEntrance()&&!controlledEntrance().complete);
    const navigationOpen=()=>document.documentElement.dataset.navOpen==='true';
    const interactionLocked=()=>entryLocked()||navigationOpen();
    const yawLimits=[-.32,.28],pitchLimits=[-.16,.16];
    const degrees=value=>((value*180/Math.PI+180)%360+360)%360-180;
    const fallback=()=>{if(!gone){setStatus('fallback');host.current?.setAttribute('data-renderer','fallback');if(!ready){ready=true;onReadyRef.current?.()}}};
    const load=async()=>{
      try {
        const libraryUrl=new URL('/assets/vendor/three.module.js',window.location.origin).href;
        const THREE=await import(/* @vite-ignore */ libraryUrl);if(gone)return;
        const {Scene,PerspectiveCamera,WebGLRenderer,Color,Group,Mesh,MeshPhysicalMaterial,MeshStandardMaterial,MeshBasicMaterial,ShaderMaterial,BoxGeometry,PlaneGeometry,Vector2,Vector3,Matrix4,WebGLRenderTarget,HalfFloatType,Raycaster,LatheGeometry,TorusGeometry,PMREMGenerator,BackSide,DoubleSide,ACESFilmicToneMapping}=THREE;
        renderer=new WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:false});
        // Register before any asynchronous HDR work. A restored GL context
        // needs fresh PMREM, shadow targets and materials before it can display.
        const loseContext=event=>{
          event.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;
          if(connectionStage&&everRendered.current)setShowJoinedPoster(true);
          fallback();
        };
        const restoreContext=()=>{if(!gone&&contextLost)setContextVersion(version=>version+1)};
        const surface=renderer.domElement;
        surface.addEventListener('webglcontextlost',loseContext);
        surface.addEventListener('webglcontextrestored',restoreContext);
        cleanup.push(()=>{surface.removeEventListener('webglcontextlost',loseContext);surface.removeEventListener('webglcontextrestored',restoreContext)});
        renderer.setPixelRatio(Math.min(devicePixelRatio,cinematic?1.5:1.75));renderer.setClearColor(cinematic?0x27343e:0xffffff,cinematic?1:0);renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=connectionStage?1.02:.94;
        if(litStage){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true}
        renderer.domElement.setAttribute('aria-hidden','true');canvasHost.current.appendChild(renderer.domElement);
        scene=new Scene();const camera=new PerspectiveCamera(30,1,.1,100),stageViewport=new Vector2(1,1);camera.position.set(0,0,12.4);
        // Real reflection cards in a neutral studio are integrated into a PMREM.
        // Broad rectangular highlights retain the cylindrical metal shape.
        const studio=new Scene();studio.background=new Color(connectionStage?'#8a939d':cinematic?'#89969f':'#a0a7af');
        const shellMaterial=connectionStage?new ShaderMaterial({side:BackSide,uniforms:{studioPhoto:{value:null},photoMix:{value:0}},vertexShader:'varying vec3 worldPosition;void main(){worldPosition=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(worldPosition,1.);}',fragmentShader:`
            varying vec3 worldPosition;
            uniform sampler2D studioPhoto;
            uniform float photoMix;
            void main(){
              vec3 direction=normalize(worldPosition);
              float angle=atan(direction.y,direction.z);
              vec2 uv=vec2(fract(atan(direction.z,direction.x)/6.283185+.63),asin(clamp(direction.y,-1.,1.))/3.141593+.5);
              vec3 photo=texture2D(studioPhoto,uv).rgb;
              photo=mix(vec3(dot(photo,vec3(.2126,.7152,.0722))),photo,.48);
              vec3 reflection=mix(vec3(.35,.38,.42),min(photo,vec3(10.))*.83+.11,photoMix);
              // The key is a broad diffusion scrim; a narrower strip grazes
              // the rim from the opposite side. A flag separates the two.
              float keyAngle=angle-.43-direction.x*.19;
              float key=1.-smoothstep(.17,.64,abs(keyAngle));
              float keyLength=1.-smoothstep(.44,.89,abs(direction.x+.08));
              reflection+=vec3(2.15,2.25,2.35)*key*keyLength;
              float fill=exp(-pow((angle+1.93+direction.x*.25)/.55,2.));
              reflection+=vec3(1.1,1.08,1.01)*fill;
              float rim=exp(-pow((angle-2.16+direction.x*.32)/.11,2.));
              reflection+=vec3(3.9,4.1,4.3)*rim;
              float returnCard=exp(-pow((angle-1.38-direction.x*.28)/.34,2.)-pow((direction.x+.15)/.35,2.));
              reflection+=vec3(.54,.50,.46)*returnCard;
              float flag=1.-smoothstep(.12,.48,abs(angle+.44-direction.x*.13));
              reflection*=1.-.88*flag*(1.-smoothstep(.49,.98,abs(direction.x-.24)));
              gl_FragColor=vec4(reflection,1.);
            }`}) :new MeshBasicMaterial({color:cinematic?'#9ea9b3':'#abb2b9',side:BackSide});materials.push(shellMaterial);
        const room=new Mesh(new BoxGeometry(100,30,60),shellMaterial);studio.add(room);meshes.push(room);
        function panel(w,h,x,y,z,rx,ry,color,intensity=1,softness=0){
          const ink=new Color(color).multiplyScalar(intensity);
          const m=softness?new ShaderMaterial({side:DoubleSide,uniforms:{ink:{value:ink},edge:{value:new Color(connectionStage?'#8b959e':'#abb2b9')},softness:{value:softness}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform vec3 ink;uniform vec3 edge;uniform float softness;void main(){float blend=smoothstep(0.,softness,vUv.y)*(1.-smoothstep(1.-softness,1.,vUv.y));gl_FragColor=vec4(mix(edge,ink,blend),1.);}'}):new MeshBasicMaterial({color:ink,side:DoubleSide});
          materials.push(m);const p=new Mesh(new PlaneGeometry(w,h),m);p.position.set(x,y,z);p.rotation.set(rx,ry,0);studio.add(p);meshes.push(p);return p;
        }
        if(connectionStage){
          host.current?.setAttribute('data-environment','gradient-studio');
        }else{
        panel(22,cinematic?3.2:4.5,-2,7,0,-Math.PI/2,0,'#ffffff',cinematic?1.8:1.9,cinematic?0:.32);
        panel(cinematic?2.4:3,15,-8,1,2,0,Math.PI/2,'#e6f1ff',cinematic?1.9:2.0);
        panel(32,cinematic?1.6:.95,0,2.6,8,0,0,'#ffffff',cinematic?2.2:2.8,cinematic?0:.12);
        panel(32,cinematic?1.55:1.6,0,-.4,9,0,0,cinematic?'#263440':'#56616d',1,cinematic?0:.4);
        panel(2.4,14,8,0,1.2,0,-Math.PI/2,cinematic?'#1b222d':'#515b67',1);
        panel(24,cinematic?.45:.35,0,-3.1,9,0,0,'#eef7ff',cinematic?1.8:1.35);
        panel(16,cinematic?1.6:3.2,0,-6,0,Math.PI/2,0,'#ffffff',cinematic?1.5:1.05);
        }
        pmrem=new PMREMGenerator(renderer);environment=pmrem.fromScene(studio,cinematic?.005:.01,.1,50);scene.environment=environment.texture;
        if(litStage){
          // Photographic softboxes give the steel natural, spatial reflections.
          // A small neutral fill preserves silver midtones in the white stage.
          // The local HDR is optional: a bounded fetch falls back to the studio
          // above, rather than delaying the opening or losing the 3D viewer.
          const request=new AbortController(),timeout=setTimeout(()=>request.abort(),1800);
          cleanup.push(()=>request.abort());
          let stopAbortListener;
          const cancelled=new Promise((_,reject)=>{
            const abort=()=>reject(new Error('Studio loading cancelled'));
            request.signal.addEventListener('abort',abort,{once:true});
            stopAbortListener=()=>request.signal.removeEventListener('abort',abort);
          });
          try{
            const [{RGBELoader},buffer]=await Promise.race([Promise.all([
              import(/* @vite-ignore */ new URL('/assets/vendor/RGBELoader.js',location.origin).href),
              fetch('/assets/environments/studio-small-09-1k.hdr',{signal:request.signal}).then(response=>{if(!response.ok)throw new Error('Studio unavailable');return response.arrayBuffer()}),
            ]),cancelled]);
            if(gone||contextLost)return;
            const parsed=new RGBELoader().parse(buffer);
            if(whiteStage)for(let i=0;i<parsed.data.length;i+=4)for(let c=0;c<3;c++)parsed.data[i+c]=THREE.DataUtils.toHalfFloat(Math.min(65504,THREE.DataUtils.fromHalfFloat(parsed.data[i+c])+.08));
            photographicStudio=new THREE.DataTexture(parsed.data,parsed.width,parsed.height,THREE.RGBAFormat,parsed.type);
            photographicStudio.colorSpace=THREE.LinearSRGBColorSpace;photographicStudio.minFilter=photographicStudio.magFilter=THREE.LinearFilter;
            photographicStudio.generateMipmaps=false;photographicStudio.flipY=true;photographicStudio.needsUpdate=true;
            if(connectionStage){
              shellMaterial.uniforms.studioPhoto.value=photographicStudio;
              shellMaterial.uniforms.photoMix.value=.5;
            }
            const photographicEnvironment=connectionStage?pmrem.fromScene(studio,.012,.1,70):pmrem.fromEquirectangular(photographicStudio);
            environment.dispose();environment=photographicEnvironment;scene.environment=environment.texture;
            host.current?.setAttribute('data-environment','photographic-studio');
          }catch{
            if(gone||contextLost)return;
            photographicStudio?.dispose();photographicStudio=null;
            host.current?.setAttribute('data-environment','studio-fallback');
          }finally{clearTimeout(timeout);stopAbortListener?.()}
        }
        // Bare polished steel: a sharp primary reflection with silver midtones,
        // rather than a dielectric clearcoat or diffuse satin highlights.
        const metal=new MeshPhysicalMaterial({color:connectionStage?'#e4e6e8':cinematic?'#ccd3d8':'#dfe3e7',metalness:1,vertexColors:true,roughness:connectionStage?.123:cinematic?.22:.12,clearcoat:0,envMapIntensity:connectionStage?1.19:cinematic?1.02:1.10});
        const pipeMetal=new MeshPhysicalMaterial({color:connectionStage?'#dedfe1':cinematic?'#ccd3d8':'#dfe3e7',metalness:1,vertexColors:true,roughness:connectionStage?.086:cinematic?.21:.125,envMapIntensity:connectionStage?1.19:cinematic?1.02:1.10});
        if(connectionStage){
          // A nearby studio reflects at a different angle at each end of a
          // seven-unit tube. Project the reflection ray onto its finite shell.
          const projectStudio=shader=>{
            shader.vertexShader='varying vec3 studioPosition;\n'+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n studioPosition=(modelMatrix*vec4(transformed,1.)).xyz;');
            const environmentCode=THREE.ShaderChunk.envmap_physical_pars_fragment.replace('vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );',`
              float along=dot(studioPosition,reflectVec);
              float distanceToStudio=sqrt(max(0.,along*along+225.-dot(studioPosition,studioPosition)))-along;
              vec3 sampleDirection=normalize(studioPosition+reflectVec*distanceToStudio);
              vec4 envMapColor=textureCubeUV(envMap,envMapRotation*sampleDirection,roughness);
            `);
            shader.fragmentShader='varying vec3 studioPosition;\n'+shader.fragmentShader.replace('#include <envmap_physical_pars_fragment>',environmentCode);
          };
          metal.onBeforeCompile=pipeMetal.onBeforeCompile=projectStudio;
        }
        const rubber=new MeshStandardMaterial({color:'#111318',metalness:0,roughness:.84});materials.push(metal,pipeMetal,rubber);
        const pose=new Group(),axial=new Group(),coupling=new Group(),left=new Group(),right=new Group();scene.add(pose);pose.add(axial);axial.rotation.z=-Math.PI/2;axial.add(coupling,left,right);
        if(litStage){
          // A transparent white-stage receiver keeps the page's ice-blue wash
          // visible. Its shadow is projected from the real assembly geometry.
          // Tilting the receiver into view gives the existing hero camera a
          // shallow spatial stage without changing the established product angle.
          const shadowMaterial=new THREE.ShadowMaterial({color:'#718095',opacity:connectionStage?.21:.09,depthWrite:false});
          // Preserve the projected silhouette, attenuating its alpha only near
          // the canvas edges so rotated poses cannot expose a hard crop line.
          shadowMaterial.onBeforeCompile=shader=>{shader.uniforms.stageViewport={value:stageViewport};shader.fragmentShader='uniform vec2 stageViewport;\n'+shader.fragmentShader.replace('#include <tonemapping_fragment>','vec2 stageUv = gl_FragCoord.xy / stageViewport;\ngl_FragColor.a *= smoothstep(.025, .17, stageUv.y) * smoothstep(.015, .07, stageUv.x) * (1.0 - smoothstep(.93, .985, stageUv.x));\n#include <tonemapping_fragment>')};
          const receiver=new Mesh(new PlaneGeometry(50,32),shadowMaterial);receiver.position.set(0,-.3,connectionStage?-2.2:-6.3);receiver.rotation.x=connectionStage?-.18:-.28;receiver.receiveShadow=true;
          scene.add(receiver);meshes.push(receiver);materials.push(shadowMaterial);
          stageLight=new THREE.DirectionalLight('#eff6ff',0);stageLight.position.set(connectionStage?-3:-.8,connectionStage?5:2.4,24);stageLight.target.position.set(0,-.3,0);stageLight.castShadow=true;
          stageLight.shadow.mapSize.set(1024,1024);stageLight.shadow.camera.left=-13;stageLight.shadow.camera.right=13;stageLight.shadow.camera.top=11;stageLight.shadow.camera.bottom=-11;stageLight.shadow.camera.near=1;stageLight.shadow.camera.far=45;
          stageLight.shadow.bias=-.0003;stageLight.shadow.normalBias=.025;stageLight.shadow.radius=connectionStage?10:18;stageLight.shadow.blurSamples=16;
          scene.add(stageLight,stageLight.target);
        }
        if(cinematic){
          // A real studio backdrop and a planar reflection, rendered from a
          // mirrored camera. No raster stand-in is used for the moving metal.
          const backdropMaterial=new ShaderMaterial({uniforms:{base:{value:new Color('#25333e')},light:{value:new Color('#71828d')}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec2 vUv;uniform vec3 base;uniform vec3 light;void main(){float beam=exp(-pow((vUv.y-vUv.x*.24-.36)/.085,2.0));float glow=exp(-length((vUv-vec2(.67,.58))*vec2(3.8,2.8)));vec3 col=mix(base,light,.17*beam+.27*glow);gl_FragColor=vec4(col,1.0);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.152941,.203922,.243137),1.0-smoothstep(.32,.48,vUv.y));}`.replace(';#include',';\n#include')});
          const backdrop=new Mesh(new PlaneGeometry(80,42),backdropMaterial);backdrop.position.set(0,8,-17);scene.add(backdrop);materials.push(backdropMaterial);meshes.push(backdrop);
          reflectionTarget=new WebGLRenderTarget(1024,768,{type:HalfFloatType,depthBuffer:true,samples:0});
          const textureMatrix=new Matrix4(),mirrorCamera=new PerspectiveCamera(),direction=new Vector3(),target=new Vector3();
          const floorMaterial=new ShaderMaterial({uniforms:{reflection:{value:reflectionTarget.texture},projection:{value:textureMatrix},floorColor:{value:new Color('#344651')}},vertexShader:`uniform mat4 projection;varying vec4 reflectedUv;varying vec3 worldPosition;void main(){reflectedUv=projection*vec4(position,1.0);worldPosition=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D reflection;uniform vec3 floorColor;varying vec4 reflectedUv;varying vec3 worldPosition;void main(){vec2 uv=reflectedUv.xy/reflectedUv.w;float r=.006;vec3 reflected=texture2D(reflection,uv).rgb*.36;reflected+=(texture2D(reflection,uv+vec2(r,0.0)).rgb+texture2D(reflection,uv-vec2(r,0.0)).rgb+texture2D(reflection,uv+vec2(0.0,r)).rgb+texture2D(reflection,uv-vec2(0.0,r)).rgb)*.16;float depth=length(worldPosition-cameraPosition);float strength=mix(.30,.04,smoothstep(12.0,45.0,depth));vec3 col=mix(floorColor,reflected*.76,strength);gl_FragColor=vec4(col,1.0);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.152941,.203922,.243137),smoothstep(16.0,28.0,depth));}`.replace(';#include',';\n#include')});
          const floor=new Mesh(new PlaneGeometry(100,100),floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-1.55;scene.add(floor);meshes.push(floor);materials.push(floorMaterial);
          floor.onBeforeRender=(render,world,view)=>{
            if(view===mirrorCamera)return;
            const planeY=floor.position.y;
            mirrorCamera.position.copy(view.position);mirrorCamera.position.y=2*planeY-view.position.y;
            view.getWorldDirection(direction);target.copy(view.position).add(direction);target.y=2*planeY-target.y;
            mirrorCamera.up.copy(view.up);mirrorCamera.up.y*=-1;mirrorCamera.lookAt(target);mirrorCamera.near=view.near;mirrorCamera.far=view.far;
            mirrorCamera.projectionMatrix.copy(view.projectionMatrix);mirrorCamera.projectionMatrixInverse.copy(view.projectionMatrixInverse);mirrorCamera.updateMatrixWorld();
            textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(mirrorCamera.projectionMatrix).multiply(mirrorCamera.matrixWorldInverse).multiply(floor.matrixWorld);
            const previousTarget=render.getRenderTarget(),xr=render.xr.enabled;floor.visible=false;render.xr.enabled=false;
            render.setRenderTarget(reflectionTarget);render.clear();render.render(world,mirrorCamera);render.setRenderTarget(previousTarget);render.xr.enabled=xr;floor.visible=true;
          };
        }
        const pickSurfaces=[];
        function lathe(points,material,parent,innerStart=-1,innerEnd=-1){
          const geometry=new LatheGeometry(points,160),colors=[],halfLength=Math.max(...points.map(point=>Math.abs(point.y)));
          for(let segment=0;segment<=160;segment++)for(let j=0;j<points.length;j++){
            const interior=j>=innerStart&&j<=innerEnd;
            // Let the mouth catch light, with shading deepening into the bore.
            // The rubber stays dark; the steel does not turn black at the rim.
            const depth=Math.abs(points[j].y)/halfLength;
            const shade=connectionStage ? .06+.41*Math.pow(depth,parent===coupling?2.8:5) :
              litStage ? (parent===coupling ? .34+.22*Math.pow(depth,2.8) : .48) : .33;
            const c=interior?shade:1;colors.push(c,c,c);
          }
          geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const mesh=new Mesh(geometry,material);mesh.castShadow=litStage;parent.add(mesh);meshes.push(mesh);
          if(connectionStage){
            // Keep the socket ridges, open ends and bore in the hit surface.
            // The polished model keeps its full resolution for rendering.
            const profile=parent===coupling ? points.filter((point,index)=>{
              const y=Math.abs(point.y);
              return y>=half-.04 || (Math.abs(y-1.34)<.2 ? index%3===0 : index%16===0);
            }) : points;
            const pick=new Mesh(new LatheGeometry(profile,40),material);
            pick.visible=false;
            parent.add(pick);
            meshes.push(pick);
            pickSurfaces.push(pick);
          }
          return mesh;
        }
        const shape=[],steps=180,half=1.62;
        // End beads are part of the shell profile; the socket remains a single
        // smooth, thin-walled component with a continuous internal bore.
        for(let i=0;i<=steps;i++){const y=-half+2*half*i/steps;const bead=(connectionStage?.078:.125)*Math.exp(-Math.pow((Math.abs(y)-(connectionStage?1.34:1.29))/(connectionStage?.082:.145),2));const lip=connectionStage?.012*Math.exp(-Math.pow((Math.abs(y)-1.604)/.020,2)):.01*Math.exp(-Math.pow((Math.abs(y)-1.59)/.045,2));shape.push(new Vector2((connectionStage?1.065:1.08)+bead+lip,y))}
        // The socket mouth turns back through a tiny rounded metal hem.
        // This catches a separate edge reflection without adding another bead.
        if(connectionStage)shape.push(...[[1.076,1.628],[1.068,1.633],[1.058,1.638],[1.025,1.638],[1.013,1.63],[1.012,half]].map(p=>new Vector2(...p)));
        else shape.push(new Vector2(1.068,half+.018),new Vector2(1.025,half+.018),new Vector2(1.012,half));
        const insideStart=shape.length;
        for(let i=steps;i>=0;i--){const y=-half+2*half*i/steps;const recess=.095*Math.exp(-Math.pow((Math.abs(y)-(connectionStage?1.34:1.29))/(connectionStage?.082:.145),2));shape.push(new Vector2(1.012+recess,y))}
        const insideEnd=shape.length-1;
        if(connectionStage)shape.push(...[[1.013,-1.63],[1.025,-1.638],[1.058,-1.638],[1.068,-1.633],[1.076,-1.628],[shape[0].x,-half]].map(p=>new Vector2(...p)));
        else shape.push(new Vector2(1.025,-half-.018),new Vector2(1.068,-half-.018),new Vector2(1.08,-half));
        lathe(shape,metal,coupling,connectionStage?insideStart:steps+4,connectionStage?insideEnd:steps*2+(litStage?4:3));
        [-1,1].forEach(sign=>{const gasket=new Mesh(new TorusGeometry(1.028,.066,24,128),rubber);gasket.rotation.x=Math.PI/2;gasket.position.y=sign*(connectionStage?1.34:1.29);coupling.add(gasket);meshes.push(gasket)});
        const length=connectionStage?7.2:whiteStage?4.3:3.3,radius=.982,wall=.04,tubeExtension=(length-3.3)/2;
        const tubeShape=[new Vector2(radius,-length/2),new Vector2(radius,length/2-.01),new Vector2(radius-.008,length/2),new Vector2(radius-wall+.008,length/2),new Vector2(radius-wall,length/2-.01),new Vector2(radius-wall,-length/2+.01),new Vector2(radius-wall+.008,-length/2),new Vector2(radius-.008,-length/2),new Vector2(radius,-length/2)];
        // Collinear support vertices confine bevel normals to the rim, without
        // changing the tube silhouette, length, diameter or wall thickness.
        const h=length/2,r=radius,w=wall;
        const polishedTubeShape=litStage?[[r,-h],[r,-h+.04],[r,h-.05],[r,h-.01],[r-.008,h],[r-w+.008,h],[r-w,h-.01],[r-w,h-.05],[r-w,-h+.05],[r-w,-h+.01],[r-w+.008,-h],[r-.008,-h],[r,-h]].map(point=>new Vector2(...point)):tubeShape;
        if(connectionStage)polishedTubeShape.splice(8,0,...[h*.85,h*.54,0,-h*.54,-h*.85].map(y=>new Vector2(r-w,y)));
        const innerEnd=connectionStage?14:litStage?9:5;
        lathe(polishedTubeShape,pipeMetal,left,litStage?6:4,innerEnd);lathe(polishedTubeShape,pipeMetal,right,litStage?6:4,innerEnd);
        left.position.y=-(4.35+tubeExtension);right.position.y=4.35+tubeExtension;
        // Mesh scale is only an entrance reveal while tubes are invisible.
        // Once visible, both tube pieces have identical diameter and length.
        const raycaster=new Raycaster(),pointer=new Vector2(),fitPoint=new Vector3();
        // Fit the actual round silhouette, rather than the empty corners of a
        // large assembly bounding box. This retains the original hero scale.
        const ringSamples=rings=>rings.flatMap(([y,r])=>Array.from({length:24},(_,i)=>new Vector3(Math.cos(i*Math.PI/12)*r,y,Math.sin(i*Math.PI/12)*r)));
        const fitGroups=[{group:coupling,points:ringSamples([[-half,1.08],[-1.29,1.205],[1.29,1.205],[half,1.08]])},... [left,right].map(group=>({group,points:ringSamples([[-length/2,radius],[length/2,radius]])}))];
        let width=0,height=0,resizePending=true,lastShadowPose='',lastReport=-Infinity;
        // setSize clears the drawing buffer. Only resize together with a
        // real draw, never in a paused background tab or a hidden section.
        const resize=()=>{resizePending=true;wake()};
        function apply(dt,elapsed){
          if(resizePending){
            const box=canvasHost.current.getBoundingClientRect();
            const w=Math.round(box.width),h=Math.round(box.height);
            if(w<2||h<2)return;
            if(w!==width||h!==height){
              width=w;height=h;renderer.setSize(width,height,false);
              if(litStage)renderer.getDrawingBufferSize(stageViewport);
              camera.aspect=width/height;camera.updateProjectionMatrix();
            }
            resizePending=false;
          }
          const damp=1-Math.exp(-dt*9),slow=1-Math.exp(-dt*5);
          const entrance=controlledEntrance();
          if(entryLocked()){
            hovered=couplingHovered=false;state.hover=state.approach=state.hoverX=state.hoverY=0;state.light=state.lightTarget=0;
            const element=host.current,captured=drag;drag=null;
            if(captured&&element?.hasPointerCapture(captured.id))element.releasePointerCapture(captured.id);
            element?.removeAttribute('data-dragging');element?.setAttribute('data-hit','false');element?.setAttribute('data-coupling-hover','false');
          }
          state.yaw+=(state.yawTarget-state.yaw)*damp;state.pitch+=(state.pitchTarget-state.pitch)*damp;state.spread+=(state.spreadTarget-state.spread)*slow;state.light+=(state.lightTarget-state.light)*slow;state.hover+=((hovered?1:0)-state.hover)*slow;
          state.approach+=((litStage&&couplingHovered&&!reduced?1:0)-state.approach)*slow;
          // The same public entry event starts both type and the real 3D shot.
          // Until the loading cover leaves, render a complete, motionless assembly.
          if(reduced)state.intro=1;
          else if(entrance)state.intro=clamp(Number.isFinite(entrance.progress)?entrance.progress:0,0,1);
          else if(introAllowed)state.intro=Math.min(1,state.intro+dt/2.5);
          // A controlled shot uses the master's easing directly; independent
          // presentations retain the original local cubic entrance.
          const intro=entrance?state.intro:1-Math.pow(1-state.intro,3),spread=state.spread,shot=reduced?0:idle*Math.PI*2/18;
          const glance=reduced?0:state.hover*.018;
          let insertion=0;
          if(connectionStage){
            insertion=reduced?1:0;
            if(!reduced&&entrance?.complete){
              if(!drag&&!hovered&&!keyboardInspection)cycle=(cycle+elapsed)%9.6;
              // Start open so the first view explains the mating parts.
              // Each end of a move settles to zero velocity before the hold.
              const smooth=value=>{const t=clamp(value,0,1);return t*t*t*(t*(t*6-15)+10)};
              insertion=smooth((cycle-1.15)/1.9)-smooth((cycle-6.5)/1.85);
            }
          }
          if(connectionStage){
            pose.rotation.set(-.045+state.pitch*.65,.28+state.yaw*.75+state.hoverX*glance,.18);
            pose.position.set(.55,-.08,0);pose.scale.setScalar(1);
          }else if(cinematic){
            pose.rotation.set(-.012+state.pitch*.28,.64+state.yaw*.7+Math.sin(shot)*.035-(1-intro)*.08,.006);
            pose.position.set(camera.aspect*1.1,0,0);pose.scale.setScalar(width/height<1.1?1.02:1.28);
          }else{
            pose.rotation.set(-.12+state.pitch+state.hoverY*glance,.59+state.yaw-(1-intro)*.14+state.hoverX*glance,.25);
            pose.position.set(2.0*(1-spread)+.2*spread,-.23,0);
            const fullScale=width/height<1.2?1.0:1.5;
            pose.scale.setScalar(fullScale*(1-spread*.25));
          }
          // Extend each tube away from the coupling, leaving both mating ends
          // in their original positions and retaining equal connection gaps.
          const tubeCenter=connectionStage?length/2+.06+(1-insertion)*(half+1.10-.06):(cinematic?4.8:4.1)+(1-spread)*1.2+tubeExtension;
          left.position.y=-tubeCenter;right.position.y=tubeCenter;
          left.visible=right.visible=connectionStage||spread>.015;
          // Alpha reveal avoids changing the physical diameter of either tube.
          pipeMetal.transparent=!connectionStage&&spread<.995;pipeMetal.opacity=connectionStage?1:Math.min(1,spread*1.6);
          // A real studio reflection passes around the metal, never a painted
          // overlay. Mouse light and idle light are separate states.
          scene.environmentRotation.y=state.light-(reduced?0:(1-intro)*(connectionStage?.12:.27));
          scene.environmentRotation.x=reduced?0:state.hoverY*state.hover*.035;
          scene.updateMatrixWorld(true);
          if(connectionStage){
            // The complete connection stays in frame while the long tube tails
            // deliberately extend past the edges, matching the product portrait.
            camera.position.set(0,0,Math.max(8.65,8.95*(2.65/Math.max(1.5,camera.aspect)))*1.1+(1-intro)*.65-state.approach*.12);
            camera.updateMatrixWorld();
          }else if(cinematic){
            // The near socket stays clear of the copy. Tube tails may extend
            // beyond the frame, while both mating ends remain in the shot.
            camera.position.set(Math.sin(shot)*.12,4.95+Math.sin(shot)*.10,13.25+Math.cos(shot)*.24+(1-intro)*.6);
            camera.lookAt(0,1.12,0);camera.updateMatrixWorld();
            for(let attempt=0;attempt<3;attempt++){
              let outside=false;
              for(const sample of fitGroups){if(!sample.group.visible)continue;for(const point of sample.points){if(sample.group!==coupling&&Math.abs(point.y-(sample.group===left?length/2:-length/2))>.01)continue;fitPoint.copy(point).applyMatrix4(sample.group.matrixWorld).project(camera);if(fitPoint.x>.97||fitPoint.x<-.96||fitPoint.y<-.82)outside=true}}
              if(!outside)break;camera.position.z+=.3;camera.lookAt(0,1.12,0);camera.updateMatrixWorld();
            }
          }else{
            const tangent=Math.tan(camera.fov*Math.PI/360);
            let fit=12.4+spread*.85;
            for(const sample of fitGroups){if(!sample.group.visible)continue;for(const point of sample.points){fitPoint.copy(point).applyMatrix4(sample.group.matrixWorld);fit=Math.max(fit,Math.abs(fitPoint.y)*1.035/tangent+fitPoint.z,Math.abs(fitPoint.x)*1.035/(tangent*camera.aspect)+fitPoint.z)}}
            // Reserve the small approach before fitting: even at maximum hover
            // the complete assembly retains the original safe silhouette bounds.
            camera.position.z=(whiteStage?fit/.97*(1-state.approach*.03):fit)+(1-intro)*.25;
            camera.updateMatrixWorld();
          }
          if(litStage){
            // Camera and reflection-light movement do not invalidate the shadow.
            const shadowPose=[...pose.rotation.toArray().slice(0,3),pose.scale.x,pose.position.x,spread,insertion].map(v=>v.toFixed(4)).join(',');
            if(shadowPose!==lastShadowPose){renderer.shadowMap.needsUpdate=true;lastShadowPose=shadowPose}
          }
          renderer.render(scene,camera);
          if(renderer.getContext().isContextLost())return;
          // These values describe the shot to inspection tools. The renderer
          // owns the animation and does not need a DOM mutation per frame.
          if(!connectionStage || !ready || reduced || last-lastReport>=120){
            lastReport=last;
            if(litStage){
              host.current?.setAttribute('data-camera-distance',camera.position.z.toFixed(3));
              host.current?.setAttribute('data-camera-approach',state.approach.toFixed(3));
            }
            host.current?.setAttribute('data-spread',spread.toFixed(3));
            host.current?.setAttribute('data-tube-length',length.toFixed(3));
            if(connectionStage)host.current?.setAttribute('data-assembly-progress',insertion.toFixed(3));
            host.current?.setAttribute('data-connection-gap',(tubeCenter-length/2-half-.018).toFixed(3));
            host.current?.setAttribute('data-rotation',degrees(state.yaw).toFixed(2));
            host.current?.setAttribute('data-pitch',state.pitch.toFixed(3));
            host.current?.setAttribute('data-light',state.light.toFixed(3));
            if(cinematic)host.current?.setAttribute('data-shot',(idle%18).toFixed(3));
            host.current?.setAttribute('data-entry-progress',state.intro.toFixed(3));
            host.current?.setAttribute('data-entry-controlled',String(Boolean(entrance)));
            host.current?.setAttribute('data-controls-locked',String(interactionLocked()));
            host.current?.setAttribute('data-intro',entrance?(reduced||entrance.complete?'complete':introAllowed||state.intro>0?'running':'waiting'):!introAllowed?'waiting':state.intro<1?'running':'complete');
          }
          if(!ready){
            ready=true;
            if(connectionStage&&openingImage&&fallbackImage&&!everRendered.current){
              const joinedPoster=new Image();joinedPoster.src=fallbackImage;
            }
            everRendered.current=true;
            setStatus('ready');host.current?.setAttribute('data-renderer','webgl');onReadyRef.current?.();
          }
        }
        const active=()=>!contextLost&&visible&&focused&&!document.hidden&&document.documentElement.dataset.dialogOpen!=='true'&&!navigationOpen();
        const tick=now=>{frame=0;if(gone||!active())return;const elapsed=last?(now-last)/1000:0,dt=Math.min(.05,elapsed);last=now;
          if(!reduced&&introAllowed&&!entryLocked()){if(!drag)idle+=dt;state.lightTarget=cinematic?Math.sin(idle*Math.PI*2/18)*.16+(hovered?state.hoverX*.06:0):connectionStage?Math.sin(idle*Math.PI*2/22)*.07+(hovered?state.hoverX*.06:0):whiteStage?Math.sin(idle*Math.PI*2/24)*.065+(hovered?state.hoverX*.04:0):hovered?state.hoverX*.19:Math.sin(idle*.48)*.085}else state.lightTarget=0;
          apply(dt,elapsed);
          const settling=state.intro<1||Math.abs(state.yaw-state.yawTarget)>.0002||Math.abs(state.pitch-state.pitchTarget)>.0002||Math.abs(state.spread-state.spreadTarget)>.0002||Math.abs(state.light-state.lightTarget)>.0002;
          const controlledRunning=Boolean(controlledEntrance())&&!reduced&&!controlledEntrance().complete;
          if((introAllowed||controlledRunning)&&(!reduced||settling))frame=requestAnimationFrame(tick);
        };
        function wake(){if(!gone&&!frame&&active()){last=0;frame=requestAnimationFrame(tick)}}
        controls.current={wake,explode(value){state.spreadTarget=value?1:0;if(reduced)state.spread=state.spreadTarget;wake()},rotate(value){if(interactionLocked())return;state.yawTarget=clamp(value*Math.PI/180,...yawLimits);wake()}};
        const el=host.current;
        const hit=e=>{if(interactionLocked())return false;const rect=canvasHost.current.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);const hits=connectionStage?raycaster.intersectObjects(pickSurfaces,false):raycaster.intersectObject(pose,true);hovered=hits.length>0;couplingHovered=litStage&&hits[0]?.object.parent===coupling;el.dataset.hit=String(hovered);if(litStage)el.dataset.couplingHover=String(couplingHovered);if(hovered){state.hoverX=pointer.x;state.hoverY=pointer.y}return hovered};
        const down=e=>{if(interactionLocked()||e.button!==0||e.isPrimary===false||!hit(e))return;keyboardInspection=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:state.yawTarget,pitch:state.pitchTarget};el.setPointerCapture(e.pointerId);el.dataset.dragging='true';el.focus({preventScroll:true});wake()};
        const move=e=>{if(interactionLocked())return;if(drag&&e.pointerId===drag.id){state.yawTarget=clamp(drag.yaw+(e.clientX-drag.x)*.0026,...yawLimits);state.pitchTarget=clamp(drag.pitch+(e.clientY-drag.y)*.0018,...pitchLimits);state.hoverX=clamp((e.clientX/innerWidth-.5)*2,-1,1);onRotateRef.current?.(degrees(state.yawTarget));if(e.cancelable)e.preventDefault();}else hit(e);wake()};
        const up=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;delete el.dataset.dragging;if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);wake()};
        const leave=()=>{if(!drag){hovered=couplingHovered=false;el.dataset.hit='false';if(litStage)el.dataset.couplingHover='false';wake()}};
        const begin=()=>{introAllowed=true;wake()};
        const key=e=>{if(interactionLocked())return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();keyboardInspection=true;if(e.key==='Home'){state.yawTarget=state.pitchTarget=0}else if(e.key==='ArrowLeft')state.yawTarget=clamp(state.yawTarget-.08,...yawLimits);else if(e.key==='ArrowRight')state.yawTarget=clamp(state.yawTarget+.08,...yawLimits);else state.pitchTarget=clamp(state.pitchTarget+(e.key==='ArrowDown'?.06:-.06),...pitchLimits);onRotateRef.current?.(degrees(state.yawTarget));wake()}};
        const inspectFocus=()=>{keyboardInspection=el.matches(':focus-visible')},endInspect=()=>{keyboardInspection=false;wake()};
        const observeVisibility=()=>{
          el.dataset.navPaused=String(navigationOpen());el.dataset.controlsLocked=String(interactionLocked());
          if(active()){wake();return}
          cancelAnimationFrame(frame);frame=0;
          if(connectionStage){
            hovered=couplingHovered=false;el.dataset.hit='false';el.dataset.couplingHover='false';
            if(drag){const id=drag.id;drag=null;delete el.dataset.dragging;if(el.hasPointerCapture(id))el.releasePointerCapture(id)}
          }
        };
        const navigationChange=()=>{if(navigationOpen()&&drag){const captured=drag;drag=null;delete el.dataset.dragging;if(el.hasPointerCapture(captured.id))el.releasePointerCapture(captured.id)}observeVisibility()};
        const blur=()=>{focused=false;observeVisibility()},focus=()=>{focused=true;observeVisibility()};
        const mediaChange=()=>{reduced=media.matches;if(reduced){cycle=3.1;state.intro=1;state.spread=state.spreadTarget;state.light=state.lightTarget=0;state.hover=state.approach=0}wake()};
        for(const [target,event,handler] of [[el,'pointerdown',down],[el,'pointermove',move],[el,'pointerleave',leave],[el,'pointerup',up],[el,'pointercancel',up],[el,'lostpointercapture',up],[el,'keydown',key],[el,'focus',inspectFocus],[el,'blur',endInspect],[document,'visibilitychange',observeVisibility],[window,'mh-intro-ready',begin],[window,'mh-dialog-change',observeVisibility],[window,'mh-navigation-change',navigationChange],[window,'blur',blur],[window,'focus',focus],[media,'change',mediaChange]]){target.addEventListener(event,handler);cleanup.push(()=>target.removeEventListener(event,handler))}
        introAllowed=document.documentElement.dataset.booting!=='true';
        observeVisibility();
        observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;observeVisibility()},{threshold:.01});observer.observe(el);
        resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvasHost.current);resize();
      } catch(e){console.warn('MH PIPE product viewer fallback:',e.message);fallback()}
    };load();
    return()=>{gone=true;controls.current=null;cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();cleanup.forEach(fn=>fn());meshes.forEach(m=>m.geometry?.dispose());materials.forEach(m=>m.dispose());stageLight?.shadow.dispose();reflectionTarget?.dispose();environment?.dispose();photographicStudio?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove()};
  },[presentation,contextVersion]);
  return <div ref={host} className={'precision-product precision-product--'+status} tabIndex={0} role="group" aria-roledescription={lang==='zh'?'交互式三维产品':'Interactive 3D product'} aria-label={lang==='zh'?'完整连接结构。拖动或用方向键旋转，Home 键恢复视角。':'Complete connection assembly. Drag or use arrow keys to rotate; Home restores the view.'} aria-description={lang==='zh'?'连接结构示意，尺寸以产品图纸为准。':'Connection study. Dimensions follow the product drawing.'} data-state={status} data-exploded={assembly} data-presentation={presentation}>
    <picture>
      {connectionStage&&openingImage&&fallbackImage&&<source media="(prefers-reduced-motion: reduce)" srcSet={fallbackImage}/>}
      <img className="precision-product-fallback" src={(connectionStage&&!showJoinedPoster&&openingImage)||fallbackImage||(assembly?'/assets/products/connection-assembly.png':'/assets/products/coupling.png')} fetchPriority={connectionStage?'high':undefined} alt={lang==='zh'?(assembly?'直通与两段配套管材的连接结构':'不锈钢直通管件'):(assembly?'Coupling and two matching straight pipe sections':'Stainless steel coupling')} draggable="false"/>
    </picture>
    <div className="precision-product-canvas" ref={canvasHost}/>
  </div>
}
