// Surface landmarks in the illustrative double-press run, in model space.
// The separate camera targets aim at the whole part rather than at the pin.
export const runLandmarks = {
  pipe: [-7.3, .07, .35],
  coupling: [-4.65, .07, .375],
  tee: [-.02, .24, .33],
  elbow: [4.48, -.31, .37],
};
const route = ['pipe','coupling','tee','elbow'];

export function pinLayout(host) {
  const rect = host.getBoundingClientRect();
  const studio = host.closest('.series-studio');
  const covered = Array.from(studio.querySelectorAll('.series-caption'), item => {
    const area = item.getBoundingClientRect();
    return {left:area.left-rect.left-18,top:area.top-rect.top-18,right:area.right-rect.left+18,bottom:area.bottom-rect.top+18};
  });
  return {width:rect.width,height:rect.height,covered};
}

export function placePins(nodes, points, layout, selected, previous, entryForm) {
  const {width,height,covered}=layout;
  const visible=[];
  for(const id of route){
    const button=nodes[id], point=points[id];
    if(!button || !point) continue;
    const [x,y]=point;
    const inside = x>=22 && y>=22 && x<=width-22 && y<=height-22 &&
      !covered.some(r=>x>=r.left && x<=r.right && y>=r.top && y<=r.bottom);
    button.hidden=!inside;
    button.style.left=x.toFixed(2)+'px';
    button.style.top=y.toFixed(2)+'px';
    button.dataset.labelSide = x>width-125?'left':x<125?'right':'center';
    button.dataset.labelBelow=String(y<114);
    if(inside && id!==selected) visible.push(id);
  }

  // At rest just one alternate station announces itself. Other visible stations
  // remain discoverable on pointer hover or keyboard focus.
  const index=route.indexOf(selected);
  const ahead=route.slice(index+1), behind=route.slice(0,index).reverse();
  const direction = selected == null ? [entryForm,'tee','coupling','elbow','pipe']
    : previous==null || index>route.indexOf(previous) ? [...ahead,...behind] : [...behind,...ahead];
  const next=direction.find(id=>visible.includes(id));
  for(const id of route) if(nodes[id]) nodes[id].dataset.cue=String(id===next);
}
