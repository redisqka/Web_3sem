// orders-manager-fixed.js - РАБОЧИЙ ВАРИАНТ
class OrdersManager {
    constructor() {
        this.orders = [];
        this.currentOrderId = null;
        this.dishes = [];
    }

    async loadOrders() {
        console.log('🔄 Загрузка заказов...');
        
        try {
            // Загружаем блюда
            this.loadDishes();
            
            // Загружаем заказы через ApiService
            const ordersFromApi = await ApiService.getOrders();
            
            // Загружаем локальные заказы
            const localOrders = JSON.parse(localStorage.getItem('foodConstructOrders') || '[]');
            
            // Объединяем и удаляем дубликаты
            const allOrders = [...ordersFromApi, ...localOrders];
            this.orders = this.removeDuplicates(allOrders);
            
            console.log(`✅ Всего заказов: ${this.orders.length}`);
            console.log('📋 Заказы:', this.orders);
            
            this.renderOrders();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            this.showError('Ошибка загрузки заказов');
        }
    }
    
    removeDuplicates(orders) {
        const unique = [];
        const seen = new Set();
        
        orders.forEach(order => {
            // Преобразуем ID к строке для сравнения
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

    loadDishes() {
        // Простые блюда для отображения
        this.dishes = [
            { id: 1, name: 'Тыквенный суп', price: 320 },
            { id: 2, name: 'Минестроне', price: 280 },
            { id: 3, name: 'Том Ям', price: 365 },
            { id: 4, name: 'Борщ', price: 250 },
            { id: 5, name: 'Куриный суп', price: 240 },
            { id: 6, name: 'Цезарь с курицей', price: 320 },
            { id: 7, name: 'Греческий салат', price: 280 },
            { id: 8, name: 'Брускетта', price: 220 },
            { id: 9, name: 'Паста', price: 420 },
            { id: 10, name: 'Курица', price: 380 },
            { id: 11, name: 'Говядина', price: 480 },
            { id: 12, name: 'Лосось', price: 450 },
            { id: 13, name: 'Морс', price: 150 },
            { id: 14, name: 'Апельсиновый сок', price: 160 },
            { id: 15, name: 'Капучино', price: 200 },
            { id: 16, name: 'Чай', price: 100 },
            { id: 17, name: 'Тирамису', price: 280 },
            { id: 18, name: 'Чизкейк', price: 320 },
            { id: 19, name: 'Фрукты', price: 220 }
        ];
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
            
            // ВАЖНО: используем String() для ID
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
        if (order.soup_id) dishes.push(this.getDishName(order.soup_id));
        if (order.salad_id) dishes.push(this.getDishName(order.salad_id));
        if (order.main_course_id) dishes.push(this.getDishName(order.main_course_id));
        if (order.drink_id) dishes.push(this.getDishName(order.drink_id));
        if (order.dessert_id) dishes.push(this.getDishName(order.dessert_id));
        
        if (dishes.length === 0) return '—';
        
        const text = dishes.join(', ');
        return text.length > 50 ? text.substring(0, 47) + '...' : text;
    }

    getDishName(dishId) {
        // Ищем в блюдах
        const dish = this.dishes.find(d => d.id == dishId);
        if (dish) return dish.name;
        
        // Ищем в глобальных блюдах
        if (window.dishes) {
            const globalDish = window.dishes.find(d => d.id == dishId);
            if (globalDish) return globalDish.name;
        }
        
        return `Блюдо #${dishId}`;
    }

    calculateTotal(order) {
        let total = 0;
        
        // Ищем цены блюд
        const getPrice = (dishId) => {
            const dish = this.dishes.find(d => d.id == dishId);
            return dish ? dish.price : 300; // 300 по умолчанию
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
        
        // ВАЖНО: сравниваем как строки
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
   // ========== РЕДАКТИРОВАНИЕ ЗАКАЗА ==========
async editOrder(orderId) {
    console.log('✏️ Редактирование заказа:', orderId);
    
    // Находим заказ (сравниваем как строки)
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
    
    // Убедимся, что элементы существуют
    if (!nowRadio || !byTimeRadio || !timeContainer || !timeInput) {
        console.error('❌ Не найдены элементы формы редактирования');
        return;
    }
    
    // Сначала сбрасываем все обработчики (чтобы не дублировались)
    const newNowRadio = nowRadio.cloneNode(true);
    const newByTimeRadio = byTimeRadio.cloneNode(true);
    nowRadio.parentNode.replaceChild(newNowRadio, nowRadio);
    byTimeRadio.parentNode.replaceChild(newByTimeRadio, byTimeRadio);
    
    // Теперь получаем обновлённые элементы
    const updatedNowRadio = document.querySelector('#edit-modal input[name="delivery_type"][value="now"]');
    const updatedByTimeRadio = document.querySelector('#edit-modal input[name="delivery_type"][value="by_time"]');
    
    // Настраиваем время доставки
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        updatedByTimeRadio.checked = true;
        timeContainer.style.display = 'block';
        
        // Форматируем время из "HHmm" в "HH:MM"
        const timeStr = String(order.delivery_time).padStart(4, '0');
        const hours = timeStr.substring(0, 2);
        const minutes = timeStr.substring(2, 4);
        timeInput.value = `${hours}:${minutes}`;
        
        // Делаем поле времени обязательным
        timeInput.required = true;
    } else {
        updatedNowRadio.checked = true;
        timeContainer.style.display = 'none';
        timeInput.required = false;
    }
    
    // Добавляем новые обработчики событий
    updatedByTimeRadio.addEventListener('change', () => {
        console.log('✅ Выбрано "К указанному времени"');
        timeContainer.style.display = 'block';
        timeInput.required = true;
        timeInput.focus();
    });
    
    updatedNowRadio.addEventListener('change', () => {
        console.log('✅ Выбрано "Как можно быстрее"');
        timeContainer.style.display = 'none';
        timeInput.required = false;
        timeInput.value = ''; // Очищаем поле времени
    });
    
    // Также добавим обработчик на само поле времени для UX
    timeInput.addEventListener('focus', () => {
        // Если время не выбрано, устанавливаем минимальное
        if (!timeInput.value) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeInput.min = `${hours}:${minutes}`;
            
            // Устанавливаем время через час по умолчанию
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            const defaultHours = oneHourLater.getHours().toString().padStart(2, '0');
            const defaultMinutes = Math.ceil(oneHourLater.getMinutes() / 5) * 5;
            const formattedMinutes = defaultMinutes.toString().padStart(2, '0');
            timeInput.value = `${defaultHours}:${formattedMinutes}`;
        }
    });
    
    this.openModal('edit-modal');
}

    // ========== УДАЛЕНИЕ ==========
    async deleteOrder(orderId) {
        console.log('🗑️ Удаление заказа:', orderId);
        
        // ВАЖНО: сравниваем как строки
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
        
        // Время доставки
        if (orderData.delivery_type === 'by_time') {
            const timeValue = document.getElementById('edit-delivery-time').value;
            if (timeValue) {
                orderData.delivery_time = timeValue.replace(':', '');
            }
        }
        
        console.log('📝 Данные:', orderData);
        
        // Блокируем кнопку
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Сохранение...';
        }
        
        try {
            // 1. Сохраняем в API
            try {
                await ApiService.updateOrder(orderId, orderData);
                console.log('✅ Сохранено в API');
            } catch (apiError) {
                console.warn('⚠️ API недоступен:', apiError.message);
            }
            
            // 2. Сохраняем локально (ОБЯЗАТЕЛЬНО)
            console.log('💾 Сохраняем локально...');
            
            // Находим заказ
            const orderIndex = this.orders.findIndex(o => String(o.id) === String(orderId));
            
            if (orderIndex !== -1) {
                // Обновляем в массиве
                this.orders[orderIndex] = {
                    ...this.orders[orderIndex],
                    ...orderData
                };
                
                // Обновляем в localStorage
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
                
                // Обновляем отображение
                this.renderOrders();
                
                // Закрываем окно и показываем уведомление
                this.closeModal('edit-modal');
                this.showNotification('✅ Изменения сохранены', 'success');
                
            } else {
                throw new Error('Заказ не найден');
            }
            
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            this.showError(`Ошибка: ${error.message}`);
            
        } finally {
            // Разблокируем кнопку
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
            // 1. Удаляем из API
            try {
                await ApiService.deleteOrder(orderId);
                console.log('✅ Удалено из API');
            } catch (apiError) {
                console.warn('⚠️ API недоступен:', apiError.message);
            }
            
            // 2. Удаляем локально (ОБЯЗАТЕЛЬНО)
            console.log('🗑️ Удаляем локально...');
            
            // Удаляем из массива
            this.orders = this.orders.filter(o => String(o.id) !== String(orderId));
            
            // Удаляем из localStorage
            const localOrders = JSON.parse(localStorage.getItem('foodConstructOrders') || '[]');
            const filteredOrders = localOrders.filter(o => String(o.id) !== String(orderId));
            localStorage.setItem('foodConstructOrders', JSON.stringify(filteredOrders));
            
            console.log('✅ Удалено локально');
            
            // Обновляем отображение
            this.renderOrders();
            
            // Закрываем окно и показываем уведомление
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
    
    // Добавляем стили для анимации
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes notificationSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Отладочная функция
window.debugOrders = function() {
    if (!window.ordersManager) {
        console.log('❌ OrdersManager не инициализирован');
        return;
    }
    
    console.log('=== ДЕБАГ ЗАКАЗОВ ===');
    console.log('Всего заказов:', window.ordersManager.orders.length);
    
    window.ordersManager.orders.forEach((order, i) => {
        console.log(`${i + 1}. ID: "${order.id}" (тип: ${typeof order.id})`);
        console.log(`   Имя: ${order.full_name}`);
        console.log(`   Можно удалить?`, String(order.id) !== 'undefined');
    });
    
    // Проверяем localStorage
    const localOrders = JSON.parse(localStorage.getItem('foodConstructOrders') || '[]');
    console.log('=== LOCALSTORAGE ===');
    console.log('Заказов в localStorage:', localOrders.length);
    localOrders.forEach((order, i) => {
        console.log(`${i + 1}. ID: "${order.id}" (тип: ${typeof order.id})`);
    });
};