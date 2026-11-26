import {routeHref} from './site-routes.js';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import HistoryLandscape from './HistoryLandscape.jsx';
import HeadingEnglish from './HeadingEnglish.jsx';
import './company-depth.css';
const work=[
 {id:'design',name:['Product & process','产品与工艺'],title:['Start with the application.','先了解应用，再核对产品。'],copy:['A product discussion begins with the medium, connection type and mating pipe. Drawings and process requirements make that discussion specific.','从输送介质、连接方式与配套管材开始沟通，通过图纸和工艺要求，把产品选择落实到具体细节。'],image:'forming.webp',action:['Explore the product range','查看产品系列'],path:'/products'},
 {id:'quality',name:['Manufacturing & inspection','制造与检测'],title:['Look beyond the finished product.','走近产品背后的制造现场。'],copy:['Explore photographs of tube production, forming, material analysis and inspection equipment. The manufacturing tour connects the equipment to the questions buyers can ask.','查看制管、成型、材料分析与检测设备实拍，在制造巡览中了解设备与对应的采购核对事项。'],image:'laboratory.webp',action:['Explore manufacturing','进入制造巡览'],path:'/manufacturing'},
 {id:'people',name:['People & project support','人员与项目沟通'],title:['Keep the requirements connected.','让产品、图纸与交付需求相互衔接。'],copy:['Importers, distributors and project teams can discuss product references, document requirements and order details through one inquiry.','进口商、经销商与工程团队，可在同一份询盘中明确产品参考、所需资料和订单细节。'],image:'/assets/services/technical-review.png',action:['Discuss a project','沟通项目需求'],scenario:true}
];
export default function CompanyDepth({lang='en',go,onPhoto,onInquiry}){
 const index=lang==='zh'?1:0,workPanel=useRef(),[capability,setCapability]=useState(0),[reduce,setReduce]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const selected=work[capability];
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduce(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change)},[]);
 useEffect(()=>{['forming.webp','laboratory.webp'].forEach(file=>{const i=new Image();i.src='/assets/company/'+file})},[]);
 useLayoutEffect(()=>{const g=window.gsap;if(!g||reduce)return;const ctx=g.context(()=>{g.fromTo('.cd-work-image img',{scale:1.08,opacity:.3},{scale:1,opacity:1,duration:.85,ease:'power3.out'});g.fromTo('.cd-work-description',{y:20,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out'})},workPanel);return()=>ctx.revert()},[capability,reduce]);
 const open=(e,to)=>{if(go&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go(to)}};
 function keys(e,active,set,count){let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(active+1)%count;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(active+count-1)%count;else if(e.key==='Home')next=0;else if(e.key==='End')next=count-1;else return;e.preventDefault();set(next);e.currentTarget.querySelectorAll('[role=tab]')[next].focus({preventScroll:true})}
 return <div className="cd-root">
  <HistoryLandscape lang={lang}/>
  <section className="cd-work" aria-labelledby="cd-work-title"><div className="cd-section-title"><h2 id="cd-work-title">{index?'从生产现场，到技术沟通。':'The work behind the product.'}<HeadingEnglish lang={lang}>The work behind the product</HeadingEnglish></h2></div><div className="cd-work-layout" ref={workPanel}>
   <div><div className="cd-work-tabs" role="tablist" aria-orientation="vertical" aria-label={index?'了解岷河':'Explore MH PIPE'} onKeyDown={e=>keys(e,capability,setCapability,3)}>{work.map((item,i)=><button key={item.id} id={'cd-work-'+item.id} role="tab" aria-selected={i===capability} aria-controls="cd-work-panel" tabIndex={i===capability?0:-1} onClick={()=>setCapability(i)}>{item.name[index]}</button>)}</div><div className="cd-work-description" key={selected.id}><h3>{selected.title[index]}<HeadingEnglish lang={lang}>{selected.title[0]}</HeadingEnglish></h3><p>{selected.copy[index]}</p>{selected.path?<a href={routeHref(selected.path,lang)} onClick={e=>open(e,selected.path)}>{selected.action[index]}</a>:<button onClick={()=>onInquiry?.({interest:index?'进口商 / 经销商项目合作':'Importer / distributor project discussion'})}>{selected.action[index]}</button>}</div></div>
   <div className="cd-work-image" id="cd-work-panel" role="tabpanel" aria-labelledby={'cd-work-'+selected.id}>{selected.scenario?<img key={selected.id} src={selected.image} alt={index?'团队讨论图纸的服务情境示意':'Illustrative service scene showing a team discussing drawings'}/>:<button onClick={()=>onPhoto?.(selected.image)} data-cursor="view" aria-label={index?'放大企业实拍':'Enlarge company photograph'}><img key={selected.id} src={'/assets/company/'+selected.image} alt={selected.name[index]}/></button>}<span>{selected.scenario?(index?'服务情境示意':'Illustrative service scenario'):(index?'企业实拍':'Company photograph')}</span></div>
  </div></section>
 </div>;
}
