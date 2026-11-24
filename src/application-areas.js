export const areas = [
 {id:'water',name:{zh:'建筑给水',en:'Building water'},copy:{zh:'楼下厨房与楼上卫浴共用一根给水立管。',en:'The downstairs kitchen and upstairs bathroom share one water riser.'}},
 {id:'home-water',name:{zh:'家庭活水',en:'Home water'},copy:{zh:'水管走顶，再沿墙向下接入水槽、洗衣机和洗手盆。',en:'Overhead pipes drop along the wall to the sink, washing machine and basin.'}},
 {id:'gas',name:{zh:'建筑燃气',en:'Building gas'},copy:{zh:'燃气管从表后沿墙向下，接到灶具底部。',en:'From the gas meter, the pipe drops down the wall and enters beneath the hob.'}},
 {id:'fire',name:{zh:'消防',en:'Fire protection'},copy:{zh:'喷头接在顶管上，消火栓箱接在立管的支路上。',en:'The overhead pipe feeds the sprinklers. A branch from the riser serves the hose cabinet.'}},
 {id:'industry',name:{zh:'工业',en:'Industry'},copy:{zh:'两根支管从车间上方引下，分别接入两台机床。',en:'Each machine tool has its own feed from the overhead header.'}},
 {id:'cooling',name:{zh:'液冷数据中心',en:'Liquid cooling'},copy:{zh:'机柜上方并行两路管道，一路供水，一路回流至冷却设备。',en:'Above the racks, one line supplies coolant and the other carries it back to the cooling unit.'}},
];
export const ids = areas.map(area => area.id);
export const initialScene = ()=>{const id=new URLSearchParams(location.search).get('scene');return ids.includes(id)?id:'water';};
export const destination = id=>id==='home-water'?'/applications?scene=water&application=home-water':'/applications?scene='+id;
