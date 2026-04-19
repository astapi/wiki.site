import ja from './locales/ja.json'

export type SkillTriggerType =
  | 'persistent'
  | 'regular'
  | 'everyAttack'
  | 'every10'
  | 'threshold'

export interface BossSkillInfo {
  skillKey: string
  descKey: string
  descKeyUberUber?: string
  isUberOnly?: boolean
  isUberUberOnly?: boolean
  isThreshold?: boolean
  triggerType?: SkillTriggerType
  triggerTypeUberUber?: SkillTriggerType
}

export interface BossAbilities {
  bossId: string
  regularSkills: BossSkillInfo[]
  thresholdSkills: BossSkillInfo[]
}

const BOSS_ABILITIES_MAP: Record<string, BossAbilities> = {
  goblin_king: {
    bossId: 'goblin_king',
    regularSkills: [
      { skillKey: 'shield', descKey: 'shieldDesc', descKeyUberUber: 'shieldDescUberUber', triggerType: 'regular', triggerTypeUberUber: 'persistent' },
      { skillKey: 'kingsSlam', descKey: 'kingsSlamDesc', isUberUberOnly: true, triggerType: 'every10' },
      { skillKey: 'kingsRoar', descKey: 'kingsRoarDesc', isUberUberOnly: true, triggerType: 'regular' },
    ],
    thresholdSkills: [
      { skillKey: 'warlord', descKey: 'warlordDesc', descKeyUberUber: 'warlordDescUberUber', isUberOnly: true, isThreshold: true, triggerType: 'threshold', triggerTypeUberUber: 'persistent' },
    ],
  },
  bandit_leader: {
    bossId: 'bandit_leader',
    regularSkills: [
      { skillKey: 'bearTrap', descKey: 'bearTrapDesc', descKeyUberUber: 'bearTrapDescUberUber', triggerType: 'regular', triggerTypeUberUber: 'persistent' },
      { skillKey: 'nightAmbush', descKey: 'nightAmbushDesc', triggerType: 'regular' },
      { skillKey: 'twinStrike', descKey: 'twinStrikeDesc', isUberUberOnly: true, triggerType: 'everyAttack' },
      { skillKey: 'shadowGarrote', descKey: 'shadowGarroteDesc', isUberUberOnly: true, triggerType: 'every10' },
    ],
    thresholdSkills: [
      { skillKey: 'shadowBind', descKey: 'shadowBindDesc', descKeyUberUber: 'shadowBindDescUberUber', isUberOnly: true, isThreshold: true, triggerType: 'threshold', triggerTypeUberUber: 'persistent' },
    ],
  },
  vampire: {
    bossId: 'vampire',
    regularSkills: [
      { skillKey: 'bloodFeast', descKey: 'bloodFeastDesc' },
      { skillKey: 'nightFeast', descKey: 'nightFeastDesc', isUberOnly: true },
    ],
    thresholdSkills: [
      { skillKey: 'crimsonPact', descKey: 'crimsonPactDesc', isUberOnly: true, isThreshold: true },
    ],
  },
  kraken: {
    bossId: 'kraken',
    regularSkills: [
      { skillKey: 'tsunami', descKey: 'tsunamiDesc' },
      { skillKey: 'abyssalEbb', descKey: 'abyssalEbbDesc', isUberOnly: true },
    ],
    thresholdSkills: [
      { skillKey: 'deepEmbrace', descKey: 'deepEmbraceDesc', isThreshold: true },
    ],
  },
  demon_lord: {
    bossId: 'demon_lord',
    regularSkills: [
      { skillKey: 'deathHand', descKey: 'deathHandDesc' },
    ],
    thresholdSkills: [
      { skillKey: 'blackFlame', descKey: 'blackFlameDesc', isThreshold: true },
      { skillKey: 'crown', descKey: 'crownDesc', isUberOnly: true, isThreshold: true },
    ],
  },
  true_final_boss: {
    bossId: 'true_final_boss',
    regularSkills: [
      { skillKey: 'end', descKey: 'endDesc' },
    ],
    thresholdSkills: [],
  },
}

const UBER_BOSS_BY_BASE: Record<string, string> = {
  goblin_king: 'uber_goblin_king',
  bandit_leader: 'uber_bandit_leader',
  vampire: 'uber_vampire',
  kraken: 'uber_kraken',
  demon_lord: 'uber_demon_lord',
  true_final_boss: 'uber_true_final_boss',
}
const BASE_BOSS_BY_UBER: Record<string, string> = Object.fromEntries(
  Object.entries(UBER_BOSS_BY_BASE).map(([base, uber]) => [uber, base])
)

const UBER_UBER_BY_UBER: Record<string, string> = {
  uber_goblin_king: 'uber_uber_goblin_king',
  uber_bandit_leader: 'uber_uber_bandit_leader',
}
const UBER_BY_UBER_UBER: Record<string, string> = Object.fromEntries(
  Object.entries(UBER_UBER_BY_UBER).map(([uber, uberUber]) => [uberUber, uber])
)

export function isUber(monsterId: string): boolean {
  return monsterId.startsWith('uber_')
}

export function isUberUber(monsterId: string): boolean {
  return monsterId.startsWith('uber_uber_')
}

function resolveBaseId(monsterId: string): string {
  const uberId = UBER_BY_UBER_UBER[monsterId] ?? monsterId
  return BASE_BOSS_BY_UBER[uberId] ?? uberId
}

export function getBossAbilities(monsterId: string): BossAbilities | null {
  return BOSS_ABILITIES_MAP[resolveBaseId(monsterId)] ?? null
}

const BOSS_SKILL_LOCALES = (ja.bossSkills ?? {}) as Record<string, Record<string, string>>

export function lookupSkillLabel(monsterId: string, key: string): string {
  return BOSS_SKILL_LOCALES[resolveBaseId(monsterId)]?.[key] ?? key
}

const TRIGGER_LABEL: Record<SkillTriggerType, string> = {
  persistent: '永続',
  regular: '3攻撃ごと',
  everyAttack: '毎攻撃',
  every10: '10攻撃ごと',
  threshold: 'HP50%以下',
}

export function triggerLabel(type: SkillTriggerType | undefined): string | null {
  return type ? TRIGGER_LABEL[type] : null
}
