/** Picking and restrained flow markers for the real pipe geometry.
 * Owns no animation loop; the architecture viewer supplies its visible clock. */
export function createPipeInteraction(T,models,camera,renderer){
 const raycaster=new T.Raycaster(),pointer=new T.Vector2(),dummy=new T.Object3D();
 const worldA=new T.Vector3(),worldB=new T.Vector3(),projectedA=new T.Vector3(),projectedB=new T.Vector3(),candidatePoint=new T.Vector3();
 const cameraSpaceA=new T.Vector3(),cameraSpaceB=new T.Vector3();
 const records=[],byMesh=new Map(),environment=[];
 const warm=new T.Color('#e6b976'),cool=new T.Color('#86dce1');
 const paper=new T.Color('#e8ebed');
 const dotGeometry=new T.SphereGeometry(1,10,8);
 const idleDots=new T.MeshBasicMaterial({color:'#93dbdf',transparent:true,opacity:.68,depthWrite:false,toneMapped:false});
 const activeDots=new T.MeshBasicMaterial({color:'#ffd493',transparent:true,opacity:.94,depthWrite:false,toneMapped:false});
 let hovered=null,selected=null,selectedPoint=null,disposed=false,lastTime=null;

 models.forEach((model,index)=>{
  const groups=[];model.group.traverse(node=>{if(node.userData.pipeSelectable)groups.push(node)});
  groups.forEach(group=>{
   const points=(group.userData.pipePath||group.userData.pipePoints||[]).map(p=>new T.Vector3(...p));
   if(points.length<2)return;
   const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+points[i].distanceTo(points[i-1]));
   const length=lengths.at(-1);if(length<.01)return;
   const record={group,index,points,lengths,length,radius:group.userData.pipeRadius||.04,meshes:[],materials:[],amount:0,point:new T.Vector3(),towards:new T.Vector3(),localCamera:new T.Vector3()};
   const anchors=group.userData.pipePoints||group.userData.pipePath;
   record.connections=anchors.map((p,i)=>({point:nearestPathPoint(record,new T.Vector3(...p)),kind:i>0&&i<anchors.length-1?'elbow':'end'}));
   const materialCopies=new Map();
   group.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const original=mesh.material;
    const copy=material=>{
     if(!materialCopies.has(material)){
      const clone=material.clone();materialCopies.set(material,clone);
      record.materials.push({clone,color:material.color.clone(),emissive:material.emissive?.clone()||new T.Color(0),intensity:material.emissiveIntensity||0,roughness:material.roughness});
     }
     return materialCopies.get(material);
    };
    mesh.material=Array.isArray(original)?original.map(copy):copy(original);
    record.meshes.push({mesh,original});byMesh.set(mesh,record);
   });
   // Instancing keeps every complete pipe run to one additional draw call.
   const dots=new T.InstancedMesh(dotGeometry,idleDots,5);
   dots.name='pipe-flow-markers';dots.userData.pipeEffect=true;dots.frustumCulled=false;
   dots.raycast=()=>{};dots.count=0;dots.renderOrder=2;
   dots.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(dots);record.dots=dots;
   records.push(record);
  });
  // Clone per model: shared kit materials must not wash out other scenes or
  // the selected metalwork. Glass, water and live emissive fixtures stay intact.
  const entries=new Map(),meshes=[];
  model.group.traverse(mesh=>{
   if(!mesh.isMesh||byMesh.has(mesh)||mesh.userData.pipeEffect)return;
   const original=mesh.material;
   const copy=material=>{
    if(!material?.color||material.transparent||material.emissive?.getHex())return material;
    if(!entries.has(material)){
     const clone=material.clone(),uniform={value:0};
     const before=clone.onBeforeCompile,key=clone.customProgramCacheKey.bind(clone);
     clone.onBeforeCompile=(shader,webglRenderer)=>{
      before.call(clone,shader,webglRenderer);shader.uniforms.mhEnvironmentFocus=uniform;
      shader.fragmentShader='uniform float mhEnvironmentFocus;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(${paper.r.toFixed(6)}, ${paper.g.toFixed(6)}, ${paper.b.toFixed(6)}), mhEnvironmentFocus * 0.42);`);
     };
     clone.customProgramCacheKey=()=>key()+'-mh-environment-focus-v1';
     entries.set(material,{original:material,clone,uniform});
    }
    return entries.get(material).clone;
   };
   mesh.material=Array.isArray(original)?original.map(copy):copy(original);meshes.push({mesh,original});
  });
  environment.push({index,meshes,entries:[...entries.values()],amount:0});
 });

 function nearestPathPoint(record,point){
  const a=new T.Vector3(),b=new T.Vector3(),nearest=new T.Vector3();let best=Infinity;
  for(let i=1;i<record.points.length;i++){
   a.copy(record.points[i-1]);b.subVectors(record.points[i],a);const length=b.lengthSq();
   const t=length?Math.max(0,Math.min(1,point.clone().sub(a).dot(b)/length)):0;
   a.addScaledVector(b,t);const distance=a.distanceToSquared(point);if(distance<best){best=distance;nearest.copy(a)}
  }
  return nearest;
 }

 function visible(object){for(let node=object;node;node=node.parent)if(!node.visible)return false;return true}
 function transparent(hit){
  const material=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;
  return !material||material.visible===false||(material.transparent&&material.opacity<.65);
 }
 function hitAtPointer(index){
  raycaster.setFromCamera(pointer,camera);
  for(const hit of raycaster.intersectObject(models[index].group,true)){
   if(!visible(hit.object)||hit.object.userData.pipeEffect||transparent(hit))continue;
   const record=byMesh.get(hit.object);return record?{record,point:hit.point.clone()}:null;
  }
  return null;
 }
 function pick(event,index){
  if(disposed||!event||!models[index]||!visible(models[index].group))return null;
  const rect=renderer.domElement.getBoundingClientRect();
  if(!rect.width||!rect.height||event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)return null;
  pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
  camera.updateMatrixWorld();models[index].group.updateWorldMatrix(true,true);
  // Use the scene's real geometry for both the target and its occlusion. An
  // opaque wall in front blocks a pipe; the model's transparent glazing does not.
  const direct=hitAtPointer(index);if(direct)return direct;
  // Thin pipes are otherwise only a few physical pixels wide. An 8px pointer
  // tolerance snaps to a visible point on the real run, then raycasts again at
  // that exact pipe location. No x-ray picking through opaque architecture.
  const candidates=[];
  for(const record of records){
   if(record.index!==index||!visible(record.group))continue;
   let best=64,bestPoint=null;
   for(let i=1;i<record.points.length;i++){
    worldA.copy(record.points[i-1]).applyMatrix4(record.group.matrixWorld);
    worldB.copy(record.points[i]).applyMatrix4(record.group.matrixWorld);
    projectedA.copy(worldA).project(camera);projectedB.copy(worldB).project(camera);
    if(projectedA.z< -1||projectedA.z>1||projectedB.z< -1||projectedB.z>1)continue;
    const ax=rect.left+(projectedA.x+1)*rect.width/2,ay=rect.top+(1-projectedA.y)*rect.height/2;
    const bx=rect.left+(projectedB.x+1)*rect.width/2,by=rect.top+(1-projectedB.y)*rect.height/2;
    const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;
    const t=l?Math.max(0,Math.min(1,((event.clientX-ax)*dx+(event.clientY-ay)*dy)/l)):0;
    const distance=(event.clientX-ax-t*dx)**2+(event.clientY-ay-t*dy)**2;
    if(distance>=best)continue;
    // Perspective-correct interpolation keeps the snapped point on the pipe.
    cameraSpaceA.copy(worldA).applyMatrix4(camera.matrixWorldInverse);
    cameraSpaceB.copy(worldB).applyMatrix4(camera.matrixWorldInverse);
    const wa=-cameraSpaceA.z,wb=-cameraSpaceB.z;
    const u=t*wa/((1-t)*wb+t*wa);
    candidatePoint.lerpVectors(worldA,worldB,Number.isFinite(u)?u:t);
    best=distance;bestPoint=candidatePoint.clone();
   }
   if(bestPoint)candidates.push({record,point:bestPoint,distance:best});
  }
  candidates.sort((a,b)=>a.distance-b.distance);
  for(const candidate of candidates){
   candidate.point.project(camera);pointer.set(candidate.point.x,candidate.point.y);
   const hit=hitAtPointer(index);if(hit?.record===candidate.record)return hit;
  }
  return null;
 }
 function restore(record){
  record.amount=0;
  for(const entry of record.materials){entry.clone.color.copy(entry.color);entry.clone.emissive?.copy(entry.emissive);entry.clone.emissiveIntensity=entry.intensity;entry.clone.roughness=entry.roughness}
 }
 function connectionHit(record,point){
  const world=point.clone().applyMatrix4(record.group.matrixWorld);
  candidatePoint.copy(world).project(camera);
  if(candidatePoint.z< -1||candidatePoint.z>1||Math.abs(candidatePoint.x)>.96||Math.abs(candidatePoint.y)>.94)return false;
  pointer.set(candidatePoint.x,candidatePoint.y);
  const hit=hitAtPointer(record.index);
  // A branch meeting a riser may be fronted by the riser's actual surface.
  // Accept that directly visible connected run, never a distant pipe/wall.
  return hit&&(hit.record===record||hit.point.distanceTo(world)<Math.max(.15,record.radius*2.5))?hit:null;
 }
 function selectFocus(hit){
  if(!hit)return null;
  const record=hit.record,point=nearestPathPoint(record,record.group.worldToLocal(hit.point.clone()));
  let closest=null,distance=Math.max(.85,record.radius*20);
  for(const connection of record.connections){
   const d=connection.point.distanceTo(point);
   if(d<distance&&connectionHit(record,connection.point)){closest=connection.point;distance=d}
  }
  return (closest||point).clone();
 }
 function sample(record,distance,target){
  const {points,lengths}=record;
  let i=1;while(i<lengths.length-1&&lengths[i]<distance)i++;
  const span=lengths[i]-lengths[i-1];
  return target.lerpVectors(points[i-1],points[i],span>0?(distance-lengths[i-1])/span:0);
 }
 function clear(){
  hovered=selected=null;selectedPoint=null;
  for(const record of records){restore(record);record.dots.material=idleDots}
 }
 const api={
  hover(event,index){hovered=pick(event,index)?.record||null;return Boolean(hovered)},
  select(event,index){const hit=pick(event,index);selected=hit?.record||null;selectedPoint=selectFocus(hit);hovered=selected;return Boolean(selected)},
  inspect(index){
   selected=null;selectedPoint=null;
   if(disposed||!models[index]||!visible(models[index].group))return false;
   camera.updateMatrixWorld();models[index].group.updateWorldMatrix(true,true);
   const options=[];
   for(const record of records){
    if(record.index!==index||!visible(record.group))continue;
    const connections=[...record.connections];
    if(models[index].id==='home-water'&&record.length>2){
     // The vanity can screen the low branch from some overview aspects. Use
     // an exposed point immediately above the inlet valve on its left riser,
     // so the close frame contains the valve/branch rather than a shower base.
     for(let i=1;i<record.points.length;i++){
      const a=record.points[i-1],b=record.points[i];
      if(Math.abs(b.y-a.y)<2||Math.abs(b.x-a.x)>.05||Math.abs(b.z-a.z)>.05)continue;
      const modelA=models[index].group.worldToLocal(a.clone().applyMatrix4(record.group.matrixWorld));
      if(modelA.x>=-3)continue;
      for(const portion of [.38,.44,.5])connections.push({point:a.clone().lerp(b,portion),kind:'inlet'});
     }
    }
    for(const connection of connections){
     const hit=connectionHit(record,connection.point);if(!hit)continue;
     const centerPenalty=Math.abs(candidatePoint.x)*.8+Math.abs(candidatePoint.y)*.5;
     const world=connection.point.clone().applyMatrix4(record.group.matrixWorld);
     const modelPoint=models[index].group.worldToLocal(world.clone());
     // The domestic-water detail should explain the exposed inlet connection,
     // not disappear behind a shower frame near the floor.
     const inletPriority=models[index].id==='home-water'&&modelPoint.x< -3&&modelPoint.y>.65&&modelPoint.y<2.2?8:0;
     const score=(connection.kind==='elbow'?5:1)+(record.length>1.2?2:-1)+Math.min(1,record.radius/.06)-centerPenalty+inletPriority+(connection.kind==='inlet'?2-Math.abs(modelPoint.y-1.65):0);
     const point=hit.record===record?connection.point:nearestPathPoint(hit.record,hit.record.group.worldToLocal(world));
     options.push({record:hit.record,point,score});
    }
   }
   const best=options.sort((a,b)=>b.score-a.score)[0];
   if(best){selected=best.record;selectedPoint=best.point.clone()}
   hovered=selected;return Boolean(selected);
  },
  focus(index){
   if(disposed||!selected||selected.index!==index||!selectedPoint)return null;
   selected.group.updateWorldMatrix(true,false);
   const scale=selected.group.getWorldScale(new T.Vector3());
   return {point:selected.group.localToWorld(selectedPoint.clone()),radius:Math.max(.65,Math.min(1.25,selected.radius*16))*Math.max(scale.x,scale.y,scale.z)};
  },
  clear,
  update(time,reduced,index){
   if(disposed)return;
   const dt=lastTime===null?1/60:Math.min(.05,Math.max(0,time-lastTime));lastTime=time;
   for(const item of environment){
    const target=selected?.index===item.index?1:0;
    item.amount=reduced?target:item.amount+(target-item.amount)*(1-Math.exp(-dt*6));
    if(Math.abs(target-item.amount)<.0001)item.amount=target;
    for(const entry of item.entries)entry.uniform.value=item.amount;
   }
   for(const record of records){
    const shown=record.index===index&&visible(record.group);record.dots.visible=shown;
    if(!shown)continue;
    const emphasis=record===selected?1:record===hovered ? .55 : 0;
    record.amount=reduced?emphasis:record.amount+(emphasis-record.amount)*(1-Math.exp(-dt*12));
    for(const entry of record.materials){
     // Silver reflection remains the material. The confirmation tint is a
     // small light contribution, not a gold replacement of the whole pipe.
     entry.clone.color.copy(entry.color).lerp(record===selected?warm:cool,record.amount*.035);
     if(entry.clone.emissive){entry.clone.emissive.copy(entry.emissive).multiplyScalar(entry.intensity).lerp(record===selected?warm:cool,record.amount*.045);entry.clone.emissiveIntensity=1}
     if(Number.isFinite(entry.roughness))entry.clone.roughness=Math.max(.075,entry.roughness-record.amount*.025);
    }
    const baseCount=Math.min(3,Math.max(1,Math.ceil(record.length/3.5)));
    const count=emphasis>0?Math.min(5,baseCount+2):baseCount;
    record.dots.count=count;record.dots.material=emphasis>0?activeDots:idleDots;
    record.localCamera.copy(camera.position);record.group.worldToLocal(record.localCamera);
    for(let j=0;j<count;j++){
     const distance=(((reduced?0:time*.65)/record.length+j/count+.13)%1)*record.length;
     sample(record,distance,record.point);
     record.towards.subVectors(record.localCamera,record.point).normalize();
     dummy.position.copy(record.point).addScaledVector(record.towards,record.radius*1.12);
     dummy.scale.setScalar(Math.max(.017,record.radius*(emphasis>0 ? .4 : .28)));
     dummy.updateMatrix();record.dots.setMatrixAt(j,dummy.matrix);
    }
    record.dots.instanceMatrix.needsUpdate=true;
   }
  },
  dispose(){
   if(disposed)return;disposed=true;hovered=selected=null;
   for(const record of records){
    // Restore references before the parent's generic scene disposal pass.
    record.meshes.forEach(({mesh,original})=>{mesh.material=original});
    record.dots.removeFromParent();record.dots.dispose();
    record.materials.forEach(({clone})=>clone.dispose());
   }
   for(const item of environment){item.meshes.forEach(({mesh,original})=>{mesh.material=original});item.entries.forEach(({clone})=>clone.dispose())}
   dotGeometry.dispose();idleDots.dispose();activeDots.dispose();byMesh.clear();records.length=0;
  },
 };
 return api;
}
