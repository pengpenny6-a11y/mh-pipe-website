import React,{useId} from 'react';
import HeroNeighborhood from './HeroNeighborhood.jsx';
import './application-bridge.css';

// The miniature is a way into the application spaces, separate from the
// product hero. Its existing entry, hover and ambient motion remain intact.
export default function ApplicationBridge({lang='en',onSceneSelect}){
 const id=useId(),zh=lang==='zh';
 return <section className="application-bridge" aria-labelledby={id+'-title'}>
  <div className="application-bridge__copy">
   <h2 id={id+'-title'}>{zh?'连接不同应用':'Connections across applications'}</h2>
   <p>{zh?'选择建筑，查看相应的管路应用。':'Choose a building to explore its piping application.'}</p>
  </div>
  <div className="application-bridge__scene">
   <HeroNeighborhood lang={lang} onSceneSelect={onSceneSelect}/>
  </div>
 </section>;
}
