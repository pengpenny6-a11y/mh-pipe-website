import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft, ArrowRight, ArrowUpRight} from 'lucide-react';
import Modal from './Modal.jsx';
import HeadingEnglish from './HeadingEnglish.jsx';
import './home-project-gallery.css';

const assets='/assets/projects/';
const brochure='mh-engineering-cases.webp';
const projects=[
  {
    photo:'longli-waterfront.webp', size:[1078,592], source:brochure,
    title:['贵州龙里生态城','Longli Ecological City'], type:['滨水建筑','Waterfront development'],
    alt:['暮色中沿水岸展开的院落，灯光倒映在水面上。','Courtyard buildings along the waterfront, reflected in the water at dusk.'],
    detail:['岷河英文画册将贵州龙里生态城列入工程案例，并刊登了这张滨水建筑群的夜景。','The MH PIPE project register features this view of the waterfront buildings at Longli Ecological City in Guizhou.']
  },
  {
    photo:'water-renewal.webp', size:[2200,1238],
    title:['住宅供水改造','Residential water retrofit'], type:['建筑给水','Building water supply'],
    alt:['住宅外墙上的分户水表和分别引出的不锈钢管路。','A row of water meters on a tiled wall, each connected to a separate stainless steel supply line.'],
    detail:['沿住宅外墙布置的分户水表集中在同一高度。每一路的管道从表后独立引出，再沿墙转向各户。','Individual water meters sit at a common height on the exterior wall. Separate pipes leave each meter and run along the façade to the homes they serve.']
  },
  {
    photo:'wyndham-chengdu.webp', size:[1074,434], source:brochure,
    title:['成都温德姆酒店','Wyndham Grand Plaza Chengdu'], type:['酒店建筑','Hospitality'],
    alt:['成都温德姆酒店傍晚亮灯的临街立面。','The illuminated façade of the Wyndham Grand hotel in Chengdu at dusk.'],
    detail:['岷河英文画册以酒店临街立面的照片收录这一成都项目，图注为“Wyndham Grand Plaza Chengdu”。','The MH PIPE project register identifies the hotel as Wyndham Grand Plaza Chengdu and includes this evening view of its street frontage.']
  },
  {
    photo:'gas-renewal.webp', size:[2200,1238],
    title:['住宅燃气改造','Residential gas retrofit'], type:['建筑燃气','Building gas'],
    alt:['住宅外墙上的燃气立管和成排安装的计量表。','An exterior gas riser and a group of gas meters mounted on a residential wall.'],
    detail:['入户燃气管在外墙上转向，接入外侧的集中表箱。照片可见各户表位、明装管道及沿墙的固定点。','The gas piping changes direction on the outside wall and connects to a bank of meters. The photograph shows the individual meters, exposed pipework and wall mounts.']
  }
];

function ProjectRecord({project, lang, close}) {
  const l=lang==='zh'?0:1;
  const src=assets+(project.source || project.photo);
  const credit=project.source
    ? ['岷河英文画册 · 工程案例','MH PIPE brochure · Engineering cases'][l]
    : ['岷河安装实例图集 · 现场照片','MH PIPE installation archive · Site photograph'][l];
  return createPortal(<Modal label={project.title[l]} kind="project-record" close={close}>
    <figure className="project-record-image">
      <img src={src} alt={project.source?credit:project.alt[l]}/>
    </figure>
    <div className="project-record-copy">
      <p>{project.type[l]}</p>
      <h2>{project.title[l]}<HeadingEnglish lang={lang}>{project.title[1]}</HeadingEnglish></h2>
      <p>{project.detail[l]}</p>
      <a href={src} target="_blank" rel="noreferrer">{credit}<ArrowUpRight size={16} aria-hidden="true"/></a>
    </div>
  </Modal>,document.body);
}

export default function HomeProjectGallery({lang}) {
  const l=lang==='zh'?0:1;
  const [requested,setRequested]=useState(0);
  const [{index,previous},setFrame]=useState({index:0,previous:null});
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const panorama=useRef(null);
  const [inView,setInView]=useState(false);
  const [keyboardFocus,setKeyboardFocus]=useState(false);
  const [record,setRecord]=useState(null);
  const stage=useRef(null);
  const project=projects[index];
  const move=step=>setRequested(current=>(current+step+projects.length)%projects.length);

  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let intersects=false;
    const syncVisibility=()=>{
      const flags=document.documentElement.dataset;
      setInView(intersects && !document.hidden && flags.navOpen!=='true' && flags.dialogOpen!=='true');
    };
    const syncMotion=()=>setReduced(media.matches);
    const observer=new IntersectionObserver(entries=>{
      const entry=entries.at(-1);
      intersects=entry.isIntersecting && entry.intersectionRatio>=.25;
      syncVisibility();
    },{threshold:[0,.25]});
    observer.observe(stage.current);
    document.addEventListener('visibilitychange',syncVisibility);
    window.addEventListener('mh-dialog-change',syncVisibility);
    window.addEventListener('mh-navigation-change',syncVisibility);
    media.addEventListener('change',syncMotion);
    return ()=>{
      observer.disconnect();
      document.removeEventListener('visibilitychange',syncVisibility);
      window.removeEventListener('mh-dialog-change',syncVisibility);
      window.removeEventListener('mh-navigation-change',syncVisibility);
      media.removeEventListener('change',syncMotion);
    };
  },[]);

  useEffect(()=>{
    if (previous !== null && (reduced || !inView)) {
      setFrame({index,previous:null});
      return;
    }
    if (requested===index || previous!==null) return;
    // Keep the currently displayed photograph opaque until its successor has decoded.
    let pending=true;
    const img=panorama.current.children[requested].querySelector('img');
    img.decode().then(()=>{
      if (pending) setFrame({index:requested,previous:reduced || !inView ? null : index});
    }).catch(()=>{if (pending) setRequested(index)});
    return ()=>{pending=false};
  },[requested,index,previous,reduced,inView]);

  useEffect(()=>{
    if(!inView || keyboardFocus || record || reduced || requested!==index || previous!==null) return;
    const timer=setTimeout(()=>setRequested(current=>(current+1)%projects.length),6500);
    return ()=>clearTimeout(timer);
  },[inView,keyboardFocus,record,reduced,requested,index,previous]);

  return <section id="home-projects" className="mh-projects" data-scroll-align="start" aria-labelledby="mh-projects-title">
    <header className="mh-projects-head">
      <h2 className="home-chapter-title" id="mh-projects-title">{l?'Selected projects':'项目展示'}<HeadingEnglish lang={lang}>Selected projects</HeadingEnglish></h2>
    </header>
    <div className="mh-project-stage" ref={stage} data-in-view={inView}
      onPointerDownCapture={()=>setKeyboardFocus(false)}
      onFocusCapture={e=>setKeyboardFocus(e.target.matches(':focus-visible'))}
      onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setKeyboardFocus(false)}}
      onKeyDown={e=>{
        setKeyboardFocus(true);
        if(e.key==='ArrowRight' || e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}
      }}>
      <div className="mh-project-panorama" id="home-project-panorama" ref={panorama}>
        {projects.map((item,i)=><div key={item.photo} className="mh-project-shot" data-active={i===index} data-previous={i===previous}
          data-incoming={i===index && previous!==null} aria-hidden={i!==index}
          onAnimationEnd={event=>{
            if(event.target===event.currentTarget && event.animationName==='mh-project-dissolve') setFrame(current=>({...current,previous:null}));
          }}>
          <img src={assets+item.photo} width={item.size[0]} height={item.size[1]} alt={item.alt[l]} loading="lazy" decoding="async"/>
        </div>)}
      </div>
      <div className="mh-project-info">
        <div key={project.photo} className="mh-project-caption" aria-live={keyboardFocus?'polite':'off'}>
          <span>{project.type[l]}</span>
          <h3>{project.title[l]}<HeadingEnglish lang={lang}>{project.title[1]}</HeadingEnglish></h3>
        </div>
        <button type="button" className="mh-project-open" aria-haspopup="dialog" onClick={()=>setRecord(project)}>
          {l?'View project':'查看项目'}<ArrowUpRight size={17} aria-hidden="true"/>
        </button>
      </div>
      <div className="mh-project-select" role="group" aria-label={l?'Browse projects':'切换项目'}>
        {[-1,1].map(step=>{
          const neighbor=projects[(requested+step+projects.length)%projects.length];
          const prev=step===-1;
          const label=prev?(l?'Previous project':'上一个项目'):(l?'Next project':'下一个项目');
          const Arrow=prev?ArrowLeft:ArrowRight;
          return <button type="button" key={step} onClick={()=>move(step)}
            aria-controls="home-project-panorama" aria-label={label+' · '+neighbor.title[l]}>
            <Arrow size={22} strokeWidth={1.65} aria-hidden="true"/>
          </button>
        })}
      </div>
    </div>
    {record && <ProjectRecord project={record} lang={lang} close={()=>setRecord(null)}/>}
  </section>;
}
