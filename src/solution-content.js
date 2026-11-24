// Application-selection copy, not a claim that every MH PIPE product is
// approved for each service. The three prompts are a starting point for an
// enquiry, not a complete engineering or regulatory checklist.
// Research and source limits: outputs/flow-upgrade/research.txt

export const solutionScenes = [
  {
    id: 'water',
    name: { en: 'Building water', zh: '建筑给水' },
    description: {
      en: 'Explore the connections from building risers to kitchens, bathrooms and everyday water outlets.',
      zh: '从建筑立管到厨房与卫浴，梳理日常用水的管路连接。',
    },
    requirements: [
      { id: 'service', name: { en: 'Water service', zh: '供水用途' } },
      { id: 'conditions', name: { en: 'Temperature & pressure', zh: '温度与压力' } },
      { id: 'connections', name: { en: 'Sizes & connections', zh: '尺寸与接口' } },
    ],
  },
  {
    id: 'gas',
    name: { en: 'Building gas', zh: '建筑燃气' },
    description: {
      en: 'Explore building gas pipework from vertical risers to branches serving individual homes and appliances.',
      zh: '从楼内立管到住户用气端，查看燃气管路的连接位置。',
    },
    requirements: [
      { id: 'medium', name: { en: 'Gas type', zh: '燃气介质' } },
      { id: 'conditions', name: { en: 'Design conditions', zh: '设计工况' } },
      { id: 'approvals', name: { en: 'Local approvals', zh: '当地准入' } },
    ],
  },
  {
    id: 'fire',
    name: { en: 'Fire protection', zh: '消防' },
    description: {
      en: 'Explore connections along building fire-protection risers and branches leading towards the system’s terminal equipment.',
      zh: '围绕建筑内消防立管与分支，查看管路连接与末端位置。',
    },
    requirements: [
      { id: 'system', name: { en: 'System type', zh: '系统类型' } },
      { id: 'conditions', name: { en: 'Design conditions', zh: '设计工况' } },
      { id: 'specification', name: { en: 'Project requirements', zh: '项目规范' } },
    ],
  },
  {
    id: 'industry',
    name: { en: 'Industry', zh: '工业' },
    description: {
      en: 'Explore workshop mains, branches and equipment connections according to the fluid carried through the system.',
      zh: '从设备接口到车间干支管，围绕生产介质梳理连接需求。',
    },
    requirements: [
      { id: 'medium', name: { en: 'Fluid composition', zh: '介质成分' } },
      { id: 'conditions', name: { en: 'Temperature & pressure', zh: '温度与压力' } },
      { id: 'maintenance', name: { en: 'Connections & maintenance', zh: '连接与维护' } },
    ],
  },
  {
    id: 'cooling',
    name: { en: 'Data center liquid cooling', zh: '液冷数据中心' },
    description: {
      en: 'Explore cooling supply and return connections between distribution equipment and racks within the data hall.',
      zh: '沿机房冷却供回液管路，查看分配设备与机柜之间的连接。',
    },
    requirements: [
      { id: 'medium', name: { en: 'Coolant composition', zh: '冷却介质' } },
      { id: 'conditions', name: { en: 'Operating range', zh: '工况范围' } },
      { id: 'interfaces', name: { en: 'Cleanliness & interfaces', zh: '清洁与接口' } },
    ],
  },
];

export const solutionCopy = {
  requirementsHeading: { en: 'Start with your requirements.', zh: '从使用需求开始。' },
  inquiryAction: { en: 'Discuss this application', zh: '沟通应用需求' },
};
