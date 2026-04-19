// モンスター詳細ページに「攻略ポイント」として表示するワンポイント攻略。
// 長文化するなら将来的に記事ページに切り出す想定 (当面は詳細ページに箇条書き)。

const BOSS_TIPS: Record<string, string[]> = {
  uber_uber_goblin_king: [
    'ダメージ遅延と回復系MODを積んで高火力に耐えよう',
    '特定ユニーク、鎧のランダムMODのダメージ軽減%もほしい',
    'キングスラムは一撃死の可能性が高い。ゴブリンキングをフリーズ状態にするとカウントがリセットされるぞ',
    'UberUberゴブリンの踏みつけの王の咆哮が役に立つ時が来るかも',
  ],
  uber_uber_bandit_leader: [
    'ダメージ遅延と回復MODを積んで高速攻撃に耐えよう',
    '特定ユニーク、鎧のランダムMODのダメージ軽減%もほしい',
    '攻撃速度が速いのでチルによる攻撃速度低下が有効',
    'フリーズチャンスもあるとフリーズの間に回復が出来る',
    'UberUber双撃の指輪は超攻撃的アイテムだ',
  ],
}

export function getBossTips(monsterId: string): string[] | null {
  return BOSS_TIPS[monsterId] ?? null
}
