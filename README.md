# FoodieAI - 智能餐廳推薦系統

基於 AI 的餐廳推薦系統，結合 Google Places API 和 Gemini AI，為用戶提供個性化的餐廳推薦服務。

## 功能特色

- 🤖 **AI 智能推薦**: 支援中文自然語言輸入，固定推薦 4 間餐廳
- 📍 **精準定位**: 自動獲取用戶位置，支援 200m-5000m 搜尋半徑
- 🎯 **智能排序**: 需求匹配度 > 距離 > 評分
- 🎲 **隨機選擇**: 一鍵隨機選擇餐廳
- 📱 **響應式設計**: 支援桌面和行動裝置

## 技術架構

- **前端**: Next.js 15 + TypeScript + Tailwind CSS
- **後端**: Next.js API Routes + Google Places API + Gemini AI
- **部署**: Vercel

## 快速開始

### 環境需求

- Node.js 18+
- Google Maps API Key
- Gemini AI API Key

### 安裝

```bash
npm install
```

### 環境變數

創建 `.env.local` 檔案：

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 啟動

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

## 使用方式

1. 在搜尋框輸入需求，例如：「想要吃日式料理，不要太貴」
2. 點擊「開始推薦」
3. AI 分析需求並推薦餐廳
4. 可調整搜尋半徑或使用隨機選擇功能

## 專案結構

```
src/
├── app/                    # Next.js App Router
├── components/             # React 組件
├── lib/                    # 工具函數和配置
│   ├── config.ts          # 應用配置
│   ├── ai.ts              # AI 整合
│   ├── google.ts          # Google API 整合
│   └── utils.ts           # 工具函數
└── types/                  # TypeScript 類型定義
```

## 開發規範

- TypeScript 強制使用
- ESLint + Prettier 代碼規範
- 組件化開發
- 配置集中管理

## 部署

推送到 GitHub，Vercel 自動部署。

## 授權

MIT License
