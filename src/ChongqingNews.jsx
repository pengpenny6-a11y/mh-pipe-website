import React from 'react';
import HeadingEnglish from './HeadingEnglish.jsx';
import './home-buyers.css';

// Corporate archive, published 6 November 2024: http://www.scmhgd.com/nd.jsp?id=25.
// The article reports 23–25 October as the event dates. Both photographs come
// from its body, not the stand rendering used as the archive thumbnail.
export const chongqingEvent = {
  title: {zh:'岷河参展重庆国际燃气展', en:'MH PIPE at the China Gas & Heating Exhibition'},
  photo:'/assets/news/chongqing-exhibition-2024.webp',
  alt:{zh:'重庆展会岷河展台上，工作人员与来访者围桌交流，身后陈列不锈钢管路。',en:'Visitors meeting the MH PIPE team beside stainless steel pipework at its Chongqing stand.'},
  date:{zh:'2024 年 10 月 23–25 日',en:'23–25 October 2024'},
};

export default function ChongqingNews({lang}) {
  const zh = lang === 'zh';
  return <article className="mh-exhibition-report" id="chongqing-exhibition" aria-labelledby="mh-exhibition-title">
    <div className="mh-exhibition-body">
      <time dateTime="2024-11-06">{zh?'发布于 2024 年 11 月 6 日':'Published 6 November 2024'}</time>
      <h2 id="mh-exhibition-title">{chongqingEvent.title[lang]}<HeadingEnglish lang={lang}>{chongqingEvent.title.en}</HeadingEnglish></h2>
      <p>{zh?'10 月 23 日至 25 日，四川岷河在重庆国际博览中心参加第 26 届中国国际燃气、供热技术与设备展览会。此次展会由中国城市燃气协会主办。':'From 23 to 25 October 2024, MH PIPE joined the 26th China International Gas and Heating Technology and Equipment Exhibition at the Chongqing International Expo Center. The event was organised by the China Gas Association.'}</p>
      <p>{zh?'展位号 S3-3T061。现场陈列了薄壁不锈钢管路，岷河团队与来访者交流产品及其在燃气、供热领域的应用。':'At stand S3-3T061, the team exhibited thin-wall stainless steel pipework and discussed product applications for gas and heating with visitors.'}</p>
      <small>{zh?'来源：四川岷河公司新闻，2024 年 11 月 6 日。':'Source: Sichuan Minhe company news archive, 6 November 2024.'}</small>
    </div>
    <figure>
      <img src="/assets/news/chongqing-exhibition-meeting-2024.webp" width="1280" height="960" loading="lazy" alt={zh?'来访者在重庆展会岷河展位前查看展示资料并与现场团队交流。':'Visitors talking with the team at the MH PIPE exhibition stand in Chongqing.'}/>
      <figcaption>{zh?'重庆国际博览中心 · 岷河展台实拍':'MH PIPE stand, Chongqing International Expo Center'}</figcaption>
    </figure>
  </article>;
}
