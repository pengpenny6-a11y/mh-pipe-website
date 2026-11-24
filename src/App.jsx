import React,{useState,useEffect,useLayoutEffect,useRef} from 'react';
import {flushSync} from 'react-dom';
import Modal from './Modal.jsx';
import {facilityRendering, facilityStandards} from './company-facility.js';
import SiteNavigation from './SiteNavigation.jsx';
import InteractionCursor from './InteractionCursor.jsx';
import BootSequence from './BootSequence.jsx';
import PageLoadTransition from './PageLoadTransition.jsx';
import ProductDepth from './ProductDepth.jsx';
import CompanyDepth from './CompanyDepth.jsx';
import NewsDepth from './NewsDepth.jsx';
import {NewsArchive} from './HomeNewsDesk.jsx';
import ManufacturingDepth from './ManufacturingDepth.jsx';
import ApplicationDepth from './ApplicationDepth.jsx';
import {ContactPage} from './ContactDepth.jsx';
import {ServicesPage,NewsPage} from './ServicesNews.jsx';
import {useSiteMotion,resetScroll,scrollDestination,transitionPage} from './site-motion.js';
import {products as originalProducts,scenes} from './content.js';
import {productSeries,ringProducts} from './product-series.js';
import PrecisionHome from './PrecisionHome.jsx';
import HomeDirectory from './HomeDirectory.jsx';
import StandardEvidence from './StandardEvidence.jsx';
import ManufacturingTech from './ManufacturingTech.jsx';
import ApplicationsTech from './ApplicationsTech.jsx';
import PartnersTech from './PartnersTech.jsx';
import {CompanyOverview,QualityStudio,Literature,BusinessContact,company} from './CompanyTech.jsx';
const products = [...originalProducts, ...ringProducts];
const productSeriesLabel = (p, lang) => productSeries.find(s => s.id === p.family)?.name[lang] || (lang === 'zh' ? '不锈钢管材' : 'Stainless steel pipe');
const t=(lang,en,zh)=>lang==='zh'?zh:en;
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gs=()=>window.gsap;
const src=(p)=>p.cataloguePhoto||p.image||`/assets/products/${p.id}.png`;
const name=(p,l)=>p.name[l];
function ProductImage({p,lang,...props}){return <img src={src(p)} alt={name(p,lang)} draggable="false" {...props}/>}
export function App(){const [path,setPath]=useState(location.pathname);const [routeKey,setRouteKey]=useState(location.pathname+location.search);const [booting,setBooting]=useState(true);const [lang,setLang]=useState(new URLSearchParams(location.search).get('lang')==='zh'?'zh':'en');const [product,setProduct]=useState(null);const [context,setContext]=useState('');const [photo,setPhoto]=useState(null);const [inquiry,setInquiry]=useState(false);const [inquiryDefaults,setInquiryDefaults]=useState({});const [items,setItems]=useState(()=>{try{const data=JSON.parse(localStorage.getItem('mh-inquiry-v1'));return Array.isArray(data)?data.filter(i=>i&&products.some(p=>p.id===i.id)).map(i=>({...i,size:String(i.size||''),quantity:String(i.quantity||'')})):[]}catch{return[]}});const [toast,setToast]=useState('');const [prepared,setPrepared]=useState(false);const app=useRef();const origin=useRef(null);const selectedRoute=path.replace(/\/$/,'')||'/';
useSiteMotion(Boolean(product||photo||inquiry));
useEffect(()=>{const pop=()=>{const nextPath=location.pathname,nextSearch=location.search,nextLang=new URLSearchParams(nextSearch).get('lang')==='zh'?'zh':'en';transitionPage(()=>flushSync(()=>{setPath(nextPath);setRouteKey(nextPath+nextSearch);setLang(nextLang);setProduct(null);setPhoto(null);setInquiry(false)}),{path:nextPath,lang:nextLang,restoreY:nextPath==='/'?history.state?.mhHomeScrollY:undefined})};window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop)},[]);useEffect(()=>{document.documentElement.lang=lang;document.title=lang==='zh'?'MH PIPE 岷河 · 不锈钢管道系统':'MH PIPE — Stainless steel piping systems';},[lang]);useEffect(()=>{localStorage.setItem('mh-inquiry-v1',JSON.stringify(items))},[items]);useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(id)},[toast]);useEffect(()=>{window.ScrollTrigger?.refresh()},[path,lang]);useLayoutEffect(()=>{if(document.documentElement.dataset.pageTransition)return;resetScroll();if(!gs()||reduced()||document.documentElement.dataset.booting==='true')return;const c=gs().context(()=>{gs().fromTo('.route-content',{opacity:.25},{opacity:1,duration:.4,ease:'power2.out',onComplete:()=>window.ScrollTrigger?.refresh()})},app);return()=>c.revert()},[path]);
const go=to=>{
 const u=new URL(to,location.origin);
 u.searchParams.set('lang',lang);
 if(u.pathname===location.pathname && u.search===location.search){
  scrollDestination(u.hash,{animate:true});
  return;
 }
 if(selectedRoute==='/')history.replaceState({...history.state,mhHomeScrollY:window.scrollY},'');
 transitionPage(()=>{
  history.pushState({},'',u);
  flushSync(()=>{setPath(u.pathname);setRouteKey(u.pathname+u.search);setProduct(null);setPhoto(null);setInquiry(false)});
 },{path:u.pathname,lang});
}; const switchLang=()=>{const next=lang==='en'?'zh':'en';setLang(next);const u=new URL(location);u.searchParams.set('lang',next);history.replaceState({},'',u)};
const openProduct=(p,scene='')=>{const button=document.activeElement;const container=button?.closest('.pa-detail,.ap-node-card,.ps-studio');const image=button?.querySelector('[data-product-origin]')||button?.querySelector('.ps-current-image')||button?.querySelector('img')||container?.querySelector('.ps-current-image')||container?.querySelector('img');const b=image?.getBoundingClientRect();origin.current=b?{x:b.x,y:b.y,width:b.width,height:b.height}:null;setProduct(p);setContext(scene)};const add=(p)=>{setItems(prev=>prev.some(i=>i.id===p.id)?prev:[...prev,{id:p.id,scene:context,size:'',quantity:''}]);setToast(t(lang,'Added to your inquiry','已加入询盘清单'))};const openInquiry=(defaults={})=>{setInquiryDefaults(defaults);setPrepared(false);setInquiry(true)};
function inquiryProductName(item){const p=products.find(entry=>entry.id===item.id);return productSeriesLabel(p,lang)+' / '+name(p,lang)}
function openEmail(form){if(!form.reportValidity())return;const fields=new FormData(form);const body=[...fields.entries()].map(([key,value])=>key+': '+value);items.forEach(i=>body.push(inquiryProductName(i)+' | Size: '+i.size+' | Quantity: '+i.quantity));location.href='mailto:'+company.email+'?subject='+encodeURIComponent('MH PIPE — Product inquiry')+'&body='+encodeURIComponent(body.join('\n'));}
function prepare(e){e.preventDefault();const data=new FormData(e.currentTarget);const lines=['MH PIPE — Inquiry draft',...data.entries()].map(v=>Array.isArray(v)?v.join(': '):v);items.forEach(i=>lines.push(`${inquiryProductName(i)} | Size: ${i.size} | Quantity: ${i.quantity} | Application: ${i.scene}`));const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='MH-PIPE-inquiry.txt';a.click();URL.revokeObjectURL(url);setPrepared(true)}
const photoStandard=photo && facilityStandards.find(standard=>standard.file===photo);
return <div ref={app} className={(lang==='zh'?'language-zh ':'')+(selectedRoute==='/'?'is-precision-home':'')}>{booting&&<BootSequence lang={lang} onComplete={() => {
  setBooting(false);
}}/>}<PageLoadTransition enabled={!booting} lang={lang}/><div className="site-content" inert={booting?true:undefined}><SiteNavigation lang={lang} route={selectedRoute==='/manufacturing'?'/company':selectedRoute} go={go} onLanguage={switchLang} onInquiry={openInquiry} itemCount={items.length}/>
<main className="route-content" tabIndex={-1} key={routeKey}>{selectedRoute==='/'?<><PrecisionHome lang={lang} go={go} onProduct={openProduct} onInquiry={openInquiry} onPhoto={setPhoto}/></>:selectedRoute==='/products'?<><ProductDepth lang={lang} onProduct={openProduct} onInquiry={openInquiry} go={go}/></>:selectedRoute==='/applications'?<><ApplicationsTech full story expanded lang={lang} onProduct={openProduct} onInquiry={openInquiry}/><ApplicationDepth lang={lang} onProduct={openProduct} onInquiry={openInquiry} go={go}/></>:selectedRoute==='/manufacturing'?<><ManufacturingTech full lang={lang} onPhoto={setPhoto} go={go}/><ManufacturingDepth lang={lang} go={go} onPhoto={setPhoto} onInquiry={openInquiry}/></>:selectedRoute==='/services'?<ServicesPage lang={lang} go={go} onInquiry={openInquiry} onPhoto={setPhoto}/>:selectedRoute==='/news'?<><NewsPage lang={lang} go={go} onPhoto={setPhoto}/><NewsDepth lang={lang} go={go} onInquiry={openInquiry}/><NewsArchive lang={lang}/></>:selectedRoute==='/company'?<><CompanyOverview full lang={lang} go={go} onPhoto={setPhoto}/><CompanyDepth lang={lang} go={go} onPhoto={setPhoto} onInquiry={openInquiry}/><PartnersTech lang={lang}/><BusinessContact lang={lang} onOpen={openInquiry}/></>:<ContactPage lang={lang} onInquiry={openInquiry} go={go}/>}</main>
{selectedRoute!=='/'&&<HomeDirectory lang={lang} go={go}/>}</div><InteractionCursor lang={lang} disabled={booting||Boolean(product||photo||inquiry)}/>
{toast&&<div className="toast" role="status">{toast}<button onClick={()=>{setProduct(null);openInquiry()}}>{t(lang,'Review','查看')}</button></div>}
{product&&<Modal key={product.id} origin={origin.current} label={name(product,lang)} close={()=>setProduct(null)} kind="product-modal"><div className="detail-image"><ProductImage p={product} lang={lang}/>{(product.cataloguePhoto || product.family==='ring') && <span className="detail-photo-source">{t(lang,'MH PIPE product catalogue','岷河产品画册实物图')}</span>}</div><div className="detail-copy"><p className="detail-family">{productSeriesLabel(product,lang)}</p><h2>{name(product,lang)}</h2><p>{product.description[lang]}</p><p className="technical-note">{t(lang,'Confirm dimensions and suitability against the product drawing.','具体尺寸与适配，请依据产品图纸确认。')}</p><button className="button coral" onClick={()=>add(product)}>{items.some(i=>i.id===product.id)?t(lang,'Added to inquiry','已加入询盘'):t(lang,'Add to inquiry','加入询盘')}</button><button className="text-link" onClick={()=>{add(product);setProduct(null);openInquiry({interest:t(lang,'Request product drawings','索取产品图纸')})}}>{t(lang,'Request drawings','索取图纸')}</button><div className="detail-other">{products.filter(p=>p.id!==product.id && (product.family==='ring' ? p.family==='ring' : p.family!=='ring')).map(p=><button key={p.id} onClick={()=>openProduct(p,context)}><ProductImage p={p} lang={lang}/><span>{name(p,lang)}</span></button>)}</div></div></Modal>}
{photoStandard ? <Modal kind="mh-standard-modal" label={photoStandard.code+' · '+photoStandard[lang]} close={()=>setPhoto(null)}>
  <figure>
    <img src={'/assets/company/'+photoStandard.file} alt={photoStandard.code+' '+t(lang,'certificate from the MH PIPE brochure','证书（岷河画册）')}/>
    <figcaption>{photoStandard.code} · {photoStandard[lang]}</figcaption>
  </figure>
</Modal> : photo&&<Modal kind="photo-modal" label={photo.includes('rendering')?t(lang,'Facility rendering','厂区效果图'):t(lang,'Company photograph','公司实拍')} close={()=>setPhoto(null)}><img src={'/assets/company/'+photo} alt={photo===facilityRendering.file ? facilityRendering.alt[lang] : photo.includes('rendering') ? t(lang,'Retouched MH PIPE facility rendering','经视觉优化的岷河厂区效果图') : t(lang,'MH PIPE company photograph','岷河公司实拍')}/></Modal>}
{inquiry&&<Modal kind="inquiry-modal" label={t(lang,'Your inquiry','您的询盘')} close={()=>setInquiry(false)}><h2>{t(lang,'Your inquiry.','您的询盘。')}</h2><div className="inquiry-list">{items.length?items.map((i,index)=>{const p=products.find(x=>x.id===i.id);return <div className="inquiry-item" key={i.id}><ProductImage p={p} lang={lang}/><div><strong>{name(p,lang)}</strong><p className="inquiry-line-series">{productSeriesLabel(p,lang)}</p><div className="small-inputs"><input aria-label={t(lang,'Required size','所需尺寸')} placeholder={t(lang,'Required size','所需尺寸')} value={i.size} onChange={e=>setItems(items.map((x,n)=>n===index?{...x,size:e.target.value}:x))}/><input aria-label={t(lang,'Quantity','数量')} placeholder={t(lang,'Quantity','数量')} value={i.quantity} onChange={e=>setItems(items.map((x,n)=>n===index?{...x,quantity:e.target.value}:x))}/></div></div><button aria-label={t(lang,'Remove product','移除产品')} onClick={()=>setItems(items.filter(x=>x.id!==i.id))}>×</button></div>}):<p>{t(lang,'Tell us which products you are looking for.','请告诉我们您正在寻找的产品。')}</p>}</div><form onSubmit={prepare}><label>{t(lang,'Company','公司')}<input name="Company" autoComplete="organization" required/></label><label>{t(lang,'Work email','工作邮箱')}<input name="Email" type="email" autoComplete="email" required/></label><label>{t(lang,'Market','市场')}<input name="Market" defaultValue={inquiryDefaults.market||''}/></label><label>{t(lang,'Your requirements','您的需求')}<textarea name="Requirements" defaultValue={inquiryDefaults.interest||''} rows="3" required/></label><button className="button coral" type="button" onClick={e=>openEmail(e.currentTarget.form)}>{t(lang,'Open email draft','打开邮件草稿')}</button><button className="text-link" type="submit">{t(lang,'Download inquiry draft','下载询盘草稿')}</button><p className="form-note">{t(lang,'Review and send in your email app. This website does not send the inquiry automatically.','请在邮件应用中核对并发送。网站不会自动发送询盘。')}</p>{prepared&&<p role="status">{t(lang,'Your draft is ready. Please review the downloaded file.','询盘草稿已生成，请查看下载文件。')}</p>}</form></Modal>}
</div>}
