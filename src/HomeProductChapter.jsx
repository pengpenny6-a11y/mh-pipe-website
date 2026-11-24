import React, {useId, useRef, useState} from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {ArrowUpRight} from 'lucide-react';
import {products} from './content.js';
import {productSeries, resolveSeriesId, ringProducts, seriesCatalogUrl} from './product-series.js';
import ProductRun from './ProductRun.jsx';
import ThickWallStudy from './ThickWallStudy.jsx';
import RingSeriesGallery from './RingSeriesGallery.jsx';
import {pressTourOrder, usePressTour} from './usePressTour.js';
import './home-product-chapter.css';

const pressProducts = pressTourOrder.map(id => products.find(product => product.id === id));
const formsFor = {press: pressProducts, ring: ringProducts, 'thick-wall': []};
const shapeOf = product => product.shape || product.id;

function initialSelection() {
  const remembered = history.state?.mhHomeSeries;
  const linked = location.hash === '#home-products' && new URLSearchParams(location.search).get('family');
  const id = resolveSeriesId(linked) || resolveSeriesId(remembered?.family) || 'press';
  const reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
  return {family: id, shapes: !reload && remembered?.version === 2 ? {...remembered.shapes} : {}};
}

export default function HomeProductChapter({lang = 'en', go, onProduct, entryForm}) {
  const [selection, setSelection] = useState(initialSelection);
  const panelId = useId(), tabRow = useRef(null), stage = useRef(null);
  const zh = lang === 'zh';
  const series = productSeries.find(item => item.id === selection.family);
  const forms = formsFor[series.id];
  const pinned = forms.find(product => shapeOf(product) === selection.shapes[series.id]);
  const tour = usePressTour(stage, series.id === 'press' && !pinned);
  const active = pinned || (series.id === 'press' && forms.find(product => shapeOf(product) === tour.form));
  const shape = active ? shapeOf(active) : null;
  const anchor = series.id === 'thick-wall' ? 'pd-specification' : 'product-selection';
  const url = seriesCatalogUrl(series.id,lang,pinned && shapeOf(pinned),anchor);
  const catalogLabel = series.id === 'thick-wall'
    ? (zh ? '按尺寸选型' : 'Specify pipe dimensions')
    : (zh ? '查看管件目录' : 'Browse fitting catalogue');

  function select(next) {
    setSelection(next);
    const current = new URL(location.href);
    if (current.hash === '#home-products' && current.searchParams.has('family')) {
      current.searchParams.set('family',next.family);
    }
    history.replaceState({...history.state,mhHomeSeries:{...next,version:2}},'',current);
  }
  function familyKey(event,index) {
    const last = productSeries.length-1;
    const next = {ArrowLeft:(index+last)%(last+1),ArrowRight:(index+1)%(last+1),Home:0,End:last}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select({...selection,family:productSeries[next].id});
    tabRow.current.querySelectorAll('[role="tab"]')[next].focus();
  }
  function browse(event) {
    if (go && event.button===0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      go(url);
    }
  }
  const selectForm = nextShape => {
    if (series.id === 'press' && !nextShape) tour.restartFromOverview();
    if (nextShape !== (pinned ? shapeOf(pinned) : null)) {
      select({...selection, shapes:{...selection.shapes,[series.id]:nextShape}});
    }
  };
  function studioKey(event) {
    if (event.key !== 'Escape' || !active) return;
    event.preventDefault();
    selectForm(null);
    const target = event.currentTarget.querySelector('[data-run-hotspot="'+shape+'"]:not([hidden]), [data-form-choice="'+shape+'"]');
    (target || tabRow.current.querySelector('[aria-selected="true"]'))?.focus({preventScroll:true});
  }
  const artwork = series.id === 'ring' ? (
    <RingSeriesGallery forms={forms} form={shape} lang={lang} onSelect={selectForm} onInspect={onProduct}/>
  ) : series.id === 'thick-wall' ? <ThickWallStudy lang={lang}/> : (
    <ProductRun family="press" form={shape} lang={lang} holdOnInspect={Boolean(active && !pinned)}
      forms={forms} entryForm={entryForm} onSelect={selectForm} onReset={()=>selectForm(null)}
      onInspect={active ? (pinned ? ()=>onProduct(pinned) : ()=>selectForm(shape)) : undefined}
      fallback={'/assets/product-series/run-'+(shape || 'overview')+'.webp'}/>
  );

  return <section id="home-products" className="home-series" data-scroll-align="start" data-series={series.id}
      data-form={shape || undefined} aria-labelledby={panelId+'-heading'}>
    <header className="series-heading">
      <h2 className="home-chapter-title" id={panelId+'-heading'}>{zh?'产品系列':'Product series'}<HeadingEnglish lang={lang}>Product series</HeadingEnglish></h2>
      <div className="series-tabs" ref={tabRow} role="tablist" aria-label={zh?'不锈钢管路系列':'Stainless steel piping systems'}
          style={{'--series-index':productSeries.indexOf(series)}}>
        {productSeries.map((item,index) => <button key={item.id} type="button" role="tab"
            data-series-choice={item.id} id={panelId+'-'+item.id} aria-selected={series.id===item.id}
            aria-controls={panelId} tabIndex={series.id===item.id?0:-1}
            onClick={()=>select({...selection,family:item.id})} onKeyDown={e=>familyKey(e,index)}>
          {item.shortName[lang]}
        </button>)}
      </div>
      <a className="series-catalog" href={url} onClick={browse}>{catalogLabel} <ArrowUpRight aria-hidden="true"/></a>
    </header>
    <div ref={stage} className="series-studio" role="tabpanel" id={panelId} aria-labelledby={panelId+'-'+series.id}
        data-overview={!active} onKeyDown={studioKey}
        onClick={e=>{if(series.id==='ring' && active && !e.target.closest('button,.series-caption')) selectForm(null);}}>
      <div className="series-word" key={'word-'+series.id} aria-hidden="true">
        {series.id==='press'?'PRESS':series.id==='ring'?'RING':'WALL'}
      </div>
      <div className="series-art">{artwork}</div>
      <div className="series-caption" key={'caption-'+series.id}>
        <h3>{series.name[lang]}<HeadingEnglish lang={lang}>{series.name.en}</HeadingEnglish></h3>
        <div key={shape || 'overview'} className="series-caption-selection">
          <p>{active ? active.description[lang] : series.intro[lang]}</p>
          {series.id==='thick-wall' && <span className="series-illustration-note">{zh?'管端截面示意':'Illustrative pipe cross-section'}</span>}
        </div>
      </div>
    </div>
  </section>;
}
