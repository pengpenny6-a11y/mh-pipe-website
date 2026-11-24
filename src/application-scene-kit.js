/** Shared physically based materials and actual geometry for architectural applications.
 * These scenes illustrate contexts; they are not approved installation drawings. */
export function createArchitectureKit(T){
 const cache=new Map(),materials=new Set(),orphaned=new Set();let disposed=false;
 const material=(color,roughness=.65,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness,...extra});materials.add(m);return m;};
 const k={
  white:material('#f0f1ed',.58),cream:material('#e8e2d5',.75),stone:material('#b6bab8',.85),
  dark:material('#37434c',.5),navy:material('#233d65',.42),wood:material('#c7a47b',.55),
  metal:material('#c1cbd1',.13,{metalness:.97}),aqua:material('#9bc9ce',.4),
  red:material('#ae192c',.35),amber:material('#e3aa56',.4),black:material('#14202b',.5),
  light:material('#dceeff',.22,{emissive:'#b9dfff',emissiveIntensity:1.7}),
 };
 k.glass=new T.MeshPhysicalMaterial({color:'#d9ecf1',metalness:0,roughness:.045,clearcoat:1,clearcoatRoughness:.04,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide});materials.add(k.glass);
 k.water=new T.MeshPhysicalMaterial({color:'#b9e6ef',metalness:.05,roughness:.04,transparent:true,opacity:.6,depthWrite:false,side:T.DoubleSide});materials.add(k.water);
 const oak=new T.TextureLoader().load('/assets/materials/oak-albedo.webp',texture=>{if(disposed)texture.dispose();});
 oak.colorSpace=T.SRGBColorSpace;oak.wrapS=oak.wrapT=T.RepeatWrapping;oak.anisotropy=4;
 k.wood.color.set('#f3eee5');k.wood.map=oak;k.wood.needsUpdate=true;
 const geom=(key,make)=>{if(!cache.has(key))cache.set(key,make());return cache.get(key);};
 const mesh=(parent,g,m,x,y,z)=>{const object=new T.Mesh(g,m||k.white);object.position.set(x,y,z);object.castShadow=!(m?.transparent);object.receiveShadow=true;parent?.add(object);return object;};
 k.group=parent=>{const g=new T.Group();parent?.add(g);return g;};
 k.box=(p,x,y,z,w,h,d,m)=>mesh(p,geom(`b${w},${h},${d}`,()=>new T.BoxGeometry(w,h,d)),m,x,y,z);
 // Small physical edge breaks catch the studio light on fixtures and enclosures.
 // The bevel stays inside the requested dimensions, so pipe ports remain aligned.
 k.roundBox=(p,x,y,z,w,h,d,m,r=.035)=>{
  const radius=Math.min(r,w*.24,h*.24,d*.24);
  const geometry=geom(`rb${w},${h},${d},${radius}`,()=>{
   const shape=new T.Shape(),hw=w/2-radius,hh=h/2-radius;
   shape.moveTo(-hw,-hh);shape.lineTo(hw,-hh);shape.lineTo(hw,hh);shape.lineTo(-hw,hh);shape.closePath();
   const g=new T.ExtrudeGeometry(shape,{depth:d-2*radius,bevelEnabled:true,bevelThickness:radius,bevelSize:radius,bevelSegments:3,steps:1});
   g.translate(0,0,-(d-2*radius)/2);return g;
  });
  return mesh(p,geometry,m,x,y,z);
 };
 k.cylinder=(p,x,y,z,r,h,m)=>mesh(p,geom(`c${r},${h}`,()=>new T.CylinderGeometry(r,r,h,32,1)),m,x,y,z);
 k.sphere=(p,x,y,z,r,m)=>mesh(p,geom(`s${r}`,()=>new T.SphereGeometry(r,16,12)),m,x,y,z);
 k.torus=(p,x,y,z,r,tube,m,rx=0,ry=0,rz=0)=>{const o=mesh(p,geom(`t${r},${tube}`,()=>new T.TorusGeometry(r,tube,10,32)),m,x,y,z);o.rotation.set(rx,ry,rz);return o;};
 const yAxis=new T.Vector3(0,1,0);
 const straight=(parent,a,b,r,m)=>{
  const d=b.clone().sub(a),l=d.length();if(l<.001)return;
  const mid=a.clone().add(b).multiplyScalar(.5),o=k.cylinder(parent,mid.x,mid.y,mid.z,r,l,m);o.quaternion.setFromUnitVectors(yAxis,d.normalize());
  return o;
 };
 // A double-press socket has one rounded sealing bead and straight pressing
 // lands on BOTH sides, including an extended mouth beyond the bead. These
 // are illustrative unpressed fittings, not dimensional installation models.
 const collar=(parent,p,axis,r,m)=>{
  const geometry=geom(`press-socket-${r}`,()=>{
   const profile=[[-1.5,1.025],[-1.42,1.05],[-1.3,1.068],[-.22,1.068],
    [-.1,1.084],[.01,1.12],[.14,1.167],[.26,1.185],[.38,1.18],
    [.52,1.143],[.64,1.09],[.78,1.068],[1.4,1.068],[1.48,1.052],
    [1.5,1.04],[1.5,1.001],[-1.5,1.001],[-1.5,1.025]];
   return new T.LatheGeometry(profile.map(([y,x])=>new T.Vector2(x*r,y*r)),40);
  });
  const sleeve=mesh(parent,geometry,m,p.x,p.y,p.z);
  sleeve.quaternion.setFromUnitVectors(yAxis,axis.clone().normalize());
  sleeve.userData.pressSocket=true;sleeve.userData.pressProfile='double-press';
  sleeve.userData.pressLandRanges=[[-1.3*r,-.22*r],[.78*r,1.4*r]];
  sleeve.userData.sealBeadRange=[-.1*r,.64*r];return sleeve;
 };
 k.pressSocket=collar;
 k.tee=(parent,point,mainAxis,branchAxis,mainRadius,branchRadius=mainRadius,m=k.metal)=>{
  const p=point.isVector3?point.clone():new T.Vector3(...point);
  const main=(mainAxis.isVector3?mainAxis.clone():new T.Vector3(...mainAxis)).normalize();
  const branch=(branchAxis.isVector3?branchAxis.clone():new T.Vector3(...branchAxis)).normalize();
  if(main.lengthSq()<.99||branch.lengthSq()<.99||Math.abs(main.dot(branch))>.01||mainRadius<=0||branchRadius<=0)throw new Error('A press tee needs perpendicular axes and positive radii');
  const group=k.group(parent);group.position.copy(p);
  const mainBody=mainRadius*1.055,branchBody=branchRadius*1.055;
  const mainEnd=mainRadius*2.05,branchEnd=Math.max(mainRadius*1.35+branchRadius*.8,branchRadius*2.05);
  straight(group,main.clone().multiplyScalar(-mainEnd),main.clone().multiplyScalar(mainEnd),mainBody,m);
  // The branch flares into the main barrel along a rounded saddle. It is
  // modelled independently so all three mouths remain explicit sockets.
  const side=new T.Vector3().crossVectors(main,branch).normalize();
  const positions=[],indices=[],around=40,rings=9;
  for(let j=0;j<=rings;j++)for(let i=0;i<=around;i++){
   const t=j/rings,a=i/around*Math.PI*2;
   const radius=branchBody*(1+.16*Math.pow(1-t,3));
   const radial=main.clone().multiplyScalar(Math.cos(a)*radius).addScaledVector(side,Math.sin(a)*radius);
   const height=Math.sqrt(Math.max(0,mainBody*mainBody-Math.pow(Math.sin(a)*radius,2)))*.965;
   radial.addScaledVector(branch,height+(branchEnd-height)*t);positions.push(radial.x,radial.y,radial.z);
   if(j<rings&&i<around){const at=j*(around+1)+i;indices.push(at,at+around+2,at+1,at,at+around+1,at+around+2);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
  orphaned.add(g);mesh(group,g,m,0,0,0);
  collar(group,main.clone().multiplyScalar(mainEnd),main,mainRadius,m);
  collar(group,main.clone().multiplyScalar(-mainEnd),main.clone().negate(),mainRadius,m);
  collar(group,branch.clone().multiplyScalar(branchEnd),branch,branchRadius,m);
  group.userData.pressFitting='tee';group.userData.pressProfile='double-press';group.userData.pipework=true;
  group.userData.pressRadii=[mainRadius,branchRadius];return group;
 };
 k.pipe=(parent,points,r=.045,m=k.metal)=>{
  const group=k.group(parent),p=points.map(a=>a.isVector3?a.clone():new T.Vector3(...a));
  if(p.length<2)return group;
  const starts=p.slice(0,-1).map(a=>a.clone()),ends=p.slice(1).map(a=>a.clone()),joints=[],curves=new Map();
  for(let i=1;i<p.length-1;i++){
   const a=p[i-1],b=p[i],c=p[i+1],u=b.clone().sub(a).normalize(),v=c.clone().sub(b).normalize();
   if(Math.abs(u.dot(v))>.01)continue;
   const R=Math.min(r*3.2,a.distanceTo(b)*.3,b.distanceTo(c)*.3);
   const start=b.clone().addScaledVector(u,-R),end=b.clone().addScaledVector(v,R),center=start.clone().addScaledVector(v,R);
   ends[i-1]=start;starts[i]=end;
   class ElbowCurve extends T.Curve {getPoint(t,target=new T.Vector3()){return target.copy(center).addScaledVector(v,-R*Math.cos(t*Math.PI/2)).addScaledVector(u,R*Math.sin(t*Math.PI/2));}}
   const curve=new ElbowCurve();curves.set(i-1,curve);
   const elbow=new T.Mesh(new T.TubeGeometry(curve,20,r*1.045,24,false),m);elbow.castShadow=true;elbow.receiveShadow=true;elbow.userData.pressFitting='elbow';elbow.userData.pressProfile='double-press';group.add(elbow);
   joints.push([start,u.clone().negate()],[end,v]);
  }
  for(let i=0;i<starts.length;i++)straight(group,starts[i],ends[i],r,m);
  collar(group,p[0],p[0].clone().sub(p[1]).normalize(),r,m);
  collar(group,p.at(-1),p.at(-1).clone().sub(p.at(-2)).normalize(),r,m);
  joints.forEach(([point,axis])=>collar(group,point,axis,r,m));
  group.userData.pipework=true;group.userData.pressProfile='double-press';
  // Keep useful piping distinct from railings, plant stems and fixture handles.
  // Store the actual straight / separate-elbow centreline for flow markers.
  if(r>=.03&&(m===k.metal||m===k.amber)){
   const path=[starts[0].toArray()];
   for(let i=0;i<starts.length;i++){
    path.push(ends[i].toArray());
    if(curves.has(i))path.push(...curves.get(i).getPoints(12).slice(1).map(v=>v.toArray()));
   }
   group.userData.pipeSelectable=true;group.userData.pipeRadius=r;
   group.userData.pipePoints=p.map(v=>v.toArray());group.userData.pipePath=path;
  }
  return group;
 };
 // Batch static opaque architecture by material. Animated fixtures keep their own nodes.
 k.batchStatic=root=>{
  root.updateMatrixWorld(true);
  const scopes=[root];root.traverse(o=>{if(o!==root&&o.isGroup&&(o.userData.dynamic||o.userData.pipeSelectable))scopes.push(o);});
  for(const scope of scopes){
   scope.updateMatrixWorld(true);const inverse=scope.matrixWorld.clone().invert(),buckets=new Map();
   const visit=o=>{
    if(o!==scope&&(o.userData.dynamic||o.userData.pipeSelectable))return;
    if(o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&!Array.isArray(o.material)&&!o.material.transparent&&o.geometry.attributes.position&&o.geometry.attributes.normal){
     const key=`${o.material.uuid}-${o.castShadow}-${o.receiveShadow}`;
     if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
    }
    for(const child of o.children)visit(child);
   };visit(scope);
   for(const meshes of buckets.values()){
    if(meshes.length<3)continue;
    const transformed=meshes.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));return g;});
    const count=transformed.reduce((n,g)=>n+g.attributes.position.count,0),p=new Float32Array(count*3),n=new Float32Array(count*3),uv=new Float32Array(count*2);
    let at=0;for(const g of transformed){const a=g.attributes;p.set(a.position.array,at*3);n.set(a.normal.array,at*3);if(a.uv)uv.set(a.uv.array,at*2);at+=a.position.count;g.dispose();}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(n,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.computeBoundingSphere();
    const combined=new T.Mesh(g,meshes[0].material);combined.castShadow=meshes[0].castShadow;combined.receiveShadow=meshes[0].receiveShadow;scope.add(combined);
    for(const o of meshes){orphaned.add(o.geometry);o.removeFromParent();}
   }
  }
 };
 k.dispose=()=>{disposed=true;cache.forEach(g=>g.dispose());orphaned.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());oak.dispose();};
 return k;
}
