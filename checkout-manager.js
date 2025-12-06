// checkout-manager.js
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Checkout Manager: Начало загрузки страницы оформления заказа');
    
    // Сначала загружаем блюда
    try {
        console.log('Checkout Manager: Загружаем блюда...');
        await loadDishes();
        
        if (!window.dishes || window.dishes.length === 0) {
            throw new Error('Не удалось загрузить блюда');
        }
        
        console.log('Checkout Manager: Блюда загружены, всего:', window.dishes.length);
        
        // Проверяем заказ
        const order = StorageManager.getOrder();
        console.log('Checkout Manager: Заказ из localStorage:', order);
        
        const selectedKeywords = StorageManager.getSelectedKeywords();
        console.log('Checkout Manager: Выбранные keywords:', selectedKeywords);
        
        // Проверяем, что блюда существуют в массиве
        selectedKeywords.forEach(keyword => {
            const dish = window.dishes.find(d => d.keyword === keyword);
            if (!dish) {
                console.warn(`Checkout Manager: Блюдо с keyword "${keyword}" не найдено в массиве dishes`);
            }
        });
        
        const hasItems = selectedKeywords.length > 0;
        console.log('Checkout Manager: Есть выбранные блюда:', hasItems);
        
        if (!hasItems) {
            showEmptyState();
            return;
        }
        
        // Отображаем заказ
        displayOrderItems();
        displaySelectedDishesSidebar();
        
        // Настраиваем функционал
        setupRemoveButtons();
        setupDeliveryTimeToggle();
        
        // Проверяем комбо и показываем предупреждение если нужно
        validateComboAndShowWarning();
        
        // Настраиваем форму (ДЕЛАЕМ ПОСЛЕДНЕЙ!)
        setTimeout(() => {
            setupFormValidation();
        }, 100);
        
    } catch (error) {
        console.error('Checkout Manager: Ошибка:', error);
        showErrorMessage('Ошибка загрузки данных: ' + error.message);
    }
});

function showEmptyState() {
    console.log('Checkout Manager: Показываем пустое состояние');
    
    const container = document.getElementById('checkout-items');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Ничего не выбрано. Чтобы добавить блюда в заказ, 
                перейдите на страницу <a href="./lunch.html" class="link-button">Собрать ланч</a>.</p>
            </div>
        `;
    }
    
    const formSection = document.getElementById('checkout-form-section');
    if (formSection) {
        formSection.style.display = 'none';
    }
}

function displayOrderItems() {
    console.log('Checkout Manager: Отображаем выбранные блюда');
    
    const order = StorageManager.getOrder();
    const container = document.getElementById('checkout-items');
    
    if (!container) {
        console.error('Checkout Manager: Контейнер #checkout-items не найден');
        return;
    }
    
    // Собираем выбранные блюда
    const selectedDishes = [];
    const categoryMap = {
        'soup': 'soup',
        'starter': 'salad', // В хранилище 'starter', в API 'salad'
        'main-course': 'main',
        'drink': 'drink',
        'dessert': 'dessert'
    };
    
    Object.keys(order).forEach(storageCategory => {
        const keyword = order[storageCategory];
        if (keyword) {
            // Ищем блюдо по keyword
            const dish = window.dishes.find(d => d.keyword === keyword);
            if (dish) {
                // Добавляем оригинальную категорию из хранилища
                dish.storageCategory = storageCategory;
                selectedDishes.push(dish);
                console.log(`Checkout Manager: Добавлено блюдо: ${dish.name} (${storageCategory})`);
            } else {
                console.warn(`Checkout Manager: Блюдо "${keyword}" не найдено`);
            }
        }
    });
    
    if (selectedDishes.length === 0) {
        showEmptyState();
        return;
    }
    
    // Отображаем
    let html = '<div class="checkout-grid">';
    
    selectedDishes.forEach(dish => {
        html += createCheckoutCard(dish);
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    console.log('Checkout Manager: Отображено блюд:', selectedDishes.length);
}

function createCheckoutCard(dish) {
    const categoryNames = {
        'soup': 'Суп',
        'starter': 'Салат',
        'main-course': 'Горячее блюдо',
        'drink': 'Напиток',
        'dessert': 'Десерт'
    };
    
    const categoryName = categoryNames[dish.storageCategory] || dish.storageCategory;
    
    // Проверяем изображение
    let imageUrl = dish.image;
    if (!imageUrl || imageUrl === '') {
        const color = getColorForCategory(dish.category);
        const shortName = dish.name.length > 20 ? dish.name.substring(0, 17) + '...' : dish.name;
        imageUrl = `https://via.placeholder.com/300x200/${color}/FFFFFF?text=${encodeURIComponent(shortName)}`;
    }
    
    return `
        <article class="dish-card checkout-card">
            <img class="dish-image" src="${imageUrl}" alt="${dish.name}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200/cccccc/333333?text=${encodeURIComponent(dish.name.substring(0, 20))}'">
            <div class="dish-category">${categoryName}</div>
            <h3 class="dish-name">${dish.name}</h3>
            <p class="dish-price">${dish.price}₽</p>
            <p class="dish-weight">${dish.count || 'не указано'}</p>
            <button class="remove-button" data-category="${dish.storageCategory}" data-keyword="${dish.keyword}">
                Удалить
            </button>
        </article>
    `;
}

function getColorForCategory(category) {
    const colors = {
        'soup': 'FF6347',
        'salad': '32CD32',
        'main': '1E90FF',
        'drink': '9370DB',
        'dessert': 'FF69B4'
    };
    return colors[category] || 'cccccc';
}

function displaySelectedDishesSidebar() {
    console.log('Checkout Manager: Отображаем sidebar с заказом');
    
    const order = StorageManager.getOrder();
    const container = document.getElementById('selected-dishes-list');
    const totalElement = document.getElementById('checkout-total-price');
    
    if (!container || !totalElement) {
        console.error('Checkout Manager: Элементы sidebar не найдены');
        return;
    }
    
    let total = 0;
    let html = '';
    
    const categories = {
        'soup': 'Суп',
        'starter': 'Салат',
        'main-course': 'Главное блюдо',
        'drink': 'Напиток',
        'dessert': 'Десерт'
    };
    
    Object.keys(categories).forEach(category => {
        const keyword = order[category];
        html += `<div class="selected-dish-item" data-category="${category}">`;
        html += `<strong>${categories[category]}:</strong> `;
        
        if (keyword) {
            const dish = window.dishes.find(d => d.keyword === keyword);
            if (dish) {
                const price = parseInt(dish.price) || 0;
                html += `${dish.name} - ${price}₽`;
                total += price;
            } else {
                html += `<span class="not-selected">Блюдо не найдено</span>`;
                console.warn(`Checkout Manager: Блюдо "${keyword}" не найдено для sidebar`);
            }
        } else {
            html += `<span class="not-selected">Не выбрано</span>`;
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
    totalElement.textContent = `${total}₽`;
    
    console.log('Checkout Manager: Итоговая сумма:', total);
}

function setupRemoveButtons() {
    console.log('Checkout Manager: Настраиваем кнопки удаления');
    
    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            const keyword = this.dataset.keyword;
            
            console.log(`Checkout Manager: Удаление: ${category} - ${keyword}`);
            
            // Удаляем из хранилища
            StorageManager.removeDish(category);
            
            // Обновляем отображение
            const hasItems = StorageManager.getSelectedCount() > 0;
            
            if (hasItems) {
                displayOrderItems();
                displaySelectedDishesSidebar();
                setupRemoveButtons();
                validateComboAndShowWarning();
            } else {
                showEmptyState();
            }
            
            // Обновляем панель на lunch.html
            StorageManager.dispatchUpdateEvent();
        });
    });
}

function setupFormValidation() {
    console.log('Checkout Manager: Настраиваем валидацию формы');
    
    const form = document.getElementById('checkout-form');
    if (!form) {
        console.error('Checkout Manager: Форма #checkout-form не найдена');
        return;
    }
    
    // Удаляем старые обработчики
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Новый обработчик
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Checkout Manager: Отправка формы оформления заказа');
        
        // 1. Проверяем, что есть выбранные блюда
        const selectedCount = StorageManager.getSelectedCount();
        if (selectedCount === 0) {
            showNotification('Вы не выбрали ни одного блюда. Вернитесь на страницу "Собрать ланч".');
            return;
        }
        
        // 2. Проверяем комбо
        const selectedCategories = StorageManager.getSelectedCategories();
        console.log('Checkout Manager: Категории для проверки комбо:', selectedCategories);
        
        if (!isValidCombination(selectedCategories)) {
            const missingInfo = getMissingItems(selectedCategories);
            showNotification(missingInfo.message || 'Состав заказа не соответствует ни одному из доступных комбо!');
            return;
        }
        
        // 3. Проверяем обязательные поля
        const requiredFields = [
            { name: 'full_name', label: 'Имя' },
            { name: 'email', label: 'Email' },
            { name: 'phone', label: 'Телефон' },
            { name: 'delivery_address', label: 'Адрес доставки' }
        ];
        
        for (const field of requiredFields) {
            const input = this.querySelector(`[name="${field.name}"]`);
            if (!input || !input.value.trim()) {
                showNotification(`Пожалуйста, заполните поле "${field.label}"`);
                if (input) input.focus();
                return;
            }
        }
        
        // 4. Проверяем email
        const emailInput = this.querySelector('[name="email"]');
        if (emailInput && !isValidEmail(emailInput.value)) {
            showNotification('Пожалуйста, введите корректный email адрес');
            emailInput.focus();
            return;
        }
        
        // 5. Проверяем время доставки если нужно
        const deliveryType = this.querySelector('input[name="delivery_type"]:checked');
        if (!deliveryType) {
            showNotification('Пожалуйста, выберите тип доставки');
            return;
        }
        
        if (deliveryType.value === 'by_time') {
            const timeInput = this.querySelector('[name="delivery_time"]');
            if (!timeInput || !timeInput.value) {
                showNotification('Пожалуйста, укажите время доставки');
                if (timeInput) timeInput.focus();
                return;
            }
        }
        
        // 6. Отправляем на сервер
        const submitButton = this.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
        }
        
        try {
            console.log('Checkout Manager: Отправляем заказ на сервер...');
            const result = await ApiService.submitOrder(this);
            console.log('Checkout Manager: Ответ сервера:', result);
            
            // Успешно - очищаем и показываем сообщение
            StorageManager.clearOrder();
            showSuccessNotification(`Заказ успешно оформлен! Номер заказа: ${result.id || 'получен'}`);
            
        } catch (error) {
            console.error('Checkout Manager: Ошибка отправки:', error);
            
            // Подробное сообщение об ошибке
            let errorMessage = 'Ошибка при оформлении заказа';
            if (error.message.includes('API ключ')) {
                errorMessage = 'Ошибка: API ключ не настроен. Получите ключ и замените в api-service.js';
            } else if (error.message.includes('соединиться')) {
                errorMessage = 'Ошибка соединения с сервером. Проверьте интернет-подключение.';
            } else {
                errorMessage = `Ошибка: ${error.message}`;
            }
            
            showNotification(errorMessage);
            
            // Восстанавливаем кнопку
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Отправить заказ';
            }
        }
    });
    
    console.log('Checkout Manager: Валидация формы настроена');
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateComboAndShowWarning() {
    const selectedCategories = StorageManager.getSelectedCategories();
    const isValid = isValidCombination(selectedCategories);
    
    if (!isValid) {
        const missingInfo = getMissingItems(selectedCategories);
        console.log('Checkout Manager: Комбо невалидно:', missingInfo.message);
        
        // Показываем предупреждение над формой
        const formSection = document.getElementById('checkout-form-section');
        if (formSection) {
            // Удаляем старое предупреждение
            const oldWarning = formSection.querySelector('.combo-warning');
            if (oldWarning) oldWarning.remove();
            
            // Создаем новое
            const warning = document.createElement('div');
            warning.className = 'combo-warning';
            warning.innerHTML = `
                <div class="warning-content">
                    <strong>Внимание!</strong> ${missingInfo.message}
                    <br><small>Вы можете оформить заказ, но убедитесь, что выбрали правильную комбинацию.</small>
                </div>
            `;
            
            // Стили
            warning.style.cssText = `
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 20px;
                color: #856404;
            `;
            
            const sectionContent = formSection.querySelector('.section-content');
            if (sectionContent) {
                sectionContent.prepend(warning);
            }
        }
    }
}

function setupDeliveryTimeToggle() {
    const timeRadios = document.querySelectorAll('input[name="delivery_type"]');
    const timeContainer = document.getElementById('time-input-container');
    
    if (!timeRadios.length || !timeContainer) return;
    
    timeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'by_time') {
                timeContainer.style.display = 'block';
                setMinDeliveryTime();
            } else {
                timeContainer.style.display = 'none';
            }
        });
    });
    
    // Инициализируем состояние
    const byTimeRadio = document.querySelector('input[name="delivery_type"][value="by_time"]');
    if (byTimeRadio && byTimeRadio.checked) {
        timeContainer.style.display = 'block';
        setMinDeliveryTime();
    }
}

function setMinDeliveryTime() {
    const timeInput = document.getElementById('delivery-time');
    if (!timeInput) return;
    
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    let hours = Math.max(7, oneHourLater.getHours());
    let minutes = oneHourLater.getMinutes();
    
    minutes = Math.ceil(minutes / 5) * 5;
    
    if (minutes >= 60) {
        minutes = 0;
        hours += 1;
    }
    
    if (hours >= 23) {
        hours = 7;
        minutes = 0;
    }
    
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const minTime = `${hoursStr}:${minutesStr}`;
    
    timeInput.min = minTime;
    
    if (!timeInput.value || timeInput.value < minTime) {
        timeInput.value = minTime;
    }
}

function showNotification(message) {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <h3 class="notification-title">Внимание</h3>
        <p class="notification-message">${message}</p>
        <button class="notification-button">Понятно</button>
    `;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    const closeButton = notification.querySelector('.notification-button');
    closeButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function showSuccessNotification(message) {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    const notification = document.createElement('div');
    notification.className = 'notification success-notification';
    notification.innerHTML = `
        <h3 class="notification-title">Успешно!</h3>
        <p class="notification-message">${message}</p>
        <div class="notification-buttons">
            <button class="notification-button" id="stay-button">Остаться</button>
            <button class="notification-button primary" id="home-button">На главную</button>
        </div>
    `;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    document.getElementById('stay-button').addEventListener('click', function() {
        document.body.removeChild(overlay);
        // Обновляем страницу
        displayOrderItems();
        displaySelectedDishesSidebar();
        showEmptyState(); // Будет пусто, так как заказ очищен
    });
    
    document.getElementById('home-button').addEventListener('click', function() {
        document.body.removeChild(overlay);
        window.location.href = './index.html';
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #ffebee;
        border: 2px solid #f44336;
        color: #c62828;
        padding: 20px;
        margin: 20px 0;
        border-radius: 8px;
        text-align: center;
        font-weight: bold;
    `;
    errorDiv.textContent = message;
    
    const container = document.querySelector('.checkout-container') || document.querySelector('main');
    if (container) {
        container.prepend(errorDiv);
        
        // Удаляем через 5 секунд
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
    .notification-buttons {
        display: flex;
        gap: 12px;
        margin-top: 20px;
    }
    
    .notification-button.primary {
        background-color: tomato;
        color: white;
    }
    
    .success-notification {
        border: 2px solid #4CAF50;
    }
    
    .success-notification .notification-title {
        color: #4CAF50;
    }
    
    .dish-category {
        font-size: 14px;
        color: #666;
        font-weight: 600;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;
document.head.appendChild(style);