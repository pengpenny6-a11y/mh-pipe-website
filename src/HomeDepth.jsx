import {routeHref} from './site-routes.js';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {products} from './content.js';
import './home-depth.css';
const t=(l,en,zh)=>l==='zh'?zh:en;
const parts=['pipe','coupling','elbow','tee'];
const roles={pipe:['The straight run','直线输送'],coupling:['The connection','同轴连接'],elbow:['The change of direction','改变方向'],tee:['The branch','形成分支']};
export function HomeRange({lang,onProduct,go}){
 const root=useRef();const [active,setActive]=useState('coupling');const item=products.find(p=>p.id===active);
 useLayoutEffect(()=>{const g=window.gsap;if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const ctx=g.context(()=>{g.fromTo('.hr-object',{x:70,y:15,rotate:-6,opacity:.2},{x:0,y:0,rotate:0,opacity:1,duration:.85,ease:'power3.out'});g.fromTo('.hr-role',{yPercent:75,opacity:0},{yPercent:0,opacity:1,duration:.65,ease:'power3.out'})},root);return()=>ctx.revert()},[active]);
 return <section className="hr-root" ref={root}><div className="hr-heading"><h2>{t(lang,'Parts of a complete system.','一套系统，完整配套。')}</h2><a href={routeHref('/products',lang)} onClick={e=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go('/products')}}}>{t(lang,'Product centre','产品中心')}</a></div><div className="hr-stage"><div className="hr-options" role="group" aria-label={t(lang,'Product forms','产品形态')}>{parts.map(id=><button key={id} aria-pressed={active===id} onMouseEnter={()=>setActive(id)} onFocus={()=>setActive(id)} onClick={()=>setActive(id)}><span>{products.find(p=>p.id===id).name[lang]}</span><span className="hr-option-dot" aria-hidden="true"/></button>)}</div><button className={'hr-preview hr-preview-'+active} onClick={()=>onProduct(item)} aria-label={t(lang,'View ','查看')+item.name[lang]} data-cursor="view"><span className="hr-background" aria-hidden="true">SYSTEM</span><img className="hr-object" key={active} src={item.image} alt={item.name[lang]} loading="lazy"/><span className="hr-role">{t(lang,...roles[active])}</span></button></div></section>
}
const serviceScenes=[
 {id:'consult',file:'project-consultation.png',title:['Business collaboration','商务合作'],body:['Discuss your market, product range and purchasing plans.','从目标市场、产品系列到采购计划，开始一次具体的沟通。']},
 {id:'review',file:'technical-review.png',title:['Technical coordination','技术协同'],body:['Bring your drawing, connection details and project requirements into the discussion.','把图纸、连接细节与项目要求，一起纳入讨论。']},
 {id:'site',file:'site-coordination.png',title:['Project support','项目支持'],body:['Connect product selection with installation requirements and project coordination.','让产品选型，与安装需求和项目配合相衔接。']}
];
export function HomeService({lang,go}){
 const root=useRef(),image=useRef();const [active,setActive]=useState(0);const current=serviceScenes[active];
 useLayoutEffect(()=>{const g=window.gsap;if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const ctx=g.context(()=>{g.fromTo('.hs-image',{clipPath:'inset(0 100% 0 0)',scale:1.08},{clipPath:'inset(0 0% 0 0)',scale:1,duration:.9,ease:'power3.inOut'});g.fromTo('.hs-description',{opacity:0,y:16},{opacity:1,y:0,duration:.6,ease:'power3.out'})},root);return()=>ctx.revert()},[active]);
 useEffect(()=>{const next=serviceScenes[(active+1)%serviceScenes.length];const img=new Image();img.src='/assets/services/'+next.file},[active]);
 return <section className="hs-root" ref={root}><div className="hs-opening"><h2>{t(lang,'People behind the connection.','合作，从沟通开始。')}</h2><p>{t(lang,'For importers, distributors and project teams.','面向进口商、经销商与工程团队。')}</p></div><div className="hs-layout"><div className="hs-image-wrap"><img className="hs-image" ref={image} key={current.id} src={'/assets/services/'+current.file} alt={t(lang,...current.title)} loading="lazy"/><span>{t(lang,'Service scenario · Concept image','服务情境示意')}</span></div><div className="hs-copy"><div className="hs-options" role="group" aria-label={t(lang,'Ways to work together','合作方式')}>{serviceScenes.map((entry,i)=><button key={entry.id} aria-pressed={i===active} onClick={()=>setActive(i)}><span>{t(lang,...entry.title)}</span><span aria-hidden="true">{i===active?'−':'+'}</span></button>)}</div><p className="hs-description">{t(lang,...current.body)}</p><a href={routeHref('/services',lang)} onClick={e=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go('/services')}}}>{t(lang,'Explore our services','了解服务体系')}</a></div></div></section>
}
