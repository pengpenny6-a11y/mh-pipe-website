import React from 'react';
const source='https://std.samr.gov.cn/gb/search/gbDetailedCNF?id=71F772D81B07D3A7E05397BE0A0AB82A';
export default function StandardEvidence({lang}){
 const zh=lang==='zh';
 return <section className="standard-evidence"><h2>{zh?<>参与国家<br/>标准编制。</>:<>Co-drafter of a<br/>national standard.</>}</h2><div><p className="standard-code">GB/T 33926–2017</p><p>{zh?'不锈钢环压式管件':'Stainless steel pipe fitting of ring compression'}</p><a href={source} target="_blank" rel="noreferrer">{zh?'查看国家标准起草单位':'View the official drafting organizations'}<span aria-hidden="true">+</span></a></div></section>
}
