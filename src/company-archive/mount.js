import markup from './chapter.html?raw';
import css from './chapter.css?inline';

import { events } from './events.js';


export function mountArchive(root,{lang,embedded=false,onNavigate}){
  const controller=new AbortController(), {signal}=controller;
  const styles=document.createElement('style');styles.textContent=css;
  const template=document.createElement('template');template.innerHTML=markup;
  root.replaceChildren(styles,template.content);
  const el=id=>root.querySelector('#'+id);
  const journey=root.querySelector('.journey'),desk=root.querySelector('.desk');
  const stickyOffset=()=>parseFloat(getComputedStyle(desk).top)||0;
  let resumeAfterClose=false;
  const paper=root.querySelector('.paper'), view=root.querySelector('.window'), record=el('record');
  const intro=root.querySelector('.intro'), heading=root.querySelector('.history-heading'), caption=root.querySelector('.caption');
  const lens=root.querySelector('.lens'), lensImage=lens.querySelector('img'), yearlist=root.querySelector('.nav-years');
  const narrow=matchMedia('(max-width:820px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let locale=lang==='en'?1:0, selected=0, waitForArchive=null, swap=null;
  let box={w:0,h:0}, pageW=0,pageH=0,gutter=0,visible=[0],progress=0;
  const local=(zh,en)=>locale?en:zh;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
  const year=i=>events[i].year==='today'?local('今天','Today'):events[i].year;
  const details=[
    {name:['屋面','Roof'], x:.34,y:.34},
    {name:['办公楼','Offices'], x:.68,y:.61},
    {name:['入口','Entrance'], x:.69,y:.78}
  ];
  const detailPrint=root.querySelector('.detail-print'), detailPlate=root.querySelector('.detail-plate');
  const detailImage=el('detail-img'), registration=root.querySelector('.registration'), toolbar=root.querySelector('.landmarks');
  const pointerFocus={x:details[1].x,y:details[1].y};
  let detailWidth=1,detailHeight=1,focusIndex=1, focusMotion=null, blades=[];
  const detailButtons=details.map((part,i)=>{
    const button=document.createElement('button');button.type='button';
    button.addEventListener('click',()=>moveDetail(part.x,part.y,i));
    toolbar.append(button);return button;
  });

  const exposedEvents=embedded ? events.slice(0,1) : events;
  const frames=exposedEvents.map((item,i)=>{
    const sheet=document.createElement('div');
    sheet.className=item.specimen?'exposure specimen':'exposure';
    if(i===0)sheet.style.visibility='visible';
    const image=new Image();image.alt='';image.draggable=false;image.decoding='async';
    if(!i)image.fetchPriority='high';
    image.addEventListener('load',()=>{if(!signal.aborted && visible.includes(i)){fit(i);if(i===0)drawDetail();}});
    sheet.append(image);
    if(item.specimen){
      const mark=document.createElement('span');mark.className='specimen-code';mark.textContent='GB/T 33926—2017';sheet.append(mark);
    }
    el('deck').append(sheet);
    return {sheet,image,pos:null};
  });
  frames.forEach((frame,i)=>{frame.image.src=events[i].src;});

  const tabs=exposedEvents.map((item,i)=>{
    const tab=document.createElement('button');tab.id='year-'+i;tab.type='button';tab.role='tab';tab.dataset.index=i;tab.setAttribute('aria-controls','record');
    tab.append(document.createElement('b'),document.createElement('small'));
    const preview=new Image();preview.alt='';preview.className='film-preview'+(item.specimen?' sample':'');preview.src=item.src;tab.append(preview);
    tab.addEventListener('click',()=>request(i));
    tab.addEventListener('keydown',e=>{
      const target={ArrowLeft:Math.max(0,i-1),ArrowRight:Math.min(exposedEvents.length-1,i+1),Home:0,End:exposedEvents.length-1}[e.key];
      if(target===undefined)return;
      e.preventDefault();tabs[target].focus({preventScroll:true});request(target);
    });
    yearlist.append(tab);return tab;
  });

  function mark(index){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    record.setAttribute('aria-labelledby','year-'+index);
  }

  function typeset(){
    const item=events[selected];
    el('study').dataset.year=item.year;
    el('folio').textContent=year(selected);record.dataset.today=String(item.year==='today');
    el('event-title').textContent=item.title[locale];el('event-copy').textContent=item.copy[locale];
    el('credit').textContent=item.credit[locale];view.setAttribute('aria-label',item.credit[locale]);
    const source=el('event-source');
    source.hidden=!item.url;
    if(item.url){
      source.href=item.url.replace('LANG',locale?'en':'zh');
      source.textContent=item.action[locale];
      if(item.url.startsWith('https:')){source.target='_blank';source.rel='noopener noreferrer';}else source.removeAttribute('target');
    } else source.removeAttribute('href');
  }
  function hideLens(){lens.style.display='none';}
  function localize(){
    (embedded?root.host:document.documentElement).lang=locale?'en':'zh-CN';if(!embedded)document.title=local('关于我们 · 厂区与历程','About MH PIPE · Campus and history');
    el('locale').hidden=embedded;
    const company=el('company-link');
    company.hidden=!embedded;
    company.textContent=local('企业概况','Company profile');
    company.href='/company?lang='+(locale?'en':'zh');
    el('locale').textContent=local('EN','中文');el('locale').setAttribute('aria-label',local('English','简体中文'));
    el('intro-title').textContent=local('关于我们','About MH PIPE');
    el('intro-copy').textContent=local('岷河制造不锈钢管材与管件，产品涵盖双卡压、环压与厚壁管路系列。','MH PIPE manufactures stainless steel pipe and fittings for double-press, ring-press and thick-wall systems.');
    el('history-title').textContent=local('岷河发展历程','Our history');root.querySelector('.index-name').textContent=local('发展历程','History');
    yearlist.setAttribute('aria-label',local('选择年份','Choose a milestone'));yearlist.parentNode.setAttribute('aria-label',local('发展历程','Company history'));
    el('full-image').textContent=local('查看全图','View full image');el('close').textContent=local('关闭','Close');
    tabs.forEach((tab,i)=>{tab.firstChild.textContent=year(i);tab.querySelector('small').textContent=events[i].name[locale];});
    el('detail-caption').textContent=local('厂区局部','Campus detail');
    detailPrint.setAttribute('aria-label',local('厂区局部取景','A closer view of the campus'));
    toolbar.setAttribute('aria-label',local('选择厂区局部','Choose a campus detail'));
    detailButtons.forEach((button,i)=>{button.textContent=details[i].name[locale];button.setAttribute('aria-pressed',String(i===focusIndex));});
    typeset();draw(progress);mark(selected);
  }

  function fit(index){
    const {sheet,image}=frames[index], item=events[index];
    if(!image.naturalWidth || !box.w || !box.h)return;
    const {w,h}=box;
    const scale=item.specimen?Math.min(w*.69/image.naturalWidth,h*.72/image.naturalHeight,1):Math.max(w/image.naturalWidth,h/image.naturalHeight);
    const iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;
    const x=(w-iw)*(item.cx??.5),y=(h-ih)*(item.cy??.44);
    image.style.width=iw+'px';image.style.height=ih+'px';image.style.transform='translate3d('+x+'px,'+y+'px,0)';
    sheet.style.width=w+'px';sheet.style.height=h+'px';frames[index].pos={iw,ih,x,y};
  }
  function expose(index){
    if(swap){swap.kill();swap=null;}
    blades.forEach(node=>node.remove());blades=[];
    visible=[index];frames.forEach(({sheet},i)=>{sheet.style.zIndex=i===index?'1':'0';sheet.style.visibility=i===index?'visible':'hidden';gsap.set(sheet,{x:0});});
    fit(index);hideLens();
  }
  function select(index, immediate=false){
    if(index===selected){if(immediate)expose(index);return;}
    const previous=selected;
    expose(previous);selected=index;mark(index);typeset();
    if(immediate||reduced.matches){expose(index);return;}
    const forward=index>previous, current=frames[index].sheet;
    visible=[previous,index];fit(index);current.style.visibility='hidden';
    swap=gsap.timeline({defaults:{ease:'power2.inOut'},onComplete:()=>{swap=null;expose(index);}});
    // Each strip uses the whole photograph beneath an angled aperture. The
    // edges coincide when open, like the parallel bays of the workshop roof.
    const topEdges=[-9,17,44,73,106],bottomEdges=[-3,23,50,79,112];
    for(let i=0;i<4;i++){
      const blade=current.cloneNode(true);
      blade.classList.add('blade');blade.style.visibility='visible';blade.style.zIndex='2';
      const lt=topEdges[i],lb=bottomEdges[i],rt=topEdges[i+1],rb=bottomEdges[i+1];
      const polygon=(a,b,c,d)=>'polygon('+a+'% 0,'+b+'% 0,'+c+'% 100%,'+d+'% 100%)';
      blade.style.clipPath=forward?polygon(lt,lt,lb,lb):polygon(rt,rt,rb,rb);
      el('deck').append(blade);blades.push(blade);
      swap.to(blade,{clipPath:polygon(lt-.09,rt+.09,rb+.09,lb-.09),duration:.59},.054*(forward?i:3-i));
    }
    swap.fromTo([el('folio'),record.querySelector('.ink')],{opacity:.3,y:8},{opacity:1,y:0,duration:.53,stagger:.035,ease:'power2.out'},.07);
  }

  function drawDetail(){
    if(narrow.matches||!frames[0].pos||!detailImage.naturalWidth)return;
    const {iw,ih,x,y}=frames[0].pos;
    const dw=Math.max(detailWidth*2.25,detailHeight*3.35),dh=dw*1086/1448;
    const minX=detailWidth/(2*dw),minY=detailHeight/(2*dh);
    const fx=gsap.utils.clamp(minX,1-minX,pointerFocus.x),fy=gsap.utils.clamp(minY,1-minY,pointerFocus.y);
    detailImage.style.width=dw+'px';detailImage.style.height=dh+'px';
    detailImage.style.transform='translate3d('+(detailWidth/2-fx*dw)+'px,'+(detailHeight/2-fy*dh)+'px,0)';
    const rw=iw*detailWidth/dw,rh=ih*detailHeight/dh;
    registration.style.width=rw+'px';registration.style.height=rh+'px';
    registration.style.transform='translate3d('+(x+iw*fx-rw/2)+'px,'+(y+ih*fy-rh/2)+'px,0)';
  }
  function moveDetail(x,y,index){
    focusIndex=index;
    detailButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    focusMotion?.kill();
    if(reduced.matches){Object.assign(pointerFocus,{x,y});drawDetail();return;}
    focusMotion=gsap.to(pointerFocus,{x,y,duration:index===-1?.29:.62,ease:'power3.out',onUpdate:drawDetail});
  }
  detailImage.addEventListener('load',drawDetail,{signal});

  function draw(value){
    progress=value;
    const p=embedded?0:narrow.matches?1:reduced.matches?(value>=.5?1:0):smooth(value);
    const arch=!embedded && (narrow.matches || p>=.43);
    paper.dataset.reading=String(arch);
    el('study').dataset.mode=arch?'archive':'intro';
    el('study').dataset.progress=p.toFixed(3);
    el('chapter-name').textContent=arch?local('企业档案','Company archive'):local('始创于 2000 年','Established in 2000');
    if(!narrow.matches){
      const startH=Math.min(pageH*.595,pageW*.50*1086/1448),startW=startH*1448/1086;
      const endW=pageW*.53, startY=pageH*.207, endY=pageH*.221;
      box.w=mix(startW,endW,p);box.h=mix(startH,pageH*.514,p);
      const ypos=mix(startY,endY,p);
      view.style.width=box.w+'px';view.style.height=box.h+'px';view.style.top=ypos+'px';view.style.right='auto';
      detailWidth=pageW-(gutter+startW+pageW*.033)-gutter;
      detailHeight=Math.min(startH*.72,detailWidth*.78);
      detailPrint.style.width=detailWidth+'px';detailPrint.style.left=(gutter+startW+pageW*.033)+'px';
      detailPrint.style.top=(startY+startH*.11)+'px';detailPlate.style.height=detailHeight+'px';
      const shut=smooth(p/.53);
      detailPrint.style.visibility=shut>.98?'hidden':'visible';
      detailPrint.style.clipPath='inset(0 '+(100*shut)+'% 0 0)';detailPrint.style.transform='translateX('+(-pageW*.09*shut)+'px)';
      detailPrint.inert=p>.25;registration.style.opacity=selected===0?1-shut:0;
      root.querySelector('.index-name').textContent=arch?local('年份','Year'):local('发展历程','History');
      caption.style.top=(ypos+box.h+Math.max(6,pageH*.012))+'px';caption.style.width=box.w+'px';
      // Reading states settle even when a visitor pauses the scroll gesture.
      // The left edge of the record clears the closing campus detail first.
      record.style.pointerEvents=arch?'auto':'none';record.inert=!arch;
      intro.setAttribute('aria-hidden',String(arch));heading.setAttribute('aria-hidden',String(!arch));
    }else{
      view.removeAttribute('style');caption.removeAttribute('style');intro.removeAttribute('style');record.removeAttribute('style');
      intro.removeAttribute('aria-hidden');record.inert=false;box={w:view.clientWidth,h:view.clientHeight};
    }
    visible.forEach(fit);
    if(selected===0)drawDetail();
    if(!narrow.matches && value<.32 && selected!==0 && waitForArchive===null){select(0,true);}
    if(arch && waitForArchive!==null && (value>.96||narrow.matches)){
      const target=waitForArchive;waitForArchive=null;select(target);
    }
    if(!arch)hideLens();
  }
  function measure(){
    if(swap)expose(selected);
    pageW=paper.clientWidth;pageH=paper.clientHeight;
    gutter=parseFloat(getComputedStyle(root.querySelector('.context')).left);
    if(!Number.isFinite(gutter))gutter=23;
    hideLens();draw(progress);
  }
  function request(index){
    if(narrow.matches||progress>.95){waitForArchive=null;select(index);return;}
    waitForArchive=index;
    const y=journey.getBoundingClientRect().top+scrollY+journey.offsetHeight-desk.offsetHeight-stickyOffset();
    if(embedded && window.mhScroll)window.mhScroll.scrollTo(y,{immediate:reduced.matches,duration:.65});
    else window.scrollTo({top:y,behavior:reduced.matches?'instant':'smooth'});
  }
  function showLens(e){
    if(e.pointerType!=='mouse'||swap||!frames[selected].pos)return;
    const rect=view.getBoundingClientRect(), x=e.clientX-rect.left,y=e.clientY-rect.top;
    if(!narrow.matches && selected===0 && progress<.18){
      if(reduced.matches)return;
      const pos=frames[0].pos;
      moveDetail((x-pos.x)/pos.iw,(y-pos.y)/pos.ih,-1);return;
    }
    if(reduced.matches||el('study').dataset.mode!=='archive')return;
    const size=Math.min(150,box.h*.36), zoom=1.8, pos=frames[selected].pos;
    if(x<size*.53||y<size*.53||x>box.w-size*.53||y>box.h-size*.53){hideLens();return;}
    if(lensImage.getAttribute('src')!==events[selected].src)lensImage.src=events[selected].src;
    lens.style.display='block';lens.style.width=lens.style.height=size+'px';
    lens.style.transform='translate3d('+(x-size/2)+'px,'+(y-size/2)+'px,0)';
    lensImage.style.width=pos.iw*zoom+'px';lensImage.style.height=pos.ih*zoom+'px';
    lensImage.style.transform='translate3d('+(size/2-(x-pos.x)*zoom)+'px,'+(size/2-(y-pos.y)*zoom)+'px,0)';
  }
  view.addEventListener('pointermove',showLens);view.addEventListener('pointerleave',hideLens);
  function openFullImage(){
    const item=events[selected];
    el('full-photo').src=item.src;el('full-photo').alt=item.credit[locale];el('full-caption').textContent=item.credit[locale];
    if(embedded && window.mhScroll && !window.mhScroll.isStopped){window.mhScroll.stop();resumeAfterClose=true;}
    el('lightbox').showModal();el('close').focus();hideLens();
  }
  function resumeScroll(){
    if(resumeAfterClose){resumeAfterClose=false;window.mhScroll?.start();}
  }
  el('lightbox').addEventListener('close',resumeScroll);
  el('lightbox').addEventListener('wheel',e=>e.preventDefault(),{passive:false});
  if(embedded){
    const route=e=>{
      if(e.defaultPrevented||e.button!==0||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
      const url=new URL(e.currentTarget.href,location.href);
      if(url.origin!==location.origin)return;
      e.preventDefault();e.stopPropagation();
      onNavigate(url);
    };
    el('company-link').addEventListener('click',route);
    el('event-source').addEventListener('click',route);
  }
  el('full-image').addEventListener('click',openFullImage);
  el('close').addEventListener('click',()=>el('lightbox').close());
  el('lightbox').addEventListener('click',e=>{if(e.target===el('lightbox'))el('lightbox').close();});
  el('locale').addEventListener('click',()=>{
    locale=1-locale;const url=new URL(location.href);url.searchParams.set('lang',locale?'en':'zh');history.replaceState({},'',url);
    localize();measure();ScrollTrigger.refresh();
  });
  gsap.registerPlugin(ScrollTrigger);
  measure();localize();expose(0);
  const mm=gsap.matchMedia();
  if(!embedded) mm.add('(min-width:821px)',()=>{
    measure();
    const playhead={p:0};
    const tween=gsap.to(playhead,{p:1,ease:'none',onUpdate:()=>draw(playhead.p),scrollTrigger:{
      trigger:journey,start:()=> 'top top+='+stickyOffset(),end:()=>'+='+Math.max(1,journey.offsetHeight-desk.offsetHeight),scrub:reduced.matches?true:.18,onRefresh:measure
    }});
    return ()=>{tween.kill();};
  });
  if(!embedded) mm.add('(max-width:820px)',()=>{measure();draw(1);});
  window.addEventListener('resize',measure,{signal});
  reduced.addEventListener('change',()=>{if(swap)expose(selected);measure();ScrollTrigger.refresh();},{signal});
  document.fonts.ready.then(()=>{if(!signal.aborted){measure();ScrollTrigger.refresh();}});
  return {
    changeLanguage(language){
      locale=language==='en'?1:0;
      localize();
      measure();
    },
    dispose(){
      controller.abort();mm.revert();swap?.kill();focusMotion?.kill();
      if(el('lightbox').open)el('lightbox').close();
      resumeScroll();root.replaceChildren();
    }
  };
}
