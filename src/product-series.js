export const productSeries = [
  {
    id: 'press',
    name: {zh: '双卡压不锈钢管路系列', en: 'Double-press stainless steel piping systems'},
    shortName: {zh: '双卡压', en: 'Double-press'},
    intro: {zh: '点击部件可停留查看，点击空白处返回全景。', en: 'Select a part to hold the view. Click the background to return to the full pipe run.'},
    copy: {zh: '查看直管之间的连接、分支和转向。', en: 'Explore the joints, branches and turns in a pipe run.'},
  },
  {
    id: 'ring',
    name: {zh: '环压不锈钢管路系列', en: 'Ring-press stainless steel piping systems'},
    shortName: {zh: '环压', en: 'Ring-press'},
    intro: {zh: '从承口看起，比较等径接头、弯头与三通的外形。', en: 'Look closely at the sockets on the coupling, elbow and tee.'},
    copy: {zh: '按所需管径选配环压管材与管件，核对接口尺寸和连接图纸。', en: 'Match the pipe and ring-press fittings to the required size and check the connection drawings.'},
  },
  {
    id: 'thick-wall',
    name: {zh: '厚壁不锈钢管路系列', en: 'Thick-wall stainless steel piping systems'},
    shortName: {zh: '厚壁', en: 'Thick-wall'},
    intro: {zh: '从管端查看外径与壁厚，再按项目要求选型。', en: 'Read the outside diameter and wall thickness at the pipe end.'},
    copy: {zh: '按外径、壁厚和材质要求选型，结合项目图纸核对连接方式。', en: 'Start with the outside diameter, wall thickness and material grade. Check the connection against the project drawings.'},
  },
];

export function resolveSeriesId(id) {
  if (id === 'double-press' || id === 'pipes') return 'press';
  if (id === 'ring-press') return 'ring';
  return productSeries.find(series => series.id === id)?.id || null;
}

export function seriesCatalogUrl(id, lang, form, anchor = 'product-selection') {
  const query = new URLSearchParams({family: id, lang});
  if (form) query.set('form', form);
  return '/products?' + query + '#' + anchor;
}

// The ring-press forms have their own catalogue images and inquiry IDs.
export const ringProducts = [
  {
    shape: 'coupling', name: {zh: '等径接头', en: 'Equal coupling'},
    description: {zh: '连接同一直线上的两段同径管材。', en: 'Joins two pipe lengths of the same diameter on a straight run.'},
  },
  {
    shape: 'elbow', name: {zh: '90°弯头', en: '90° elbow'},
    description: {zh: '通过独立弯头改变管路方向。', en: 'Changes the direction of a pipe run by 90 degrees.'},
  },
  {
    shape: 'tee', name: {zh: '等径三通', en: 'Equal tee'},
    description: {zh: '从主管引出一条同径支管。', en: 'Adds a branch of the same diameter to the main run.'},
  },
].map(item => ({
  ...item, id: 'ring-' + item.shape, family: 'ring', image: '/assets/product-series/ring-' + item.shape + '.webp',
}));
