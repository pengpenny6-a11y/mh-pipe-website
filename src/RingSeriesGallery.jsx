import React, {useRef, useState} from 'react';
import './ring-series-gallery.css';

export default function RingSeriesGallery({forms, form, lang, onSelect, onInspect}) {
  const navigation = useRef(null);
  const [original, setOriginal] = useState(false);
  const selected = forms.find(item => item.shape === form) || forms[0];
  const zh = lang === 'zh';
  const imagePath = shape => '/assets/product-series/ring-' + (original ? 'studio-' : 'finish-') + shape + '.webp';

  function navigate(event, index) {
    const last = forms.length - 1;
    const next = {ArrowLeft:(index + last) % forms.length, ArrowUp:(index + last) % forms.length,
      ArrowRight:(index + 1) % forms.length, ArrowDown:(index + 1) % forms.length,
      Home:0, End:last}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onSelect(forms[next].shape);
    navigation.current.querySelectorAll('button')[next].focus({preventScroll:true});
  }

  return <div className="ring-studio-gallery">
    <div className="ring-studio-feature">
      {forms.map(item => {
        const current = item === selected;
        return <div className="ring-studio-exposure" key={item.id} data-shape={item.shape}
            data-current={current} inert={current ? undefined : true} aria-hidden={!current}>
          <div className="ring-studio-object">
            <img src={imagePath(item.shape)} alt="" draggable="false"/>
            <button type="button" className="ring-studio-product"
              onClick={() => form === item.shape ? onInspect(item) : onSelect(item.shape)}
              aria-label={(form === item.shape ? (zh ? '查看' : 'View ') : (zh ? '选择' : 'Select ')) + item.name[lang]}/>
          </div>
        </div>;
      })}
      <div className="ring-studio-comparison">
        <span>{original ? (zh ? '岷河实物原片' : 'MH PIPE studio photo') : (zh ? '亮面效果示意' : 'Polished finish visualisation')}</span>
        <button type="button" onClick={() => setOriginal(!original)}>
          {original ? (zh ? '返回示意图' : 'View finish study') : (zh ? '对照实拍' : 'Compare original photo')}
        </button>
      </div>
    </div>
    <div className="ring-studio-choices" ref={navigation} role="group" aria-label={zh ? '选择环压管件' : 'Choose a ring-press fitting'}>
      {forms.map((item, index) =>
        <button type="button" key={item.id} data-form-choice={item.shape} aria-pressed={item === selected}
            onClick={() => onSelect(item.shape)} onKeyDown={event => navigate(event, index)}>
          <span className="ring-studio-mini"><img src={imagePath(item.shape)} alt="" draggable="false"/></span>
          <span className="ring-studio-label">{item.name[lang]}</span>
        </button>
      )}
    </div>
  </div>;
}
