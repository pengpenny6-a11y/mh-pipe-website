import {routeHref} from './site-routes.js';
const examples = [
  {role:'heading', label:'页面与板块标题', zh:'关于我们', en:'About MH PIPE'},
  {role:'lead', label:'导语', zh:'从制造，到工程配套。', en:'From manufacturing to project supply.'},
  {role:'body', label:'正文', zh:'岷河制造不锈钢管材与管件，产品涵盖双卡压、环压和厚壁管路系列。', en:'MH PIPE manufactures stainless steel pipes and fittings for double-press, ring-press and thick-wall piping systems.'},
  {role:'nav', label:'导航', zh:'产品中心', en:'Products', path:'/products'},
  {role:'button', label:'操作按钮', zh:'了解方案', en:'View solutions', path:'/applications'},
  {role:'note', label:'图注与来源', zh:'岷河厂区效果图', en:'MH PIPE campus rendering'},
  {role:'data', label:'数据与年份', zh:'2000', en:'2000'}
];

const table = document.getElementById('specimen-rows');
const samples = [];
for (const item of examples) {
  const row = table.insertRow();
  const label = document.createElement('th');
  label.scope = 'row';
  label.textContent = item.label;
  row.append(label);
  for (const lang of ['zh','en']) {
    const cell = row.insertCell();
    cell.lang = lang === 'zh' ? 'zh-CN' : 'en';
    cell.className = 'language-' + lang;
    const element = document.createElement(item.path ? 'a' : 'div');
    element.className = 'sample sample-' + item.role;
    element.textContent = item[lang];
    if (item.role === 'heading' && lang === 'zh') {
      const translation = document.createElement('small');
      translation.className = 'mh-heading-english';
      translation.lang = 'en';
      translation.setAttribute('aria-hidden','true');
      translation.textContent = item.en;
      element.append(translation);
    }
    if (item.path) element.href = routeHref(item.path, lang);
    const detail = document.createElement('small');
    detail.className = 'metrics';
    cell.append(element, detail);
    samples.push([element, detail]);
  }
}

const px = length => Number.parseFloat(length).toFixed(1).replace(/\.0$/, '') + 'px';
function measure() {
  for (const [sample, label] of samples) {
    const style = getComputedStyle(sample);
    label.textContent = [px(style.fontSize), style.fontWeight, px(style.lineHeight)].join(' / ');
    const translation = sample.querySelector('.mh-heading-english');
    if (translation) label.textContent += ' · 英文副标 ' + px(getComputedStyle(translation).fontSize);
  }
}

new ResizeObserver(measure).observe(table);
document.fonts.ready.then(measure);
window.matchMedia('print').addEventListener('change', measure);
window.addEventListener('beforeprint', measure);
document.getElementById('print-sheet').addEventListener('click', () => window.print());
measure();
