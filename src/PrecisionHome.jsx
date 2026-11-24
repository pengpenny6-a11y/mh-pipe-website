import React, {useRef,useState} from 'react';
import SilverHero from './SilverHero.jsx';
import PrecisionApplications from './SpatialApplications.jsx';
import HomeProductChapter from './HomeProductChapter.jsx';
import {HomeAboutChapter,HomeSupportChapter} from './HomeCompanyChapters.jsx';
import HomeManufacturingChapter from './HomeManufacturingChapter.jsx';
import HomePartnerWall from './HomePartnerWall.jsx';
import HomeProjectGallery from './HomeProjectGallery.jsx';
import HomeNewsDesk from './HomeNewsDesk.jsx';
import HomeContactAtlas from './HomeContactAtlas.jsx';
import HomeDirectory from './HomeDirectory.jsx';
import './precision-home.css';
import './homepage-rhythm.css';
import {initialScene} from './application-areas.js';
import {useProductMatch} from './useProductMatch.js';
import {useHomeChapterMotion} from './useHomeChapterMotion.js';

export default function PrecisionHome({lang,go,onProduct,onPhoto}){
 const home=useRef(null),marker=useRef(null);
 useHomeChapterMotion(home,lang);
 const [scene,setScene]=useState(initialScene);
 const {holdTour,entryForm}=useProductMatch(home,marker,scene);
 return <div className="precision-home" ref={home}>
  <SilverHero lang={lang} go={go}/>
  <PrecisionApplications lang={lang} go={go} holdTour={holdTour} onSceneChange={setScene}
    matchMarker={<span className="app-joint-glint" hidden ref={marker} aria-hidden="true"/>}/>
  <HomeProductChapter lang={lang} go={go} onProduct={onProduct} entryForm={entryForm}/>
  <HomeAboutChapter lang={lang} go={go} onPhoto={onPhoto}/>
  <HomeManufacturingChapter lang={lang} go={go} onPhoto={onPhoto}/>
  <HomeProjectGallery lang={lang} go={go}/>
  <HomePartnerWall lang={lang}/>
  <HomeNewsDesk lang={lang} go={go}/>
  <HomeSupportChapter lang={lang} go={go}/>
  <HomeContactAtlas lang={lang} go={go}/>
  <HomeDirectory lang={lang} go={go}/>
 </div>;
}
