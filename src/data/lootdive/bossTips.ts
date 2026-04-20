import { tArray, type Lang } from '../../i18n/site'

// Boss tip IDs live in src/i18n/lootdive/{lang}.json under `bossTips.<monsterId>`.
// Currently defined for uber_uber_goblin_king / uber_uber_bandit_leader.
export function getBossTips(monsterId: string, lang: Lang = 'ja'): string[] | null {
  const tips = tArray(lang, `bossTips.${monsterId}`)
  return tips.length > 0 ? tips : null
}
