import {routeHref} from './site-routes.js';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {ArrowUpRight, Check, FileText, Plus} from 'lucide-react';
import {products} from './content.js';
import {productSeries, resolveSeriesId, ringProducts} from './product-series.js';
import {solutionScenes} from './solution-content.js';
import './product-depth.css';

const t = (lang, en, zh) => lang === 'zh' ? zh : en;

const formCopy = {
  pipe: {
    use: {en: 'Straight pipe runs', zh: '直线输送'},
    check: {en: 'Outside diameter, wall thickness and cut length.', zh: '核对管材外径、壁厚与定尺长度。'},
  },
  coupling: {
    use: {en: 'Join two pipe sections', zh: '连接两段直管'},
    check: {en: 'Pipe and socket dimensions and required insertion depth.', zh: '核对管材与承口尺寸、插入深度。'},
  },
  elbow: {
    use: {en: 'Change direction', zh: '改变管路方向'},
    check: {en: 'Bend angle, connection size and installation space.', zh: '核对转向角度、连接尺寸与安装空间。'},
  },
  tee: {
    use: {en: 'Branch off the main', zh: '从主管引出支路'},
    check: {en: 'Main and branch sizes and connection layout.', zh: '核对主管与支管尺寸、接口布置。'},
  },
};
const documents = [
  {id: 'drawings', en: 'Product drawings', zh: '产品图纸'},
  {id: 'material', en: 'Material documents', zh: '材质资料'},
  {id: 'installation', en: 'Connection instructions', zh: '连接说明'},
];
const pressProducts = ['coupling', 'elbow', 'tee', 'pipe'].map(id => products.find(p => p.id === id)).filter(Boolean);
const records = {press: pressProducts, ring: ringProducts, 'thick-wall': []};

function readSelection() {
  const query = new URLSearchParams(location.search);
  const family = resolveSeriesId(query.get('family')) || 'press';
  const form = query.get('form') || (query.get('family') === 'pipes' ? 'pipe' : null);
  const product = records[family].find(p => p.id === form || p.shape === form);
  return {family, form: product?.id || null};
}
function newBrief() {
  return {chosen: [], resources: ['drawings'], scene: 'water', size: '', material: '', conditions: '', reference: '', market: ''};
}

export default function ProductDepth({lang = 'en', onProduct, onInquiry, go}) {
  const root = useRef(null), list = useRef(null);
  const [selection, setSelection] = useState(readSelection);
  const [briefs, setBriefs] = useState(() => Object.fromEntries(productSeries.map(s => [s.id, newBrief()])));
  const family = selection.family;
  const series = productSeries.find(s => s.id === family);
  const brief = briefs[family];
  const scene = solutionScenes.find(s => s.id === brief.scene);
  const forms = records[family];
  const current = forms.find(p => p.id === selection.form);
  const visible = current ? [current, ...forms.filter(p => p !== current)] : forms;
  const chosen = forms.filter(p => brief.chosen.includes(p.id));
  const zh = lang === 'zh';

  useEffect(() => {
    // A same-page navigation can change the query without remounting the catalogue.
    const sync = () => {
      const next = readSelection();
      setSelection(old => old.family === next.family && old.form === next.form ? old : next);
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('mh-intro-ready', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('mh-intro-ready', sync);
    };
  }, []);

  useLayoutEffect(() => {
    if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = window.gsap.context(() => {
      window.gsap.fromTo('.pd-product-row,.pd-range-advice', {opacity: .5, y: 9},
        {opacity: 1, y: 0, duration: .42, ease: 'power2.out', stagger: .04, clearProps: 'transform,opacity'});
    }, list);
    return () => ctx.revert();
  }, [family]);

  function selectFamily(id) {
    if (id === family) return;
    setSelection({family: id, form: null});
    const url = new URL(location.href);
    url.searchParams.set('family', id);
    url.searchParams.delete('form');
    history.replaceState(history.state, '', url);
  }
  function familyKey(event, index) {
    const last = productSeries.length - 1;
    const next = {ArrowRight: (index + 1) % productSeries.length, ArrowLeft: (index + last) % productSeries.length, Home: 0, End: last}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectFamily(productSeries[next].id);
    event.currentTarget.parentElement.children[next].focus();
  }
  function update(key, value) {
    setBriefs(previous => {
      const draft = previous[family];
      return {...previous, [family]: {...draft, [key]: typeof value === 'function' ? value(draft[key]) : value}};
    });
  }
  function toggle(key, value) {
    update(key, old => old.includes(value) ? old.filter(x => x !== value) : [...old, value]);
  }
  function prepareBrief() {
    const input = root.current.querySelector('[name="size"]');
    input.focus({preventScroll: true});
    input.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
  }
  function send(event) {
    event.preventDefault();
    const parts = [t(lang,'Product selection request','产品选型需求'), series.name[lang], scene.name[lang]];
    if (chosen.length) parts.push(t(lang, 'Forms: ', '产品形态：') + chosen.map(p => p.name[lang]).join(' / '));
    for (const [key, en, cn] of [['size', 'Sizes and quantities', '尺寸与数量'], ['material', 'Material', '材质'], ['conditions', 'Operating conditions', '使用条件'], ['reference', 'Drawing reference', '图纸信息']]) {
      if (brief[key].trim()) parts.push(t(lang,en,cn) + (zh ? '：' : ': ') + brief[key].trim());
    }
    if (brief.resources.length) parts.push(t(lang,'Requested documents: ','所需资料：') + documents.filter(d => brief.resources.includes(d.id)).map(d => d[lang]).join(' / '));
    onInquiry({interest: parts.join('\n'), market: brief.market});
  }

  return <div id="pd-range" className="pd-root" ref={root}>
    <section id="product-selection" className="pd-range" aria-labelledby="pd-range-heading">
      <div className="pd-range-head" id="range">
        <h1 className="pd-range-title" id="pd-range-heading">{t(lang, 'Product catalogue', '产品目录')}<HeadingEnglish lang={lang}>Product catalogue</HeadingEnglish></h1>
        <p>{t(lang, 'Choose a piping series to explore the range and prepare your enquiry.', '选择管路系列，查看产品或整理选型需求。')}</p>
      </div>
      <div className="pd-family-tabs" role="tablist" aria-label={t(lang, 'Piping series', '管路系列')}>
        {productSeries.map((s,i) => <button key={s.id} id={'pd-tab-'+s.id} role="tab" aria-controls="pd-family-panel"
          aria-selected={family === s.id} tabIndex={family === s.id ? 0 : -1}
          onClick={() => selectFamily(s.id)} onKeyDown={e => familyKey(e,i)}>{s.name[lang]}</button>)}
      </div>
      <div id="pd-family-panel" role="tabpanel" aria-labelledby={'pd-tab-'+family} ref={list} className="pd-family-panel" data-series={family}>
        {visible.length > 0 ? visible.map(p => {
          const selected = brief.chosen.includes(p.id);
          const copy = formCopy[p.shape || p.id];
          return <article className={'pd-product-row' + (selected ? ' pd-is-chosen' : '')} key={p.id} data-form={p.shape || p.id}>
            <button className="pd-product-open" onClick={() => onProduct(p)}
              aria-label={t(lang,'View ','查看') + p.name[lang]}>
              <span className="pd-product-image"><img src={p.cataloguePhoto || p.image} alt="" loading="lazy" draggable="false"/></span>
              <h3>{p.name[lang]}<HeadingEnglish lang={lang}>{p.name.en}</HeadingEnglish></h3><ArrowUpRight className="pd-open-icon" size={25}/>
            </button>
            <div className="pd-product-use"><p className="pd-use-summary">{copy?.use[lang] || p.description[lang]}</p>{copy && <p>{copy.check[lang]}</p>}</div>
            <button className="pd-choose" onClick={() => toggle('chosen', p.id)} aria-pressed={selected}
              aria-label={(selected ? t(lang,'Remove ','移除') : t(lang,'Select ','选择')) + p.name[lang]}>
              <span className="pd-choice-icon">{selected ? <Check size={19}/> : <Plus size={19}/>}</span>
              <span>{selected ? t(lang,'Selected','已选') : t(lang,'Select','选入需求')}</span>
            </button>
          </article>;
        }) : <div className="pd-range-advice">
          <div>
            <h2>{family === 'thick-wall' ? t(lang, 'Size and end preparation', '管材尺寸与端部要求') : t(lang,'Connection dimensions','接口尺寸与连接要求')}<HeadingEnglish lang={lang}>{family === 'thick-wall' ? 'Size and end preparation' : 'Connection dimensions'}</HeadingEnglish></h2>
            <p>{series.copy[lang]}</p>
            <button type="button" className="pd-text-action" onClick={prepareBrief}>{t(lang, 'Prepare a specification request', '填写选型要求')}<ArrowUpRight size={21}/></button>
          </div>
          <dl className="pd-drawing-checks">
            <div><dt>{t(lang,'Dimensions','管材尺寸')}</dt><dd>{t(lang,'Outside diameter × wall thickness × length', '外径 × 壁厚 × 长度')}</dd></div>
            <div><dt>{t(lang,'Material','材质要求')}</dt><dd>{t(lang,'Material grade or project specification','材料牌号或项目规范')}</dd></div>
            <div><dt>{t(lang,'Connections','连接要求')}</dt><dd>{t(lang,'End detail and mating component drawing','管端形式与相配件图纸')}</dd></div>
          </dl>
        </div>}
      </div>
    </section>
    <section className="pd-config" id="pd-specification" aria-labelledby="pd-config-heading">
      <div className="pd-config-head"><h2 id="pd-config-heading">{t(lang,'Define your requirements','确认选型条件')}<HeadingEnglish lang={lang}>Define your requirements</HeadingEnglish></h2><figure className="pd-config-image"><img src="/assets/company/spectrometry.webp" alt={t(lang,'Material analysis equipment at MH PIPE','岷河材料光谱分析设备')} loading="lazy"/><figcaption>{t(lang,'Material analysis · MH PIPE factory','材料分析 · 岷河工厂实拍')}</figcaption></figure></div>
      <form className="pd-config-layout" onSubmit={send}>
        <div className="pd-fields">
          <label>{t(lang,'Application','应用领域')}<select value={brief.scene} onChange={e => update('scene',e.target.value)}>{solutionScenes.map(s => <option key={s.id} value={s.id}>{s.name[lang]}</option>)}</select></label>
          {[
            ['market', 'Destination market', '目的地市场', t(lang,'Country or region','国家或地区')],
            ['size', 'Sizes & quantities', '尺寸与数量', t(lang,'Pipe size, wall thickness, quantity','管径、壁厚、需求数量')],
            ['material','Material requirement','材质要求',t(lang,'Grade or project specification','材料牌号或项目规范')],
            ['conditions', 'Operating conditions', '使用条件', scene.requirements.slice(0,2).map(r => r.name[lang]).join(' / ')],
            ['reference','Drawing reference','图纸信息',t(lang,'Drawing number or connection details','图纸编号或连接要求')],
          ].map(([key, en, cn, placeholder]) => <label key={key}>{t(lang,en,cn)}<input name={key} value={brief[key]} placeholder={placeholder} onChange={e => update(key,e.target.value)}/></label>)}
          <fieldset className="pd-document-options"><legend>{t(lang,'Requested documents','所需资料')}</legend>
            {documents.map(d => <label key={d.id}><input type="checkbox" checked={brief.resources.includes(d.id)} onChange={() => toggle('resources',d.id)}/><span><FileText size={19}/>{d[lang]}</span></label>)}</fieldset>
        </div>
        <aside className="pd-brief"><h3>{t(lang,'Your product brief','您的选型需求')}<HeadingEnglish lang={lang}>Your product brief</HeadingEnglish></h3>
          <div className="pd-brief-family"><span>{series.name[lang]}</span><span>{scene.name[lang]}</span></div>
          <div className="pd-brief-forms" aria-live="polite">{chosen.map(p => <span key={p.id}>{p.name[lang]}<Check size={16}/></span>)}</div>
          <p className="pd-fit-note">{t(lang,'Include the required dimensions, material and operating conditions.','可附上所需尺寸、材质与使用条件。')}</p>
          <button className="pd-submit" type="submit">{t(lang,'Prepare an enquiry','生成询盘需求')}<ArrowUpRight size={24}/></button>
          <a href={routeHref('/services',lang)} onClick={e => {if (e.button===0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {e.preventDefault(); go('/services');}}}>{t(lang,'Technical support & resources','技术支持与资料')}<ArrowUpRight size={18}/></a>
        </aside>
      </form>
    </section>
  </div>;
}
