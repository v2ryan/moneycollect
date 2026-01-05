/**
 * Mall Dollar Coin Catching Game - Version 2.0
 * 支援等級系統、全方位移動、漏接限制
 */

// --- 配置與常數 ---
const CONFIG = {
    COIN_SIZE: 40,
    BASKET_WIDTH: 80,
    BASKET_HEIGHT: 60,
    INITIAL_FALL_SPEED: 3,
    MAX_SPEED: 15,
    LEVEL_DURATION: 10000, // 10秒一關
    MAX_MISSES: 3,
    SPAWN_INTERVAL_BASE: 1200,
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
        this.posX = 0;
        this.posY = 0;
        this.isTouch = false;
        this.keys = {};

        window.addEventListener('mousemove', e => {
            this.posX = e.clientX;
            this.posY = e.clientY;
        });
        window.addEventListener('touchmove', e => {
            this.isTouch = true;
            this.posX = e.touches[0].clientX;
            this.posY = e.touches[0].clientY;
        }, { passive: false });

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
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, '#FFF176');
        grad.addColorStop(0.7, '#FFD600');
        grad.addColorStop(1, '#F57F17');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#F9A825';
        ctx.lineWidth = 2;
        ctx.stroke();
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
        this.y = canvasHeight - this.height - 100;
        this.targetX = this.x;
        this.targetY = this.y;
        this.smoothing = 0.2;
    }

    update(inputX, inputY, canvasWidth, canvasHeight, useKeys, keys) {
        if (useKeys) {
            const speed = 8;
            if (keys['ArrowLeft']) this.targetX -= speed;
            if (keys['ArrowRight']) this.targetX += speed;
            if (keys['ArrowUp']) this.targetY -= speed;
            if (keys['ArrowDown']) this.targetY += speed;
        } else {
            this.targetX = inputX - this.width / 2;
            this.targetY = inputY - this.height / 2;
        }

        // 限制移動範圍 (底部 40% 區域)
        const minY = canvasHeight * 0.6;
        const maxY = canvasHeight - this.height - 20;

        if (this.targetX < 0) this.targetX = 0;
        if (this.targetX > canvasWidth - this.width) this.targetX = canvasWidth - this.width;
        if (this.targetY < minY) this.targetY = minY;
        if (this.targetY > maxY) this.targetY = maxY;

        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
    }

    draw(ctx) {
        ctx.save();

        // 畫一個更精美的購物袋/籃子
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;
        const r = 8;

        // 陰影
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 10;

        // 漸變袋身
        const bgGrad = ctx.createLinearGradient(x, y, x, y + h);
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(1, '#f0f0f0');
        ctx.fillStyle = bgGrad;
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w * 0.95, y + h - r);
        ctx.quadraticCurveTo(x + w * 0.95, y + h, x + w * 0.95 - r, y + h);
        ctx.lineTo(x + w * 0.05 + r, y + h);
        ctx.quadraticCurveTo(x + w * 0.05, y + h, x + w * 0.05, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 裝飾線條 (高級感)
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(46, 125, 50, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 15; i < w; i += 15) {
            ctx.beginPath();
            ctx.moveTo(x + i, y + 5);
            ctx.lineTo(x + i + (i > w / 2 ? -5 : 5), y + h - 5);
            ctx.stroke();
        }

        // 提把 (立體感)
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x + w / 2, y, w / 3.5, Math.PI, 0);
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

// --- 遊戲主引擎 ---
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputHandler();

        this.score = 0;
        this.bestScore = Storage.get(Storage.keys.BEST_SCORE);
        this.totalMallDollar = Storage.get(Storage.keys.TOTAL_MALL_DOLLAR);

        this.level = 1;
        this.levelMisses = 0;
        this.levelStartTime = 0;

        this.coins = [];
        this.basket = null;
        this.lastSpawnTime = 0;
        this.currentFallSpeed = CONFIG.INITIAL_FALL_SPEED;

        this.isRunning = false;
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.basket = new Basket(this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        document.getElementById('restart-btn').onclick = () => this.restart();

        this.updateHUD();
        setTimeout(() => {
            document.getElementById('auto-start-indicator').classList.add('hidden');
            this.start();
        }, 1000);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentNode.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        if (this.basket) {
            this.basket.targetY = rect.height - this.basket.height - 100;
        }
    }

    start() {
        this.isRunning = true;
        this.score = 0;
        this.level = 1;
        this.levelMisses = 0;
        this.levelStartTime = performance.now();
        this.currentFallSpeed = CONFIG.INITIAL_FALL_SPEED;
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
        // 等級計時 (10秒升一級)
        const elapsed = timestamp - this.levelStartTime;
        if (elapsed > CONFIG.LEVEL_DURATION) {
            this.nextLevel(timestamp);
        }

        // 生成金幣
        const spawnInterval = Math.max(400, CONFIG.SPAWN_INTERVAL_BASE - (this.level * 80));
        if (timestamp - this.lastSpawnTime > spawnInterval) {
            this.coins.push(new Coin(this.canvas.width / window.devicePixelRatio, this.currentFallSpeed));
            this.lastSpawnTime = timestamp;
        }

        // 更新籃子
        const rect = this.canvas.getBoundingClientRect();
        const useKeys = this.input.keys['ArrowLeft'] || this.input.keys['ArrowRight'] || this.input.keys['ArrowUp'] || this.input.keys['ArrowDown'];
        this.basket.update(this.input.posX - rect.left, this.input.posY - rect.top, rect.width, rect.height, useKeys, this.input.keys);

        // 更新金幣與碰撞
        const basketBounds = this.basket.getBounds();
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.update();

            // 碰撞檢測
            if (coin.active &&
                coin.y + coin.radius > basketBounds.top &&
                coin.y - coin.radius < basketBounds.bottom &&
                coin.x + coin.radius > basketBounds.left &&
                coin.x - coin.radius < basketBounds.right) {

                coin.active = false;
                this.score++;
                this.totalMallDollar++;
                Storage.set(Storage.keys.TOTAL_MALL_DOLLAR, this.totalMallDollar);
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    Storage.set(Storage.keys.BEST_SCORE, this.bestScore);
                }
                this.coins.splice(i, 1);
                this.updateHUD();
            } else if (!coin.active) {
                // 漏接！
                this.levelMisses++;
                this.coins.splice(i, 1);
                this.updateHUD();

                if (this.levelMisses >= CONFIG.MAX_MISSES) {
                    this.gameOver();
                }
            }
        }
    }

    nextLevel(timestamp) {
        this.level++;
        this.levelMisses = 0; // 升級後重置漏接數
        this.levelStartTime = timestamp;
        this.currentFallSpeed = Math.min(CONFIG.MAX_SPEED, this.currentFallSpeed + 1.2);
        this.updateHUD();

        // 簡單提示
        const msg = document.createElement('div');
        msg.innerText = `LEVEL ${this.level}`;
        msg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-size:40px;font-weight:bold;text-shadow:2px 2px 10px rgba(0,0,0,0.5);pointer-events:none;animation: fadeOut 1s forwards;';
        document.getElementById('game-container').appendChild(msg);
        setTimeout(() => msg.remove(), 1000);
    }

    updateHUD() {
        document.getElementById('level-val').innerText = this.level;
        document.getElementById('miss-val').innerText = `${this.levelMisses} / ${CONFIG.MAX_MISSES}`;
        document.getElementById('current-score').innerText = this.score;
        document.getElementById('best-score').innerText = this.bestScore;
    }

    draw() {
        const dpr = window.devicePixelRatio || 1;
        const w = this.canvas.width / dpr;
        const h = this.canvas.height / dpr;
        this.ctx.clearRect(0, 0, w, h);
        this.basket.draw(this.ctx);
        this.coins.forEach(c => c.draw(this.ctx));
    }

    gameOver() {
        this.isRunning = false;
        document.getElementById('overlay-title').innerText = '遊戲結束';
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('total-accumulated').innerText = this.totalMallDollar;
        document.getElementById('overlay').classList.remove('hidden');
    }
}

// 動畫擴充
const style = document.createElement('style');
style.textContent = `@keyframes fadeOut { from { opacity: 1; transform: translate(-50%,-50%) scale(1); } to { opacity: 0; transform: translate(-50%,-50%) scale(2); } }`;
document.head.appendChild(style);

window.onload = () => new Game();
