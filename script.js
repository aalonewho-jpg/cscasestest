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
let currentCase = null;
let isOpening = false;
let referrals = JSON.parse(localStorage.getItem('refs_' + userId)) || 0;
let completedTasks = JSON.parse(localStorage.getItem('tasks_' + userId)) || {
    channel: false,
    ref: false
};

// База скинов
const skins = [
    { id: 1, name: 'AK-47 | Голограмма', price: 2500, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/ak47_gs_holo_light_1.png', quality: 'Field-Tested', stattrak: false },
    { id: 2, name: 'M4A4 | Ледяной дракон', price: 3500, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/m4a1_gs_ice_1.png', quality: 'Minimal Wear', stattrak: true },
    { id: 3, name: 'AWP | Градиент', price: 5000, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/awp_gs_fade_1.png', quality: 'Factory New', stattrak: false },
    { id: 4, name: 'Desert Eagle | Кобальт', price: 1800, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/deagle_gs_cobalt_1.png', quality: 'Well-Worn', stattrak: true },
    { id: 5, name: 'USP-S | Белый снег', price: 1200, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/usp_s_gs_snow_1.png', quality: 'Field-Tested', stattrak: false },
    { id: 6, name: 'Glock-18 | Мороз', price: 1500, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/glock_gs_frost_1.png', quality: 'Minimal Wear', stattrak: false },
    { id: 7, name: 'SSG 08 | Кровавый', price: 2200, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/ssg08_gs_blood_1.png', quality: 'Battle-Scarred', stattrak: true },
    { id: 8, name: 'FAMAS | Механика', price: 2000, image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/famas_gs_mech_1.png', quality: 'Field-Tested', stattrak: false }
];

// Кейсы с нормальными иконками
const cases = [
    { 
        name: 'ALLIN CASE', 
        price: 750, 
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fvKi-xozMLgZ9JgVZ/qwecc98/image.png',
        skins: skins.slice(0, 4) 
    },
    { 
        name: 'BLUE CASE', 
        price: 25000, 
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fvKi-xozMLgZ9JgVZ/qwecc98/image.png',
        skins: skins.slice(2, 6) 
    },
    { 
        name: 'OLD SCHOOL', 
        price: 87500, 
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fvKi-xozMLgZ9JgVZ/qwecc98/image.png',
        skins: skins.slice(1, 5) 
    },
    { 
        name: 'RICH GUY', 
        price: 1250000, 
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fvKi-xozMLgZ9JgVZ/qwecc98/image.png',
        skins: skins.slice(3, 7) 
    },
    { 
        name: 'BUDGET CASE', 
        price: 15000, 
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fvKi-xozMLgZ9JgVZ/qwecc98/image.png',
        skins: skins.slice(0, 3) 
    },
    { 
        name: 'CONSUMER', 
        price: 5000, 
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fvKi-xozMLgZ9JgVZ/qwecc98/image.png',
        skins: skins.slice(4, 8) 
    }
];

// Загрузка инвентаря
function loadInventory() {
    const saved = localStorage.getItem('inventory_' + userId);
    if (saved) {
        inventory = JSON.parse(saved);
    } else {
        // Тестовые скины для начала
        inventory = [
            { ...skins[0], id: Date.now() + 1, stattrak: false },
            { ...skins[2], id: Date.now() + 2, stattrak: true }
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
                <div class="inventory-item-img" style="background-image: url('${skin.image}')">
                    ${skin.stattrak ? '<div class="stattrak-label">StatTrak™</div>' : ''}
                </div>
                <div class="inventory-item-name">${skin.name}</div>
                <div class="inventory-item-quality">${skin.quality}</div>
                <div class="inventory-item-price">${skin.price} 💎</div>
            </div>
        `).join('');
    }
    
    if (upgradeSelect) {
        upgradeSelect.innerHTML = inventory.map(skin => `
            <div class="inventory-item ${selectedSkinForUpgrade?.id === skin.id ? 'active' : ''}" 
                 onclick="selectSkinForUpgrade(${skin.id})">
                <div class="inventory-item-img" style="background-image: url('${skin.image}')">
                    ${skin.stattrak ? '<div class="stattrak-label">StatTrak™</div>' : ''}
                </div>
                <div class="inventory-item-name">${skin.name}</div>
                <div class="inventory-item-quality">${skin.quality}</div>
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
        <div class="case-card" onclick="openCaseModal('${c.name}')">
            <div class="case-img" style="background-image: url('${c.image}')"></div>
            <div class="case-name">${c.name}</div>
            <div class="case-price">${c.price.toLocaleString()} 💎</div>
        </div>
    `).join('');
}

// Модалка подтверждения открытия кейса
function openCaseModal(caseName) {
    currentCase = cases.find(c => c.name === caseName);
    
    if (balance < currentCase.price) {
        alert('❌ Недостаточно алмазов!');
        return;
    }
    
    document.getElementById('confirm-case-name').textContent = currentCase.name;
    document.getElementById('confirm-case-price').textContent = currentCase.price.toLocaleString();
    document.getElementById('confirm-case-modal').classList.add('active');
}

// Подтверждение открытия кейса
function confirmOpenCase() {
    document.getElementById('confirm-case-modal').classList.remove('active');
    
    if (isOpening) return;
    isOpening = true;
    
    balance -= currentCase.price;
    saveBalance();
    
    // Показываем модалку открытия
    const modal = document.getElementById('case-modal');
    const roulette = document.getElementById('roulette-items');
    
    // Создаем полосу скинов для рулетки
    const items = [];
    for (let i = 0; i < 30; i++) {
        items.push(currentCase.skins[Math.floor(Math.random() * currentCase.skins.length)]);
    }
    
    // Выбираем выигрышный скин
    const winSkin = { ...currentCase.skins[Math.floor(Math.random() * currentCase.skins.length)], id: Date.now() };
    
    // Добавляем его в середину
    items[15] = winSkin;
    
    roulette.innerHTML = items.map(skin => `
        <div class="roulette-item">
            <div class="roulette-item-img" style="background-image: url('${skin.image}')"></div>
            <div class="roulette-item-name">${skin.name}</div>
        </div>
    `).join('');
    
    modal.classList.add('active');
    
    // Запускаем анимацию
    roulette.style.animation = 'none';
    roulette.offsetHeight;
    roulette.style.animation = 'roll 2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards';
    
    // Показываем результат через 2 секунды
    setTimeout(() => {
        document.getElementById('roulette').style.display = 'none';
        document.getElementById('case-result').style.display = 'block';
        
        document.getElementById('result-skin').innerHTML = `
            <div class="result-skin-img" style="background-image: url('${winSkin.image}')"></div>
            <div class="result-skin-name">${winSkin.name}</div>
            <div class="result-skin-quality">${winSkin.quality}</div>
            <div class="result-skin-price">${winSkin.price} 💎</div>
        `;
        
        lastOpenedSkin = winSkin;
        isOpening = false;
    }, 2000);
}

// Закрыть модалку кейса
function closeCaseModal() {
    document.getElementById('case-modal').classList.remove('active');
    document.getElementById('roulette').style.display = 'block';
    document.getElementById('case-result').style.display = 'none';
}

// Продажа скина после открытия
function sellSkin() {
    const price = Math.floor(lastOpenedSkin.price * 0.7);
    balance += price;
    saveBalance();
    closeCaseModal();
    alert(`✅ Скин продан за ${price} 💎`);
}

// Отправить в апгрейд
function sendToUpgrade() {
    closeCaseModal();
    inventory.push(lastOpenedSkin);
    saveInventory();
    showPage('games');
    showGame('upgrades');
    
    // Выбираем этот скин для апгрейда
    setTimeout(() => {
        selectSkinForUpgrade(lastOpenedSkin.id);
    }, 300);
}

// Оставить скин
function keepSkin() {
    inventory.push(lastOpenedSkin);
    saveInventory();
    closeCaseModal();
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

// Апгрейдер
function selectSkinForUpgrade(skinId) {
    selectedSkinForUpgrade = inventory.find(s => s.id === skinId);
    
    if (selectedSkinForUpgrade) {
        document.getElementById('source-skin-name').textContent = selectedSkinForUpgrade.name;
        document.getElementById('source-skin-price').textContent = selectedSkinForUpgrade.price;
        document.getElementById('source-skin-img').style.backgroundImage = `url('${selectedSkinForUpgrade.image}')`;
        
        document.getElementById('target-skin-price').textContent = Math.floor(selectedSkinForUpgrade.price * selectedMultiplier);
        
        document.getElementById('upgrade-btn').disabled = false;
        document.getElementById('upgrade-chance').textContent = '61';
    }
    
    updateInventoryDisplay();
}

function selectMultiplier(mult) {
    selectedMultiplier = mult;
    document.querySelectorAll('.multi-btn').forEach((btn, i) => {
        const vals = [1.5, 2, 5, 10];
        btn.classList.toggle('active', vals[i] === mult);
    });
    
    if (selectedSkinForUpgrade) {
        document.getElementById('target-skin-price').textContent = Math.floor(selectedSkinForUpgrade.price * mult);
    }
}

function startUpgrade() {
    if (!selectedSkinForUpgrade) {
        alert('❌ Выбери скин');
        return;
    }
    
    const upgradeCost = Math.floor(selectedSkinForUpgrade.price * 0.1);
    
    if (balance < upgradeCost) {
        alert(`❌ Нужно ${upgradeCost} 💎 для апгрейда`);
        return;
    }
    
    balance -= upgradeCost;
    saveBalance();
    
    const modal = document.getElementById('upgrade-modal');
    const wheel = document.getElementById('upgrade-wheel');
    const resultText = document.getElementById('upgrade-result');
    const winChance = 61; // 61% как на скрине
    
    // Удаляем скин из инвентаря
    inventory = inventory.filter(s => s.id !== selectedSkinForUpgrade.id);
    saveInventory();
    
    modal.classList.add('active');
    
    // Запускаем анимацию
    wheel.style.animation = 'none';
    wheel.offsetHeight;
    
    // Рандомный поворот
    const spins = 5 + Math.random() * 3;
    const deg = spins * 360 + (Math.random() * 180);
    wheel.style.animation = `spinUpgrade 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`;
    
    // Определяем результат
    setTimeout(() => {
        const win = Math.random() * 100 < winChance;
        
        if (win) {
            // Создаем улучшенный скин
            const newPrice = Math.floor(selectedSkinForUpgrade.price * selectedMultiplier);
            const upgradedSkin = {
                ...selectedSkinForUpgrade,
                id: Date.now(),
                price: newPrice,
                name: selectedSkinForUpgrade.name,
                upgraded: true
            };
            
            inventory.push(upgradedSkin);
            saveInventory();
            
            resultText.innerHTML = `
                <div class="win-text">🎉 ПОБЕДА!</div>
                <div class="win-skin">
                    <div class="win-skin-img" style="background-image: url('${upgradedSkin.image}')"></div>
                    <div>${upgradedSkin.name}</div>
                    <div class="win-price">${newPrice} 💎 (+${selectedMultiplier}x)</div>
                </div>
            `;
        } else {
            resultText.innerHTML = `
                <div class="lose-text">❌ НЕ ПОВЕЗЛО</div>
                <div class="lose-desc">Скин сгорел</div>
                <button class="upgrade-again" onclick="closeUpgradeModal(); showPage('games'); showGame('upgrades');">Апгрейдить снова</button>
            `;
        }
        
        updateInventoryDisplay();
    }, 3000);
}

function closeUpgradeModal() {
    document.getElementById('upgrade-modal').classList.remove('active');
    selectedSkinForUpgrade = null;
    document.getElementById('upgrade-btn').disabled = true;
    document.getElementById('source-skin-name').textContent = 'Не выбран';
    document.getElementById('source-skin-price').textContent = '0';
    document.getElementById('target-skin-price').textContent = '0';
}

// Проверка подписки на канал
async function checkSubscription() {
    if (completedTasks.channel) {
        alert('✅ Задание уже выполнено!');
        return;
    }
    
    try {
        tg?.sendData(JSON.stringify({
            action: 'check_sub',
            user_id: userId,
            channel: '@alonewhat'
        }));
        
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

// Добавление реферала
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
        tg?.sendData(JSON.stringify({
            action: 'pay',
            crystals: crystals,
            stars: stars,
            user_id: userId
        }));
        
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
    const savedBalance = localStorage.getItem('balance_' + userId);
    if (savedBalance) balance = parseInt(savedBalance);
    
    loadInventory();
    initCanvas();
    drawSnow();
    
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('start');
    if (ref && ref !== userId.toString()) {
        addReferral();
    }
});

window.addEventListener('resize', () => {
    initCanvas();
});
