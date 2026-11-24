/** Architectural application maquettes. Geometry illustrates use; it is not an installation drawing. */
export function createBuildingModels(T, k, sceneId) {
 const models=[];
 const add=(parent,geo,mat,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const b=(p,x,y,z,w,h,d,m=k.white)=>k.box(p,x,y,z,w,h,d,m);
 const rb=(p,x,y,z,w,h,d,m=k.white,r=.035)=>k.roundBox(p,x,y,z,w,h,d,m,r);
 const cyl=(p,x,y,z,r,h,m=k.metal)=>k.cylinder(p,x,y,z,r,h,m);
 const pipe=(p,pts,r=.045,m=k.metal)=>k.pipe(p,pts,r,m);
 const mirrorMat=k.metal.clone();mirrorMat.color.set('#edf1f2');mirrorMat.roughness=.07;mirrorMat.metalness=1;
 mirrorMat.emissive.set('#a2aeb2');mirrorMat.emissiveIntensity=.012;
 const aquaWater=k.water.clone();aquaWater.color?.set('#c7edf1');
 const showerWater=aquaWater.clone();showerWater.opacity=.3;
 const ivory=k.white.clone();ivory.color.set('#f2eee5');ivory.roughness=.46;
 const warmStone=k.stone.clone();warmStone.color.set('#dbd5c9');warmStone.roughness=.4;
 // Fine mineral relief catches grazing light; no coarse grain or colour noise.
 const reliefPixels=new Uint8Array(256*256*4);let reliefSeed=71931;
 for(let i=0;i<256*256;i++){reliefSeed=(Math.imul(reliefSeed,1664525)+1013904223)>>>0;const v=118+(reliefSeed>>>27);reliefPixels[i*4]=reliefPixels[i*4+1]=reliefPixels[i*4+2]=v;reliefPixels[i*4+3]=255;}
 const mineralRelief=new T.DataTexture(reliefPixels,256,256,T.RGBAFormat);mineralRelief.wrapS=mineralRelief.wrapT=T.RepeatWrapping;mineralRelief.repeat.set(12,12);mineralRelief.minFilter=T.LinearMipmapLinearFilter;mineralRelief.magFilter=T.LinearFilter;mineralRelief.generateMipmaps=true;mineralRelief.anisotropy=8;mineralRelief.needsUpdate=true;
 ivory.bumpMap=mineralRelief;ivory.bumpScale=.004;warmStone.bumpMap=mineralRelief;warmStone.bumpScale=.006;
 const porcelain=new T.MeshPhysicalMaterial({color:'#faf7f0',roughness:.16,metalness:0,clearcoat:.6,clearcoatRoughness:.12});
 const frameMetal=k.metal.clone();frameMetal.color.set('#777d7d');frameMetal.roughness=.22;
 const warmLight=k.light.clone();warmLight.color.set('#fff1d6');warmLight.emissive.set('#ffddb4');warmLight.emissiveIntensity=1.5;
 const clearWater=k.water.clone();clearWater.color.set('#cbe7e7');clearWater.opacity=.42;
 const architecturalGlass=k.glass.clone();architecturalGlass.color.set('#e0e9e7');architecturalGlass.opacity=.08;
 const supply=(p,points,r=.055,offset=0,teeStart=false)=>{
  const run=pipe(p,points,r,k.metal);run.userData.flowOffset=offset;
  if(teeStart){const start=new T.Vector3(...points[0]);for(const child of [...run.children])if(child.userData.pressSocket&&child.position.distanceToSquared(start)<1e-10)child.removeFromParent();}
  return run;
 };
 const tee=(p,point,mainAxis,branchAxis,mainR,branchR=mainR)=>k.tee(p,point,mainAxis,branchAxis,mainR,branchR,k.metal);
 function warmDownlight(p,x,y,z){cyl(p,x,y,z,.087,.025,frameMetal);cyl(p,x,y-.018,z,.067,.008,warmLight);const light=new T.PointLight('#ffe0b4',2.4,3.6,2);light.position.set(x,y-.1,z);p.add(light);}
 function premiumMirror(p,x,y,z,w,h){
  rb(p,x,y,z-.018,w+.09,h+.09,.035,warmLight,.012);
  rb(p,x,y,z,w,h,.04,frameMetal,.009);
  rb(p,x,y,z+.027,w-.045,h-.045,.015,mirrorMat,.003);
  for(const side of [-1,1]){const fill=new T.PointLight('#ffe4c2',.55,1.8,2);fill.position.set(x+side*(w/2+.04),y,z+.11);p.add(fill);}
 }
 function gooseneck(p,x,y,z,s=1){
  const g=k.group(p);g.position.set(x,y,z);g.scale.setScalar(s);
  const profile=new T.CatmullRomCurve3([new T.Vector3(0,.03,0),new T.Vector3(0,.35,0),new T.Vector3(0,.56,.03),new T.Vector3(0,.65,.16),new T.Vector3(0,.61,.32),new T.Vector3(0,.48,.39)]);
  add(g,new T.TubeGeometry(profile,42,.035,16,false),k.metal);
  cyl(g,0,.028,0,.075,.045,k.metal);rb(g,.11,.14,0,.16,.026,.049,k.metal,.006);
  const aerator=cyl(g,0,.48,.39,.038,.045,k.metal);aerator.rotation.x=-.2;
  return {group:g,outlet:[x,y+.455*s,z+.395*s]};
 }
 function runningTap(p,outlet,bottom){
  const [x,top,z]=outlet,stream=cyl(p,x,(top+bottom)/2,z,.016,top-bottom,clearWater);stream.castShadow=false;stream.userData.dynamic=true;
  const rings=[];for(let i=0;i<3;i++){const material=clearWater.clone(),ring=k.torus(p,x,bottom+.005,z,.075,.004,material,Math.PI/2);ring.userData.dynamic=true;ring.castShadow=false;rings.push(ring);}
  return time=>{stream.scale.x=.94+Math.sin(time*5.6)*.05;stream.scale.z=.94+Math.sin(time*4.9)*.04;rings.forEach((ring,i)=>{const phase=(time*.55+i/3)%1;ring.scale.setScalar(.6+phase*2);ring.material.opacity=(1-phase)*.35;});};
 }
 function architecturalFrame(p,x,y,z,width,height,depth){
  b(p,x,y,z,.018,height,depth,architecturalGlass);
  for(const zz of [z-depth/2,z+depth/2])rb(p,x,y,zz,.035,height,.035,frameMetal,.006);
  for(const yy of [y-height/2,y+height/2])rb(p,x,yy,z,.035,.035,depth,frameMetal,.006);
 }

 function dish(p,x,y,z,r=.5,m=k.white) {
  const points=[[0,0],[r*.68,0],[r*.86,.025],[r*.98,.12],[r,.22],[r*.93,.23],[r*.83,.09],[r*.65,.055],[0,.055]].map(([a,c])=>new T.Vector2(a,c));
  const mesh=add(p,new T.LatheGeometry(points,48),m,x,y,z);mesh.scale.set(1.35,.9,1);return mesh;
 }
 function shower(p,x,y,z,s=1,water=false) {
  const g=k.group(p);g.position.set(x,y,z);g.scale.setScalar(s);
  rb(g,0,.06,0,1.55,.12,1.5,k.white,.025);b(g,0,.124,0,1.33,.018,1.29,k.stone);
  for(const xx of [-.75,.75]){b(g,xx,1.22,.70,.035,2.2,.04,k.metal);b(g,xx,1.22,-.7,.035,2.2,.04,k.metal);}
  b(g,.75,1.23,0,.025,2.13,1.4,k.glass);
  b(g,-.32,1.23,.715,.79,2.13,.025,k.glass);b(g,.44,1.23,.72,.7,2.13,.025,k.glass);
  b(g,.095,1.1,.755,.025,.34,.035,k.metal);
  b(g,0,2.32,.70,1.55,.03,.03,k.metal);
  pipe(g,[[.12,.28,-.58],[.12,2.13,-.58],[.12,2.13,.1]],.03,k.metal);
  cyl(g,.12,2.105,.12,.25,.045,k.metal);cyl(g,.12,2.078,.12,.221,.009,k.dark);
  const valve=cyl(g,.12,1.08,-.55,.09,.08,k.metal);valve.rotation.x=Math.PI/2;
  rb(g,.12,1.08,-.52,.39,.08,.11,k.metal,.02);
  for(const [x,m] of [[-.075,k.navy],[.315,k.red]]){const control=cyl(g,x,1.08,-.5,.036,.035,m);control.rotation.x=Math.PI/2;}
  b(g,0,.14,.05,.22,.01,.22,k.dark);
  const streams=[];
  if(water)for(let i=0;i<12;i++){const a=i*2.399,r=.05+(i%4)*.04;const stream=cyl(g,.12+Math.cos(a)*r,1.13,.12+Math.sin(a)*r,.004,1.86,showerWater);stream.castShadow=false;streams.push(stream);}
  return {group:g,streams};
 }
 function residentialWater() {
  const group=k.group(),story=3.3,riserX=-1.85,riserZ=1.63,tapUpdates=[];
  // Two storeys, open at the front: the pipe is the shared vertical spine.
  rb(group,0,-.11,0,11.2,.22,4.8,warmStone,.035);
  b(group,0,3.3,-2.26,10.9,6.6,.16,ivory);
  for(const y of [story,story*2]){
   rb(group,0,y,0,11.16,.19,4.72,ivory,.025);
   b(group,0,y-.105,2.30,11.05,.035,.045,warmStone);
  }
  // The service pier is set behind the stainless riser, not wrapped around it.
  rb(group,riserX,3.3,1.36,.5,6.6,.25,ivory,.024);
  for(const x of [-5.35,5.35])for(let f=0;f<2;f++)architecturalFrame(group,x,f*story+1.63,-.02,.035,3.12,4.46);
  for(let f=0;f<2;f++){
   const floor=f*story;
   b(group,0,floor+.014,0,10.85,.025,4.46,warmStone);
   for(const x of [-4,-1,2,5])b(group,x,floor+.031,.04,.006,.003,4.4,ivory);
   for(const z of [-.77,.73])b(group,0,floor+.032,z,10.8,.003,.006,ivory);
   for(const [x,z] of [[-3.8,.4],[.3,-.4],[3.65,.6]])warmDownlight(group,x,floor+3.18,z);
  }
  // Only the empty left bay has a balcony: the useful rooms stay fully readable.
  b(group,-3.78,3.93,2.18,2.78,1.08,.016,architecturalGlass);
  for(const x of [-5.17,-2.39])rb(group,x,3.93,2.18,.029,1.1,.029,frameMetal,.005);
  rb(group,-3.78,4.48,2.18,2.8,.025,.025,frameMetal,.005);

  // Ground floor: a handleless ivory kitchen with an inset stainless sink.
  const cabinetX=1.77,cabinetZ=.53,counterY=1.16;
  rb(group,cabinetX,.59,cabinetZ,5.35,1.08,1.38,ivory,.035);
  for(let i=0;i<4;i++){const x=-.2+i*1.31;rb(group,x,.61,1.235,1.27,.97,.032,ivory,.007);b(group,x,1.08,1.257,1.20,.014,.012,frameMetal);}
  b(group,cabinetX,.09,1.22,5.15,.10,.07,frameMetal);
  // Four counter pieces leave a real opening instead of painting a sink on a slab.
  const sinkX=1.58,sinkZ=.68,sinkW=1.28,sinkD=.72;
  rb(group,-.005,counterY,cabinetZ,1.89,.09,1.49,warmStone,.017);
  rb(group,3.36,counterY,cabinetZ,2.28,.09,1.49,warmStone,.017);
  rb(group,sinkX,counterY,.055,1.28,.09,.53,warmStone,.017);
  rb(group,sinkX,counterY,1.16,1.28,.09,.24,warmStone,.017);
  rb(group,sinkX,.96,sinkZ,sinkW,.045,sinkD,frameMetal,.01);
  for(const x of [sinkX-sinkW/2,sinkX+sinkW/2])rb(group,x,1.06,sinkZ,.035,.2,sinkD,k.metal,.008);
  for(const z of [sinkZ-sinkD/2,sinkZ+sinkD/2])rb(group,sinkX,1.06,z,sinkW,.2,.035,k.metal,.008);
  const lowerTap=gooseneck(group,sinkX,1.2,.27,1.05);tapUpdates.push(runningTap(group,lowerTap.outlet,.986));
  rb(group,2.06,2.55,-1.91,4.9,.8,.41,ivory,.025);
  for(let i=1;i<4;i++)b(group,-.39+i*1.225,2.55,-1.693,.009,.7,.012,warmStone);
  b(group,2.06,2.145,-1.72,4.6,.023,.025,warmLight);
  const kitchenWash=new T.PointLight('#ffdfb4',1.4,3,2);kitchenWash.position.set(2.06,2.05,-1.58);group.add(kitchenWash);

  // Upstairs: a floating stone vanity and a thin framed shower enclosure.
  rb(group,1.05,4.29,.4,2.55,.46,1.18,warmStone,.04);
  rb(group,1.05,4.53,.4,2.61,.07,1.21,porcelain,.017);
  const bowl=dish(group,1.05,4.565,.62,.54,porcelain);bowl.scale.set(1.28,1.12,1);
  const upperTap=gooseneck(group,1.05,4.57,.05,.95);tapUpdates.push(runningTap(group,upperTap.outlet,4.64));
  premiumMirror(group,1.05,5.36,-1.99,2.08,1.45);
  const sh=shower(group,3.93,3.36,-.6,1.16,false);sh.group.traverse(node=>{if(node.userData.pipework)node.userData.noFlow=true;});
  // The main is continuous through each slab; each tee is a separate press fitting.
  const inlet=.09,main=supply(group,[[riserX,inlet,riserZ],[riserX,6.48,riserZ]],.105,0);
  main.userData.applicationRole='building-riser';
  for(const [y,x,endY,endZ] of [[1.5,sinkX,1.20,.27],[4.78,1.05,4.57,.05]]){
   tee(group,[riserX,y,riserZ],[0,1,0],[1,0,0],.105,.063);
   supply(group,[[riserX,y,riserZ],[x,y,riserZ],[x,y,endZ],[x,endY,endZ]],.063,y-inlet,true);
  }
  for(const y of [.33,2.77,3.67,6.15]){
   k.torus(group,riserX,y,riserZ,.11,.013,k.metal,Math.PI/2);
   rb(group,riserX,y,1.475,.22,.045,.14,frameMetal,.008);
  }
  for(const y of [.09,6.48])cyl(group,riserX,y,riserZ,.148,.055,k.metal);
  // The shower is supplied through its wall terminal, separate from the display branch.
  const showerFeed=supply(group,[[3.93+.12*1.16,3.38,-.6-.58*1.16],[3.93+.12*1.16,3.36+.28*1.16,-.6-.58*1.16]],.035,3.29);showerFeed.userData.noFlow=true;
  return {id:'water',group,center:[0,3.22,0],radius:7,update(time){tapUpdates.forEach(update=>update(time));}};
 }
 function familyWater() {
  const group=k.group(),updates=[],mainY=2.6,mainZ=-2.32,inletX=-5.38,dropZ=-2.73;
  const oak=k.wood.clone();oak.color.set('#e3c8a5');oak.roughness=.56;
  const tile=k.white.clone();tile.color.set('#e3e4dc');tile.roughness=.42;
  const linen=k.cream.clone();linen.color.set('#ded5c7');linen.roughness=.85;
  // A horizontal home plan: kitchen, laundry and a washroom share one supply.
  rb(group,0,-.12,0,11.2,.24,6.05,ivory,.035);
  b(group,-1.9,.012,0,7.35,.025,5.8,oak);
  b(group,3.75,.013,0,3.75,.026,5.8,tile);
  // Long pale oak boards and a small, calm tile field make this a lived-in home.
  for(let x=-5.5;x<1.8;x+=.37)b(group,x,.029,0,.006,.003,5.75,warmStone);
  for(let i=0;i<20;i++){const x=-5.38+i*.37,z=i%2?-.58:1.2;b(group,x,.03,z,.355,.003,.006,warmStone);}
  for(let x=1.9;x<5.6;x+=.48)b(group,x,.03,0,.006,.003,5.8,ivory);
  for(let z=-2.85;z<2.9;z+=.48)b(group,3.75,.03,z,3.7,.003,.006,ivory);
  b(group,-1.8,.73,-2.91,7.45,1.46,.13,ivory);
  b(group,3.7,1.24,-2.91,3.7,2.48,.13,ivory);
  for(const x of [-5.54,5.54])rb(group,x,.53,-1.07,.12,1.06,3.68,ivory,.017);
  for(const x of [-1.82,1.83])rb(group,x,.53,-1.65,.11,1.06,2.43,ivory,.015);

  // Kitchen: a practical wide sink, wood-front cupboards and a quiet splashback.
  rb(group,-3.63,.6,-1.66,3.24,1.1,1.42,ivory,.035);
  rb(group,-3.63,1.19,-1.66,3.34,.09,1.51,warmStone,.02);
  for(const x of [-4.42,-2.84]){rb(group,x,.62,-.931,1.52,1.0,.03,oak,.007);rb(group,x,1.08,-.907,.55,.022,.025,frameMetal,.005);}
  b(group,-3.63,.10,-.94,3.05,.12,.04,frameMetal);
  rb(group,-3.63,1.55,-2.812,3.35,.61,.045,tile,.008);
  const kitchenBowl=dish(group,-3.43,1.237,-1.49,.48,k.metal);kitchenBowl.scale.set(1.38,.75,1);
  const kitchenTap=gooseneck(group,-3.43,1.25,-1.98,1.04);updates.push(runningTap(group,kitchenTap.outlet,1.284));

  // Laundry: a full-size front-loading washer, visible drum and a slim worktop.
  rb(group,0,.73,-1.65,1.46,1.43,1.38,porcelain,.07);
  rb(group,0,1.52,-1.63,3.02,.095,1.52,warmStone,.022);
  rb(group,0,1.275,-.941,1.33,.24,.035,ivory,.008);
  rb(group,-.27,1.28,-.918,.39,.105,.012,frameMetal,.003);
  const washerDial=cyl(group,.43,1.28,-.9,.067,.035,k.metal);washerDial.rotation.x=Math.PI/2;
  const door=cyl(group,0,.72,-.914,.456,.055,frameMetal);door.rotation.x=Math.PI/2;
  k.torus(group,0,.72,-.875,.399,.033,k.metal);
  const drum=k.group(group);drum.position.set(0,.72,-.866);drum.userData.dynamic=true;
  const drumBack=cyl(drum,0,0,-.03,.351,.05,frameMetal);drumBack.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3,baffle=rb(drum,Math.sin(a)*.21,Math.cos(a)*.21,.008,.07,.23,.025,k.metal,.012);baffle.rotation.z=-a;}
  const washerGlass=k.glass.clone();washerGlass.opacity=.24;washerGlass.color.set('#b6c7cc');
  const window=cyl(group,0,.72,-.841,.355,.016,washerGlass);window.rotation.x=Math.PI/2;
  rb(group,.35,.72,-.81,.054,.19,.053,k.metal,.013);
  rb(group,.97,.73,-1.65,.91,1.43,1.38,ivory,.035);
  rb(group,.97,.78,-.939,.84,1.18,.031,ivory,.007);
  // A single folded linen, rather than a cluster of decorative props.
  rb(group,.96,1.615,-1.67,.63,.08,.46,linen,.018);rb(group,.96,1.685,-1.67,.63,.06,.46,linen,.014);

  // The washroom has a rounded ceramic basin and a back-lit mirror, no shower.
  rb(group,3.68,.7,-1.59,2.85,1.21,1.42,ivory,.04);
  rb(group,3.68,1.347,-1.59,2.95,.085,1.5,warmStone,.02);
  for(const x of [2.98,4.38]){rb(group,x,.74,-.86,1.35,1.08,.031,ivory,.007);b(group,x,1.19,-.838,1.24,.015,.012,frameMetal);}
  const bathBowl=dish(group,3.68,1.4,-1.36,.57,porcelain);bathBowl.scale.set(1.3,1.12,1);
  const bathTap=gooseneck(group,3.68,1.415,-1.86,1.0);updates.push(runningTap(group,bathTap.outlet,1.48));
  premiumMirror(group,3.68,1.98,-2.8,2.02,.91);

  // An open ceiling frame carries the supply; the floor remains completely clear.
  rb(group,0,2.81,-2.42,11.04,.1,.35,ivory,.014);
  for(const x of [-5.47,5.47])rb(group,x,1.39,-2.48,.065,2.78,.085,ivory,.012);
  const main=supply(group,[[inletX,.06,mainZ],[inletX,mainY,mainZ],[5.25,mainY,mainZ]],.076);main.userData.applicationRole='home-distribution';
  // Use the actual sampled straight/elbow centreline for phase continuity.
  const upstreamDistance=point=>{
   const target=new T.Vector3(...point),path=main.userData.pipePath;let distance=0;
   for(let i=1;i<path.length;i++){
    const start=new T.Vector3(...path[i-1]),end=new T.Vector3(...path[i]),delta=end.clone().sub(start),length=delta.length();
    if(length<1e-8)continue;
    const t=Math.max(0,Math.min(1,target.clone().sub(start).dot(delta)/(length*length)));
    if(start.clone().addScaledVector(delta,t).distanceToSquared(target)<1e-10)return distance+t*length;
    distance+=length;
   }
   return distance;
  };
  // All three branches first follow the ceiling, then drop against the wall.
  // Fixture feeds enter beneath their bases, clear of the bowls and mirrors.
  const branches=[
   {x:-3.43,r:.048,path:[[-3.43,mainY,mainZ],[-3.43,mainY,dropZ],[-3.43,.94,dropZ],[-3.43,.94,-1.98],[-3.43,1.25,-1.98]]},
   {x:-1.03,r:.044,path:[[-1.03,mainY,mainZ],[-1.03,mainY,dropZ],[-1.03,.96,dropZ],[-1.03,.96,-1.93],[-.72,.96,-1.93]]},
   {x:2.36,r:.048,path:[[2.36,mainY,mainZ],[2.36,mainY,dropZ],[2.36,1.06,dropZ],[3.68,1.06,dropZ],[3.68,1.06,-1.86],[3.68,1.415,-1.86]]}
  ];
  for(const branch of branches){
   const point=[branch.x,mainY,mainZ];tee(group,point,[1,0,0],[0,0,-1],.076,branch.r);
   supply(group,branch.path,branch.r,upstreamDistance(point),true);
   // Two small wall saddles hold each vertical service drop.
   const saddleHeights=branch.x>2?[2.21,1.68]:branch.x<-2?[1.68,1.42]:[1.24,1.08];
   for(const y of saddleHeights){
    k.torus(group,branch.x,y,dropZ,branch.r+.005,.008,k.metal,Math.PI/2);
    rb(group,branch.x,y,dropZ-.073,.11,.033,.095,frameMetal,.006);
   }
  }
  // Slender suspended clamps visibly connect the main to the top beam.
  for(const x of [-4.65,-.12,4.8]){
   k.torus(group,x,mainY,mainZ,.081,.009,k.metal,0,Math.PI/2);
   cyl(group,x,2.725,mainZ,.009,.09,k.metal);
   rb(group,x,2.764,mainZ,.12,.018,.10,frameMetal,.004);
  }
  for(const y of [.45,1.76]){k.torus(group,inletX,y,mainZ,.082,.011,k.metal,Math.PI/2);rb(group,inletX-.06,y,mainZ-.085,.095,.036,.19,frameMetal,.008);}
  const washerPort=cyl(group,-.728,.96,-1.93,.064,.075,k.metal);washerPort.rotation.z=Math.PI/2;
  cyl(group,inletX,.82,mainZ,.095,.17,k.metal);rb(group,inletX+.08,.87,mainZ+.07,.27,.029,.065,k.navy,.006);
  const endCap=cyl(group,5.25,mainY,mainZ,.081,.025,k.metal);endCap.rotation.z=Math.PI/2;
  for(const x of [-3.6,0]){const fill=new T.PointLight('#ffe6c4',1.2,3.5,2);fill.position.set(x,2.35,-2.4);group.add(fill);}
  return {id:'home-water',group,center:[0,1.05,0],radius:7,update(time){updates.forEach(update=>update(time));drum.rotation.z=Math.sin(time*.38)*.28;}};
 }
 function buildingGas() {
  const group=k.group();
  rb(group,0,-.12,0,10,.24,4.8,warmStone,.035);
  b(group,0,2.12,-2.22,9.8,4.25,.16,ivory);
  rb(group,0,4.2,-1.78,10,.16,.95,ivory,.025);
  architecturalFrame(group,-4.86,2.06,-.02,.035,4.1,4.35);
  architecturalFrame(group,4.86,2.06,-.02,.035,4.1,4.35);
  for(const x of [-3.6,-.4,3])warmDownlight(group,x,4.11,-1.55);
  for(const x of [-2.5,0,2.5])b(group,x,.008,0,.006,.005,4.45,ivory);

  // The hob, extraction canopy and domestic meter distinguish this kitchen
  // without an island, dining chairs or decorative props competing with the pipe.
  rb(group,1.35,.59,-.72,6,1.08,1.46,ivory,.04);
  rb(group,1.35,1.16,-.72,6.1,.1,1.55,warmStone,.023);
  for(const x of [-.88,.34,2.88,4.1]){rb(group,x,.6,.028,1.17,.99,.035,ivory,.008);b(group,x,1.08,.053,1.1,.015,.012,frameMetal);}
  b(group,1.35,.09,.014,5.8,.10,.06,frameMetal);
  rb(group,1.66,.6,.04,1.43,.85,.055,frameMetal,.014);
  rb(group,1.66,.6,.075,1.24,.62,.012,k.glass,.002);
  rb(group,1.66,.97,.11,1.08,.035,.045,k.metal,.009);
  rb(group,1.66,1.224,-.59,1.72,.043,.97,frameMetal,.009);
  const burnerPositions=[];
  for(const x of [1.25,2.08])for(const z of [-.84,-.34]){
   cyl(group,x,1.258,z,.126,.025,k.black);k.torus(group,x,1.275,z,.16,.012,k.metal,Math.PI/2);
   for(const turn of [0,Math.PI/2]){const grate=rb(group,x,1.294,z,.45,.027,.026,frameMetal,.006);grate.rotation.y=turn;}
   burnerPositions.push([x,z]);
  }
  for(const x of [1.15,1.48,1.81,2.14]){const knob=cyl(group,x,1.105,.074,.042,.035,k.metal);knob.rotation.x=Math.PI/2;}
  rb(group,1.66,3.08,-1.39,2.17,.22,1.35,k.metal,.04);
  rb(group,1.66,3.63,-1.72,.91,.89,.58,ivory,.035);
  b(group,1.66,2.957,-1.07,1.63,.014,.025,warmLight);
  for(const [x,w] of [[-.69,1.7],[3.72,1.65]]){
   rb(group,x,2.78,-1.91,w,1.01,.42,ivory,.025);b(group,x,2.263,-1.72,w-.1,.019,.025,warmLight);
   b(group,x,2.78,-1.69,.008,.92,.006,warmStone);
  }
  // The secondary sink is deliberately quiet; the active appliance is the gas hob.
  dish(group,-.68,1.214,-.68,.33,k.metal);gooseneck(group,-.68,1.21,-1.0,.75);

  const meterX=-2.93,meterZ=.59,inletX=-3.16,outletX=-2.7;
  supply(group,[[-4,.13,meterZ],[-4,3.8,meterZ],[inletX,3.8,meterZ],[inletX,2.91,meterZ]],.064);
  rb(group,meterX,2.39,meterZ,.9,.82,.47,ivory,.075);
  rb(group,meterX,2.39,meterZ+.245,.8,.7,.045,porcelain,.01);
  rb(group,meterX,2.51,meterZ+.276,.5,.18,.025,frameMetal,.006);
  for(let i=0;i<5;i++)b(group,meterX-.17+i*.085,2.51,meterZ+.291,.056,.085,.006,warmStone);
  b(group,meterX,2.22,meterZ+.28,.3,.043,.012,k.metal);
  for(const x of [inletX,outletX]){cyl(group,x,2.84,meterZ,.082,.15,k.metal);cyl(group,x,2.905,meterZ,.095,.055,k.metal);}
  // Outlet follows rigid runs and independent elbows into the hob's underside.
  const meterFeedLength=3.67+.84+.89;
  supply(group,[[outletX,2.91,meterZ],[outletX,3.31,meterZ],[-2.18,3.31,meterZ],[-2.18,.76,meterZ],[1.66,.76,meterZ],[1.66,.76,-.59],[1.66,1.2,-.59]],.05,meterFeedLength);
  cyl(group,inletX,3.35,meterZ,.09,.19,k.metal);rb(group,inletX+.11,3.4,meterZ+.09,.39,.035,.076,k.amber,.008);
  for(const y of [.35,1.6,3.5]){k.torus(group,-4,y,meterZ,.069,.011,k.metal,Math.PI/2);rb(group,-4,y,meterZ-.12,.17,.04,.16,frameMetal,.008);}
  for(const y of [.89,2.45])cyl(group,-4,y,meterZ,.0655,.075,k.amber);
  const flameMaterial=new T.MeshStandardMaterial({color:'#74b9e0',roughness:.3,emissive:'#287fcb',emissiveIntensity:.64,transparent:true,opacity:.86});
  const flames=[];
  for(const [x,z] of [burnerPositions[1],burnerPositions[2]])for(let i=0;i<14;i++){
   const a=i*Math.PI*2/14,height=.095+(i%3)*.013,g=k.group(group);g.position.set(x+Math.cos(a)*.126,1.276,z+Math.sin(a)*.126);g.userData.dynamic=true;
   add(g,new T.ConeGeometry(.018,height,8),flameMaterial,0,height/2,0).castShadow=false;flames.push(g);
  }
  return {id:'gas',group,center:[0,2.02,0],radius:6.25,update(time){flameMaterial.emissiveIntensity=.6+Math.sin(time*2.2)*.07;flames.forEach((flame,i)=>flame.scale.y=.9+Math.sin(time*7.2+i*.65)*.1);}};
 }
 if (!sceneId || sceneId === 'water') models.push(residentialWater());
 if (!sceneId || sceneId === 'home-water') models.push(familyWater());
 if (!sceneId || sceneId === 'gas') models.push(buildingGas());
 return models;
}
