document.addEventListener('DOMContentLoaded', async function() {
    console.log('Order Manager: DOM загружен');
    
    // Ждём загрузки блюд
    await waitForDishesLoaded();
    console.log('Order Manager: Блюда загружены, всего:', dishes.length);
    
    // Инициализируем панель заказа
    initOrderPanel();
    
    // Загружаем сохранённые выборы
    loadSelectedDishesFromStorage();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Обновляем панель
    updateOrderPanel();
});

function waitForDishesLoaded() {
    return new Promise((resolve) => {
        if (dishes && dishes.length > 0) {
            resolve();
            return;
        }
        
        // Ждём загрузки блюд
        const checkInterval = setInterval(() => {
            if (dishes && dishes.length > 0) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
        
        // Таймаут на случай проблем
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('Order Manager: Таймаут ожидания блюд');
            resolve();
        }, 3000);
    });
}

function loadSelectedDishesFromStorage() {
    console.log('Order Manager: Загрузка из localStorage');
    
    // Инициализируем глобальную переменную
    window.selectedDishes = {
        soup: null,
        starter: null,
        'main-course': null,
        drink: null,
        dessert: null
    };
    
    const order = StorageManager.getOrder();
    console.log('Order Manager: Заказ из хранилища:', order);
    
    // Заполняем выбранные блюда
    Object.keys(order).forEach(category => {
        const keyword = order[category];
        if (keyword) {
            const dish = dishes.find(d => d.keyword === keyword);
            if (dish) {
                window.selectedDishes[category] = dish;
                console.log(`Order Manager: Найдено блюдо для ${category}:`, dish.name);
                highlightDishCard(dish);
            } else {
                console.warn(`Order Manager: Блюдо с keyword "${keyword}" не найдено в массиве dishes`);
            }
        }
    });
}

function highlightDishCard(dish) {
    if (!dish || !dish.keyword) return;
    
    const card = document.querySelector(`[data-dish="${dish.keyword}"]`);
    if (card) {
        card.classList.add('selected');
        console.log(`Order Manager: Выделена карточка: ${dish.name}`);
    } else {
        console.warn(`Order Manager: Карточка для блюда "${dish.keyword}" не найдена на странице`);
    }
}

function setupEventListeners() {
    // Обработчик кликов по кнопкам "Добавить"
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('dish-button')) {
            const dishCard = e.target.closest('.dish-card');
            if (!dishCard) return;
            
            const dishKeyword = dishCard.getAttribute('data-dish');
            if (!dishKeyword) return;
            
            const dish = dishes.find(d => d.keyword === dishKeyword);
            if (dish) {
                selectDish(dish);
            } else {
                console.error('Order Manager: Блюдо не найдено по keyword:', dishKeyword);
            }
        }
    });
    
    // Обработчик обновления заказа из других вкладок
    window.addEventListener('orderUpdated', function() {
        console.log('Order Manager: Событие orderUpdated получено');
        loadSelectedDishesFromStorage();
        updateOrderPanel();
    });
    
    // Обработчик кликов по фильтрам (чтобы обновить выделение после фильтрации)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            // Небольшая задержка для применения фильтра
            setTimeout(() => {
                Object.values(window.selectedDishes).forEach(dish => {
                    if (dish) highlightDishCard(dish);
                });
            }, 50);
        }
    });
}

function selectDish(dish) {
    console.log('Order Manager: Выбрано блюдо:', dish.name, 'категория:', dish.category);
    
    // Определяем категорию для хранения
    let storageCategory = dish.category;
    if (dish.category === 'salad') {
        storageCategory = 'starter';
    } else if (dish.category === 'main') {
        storageCategory = 'main-course';
    }
    
    // Снимаем выделение со всех карточек в этой категории
    const categoryCards = document.querySelectorAll(`.dish-card[data-category="${dish.category}"]`);
    categoryCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // Выделяем выбранную карточку
    const selectedCard = document.querySelector(`[data-dish="${dish.keyword}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Сохраняем в хранилище
    StorageManager.saveDish(dish.category, dish);
    
    // Обновляем глобальную переменную
    window.selectedDishes[storageCategory] = dish;
    
    // Обновляем панель
    updateOrderPanel();
}

function initOrderPanel() {
    console.log('Order Manager: Инициализация панели заказа');
    
    // Удаляем старую секцию заказа, если она есть
    const oldOrderSection = document.getElementById('order');
    if (oldOrderSection) {
        oldOrderSection.remove();
    }
    
    // Проверяем, не создана ли уже панель
    if (document.getElementById('order-panel')) {
        console.log('Order Manager: Панель уже существует');
        return;
    }
    
    // Создаем новую панель заказа
    const orderPanel = document.createElement('section');
    orderPanel.id = 'order-panel';
    orderPanel.className = 'order-panel';
    orderPanel.innerHTML = `
        <div class="container">
            <div class="order-panel-content">
                <div class="order-panel-summary">
                    <h3>Ваш заказ</h3>
                    <p id="order-panel-total">0₽</p>
                </div>
                <a id="checkout-link" href="./checkout.html" class="primary-button checkout-button" disabled>
                    Перейти к оформлению
                </a>
            </div>
        </div>
    `;
    
    // Вставляем перед комбо-секцией
    const comboSection = document.querySelector('#special');
    if (comboSection) {
        comboSection.parentNode.insertBefore(orderPanel, comboSection);
        console.log('Order Manager: Панель создана перед комбо-секцией');
    } else {
        // Если нет комбо-секции, вставляем в конец main
        const main = document.querySelector('main');
        if (main) {
            main.appendChild(orderPanel);
            console.log('Order Manager: Панель добавлена в конец main');
        }
    }
}

function updateOrderPanel() {
    const panel = document.getElementById('order-panel');
    const totalElement = document.getElementById('order-panel-total');
    const link = document.getElementById('checkout-link');
    
    if (!panel || !totalElement || !link) {
        console.warn('Order Manager: Элементы панели не найдены');
        return;
    }
    
    const selectedCount = StorageManager.getSelectedCount();
    const total = calculateTotalPrice();
    
    console.log('Order Manager: Обновление панели. Выбрано:', selectedCount, 'Сумма:', total);
    
    if (selectedCount > 0) {
        panel.style.display = 'block';
        totalElement.textContent = `${total}₽`;
        
        // Проверка валидности комбо
        const selectedCategories = StorageManager.getSelectedCategories();
        console.log('Order Manager: Выбранные категории для валидации:', selectedCategories);
        
        const isValid = isValidCombination(selectedCategories);
        console.log('Order Manager: Комбо валидно:', isValid);
        
        if (isValid) {
            link.removeAttribute('disabled');
            link.classList.remove('disabled');
            link.title = '';
        } else {
            link.setAttribute('disabled', 'disabled');
            link.classList.add('disabled');
            
            // Показываем подсказку, что не так
            const missingInfo = getMissingItems(selectedCategories);
            link.title = missingInfo.message || 'Состав заказа не соответствует доступным комбо';
        }
    } else {
        panel.style.display = 'none';
    }
}

function calculateTotalPrice() {
    let total = 0;
    Object.values(window.selectedDishes).forEach(dish => {
        if (dish && dish.price) {
            total += parseInt(dish.price) || 0;
        }
    });
    return total;
}

// Делаем функции доступными для других скриптов
window.updateOrderPanel = updateOrderPanel;