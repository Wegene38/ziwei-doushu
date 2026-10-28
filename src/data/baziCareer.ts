import type { BaziData } from '../utils/bazi'
import type { BaziCareerReading, IndustryGroup } from '../utils/baziCareerTypes'
import { ELEMENT_COLOR } from '../utils/bazi'

/**
 * 职业推荐依据(传统命理通用归纳,流派间略有差异):
 * 1. 日主强弱 → 喜用神五行 → 五行行业对照
 * 2. 十神多旺倾向 → 工作风格与代表职业
 * 3. 神煞(文昌/驿马/华盖/天乙贵人/桃花)→ 加成方向
 */

/** 五行 → 行业对照 */
const WUXING_INDUSTRIES: Record<string, string[]> = {
  木: ['教育培训', '文化出版', '图书文具', '服装纺织', '家具木业', '园艺花卉', '中医中药', '医疗健康'],
  火: ['互联网/软件', '电子电力', '能源石化', '餐饮美食', '广告传媒', '影视娱乐', '直播短视频', '光电照明'],
  土: ['房地产/建筑', '工程施工', '农业种植', '陶瓷建材', '保险精算', '中介咨询', '人力资源', '仓储物流'],
  金: ['银行金融', '证券投资', '机械制造', '汽车交通', '精密仪器', '司法/军警', '外科医疗', '五金钢铁'],
  水: ['贸易进出口', '物流运输', '航运渔业', '旅游酒店', '咨询服务', '传媒传播', '自由职业', '水务饮品'],
}

/** 喜用五行 → 推荐理由 */
const ELEMENT_REASON: Record<string, string> = {
  木: '木主仁,主生长、教育与创造',
  火: '火主礼,主热情、传播与表达',
  土: '土主信,主承载、稳健与积累',
  金: '金主义,主决断、规则与执行',
  水: '水主智,主流动、沟通与变通',
}

/** 十神 → 职业倾向(传统归纳) */
const TEN_GOD_CAREER: Record<string, { tendency: string; careers: string[] }> = {
  正官: { tendency: '守规守信,天然的管理者与秩序维护者', careers: ['公务员', '行政管理', '法律司法', '企业高管'] },
  七杀: { tendency: '果敢有魄力,越有挑战越兴奋', careers: ['军警执法', '开拓型业务', '外科医疗', '危机管理'] },
  正印: { tendency: '重学识与名誉,是天然的引导者', careers: ['教育学术', '文化出版', '公职文教', '宗教慈善'] },
  偏印: { tendency: '直觉敏锐,专研冷门与技艺', careers: ['医术技艺', '研究策划', '玄学五术', '小众专业'] },
  正财: { tendency: '务实稳健,积少成多的理财手', careers: ['实业经营', '会计财务', '稳健投资', '供应链管理'] },
  偏财: { tendency: '商机嗅觉灵,敢放手一搏', careers: ['商业贸易', '投资理财', '业务开拓', '资源整合'] },
  食神: { tendency: '才华悠然外露,懂生活有品味', careers: ['餐饮美食', '艺术创作', '教学表达', '内容创作'] },
  伤官: { tendency: '才气逼人,不服管束爱创新', careers: ['创意设计', '演艺表演', '技术专家', '自由职业'] },
  比肩: { tendency: '自立自强,适合同侪协作与竞技', careers: ['合伙创业', '体育竞技', '同业合作', '技术岗'] },
  劫财: { tendency: '行动力强,敢于争夺资源', careers: ['竞争性行业', '销售拓客', '自由职业', '工程现场'] },
}

/** 神煞 → 含义与职业加成 */
const SHENSHA_CAREER: Record<string, { meaning: string; careers: string[] }> = {
  文昌: { meaning: '主聪明文才,利考试与文书', careers: ['写作/学术', '文教考试', '文案策划'] },
  驿马: { meaning: '主迁移流动,越动越旺', careers: ['外贸跨境', '物流交通', '旅游酒店', '驻外差旅'] },
  华盖: { meaning: '主孤高艺境,与玄学艺术有缘', careers: ['艺术创作', '学术研究', '玄学宗教'] },
  天乙贵人: { meaning: '一生多贵人提携', careers: ['管理公职', '需要背书人脉的领域'] },
  桃花: { meaning: '人缘魅力出众,面向人群的行业加分', careers: ['演艺表演', '销售公关', '美业时尚'] },
}

/** 强弱 → 批语 */
const STRENGTH_TEXT: Record<string, string> = {
  偏弱: '日主偏弱,宜「借势」——选择能依托平台、团队与贵人资援的方向,先蓄力后发力,忌单打独斗硬扛。',
  偏强: '日主偏强,能担财官——适合主动出击、承担压力与开拓市场,把过剩的能量导向事业与财库。',
  中和: '日主中和,五行相对流通——职业选择面宽,宜结合大运流年顺势择机,专精一门更易出圈。',
}

/** 组装八字职业推荐 */
export function buildCareerReading(bazi: BaziData): BaziCareerReading {
  const topGods = bazi.tenGods.slice(0, 3).filter((g) => g.weight >= 1)
  const styleText = topGods
    .map((g) => `${g.name}(${g.weight}):${TEN_GOD_CAREER[g.name].tendency}。`)
    .join('')
  const styleCareers = [...new Set(topGods.flatMap((g) => TEN_GOD_CAREER[g.name].careers))]

  const shensha = bazi.shensha
    .filter((s) => SHENSHA_CAREER[s.name])
    .map((s) => ({ name: s.name, ...SHENSHA_CAREER[s.name] }))

  const industryGroups: IndustryGroup[] = bazi.favorable.map((el) => ({
    element: el,
    reason: ELEMENT_REASON[el] ?? '',
    industries: WUXING_INDUSTRIES[el] ?? [],
  }))

  // 综合推荐:喜用行业在前,十神风格行业与神煞行业随后,去重取前 12
  const recommendCareers = [
    ...industryGroups.flatMap((g) => g.industries),
    ...styleCareers,
    ...shensha.flatMap((s) => s.careers),
  ]
    .filter((c, i, arr) => arr.indexOf(c) === i)
    .slice(0, 12)

  return {
    pillars: bazi.pillars,
    dayStem: bazi.dayStem,
    dayElement: bazi.dayElement,
    strength: bazi.strength,
    strengthText: STRENGTH_TEXT[bazi.strength],
    favorable: bazi.favorable,
    tenGods: bazi.tenGods,
    styleText,
    styleCareers,
    shensha,
    industryGroups,
    recommendCareers,
  }
}

export { ELEMENT_COLOR, WUXING_INDUSTRIES }
