// hakuslaDungeon/data/items.ts の getModDescription() を移植。
// アプリ内の図鑑 (encyclopedia) の固有MOD表示はこの関数の出力を使っている。

export interface ModLike {
  type: string
  value?: number
  min?: number
  max?: number
}

export function getModDescription(mod: ModLike): string {
  const hasRange = typeof mod.min === 'number' && typeof mod.max === 'number'
  const val = hasRange ? `${mod.min}~${mod.max}` : String(mod.value ?? 0)
  const numeric = typeof mod.value === 'number' ? mod.value : 0

  switch (mod.type) {
    case 'atk_bonus':
      return `ATK+${val}`
    case 'def_bonus':
      return `DEF+${val}`
    case 'hp_bonus':
      return `HP+${val}`
    case 'hp_regen':
      return `毎秒HP${val}回復`
    case 'hp_regen_pct':
      return `毎秒HP${val}%回復`
    case 'poison_chance':
      return `毒付与+${val}%`
    case 'ignite_chance':
      return `発火付与+${val}%`
    case 'ignite_duration_pct':
      return `発火時間+${val}%`
    case 'ignite_tick_speed_pct':
      return `発火速度+${val}%`
    case 'ignite_damage_pct':
      return `発火ダメージ+${val}%`
    case 'ignite_lifesteal':
      return `発火ダメージ吸収${val}%`
    case 'critical_chance':
      return `クリティカル+${val}%`
    case 'critical_damage':
      return `クリダメ+${val}%`
    case 'hp_on_hit':
      return `HIT時HP+${val}回復`
    case 'damage_defer_pct':
      return `ダメージ遅延${val}%`
    case 'damage_reduction_pct':
      return `被ダメ-${val}%`
    case 'attack_speed_pct': {
      const sign = hasRange ? '' : numeric >= 0 ? '+' : ''
      return `攻撃速度${sign}${val}%`
    }
    case 'attack_speed_more_pct': {
      const sign = hasRange ? '' : numeric >= 0 ? '+' : ''
      return `攻撃速度${sign}${val}% more`
    }
    case 'hp_increased_pct':
      return `HP+${val}%`
    case 'atk_increased_pct':
    case 'atk_inc_pct':
      return `ATK+${val}%`
    case 'def_increased_pct':
      return `DEF+${val}%`
    case 'time_atk_inc_pct':
      return `5秒毎にATK+${val}%`
    case 'time_def_inc_pct':
      return `5秒毎にDEF+${val}%`
    case 'time_hp_regen':
      return `5秒毎に毎秒HP+${val}回復`
    case 'hp_regen_to_atk_pct':
      return `HP回復量の${val}%をATKに変換`
    case 'warlord_enrage':
      return '乱軍の王（HP30%以下で1度だけ発動。攻撃速度+20%, 攻撃時HP回復+300）'
    case 'chill_chance':
      return `チル付与+${val}%`
    case 'chill_effect_pct':
      return `チル効果+${val}%`
    case 'chill_duration_pct':
      return `チル時間+${val}%`
    case 'freeze_chance':
      return `フリーズ付与+${val}%`
    case 'freeze_duration_pct':
      return `フリーズ時間+${val}%`
    case 'poison_damage_pct':
      return `毒ダメージ+${val}%`
    case 'poison_damage_more_pct':
      return `毒ダメージ${val}% more`
    case 'poison_damage_reduction':
      return `毒状態の敵からの被ダメ-${val}%`
    case 'hp_on_crit':
      return `クリティカル時HP+${val}回復`
    case 'critical_follow_up_attack':
      return `クリティカル時追撃+${val}`
    case 'follow_up_attack_pct':
      return `双撃の刃（毎攻撃時、ATKの${val}%で追撃）`
    case 'king_slam':
      return 'キングスラム（5回攻撃ごとにATK×3の追撃）'
    case 'royal_roar':
      return '王の咆哮（3回攻撃ごとに自身の毒・発火・チルを解除）'
    case 'lifesteal':
      return `ライフスティール${val}%`
    case 'atk_more_pct':
      return `ATK ${val}% more`
    case 'def_more_pct':
      return `DEF ${val}% more`
    case 'hp_more_pct':
      return `HP ${val}% more`
    default:
      return ''
  }
}
