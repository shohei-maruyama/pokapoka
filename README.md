# 🍀 ぽかぽかノート

家族で使う育児記録アプリです。

## セットアップ

### 1. Node.js のインストール（まだの場合）
https://nodejs.org/ja → LTS版をダウンロードしてインストール

### 2. 依存パッケージのインストール
PowerShell（Windows）またはターミナル（Mac）でこのフォルダを開き：

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開くと動きます。

### 4. ビルド（本番用）

```bash
npm run build
npm start
```

## GitHub Pages / Vercel へのデプロイ

### Vercel（推奨・無料）
1. https://vercel.com でアカウント作成
2. このフォルダを GitHub にアップロード
3. Vercel で「Import Project」→ GitHubリポジトリを選択
4. そのままデプロイ → URLが発行される

## Firebase移行について

`lib/storage.ts` の関数を Firebase SDK に差し替えるだけで移行できます。
データ構造（`types/index.ts`）は変わりません。

## 機能一覧

- 🏠 ホーム：前回からの経過時間を大きく表示
- 🍼 授乳：タイマー計測・ミルク量記録
- 👶 おむつ：ワンタップ記録
- 🌙 睡眠：タイマー計測・合計表示
- 🥣 離乳食：月齢4か月以降に表示
- 🌡️ 体調：体温・薬・通院記録
- 📋 振り返り：タイムライン・グラフ
- 🌱 成長：マイルストーン・体重身長
- 📡 NFC：タグURLの発行・データ管理

## NFC連携

1. `📡 NFC`タブでURLをコピー
2. 「NFC Tools」アプリ（App Store）でタグに書き込む
3. iPhoneをタグにかざすだけで記録完了
