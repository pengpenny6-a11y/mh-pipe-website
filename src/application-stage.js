/** Shared white floor for the application views. The page supplies the ambient
 * white; this stage contributes only a faint surface and real contact shadows. */
export function createApplicationStage(T){
 const group=new T.Group();group.name='application-shared-ground';
 const geometry=new T.PlaneGeometry(64,48,1,1);geometry.rotateX(-Math.PI/2);
 const surfaceMaterial=new T.MeshBasicMaterial({
  color:'#ffffff',transparent:true,opacity:.045,depthWrite:false,side:T.FrontSide,
 });
 const shadowMaterial=new T.ShadowMaterial({
  color:'#716f68',transparent:true,opacity:.13,depthWrite:false,side:T.FrontSide,
 });
 // Fade only the plane's contribution. Its base never becomes a large,
 // shaded grey patch behind the scene index, even under low ambient light.
 function feather(material,kind){
  material.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <common>',
    '#include <common>\nvarying vec3 vStageWorld;');
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',
    '#include <worldpos_vertex>\nvStageWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
    '#include <common>\nvarying vec3 vStageWorld;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <tonemapping_fragment>',`
    vec2 footprint=vec2(vStageWorld.x/18.0,vStageWorld.z/13.0);
    gl_FragColor.a*=1.0-smoothstep(0.34,0.94,length(footprint));
    #include <tonemapping_fragment>
   `);
  };
  material.customProgramCacheKey=()=>`mh-white-contact-floor-v2-${kind}`;
 }
 feather(surfaceMaterial,'surface');feather(shadowMaterial,'shadow');
 const surface=new T.Mesh(geometry,surfaceMaterial);surface.name='continuous-white-floor';
 surface.position.y=-.264;surface.renderOrder=-2;
 const shadow=new T.Mesh(geometry,shadowMaterial);shadow.name='architectural-contact-shadow';
 shadow.position.y=-.26;shadow.receiveShadow=true;shadow.renderOrder=-1;
 for(const mesh of [surface,shadow]){mesh.castShadow=false;mesh.userData.applicationGround=true;mesh.raycast=()=>{};group.add(mesh);}
 let disposed=false;
 return {
  group,
  // Intentionally static. Daylight-like movement is not a separate decoration.
  update(){},
  dispose(){if(disposed)return;disposed=true;geometry.dispose();surfaceMaterial.dispose();shadowMaterial.dispose();group.removeFromParent();},
 };
}
