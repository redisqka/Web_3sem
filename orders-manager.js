class OrdersManager {
    constructor() {
        this.orders = [];
        this.currentOrderId = null;
        this.allDishes = [];
    }

    async loadOrders() {
        console.log('🔄 Загрузка заказов...');
        
        try {
            // Загружаем блюда
            await this.loadAllDishes();
            
            // Загружаем заказы через ApiService
            const ordersFromApi = await ApiService.getOrders();
            
            // Загружаем локальные заказы
            const localOrders = JSON.parse(localStorage.getItem('foodConstructOrders') || '[]');
            
            // Объединяем и удаляем дубликаты
            const allOrders = [...ordersFromApi, ...localOrders];
            this.orders = this.removeDuplicates(allOrders);
            
            console.log(`✅ Всего заказов: ${this.orders.length}`);
            
            this.renderOrders();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            this.showError('Ошибка загрузки заказов');
        }
    }
    
    async loadAllDishes() {
        console.log('🔄 Загрузка блюд...');
        
        // Если уже загружены
        if (this.allDishes.length > 0) {
            console.log('✅ Блюда уже загружены');
            return this.allDishes;
        }
        
        // Пробуем получить из window.dishes
        if (window.dishes && Array.isArray(window.dishes) && window.dishes.length > 0) {
            console.log('✅ Блюда из window.dishes:', window.dishes.length);
            this.allDishes = window.dishes;
            return this.allDishes;
        }
        
        try {
            // Загружаем с API
            const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
            console.log('📡 Запрос к API:', apiUrl);
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Получено блюд с API: ${data.length}`);
            
            // Сохраняем в локальное свойство
            this.allDishes = data;
            
            // Также сохраняем в window для других скриптов
            window.dishes = data;
            
            return this.allDishes;
            
        } catch (error) {
            console.error('❌ Ошибка загрузки блюд с API:', error);
            
            // Если не удалось загрузить блюда, продолжаем без них
            console.log('⚠️ Блюда не загружены, будут отображаться ID');
            this.allDishes = [];
            window.dishes = [];
            
            return this.allDishes;
        }
    }
    
    removeDuplicates(orders) {
        const unique = [];
        const seen = new Set();
        
        orders.forEach(order => {
            const orderId = String(order.id);
            if (!seen.has(orderId)) {
                seen.add(orderId);
                unique.push(order);
            }
        });
        
        // Сортируем по дате (новые сверху)
        return unique.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });
    }

    renderOrders() {
        const container = document.getElementById('orders-list');
        if (!container) return;
        
        if (!this.orders || this.orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Нет заказов</p>
                    <a href="./lunch.html" class="primary-button">Сделать заказ</a>
                </div>
            `;
            return;
        }
        
        let html = `
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Дата</th>
                        <th>Состав</th>
                        <th>Сумма</th>
                        <th>Доставка</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.orders.forEach((order, index) => {
            const orderNumber = index + 1;
            const date = order.created_at ? new Date(order.created_at).toLocaleString('ru-RU') : '—';
            const dishes = this.getDishesText(order);
            const total = this.calculateTotal(order);
            const delivery = this.formatDeliveryTime(order);
            
            const orderId = String(order.id);
            
            html += `
                <tr data-order-id="${orderId}">
                    <td class="order-number">${orderNumber}</td>
                    <td class="order-date">${date}</td>
                    <td class="order-dishes">${dishes}</td>
                    <td class="order-price">${total}₽</td>
                    <td class="order-time">${delivery}</td>
                    <td class="actions-cell">
                        <button class="action-button view" onclick="ordersManager.viewOrder('${orderId}')" title="Просмотр">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="action-button edit" onclick="ordersManager.editOrder('${orderId}')" title="Редактировать">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-button delete" onclick="ordersManager.deleteOrder('${orderId}')" title="Удалить">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    getDishesText(order) {
        const dishes = [];
        if (order.soup_id) dishes.push(this.getDishNameById(order.soup_id));
        if (order.salad_id) dishes.push(this.getDishNameById(order.salad_id));
        if (order.main_course_id) dishes.push(this.getDishNameById(order.main_course_id));
        if (order.drink_id) dishes.push(this.getDishNameById(order.drink_id));
        if (order.dessert_id) dishes.push(this.getDishNameById(order.dessert_id));
        
        if (dishes.length === 0) return '—';
        
        const text = dishes.join(', ');
        return text.length > 150 ? text.substring(0, 47) + '...' : text;
    }

    getDishNameById(dishId) {
        if (!dishId) return '';
        
        // Ищем в загруженных блюдах
        const dish = this.allDishes.find(d => d.id == dishId);
        if (dish && dish.name) {
            return dish.name;
        }
        
        // Если блюдо не найдено в массиве, возвращаем ID
        return `Блюдо #${dishId}`;
    }

    calculateTotal(order) {
        let total = 0;
        
        // Ищем цены блюд
        const getPrice = (dishId) => {
            const dish = this.allDishes.find(d => d.id == dishId);
            if (dish && dish.price) {
                return parseInt(dish.price) || 300;
            }
            return 300; // Цена по умолчанию
        };
        
        if (order.soup_id) total += getPrice(order.soup_id);
        if (order.salad_id) total += getPrice(order.salad_id);
        if (order.main_course_id) total += getPrice(order.main_course_id);
        if (order.drink_id) total += getPrice(order.drink_id);
        if (order.dessert_id) total += getPrice(order.dessert_id);
        
        return total;
    }

    formatDeliveryTime(order) {
        if (order.delivery_type === 'by_time' && order.delivery_time) {
            const timeStr = String(order.delivery_time).padStart(4, '0');
            const hours = timeStr.substring(0, 2);
            const minutes = timeStr.substring(2, 4);
            return `${hours}:${minutes}`;
        }
        return 'Как можно скорее';
    }

    // ========== ПРОСМОТР ==========
    async viewOrder(orderId) {
        console.log('👁️ Просмотр заказа:', orderId);
        
        const order = this.orders.find(o => String(o.id) === String(orderId));
        
        if (!order) {
            this.showError('Заказ не найден');
            return;
        }
        
        const modalContent = document.getElementById('view-modal-content');
        const date = order.created_at ? new Date(order.created_at).toLocaleString('ru-RU') : '—';
        const dishes = this.getDishesText(order);
        const total = this.calculateTotal(order);
        const delivery = this.formatDeliveryTime(order);
        
        modalContent.innerHTML = `
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Номер заказа:</span>
                    <span class="detail-value">${order.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Дата оформления:</span>
                    <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Имя получателя:</span>
                    <span class="detail-value">${order.full_name || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Телефон:</span>
                    <span class="detail-value">${order.phone || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${order.email || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Адрес доставки:</span>
                    <span class="detail-value">${order.delivery_address || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Время доставки:</span>
                    <span class="detail-value">${delivery}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Состав заказа:</span>
                    <span class="detail-value">${dishes}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Стоимость:</span>
                    <span class="detail-value" style="color: tomato; font-weight: bold;">${total}₽</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Комментарий:</span>
                    <span class="detail-value">${order.comment || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Статус:</span>
                    <span class="detail-value">${order.status || 'принят'}</span>
                </div>
            </div>
        `;
        
        this.openModal('view-modal');
    }

    // ========== РЕДАКТИРОВАНИЕ ==========
    async editOrder(orderId) {
        console.log('✏️ Редактирование заказа:', orderId);
        
        const order = this.orders.find(o => String(o.id) === String(orderId));
        
        if (!order) {
            this.showError('Заказ не найден');
            return;
        }
        
        this.currentOrderId = orderId;
        
        // Заполняем форму
        document.getElementById('edit-order-id').value = orderId;
        document.getElementById('edit-full-name').value = order.full_name || '';
        document.getElementById('edit-phone').value = order.phone || '';
        document.getElementById('edit-email').value = order.email || '';
        document.getElementById('edit-address').value = order.delivery_address || '';
        document.getElementById('edit-comment').value = order.comment || '';
        
        // Получаем элементы формы
        const nowRadio = document.querySelector('#edit-modal input[name="delivery_type"][value="now"]');
        const byTimeRadio = document.querySelector('#edit-modal input[name="delivery_type"][value="by_time"]');
        const timeContainer = document.getElementById('edit-time-container');
        const timeInput = document.getElementById('edit-delivery-time');
        
        if (!nowRadio || !byTimeRadio || !timeContainer || !timeInput) {
            console.error('❌ Не найдены элементы формы редактирования');
            return;
        }
        
        // Настраиваем время доставки
        if (order.delivery_type === 'by_time' && order.delivery_time) {
            byTimeRadio.checked = true;
            timeContainer.style.display = 'block';
            
            const timeStr = String(order.delivery_time).padStart(4, '0');
            const hours = timeStr.substring(0, 2);
            const minutes = timeStr.substring(2, 4);
            timeInput.value = `${hours}:${minutes}`;
            
            timeInput.required = true;
        } else {
            nowRadio.checked = true;
            timeContainer.style.display = 'none';
            timeInput.required = false;
        }
        
        // Обработчики событий
        byTimeRadio.addEventListener('change', () => {
            timeContainer.style.display = 'block';
            timeInput.required = true;
            timeInput.focus();
        });
        
        nowRadio.addEventListener('change', () => {
            timeContainer.style.display = 'none';
            timeInput.required = false;
            timeInput.value = '';
        });
        
        this.openModal('edit-modal');
    }

    // ========== УДАЛЕНИЕ ==========
    async deleteOrder(orderId) {
        console.log('🗑️ Удаление заказа:', orderId);
        
        const order = this.orders.find(o => String(o.id) === String(orderId));
        
        if (!order) {
            this.showError('Заказ не найден');
            return;
        }
        
        this.currentOrderId = orderId;
        
        const date = order.created_at ? new Date(order.created_at).toLocaleDateString('ru-RU') : '—';
        document.getElementById('delete-confirm-text').innerHTML = `
            <p><strong>Вы уверены, что хотите удалить заказ?</strong></p>
            <p>Заказ #${order.id} от ${date}</p>
            <p>Получатель: ${order.full_name || '—'}</p>
        `;
        
        this.openModal('delete-modal');
    }

    // ========== СОХРАНЕНИЕ ИЗМЕНЕНИЙ ==========
    async submitEditForm(event) {
        event.preventDefault();
        
        const orderId = this.currentOrderId;
        const submitButton = event.target.querySelector('button[type="submit"]');
        
        console.log('💾 Сохранение заказа:', orderId);
        
        // Получаем данные
        const orderData = {
            full_name: document.getElementById('edit-full-name').value.trim(),
            phone: document.getElementById('edit-phone').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            delivery_address: document.getElementById('edit-address').value.trim(),
            comment: document.getElementById('edit-comment').value.trim(),
            delivery_type: document.querySelector('#edit-modal input[name="delivery_type"]:checked').value
        };
        
        if (orderData.delivery_type === 'by_time') {
            const timeValue = document.getElementById('edit-delivery-time').value;
            if (timeValue) {
                orderData.delivery_time = timeValue.replace(':', '');
            }
        }
        
        console.log('📝 Данные:', orderData);
        
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Сохранение...';
        }
        
        try {
            // Сохраняем в API
            try {
                await ApiService.updateOrder(orderId, orderData);
                console.log('✅ Сохранено в API');
            } catch (apiError) {
                console.warn('⚠️ API недоступен:', apiError.message);
            }
            
            // Сохраняем локально
            console.log('💾 Сохраняем локально...');
            
            const orderIndex = this.orders.findIndex(o => String(o.id) === String(orderId));
            
            if (orderIndex !== -1) {
                this.orders[orderIndex] = {
                    ...this.orders[orderIndex],
                    ...orderData
                };
                
                const localOrders = JSON.parse(localStorage.getItem('foodConstructOrders') || '[]');
                const localIndex = localOrders.findIndex(o => String(o.id) === String(orderId));
                
                if (localIndex !== -1) {
                    localOrders[localIndex] = {
                        ...localOrders[localIndex],
                        ...orderData,
                        updated_at: new Date().toISOString()
                    };
                    localStorage.setItem('foodConstructOrders', JSON.stringify(localOrders));
                    console.log('✅ Сохранено в localStorage');
                }
                
                this.renderOrders();
                
                this.closeModal('edit-modal');
                this.showNotification('✅ Изменения сохранены', 'success');
                
            } else {
                throw new Error('Заказ не найден');
            }
            
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            this.showError(`Ошибка: ${error.message}`);
            
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Сохранить';
            }
        }
    }

    // ========== ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ==========
    async confirmDelete() {
        const orderId = this.currentOrderId;
        
        console.log('🗑️ Подтверждение удаления:', orderId);
        
        try {
            // Удаляем из API
            try {
                await ApiService.deleteOrder(orderId);
                console.log('✅ Удалено из API');
            } catch (apiError) {
                console.warn('⚠️ API недоступен:', apiError.message);
            }
            
            // Удаляем локально
            console.log('🗑️ Удаляем локально...');
            
            this.orders = this.orders.filter(o => String(o.id) !== String(orderId));
            
            const localOrders = JSON.parse(localStorage.getItem('foodConstructOrders') || '[]');
            const filteredOrders = localOrders.filter(o => String(o.id) !== String(orderId));
            localStorage.setItem('foodConstructOrders', JSON.stringify(filteredOrders));
            
            console.log('✅ Удалено локально');
            
            this.renderOrders();
            
            this.closeModal('delete-modal');
            this.showNotification('✅ Заказ удален', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка удаления:', error);
            this.showError(`Ошибка: ${error.message}`);
        }
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
    openModal(modalId) {
        document.getElementById('modal-overlay').style.display = 'block';
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById('modal-overlay').style.display = 'none';
        document.getElementById(modalId).style.display = 'none';
        this.currentOrderId = null;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: notificationSlideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Глобальные функции
function closeModal(modalId) {
    if (window.ordersManager) window.ordersManager.closeModal(modalId);
}

function confirmDelete() {
    if (window.ordersManager) window.ordersManager.confirmDelete();
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Инициализация OrdersManager...');
    
    window.ordersManager = new OrdersManager();
    window.ordersManager.loadOrders();
    
    // Обработчик формы редактирования
    const editForm = document.getElementById('edit-order-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.ordersManager.submitEditForm(e);
        });
    }
});
