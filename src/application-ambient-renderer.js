/** Contact shading and an in-place handoff between two live architectural views.
 * The scene remains interactive; only the short handoff needs a second target. */
export function createAmbientRenderer(T,renderer){
 const stats=()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});
 // A low-capability context still presents a complete scene at every frame.
 // Avoid clamping un-tonemapped HDR light into an unsigned-byte offscreen target.
 if(!renderer.extensions.has('EXT_color_buffer_float'))return {
  resize(){},
  render(scene,camera){renderer.render(scene,camera);return stats();},
  renderTransition(scene,camera,configureOutgoing,configureIncoming,mix){
   try{(mix<.5?configureOutgoing:configureIncoming)();renderer.render(scene,camera);return stats();}
   finally{configureIncoming();}
  },
  dispose(){},
 };
 const makeTarget=()=>{
  const target=new T.WebGLRenderTarget(1,1,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,type:T.HalfFloatType,samples:4});
  target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
  return target;
 };
 const targets=[makeTarget(),null],inverse=[new T.Matrix4(),new T.Matrix4()],scales=[1,1];
 let width=1,height=1,disposed=false;
 const outputPremultiplied=renderer.getContext().getContextAttributes()?.premultipliedAlpha!==false;
 const material=new T.ShaderMaterial({
  uniforms:{
   colorMapA:{value:targets[0].texture},depthMapA:{value:targets[0].depthTexture},
   colorMapB:{value:targets[0].texture},depthMapB:{value:targets[0].depthTexture},
   resolution:{value:new T.Vector2(1,1)},inverseProjectionA:{value:inverse[0]},inverseProjectionB:{value:inverse[1]},
   projectionScaleA:{value:1},projectionScaleB:{value:1},handoff:{value:0},outputPremultiplied:{value:outputPremultiplied?1:0},
  },
  vertexShader:'varying vec2 uvScreen; void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
   varying vec2 uvScreen;
   uniform sampler2D colorMapA;
   uniform sampler2D depthMapA;
   uniform sampler2D colorMapB;
   uniform sampler2D depthMapB;
   uniform vec2 resolution;
   uniform mat4 inverseProjectionA;
   uniform mat4 inverseProjectionB;
   uniform float projectionScaleA;
   uniform float projectionScaleB;
   uniform float handoff;
   uniform float outputPremultiplied;
   vec3 viewPoint(vec2 uv,float depth,mat4 inverseProjection){
    vec4 point=inverseProjection*vec4(uv*2.-1.,depth*2.-1.,1.);return point.xyz/point.w;
   }
   vec4 shaded(sampler2D colorMap,sampler2D depthMap,mat4 inverseProjection,float projectionScale){
    // Standard alpha blending into transparent black stores associated RGB.
    vec4 color=texture2D(colorMap,uvScreen);
    if(color.a<.00001)return vec4(0.);
    color.rgb/=color.a;
    float depth=texture2D(depthMap,uvScreen).x;
    if(depth<.99999 && color.a>.01){
     vec3 point=viewPoint(uvScreen,depth,inverseProjection);
     vec3 normal=normalize(cross(dFdx(point),dFdy(point)));
     float pixelRadius=clamp(resolution.y*projectionScale*.55/max(-point.z,1.),5.,56.);
     float occlusion=0.;
     for(int i=0;i<16;i++){
      float angle=float(i)*2.399963;float ring=.2+.8*sqrt((float(i)+.5)/16.);
      vec2 offset=vec2(cos(angle),sin(angle))*pixelRadius*ring/resolution;
      vec2 sampleUv=clamp(uvScreen+offset,vec2(.001),vec2(.999));
      float sampleDepth=texture2D(depthMap,sampleUv).x;
      vec3 delta=viewPoint(sampleUv,sampleDepth,inverseProjection)-point;
      float distanceToSample=length(delta);
      float facing=max(0.,dot(normal,delta/max(distanceToSample,.0001))-.1);
      float range=1.-smoothstep(.02,1.2,distanceToSample);
      occlusion+=facing*range*step(sampleDepth,.99999);
     }
     color.rgb*=1.-clamp(occlusion/16.*2.8,0.,.44);
    }
    #ifdef TONE_MAPPING
     color.rgb=toneMapping(color.rgb);
    #endif
    return vec4(color.rgb*color.a,color.a);
   }
   void main(){
    vec4 color;
    if(handoff<=0.)color=shaded(colorMapA,depthMapA,inverseProjectionA,projectionScaleA);
    else if(handoff>=1.)color=shaded(colorMapB,depthMapB,inverseProjectionB,projectionScaleB);
    else color=mix(shaded(colorMapA,depthMapA,inverseProjectionA,projectionScaleA),shaded(colorMapB,depthMapB,inverseProjectionB,projectionScaleB),handoff);
    // Blend associated linear RGB, then encode a straight color only once.
    gl_FragColor=vec4(color.a>.00001?color.rgb/color.a:vec3(0.),color.a);
    #include <colorspace_fragment>
    gl_FragColor.rgb*=mix(1.,gl_FragColor.a,outputPremultiplied);
   }
  `,
  transparent:false,depthTest:false,depthWrite:false,toneMapped:true,blending:T.NoBlending,
 });
 const scene=new T.Scene(),camera=new T.Camera(),quad=new T.Mesh(new T.PlaneGeometry(2,2),material);scene.add(quad);
 const clearColor=new T.Color();
 function ensureSecond(){
  if(targets[1])return;
  targets[1]=makeTarget();targets[1].setSize(width,height);
  material.uniforms.colorMapB.value=targets[1].texture;material.uniforms.depthMapB.value=targets[1].depthTexture;
 }
 function capture(index,world,view){
  inverse[index].copy(view.projectionMatrixInverse);scales[index]=view.projectionMatrix.elements[5];
  renderer.setRenderTarget(targets[index]);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(world,view);
  return stats();
 }
 function present(output,mix){
  const uniforms=material.uniforms;
  uniforms.projectionScaleA.value=scales[0];uniforms.projectionScaleB.value=scales[1];uniforms.handoff.value=mix;
  renderer.setRenderTarget(output);renderer.render(scene,camera);
 }
 function withRendererState(draw){
  if(disposed)return {calls:0,triangles:0};
  const output=renderer.getRenderTarget(),alpha=renderer.getClearAlpha();renderer.getClearColor(clearColor);
  try{return draw(output);}
  finally{renderer.setClearColor(clearColor,alpha);renderer.setRenderTarget(output);}
 }
 return {
  resize(w,h){
   const dpr=renderer.getPixelRatio();width=Math.max(1,Math.round(w*dpr));height=Math.max(1,Math.round(h*dpr));
   targets.forEach(target=>target?.setSize(width,height));material.uniforms.resolution.value.set(width,height);
  },
  render(world,view){return withRendererState(output=>{const result=capture(0,world,view);present(output,0);return result;});},
  renderTransition(world,view,configureOutgoing,configureIncoming,mix){
   return withRendererState(output=>{
    ensureSecond();const amount=Number.isFinite(mix)?T.MathUtils.clamp(mix,0,1):1;
    try{
     // Keep both passes current: animated water, machinery and pipe flow are
     // evaluated by the owning RAF before it calls this compositor.
     configureOutgoing();const outgoing=capture(0,world,view);
     configureIncoming();const incoming=capture(1,world,view);
     present(output,amount);
     return {calls:outgoing.calls+incoming.calls,triangles:outgoing.triangles+incoming.triangles};
    }finally{configureIncoming();}
   });
  },
  dispose(){
   if(disposed)return;disposed=true;
   targets.forEach(target=>{if(target){target.dispose();target.depthTexture.dispose();}});
   material.dispose();quad.geometry.dispose();
  },
 };
}
