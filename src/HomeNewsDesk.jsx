import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowRight, ArrowUpRight, ChevronRight} from 'lucide-react';
import HeadingEnglish from './HeadingEnglish.jsx';
import {chongqingEvent} from './ChongqingNews.jsx';
import Modal from './Modal.jsx';
import './home-news-desk.css';

// Dates are publication dates in the company's archive at www.scmhgd.com/nr.jsp.
// Each id is the original publisher's article id and links back to that record.
const archive = [
  {
    id:22, date:'2022-03-07',
    title:['新厂区绿化带建设基本完成','Planting takes shape at the new factory'],
    summary:['新厂区的绿化带已基本建成。岷河在这次厂区建设简报中，也介绍了下一步改善员工工作、就餐与住宿环境的计划。','In its March 2022 update, MH PIPE reported that planting around the new factory was nearly complete. The company also outlined plans to improve working conditions, dining facilities and staff accommodation.']
  },
  {
    id:23, date:'2021-08-26',
    title:['岷河成立二十一周年，老员工座谈','Long-serving employees mark 21 years of MH PIPE'],
    summary:['8 月 25 日，岷河邀请入职十年和十五年的员工参加座谈。创始人王建华、总经理王跃强与大家回顾公司的变化，听取员工对今后工作的建议。','On 25 August, employees with ten or fifteen years of service met with founder Wang Jianhua and general manager Wang Yueqiang. They discussed how the business had changed and what staff wanted to improve.']
  },
  {
    id:24, date:'2021-07-26',
    title:['从供水到入户，直饮水管路怎样选材','Choosing pipework for drinking-water systems'],
    summary:['这篇技术文章讨论了城市二次供水管网的选材，以及管材与管件如何配套。文中以薄壁不锈钢管为例，介绍管件成形、连接方式与供水系统的关系。','This technical article looks at material selection in secondary water supply networks. Using thin-wall stainless steel as an example, it considers how fitting manufacture and the choice of joint affect a piping system.']
  },
  {
    id:20, date:'2017-08-15',
    title:['武汉国际燃气展参展预告','Wuhan Gas & Heating Exhibition preview'],
    summary:['岷河在展前公告中公布了武汉国际博览中心 A29 展位。第 20 届中国国际燃气、供热技术与设备展览会的展期为 2017 年 9 月 13 日至 15 日。','MH PIPE announced stand A29 at the Wuhan International Expo Center ahead of the 20th China International Gas and Heating Technology and Equipment Exhibition, scheduled for 13–15 September 2017.']
  },
  {
    id:21, date:'2017-01-04',
    title:['“岷河”获四川省著名商标称号','Sichuan trademark recognition for Minhe'],
    summary:['岷河在 2017 年 1 月发布企业公告，记录“岷河”商标获得四川省著名商标称号。','A January 2017 company announcement records the recognition of the Minhe trademark as a Sichuan Famous Trademark.']
  },
  {
    id:15, date:'2016-05-26',
    title:['薄壁不锈钢管路的双卡压连接','Double-press joints for thin-wall pipework'],
    summary:['岷河的技术说明介绍了薄壁管材和管件如何通过双卡压方式连接，并列举了给水、燃气及工业管路的应用。','This technical note introduces double-press connections for thin-wall stainless steel pipe and fittings. It sets out the connection method and describes examples in water supply, gas and industrial piping.']
  },
  {
    id:12, date:'2016-05-26',
    title:['卡压管件中的 O 形密封圈','Inside the press fitting: O-ring materials'],
    summary:['同样是 O 形密封圈，橡胶材料可以不同。这份说明介绍了三元乙丙橡胶、丁腈橡胶、氢化丁腈橡胶与氟橡胶，以及它们各自的材料特性。','O-rings can share the same profile and use different elastomers. This note describes EPDM, nitrile, hydrogenated nitrile and fluoroelastomer compounds used for seals.']
  },
  {
    id:11, date:'2016-05-26',
    title:['不锈钢管怎样保护焊缝','Protecting the weld in stainless steel tube'],
    summary:['从焊接时的氩气保护，到后续固溶与钝化，岷河在文中逐项介绍这些工艺如何影响不锈钢焊缝和管壁表面。','The original process note follows the weld from argon shielding through solution treatment and passivation, explaining the role of each stage in the condition of the weld and tube surface.']
  }
];

function NewsDate({date, lang}) {
  const value = lang === 'zh' ? date.replaceAll('-', '.') : new Intl.DateTimeFormat('en-GB', {
    day:'numeric', month:'short', year:'numeric', timeZone:'UTC'
  }).format(new Date(date));
  return <time dateTime={date}>{value}</time>;
}

function NewsLink({lang, go, hash='', children, ...props}) {
  const href = '/news?lang=' + lang + hash;
  return <a href={href} {...props} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    go(href);
  }}>{children}</a>;
}

const featuredArchive = archive.filter(item => [22, 24, 15].includes(item.id));

function Stories({items, lang, className}) {
  const [selected, setSelected] = useState(null);
  const locale = lang === 'zh' ? 0 : 1;
  return <>
    <ul className={className}>{items.map((item,index) =>
      <li key={item.id} style={{'--news-sequence':index}}>
        <button type="button" className="hnd-brief" aria-haspopup="dialog" onClick={() => setSelected(item)}>
          <NewsDate date={item.date} lang={lang}/>
          <strong>{item.title[locale]}</strong>
        </button>
      </li>
    )}</ul>
    {selected && <StoryDialog selected={selected} lang={lang} close={() => setSelected(null)}/>}
  </>;
}

function StoryDialog({selected,lang,close}) {
  const zh = lang === 'zh';
  const locale = zh ? 0 : 1;
  return createPortal(<Modal kind="hnd-dialog" label={selected.title[locale]} close={close}>
      <article>
        <NewsDate date={selected.date} lang={lang}/>
        <h2>{selected.title[locale]}<HeadingEnglish lang={lang}>{selected.title[1]}</HeadingEnglish></h2>
        <p>{selected.summary[locale]}</p>
        <a href={'http://www.scmhgd.com/nd.jsp?id='+selected.id} target="_blank" rel="noopener noreferrer" hrefLang="zh">
          {zh ? '查看企业档案原文' : 'Read the original in Chinese'}<ArrowUpRight size={16} aria-hidden="true"/>
        </a>
      </article>
    </Modal>, document.body);
}

export function NewsArchive({lang}) {
  return <section id="news-archive" className="hnd-archive" aria-labelledby="news-archive-title">
    <h2 id="news-archive-title">{lang === 'zh' ? '企业与技术档案' : 'Company & technical archive'}<HeadingEnglish lang={lang}>Company &amp; technical archive</HeadingEnglish></h2>
    <Stories items={archive} lang={lang} className="hnd-archive-list"/>
  </section>;
}

export default function HomeNewsDesk({lang, go}) {
  const section = useRef(null);
  const zh = lang === 'zh';
  useEffect(() => {
    const host = section.current;
    if (!window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('hnd-entered');
        observer.unobserve(entry.target);
      }
    });
    for (const block of host.querySelectorAll('.hnd-photo, .hnd-briefs')) observer.observe(block);
    return () => observer.disconnect();
  }, []);

  return <section className="hnd" id="home-news" data-scroll-align="start" ref={section} aria-labelledby="hnd-heading" data-home-chapter="news">
    <header className="hnd-head">
      <h2 id="hnd-heading" className="home-chapter-title">{zh ? '新闻资讯' : 'Newsroom'}<HeadingEnglish lang={lang}>Newsroom</HeadingEnglish></h2>
      <NewsLink className="hnd-all" lang={lang} go={go}>
        {zh ? '新闻中心' : 'News centre'}<span><ArrowRight aria-hidden="true" size={18}/></span>
      </NewsLink>
    </header>
    <div className="hnd-layout">
      <NewsLink className="hnd-lead" lang={lang} go={go} hash="#chongqing-exhibition">
        <div className="hnd-lead-copy">
          <NewsDate date="2024-11-06" lang={lang}/>
          <strong>{chongqingEvent.title[lang]}</strong>
          <p>{zh ? '在重庆国际博览中心，岷河展出了燃气与供热用薄壁不锈钢管路。' : 'The team presented thin-wall stainless steel pipework for gas and heating at the Chongqing International Expo Center.'}</p>
          <span className="hnd-action">{zh ? '阅读报道' : 'Read the story'}<ChevronRight aria-hidden="true" size={16}/></span>
        </div>
        <div className="hnd-photo"><img src={chongqingEvent.photo} alt={chongqingEvent.alt[lang]} width="1380" height="1035" loading="lazy" decoding="async"/></div>
      </NewsLink>
      <Stories items={featuredArchive} lang={lang} className="hnd-briefs"/>
    </div>
  </section>;
}
