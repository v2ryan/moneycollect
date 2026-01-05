/**
 * Mall Dollar Coin Catching Game
 * 純原生 JS 實現，支援手機與電腦
 */

// --- 配置與常數 ---
const CONFIG = {
    COIN_SIZE: 40,
    BASKET_WIDTH: 80,
    BASKET_HEIGHT: 60,
    INITIAL_FALL_SPEED: 3,
    SPEED_INCREMENT: 0.1,
    MAX_SPEED: 12,
    SPAWN_INTERVAL: 1500, // 毫秒
    MIN_SPAWN_INTERVAL: 400,
    SPAWN_DECREMENT: 20,
};

// --- 儲存模組 (Storage) ---
const Storage = {
    keys: {
        BEST_SCORE: 'catch_game_best_score',
        TOTAL_MALL_DOLLAR: 'catch_game_total_dollar'
    },
    get(key) {
        return parseInt(localStorage.getItem(key)) || 0;
    },
    set(key, value) {
        localStorage.setItem(key, value);
    }
};

// --- 輸入模組 (Input) ---
class InputHandler {
    constructor() {
        this.mouseX = 0;
        this.touchX = 0;
        this.isTouch = false;
        this.keys = {};

        // 滑鼠與觸控
        window.addEventListener('mousemove', e => this.mouseX = e.clientX);
        window.addEventListener('touchmove', e => {
            this.isTouch = true;
            this.touchX = e.touches[0].clientX;
        }, { passive: false });

        // 鍵盤
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    }
}

// --- 金幣類 (Coin) ---
class Coin {
    constructor(canvasWidth, speed) {
        this.radius = CONFIG.COIN_SIZE / 2;
        this.x = Math.random() * (canvasWidth - CONFIG.COIN_SIZE) + this.radius;
        this.y = -this.radius;
        this.speed = speed;
        this.active = true;
    }

    update() {
        this.y += this.speed;
        if (this.y > window.innerHeight + this.radius) {
            this.active = false;
        }
    }

    draw(ctx) {
        // 畫金色圓形
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, '#FFF176'); // 亮金
        grad.addColorStop(0.7, '#FFD600'); // 中金
        grad.addColorStop(1, '#F57F17'); // 暗金
        ctx.fillStyle = grad;
        ctx.fill();

        // 內圈裝飾
        ctx.strokeStyle = '#F9A825';
        ctx.lineWidth = 2;
        ctx.stroke();

        // M 文字
        ctx.fillStyle = '#E65100';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', this.x, this.y + 2);
        ctx.restore();
    }
}

// --- 籃子類 (Basket) ---
class Basket {
    constructor(canvasWidth, canvasHeight) {
        this.width = CONFIG.BASKET_WIDTH;
        this.height = CONFIG.BASKET_HEIGHT;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 40;
        this.targetX = this.x;
        this.smoothing = 0.15; // 平滑度
    }

    update(inputX, canvasWidth, useKeyboard, keys) {
        // 電腦鍵盤控制
        if (useKeyboard) {
            if (keys['ArrowLeft']) this.targetX -= 10;
            if (keys['ArrowRight']) this.targetX += 10;
        } else {
            // 滑鼠或觸控控制
            this.targetX = inputX - this.width / 2;
        }

        // 限制邊界
        if (this.targetX < 0) this.targetX = 0;
        if (this.targetX > canvasWidth - this.width) this.targetX = canvasWidth - this.width;

        // 平滑移動 (Smoothing)
        this.x += (this.targetX - this.x) * this.smoothing;
    }

    draw(ctx) {
        ctx.save();
        // 畫一個簡單的籃子/購物車形狀
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;

        // 籃身 (圓角矩形)
        const r = 10;
        ctx.beginPath();
        ctx.moveTo(this.x + r, this.y);
        ctx.lineTo(this.x + this.width - r, this.y);
        ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + r);
        ctx.lineTo(this.x + this.width, this.y + this.height - r);
        ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - r, this.y + this.height);
        ctx.lineTo(this.x + r, this.y + this.height);
        ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - r);
        ctx.lineTo(this.x, this.y + r);
        ctx.quadraticCurveTo(this.x, this.y, this.x + r, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 籃子紋路 (增加細節感)
        ctx.strokeStyle = 'rgba(46, 125, 50, 0.15)';
        ctx.lineWidth = 1.5;
        // 垂直線
        for (let i = 15; i < this.width; i += 15) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y + 5);
            ctx.lineTo(this.x + i, this.y + this.height - 5);
            ctx.stroke();
        }
        // 水平線
        for (let i = 15; i < this.height; i += 15) {
            ctx.beginPath();
            ctx.moveTo(this.x + 5, this.y + i);
            ctx.lineTo(this.x + this.width - 5, this.y + i);
            ctx.stroke();
        }

        // 提把
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y, this.width / 3, Math.PI, 0);
        ctx.stroke();

        ctx.restore();
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// --- 遊戲主循環與引擎 (Game) ---
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputHandler();

        this.score = 0;
        this.bestScore = Storage.get(Storage.keys.BEST_SCORE);
        this.totalMallDollar = Storage.get(Storage.keys.TOTAL_MALL_DOLLAR);

        this.coins = [];
        this.basket = null;
        this.lastSpawnTime = 0;
        this.currentSpawnInterval = CONFIG.SPAWN_INTERVAL;
        this.currentFallSpeed = CONFIG.INITIAL_FALL_SPEED;

        this.isRunning = false;
        this.isGameOver = false;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.basket = new Basket(this.canvas.width, this.canvas.height);

        // 更新初始 HUD
        this.updateHUD();

        // 綁定按鈕
        document.getElementById('restart-btn').onclick = () => this.restart();

        // Autorun: 0.5秒後開始
        setTimeout(() => {
            const indicator = document.getElementById('auto-start-indicator');
            if (indicator) indicator.classList.add('hidden');
            this.start();
        }, 800);
    }

    resize() {
        // 處理 Retina 高清屏
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentNode.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        // 更新 CSS 顯示大小
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // 重新定位籃子
        if (this.basket) {
            this.basket.y = rect.height - this.basket.height - 60;
        }
    }

    start() {
        this.isRunning = true;
        this.isGameOver = false;
        this.score = 0;
        this.currentFallSpeed = CONFIG.INITIAL_FALL_SPEED;
        this.currentSpawnInterval = CONFIG.SPAWN_INTERVAL;
        this.coins = [];
        this.updateHUD();
        requestAnimationFrame((t) => this.loop(t));
    }

    restart() {
        document.getElementById('overlay').classList.add('hidden');
        this.start();
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        this.update(timestamp);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(timestamp) {
        // 生成金幣
        if (timestamp - this.lastSpawnTime > this.currentSpawnInterval) {
            this.coins.push(new Coin(this.canvas.width / (window.devicePixelRatio || 1), this.currentFallSpeed));
            this.lastSpawnTime = timestamp;

            // 難度增加
            if (this.currentFallSpeed < CONFIG.MAX_SPEED) {
                this.currentFallSpeed += CONFIG.SPEED_INCREMENT;
            }
            if (this.currentSpawnInterval > CONFIG.MIN_SPAWN_INTERVAL) {
                this.currentSpawnInterval -= CONFIG.SPAWN_DECREMENT;
            }
        }

        // 更新籃子
        const rect = this.canvas.getBoundingClientRect();
        let currentInputX = this.basket.x + this.basket.width / 2;

        const useKeyboard = this.input.keys['ArrowLeft'] || this.input.keys['ArrowRight'];

        if (this.input.isTouch) {
            currentInputX = this.input.touchX - rect.left;
        } else {
            currentInputX = this.input.mouseX - rect.left;
        }

        this.basket.update(currentInputX, rect.width, useKeyboard, this.input.keys);

        // 更新金幣與碰撞檢測
        const basketBounds = this.basket.getBounds();

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.update();

            // 碰撞檢測 (簡單矩形檢測，或圓形/矩形檢測)
            if (coin.active &&
                coin.y + coin.radius > basketBounds.top &&
                coin.y - coin.radius < basketBounds.bottom &&
                coin.x + coin.radius > basketBounds.left &&
                coin.x - coin.radius < basketBounds.right) {

                // 接到金幣！
                coin.active = false;
                this.onCatch();
                this.coins.splice(i, 1);
            } else if (!coin.active) {
                // 漏接
                this.coins.splice(i, 1);
                // 如有生命值系統可以在此扣分，此版本為休閒版不扣分
            }
        }
    }

    onCatch() {
        this.score++;
        this.totalMallDollar++;

        // 即時保存總數
        Storage.set(Storage.keys.TOTAL_MALL_DOLLAR, this.totalMallDollar);

        // 更新高分紀錄
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            Storage.set(Storage.keys.BEST_SCORE, this.bestScore);
        }

        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('current-score').innerText = this.score;
        document.getElementById('total-mall-dollar').innerText = this.totalMallDollar.toLocaleString();
        document.getElementById('best-score').innerText = this.bestScore;
    }

    draw() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        this.ctx.clearRect(0, 0, width, height);

        // 畫籃子
        this.basket.draw(this.ctx);

        // 畫金幣
        this.coins.forEach(coin => coin.draw(this.ctx));
    }

    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;

        document.getElementById('overlay').classList.remove('hidden');
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('total-accumulated').innerText = this.totalMallDollar;
    }
}

// 啟動遊戲
window.onload = () => {
    new Game();
};
