import React from 'react';

export const companyProfileParagraphs = [
  {
    zh: '四川岷河管道建设工程有限公司成立于2000年7月，坐落于四川省眉山市甘眉工业园区南区。公司是一家集研发、制造和销售为一体的高新技术企业、四川省企业技术中心、四川省“专精特新”企业。',
    en: 'Sichuan Minhe Pipeline Construction Engineering Co., Ltd. was founded in July 2000 and is based in the southern district of Ganmei Industrial Park in Meishan, Sichuan. MH PIPE brings research and development, manufacturing and sales together. It holds high-tech enterprise status, operates a Sichuan provincial enterprise technology center and is recognized by the province as a specialized and innovative enterprise.'
  },
  {
    zh: '公司产品主要用于燃气、给水、消防、化工、食品、医疗等多个领域。',
    en: 'Our piping products serve gas distribution, water supply and fire protection systems, as well as the chemical, food and healthcare sectors.'
  },
  {
    zh: '公司有专业的产品设计、工艺设计团队，能够满足所有用户对产品的不同需求；同时拥有一支强大而且非常专业的售后服务团队，能够满足客户对于施工培训、现场指导、后期维护等要求。',
    en: 'Our product and process design teams develop solutions for each customer’s requirements. Our after-sales specialists provide installation training, on-site guidance and ongoing maintenance support.'
  }
];

export default function CompanyProfile({lang}) {
  return <div className="mh-company-profile">
    {companyProfileParagraphs.map(paragraph => <p key={paragraph.zh}>{paragraph[lang]}</p>)}
  </div>;
}
