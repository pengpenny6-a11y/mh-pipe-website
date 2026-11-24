import React,{forwardRef} from 'react';
import './page-load-transition.css';

/** A route sheet; the initial brand entrance remains in BootSequence. */
const PageLoadMark=forwardRef(function PageLoadMark({label='',lang='en',state='idle'},ref){
 const zh=lang==='zh',destination=label||(zh?'页面':'Page');
 return <div ref={ref} className="page-load-transition" data-phase={state} aria-hidden={state==='idle'}>
  <div className="pl-cover">
   <div className="pl-center" aria-hidden="true">
    <p className="pl-destination">{destination}</p>
    <span className="pl-seam"><span/></span>
   </div>
   <span className="pl-sr-status" role="status" aria-live="polite" aria-atomic="true">{zh?'正在打开：'+destination:'Opening '+destination}</span>
  </div>
 </div>;
});

export default PageLoadMark;
