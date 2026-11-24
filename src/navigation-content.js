import {scenes} from './content.js';
import {productSeries, seriesCatalogUrl} from './product-series.js';
export const entries = [
  ['/', 'Home', '首页'],
  ['/applications', 'Solutions', '解决方案', 'applications'],
  ['/products', 'Products', '产品中心', 'products'],
  ['/services', 'Services', '服务体系', 'services'],
  ['/company', 'About', '关于我们', 'company'],
  ['/news', 'News', '新闻中心', 'news'],
  ['/contact', 'Contact', '联系我们'],
];
const pair=(en,zh)=>({en,zh});
const seriesPreviews = {
  press: {image: '/assets/product-series/press-coupling.webp', description: pair('Straight coupling', '双卡压直通')},
  ring: {image: '/assets/product-series/ring-coupling.webp', description: pair('Ring-press coupling', '环压直通')},
  'thick-wall': {image: '/assets/company/tube-making.webp', photograph: true, description: pair('Tube production at the MH PIPE factory', '岷河工厂 · 制管现场')},
};
export const catalogue = {
  products:productSeries.map(series => ({
    ...series,
    ...seriesPreviews[series.id],
    path: seriesCatalogUrl(series.id, 'en'),
  })),
  applications:scenes.map(s=>({...s,image:s.id==='water'?'/assets/scenes/water-building.png':s.image,path:`/applications?scene=${s.id}`})),
  services:[
    {id:'consultation',name:pair('Project consultation','项目咨询'),description:pair('Start with your application, drawings and supply requirements.','从应用、图纸与供货需求开始。'),image:'/assets/services/project-consultation.png',path:'/services?stage=selection#service-detail'},
    {id:'technical',name:pair('Technical coordination','技术配合'),description:pair('Connect product selection with the requirements of your project.','让产品选型与项目需求相衔接。'),image:'/assets/services/technical-review.png',path:'/services?stage=drawings#service-detail'},
    {id:'resources',name:pair('Documents & resources','资料下载'),description:pair('Company brochure and information for your inquiry.','公司画册与询盘所需资料。'),image:'/assets/services/site-coordination.png',path:'/services#resources'},
  ],
  company:[
    {id:'company',name:pair('Meet MH PIPE','认识岷河'),description:pair('Our company, our factory and the people behind our products.','了解企业、工厂与产品背后的制造。'),image:'/assets/company/factory-front.webp',path:'/company'},
    {id:'manufacturing',name:pair('Inside manufacturing','走进制造'),description:pair('Explore the forming, production and testing processes.','走进成型、生产与检测环节。'),image:'/assets/company/forming.webp',path:'/manufacturing'},
    {id:'history',name:pair('Company milestones','发展历程'),description:pair('Discover the milestones recorded in our company materials.','从企业资料中了解岷河的发展历程。'),image:'/assets/company/factory.webp',path:'/company#cd-history-title'},
  ],
  news:[
    {id:'updates',name:pair('Company records','企业资讯'),description:pair('Company publications and manufacturing records.','企业出版资料与制造记录。'),image:'/assets/company/tube-making.webp',path:'/news'},
    {id:'guide',name:pair('Procurement guide','采购指南'),description:pair('Prepare the details needed for product selection and supply.','整理选型与采购所需的信息。'),image:'/assets/company/laser-marking.webp',path:'/news#nd-title'},
  ],
};
