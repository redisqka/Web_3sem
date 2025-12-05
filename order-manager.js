// order-manager.js
document.addEventListener('DOMContentLoaded', function() {
    // Делаем selectedDishes глобальной переменной
    window.selectedDishes = {
        soup: null,
        starter: null,
        'main-course': null, // ИЗМЕНЕНО: было 'main', стало 'main-course'
        drink: null,
        dessert: null
    };
    
    // Инициализируем блок заказа
    initOrderSection();
    
    // Добавляем обработчики событий для кнопок
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('dish-button')) {
            const dishCard = e.target.closest('.dish-card');
            const dishKeyword = dishCard.getAttribute('data-dish');
            const dish = dishes.find(d => d.keyword === dishKeyword);
            
            if (dish) {
                selectDish(dish);
            }
        }
    });
    
    // Обработчик изменения радиокнопок времени доставки
    document.addEventListener('change', function(e) {
        if (e.target.name === 'deliveryTime') {
            toggleTimeInput();
        }
    });
    
    function selectDish(dish) {
        // Снимаем выделение со всех карточек в этой категории
        const categoryCards = document.querySelectorAll(`[data-dish]`);
        categoryCards.forEach(card => {
            const cardDish = dishes.find(d => d.keyword === card.getAttribute('data-dish'));
            if (cardDish && cardDish.category === dish.category) {
                card.classList.remove('selected');
            }
        });
        
        // Выделяем выбранную карточку (если она видима)
        const selectedCard = document.querySelector(`[data-dish="${dish.keyword}"]`);
        if (selectedCard && selectedCard.style.display !== 'none') {
            selectedCard.classList.add('selected');
        }
        
        // Сохраняем выбранное блюдо
        // Используем квадратные скобки для доступа к свойству с дефисом
        window.selectedDishes[dish.category] = dish;
        
        // Обновляем отображение заказа
        updateOrderDisplay();
        updateTotalPrice();
        updateFormData();
    }
    
    function initOrderSection() {
        // Создаем секцию заказа
        const orderSection = document.createElement('section');
        orderSection.id = 'order';
        orderSection.className = 'menu-section';
        orderSection.innerHTML = `
            <div class="container menu-container">
                <header class="menu-section_header">
                    <h2 class="menu-title">Ваш заказ</h2>
                </header>
                <div class="order-content">
                    <div id="order-items">
                        <p class="no-selection">Ничего не выбрано</p>
                    </div>
                    <div id="order-total" class="order-total" style="display: none;">
                        <h3 class="total-title">Стоимость заказа</h3>
                        <p class="total-price">0₽</p>
                    </div>
                    <form id="order-form" class="order-form" action="https://httpbingo.org/post" method="POST" enctype="multipart/form-data" accept-charset="UTF-8">
                        <div class="form-group">
                            <label for="customer-name">Ваше имя</label>
                            <input id="customer-name" name="customerName" type="text" placeholder="Иван Иванов" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-phone">Телефон</label>
                            <input id="customer-phone" name="customerPhone" type="tel" placeholder="+7 (999) 999-99-99" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-email">Email</label>
                            <input id="customer-email" name="customerEmail" type="email" placeholder="name@example.com" required>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-option">
                                <input type="checkbox" name="receiveOffers"> Получать информацию о скидках и акциях
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="delivery-address">Адрес доставки</label>
                            <input id="delivery-address" name="deliveryAddress" type="text" placeholder="ул. Примерная, д. 1" required>
                            <p style="font-size: 14px; color: #707070; margin: 4px 0 0 0;">Доставка осуществляется только по Москве</p>
                        </div>
                        <div class="form-group">
                            <label for="delivery-comment">Комментарий к заказу</label>
                            <textarea id="delivery-comment" name="deliveryComment" rows="3" placeholder="Дополнительные пожелания к заказу"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Время доставки</label>
                            <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;">
                                <label class="radio-option">
                                    <input type="radio" name="deliveryTime" value="asap" checked> Как можно быстрее
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="deliveryTime" value="specified"> К указанному времени
                                </label>
                            </div>
                            <div id="time-input-container" class="time-input-container" style="display: none;">
                                <label for="delivery-time">Укажите время доставки</label>
                                <input id="delivery-time" name="deliveryTimeValue" type="time" min="09:00" max="22:00" style="margin-top: 8px;">
                                <p style="font-size: 14px; color: #707070; margin: 4px 0 0 0;">Доставка доступна с 09:00 до 22:00</p>
                            </div>
                        </div>
                        <input type="hidden" name="selectedDishesKeywords" id="selected-dishes-keywords">
                        <input type="hidden" name="totalPrice" id="total-price">
                        <button type="submit" class="primary-button">Оформить заказ</button>
                    </form>
                </div>
            </div>
        `;
        
        // Вставляем перед комбо-секцией
        const comboSection = document.querySelector('#special');
        if (comboSection) {
            comboSection.parentNode.insertBefore(orderSection, comboSection);
        }
        
        // Добавляем обработчик отправки формы
        document.getElementById('order-form').addEventListener('submit', function(e) {
            updateFormData();
        });
        
        // Инициализируем состояние поля времени
        toggleTimeInput();
    }
    
    function toggleTimeInput() {
        const timeInputContainer = document.getElementById('time-input-container');
        const specifiedTimeRadio = document.querySelector('input[name="deliveryTime"][value="specified"]');
        
        if (specifiedTimeRadio && specifiedTimeRadio.checked) {
            timeInputContainer.style.display = 'block';
            // Устанавливаем минимальное время - текущее время + 1 час
            setMinDeliveryTime();
        } else {
            timeInputContainer.style.display = 'none';
        }
    }
    
    function setMinDeliveryTime() {
        const timeInput = document.getElementById('delivery-time');
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        
        // Форматируем время в формат HH:MM
        const hours = oneHourLater.getHours().toString().padStart(2, '0');
        const minutes = oneHourLater.getMinutes().toString().padStart(2, '0');
        const minTime = `${hours}:${minutes}`;
        
        timeInput.min = minTime;
        
        // Устанавливаем значение по умолчанию - ближайшее доступное время
        if (!timeInput.value) {
            timeInput.value = minTime;
        }
    }
    
    function updateOrderDisplay() {
        const orderItems = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        const hasSelectedDishes = Object.values(window.selectedDishes).some(dish => dish !== null);
        
        if (!hasSelectedDishes) {
            orderItems.innerHTML = '<p class="no-selection">Ничего не выбрано</p>';
            orderTotal.style.display = 'none';
            return;
        }
        
        let orderHTML = '';
        
        // Супы
        if (window.selectedDishes.soup) {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Суп</h3>
                    <p class="selected-dish">${window.selectedDishes.soup.name} - ${window.selectedDishes.soup.price}₽</p>
                </div>
            `;
        }
        
        // Стартеры (салаты)
        if (window.selectedDishes.starter) {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Салат</h3>
                    <p class="selected-dish">${window.selectedDishes.starter.name} - ${window.selectedDishes.starter.price}₽</p>
                </div>
            `;
        }
        
        // Горячие блюда (main-course)
        if (window.selectedDishes['main-course']) { // ИЗМЕНЕНО: доступ через квадратные скобки
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Главное блюдо</h3>
                    <p class="selected-dish">${window.selectedDishes['main-course'].name} - ${window.selectedDishes['main-course'].price}₽</p>
                </div>
            `;
        }
        
        // Напитки
        if (window.selectedDishes.drink) {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Напиток</h3>
                    <p class="selected-dish">${window.selectedDishes.drink.name} - ${window.selectedDishes.drink.price}₽</p>
                </div>
            `;
        }
        
        // Десерты
        if (window.selectedDishes.dessert) {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Десерт</h3>
                    <p class="selected-dish">${window.selectedDishes.dessert.name} - ${window.selectedDishes.dessert.price}₽</p>
                </div>
            `;
        }
        
        orderItems.innerHTML = orderHTML;
        orderTotal.style.display = 'block';
    }
    
    function updateTotalPrice() {
        const totalElement = document.querySelector('.total-price');
        let total = 0;
        
        Object.values(window.selectedDishes).forEach(dish => {
            if (dish) {
                total += dish.price;
            }
        });
        
        totalElement.textContent = `${total}₽`;
    }
    
    function updateFormData() {
        const selectedDishesArray = Object.values(window.selectedDishes).filter(dish => dish !== null);
        
        // Ключи блюд на латинице
        const selectedKeywords = selectedDishesArray
            .map(dish => dish.keyword)
            .join(',');
        
        document.getElementById('selected-dishes-keywords').value = selectedKeywords;
        document.getElementById('total-price').value = calculateTotalPrice();
        
        // Валидация времени доставки
        const specifiedTimeRadio = document.querySelector('input[name="deliveryTime"][value="specified"]');
        const timeInput = document.getElementById('delivery-time');
        
        if (specifiedTimeRadio && specifiedTimeRadio.checked && !timeInput.value) {
            alert('Пожалуйста, укажите время доставки');
            return false;
        }
    }
    
    function calculateTotalPrice() {
        let total = 0;
        Object.values(window.selectedDishes).forEach(dish => {
            if (dish) total += dish.price;
        });
        return total;
    }
});