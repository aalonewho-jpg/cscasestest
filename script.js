// Telegram WebApp
const tg = window.Telegram?.WebApp;
tg?.expand();
tg?.ready();

// Данные пользователя
let userId = tg?.initDataUnsafe?.user?.id || Math.floor(Math.random() * 1000000);
let balance = 6;
let inventory = [];
let selectedSkinForUpgrade = null;
let selectedMultiplier = 1;
let lastOpenedSkin = null;
let referrals = JSON.parse(localStorage.getItem('refs_' + userId)) || 0;
let completedTasks = JSON.parse(localStorage.getItem('tasks_' + userId)) || {
    channel: false,
    ref: false
};

// База скинов
const skins = [
    { id: 1, name: 'AK-47 | Голограмма', price: 2500, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/ak47_gs_holo_light_1.png' },
    { id: 2, name: 'M4A4 | Ледяной дракон', price: 3500, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/m4a1_gs_ice_1.png' },
    { id: 3, name: 'AWP | Градиент', price: 5000, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/awp_gs_fade_1.png' },
    { id: 4, name: 'Desert Eagle | Кобальт', price: 1800, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/deagle_gs_cobalt_1.png' },
    { id: 5, name: 'USP-S | Белый снег', price: 1200, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/usp_s_gs_snow_1.png' },
    { id: 6, name: 'Glock-18 | Мороз', price: 1500, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/glock_gs_frost_1.png' },
    { id: 7, name: 'SSG 08 | Кровавый', price: 2200, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/ssg08_gs_blood_1.png' },
    { id: 8, name: 'FAMAS | Механика', price: 2000, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/famas_gs_mech_1.png' }
];

// Кейсы
const cases = [
    { name: 'ALLIN CASE', price: 750, image: 'https://i.imgur.com/Qk2qYvM.png', skins: skins.slice(0, 4) },
    { name: 'BLUECASE', price: 25000, image: 'https://i.imgur.com/9zZrQqY.png', skins: skins.slice(2, 6) },
    { name: 'OLD SCHOOL', price: 87500, image: 'https://i.imgur.com/NkYqWvL.png', skins: skins.slice(1, 5) },
    { name: 'RICH GUY', price: 1250000, image: 'https://i.imgur.com/LmYqZwK.png', skins: skins.slice(3, 7) },
    { name: 'BUDGET CASE', price: 15000, image: 'https://i.imgur.com/RkYqXvJ.png', skins: skins.slice(0, 3) },
    { name: 'CONSUMER', price: 5000, image: 'https://i.imgur.com/VkYqYvN.png', skins: skins.slice(4, 8) }
];

// Загрузка инвентаря
function loadInventory() {
    const saved = localStorage.getItem('inventory_' + userId);
    if (saved) {
        inventory = JSON.parse(saved);
    } else {
        // Тестовые скины для начала
        inventory = [
            { ...skins[0], id: Date.now() + 1 },
            { ...skins[2], id: Date.now() + 2 }
        ];
    }
    updateInventoryDisplay();
}

// Сохранение инвентаря
function saveInventory() {
    localStorage.setItem('inventory_' + userId, JSON.stringify(inventory));
}

// Обновление отображения инвентаря
function updateInventoryDisplay() {
    const grid = document.getElementById('inventory-grid');
    const upgradeSelect = document.getElementById('upgrade-select');
    
    if (grid) {
        grid.innerHTML = inventory.map(skin => `
            <div class="inventory-item" onclick="selectSkinForSale(${skin.id})">
                <div class="inventory-item-img" style="background-image: url('${skin.image}')"></div>
                <div class="inventory-item-name">${skin.name}</div>
                <div class="inventory-item-price">${skin.price} 💎</div>
            </div>
        `).join('');
    }
    
    if (upgradeSelect) {
        upgradeSelect.innerHTML = inventory.map(skin => `
            <div class="inventory-item ${selectedSkinForUpgrade?.id === skin.id ? 'active' : ''}" 
                 onclick="selectSkinForUpgrade(${skin.id})">
                <div class="inventory-item-img" style="background-image: url('${skin.image}')"></div>
                <div class="inventory-item-name">${skin.name}</div>
                <div class="inventory-item-price">${skin.price} 💎</div>
            </div>
        `).join('');
    }
    
    document.getElementById('balance').textContent = balance;
    document.getElementById('profile-balance').textContent = balance + ' 💎';
    document.getElementById('ref-count').textContent = referrals;
    document.getElementById('user-id').textContent = userId;
}

// Навигация по страницам
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active', 
            (pageId === 'main-page' && i === 0) ||
            (pageId === 'games' && i === 1) ||
            (pageId === 'inventory' && i === 2) ||
            (pageId === 'profile' && i === 3)
        );
    });
    
    if (pageId === 'games') loadCases();
    if (pageId === 'inventory') updateInventoryDisplay();
}

// Загрузка кейсов
function loadCases() {
    const grid = document.getElementById('cases-grid');
    grid.innerHTML = cases.map(c => `
        <div class="case-card" onclick="openCase('${c.name}')">
            <div class="case-img" style="background-image: url('${c.image}')"></div>
            <div class="case-name">${c.name}</div>
            <div class="case-price">${c.price.toLocaleString()} 💎</div>
        </div>
    `).join('');
}

// Открытие кейса
function openCase(caseName) {
    const caseData = cases.find(c => c.name === caseName);
    
    if (balance < caseData.price) {
        alert('❌ Недостаточно алмазов!');
        return;
    }
    
    balance -= caseData.price;
    document.getElementById('balance').textContent = balance;
    
    // Анимация открытия
    const modal = document.getElementById('case-modal');
    const roulette = document.getElementById('roulette-items');
    
    // Создаем полосу скинов для рулетки
    const items = [];
    for (let i = 0; i < 20; i++) {
        items.push(caseData.skins[Math.floor(Math.random() * caseData.skins.length)]);
    }
    
    // Выбираем выигрышный скин
    const winIndex = Math.floor(Math.random() * caseData.skins.length);
    lastOpenedSkin = { ...caseData.skins[winIndex], id: Date.now() };
    
    // Добавляем его в середину для реалистичности
    items[10] = lastOpenedSkin;
    
    roulette.innerHTML = items.map(skin => `
        <div class="roulette-item" style="background-image: url('${skin.image}')">
            ${skin.name.substring(0, 3)}
        </div>
    `).join('');
    
    document.getElementById('result-skin').innerHTML = `
        <div style="background-image: url('${lastOpenedSkin.image}'); width: 60px; height: 60px; background-size: cover; margin: 0 auto 10px;"></div>
        ${lastOpenedSkin.name}
    `;
    
    modal.classList.add('active');
    
    // Сохраняем баланс
    saveBalance();
}

// Продажа скина после открытия
function sellSkin() {
    const price = Math.floor(lastOpenedSkin.price * 0.7); // 70% стоимости
    balance += price;
    saveBalance();
    document.getElementById('case-modal').classList.remove('active');
    alert(`✅ Скин продан за ${price} 💎`);
}

// Отправить в апгрейд
function sendToUpgrade() {
    document.getElementById('case-modal').classList.remove('active');
    inventory.push(lastOpenedSkin);
    saveInventory();
    showPage('games');
    showGame('upgrades');
    selectSkinForUpgrade(lastOpenedSkin.id);
}

// Оставить скин
function keepSkin() {
    inventory.push(lastOpenedSkin);
    saveInventory();
    document.getElementById('case-modal').classList.remove('active');
    updateInventoryDisplay();
}

// Выбор скина для продажи
let selectedSellSkin = null;

function selectSkinForSale(skinId) {
    selectedSellSkin = inventory.find(s => s.id === skinId);
    const price = Math.floor(selectedSellSkin.price * 0.7);
    document.getElementById('sell-price').textContent = price;
    document.getElementById('sell-modal').classList.add('active');
}

// Подтверждение продажи
function confirmSell() {
    if (selectedSellSkin) {
        const price = Math.floor(selectedSellSkin.price * 0.7);
        inventory = inventory.filter(s => s.id !== selectedSellSkin.id);
        balance += price;
        saveInventory();
        saveBalance();
        closeSellModal();
        updateInventoryDisplay();
        alert(`✅ Скин продан за ${price} 💎`);
    }
}

function closeSellModal() {
    document.getElementById('sell-modal').classList.remove('active');
    selectedSellSkin = null;
}

// Апгрейды
function selectSkinForUpgrade(skinId) {
    selectedSkinForUpgrade = inventory.find(s => s.id === skinId);
    document.getElementById('upgrade-btn').disabled = false;
    updateInventoryDisplay();
}

function selectMultiplier(mult) {
    selectedMultiplier = mult;
    document.querySelectorAll('.multi-btn').forEach((btn, i) => {
        btn.classList.toggle('active', [1,2,5,10][i] === mult);
    });
}

function startUpgrade() {
    if (!selectedSkinForUpgrade) {
        alert('❌ Выбери скин');
        return;
    }
    
    const modal = document.getElementById('upgrade-modal');
    const wheel = document.getElementById('upgrade-wheel');
    const resultText = document.getElementById('upgrade-result');
    
    // Удаляем скин из инвентаря
    inventory = inventory.filter(s => s.id !== selectedSkinForUpgrade.id);
    saveInventory();
    
    // Запускаем анимацию
    wheel.style.animation = 'none';
    wheel.offsetHeight;
    wheel.style.animation = 'spin 3s ease-out forwards';
    
    modal.classList.add('active');
    
    // Определяем результат через 3 секунды
    setTimeout(() => {
        const win = Math.random() > 0.5; // 50% шанс
        
        if (win) {
            // Апгрейд скина
            const newPrice = selectedSkinForUpgrade.price * selectedMultiplier;
            const upgradedSkin = {
                ...selectedSkinForUpgrade,
                id: Date.now(),
                price: newPrice,
                name: selectedSkinForUpgrade.name + ` +${selectedMultiplier}x`
            };
            inventory.push(upgradedSkin);
            resultText.innerHTML = '🎉 ВЫИГРЫШ!';
            resultText.style.color = '#2ecc71';
        } else {
            resultText.innerHTML = '💥 СГОРЕЛ!';
            resultText.style.color = '#e74c3c';
        }
        
        saveInventory();
        updateInventoryDisplay();
    }, 3000);
}

function closeUpgradeModal() {
    document.getElementById('upgrade-modal').classList.remove('active');
    selectedSkinForUpgrade = null;
    document.getElementById('upgrade-btn').disabled = true;
}

// Проверка подписки на канал
async function checkSubscription() {
    if (completedTasks.channel) {
        alert('✅ Задание уже выполнено!');
        return;
    }
    
    try {
        // Отправляем запрос боту для проверки подписки
        tg?.sendData(JSON.stringify({
            action: 'check_sub',
            user_id: userId,
            channel: '@alonewhat'
        }));
        
        // Имитация ответа (в реальности бот ответит)
        setTimeout(() => {
            balance += 2000;
            completedTasks.channel = true;
            localStorage.setItem('tasks_' + userId, JSON.stringify(completedTasks));
            document.querySelector('#task-channel .task-btn').classList.add('completed');
            document.querySelector('#task-channel .task-btn').textContent = 'ВЫПОЛНЕНО';
            saveBalance();
            alert('✅ +2000 💎 получены!');
        }, 1000);
    } catch (e) {
        alert('❌ Ошибка проверки');
    }
}

// Приглашение друга
function inviteFriend() {
    const refLink = `https://t.me/share/url?url=https://t.me/YourBot?start=${userId}`;
    tg?.openTelegramLink(refLink);
}

// Добавление реферала (будет вызываться из бота)
function addReferral() {
    referrals++;
    localStorage.setItem('refs_' + userId, JSON.stringify(referrals));
    
    if (!completedTasks.ref && referrals >= 1) {
        balance += 5000;
        completedTasks.ref = true;
        localStorage.setItem('tasks_' + userId, JSON.stringify(completedTasks));
        document.querySelector('#task-ref .task-btn').classList.add('completed');
        document.querySelector('#task-ref .task-btn').textContent = 'ВЫПОЛНЕНО';
    }
    
    saveBalance();
    updateInventoryDisplay();
}

// Пополнение
function selectAmount(crystals, stars) {
    if (confirm(`Купить ${crystals} 💎 за ${stars} ⭐?`)) {
        // Отправляем запрос на оплату боту
        tg?.sendData(JSON.stringify({
            action: 'pay',
            crystals: crystals,
            stars: stars,
            user_id: userId
        }));
        
        // Имитация оплаты
        setTimeout(() => {
            balance += crystals;
            saveBalance();
            showPage('main-page');
            alert(`✅ Баланс пополнен на ${crystals} 💎`);
        }, 1500);
    }
}

// Сохранение баланса
function saveBalance() {
    localStorage.setItem('balance_' + userId, balance.toString());
    document.getElementById('balance').textContent = balance;
    document.getElementById('profile-balance').textContent = balance + ' 💎';
}

// Переключение игр
function showGame(game) {
    document.querySelectorAll('.game-menu-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.game-section').forEach(s => s.classList.remove('active'));
    document.getElementById(game + '-section').classList.add('active');
}

// Снежинки
const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let snowflakes = [];

function initCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    for (let i = 0; i < 50; i++) {
        snowflakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.2,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
}

function drawSnow() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();
        
        flake.y += flake.speed;
        
        if (flake.y > height) {
            flake.y = 0;
            flake.x = Math.random() * width;
        }
    });
    
    requestAnimationFrame(drawSnow);
}

// Инициализация
window.addEventListener('load', () => {
    // Загружаем баланс
    const savedBalance = localStorage.getItem('balance_' + userId);
    if (savedBalance) balance = parseInt(savedBalance);
    
    loadInventory();
    initCanvas();
    drawSnow();
    
    // Проверяем реферальный параметр из URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('start');
    if (ref && ref !== userId.toString()) {
        addReferral();
    }
});

window.addEventListener('resize', () => {
    initCanvas();
});
