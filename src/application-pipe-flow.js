/** A surface flow cue for the architectural pipe networks. The silver pipe is
 * always opaque; this narrow, depth-tested overlay only communicates direction. */
export function createPipeFlow(T,models){
 const records=[],byScene=models.map(()=>[]),pickMeshes=models.map(()=>[]),owners=new WeakMap();
 const vertexShader=`
  varying vec2 vFlowUv;
  varying vec3 vFlowNormal;
  varying vec3 vFlowView;
  void main(){
   vFlowUv=uv;
   vec4 viewPosition=modelViewMatrix*vec4(position,1.0);
   vFlowNormal=normalize(normalMatrix*normal);
   vFlowView=-viewPosition.xyz;
   gl_Position=projectionMatrix*viewPosition;
  }
 `;
 const fragmentShader=`
  uniform float flowTime;
  uniform float flowLength;
  uniform float flowOffset;
  uniform float flowReverse;
  uniform float flowReduced;
  uniform float flowEmphasis;
  uniform vec3 flowColor;
  varying vec2 vFlowUv;
  varying vec3 vFlowNormal;
  varying vec3 vFlowView;
  void main(){
   float facing=max(dot(normalize(vFlowNormal),normalize(vFlowView)),0.0);
   float stripe=pow(facing,10.0);
   float distanceAlong=mix(vFlowUv.x,1.0-vFlowUv.x,flowReverse)*flowLength+flowOffset;
   float phase=fract((distanceAlong-flowTime*0.82)/2.65);
   float pulse=smoothstep(0.06,0.17,phase)*(1.0-smoothstep(0.25,0.58,phase));
   float core=smoothstep(0.18,0.23,phase)*(1.0-smoothstep(0.23,0.38,phase));
   float movingAlpha=0.16+pulse*0.78;
   float alpha=stripe*mix(movingAlpha,0.20,flowReduced)*flowEmphasis;
   if(alpha<0.012)discard;
   vec3 color=mix(flowColor,vec3(0.85,0.98,1.0),core*0.36*(1.0-flowReduced));
   gl_FragColor=vec4(color,alpha);
   #include <colorspace_fragment>
  }
 `;
 const asVector=p=>p.isVector3?p.clone():new T.Vector3(...p);
 const lengthOf=points=>points.slice(1).reduce((sum,p,i)=>sum+p.distanceTo(points[i]),0);
 const hasNoFlow=object=>{
  for(let item=object;item;item=item.parent)if(item.userData.noFlow)return true;
  return false;
 };
 models.forEach((entry,index)=>{
  const model=entry.group||entry;
  model.updateMatrixWorld(true);
  const inverse=model.matrixWorld.clone().invert(),groups=[];
  model.traverse(group=>{if(group.userData.pipeSelectable&&!hasNoFlow(group))groups.push(group);});
  groups.forEach(group=>{
   const data=group.userData;
   const source=data.pipePath||data.pipePoints;
   if(!source||source.length<2)return;
   const points=source.map(asVector).filter((p,i,a)=>!i||p.distanceToSquared(a[i-1])>1e-9);
   if(points.length<2)return;
   const length=lengthOf(points),radius=data.pipeRadius||data.radius||.045;
   if(length<.01||!Number.isFinite(length)||radius<=0)return;
   const curve=new T.CurvePath();
   points.slice(1).forEach((point,i)=>curve.add(new T.LineCurve3(points[i],point)));
   // The shell clears the formed socket's sealing bead, but only its camera-
   // facing centre is visible. Opaque walls retain normal depth occlusion.
   const geometry=new T.TubeGeometry(curve,Math.max(24,Math.min(420,Math.ceil(length*30))),radius*1.205,16,false);
   const reverse=Boolean(data.flowReverse);
   const material=new T.ShaderMaterial({
    uniforms:{
     flowTime:{value:0},flowLength:{value:length},flowOffset:{value:Number(data.flowOffset)||0},
     flowReverse:{value:reverse?1:0},flowReduced:{value:0},flowEmphasis:{value:1},
     flowColor:{value:new T.Color(data.flowColor||model.userData.flowColor||'#45cddd')},
    },vertexShader,fragmentShader,transparent:true,depthTest:true,depthWrite:false,
    side:T.FrontSide,toneMapped:false,
   });
   const shell=new T.Mesh(geometry,material);
   shell.name='pipe-flow-stream';shell.renderOrder=3;shell.userData.pipeEffect=true;
   shell.raycast=()=>{};group.add(shell);
   const transform=inverse.clone().multiply(group.matrixWorld);
   const modelPoints=points.map(p=>p.clone().applyMatrix4(transform));
   if(reverse)modelPoints.reverse();
   const record={group,shell,material,index,length,radius,modelPoints,
    offset:Number(data.flowOffset)||0,explicitOffset:Number.isFinite(data.flowOffset),parent:null,
   };
   records.push(record);byScene[index].push(record);
   group.traverse(child=>{if(child.isMesh&&!child.userData.pipeEffect)owners.set(child,record);});
  });
  // Pick the first opaque surface, including architecture, so a hidden pipe
  // cannot be hovered through a wall. Transparent glazing does not intercept.
  model.traverse(object=>{
   if(!object.isMesh||object.userData.pipeEffect)return;
   const materials=Array.isArray(object.material)?object.material:[object.material];
   if(materials.some(material=>!material.transparent||material.opacity>=.5))pickMeshes[index].push(object);
  });
 });

 // Inherit phase from upstream runs where a branch starts on a header. This
 // works after static batching, and is independent of model presentation pose.
 const pointOnPath=(point,record)=>{
  let along=0,best=null;
  for(let i=1;i<record.modelPoints.length;i++){
   const a=record.modelPoints[i-1],b=record.modelPoints[i],direction=b.clone().sub(a),length=direction.length();
   if(length<1e-8)continue;
   const t=T.MathUtils.clamp(point.clone().sub(a).dot(direction)/(length*length),0,1);
   const distance=point.distanceTo(a.clone().addScaledVector(direction,t));
   if(!best||distance<best.distance)best={distance,along:along+t*length};
   along+=length;
  }
  return best;
 };
 byScene.forEach(scene=>{
  scene.forEach(record=>{
   if(record.explicitOffset)return;
   let best=null;
   scene.forEach(candidate=>{
    if(candidate===record)return;
    const hit=pointOnPath(record.modelPoints[0],candidate);
    if(!hit||hit.distance>Math.min(.13,(record.radius+candidate.radius)*.7)||hit.along<.08)return;
    // Prefer a main header, rather than a narrower overlapping fixture tail.
    const priority=hit.distance+Math.max(0,record.radius-candidate.radius)*8;
    if(!best||priority<best.priority)best={candidate,along:hit.along,priority};
   });
   if(best)record.parent=best;
  });
  const resolve=(record,visiting=new Set())=>{
   if(record.resolved)return record.offset;
   if(visiting.has(record))return 0;
   visiting.add(record);
   if(!record.explicitOffset&&record.parent)record.offset=resolve(record.parent.candidate,visiting)+record.parent.along;
   visiting.delete(record);record.resolved=true;
   record.material.uniforms.flowOffset.value=record.offset;return record.offset;
  };
  scene.forEach(record=>resolve(record));
 });

 let hovered=null,disposed=false,lastTime=0;
 const clear=()=>{hovered=null;};
 return {
  update(time,reduced=false,currentIndex=0){
   if(disposed)return;
   const seconds=Number.isFinite(time)?time:0,dt=Math.min(.08,Math.max(0,seconds-lastTime));lastTime=seconds;
   const easing=1-Math.exp(-dt*12);
   records.forEach(record=>{
    const uniforms=record.material.uniforms;
    uniforms.flowTime.value=reduced?0:seconds;
    uniforms.flowReduced.value=reduced?1:0;
    const target=record===hovered?1.28:1;
    uniforms.flowEmphasis.value+= (target-uniforms.flowEmphasis.value)*easing;
    record.shell.visible=!hasNoFlow(record.group);
   });
   if(hovered&&hovered.index!==currentIndex)clear();
  },
  hover(raycaster,index){
   if(disposed||!pickMeshes[index]){clear();return false;}
   const first=raycaster.intersectObjects(pickMeshes[index],false).find(hit=>{
    for(let object=hit.object;object;object=object.parent)if(!object.visible)return false;
    return true;
   });
   hovered=first?owners.get(first.object)||null:null;return Boolean(hovered);
  },
  clear,
  get stats(){return {paths:records.length,byScene:byScene.map(scene=>scene.length),
   totalLength:records.reduce((sum,record)=>sum+record.length,0),
   connectedPhases:records.filter(record=>record.parent).length};},
  dispose(){
   if(disposed)return;disposed=true;clear();
   records.forEach(({shell,material})=>{shell.removeFromParent();shell.geometry.dispose();material.dispose();});
   records.length=0;byScene.forEach(scene=>scene.length=0);pickMeshes.forEach(scene=>scene.length=0);
  },
 };
}
