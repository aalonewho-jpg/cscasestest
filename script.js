let currentBalance = 6;
let selectedAmount = { crystals: 0, stars: 0 };
let completedTasks = {
    channel: false,
    friend: false
};

// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
    
    // Получаем имя пользователя
    if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        document.getElementById('profile-name').textContent = user.first_name || 'Игрок';
    }
}

// Система страниц
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Обновляем активный пункт навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navMap = {
        'main-page': 0,
        'games-page': 1,
        'inventory-page': 2,
        'profile-page': 3
    };
    
    if (navMap[pageId] !== undefined) {
        document.querySelectorAll('.nav-item')[navMap[pageId]].classList.add('active');
    }
    
    // Загружаем кейсы при переходе на страницу игр
    if (pageId === 'games-page') {
        loadCases();
    }
    
    // Обновляем баланс в профиле
    if (pageId === 'profile-page') {
        document.getElementById('profile-balance').textContent = currentBalance + ' 💎';
    }
}

// Снежинки
const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

let snowflakes = [];

function createSnowflakes() {
    const count = 30;
    for (let i = 0; i < count; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.3,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function drawSnowflakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    snowflakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();
        
        flake.y += flake.speed;
        
        if (flake.y > canvas.height) {
            flake.y = 0;
            flake.x = Math.random() * canvas.width;
        }
    });
    
    requestAnimationFrame(drawSnowflakes);
}

// Инициализация снежинок
window.addEventListener('resize', () => {
    resizeCanvas();
    snowflakes = [];
    createSnowflakes();
});

resizeCanvas();
createSnowflakes();
drawSnowflakes();

// Задания
function completeTask(task) {
    if (completedTasks[task]) return;
    
    const rewards = {
        channel: 2000,
        friend: 5000
    };
    
    currentBalance += rewards[task];
    document.getElementById('balance-value').textContent = currentBalance;
    document.getElementById('profile-balance').textContent = currentBalance + ' 💎';
    
    completedTasks[task] = true;
    
    const btn = event.target;
    btn.textContent = 'ВЫПОЛНЕНО';
    btn.classList.add('completed');
}

// Пополнение
function selectAmount(crystals, stars) {
    selectedAmount = { crystals, stars };
    document.getElementById('selected-crystals').textContent = crystals.toLocaleString();
    document.getElementById('selected-stars').textContent = stars;
    document.getElementById('confirm-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('confirm-modal').classList.remove('active');
}

function confirmPayment() {
    // Имитация оплаты звездами
    currentBalance += selectedAmount.crystals;
    document.getElementById('balance-value').textContent = currentBalance;
    document.getElementById('profile-balance').textContent = currentBalance + ' 💎';
    
    // Добавляем скин в инвентарь за пополнение (для теста)
    addToInventory('Скин за пополнение');
    
    closeModal();
    showPage('main-page');
}

// Инвентарь
function addToInventory(itemName) {
    const inventory = document.querySelector('.inventory-grid');
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.innerHTML = `
        <div class="inventory-item-image" style="background: linear-gradient(45deg, #4facfe, #00f2fe)"></div>
        <div class="inventory-item-name">${itemName}</div>
    `;
    inventory.appendChild(item);
}

// Кейсы
function loadCases() {
    const casesContainer = document.getElementById('cases-section');
    
    const cases = [
        { name: 'ALLIN CASE', price: 750, image: '🎮' },
        { name: 'BLUECASE', price: 25000, image: '🔵' },
        { name: 'OLD SCHOOL', price: 87500, image: '🏫' },
        { name: 'RICH GUY', price: 1250000, image: '💰' },
        { name: 'BUDGET CASE', price: 15000, image: '💸' },
        { name: 'CONSUMER', price: 5000, image: '📦' }
    ];
    
    let html = '<div class="cases-grid">';
    cases.forEach(c => {
        html += `
            <div class="case-card" onclick="openCase('${c.name}')">
                <div class="case-image">${c.image}</div>
                <div class="case-name">${c.name}</div>
                <div class="case-price">${c.price.toLocaleString()} 💎</div>
            </div>
        `;
    });
    html += '</div>';
    
    casesContainer.innerHTML = html;
}

function openCase(caseName) {
    if (currentBalance < 750) {
        alert('Недостаточно алмазов!');
        return;
    }
    
    currentBalance -= 750;
    document.getElementById('balance-value').textContent = currentBalance;
    document.getElementById('profile-balance').textContent = currentBalance + ' 💎';
    
    // Рандомный скин
    const skins = [
        'AK-47 | Голограмма',
        'M4A4 | Ледяной дракон',
        'AWP | Градиент',
        'Desert Eagle | Кобальт',
        'USP-S | Белый снег',
        'Glock-18 | Мороз'
    ];
    
    const randomSkin = skins[Math.floor(Math.random() * skins.length)];
    addToInventory(randomSkin);
    
    alert(`Вы открыли кейс и получили: ${randomSkin}!`);
}

// Меню игр
function showGameSection(section) {
    document.querySelectorAll('.game-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(section + '-section').classList.add('active');
    
    if (section === 'cases') {
        loadCases();
    }
}

// Загружаем тестовые предметы в инвентарь
for (let i = 0; i < 3; i++) {
    addToInventory('Тестовый скин ' + (i + 1));
}