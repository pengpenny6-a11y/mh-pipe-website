import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import './news-depth.css';
import ChongqingNews from './ChongqingNews.jsx';

const guides=[
 {id:'inquiry',category:['Inquiry preparation','询盘准备'],title:['What makes an inquiry actionable?','怎样让一份询盘更清晰？'],summary:['Six details that help a supplier understand the product, the order and the destination.','把产品、订单和交付需求，整理成六项具体信息。'],image:'/assets/services/project-consultation.png',imageLabel:['Illustrative service scenario','服务情境示意'],intro:['A product name is a starting point. A useful inquiry also explains where the product will be used, what must connect to it and which documents you need. You can send an initial list, then complete the open questions together.','产品名称只是起点。一份有效询盘还需要说明使用场景、配套关系和资料需求。可以先发送已有清单，再共同核对尚未确定的部分。'],items:[
  {name:['Application & medium','应用与介质'],copy:['Describe the building or process, the conveyed medium and any project requirements already available.','说明建筑或工艺场景、输送介质，以及已经明确的项目要求。']},
  {name:['Product references','产品参考'],copy:['List the pipe and fitting types. Attach reference photographs or drawings and identify the connection system.','列出管材和管件类型，附上参考图片或图纸，并注明连接方式。']},
  {name:['Dimensions & material','尺寸与材料'],copy:['Provide the specified outside diameter, wall thickness, length and material reference where known. Mark unresolved fields for confirmation.','已明确的外径、壁厚、长度和材料要求应一并提供；暂未确定的项目可标记为待核对。']},
  {name:['Quantities & units','数量与单位'],copy:['Separate each item and state its quantity and unit. Distinguish an initial order from a later estimated requirement.','按产品逐项列明数量和单位，区分首单需求与后续预计需求。']},
  {name:['Destination & documents','目的地与资料'],copy:['Name the destination and any project, inspection or documentation requirements the buyer needs to meet.','注明目的地，以及采购方需要满足的项目、检验与文件要求。']},
  {name:['Packaging & schedule','包装与时间'],copy:['Describe labelling or packaging requests and the requested delivery timing. Availability and timing need confirmation.','说明标签、包装要求和期望交付时间；供应安排与时间需另行确认。']}
 ],outro:['If a detail is not yet known, say so. A clear list of open questions is more useful than an assumed specification.','不确定的信息可以直接注明。明确列出待确认事项，比使用未经核实的规格更有效。'],action:['Start with these details','按清单发起询盘']},
 {id:'nominal-size',category:['Product selection','产品选型'],title:['What to check beyond the DN marking.','DN相同，还需要核对什么？'],summary:['Nominal size is one part of a matching pipe and fitting specification.','公称尺寸，是管材与管件配套核对的一部分。'],image:'/assets/company/forming.webp',imageLabel:['Company photograph','企业实拍'],intro:['DN is a nominal size designation. It is not a substitute for the specified actual outside diameter. ISO 6708 defines how DN is designated; the relevant product information remains necessary when selecting a mating pipe and fitting.','DN是公称尺寸标识，不能代替具体的实际外径规格。ISO 6708规定了DN的标识方式；选择配套管材与管件时，仍需要核对相关产品资料。'],source:{label:['ISO 6708 — Definition and selection of DN','ISO 6708 — DN的定义与选择'],href:'https://www.iso.org/standard/21274.html'},items:[
  {name:['Nominal designation','公称尺寸标识'],copy:['Confirm the DN designation and the product system or specification in which it is used.','确认DN标识，以及该标识所对应的产品系统或规格依据。']},
  {name:['Mating dimensions','配套尺寸'],copy:['Check the specified tube outside diameter and wall thickness against the fitting documentation. Do not judge a match from the appearance of a photograph.','依据管件资料核对管材外径与壁厚，不根据照片中的视觉比例判断是否配套。']},
  {name:['Connection system','连接系统'],copy:['Identify the press or ring-compression connection and the corresponding product and installation requirements. A shared DN marking alone does not confirm compatibility.','明确卡压或环压连接方式，以及对应的产品与安装要求。仅凭相同DN标识，不能确认相互适配。']},
  {name:['Confirmed product drawing','确认产品图纸'],copy:['Request a matching pipe-and-fitting selection and a current product drawing. Resolve any differences before placing the order.','索取配套管材与管件选型资料及现行产品图纸，在下单前确认存在差异的项目。']}
 ],outro:['For a specific selection, send the pipe specification and connection reference together. Dimensions and suitability should be confirmed for the actual product and application.','具体选型时，建议同时提供管材规格和连接参考；尺寸与适用性按实际产品和使用场景确认。'],action:['Discuss a matched selection','核对配套选型']},
 {id:'inspection-documents',category:['Inspection & documents','检验与资料'],title:['Which inspection documents should you request?','验厂与检验资料，怎样准备？'],summary:['Connect the request to a product, an order and the evidence you need.','将资料需求，落实到具体产品、订单与核对依据。'],image:'/assets/company/spectrometry.webp',imageLabel:['Company photograph','企业实拍'],intro:['A workshop photograph, a management-system document and a product inspection record answer different questions. Start by identifying what you need to establish, then specify the document required for the actual order.','车间照片、管理体系文件与产品检验记录，回答的是不同问题。先明确需要核对什么，再为实际订单提出相应的文件要求。'],items:[
  {name:['The product and order','产品与订单'],copy:['Identify product references, material requirements, specifications and the order or batch to which the evidence should relate.','明确产品型号、材料要求、规格，以及资料应对应的订单或批次。']},
  {name:['Inspection requirements','检验要求'],copy:['Provide the test method or governing requirement, acceptance criteria and sampling scope if these have been specified by the project.','如项目已有规定，请提供检测方法或依据、验收要求与抽样范围。']},
  {name:['Document type & language','文件类型与语言'],copy:['State the required document type, language and version. Confirm its scope and availability before treating it as an order requirement.','说明所需文件类型、语言和版本，在作为订单要求前确认其范围与可提供情况。']},
  {name:['Traceability references','追溯信息'],copy:['Ask which product, material and batch identifiers are recorded and how the supplied documents relate to the goods.','核对记录中包含哪些产品、材料与批次标识，以及文件如何对应交付产品。']},
  {name:['Destination requirements','目的地要求'],copy:['Share the requirements already identified by the importer, local authority or project team. Request confirmation against the selected product.','提供进口方、当地主管机构或项目团队已明确的要求，并针对所选产品逐项核对。']}
 ],outro:['ISO 10474 describes types of inspection documents for steel products according to order requirements. Referring to the standard does not establish that every document type is available for a particular product; the request must be confirmed.','ISO 10474按订单要求描述钢产品的检验文件类型。引用该标准不代表具体产品能够提供全部类型文件；实际需求仍需确认。'],source:{label:['ISO 10474 — Steel and steel products: inspection documents','ISO 10474 — 钢与钢产品：检验文件'],href:'https://www.iso.org/standard/53736.html'},action:['Discuss inspection documents','沟通检验资料']}
];

const inquiryTemplate=[
 'Product / reference:\nApplication & medium:\nConnection system:\nMaterial reference:\nOutside diameter / wall thickness / length:\nQuantity & unit:\nDestination:\nRequired documents:\nPackaging / labelling:\nRequested timing:\nItems to confirm:',
 '产品 / 型号：\n应用与介质：\n连接方式：\n材料要求：\n外径 / 壁厚 / 长度：\n数量与单位：\n目的地：\n所需资料：\n包装 / 标签：\n期望时间：\n待确认事项：'
];

function Guide({guide,index,lang,open,onToggle,onInquiry}){
 const l=lang==='zh'?1:0,content=useRef();
 useLayoutEffect(()=>{const g=window.gsap;if(!g||!open||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const ctx=g.context(()=>g.fromTo('.nd-detail-lead,.nd-item,.nd-detail-note,.nd-detail-actions',{y:18,opacity:0},{y:0,opacity:1,duration:.65,stagger:.035,ease:'power3.out',delay:.12}),content);return()=>ctx.revert()},[open]);
 const download=()=>{const blob=new Blob(['\uFEFFMH PIPE — '+(l?'询盘信息清单':'Inquiry checklist')+'\n\n'+inquiryTemplate[l]+'\n'],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MH-PIPE-inquiry-checklist-'+lang+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const inquire=()=>onInquiry?.({interest:guide.id==='inquiry'?inquiryTemplate[l]:(l?'希望沟通：':'Please advise on: ')+guide.title[l]+'\n'+guide.items.map(item=>item.name[l]+':').join('\n')});
 return <article className={'nd-guide'+(open?' is-open':'')}>
  <h3 className="nd-guide-heading"><button className="nd-guide-toggle" id={'nd-guide-toggle-'+guide.id} aria-expanded={open} aria-controls={'nd-guide-panel-'+guide.id} onClick={onToggle}>
   <span className="nd-cover"><img src={guide.image} alt="" loading="lazy"/><span>{guide.imageLabel[l]}</span></span>
   <span className="nd-guide-intro"><span className="nd-category">{guide.category[l]}</span><span className="nd-guide-title">{guide.title[l]}<HeadingEnglish lang={lang}>{guide.title[0]}</HeadingEnglish></span><span className="nd-summary">{guide.summary[l]}</span><span className="nd-read">{open?(l?'收起指南':'Close guide'):(l?'阅读指南':'Read guide')}</span></span>
  </button></h3>
  <div className="nd-panel" id={'nd-guide-panel-'+guide.id} role="region" aria-labelledby={'nd-guide-toggle-'+guide.id} aria-hidden={!open} inert={!open}>
   <div className="nd-panel-clip"><div className="nd-detail" ref={content}>
    <div className="nd-detail-lead"><span className="nd-guide-number" aria-hidden="true">{'0'+(index+1)}</span><div><p>{guide.intro[l]}</p>{guide.id==='nominal-size'&&<a className="nd-source" href={guide.source.href} target="_blank" rel="noreferrer">{guide.source.label[l]}</a>}</div></div>
    <div className="nd-checklist">{guide.items.map((item,i)=><section className="nd-item" key={item.name[0]}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><div><h4>{item.name[l]}</h4><p>{item.copy[l]}</p></div></section>)}</div>
    <div className="nd-detail-note"><p>{guide.outro[l]}</p>{guide.id==='inspection-documents'&&<a className="nd-source" href={guide.source.href} target="_blank" rel="noreferrer">{guide.source.label[l]}</a>}</div>
    <div className="nd-detail-actions"><button onClick={inquire}>{guide.action[l]}</button>{guide.id==='inquiry'&&<button className="nd-download" onClick={download}>{l?'下载询盘清单':'Download the checklist'}</button>}</div>
   </div></div>
  </div>
 </article>;
}

export default function NewsDepth({lang='en',go,onInquiry}){
 const [active,setActive]=useState(null);
 useEffect(()=>{const change=()=>{const match=guides.findIndex(guide=>location.hash==='#'+guide.id);if(match>=0)setActive(match)};change();window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 return <><ChongqingNews lang={lang}/><section className="nd-root" aria-labelledby="nd-title"><header className="nd-heading"><h2 id="nd-title">{lang==='zh'?'采购与选型指南。':'Knowledge for buyers.'}<HeadingEnglish lang={lang}>Knowledge for buyers</HeadingEnglish></h2><p>{lang==='zh'?'给进口商、经销商与工程采购的一份工作参考。':'Practical references for importers, distributors and project buyers.'}</p></header><div className="nd-guides">{guides.map((guide,i)=><Guide key={guide.id} guide={guide} index={i} lang={lang} open={active===i} onToggle={()=>setActive(active===i?null:i)} onInquiry={onInquiry}/>)}</div></section></>;
}
