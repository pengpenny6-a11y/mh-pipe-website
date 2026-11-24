// Each stop frames the useful part of the product, rather than keeping the
// same distance from four very different silhouettes.
const detailExtents = {
  coupling: [
    ['x',-5.831,0,.39],['x',-5.60,0,.445],
    ['x',-3.70,0,.445],['x',-3.469,0,.39],
  ],
  tee: [
    ['x',-1.181,0,.39],['x',-.95,0,.445],
    ['x',.95,0,.445],['x',1.181,0,.39],
    ['y',0,.95,.445],['y',0,1.181,.39],
  ],
  elbow: [
    ['x',3.039,0,.39],['x',3.26,0,.445],['x',3.68,0,.374],
    ['x',4.40,-.27,.38],['y',4.82,-1.14,.374],
    ['y',4.82,-1.56,.445],['y',4.82,-1.781,.39],
  ],
  pipe: [['x',-10.4,0,.36],['x',-8.3,0,.36]],
};

const directions = {
  coupling: [-.62,.23,1],
  tee: [-.60,.24,1],
  elbow: [.30,.12,1],
  pipe: [-1.18,.20,1],
};

export const detailLandmarks = {pipe:[-10.33,.12,.335]};

export function fitRunDetail(T,camera,form,width,height) {
  const rings=detailExtents[form];
  if(!rings)return null;
  const back=new T.Vector3(...directions[form]).normalize();
  const right=new T.Vector3(back.z,0,-back.x).normalize();
  const up=new T.Vector3().crossVectors(back,right);
  // Clear the top-left caption and the bottom form controls. The complete
  // sealing beads remain inside this box, including the elbow's lower mouth.
  const box=width>650 ? (form==='pipe'?[.48,.94,.26,.78]:[.46,.93,.26,.79])
    : [.10,.92,.16,.80];
  const [left,rightEdge,top,bottom]=box;
  const matrix=camera.projectionMatrix.elements;
  const xLow=(2*left-1+matrix[8])/matrix[0];
  const xHigh=(2*rightEdge-1+matrix[8])/matrix[0];
  const yLow=(1-2*bottom+matrix[9])/matrix[5];
  const yHigh=(1-2*top+matrix[9])/matrix[5];
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  const point=new T.Vector3();
  for(const [axis,x,y,r] of rings)for(let i=0;i<48;i++){
    const angle=i*Math.PI/24,radial=r*Math.cos(angle);
    point.set(x+(axis==='y'?radial:0),y+(axis==='x'?radial:0),r*Math.sin(angle));
    const z=point.dot(back),px=point.dot(right),py=point.dot(up);
    minX=Math.min(minX,px+xLow*z);maxX=Math.max(maxX,px+xHigh*z);
    minY=Math.min(minY,py+yLow*z);maxY=Math.max(maxY,py+yHigh*z);
  }
  const depth=Math.max((maxX-minX)/(xHigh-xLow),(maxY-minY)/(yHigh-yLow));
  const panX=(maxX+minX-(xHigh+xLow)*depth)/2;
  const panY=(maxY+minY-(yHigh+yLow)*depth)/2;
  const aim=right.multiplyScalar(panX).addScaledVector(up,panY);
  return {eye:aim.clone().addScaledVector(back,depth),aim};
}
