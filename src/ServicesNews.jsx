import {routeHref} from './site-routes.js';
import React, {useLayoutEffect, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {company} from './CompanyTech.jsx';
import './services-news.css';

const t=(lang,en,zh)=>lang==='zh'?zh:en;
const standardSource='https://std.samr.gov.cn/gb/search/gbDetailedCNF?id=71F772D81B07D3A7E05397BE0A0AB82A';
const brochure='/downloads/minhe-company-brochure-2024-zh.pdf';
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const internal=(e,to,go)=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.shiftKey){e.preventDefault();go(to)}};

function usePageEntrance(root){
 useLayoutEffect(()=>{
  const g=window.gsap;if(!g||reduced())return;
  let timeline;
  const ctx=g.context(()=>{
   timeline=g.timeline({paused:document.documentElement.dataset.booting==='true'})
    .fromTo('.snw-title-line>span',{yPercent:110},{yPercent:0,duration:1.1,stagger:.09,ease:'power3.out'},0)
    .fromTo('.snw-heading-rule',{scaleX:0},{scaleX:1,duration:1.2,ease:'power3.inOut',transformOrigin:'left center'},.1);
  },root);
  const begin=()=>timeline?.play();window.addEventListener('mh-intro-ready',begin);
  return()=>{window.removeEventListener('mh-intro-ready',begin);ctx.revert()};
 },[]);
}

const serviceStages=[
 {id:'selection',name:{en:'Product selection',zh:'产品选型'},title:{en:'Tell us what the system needs.',zh:'从使用场景，确定产品。'},body:{en:'Share the application, pipe size and connection type. Product selection starts with the requirements of your system.',zh:'告诉我们使用场景、管径和连接方式，一起核对所需的管材与管件。'},needs:{en:['Application','Pipe size','Connection type'],zh:['应用领域','管径规格','连接方式']},image:'/assets/services/project-consultation.png',kind:'scenario',caption:{en:'Service scenario · Concept image',zh:'服务情境示意'}},
 {id:'drawings',name:{en:'Drawing review',zh:'图纸确认'},title:{en:'Check the connection in detail.',zh:'把每一个连接，核对清楚。'},body:{en:'Product and process design start with your drawings and application. We review the dimensions, material and mating pipe with the project requirements.',zh:'围绕项目开展产品与工艺设计，结合图纸逐项核对尺寸、材料与配套管材。'},needs:{en:['Drawing or reference','Material','Mating pipe'],zh:['图纸或参考型号','材料要求','配套管材']},image:'/assets/services/technical-review.png',kind:'scenario',caption:{en:'Service scenario · Concept image',zh:'服务情境示意'}},
 {id:'coordination',name:{en:'Order coordination',zh:'订单沟通'},title:{en:'Bring the order into focus.',zh:'让需求，落实到订单。'},body:{en:'Quantity, packaging and the required delivery window help define an order. Availability, lead time and terms are agreed for each inquiry.',zh:'明确数量、包装与期望交期。供货安排、交付时间和交易条款，按实际询盘逐项确认。'},needs:{en:['Quantities','Packaging','Delivery window'],zh:['采购数量','包装要求','期望交期']},image:'/assets/services/site-coordination.png',kind:'scenario',caption:{en:'Service scenario · Concept image',zh:'服务情境示意'}},
 {id:'documents',name:{en:'Technical documents',zh:'资料支持'},title:{en:'The information behind the product.',zh:'产品之外，资料同样重要。'},body:{en:'Start with the company brochure. Specify any drawings, inspection documents or market requirements you need so their availability can be checked.',zh:'先从公司画册了解产品与制造。所需图纸、检验资料及目标市场要求，可在沟通时一并提出并核实。'},needs:{en:['Product documents','Inspection requirements','Destination market'],zh:['产品资料','检验要求','目标市场']},image:'/assets/company/brochure-cover-2024.png',kind:'document',caption:{en:'Company brochure · 2024 · Chinese',zh:'公司画册 · 2024版 · 中文'}}
];

const serviceQuestions=[
 {id:'quotation',q:{en:'What should I include in a quotation request?',zh:'询价时，需要提供哪些信息？'},a:{en:'List the product or reference drawing, size, material requirement and quantity. Add the destination market, application and preferred delivery window. A clear item list helps keep the discussion specific.',zh:'请列明产品名称或参考图纸、规格、材料要求和数量，并补充目的地市场、应用场景及期望交期。清晰的明细有助于逐项沟通。'}},
 {id:'dimensions',q:{en:'What helps confirm the pipe and fitting match?',zh:'如何确认管材与管件是否配套？'},a:{en:'Share the exact product model or drawing, pipe specification and intended connection method. The dimensions and application should be checked together before an order is confirmed.',zh:'请提供具体型号或图纸、管材规格与拟采用的连接方式，在确认订单前一并核对尺寸与适用条件。'}},
 {id:'documents',q:{en:'Where can I find drawings and installation documents?',zh:'在哪里获取图纸与安装资料？'},a:{en:'The company brochure is available below. Include the product model when requesting drawings, tool compatibility information or installation instructions so the relevant documents can be checked.',zh:'公司画册可在下方直接打开。索取具体图纸、适配工具信息或安装说明时，请同时提供产品型号，便于核对对应资料。'}},
 {id:'market',q:{en:'How do I discuss requirements for my market?',zh:'海外项目的资料要求，如何确认？'},a:{en:'Name the destination country and the documents required by the buyer or project. Product-specific reports, standards and documentation need to be reviewed for that request; availability is confirmed during the inquiry.',zh:'请说明目的地国家，以及采购方或项目要求的文件清单。对应产品的报告、标准和资料需按需求逐项核实，具体可提供内容在询盘中确认。'}},
 {id:'support',q:{en:'What should I prepare for a technical question?',zh:'反馈现场问题时，需要准备什么？'},a:{en:'Include the product identification, order or batch reference if available, a description of the issue and the operating context. Add an overall photograph and close-ups of the relevant connection when you send your email.',zh:'请提供产品标识、可查到的订单或批次、问题描述与使用环境。发送邮件时，可附上现场整体照片以及相关连接位置的近照。'}}
];

function downloadText(filename,lines){
 const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\n')],{type:'text/plain;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function ServiceResources({lang}){
 const [open,setOpen]=useState(false),[downloaded,setDownloaded]=useState(false);
 const [brief,setBrief]=useState({project:'',market:'',application:'',items:'',timing:''});
 const change=e=>{setBrief(v=>({...v,[e.target.name]:e.target.value}));setDownloaded(false)};
 const fields=[['project','Company / project','公司 / 项目'],['market','Destination market','目的地市场'],['application','Application','应用领域'],['timing','Preferred delivery window','期望交期']];
 const save=e=>{e.preventDefault();downloadText('MH-PIPE-project-brief.txt',['MH PIPE — '+t(lang,'Project brief','项目需求清单'),'',...fields.map(([key,en,zh])=>t(lang,en,zh)+': '+brief[key]),'',t(lang,'Products, sizes, quantities and document requirements','产品、规格、数量及资料要求')+':',brief.items,'',t(lang,'Attach drawings and photographs when emailing this brief to ','发送时可附上图纸与照片。联系邮箱：')+company.email]);setDownloaded(true)};
 return <section className="sd-resources" id="resources"><div className="sd-section-heading"><h2>{t(lang,'Resources','资料下载')}<HeadingEnglish lang={lang}>Resources</HeadingEnglish></h2><p>{t(lang,'Read the company brochure or prepare a product and project brief.','阅读公司画册，或整理一份产品与项目需求清单。')}</p></div><div className="sd-resource-list">
  <a className="sd-resource-row" href={brochure} target="_blank" rel="noreferrer"><div><h3>{t(lang,'Company brochure','公司画册')}</h3><p>{t(lang,'Products, manufacturing and inspection · Chinese · 2024','产品、制造与检验 · 中文 · 2024版')}</p></div><span>{t(lang,'Open PDF','打开 PDF')}</span></a>
  <button className="sd-resource-row" aria-expanded={open} aria-controls="project-brief-builder" onClick={()=>setOpen(v=>!v)}><div><h3>{t(lang,'Project brief','项目需求清单')}</h3><p>{t(lang,'Prepare a concise product and project summary.','整理规格、数量与项目要求，下载后用于沟通。')}</p></div><span>{open?t(lang,'Close','收起'):t(lang,'Create brief','创建清单')}</span></button>
  <div className={'sd-expand'+(open?' is-open':'')} id="project-brief-builder" aria-hidden={!open} inert={!open?true:undefined} onTransitionEnd={()=>window.ScrollTrigger?.refresh()}><div className="sd-expand-inner"><form className="sd-brief-form" onSubmit={save}>{fields.map(([key,en,zh])=><label key={key}>{t(lang,en,zh)}<input name={key} value={brief[key]} onChange={change}/></label>)}<label className="sd-wide">{t(lang,'Products and requirements','产品与具体要求')}<textarea name="items" value={brief.items} onChange={change} rows="4" required placeholder={t(lang,'Product / size / quantity / documents needed','产品 / 规格 / 数量 / 所需资料')}/></label><div className="sd-form-bottom"><button type="submit">{t(lang,'Download brief','下载需求清单')}<span>TXT</span></button><p role="status">{downloaded?t(lang,'Brief downloaded. Review it before sharing.','清单已下载，分享前请核对。'):t(lang,'Creates a file on your device. Nothing is submitted.','在您的设备生成文件，不会自动提交。')}</p></div></form></div></div>
 </div></section>;
}

function ServiceQuestions({lang}){
 const [active,setActive]=useState(null);
 return <section className="sd-faq"><div className="sd-section-heading"><h2>{t(lang,'Common questions','常见问题')}<HeadingEnglish lang={lang}>Common questions</HeadingEnglish></h2><p>{t(lang,'Practical answers for procurement and project teams.','采购与项目沟通中的常见问题。')}</p></div><div className="sd-questions">{serviceQuestions.map(question=>{const open=active===question.id;return <article className={'sd-question'+(open?' is-open':'')} key={question.id}><h3><button aria-expanded={open} aria-controls={'answer-'+question.id} onClick={()=>setActive(open?null:question.id)}>{question.q[lang]}<span aria-hidden="true">+</span></button></h3><div id={'answer-'+question.id} className={'sd-expand'+(open?' is-open':'')} aria-hidden={!open} onTransitionEnd={()=>window.ScrollTrigger?.refresh()}><div className="sd-expand-inner"><p>{question.a[lang]}</p></div></div></article>})}</div></section>;
}

function TechnicalBrief({lang,onInquiry}){
 const submit=e=>{e.preventDefault();const values=new FormData(e.currentTarget);onInquiry?.({interest:[t(lang,'Technical support request','技术支持需求'),...Array.from(values.entries()).map(([key,value])=>key+': '+value),t(lang,'Photographs and drawings will be attached in the email if available.','现场照片与图纸可在发送邮件时补充附件。')].join('\n')})};
 return <section className="sd-support"><div className="sd-support-intro"><h2>{t(lang,'Technical support','技术支持')}<HeadingEnglish lang={lang}>Technical support</HeadingEnglish></h2><p>{t(lang,'Construction training, on-site guidance and follow-up maintenance support. Tell us the stage of your project and the help you need.','提供施工培训、现场指导与后期维护支持。告诉我们项目阶段，以及需要协助的具体事项。')}</p><ul><li>{t(lang,'Product identification','产品标识或型号')}</li><li>{t(lang,'Order or batch reference, if available','订单或批次信息（如有）')}</li><li>{t(lang,'Overall and connection close-up photographs','现场整体与连接位置近照')}</li></ul><p className="sd-support-note">{t(lang,'Add photographs in your email app. This form does not upload files.','照片请在邮件中添加，本表单不上传附件。')}</p></div><form className="sd-support-form" onSubmit={submit}><label>{t(lang,'Product / model','产品 / 型号')}<input name={t(lang,'Product','产品')} required/></label><label>{t(lang,'Order / batch reference','订单 / 批次')}<input name={t(lang,'Order or batch','订单或批次')}/></label><label className="sd-wide">{t(lang,'What would you like to discuss?','请描述现场情况')}<textarea name={t(lang,'Issue description','问题描述')} rows="4" required/></label><button className="sd-support-action" type="submit">{t(lang,'Prepare support inquiry','整理技术咨询')}<span aria-hidden="true">+</span></button></form></section>;
}

export function ServicesPage({lang,go,onInquiry,onPhoto}){
 const root=useRef(),panel=useRef(),indicator=useRef(),tablist=useRef();
 const [active,setActive]=useState(()=>Math.max(0,serviceStages.findIndex(stage=>stage.id===new URLSearchParams(location.search).get('stage'))));const current=serviceStages[active];
 usePageEntrance(root);
 useLayoutEffect(()=>{
  const g=window.gsap;const tabs=tablist.current?.querySelectorAll('[role=tab]');
  if(!tabs?.length)return;
  const align=()=>{
   const selected=tabs[active];const x=selected.offsetLeft,width=selected.offsetWidth;
   if(!g||reduced()){Object.assign(indicator.current.style,{transform:`translateX(${x}px)`,width:`${width}px`});return}
   g.to(indicator.current,{x,width,duration:.65,ease:'power3.inOut',overwrite:true});
  };
  align();const resize=new ResizeObserver(align);resize.observe(tablist.current);
  let ctx;
  if(g&&!reduced())ctx=g.context(()=>{
   g.timeline({defaults:{ease:'power3.out'}})
    .fromTo('.ss-media-current',{clipPath:'inset(0 0 100% 0)',scale:1.04},{clipPath:'inset(0 0 0% 0)',scale:1,duration:.9},0)
    .fromTo('.ss-panel-copy>*',{y:24,opacity:0},{y:0,opacity:1,stagger:.07,duration:.65},.12)
    .fromTo('.ss-ordinal',{yPercent:20,opacity:.2},{yPercent:0,opacity:1,duration:.8},0);
  },panel);
  return()=>{resize.disconnect();ctx?.revert();g?.killTweensOf(indicator.current)};
 },[active,lang]);
 const select=(index,focus=false)=>{setActive(index);if(focus)tablist.current.querySelectorAll('[role=tab]')[index]?.focus()};
 const navigateTabs=e=>{let next=active;if(e.key==='ArrowRight')next=(active+1)%4;else if(e.key==='ArrowLeft')next=(active+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;else return;e.preventDefault();select(next,true)};
 return <div className="snw-page ss-page" ref={root}>
  <header className="snw-heading"><h1><span className="snw-title-line"><span>{t(lang,'Service & support','服务体系')}</span></span><HeadingEnglish lang={lang}>Service &amp; support</HeadingEnglish></h1><p>{t(lang,'Get help with product selection, drawings, order details and technical documents.','围绕您的项目，沟通产品选型、图纸、订单细节与技术资料。')}</p><div className="snw-heading-rule"/></header>
  <section className="ss-process" aria-label={t(lang,'Service process','服务流程')}>
   <div className="ss-tabs" role="tablist" aria-label={t(lang,'Explore the service process','了解服务流程')} ref={tablist} onKeyDown={navigateTabs}>
    {serviceStages.map((stage,i)=><button role="tab" id={'service-tab-'+stage.id} aria-selected={i===active} aria-controls="service-detail" tabIndex={i===active?0:-1} key={stage.id} onClick={()=>select(i)}><span className="ss-step">{String(i+1).padStart(2,'0')}</span><span>{stage.name[lang]}</span></button>)}
    <i ref={indicator} className="ss-active-line" aria-hidden="true"/>
   </div>
   <div id="service-detail" className={'ss-panel ss-panel-'+current.kind} role="tabpanel" aria-labelledby={'service-tab-'+current.id} tabIndex="0" ref={panel}>
    <div className="ss-visual"><span className="ss-ordinal" aria-hidden="true">{String(active+1).padStart(2,'0')}</span><div className="ss-media-current" key={current.id}>
     {current.kind==='scenario'?<img src={current.image} alt={t(lang,current.id==='selection'?'Business partners discussing a project':current.id==='drawings'?'Project team reviewing drawings':'Engineers coordinating at a building site',current.id==='selection'?'商务合作沟通情境':current.id==='drawings'?'团队图纸讨论情境':'工程现场协作情境')} draggable="false"/>:current.kind==='photo'?<button data-cursor="view" aria-label={t(lang,'Enlarge the production photograph','放大生产现场照片')} onClick={()=>onPhoto?.('tube-making.webp')}><img src={current.image} alt={current.caption[lang]} draggable="false"/></button>:current.kind==='document'?<a href={brochure} target="_blank" rel="noreferrer" aria-label={t(lang,'Open the 2024 company brochure','打开2024版公司画册')}><img src={current.image} alt={current.caption[lang]} draggable="false"/></a>:<img src={current.image} alt={t(lang,current.id==='selection'?'Stainless steel equal tee':'Stainless steel straight coupling',current.id==='selection'?'不锈钢等径三通':'不锈钢直通')} draggable="false"/>}
    </div><p className="ss-caption">{current.caption[lang]}</p></div>
    <div className="ss-panel-copy" key={current.id+'-copy'}><h2>{current.title[lang]}<HeadingEnglish lang={lang}>{current.title.en}</HeadingEnglish></h2><p>{current.body[lang]}</p><ul aria-label={t(lang,'Useful information to share','沟通所需信息')}>{current.needs[lang].map(item=><li key={item}>{item}</li>)}</ul><button className="ss-inquiry" onClick={()=>onInquiry?.({interest:current.name[lang]})}>{t(lang,'Discuss your requirements','沟通具体需求')}<span aria-hidden="true">+</span></button></div>
   </div>
  </section>
  <ServiceResources lang={lang}/>
  <ServiceQuestions lang={lang}/>
  <TechnicalBrief lang={lang} onInquiry={onInquiry}/>
  <section className="ss-contact-note"><h2>{t(lang,'Direct contact','直接联系')}<HeadingEnglish lang={lang}>Direct contact</HeadingEnglish></h2><div><p>{t(lang,'For importers, distributors and project teams.','面向进口商、经销商与工程团队。')}</p><a href={'mailto:'+company.email}>{company.email}</a></div><a className="ss-range-link" href={routeHref('/products',lang)} onClick={e=>internal(e,'/products',go)}>{t(lang,'Browse the product range','浏览产品系列')}</a></section>
 </div>;
}

export function NewsPage({lang,go,onPhoto}){
 const root=useRef(),feature=useRef(),detail=useRef();const [open,setOpen]=useState(false);
 usePageEntrance(root);
 useLayoutEffect(()=>{
  const g=window.gsap;if(!g||reduced())return;
  const ctx=g.context(()=>{
   g.fromTo('.nw-standard-code',{xPercent:4},{xPercent:-3,ease:'none',scrollTrigger:{trigger:feature.current,start:'top bottom',end:'bottom top',scrub:1.3}});
   g.fromTo('.nw-document-image',{yPercent:8,rotate:4},{yPercent:-4,rotate:-2,ease:'none',scrollTrigger:{trigger:'.nw-library',start:'top bottom',end:'bottom top',scrub:1.2}});
   g.fromTo('.nw-factory-image',{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:'.nw-manufacturing',start:'top bottom',end:'bottom top',scrub:1.4}});
  },root);return()=>ctx.revert();
 },[]);
 useLayoutEffect(()=>{
  const g=window.gsap;if(!g||reduced()){detail.current.style.height=open?'auto':'0px';window.ScrollTrigger?.refresh();return}
  const tween=g.to(detail.current,{height:open?'auto':0,duration:.65,ease:'power3.inOut',overwrite:true,onComplete:()=>window.ScrollTrigger?.refresh()});return()=>tween.kill();
 },[open,lang]);
 return <div className="snw-page nw-page" ref={root}>
  <header className="snw-heading"><h1><span className="snw-title-line"><span>{t(lang,'News & resources','新闻与资料')}</span></span><HeadingEnglish lang={lang}>News &amp; resources</HeadingEnglish></h1><p>{t(lang,'Explore standards records, company literature and practical guides for product selection.','查阅标准参与记录、公司画册与采购选型指南。')}</p><div className="snw-heading-rule"/></header>
  <article className="nw-standard" ref={feature}>
   <div className="nw-standard-top"><span>{t(lang,'National standard','国家标准')}</span><span>{t(lang,'Published 12 July 2017','发布于2017年7月12日')}</span></div>
   <p className="nw-standard-code" aria-label="GB/T 33926–2017"><span>GB/T</span>33926<span>–2017</span></p>
   <div className="nw-standard-heading"><h2>{t(lang,'A contribution to the standard.','参与国家标准编制。')}<HeadingEnglish lang={lang}>A contribution to the standard</HeadingEnglish></h2><button aria-expanded={open} aria-controls="standard-record" onClick={()=>setOpen(v=>!v)}><span>{open?t(lang,'Close record','收起详情'):t(lang,'Read the record','了解详情')}</span><span className={'nw-toggle'+(open?' is-open':'')} aria-hidden="true">+</span></button></div>
   <div className="nw-record" id="standard-record" ref={detail} inert={!open?true:undefined} aria-hidden={!open}><div className="nw-record-inner"><h3>{t(lang,'Stainless steel pipe fitting of ring compression','不锈钢环压式管件')}<HeadingEnglish lang={lang}>Stainless steel pipe fitting of ring compression</HeadingEnglish></h3><div><p>{t(lang,'The National Public Service Platform for Standards Information lists Sichuan Minhe Pipeline Construction Engineering Co., Ltd. among the drafting organizations for GB/T 33926–2017.','全国标准信息公共服务平台列明，四川岷河管道建设工程有限公司为 GB/T 33926–2017 的主要起草单位之一。')}</p><dl><div><dt>{t(lang,'Published','发布日期')}</dt><dd>2017-07-12</dd></div><div><dt>{t(lang,'Effective','实施日期')}</dt><dd>2018-02-01</dd></div></dl><a href={standardSource} target="_blank" rel="noreferrer">{t(lang,'View the official standard record','查看官方标准记录')}</a></div></div></div>
  </article>
  <div className="nw-editorial">
   <article className="nw-library"><a className="nw-document-visual" href={brochure} target="_blank" rel="noreferrer" aria-label={t(lang,'Open the company brochure PDF','打开公司画册PDF')}><span className="nw-paper-type" aria-hidden="true">MH</span><img className="nw-document-image" src="/assets/company/brochure-cover-2024.png" alt={t(lang,'2024 MH PIPE company brochure cover','2024版岷河公司画册封面')} loading="lazy"/></a><div className="nw-article-meta"><span>{t(lang,'Company literature','企业资料')}</span><span>{t(lang,'2024 edition','2024版')}</span></div><h2>{t(lang,'The company, in detail.','一本画册，了解岷河。')}<HeadingEnglish lang={lang}>The company, in detail</HeadingEnglish></h2><p>{t(lang,'Products, manufacturing and inspection in the company brochure. Available in Chinese.','企业介绍、产品系列与制造检测资料。中文版本。')}</p><a className="nw-article-link" href={brochure} target="_blank" rel="noreferrer">{t(lang,'Open brochure','打开画册')}<span>PDF</span></a></article>
   <article className="nw-manufacturing"><button className="nw-factory-visual" data-cursor="view" aria-label={t(lang,'Enlarge the factory photograph','放大厂区实拍')} onClick={()=>onPhoto?.('factory.webp')}><img className="nw-factory-image" src="/assets/company/factory.webp" alt={t(lang,'MH PIPE manufacturing facility in Meishan','岷河眉山制造厂区')} loading="lazy"/></button><div className="nw-article-meta"><span>{t(lang,'Manufacturing','制造实录')}</span><span>{t(lang,'Meishan, Sichuan','四川眉山')}</span></div><h2>{t(lang,'Where the product takes shape.','走进产品诞生的地方。')}<HeadingEnglish lang={lang}>Where the product takes shape</HeadingEnglish></h2><p>{t(lang,'Explore company photographs of production and inspection equipment.','通过企业实拍，了解生产与检验设备。')}</p><a className="nw-article-link" href={routeHref('/manufacturing',lang)} onClick={e=>internal(e,'/manufacturing',go)}>{t(lang,'Explore manufacturing','走近制造')}<span aria-hidden="true">+</span></a></article>
  </div>
 </div>;
}
