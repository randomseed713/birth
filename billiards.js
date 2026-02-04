const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const resultScreen = document.getElementById('resultScreen');

// 游戏配置
const config = {
    friction: 0.985,
    pocketRadius: 22,
    ballRadius: 14,
    tableMargin: 60
};

// 球袋位置（标准台球桌6个袋）
const pockets = [
    // 四个角袋
    { x: config.tableMargin, y: config.tableMargin },
    { x: canvas.width - config.tableMargin, y: config.tableMargin },
    { x: config.tableMargin, y: canvas.height - config.tableMargin },
    { x: canvas.width - config.tableMargin, y: canvas.height - config.tableMargin },
    // 两个中袋（左右两侧中间）
    { x: config.tableMargin, y: canvas.height / 2 },
    { x: canvas.width - config.tableMargin, y: canvas.height / 2 }
];

// 球
let balls = [];
let cueBall = null;
let aimAngle = 0;
let power = 0;
let maxPower = 15;
let score = 0;
let isAiming = false;
let aimingMode = 'direction'; // 'direction' 或 'power'
let isDraggingPower = false;

// 初始化游戏
function initGame() {
    // 白球（在下方开球区域）
    cueBall = {
        x: canvas.width / 2,
        y: canvas.height - 120,
        vx: 0,
        vy: 0,
        radius: config.ballRadius,
        color: '#ffffff',
        number: 0,
        isCue: true
    };
    
    // 彩球配置（4个球）
    const ballConfigs = [
        { color: '#FFD700', number: 1 },
        { color: '#FF0000', number: 2 },
        { color: '#0066CC', number: 3 },
        { color: '#800080', number: 4 }
    ];
    
    // 标准三角形排列（1-2-1）
    const startX = canvas.width / 2;
    const startY = 180;
    const spacing = config.ballRadius * 2 + 1;
    
    // 第一排（顶点，1个球）
    balls.push({
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        radius: config.ballRadius,
        color: ballConfigs[0].color,
        number: ballConfigs[0].number,
        isCue: false
    });
    
    // 第二排（2个球）
    balls.push({
        x: startX - spacing / 2,
        y: startY + spacing * 0.866,
        vx: 0,
        vy: 0,
        radius: config.ballRadius,
        color: ballConfigs[1].color,
        number: ballConfigs[1].number,
        isCue: false
    });
    
    balls.push({
        x: startX + spacing / 2,
        y: startY + spacing * 0.866,
        vx: 0,
        vy: 0,
        radius: config.ballRadius,
        color: ballConfigs[2].color,
        number: ballConfigs[2].number,
        isCue: false
    });
    
    // 第三排（1个球）
    balls.push({
        x: startX,
        y: startY + spacing * 0.866 * 2,
        vx: 0,
        vy: 0,
        radius: config.ballRadius,
        color: ballConfigs[3].color,
        number: ballConfigs[3].number,
        isCue: false
    });
    
    balls.push(cueBall);
}

// 绘制球桌
function drawTable() {
    // 外框（木质边框）
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#8B4513');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 台面
    const tableGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    tableGradient.addColorStop(0, '#1a8a5c');
    tableGradient.addColorStop(1, '#0d6b42');
    
    ctx.fillStyle = tableGradient;
    ctx.fillRect(
        config.tableMargin - 20,
        config.tableMargin - 20,
        canvas.width - (config.tableMargin - 20) * 2,
        canvas.height - (config.tableMargin - 20) * 2
    );
    
    // 边框装饰
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.strokeRect(
        config.tableMargin - 20,
        config.tableMargin - 20,
        canvas.width - (config.tableMargin - 20) * 2,
        canvas.height - (config.tableMargin - 20) * 2
    );
    
    // 绘制球袋
    pockets.forEach(pocket => {
        // 球袋阴影
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, config.pocketRadius + 3, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        // 球袋
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        const pocketGradient = ctx.createRadialGradient(
            pocket.x, pocket.y, 0,
            pocket.x, pocket.y, config.pocketRadius
        );
        pocketGradient.addColorStop(0, '#1a1a1a');
        pocketGradient.addColorStop(1, '#000000');
        ctx.fillStyle = pocketGradient;
        ctx.fill();
    });
}

// 绘制球
function drawBall(ball) {
    // 球的阴影
    ctx.beginPath();
    ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    
    // 球体渐变
    const gradient = ctx.createRadialGradient(
        ball.x - ball.radius / 3,
        ball.y - ball.radius / 3,
        0,
        ball.x,
        ball.y,
        ball.radius
    );
    
    if (ball.isCue) {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#f0f0f0');
        gradient.addColorStop(1, '#d0d0d0');
    } else {
        const lightColor = lightenColor(ball.color, 40);
        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.7, ball.color);
        gradient.addColorStop(1, darkenColor(ball.color, 30));
    }
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 球的高光
    ctx.beginPath();
    ctx.arc(ball.x - ball.radius / 3, ball.y - ball.radius / 3, ball.radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    
    // 数字
    if (!ball.isCue) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.number, ball.x, ball.y);
    }
}

// 绘制球杆
function drawCue() {
    if (!isAiming || !cueBall) return;
    
    const cueLength = 200;
    const pullBack = aimingMode === 'power' ? power * 4 : 0;
    const cueX = cueBall.x + Math.cos(aimAngle) * (cueBall.radius + 20 + pullBack);
    const cueY = cueBall.y + Math.sin(aimAngle) * (cueBall.radius + 20 + pullBack);
    const endX = cueX + Math.cos(aimAngle) * cueLength;
    const endY = cueY + Math.sin(aimAngle) * cueLength;
    
    // 球杆渐变
    const gradient = ctx.createLinearGradient(cueX, cueY, endX, endY);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.7, '#D2691E');
    gradient.addColorStop(1, '#F4A460');
    
    ctx.beginPath();
    ctx.moveTo(cueX, cueY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 瞄准线
    if (aimingMode === 'direction') {
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        const aimX = cueBall.x - Math.cos(aimAngle) * 150;
        const aimY = cueBall.y - Math.sin(aimAngle) * 150;
        ctx.lineTo(aimX, aimY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// 绘制力度条
function drawPowerBar() {
    if (!isAiming) return;
    
    const barX = canvas.width - 40;
    const barY = 100;
    const barWidth = 20;
    const barHeight = 300;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 力度
    if (aimingMode === 'power') {
        const powerHeight = (power / maxPower) * barHeight;
        const powerGradient = ctx.createLinearGradient(barX, barY + barHeight, barX, barY);
        powerGradient.addColorStop(0, '#00ff00');
        powerGradient.addColorStop(0.5, '#ffff00');
        powerGradient.addColorStop(1, '#ff0000');
        
        ctx.fillStyle = powerGradient;
        ctx.fillRect(barX, barY + barHeight - powerHeight, barWidth, powerHeight);
    }
    
    // 边框
    ctx.strokeStyle = aimingMode === 'power' ? '#ffff00' : '#ffffff';
    ctx.lineWidth = aimingMode === 'power' ? 3 : 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 提示文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    if (aimingMode === 'direction') {
        ctx.fillText('选方向', barX + barWidth / 2, barY - 10);
    } else {
        ctx.fillText('拉杆', barX + barWidth / 2, barY - 10);
    }
}

// 绘制
function draw() {
    drawTable();
    
    balls.forEach(ball => drawBall(ball));
    
    drawCue();
    drawPowerBar();
}

// 更新物理
function update() {
    let allStopped = true;
    
    balls.forEach(ball => {
        if (Math.abs(ball.vx) > 0.01 || Math.abs(ball.vy) > 0.01) {
            allStopped = false;
        }
        
        // 应用摩擦力
        ball.vx *= config.friction;
        ball.vy *= config.friction;
        
        // 更新位置
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // 边界碰撞
        const minX = config.tableMargin - 15 + ball.radius;
        const maxX = canvas.width - config.tableMargin + 15 - ball.radius;
        const minY = config.tableMargin - 15 + ball.radius;
        const maxY = canvas.height - config.tableMargin + 15 - ball.radius;
        
        if (ball.x < minX || ball.x > maxX) {
            ball.vx *= -0.8;
            ball.x = Math.max(minX, Math.min(maxX, ball.x));
        }
        if (ball.y < minY || ball.y > maxY) {
            ball.vy *= -0.8;
            ball.y = Math.max(minY, Math.min(maxY, ball.y));
        }
        
        // 停止慢速球
        if (Math.abs(ball.vx) < 0.05) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.05) ball.vy = 0;
    });
    
    // 球与球碰撞
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            checkCollision(balls[i], balls[j]);
        }
    }
    
    // 检查进洞
    balls = balls.filter(ball => {
        for (let pocket of pockets) {
            const dx = ball.x - pocket.x;
            const dy = ball.y - pocket.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < config.pocketRadius - 2) {
                if (ball.isCue) {
                    // 白球进洞，重新放置到开球位置
                    ball.x = canvas.width / 2;
                    ball.y = canvas.height - 120;
                    ball.vx = 0;
                    ball.vy = 0;
                    return true;
                } else {
                    score++;
                    scoreEl.textContent = score;
                    
                    if (score >= 4) {
                        // 保存游戏完成状态
                        localStorage.setItem('billiards_completed', 'true');
                        setTimeout(showResult, 1000);
                    }
                    return false;
                }
            }
        }
        return true;
    });
    
    // 所有球停止后可以再次瞄准
    if (allStopped && !isAiming) {
        isAiming = true;
        aimingMode = 'direction';
        power = 0;
    }
}

// 碰撞检测
function checkCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < ball1.radius + ball2.radius) {
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        
        const vx1 = ball1.vx * cos + ball1.vy * sin;
        const vy1 = ball1.vy * cos - ball1.vx * sin;
        const vx2 = ball2.vx * cos + ball2.vy * sin;
        const vy2 = ball2.vy * cos - ball2.vx * sin;
        
        const finalVx1 = ((ball1.radius - ball2.radius) * vx1 + 2 * ball2.radius * vx2) / (ball1.radius + ball2.radius);
        const finalVx2 = ((ball2.radius - ball1.radius) * vx2 + 2 * ball1.radius * vx1) / (ball1.radius + ball2.radius);
        
        ball1.vx = finalVx1 * cos - vy1 * sin;
        ball1.vy = vy1 * cos + finalVx1 * sin;
        ball2.vx = finalVx2 * cos - vy2 * sin;
        ball2.vy = vy2 * cos + finalVx2 * sin;
        
        const overlap = ball1.radius + ball2.radius - dist;
        const separateX = overlap * cos / 2;
        const separateY = overlap * sin / 2;
        ball1.x -= separateX;
        ball1.y -= separateY;
        ball2.x += separateX;
        ball2.y += separateY;
    }
}

// 颜色工具函数
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// 鼠标/触摸事件
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

let startPos = null;

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('touchstart', handleStart);

function handleStart(e) {
    e.preventDefault();
    if (!isAiming || !cueBall) return;
    
    const pos = getPos(e);
    startPos = pos;
    
    if (aimingMode === 'direction') {
        // 选择方向模式
        const dx = pos.x - cueBall.x;
        const dy = pos.y - cueBall.y;
        aimAngle = Math.atan2(dy, dx);
    } else if (aimingMode === 'power') {
        // 选择力度模式
        isDraggingPower = true;
        power = 0;
    }
}

canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove);

function handleMove(e) {
    e.preventDefault();
    if (!isAiming || !cueBall || !startPos) return;
    
    const pos = getPos(e);
    
    if (aimingMode === 'direction') {
        // 旋转选择方向
        const dx = pos.x - cueBall.x;
        const dy = pos.y - cueBall.y;
        aimAngle = Math.atan2(dy, dx);
    } else if (aimingMode === 'power' && isDraggingPower) {
        // 拖动选择力度
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        power = Math.min(dist / 15, maxPower);
    }
}

canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchend', handleEnd);

function handleEnd(e) {
    e.preventDefault();
    if (!isAiming || !cueBall) return;
    
    if (aimingMode === 'direction') {
        // 确认方向，进入力度选择
        aimingMode = 'power';
        power = 0;
    } else if (aimingMode === 'power' && isDraggingPower) {
        // 确认力度，击球
        if (power > 0.5) {
            cueBall.vx = -Math.cos(aimAngle) * power * 0.8;
            cueBall.vy = -Math.sin(aimAngle) * power * 0.8;
            
            isAiming = false;
            aimingMode = 'direction';
            power = 0;
        }
        isDraggingPower = false;
    }
    
    startPos = null;
}

// 显示结果
function showResult() {
    canvas.style.display = 'none';
    document.querySelector('.game-header').style.display = 'none';
    resultScreen.classList.add('show');
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 启动游戏
initGame();
isAiming = true;
gameLoop();
