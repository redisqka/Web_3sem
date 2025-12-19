// api-service.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С СИНХРОНИЗАЦИЕЙ ДАННЫХ
class ApiService {
    // Базовые настройки API
    static API_URL = 'https://edu.std-900.ist.mospolytech.ru';
    static API_KEY = '85a29bce-19e0-49bc-9422-9a3101ec476d'; // ТВОЙ API КЛЮЧ
    
    // Глобальные данные
    static dishes = [];
    static localOrdersKey = 'foodConstructOrders';
    static lastOrderKey = 'lastOrder';

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ЗАКАЗАМИ ==========

    // 1. ПОЛУЧИТЬ ВСЕ ЗАКАЗЫ (из API + localStorage)
    static async getOrders() {
        console.log('🔄 Получаем все заказы...');
        
        try {
            // Пытаемся получить из API
            const apiOrders = await this.getOrdersFromAPI();
            console.log(`✅ Получено ${apiOrders.length} заказов из API`);
            
            // Получаем локальные заказы
            const localOrders = this.getLocalOrders();
            
            // Объединяем и сортируем
            const allOrders = [...apiOrders, ...localOrders];
            const uniqueOrders = this.removeDuplicateOrders(allOrders);
            
            // Сортируем по дате (новые сверху)
            return uniqueOrders.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            
        } catch (error) {
            console.error('❌ Ошибка получения заказов из API:', error);
            
            // Если API не работает, показываем локальные заказы
            console.log('📱 Используем локальные заказы...');
            return this.getLocalOrders();
        }
    }

    // 2. ПОЛУЧИТЬ ЗАКАЗЫ ИЗ API
    static async getOrdersFromAPI() {
        const url = `${this.API_URL}/labs/api/orders?api_key=${this.API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Ошибка авторизации. Проверьте API ключ!');
            }
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        return await response.json();
    }

    // 3. ПОЛУЧИТЬ ЛОКАЛЬНЫЕ ЗАКАЗЫ (из localStorage)
    static getLocalOrders() {
        const ordersJson = localStorage.getItem(this.localOrdersKey);
        if (!ordersJson) return [];
        
        const orders = JSON.parse(ordersJson);
        console.log(`📱 Найдено ${orders.length} локальных заказов`);
        
        return orders.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
    }

    // 4. УДАЛИТЬ ДУБЛИКАТЫ ЗАКАЗОВ
    static removeDuplicateOrders(orders) {
        const uniqueOrders = [];
        const seenIds = new Set();
        
        orders.forEach(order => {
            if (!seenIds.has(order.id)) {
                seenIds.add(order.id);
                uniqueOrders.push(order);
            }
        });
        
        return uniqueOrders;
    }

    // 5. СОЗДАТЬ НОВЫЙ ЗАКАЗ (сохраняем и в API, и локально)
    static async createOrder(orderData) {
        console.log('🔄 Создаем новый заказ...', orderData);
        
        try {
            // Пытаемся отправить в API
            const apiResult = await this.createOrderInAPI(orderData);
            console.log('✅ Заказ создан в API:', apiResult);
            
            // Также сохраняем локально
            this.saveOrderLocally(apiResult);
            
            return apiResult;
            
        } catch (error) {
            console.error('❌ Ошибка создания заказа в API:', error);
            
            // Создаем локальный заказ
            console.log('📱 Создаем локальный заказ...');
            const localOrder = this.createLocalOrder(orderData);
            
            return localOrder;
        }
    }

    // 6. СОЗДАТЬ ЗАКАЗ В API
    static async createOrderInAPI(orderData) {
        const url = `${this.API_URL}/labs/api/orders?api_key=${this.API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        return await response.json();
    }

    // 7. СОХРАНИТЬ ЗАКАЗ ЛОКАЛЬНО
    static saveOrderLocally(order) {
        // Получаем текущие заказы
        const currentOrders = this.getLocalOrders();
        
        // Добавляем новый заказ
        currentOrders.unshift(order); // Добавляем в начало
        
        // Сохраняем обратно
        localStorage.setItem(this.localOrdersKey, JSON.stringify(currentOrders));
        
        console.log('💾 Заказ сохранен локально:', order.id);
        
        // Также сохраняем как последний заказ
        localStorage.setItem(this.lastOrderKey, JSON.stringify(order));
    }

    // 8. ОБНОВИТЬ ЗАКАЗ
    static async updateOrder(orderId, orderData) {
        console.log(`🔄 Обновляем заказ #${orderId}...`);
        
        try {
            // Обновляем в API
            const url = `${this.API_URL}/labs/api/orders/${orderId}?api_key=${this.API_KEY}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            
            const updatedOrder = await response.json();
            console.log(`✅ Заказ #${orderId} обновлен в API`);
            
            // Обновляем локально
            this.updateOrderLocally(updatedOrder);
            
            return updatedOrder;
            
        } catch (error) {
            console.error(`❌ Ошибка обновления заказа #${orderId}:`, error);
            
            // Обновляем локально
            const localOrder = this.updateOrderLocally({
                id: orderId,
                ...orderData,
                updated_at: new Date().toISOString()
            });
            
            return localOrder;
        }
    }

    // 9. ОБНОВИТЬ ЗАКАЗ ЛОКАЛЬНО
    static updateOrderLocally(updatedOrder) {
        const orders = this.getLocalOrders();
        const index = orders.findIndex(o => o.id === updatedOrder.id);
        
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updatedOrder };
            localStorage.setItem(this.localOrdersKey, JSON.stringify(orders));
            console.log(`💾 Заказ #${updatedOrder.id} обновлен локально`);
        }
        
        return updatedOrder;
    }

    // 10. УДАЛИТЬ ЗАКАЗ
    static async deleteOrder(orderId) {
        console.log(`🔄 Удаляем заказ #${orderId}...`);
        
        try {
            // Удаляем из API
            const url = `${this.API_URL}/labs/api/orders/${orderId}?api_key=${this.API_KEY}`;
            
            const response = await fetch(url, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`✅ Заказ #${orderId} удален из API`);
            
            // Удаляем локально
            this.deleteOrderLocally(orderId);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Ошибка удаления заказа #${orderId}:`, error);
            
            // Удаляем локально
            this.deleteOrderLocally(orderId);
            
            return { success: true, message: 'Заказ удален локально' };
        }
    }

    // 11. УДАЛИТЬ ЗАКАЗ ЛОКАЛЬНО
    static deleteOrderLocally(orderId) {
        const orders = this.getLocalOrders();
        const filteredOrders = orders.filter(o => o.id !== orderId);
        
        localStorage.setItem(this.localOrdersKey, JSON.stringify(filteredOrders));
        console.log(`🗑️ Заказ #${orderId} удален локально`);
    }

    // 12. СОЗДАТЬ ЛОКАЛЬНЫЙ ЗАКАЗ (для тестирования)
    static createLocalOrder(orderData) {
        console.log('📱 Создаем локальный заказ...');
        
        const orderId = 'LOCAL-' + Date.now();
        const orderWithId = {
            id: orderId,
            ...orderData,
            created_at: new Date().toISOString(),
            status: 'принят'
        };
        
        // Сохраняем в localStorage
        this.saveOrderLocally(orderWithId);
        
        console.log('✅ Локальный заказ создан:', orderId);
        
        return orderWithId;
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

    // Подготовить данные заказа из формы
    static prepareOrderData(form) {
        const formData = new FormData(form);
        const order = StorageManager.getOrder();
        
        console.log('📝 Подготавливаем данные заказа...');
        
        // Основные поля
        const orderData = {
            full_name: formData.get('full_name') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            delivery_address: formData.get('delivery_address') || '',
            delivery_type: formData.get('delivery_type') || 'now',
            comment: formData.get('comment') || ''
        };
        
        // Время доставки
        if (orderData.delivery_type === 'by_time') {
            const timeValue = formData.get('delivery_time');
            if (timeValue) {
                orderData.delivery_time = timeValue.replace(':', '');
            }
        }
        
        // ID блюд
        orderData.soup_id = this.getDishId(order.soup);
        orderData.salad_id = this.getDishId(order.starter);
        orderData.main_course_id = this.getDishId(order['main-course']);
        orderData.drink_id = this.getDishId(order.drink);
        orderData.dessert_id = this.getDishId(order.dessert);
        
        // Удаляем пустые поля
        Object.keys(orderData).forEach(key => {
            if (orderData[key] === null || orderData[key] === '' || orderData[key] === undefined) {
                delete orderData[key];
            }
        });
        
        console.log('📦 Данные готовы:', orderData);
        return orderData;
    }

    // Получить ID блюда по keyword
    static getDishId(keyword) {
        if (!keyword) return null;
        
        // Ищем в глобальном массиве блюд
        const dish = window.dishes?.find(d => d.keyword === keyword);
        return dish ? dish.id : null;
    }

    // Получить название блюда по ID
    static getDishNameById(dishId) {
        if (!dishId) return '';
        
        const dish = window.dishes?.find(d => d.id === dishId);
        return dish ? dish.name : `Блюдо #${dishId}`;
    }

    // Форматировать время доставки
    static formatDeliveryTime(order) {
        if (order.delivery_type === 'by_time' && order.delivery_time) {
            const timeStr = order.delivery_time.toString().padStart(4, '0');
            const hours = timeStr.substring(0, 2);
            const minutes = timeStr.substring(2, 4);
            return `${hours}:${minutes}`;
        }
        return 'Как можно скорее (с 07:00 до 23:00)';
    }

    // Посчитать стоимость заказа
    static calculateOrderTotal(order) {
        let total = 0;
        
        const dishIds = [
            order.soup_id,
            order.salad_id,
            order.main_course_id,
            order.drink_id,
            order.dessert_id
        ];
        
        dishIds.forEach(dishId => {
            if (dishId) {
                const dish = window.dishes?.find(d => d.id === dishId);
                if (dish && dish.price) {
                    total += parseInt(dish.price);
                }
            }
        });
        
        return total;
    }

    // Получить состав заказа текстом
    static getOrderDishesText(order) {
        const dishes = [];
        
        if (order.soup_id) dishes.push(this.getDishNameById(order.soup_id));
        if (order.salad_id) dishes.push(this.getDishNameById(order.salad_id));
        if (order.main_course_id) dishes.push(this.getDishNameById(order.main_course_id));
        if (order.drink_id) dishes.push(this.getDishNameById(order.drink_id));
        if (order.dessert_id) dishes.push(this.getDishNameById(order.dessert_id));
        
        return dishes.join(', ') || 'Блюда не выбраны';
    }

    // ========== УНИВЕРСАЛЬНЫЙ МЕТОД ДЛЯ ОТПРАВКИ ==========

    static async submitOrder(form) {
        console.log('🚀 Отправка заказа...');
        
        try {
            // Подготавливаем данные
            const orderData = this.prepareOrderData(form);
            
            // Создаем заказ
            const result = await this.createOrder(orderData);
            
            // Очищаем текущий заказ в корзине
            StorageManager.clearOrder();
            
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка отправки заказа:', error);
            throw error;
        }
    }
}

// Делаем доступным глобально
window.ApiService = ApiService;

// Автоматическая инициализация
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 API Service готов!');
        console.log('🔑 API ключ:', ApiService.API_KEY);
        console.log('🌐 API URL:', ApiService.API_URL);
        
        // Проверяем наличие заказов в localStorage
        const localOrders = ApiService.getLocalOrders();
        console.log(`📊 Локальных заказов: ${localOrders.length}`);
    });
}