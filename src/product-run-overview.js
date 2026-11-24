// The three open ends and the widest press beads bound the assembled exhibit.
// Using its silhouette leaves room under the inlet and above the outlet that
// a rectangular model-space bounding box would unnecessarily reserve.
const extentRings = [
  ['x',-10.4,0,.36], ['x',-5.6,0,.445], ['x',-3.7,0,.445],
  ['x',-.95,0,.445], ['x',.95,0,.445], ['y',0,.95,.445],
  ['y',0,1.95,.36], ['x',3.26,0,.445], ['x',3.68,0,.374],
  ['y',4.82,-1.56,.445], ['y',4.82,-4.45,.36],
];

export function fitRunOverview(T,camera,width,height) {
  const desktop=width>650;
  const backward=new T.Vector3(-.96,.28,1).normalize();
  const right=new T.Vector3(backward.z,0,-backward.x).normalize();
  const up=new T.Vector3().crossVectors(backward,right);
  const projection=camera.projectionMatrix.elements;
  // Leave the lower-right form controls below the model. On narrow screens
  // they live outside the canvas, so the overview uses its available height.
  const footprint=desktop ? [.09,.945,.14,1-Math.min(.19,Math.max(.12,64/height))]
                          : [.065,.935,.09,.92];
  const [left,rightEdge,top,bottom]=footprint;
  const xLow=(2*left-1+projection[8])/projection[0];
  const xHigh=(2*rightEdge-1+projection[8])/projection[0];
  const yLow=(1-2*bottom+projection[9])/projection[5];
  const yHigh=(1-2*top+projection[9])/projection[5];
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  const point=new T.Vector3();
  for (const [axis,x,y,r] of extentRings) {
    for(let i=0;i<32;i++) {
      const angle=i*Math.PI/16,radial=r*Math.cos(angle);
      point.set(x+(axis==='y'?radial:0),y+(axis==='x'?radial:0),r*Math.sin(angle));
      const z=point.dot(backward),px=point.dot(right),py=point.dot(up);
      minX=Math.min(minX,px+xLow*z);maxX=Math.max(maxX,px+xHigh*z);
      minY=Math.min(minY,py+yLow*z);maxY=Math.max(maxY,py+yHigh*z);
    }
  }
  // A camera at depth d sees [pan + slope * (d-z)] on each axis.
  // Solve both pairs of frustum planes before centering in the spare space.
  const depth=Math.max((maxX-minX)/(xHigh-xLow),(maxY-minY)/(yHigh-yLow));
  const panX=(maxX+minX-(xHigh+xLow)*depth)/2;
  const panY=(maxY+minY-(yHigh+yLow)*depth)/2;
  const aim=right.multiplyScalar(panX).addScaledVector(up,panY);
  return {eye:aim.clone().addScaledVector(backward,depth),aim};
}
