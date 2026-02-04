// 重要日期
const metDate = new Date('2025-11-16');
const togetherDate = new Date('2025-12-07');
const birthdayDate = new Date('2026-02-05');

// 数字动画函数
function animateNumber(element, targetNumber, duration = 1000) {
    const startNumber = parseInt(element.textContent) || 0;
    const increment = (targetNumber - startNumber) / (duration / 16);
    let currentNumber = startNumber;
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if ((increment > 0 && currentNumber >= targetNumber) || 
            (increment < 0 && currentNumber <= targetNumber)) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentNumber);
    }, 16);
}

// 计算天数差
function calculateDays(startDate, endDate) {
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// 添加粒子效果
function createParticles() {
    const container = document.querySelector('.container');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #f093fb, #f5576c);
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
            animation-delay: ${Math.random() * 2}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        container.appendChild(particle);
    }
    
    // 添加浮动动画CSS
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 更新倒计时
function updateCountdown() {
    const now = new Date();
    
    // 相识天数
    const metDays = calculateDays(metDate, now);
    const metElement = document.getElementById('metDays');
    if (metElement.textContent !== metDays.toString()) {
        animateNumber(metElement, metDays);
    }
    
    // 在一起天数
    const togetherDays = calculateDays(togetherDate, now);
    const togetherElement = document.getElementById('togetherDays');
    if (togetherElement.textContent !== togetherDays.toString()) {
        animateNumber(togetherElement, togetherDays);
    }
    
    // 生日倒计时
    const birthdayCountdown = calculateDays(now, birthdayDate);
    const birthdayElement = document.getElementById('birthdayCountdown');
    if (birthdayElement.textContent !== birthdayCountdown.toString()) {
        animateNumber(birthdayElement, birthdayCountdown);
    }
    
    // 显示特殊消息
    const messageEl = document.getElementById('message');
    let newMessage = '';
    
    if (birthdayCountdown === 0) {
        newMessage = '🎉 今天是你的生日！生日快乐！🎉';
        createParticles(); // 生日当天添加粒子效果
    } else if (birthdayCountdown === 1) {
        newMessage = '✨ 明天就是你的生日啦！好期待~ ✨';
    } else if (birthdayCountdown < 0) {
        newMessage = '💕 每一天和你在一起都是最好的礼物 💕';
    } else if (birthdayCountdown <= 7) {
        newMessage = `🎂 还有 ${birthdayCountdown} 天就是你的生日了！倒计时开始~ 🎂`;
    } else {
        newMessage = `💖 距离你的生日还有 ${birthdayCountdown} 天，期待那个特殊的日子！💖`;
    }
    
    if (messageEl.textContent !== newMessage) {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            messageEl.textContent = newMessage;
            messageEl.style.opacity = '1';
        }, 300);
    }
}

// 添加游戏完成状态检查和按钮控制函数
function checkGameAndNavigate() {
    const gameCompleted = localStorage.getItem('billiards_completed');
    if (gameCompleted === 'true') {
        location.href = 'wheel.html';
    } else {
        alert('🎱 请先完成台球游戏才能抽取礼物哦！');
    }
}

// 更新抽礼物按钮状态
function updateWheelButtonState() {
    const wheelButton = document.getElementById('wheelButton');
    const gameCompleted = localStorage.getItem('billiards_completed');
    
    if (gameCompleted === 'true') {
        wheelButton.style.opacity = '1';
        wheelButton.style.cursor = 'pointer';
        wheelButton.title = '点击抽取生日礼物';
    } else {
        wheelButton.style.opacity = '0.6';
        wheelButton.style.cursor = 'not-allowed';
        wheelButton.title = '请先完成台球游戏';
    }
}

// 添加页面加载动画
function initPageAnimations() {
    const cards = document.querySelectorAll('.countdown-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        setTimeout(() => {
            card.style.transition = 'all 0.8s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    initPageAnimations();
    updateWheelButtonState(); // 更新抽礼物按钮状态
    
    // 每秒更新一次
    setInterval(updateCountdown, 1000);
    
    // 每小时检查一次是否需要粒子效果
    setInterval(() => {
        const now = new Date();
        const birthdayCountdown = calculateDays(now, birthdayDate);
        if (birthdayCountdown === 0) {
            createParticles();
        }
    }, 3600000);
});
