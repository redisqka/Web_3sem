// order-manager.js - управление заказом
document.addEventListener('DOMContentLoaded', function() {
    let selectedDishes = {
        soup: null,
        main: null,
        drink: null
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
    
    function selectDish(dish) {
        // Снимаем выделение со всех карточек в этой категории
        const categoryCards = document.querySelectorAll(`[data-dish]`);
        categoryCards.forEach(card => {
            if (dishes.find(d => d.keyword === card.getAttribute('data-dish'))?.category === dish.category) {
                card.classList.remove('selected');
            }
        });
        
        // Выделяем выбранную карточку
        const selectedCard = document.querySelector(`[data-dish="${dish.keyword}"]`);
        selectedCard.classList.add('selected');
        
        // Сохраняем выбранное блюдо
        selectedDishes[dish.category] = dish;
        
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
                    <form id="order-form" class="order-form" action="https://httpbin.org/post" method="POST" enctype="multipart/form-data accept-charset="UTF-8"">
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
                            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                                <label class="radio-option">
                                    <input type="radio" name="deliveryTime" value="asap" checked> Как можно быстрее
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="deliveryTime" value="specified"> К указанному времени
                                </label>
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
        comboSection.parentNode.insertBefore(orderSection, comboSection);
        
        // Добавляем обработчик отправки формы
        document.getElementById('order-form').addEventListener('submit', function(e) {
            updateFormData();
        });
    }
    
    function updateOrderDisplay() {
        const orderItems = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        const hasSelectedDishes = Object.values(selectedDishes).some(dish => dish !== null);
        
        if (!hasSelectedDishes) {
            orderItems.innerHTML = '<p class="no-selection">Ничего не выбрано</p>';
            orderTotal.style.display = 'none';
            return;
        }
        
        let orderHTML = '';
        
        // Супы
        if (selectedDishes.soup) {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Суп</h3>
                    <p class="selected-dish">${selectedDishes.soup.name} - ${selectedDishes.soup.price}₽</p>
                </div>
            `;
        } else {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Суп</h3>
                    <p class="no-dish">Блюдо не выбрано</p>
                </div>
            `;
        }
        
        // Горячие блюда
        if (selectedDishes.main) {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Главное блюдо</h3>
                    <p class="selected-dish">${selectedDishes.main.name} - ${selectedDishes.main.price}₽</p>
                </div>
            `;
        } else {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Главное блюдо</h3>
                    <p class="no-dish">Блюдо не выбрано</p>
                </div>
            `;
        }
        
        // Напитки
        if (selectedDishes.drink) {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Напиток</h3>
                    <p class="selected-dish">${selectedDishes.drink.name} - ${selectedDishes.drink.price}₽</p>
                </div>
            `;
        } else {
            orderHTML += `
                <div class="order-category">
                    <h3 class="category-title">Напиток</h3>
                    <p class="no-dish">Напиток не выбран</p>
                </div>
            `;
        }
        
        orderItems.innerHTML = orderHTML;
        orderTotal.style.display = 'block';
    }
    
    function updateTotalPrice() {
        const totalElement = document.querySelector('.total-price');
        let total = 0;
        
        Object.values(selectedDishes).forEach(dish => {
            if (dish) {
                total += dish.price;
            }
        });
        
        totalElement.textContent = `${total}₽`;
    }
    
    function updateFormData() {
        const selectedDishesArray = Object.values(selectedDishes).filter(dish => dish !== null);
        
        // Ключи блюд на латинице
        const selectedKeywords = selectedDishesArray
            .map(dish => dish.keyword)
            .join(',');
        
        document.getElementById('selected-dishes-keywords').value = selectedKeywords;
        document.getElementById('total-price').value = calculateTotalPrice();
    }
    
    function calculateTotalPrice() {
        let total = 0;
        Object.values(selectedDishes).forEach(dish => {
            if (dish) total += dish.price;
        });
        return total;
    }
});