// Exhibit proportions follow the company catalogue photography. They describe
// the unpressed fitting's visible shape rather than an installation dimension.
const radius = .36;
const barrel = 1.035;
const neck = 1.5;
const mouth = 3.28;

// One sealing bead per mouth, with straight pressing lands on either side.
// Distance from the centre is in multiples of the pipe radius.
const socket = [
  [neck,barrel],[1.60,barrel],[1.72,1.049],[1.82,1.065],[1.93,1.07],
  [2.39,1.07],[2.42,1.079],[2.47,1.138],[2.52,1.198],[2.58,1.225],
  [2.64,1.233],[2.70,1.223],[2.76,1.195],[2.81,1.134],[2.855,1.08],
  [2.89,1.07],[mouth-.045,1.07],[mouth-.013,1.066],[mouth,1.052],[mouth,1.014],
  [mouth-.012,1.005],[mouth-.06,1.003],
];

function revolved(T, scene, material, origin, axis, profile) {
  const geometry = new T.LatheGeometry(profile.map(([y,r]) => new T.Vector2(r,y)),112);
  // The lathe's local Y is its bore axis. Sloped lands, beads and cut faces
  // catch the inspection light, while the cylindrical barrel keeps its finish.
  const normal = geometry.getAttribute('normal');
  const shoulders = new Float32Array(normal.count);
  for (let i=0; i<normal.count; i++) shoulders[i]=Math.abs(normal.getY(i));
  geometry.setAttribute('inspectionSlope',new T.BufferAttribute(shoulders,1));
  const mesh = new T.Mesh(geometry,material);
  mesh.position.set(...origin);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...axis));
  scene.add(mesh);
  return mesh;
}

function straightTube(T,scene,tubeMetal,start,axis,length) {
  const R=radius, bore=R*.91, bevel=R*.025;
  const profile=[
    [0,R-bevel*.3],[bevel*.42,R-bevel*.08],[bevel,R],
    [length-bevel,R],[length-bevel*.42,R-bevel*.08],[length,R-bevel*.3],
    [length,bore+bevel*.3],[length-bevel,bore],[length-.13,bore],
    [length*.53,bore],[.13,bore],[bevel,bore],[0,bore+bevel*.3],[0,R-bevel*.3],
  ];
  const mesh=revolved(T,scene,tubeMetal,start,axis,profile);
  const shade=[1,1,1,1,1,1,1,.63,.29,.07,.29,.63,1,1];
  const colors=[];
  for(let i=0;i<mesh.geometry.attributes.position.count;i++){
    const value=shade[i%shade.length];colors.push(value,value,value);
  }
  mesh.geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
}

// The drawn branch is one continuous metal skin. Blend the circular trunk
// and branch at their saddle, then sample that local surface on tetrahedra.
// Analytical field normals keep reflected light continuous across mesh edges.
function saddleGeometry(T) {
  const R=barrel*radius, end=neck*radius, blend=.39*R;
  function field(x,y,z) {
    const trunk=Math.hypot(y,z)-R;
    const leg=Math.max(Math.hypot(x,z)-R,-y);
    const h=Math.max(1-Math.abs(trunk-leg)/blend,0);
    return Math.min(trunk,leg)-blend*h*h*.25;
  }
  const nx=44,ny=37,nz=34, gx=nx+1, gy=ny+1;
  const xs=Array.from({length:gx},(_,i)=>-end+2*end*i/nx);
  const ys=Array.from({length:gy},(_,i)=>-1.14*R+(end+1.14*R)*i/ny);
  const zs=Array.from({length:nz+1},(_,i)=>1.16*R*(2*i/nz-1));
  const values=new Float32Array(gx*gy*(nz+1));
  const position=i=>[xs[i%gx],ys[Math.floor(i/gx)%gy],zs[Math.floor(i/(gx*gy))]];
  for(let z=0;z<=nz;z++)for(let y=0;y<gy;y++)for(let x=0;x<gx;x++)
    values[(z*gy+y)*gx+x]=field(xs[x],ys[y],zs[z]);

  const points=[],normals=[],index=[],edges=new Map();
  function intersection(a,b) {
    const key=Math.min(a,b)*values.length+Math.max(a,b);
    const found=edges.get(key);
    if(found!==undefined)return found;
    const A=position(a),B=position(b),t=values[a]/(values[a]-values[b]);
    const [x,y,z]=A.map((v,i)=>v+t*(B[i]-v));
    const e=R*.003,dx=field(x+e,y,z)-field(x-e,y,z);
    const dy=field(x,y+e,z)-field(x,y-e,z),dz=field(x,y,z+e)-field(x,y,z-e);
    const length=Math.hypot(dx,dy,dz),id=points.length/3;
    points.push(x,y,z);normals.push(dx/length,dy/length,dz/length);
    edges.set(key,id);
    return id;
  }
  function face(a,b,c) {
    const ax=points[b*3]-points[a*3],ay=points[b*3+1]-points[a*3+1],az=points[b*3+2]-points[a*3+2];
    const bx=points[c*3]-points[a*3],by=points[c*3+1]-points[a*3+1],bz=points[c*3+2]-points[a*3+2];
    const facing=(ay*bz-az*by)*normals[a*3]+(az*bx-ax*bz)*normals[a*3+1]+(ax*by-ay*bx)*normals[a*3+2];
    if(facing>0)index.push(a,b,c);else if(facing<0)index.push(a,c,b);
  }
  const slab=gx*gy, corners=[0,1,1+gx,gx,slab,slab+1,slab+1+gx,slab+gx];
  const tetrahedra=[[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6],[0,5,1,6]];
  for(let z=0;z<nz;z++)for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
    const base=(z*gy+y)*gx+x, first=values[base]<=0;
    if(corners.every(n=>(values[base+n]<=0)===first))continue;
    for(const tet of tetrahedra){
      const inside=[],outside=[];
      for(const c of tet){const id=base+corners[c];(values[id]<=0?inside:outside).push(id);}
      if(!inside.length || !outside.length)continue;
      if(inside.length===2){
        const a=intersection(inside[0],outside[0]),b=intersection(inside[0],outside[1]);
        const c=intersection(inside[1],outside[1]),d=intersection(inside[1],outside[0]);
        face(a,b,c);face(a,c,d);
      }else{
        const one=inside.length===1?inside[0]:outside[0];
        const other=inside.length===1?outside:inside;
        face(intersection(one,other[0]),intersection(one,other[1]),intersection(one,other[2]));
      }
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));
  geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
  geometry.setIndex(index);return geometry;
}

// Finite studio cards are reflected at their actual positions. Local reflections
// travel around the drawn saddles and beads while the far HDR supplies the rest
// of the room. Both tubes and fittings sample the same photographic light field.
function studioSteel(T,roughness,light,vertexColors=false){
  const material=new T.MeshStandardMaterial({
    color:vertexColors?'#dde1e3':'#e7eaec',metalness:.985,roughness,vertexColors,
  });
  material.onBeforeCompile=shader=>{
    shader.uniforms.uPartLightSweep=light.sweep;
    shader.uniforms.uPartLightProgress=light.progress;
    shader.vertexShader='attribute float inspectionSlope;\nvarying float vInspectionSlope;\nvarying vec3 vExhibitPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\nvInspectionSlope=inspectionSlope;\nvExhibitPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
    shader.fragmentShader='varying float vInspectionSlope;\nvarying vec3 vExhibitPosition;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      uniform vec4 uPartLightSweep;
      uniform float uPartLightProgress;
      float card(vec2 point, vec2 halfSize, float edge) {
        vec2 q=abs(point)-halfSize;
        float distance=length(max(q,0.0))+min(max(q.x,q.y),0.0);
        return 1.0-smoothstep(-edge,edge,distance);
      }
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      vec3 worldNormal=inverseTransformDirection(normal,viewMatrix);
      vec3 ray=reflect(normalize(vExhibitPosition-cameraPosition),worldNormal);
      if(ray.z>0.01){
        float travel=(4.3-vExhibitPosition.z)/ray.z;
        vec2 hit=vExhibitPosition.xy+travel*ray.xy;
        // Broad silk with a graduated lower edge and a separate narrow kicker.
        float silk=card(hit-vec2(-1.0,1.35),vec2(8.1,1.45),.65);
        float strip=card(hit-vec2(2.3,-1.75),vec2(5.5,.18),.16);
        outgoingLight+=diffuseColor.rgb*(silk*vec3(1.16,1.19,1.23)+strip*vec3(1.5,1.58,1.64));
      }
      if(ray.y>0.01){
        float travel=(4.6-vExhibitPosition.y)/ray.y;
        vec2 hit=vExhibitPosition.xz+ray.xz*travel;
        float ceiling=card(hit-vec2(-2.2,.3),vec2(6.5,2.0),.75);
        outgoingLight+=diffuseColor.rgb*ceiling*vec3(1.65,1.7,1.75);
      }
      if (uPartLightProgress>0.0) {
        float along=(dot(vExhibitPosition.xy,uPartLightSweep.xy)-uPartLightSweep.z)
          /(uPartLightSweep.w-uPartLightSweep.z);
        float facing=clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0);
        float rim=pow(1.0-facing,2.8);
        float shoulder=smoothstep(.14,.78,vInspectionSlope);
        float softbox=.32+.68*smoothstep(-.4,.8,ray.y);
        // Cant the light card across the round surface. A dark flag beside
        // its bright strip gives the metal a readable reflection even in white.
        float offset=along+.044*worldNormal.z+.026*worldNormal.y
          -mix(-.13,1.13,uPartLightProgress);
        float core=1.0-smoothstep(.012,.045,abs(offset));
        float skirt=1.0-smoothstep(.022,.105,abs(offset));
        float flag=1.0-smoothstep(.017,.055,abs(offset+.056));
        float envelope=smoothstep(0.0,.12,uPartLightProgress)
          *(1.0-smoothstep(.89,1.0,uPartLightProgress));
        outgoingLight*=1.0-.34*flag*envelope;
        vec3 icedReflection=vec3(min(.55,outgoingLight.r*.38),
          outgoingLight.g*.82+.28,outgoingLight.b+1.25);
        outgoingLight=mix(outgoingLight,icedReflection,skirt*envelope*.84);
        outgoingLight+=envelope*softbox*diffuseColor.rgb*
          core*vec3(1.28,2.54,3.05);
        // After the sweep, a steady cold strip picks up the lip and tooling
        // shoulders. The face and the deep reflections stay silver and dark.
        float hold=smoothstep(.18,.82,uPartLightProgress);
        float edge=clamp(1.22*rim+shoulder*(.48+.52*softbox),0.0,1.0);
        outgoingLight=mix(outgoingLight,icedReflection,hold*edge*.91);
        outgoingLight+=hold*diffuseColor.rgb*edge*vec3(.06,.45,.78);
      }
      #include <opaque_fragment>
    `);
  };
  return material;
}

export function buildPressRun(T,scene) {
  const sweep=(x,y,start,end)=>({
    sweep:{value:new T.Vector4(x,y,start,end)},progress:{value:0},
  });
  const lights=new Map([
    ['coupling',sweep(1,0,-5.831,-3.469)],
    ['tee',sweep(1,.5,-1.38,1.38)],
    ['elbow',sweep(1,-1,3.04,6.60)],
    ['pipe',sweep(1,0,-10.4,-5.831)],
  ]);
  const couplingMetal=studioSteel(T,.112,lights.get('coupling'));
  const teeMetal=studioSteel(T,.112,lights.get('tee'));
  const elbowMetal=studioSteel(T,.112,lights.get('elbow'));
  const inletMetal=studioSteel(T,.145,lights.get('pipe'),true);
  const tubeMetal=studioSteel(T,.145,sweep(1,0,0,1),true);
  const X=[1,0,0],Y=[0,1,0],down=[0,-1,0];
  // The two cut ends meet inside the coupling. Each selectable length owns
  // its surface, including the inner wall and the bevel at its exposed bore.
  straightTube(T,scene,inletMetal,[-10.4,0,0],X,5.75);
  straightTube(T,scene,tubeMetal,[-4.65,0,0],X,4.65);
  straightTube(T,scene,tubeMetal,[0,0,0],X,3.69);
  straightTube(T,scene,tubeMetal,[0,.43,0],Y,1.52);
  straightTube(T,scene,tubeMetal,[4.82,-1.13,0],down,3.32);

  const dimensions=(profile)=>profile.map(([t,r])=>[t*radius,r*radius]);
  const centreline=[[0,1.026],[.44,1.026],[.55,1.031],[.69,barrel]];
  const half=[...centreline,...socket];
  const full=[...half.slice(1).reverse().map(([t,r])=>[-t,r]),...half];
  revolved(T,scene,couplingMetal,[-4.65,0,0],X,dimensions(full));

  scene.add(new T.Mesh(saddleGeometry(T),teeMetal));
  for(const axis of [X,[-1,0,0],Y]){
    revolved(T,scene,teeMetal,[0,0,0],axis,dimensions(socket));
  }

  const bend=1.14,centerX=3.68;
  const arc=Array.from({length:57},(_,i)=>{
    const angle=Math.PI*.5*i/56;
    return new T.Vector3(centerX+bend*Math.sin(angle),-bend+bend*Math.cos(angle),0);
  });
  scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(arc),60,radius*barrel,96,false),elbowMetal));
  const elbowSleeve=socket.map(([t,r])=>[(t-neck)*radius,r*radius]);
  revolved(T,scene,elbowMetal,arc[0].toArray(),[-1,0,0],elbowSleeve);
  revolved(T,scene,elbowMetal,arc.at(-1).toArray(),down,elbowSleeve);

  const componentMaterials=new Map([
    [inletMetal,'pipe'],[couplingMetal,'coupling'],[teeMetal,'tee'],[elbowMetal,'elbow'],
  ]);
  scene.traverse(object=>{
    if(object.isMesh && !object.geometry.hasAttribute('inspectionSlope')) {
      const count=object.geometry.getAttribute('position').count;
      object.geometry.setAttribute('inspectionSlope',new T.BufferAttribute(new Uint8Array(count),1));
    }
    const form=componentMaterials.get(object.material);
    if(form)object.userData.productForm=form;
  });

  let activeLight;
  return {
    setSelectionLight(form,progress) {
      const next=lights.get(form);
      if(activeLight && activeLight!==next) activeLight.progress.value=0;
      if(next) next.progress.value=Number.isFinite(progress) ? Math.max(0,Math.min(1,progress)) : 0;
      activeLight=next;
    },
  };
}
