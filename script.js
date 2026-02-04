// 礼物选项 - 可以自定义修改
const gifts = [
    { name: '🏖️ 海边度假', color: '#FF6B6B' },
    { name: '🍽️ 米其林晚餐', color: '#4ECDC4' },
    { name: '💆 SPA按摩', color: '#FFE66D' },
    { name: '🎬 看电影约会', color: '#95E1D3' },
    { name: '🎨 一起画画', color: '#F38181' },
    { name: '🌃 夜景散步', color: '#AA96DA' },
    { name: '🎁 神秘礼物', color: '#FCBAD3' },
    { name: '� 演唱会', color: '#A8E6CF' }
];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');

let currentRotation = 0;
let isSpinning = false;

// 绘制转盘
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    const anglePerGift = (2 * Math.PI) / gifts.length;

    gifts.forEach((gift, index) => {
        const startAngle = index * anglePerGift + currentRotation;
        const endAngle = startAngle + anglePerGift;

        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = gift.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerGift / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(gift.name, radius * 0.65, 5);
        ctx.restore();
    });

    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// 开始旋转
function spin() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    resultDiv.textContent = '';

    // 随机旋转圈数和角度
    const spinDuration = 3000; // 3秒
    const minSpins = 5;
    const maxSpins = 8;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const randomAngle = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + randomAngle;
    
    const startTime = Date.now();
    const startRotation = currentRotation;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // 缓动函数 (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startRotation + totalRotation * easeOut;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 旋转结束，显示结果
            currentRotation = currentRotation % (Math.PI * 2);
            showResult();
            isSpinning = false;
            spinBtn.disabled = false;
        }
    }

    animate();
}

// 显示结果
function showResult() {
    const anglePerGift = (2 * Math.PI) / gifts.length;
    // 指针在顶部（270度位置），计算当前指向的礼物
    // 需要加上90度（Math.PI/2）来对齐到顶部指针
    const pointerAngle = Math.PI * 1.5; // 顶部位置
    const normalizedRotation = (pointerAngle - currentRotation) % (2 * Math.PI);
    const adjustedRotation = normalizedRotation < 0 ? normalizedRotation + (2 * Math.PI) : normalizedRotation;
    const winningIndex = Math.floor(adjustedRotation / anglePerGift) % gifts.length;
    const winner = gifts[winningIndex];
    
    resultDiv.textContent = `🎉 恭喜获得：${winner.name} 🎉`;
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
