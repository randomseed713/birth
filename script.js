// 礼物选项 - 可以自定义修改
const gifts = [
    { name: '可随时兑换的空白支票', color: '#FF6B6B' },
    { name: '承包一辈子洗头', color: '#4ECDC4' },
    { name: '每年生日给老婆手写一封情书', color: '#FFE66D' },
    { name: '陪老婆去任何想去的地方', color: '#95E1D3' },
    { name: '临睡和醒来，永远是"老婆"', color: '#F38181' },
    { name: '永远给状态不好的老婆充电', color: '#AA96DA' },
    { name: '🎁 神秘礼物', color: '#FCBAD3' },
    { name: '永远不让你哭', color: '#A8E6CF' }
];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');

let currentRotation = 0;
let isSpinning = false;
let animationId = null;

// 添加闪烁效果
function addSparkleEffect() {
    const sparkles = [];
    for (let i = 0; i < 15; i++) {
        sparkles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4 + 2,
            opacity: Math.random(),
            speed: Math.random() * 0.02 + 0.01
        });
    }
    
    function animateSparkles() {
        ctx.save();
        sparkles.forEach(sparkle => {
            ctx.globalAlpha = Math.sin(Date.now() * sparkle.speed) * 0.5 + 0.5;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    
    return animateSparkles;
}

// 绘制转盘
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 20;
    const anglePerGift = (2 * Math.PI) / gifts.length;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gifts.forEach((gift, index) => {
        const startAngle = index * anglePerGift + currentRotation;
        const endAngle = startAngle + anglePerGift;

        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // 创建渐变效果
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, gift.color);
        gradient.addColorStop(1, darkenColor(gift.color, 20));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerGift / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px SF Pro Display, -apple-system, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(gift.name, radius * 0.7, 5);
        ctx.restore();
    });

    // 绘制中心圆
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
    centerGradient.addColorStop(0, '#fff');
    centerGradient.addColorStop(1, '#f0f0f0');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 中心装饰
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 20px SF Pro Display, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎁', centerX, centerY + 7);
}

// 颜色工具函数
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// 开始旋转
function spin() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = '旋转中...';
    resultDiv.textContent = '';

    // 随机旋转圈数和角度
    const spinDuration = 4000; // 4秒
    const minSpins = 6;
    const maxSpins = 10;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const randomAngle = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + randomAngle;
    
    const startTime = Date.now();
    const startRotation = currentRotation;
    const sparkleEffect = addSparkleEffect();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // 更复杂的缓动函数 (ease-out-back)
        const easeOutBack = 1 + 2.7 * Math.pow(progress - 1, 3) + 1.7 * Math.pow(progress - 1, 2);
        const easedProgress = progress < 1 ? easeOutBack : 1;
        
        currentRotation = startRotation + totalRotation * easedProgress;
        
        drawWheel();
        
        // 添加旋转时的闪烁效果
        if (progress < 0.8) {
            sparkleEffect();
        }

        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            // 旋转结束，显示结果
            currentRotation = currentRotation % (Math.PI * 2);
            showResult();
            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.textContent = '再次抽奖';
        }
    }

    animate();
}

// 显示结果
function showResult() {
    const anglePerGift = (2 * Math.PI) / gifts.length;
    const pointerAngle = Math.PI * 1.5; // 顶部位置
    const normalizedRotation = (pointerAngle - currentRotation) % (2 * Math.PI);
    const adjustedRotation = normalizedRotation < 0 ? normalizedRotation + (2 * Math.PI) : normalizedRotation;
    const winningIndex = Math.floor(adjustedRotation / anglePerGift) % gifts.length;
    const winner = gifts[winningIndex];
    
    // 添加结果显示动画
    resultDiv.style.opacity = '0';
    resultDiv.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        resultDiv.textContent = `🎉 恭喜获得：${winner.name} 🎉`;
        resultDiv.style.transition = 'all 0.5s ease-out';
        resultDiv.style.opacity = '1';
        resultDiv.style.transform = 'scale(1)';
        
        // 添加庆祝效果
        createCelebration();
    }, 500);
}

// 庆祝效果
function createCelebration() {
    const container = document.querySelector('.container');
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: ${['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'][Math.floor(Math.random() * 4)]};
            border-radius: 50%;
            pointer-events: none;
            animation: confetti ${2 + Math.random() * 2}s ease-out forwards;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
    
    // 添加庆祝动画CSS
    if (!document.getElementById('celebration-styles')) {
        const style = document.createElement('style');
        style.id = 'celebration-styles';
        style.textContent = `
            @keyframes confetti {
                0% { 
                    transform: translate(-50%, -50%) rotate(0deg);
                    opacity: 1;
                }
                100% { 
                    transform: translate(${-200 + Math.random() * 400}px, ${200 + Math.random() * 200}px) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化
drawWheel();

// 绑定事件
spinBtn.addEventListener('click', spin);

// 响应式调整
window.addEventListener('resize', () => {
    const size = Math.min(500, window.innerWidth - 100);
    canvas.width = size;
    canvas.height = size;
    drawWheel();
});

// 绑定事件
spinBtn.addEventListener('click', spin);

// 响应式调整
window.addEventListener('resize', () => {
    const size = Math.min(500, window.innerWidth - 100);
    canvas.width = size;
    canvas.height = size;
    drawWheel();
});
