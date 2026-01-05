# Mall Dollar 接錢幣手機遊戲 (Coin Catching Game)

一個基於原生 HTML5 Canvas 製作的簡潔、可愛、流暢的接錢幣遊戲。專為手機直向遊玩設計，同時支援電腦遊玩。

## 遊戲功能
- **流暢體驗**：使用 `requestAnimationFrame` 確保 60FPS 流暢度。
- **手機優化**：支援左右滑動控制，具備平滑移動（Smoothing）手感。
- **自動適配**：支援 Retina / 高 DPI 螢幕，畫面清晰不模糊。
- **持續紀錄**：自動保存「單局最高分」與「歷史總累積金幣」至 `localStorage`。
- **難度遞增**：金幣下落速度與產生頻率會隨時間慢慢提升。

## 檔案說明
- `index.html`: 遊戲結構與 HUD 介面。
- `style.css`: 遊戲視覺風格與響應式佈局。
- `game.js`: 核心邏輯（物理、渲染、輸入處理、資料儲存）。

## 如何在本機開啟
1. 將所有檔案下載至同一個資料夾。
2. 直接使用瀏覽器打開 `index.html` 即可開始遊戲。
3. 如果是在電腦上開發，建議使用 VS Code 的 `Live Server` 擴充功能開啟以獲得最佳體驗。

## GitHub Pages 部署步驟
1. 在 GitHub 上建立一個新的儲存庫 (Repository)。
2. 將所有檔案 (`index.html`, `style.css`, `game.js`, `README.md`) 上傳至 GitHub 儲存庫。
3. 進入儲存庫的 **Settings** > **Pages**。
4. 在 "Build and deployment" 下的 **Branch** 選擇 `main` (或 `master`) 分支，路徑選擇 `/ (root)`。
5. 點擊 **Save**。數分鐘後，你就可以透過 GitHub 提供的網址在線上玩到遊戲。

---
製作人：Antigravity Agent
語言：繁體中文 (zh-HK)
