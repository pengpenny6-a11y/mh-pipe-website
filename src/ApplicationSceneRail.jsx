import React from 'react';
import {areas} from './application-areas.js';
import './application-scene-rail.css';

export default function ApplicationSceneRail({lang, activeId, onSelect}) {
  function navigate(event) {
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    let next;
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % buttons.length; break;
      case 'ArrowLeft': next = (index - 1 + buttons.length) % buttons.length; break;
      case 'Home': next = 0; break;
      case 'End': next = buttons.length - 1; break;
      default: return;
    }
    event.preventDefault();
    buttons[next].focus({preventScroll:true});
    onSelect(buttons[next].dataset.sceneChoice);
  }

  return (
    <nav className="app-scene-rail" aria-label={lang === 'zh' ? '选择应用场景' : 'Choose an application scene'}
      onKeyDown={navigate}>
      {areas.map(({id, name}) => (
        <button key={id} type="button" data-scene-choice={id}
          aria-current={id === activeId ? 'true' : undefined}
          onClick={() => onSelect(id)}>
          <span className="app-scene-sample" aria-hidden="true">
            <img className="app-scene-object" src={`/assets/applications/selector/${id}.webp`}
              alt="" width={192} height={192} loading="lazy" decoding="async" draggable="false"/>
          </span>
          <span className="app-scene-rail-name">{name[lang]}</span>
        </button>
      ))}
    </nav>
  );
}
