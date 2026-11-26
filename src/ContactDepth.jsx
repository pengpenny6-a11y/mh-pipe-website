import {routeHref} from './site-routes.js';
import React, {useEffect,useLayoutEffect,useRef,useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {company} from './CompanyTech.jsx';
import {useInquiryDelivery} from './useInquiryDelivery.js';
import './contact-depth.css';

const t=(lang,en,zh)=>lang==='zh'?zh:en;
const storageKey='mh-contact-draft-v1';
const emptyDraft={kind:'distribution',company:'',email:'',market:'',products:'',channel:'',application:'',timing:'',model:'',reference:'',details:''};
const intents=[
 {id:'distribution',name:{en:'Distribution',zh:'经销合作'},title:{en:'Let’s understand your market.',zh:'从您的市场，开始交流。'},image:'project-consultation.png',alt:{en:'Business partners discussing cooperation; concept image',zh:'商务合作沟通情境示意'},description:{en:'Share the market you serve and the product range you are looking for.',zh:'介绍您所服务的市场，以及希望了解的产品系列。'},fields:[['products','Products of interest','意向产品'],['channel','Business / sales channels','业务 / 销售渠道']],prompt:{en:'Tell us about your company, customers and purchasing needs.',zh:'请介绍您的公司、服务客户及采购需求。'}},
 {id:'project',name:{en:'Project inquiry',zh:'项目咨询'},title:{en:'Put the project in context.',zh:'让我们了解项目。'},image:'site-coordination.png',alt:{en:'Engineers coordinating at a building project; concept image',zh:'建筑工程现场协作情境示意'},description:{en:'Tell us where the piping will be used, and the requirements you already know.',zh:'说明管道的使用场景，以及已有的项目要求。'},fields:[['application','Application','应用领域'],['timing','Preferred delivery window','期望交期']],prompt:{en:'Include products, quantities, sizes and drawing references where available.',zh:'可填写产品、数量、规格及已有图纸的参考信息。'}},
 {id:'technical',name:{en:'Technical support',zh:'技术支持'},title:{en:'Let’s look at the detail.',zh:'一起核对具体问题。'},image:'technical-review.png',alt:{en:'Project team reviewing drawings; concept image',zh:'工程团队图纸讨论情境示意'},description:{en:'A product reference and a clear description help focus the discussion.',zh:'提供产品信息与问题描述，让沟通更有针对性。'},fields:[['model','Product / model','产品 / 型号'],['reference','Order / batch reference','订单 / 批次']],prompt:{en:'Describe the question and operating context. Add photographs or drawings in your email app.',zh:'请描述问题与使用环境，照片或图纸可在邮件中另行添加。'}}
];
function restoreDraft(){
 const draft={...emptyDraft,marketEdited:false};
 try{
  const saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');
  if(!saved||typeof saved!=='object')return draft;
  for(const key of Object.keys(emptyDraft)){
   if(typeof saved[key]==='string')draft[key]=saved[key].slice(0,key==='details'?5000:240);
  }
  if(!intents.some(item=>item.id===draft.kind))draft.kind='distribution';
  draft.marketEdited=typeof saved.marketEdited==='boolean'?saved.marketEdited:Boolean(draft.market.trim());
 }catch{}
 return draft;
}
function entryDraft() {
 const draft=restoreDraft();
 const params=new URLSearchParams(location.search);
 const goal=params.get('intent');
 if(intents.some(item=>item.id===goal))draft.kind=goal;
 const market=params.get('market')?.trim().slice(0,240);
 if((goal==='distribution'||goal==='project')&&market&&!draft.marketEdited)draft.market=market;
 return draft;
}

function internal(e,to,go){if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.shiftKey){e.preventDefault();go(to)}}

export function ContactPage({lang,onInquiry,go}){
 const root=useRef(),visual=useRef(),form=useRef();const [draft,setDraft]=useState(entryDraft);const [status,setStatus]=useState(''),[copied,setCopied]=useState(''),[saved,setSaved]=useState(false);
 const delivery=useInquiryDelivery();
 const sending=delivery.result.state==='sending';
 const confirmed=delivery.result.state==='accepted';
 const active=intents.find(intent=>intent.id===draft.kind)||intents[0];
 useEffect(()=>{try{sessionStorage.setItem(storageKey,JSON.stringify(draft));setSaved(Object.keys(emptyDraft).some(key=>key!=='kind'&&draft[key].trim()))}catch{setSaved(false)}},[draft]);
 useLayoutEffect(()=>{const g=window.gsap;if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches)return;let intro;const context=g.context(()=>{
  intro=g.timeline({paused:document.documentElement.dataset.booting==='true'}).fromTo('.cd-title-line>span',{yPercent:110},{yPercent:0,duration:1.05,stagger:.1,ease:'power3.out'},0).fromTo('.cd-hero-email',{opacity:0,y:20},{opacity:1,y:0,duration:.7,ease:'power3.out'},.35);
  g.fromTo('.cd-location-photo img',{scale:1.1},{scale:1,ease:'none',scrollTrigger:{trigger:'.cd-location',start:'top bottom',end:'bottom top',scrub:1.2}});
 },root);const play=()=>intro?.play();window.addEventListener('mh-intro-ready',play);return()=>{window.removeEventListener('mh-intro-ready',play);context.revert()}},[]);
 useLayoutEffect(()=>{const g=window.gsap;if(!g||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const context=g.context(()=>{g.timeline().fromTo('.cd-current-image',{clipPath:'inset(0 100% 0 0)',scale:1.05},{clipPath:'inset(0 0% 0 0)',scale:1,duration:.95,ease:'power3.inOut'},0).fromTo('.cd-current-caption',{y:25,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},.2)},visual);return()=>context.revert()},[draft.kind]);
 const change=e=>{
  const {name,value}=e.target;
  setDraft(previous=>({...previous,[name]:value,marketEdited:previous.marketEdited||name==='market'}));
  setStatus('');delivery.reset();
 };
 const choose=id=>{
  if(sending||id===draft.kind)return;
  setDraft(previous=>({...previous,kind:id}));setStatus('');delivery.reset();
  const url=new URL(location.href);url.searchParams.set('intent',id);history.replaceState(history.state,'',url);
 };
 const lines=()=>['MH PIPE — '+active.name[lang],'',t(lang,'Company','公司')+': '+draft.company,t(lang,'Email','邮箱')+': '+draft.email,t(lang,'Market','市场')+': '+draft.market,...active.fields.map(([key,en,zh])=>t(lang,en,zh)+': '+draft[key]),'',t(lang,'Requirements','具体需求')+':',draft.details];
 const download=()=>{if(!form.current.reportValidity())return;const url=URL.createObjectURL(new Blob(['\uFEFF'+lines().join('\n')],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='MH-PIPE-contact-brief.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('downloaded')};
 const email=()=>{if(!form.current.reportValidity())return;const subject=encodeURIComponent('MH PIPE — '+active.name[lang]);const body=encodeURIComponent(lines().join('\n'));window.location.href='mailto:'+company.email+'?subject='+subject+'&body='+body;setStatus('email')};
 const submit=event=>{
  event.preventDefault();
  if(delivery.channel==='checking'||sending||confirmed)return;
  if(delivery.channel==='email'){email();return;}
  setStatus('');
  const {kind,company,email:workEmail,market,details}=draft;
  const payload={kind,company,email:workEmail,market,details};
  for(const [key] of active.fields)payload[key]=draft[key];
  delivery.submit(payload);
 };
 const deliveryText={
  unconfirmed:t(lang,'Transmission could not be confirmed. Your entries are still here. Retry or send them by email.','暂时无法确认发送结果。已保留填写内容，可重试或改用邮件发送。'),
  busy:t(lang,'The mail service is busy. Please retry in a moment.','邮件服务正忙，请稍后重试。'),
  invalid:t(lang,'Check your company, work email and requirements before sending.','请核对公司名称、工作邮箱和具体需求后再发送。')
 };
 const copy=async(value,key)=>{try{await navigator.clipboard.writeText(value);setCopied(key)}catch{setCopied('failed')}};
 const handleTabs=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let index=intents.findIndex(item=>item.id===draft.kind);if(e.key==='Home')index=0;else if(e.key==='End')index=2;else index=(index+(e.key==='ArrowRight'?1:2))%3;choose(intents[index].id);root.current.querySelector('#contact-intent-'+intents[index].id)?.focus()};
 return <div className="cd-page" ref={root}>
  <header className="cd-heading"><h1>{[t(lang,'Contact MH PIPE','联系我们')].map(line=><span className="cd-title-line" key={line}><span>{line}</span></span>)}<HeadingEnglish lang={lang}>Contact MH PIPE</HeadingEnglish></h1><div className="cd-hero-email"><p>{t(lang,'Share your application, sizes and quantities to discuss product and supply requirements.','告诉我们应用场景、所需规格与数量，沟通产品与供货要求。')}</p><a href={'mailto:'+company.email}>{company.email}</a></div></header>
  <section className="cd-inquiry" id="contact-inquiry" aria-label={t(lang,'Contact MH PIPE','联系岷河')}>
   <div className="cd-intent-tabs" role="tablist" aria-label={t(lang,'Inquiry type','咨询类型')} onKeyDown={handleTabs}>{intents.map(intent=><button id={'contact-intent-'+intent.id} key={intent.id} role="tab" aria-selected={intent.id===active.id} aria-controls="contact-intent-panel" disabled={sending} tabIndex={intent.id===active.id?0:-1} onClick={()=>choose(intent.id)}><span>{intent.name[lang]}</span><i aria-hidden="true"/></button>)}</div>
   <div className="cd-inquiry-grid" role="tabpanel" id="contact-intent-panel" aria-labelledby={'contact-intent-'+active.id}>
    <figure className="cd-people" ref={visual}><div className="cd-current-image" key={active.id}><img src={'/assets/services/'+active.image} alt={active.alt[lang]} draggable="false"/></div><figcaption className="cd-current-caption" key={active.id+'-caption'}><h2>{active.title[lang]}<HeadingEnglish lang={lang}>{active.title.en}</HeadingEnglish></h2><p>{active.description[lang]}</p></figcaption><span className="cd-image-note">{t(lang,'Service scenario · Concept image','服务情境示意')}</span></figure>
    <form className="cd-form" ref={form} onSubmit={submit}>
     <div className="cd-form-intro"><h2>{t(lang,'Your requirements','咨询需求')}<HeadingEnglish lang={lang}>Your requirements</HeadingEnglish></h2><p>{t(lang,'Fields marked * are required.','带 * 为必填项。')}</p></div>
     <p className="cd-channel-note">{delivery.channel==='online'
       ? t(lang,'This form sends your inquiry to the MH PIPE business mailbox.','填写后可通过此表单发往岷河业务邮箱。')
       : delivery.channel==='email'
         ? t(lang,'Prepare your inquiry here, then send it from your email app to '+company.email+'.','在此填写需求后，将在您的邮件应用中发往 '+company.email+'。')
         : t(lang,'Checking the contact channel…','正在检查联系通道…')}</p>
     <fieldset className="cd-field-grid" disabled={sending}>
      <label>{t(lang,'Company *','公司 *')}<input name="company" autoComplete="organization" value={draft.company} onChange={change} required maxLength="240"/></label>
      <label>{t(lang,'Work email *','工作邮箱 *')}<input name="email" type="email" autoComplete="email" value={draft.email} onChange={change} required maxLength="240"/></label>
      <label>{t(lang,'Country / region','国家 / 地区')}<input name="market" autoComplete="country-name" value={draft.market} onChange={change} maxLength="240"/></label>
      {active.fields.map(([key,en,zh])=><label key={key}>{t(lang,en,zh)}<input name={key} value={draft[key]} onChange={change} maxLength="240"/></label>)}
      <label className="cd-wide">{t(lang,'Your requirements *','具体需求 *')}<textarea name="details" value={draft.details} onChange={change} rows="4" maxLength="5000" placeholder={active.prompt[lang]} required/></label>
     </fieldset>
     <div className="cd-form-actions">
      <button type="submit" className="cd-email-action" disabled={sending||confirmed||delivery.channel==='checking'}>
       {sending?t(lang,'Sending…','正在发送…'):confirmed?t(lang,'Accepted','已受理'):delivery.channel==='online'?t(lang,'Send inquiry','发送询盘'):t(lang,'Open email draft','打开邮件草稿')}
      </button>
      {delivery.channel==='online' && deliveryText[delivery.result.state] &&
       <button type="button" className="cd-download-action" onClick={email}>{t(lang,'Send by email','改用邮件')}</button>}
      <button type="button" className="cd-download-action" onClick={download} disabled={sending}>{t(lang,'Download brief','下载需求清单')}</button>
     </div>
     <div className="cd-form-state">
      <p role="status">{confirmed
       ? t(lang,'The mail service accepted your inquiry. Reference ','邮件服务已受理您的询盘，编号 ')+delivery.result.reference
       : deliveryText[delivery.result.state] || (status==='downloaded'
         ? t(lang,'Brief downloaded. You can attach it to your email.','需求清单已下载，可作为邮件附件。')
         : status==='email'?t(lang,'Complete sending in your email app.','请在邮件应用中完成发送。'):'')}</p>
      {saved&&!confirmed&&<p className="cd-saved">{t(lang,'Draft saved in this tab.','草稿已保存在当前标签页。')}</p>}
     </div>
    </form>
   </div>
  </section>
  <section className="cd-location"><div className="cd-location-copy"><h2>{t(lang,'Company address','公司地址')}<HeadingEnglish lang={lang}>Company address</HeadingEnglish></h2><p className="cd-company-name">{company.name[lang]}</p><address>{company.address[lang]}</address><div className="cd-channel-actions"><button onClick={()=>copy(company.address[lang],'address')}>{copied==='address'?t(lang,'Address copied','地址已复制'):t(lang,'Copy address','复制地址')}</button><button onClick={()=>copy(company.email,'email')}>{copied==='email'?t(lang,'Email copied','邮箱已复制'):t(lang,'Copy email','复制邮箱')}</button></div>{copied==='failed'&&<p role="status">{t(lang,'Please select and copy the contact details above.','请选中上方联系信息进行复制。')}</p>}<a href={routeHref('/company',lang)} onClick={e=>internal(e,'/company',go)}>{t(lang,'Learn about MH PIPE','了解岷河')}<span aria-hidden="true">+</span></a></div><figure className="cd-location-photo"><img src="/assets/company/factory-front.webp" alt={t(lang,'MH PIPE office and factory entrance','岷河办公楼与厂区入口')} loading="lazy"/><figcaption>{t(lang,'Company photograph','企业实拍')}</figcaption></figure></section>
  <div className="cd-help-links"><a href={routeHref('/services#resources',lang)} onClick={e=>internal(e,'/services#resources',go)}>{t(lang,'Documents & service resources','资料与服务资源')}</a><button onClick={()=>onInquiry?.()}>{t(lang,'Review your product inquiry','查看产品询盘清单')}</button></div>
 </div>;
}

export const ContactDepth=ContactPage;
