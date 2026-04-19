# wiki.astapi.net

astapi Games の各タイトル向けデータリファレンス (Wiki) サイト。
1リポジトリで複数ゲームを配信する構成。

## スタック

- [Astro](https://astro.build/) 6 (static output / SSG)
- Tailwind CSS 4
- Node.js 22.12.0 (`.node-version`)
- デプロイ: Cloudflare Pages

## 開発

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # dist/ に静的ファイル生成
pnpm preview   # ビルド結果のプレビュー
```

## ディレクトリ構成

```
src/
├── data/
│   └── lootdive/                # LootDive マスターデータ
│       ├── game/                # items, monsters, dungeons, mods...
│       ├── locales/             # ja/en/de/es/fr/ko/zh
│       └── types.ts             # hakuslaDungeon の types/index.ts コピー
├── layouts/
│   ├── BaseLayout.astro         # HTML shell (全ページ共通)
│   └── GameLayout.astro         # ゲーム個別の header/footer
├── pages/
│   ├── index.astro              # サイトトップ (ゲーム一覧)
│   └── lootdive/
│       ├── index.astro
│       ├── monsters/
│       │   ├── index.astro      # 一覧
│       │   └── [id].astro       # 詳細 (getStaticPaths で全生成)
│       ├── items/
│       └── dungeons/
└── styles/global.css

public/
├── favicon.ico / favicon.svg
├── _redirects                   # Cloudflare Pages のリダイレクト/リライト
└── lootdive/
    └── images/                  # モンスター・アイテム画像
```

新規ゲーム追加は `src/data/<slug>/` と `src/pages/<slug>/` を同じ構造で足し、
`src/pages/index.astro` の `games` 配列にエントリを追加するだけ。

## デプロイ: Cloudflare Pages

### 初回セットアップ

1. Cloudflare Dashboard → Pages → Create a project → Connect Git
2. ビルド設定:
   - Framework preset: **Astro**
   - Build command: `pnpm run build`
   - Build output directory: `dist`
   - Environment variables: `NODE_VERSION=22.12.0`
3. Custom domains:
   - `wiki.astapi.net` (サイトトップ用)
   - 将来: `wiki.lootdive.astapi.net`, `wiki.<game>.astapi.net`

### サブドメイン → パス書き換え

将来、ゲームごとにサブドメインで運用したくなったら、
`public/_redirects` の該当行のコメントを外す:

```
https://wiki.lootdive.astapi.net/* /lootdive/:splat 200
```

status code `200` = rewrite (URLバー変更なし)。
各サブドメインを Cloudflare Pages の Custom domain に追加すれば有効化される。

## データ同期

LootDive のマスターデータは `~/projects/ReactNativeExpo/hakuslaDungeon` が正。
更新があったら以下で同期:

```bash
SRC=~/projects/ReactNativeExpo/hakuslaDungeon
DST=~/projects/wiki.astapi.net

cp "$SRC"/data/json/*.json "$DST"/src/data/lootdive/game/
cp "$SRC"/locales/*.json   "$DST"/src/data/lootdive/locales/
cp "$SRC"/types/index.ts   "$DST"/src/data/lootdive/types.ts

for d in monsters items characters passive chests; do
  rsync -a --exclude='.DS_Store' \
    "$SRC/assets/images/$d/" \
    "$DST/public/lootdive/images/$d/"
done
```
