import React, {useId, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import './home-laboratory.css';

const tests = [
  {
    file:'lab-metallography.webp', position:'68% 48%',
    zh:['金相组织分析', '在显微镜下观察不锈钢试样，记录金相组织。', '操作人员在显微镜旁观察屏幕上的金相图像。'],
    en:['Metallography', 'Under the microscope, technicians examine and record the microstructure of stainless steel samples.', 'A technician studies a micrograph on the monitor beside the microscope.'],
  },
  {
    file:'lab-pullout.webp', position:'73% 51%',
    zh:['拉拔试验', '在拉拔试验机上对试样施加载荷，记录拉拔曲线。', '拉拔试验机与用于记录试验曲线的计算机。'],
    en:['Pull-out testing', 'The test frame applies a tensile load to the specimen while the instrument records the curve.', 'A pull-out test frame beside the computer that records the test curve.'],
  },
  {
    file:'lab-thermal-cycling.webp', position:'63% 54%',
    zh:['冷热水循环试验', '在循环试验台上，让管路试样经历冷热水交替。', '操作人员在冷热水循环试验台旁设置控制面板。'],
    en:['Thermal cycling', 'Pipework specimens undergo alternating hot and cold water cycles on the test rig.', 'An operator at the control panel of the hot and cold water test rig.'],
  },
];

export default function HomeLaboratory({lang='en'}) {
  const locale = lang === 'zh' ? 'zh' : 'en';
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const imageNodes = useRef([]);
  const fades = useRef([]);
  const choices = useRef(null);
  const requestId = useRef(0);
  const id = useId();

  async function select(index) {
    const sequence = ++requestId.current;
    setFailed(false);
    if (index === active) return;
    const photo = imageNodes.current[index];
    if (!photo.complete || !photo.naturalWidth) {
      photo.loading = 'eager';
      try {
        if (photo.complete && !photo.naturalWidth) photo.src = photo.src;
        await photo.decode();
      } catch {
        if (sequence === requestId.current) setFailed(true);
        return;
      }
    }
    if (sequence !== requestId.current) return;
    const photos = imageNodes.current;
    const weights = photos.map(node => Number(getComputedStyle(node).opacity));
    fades.current.forEach(fade => fade.cancel());
    fades.current = [];
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Retarget the actual mix on a fast second click. All exposures share
      // one timing curve so the image stays fully lit throughout the dissolve.
      photos.forEach((node, i) => {
        const opacity = Number(i === index);
        if (weights[i] === opacity) return;
        fades.current.push(node.animate([{opacity:weights[i]}, {opacity}], {
          duration:550, easing:'cubic-bezier(.36,0,.18,1)',
        }));
      });
    }
    setActive(index);
  }

  function navigate(event, index) {
    const last = tests.length - 1;
    const target = {ArrowLeft:(index+last)%tests.length, ArrowRight:(index+1)%tests.length, Home:0, End:last}[event.key];
    if (target === undefined) return;
    event.preventDefault();
    choices.current.children[target].focus({preventScroll:true});
    select(target);
  }

  return <section id="home-laboratory" data-scroll-align="start" className="hm-lab" aria-labelledby={id+'-title'}>
    <div className="hm-lab__photos">
      {tests.map((test, index) => <img key={test.file}
        ref={node=>{imageNodes.current[index]=node;}} src={'/assets/company/'+test.file}
        loading="lazy" decoding="async" alt={test[locale][2]} aria-hidden={index!==active}
        style={{objectPosition:test.position}} data-current={index===active}/>)}
    </div>
    <div className="hm-lab__content">
      <div className="hm-lab__text">
        <h2 id={id+'-title'}>{locale==='zh'?'实验能力':'Laboratory capabilities'}<HeadingEnglish lang={lang}>Laboratory capabilities</HeadingEnglish></h2>
        <div id={id+'-panel'} role="tabpanel" aria-labelledby={id+'-test-'+active}>
          <p key={active}>{tests[active][locale][1]}</p>
        </div>
      </div>
      <div className="hm-lab__choices" role="tablist" ref={choices} aria-label={locale==='zh'?'选择实验项目':'Select a laboratory test'}>
        {tests.map((test, index) => <button key={test.file} type="button" role="tab"
            id={id+'-test-'+index} aria-controls={id+'-panel'} aria-selected={index===active}
            tabIndex={index===active?0:-1} onClick={()=>select(index)} onKeyDown={event=>navigate(event,index)}>
          {test[locale][0]}
        </button>)}
      </div>
      {failed && <p className="hm-lab__error" role="status">{locale==='zh'?'照片加载失败，请重新选择。':'The photograph could not load. Select the test to retry.'}</p>}
    </div>
  </section>;
}
