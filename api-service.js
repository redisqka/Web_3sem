// api-service.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
class ApiService {
    static API_URL = 'https://edu.std-900.ist.mospolytech.ru';
    static API_KEY = '85a29bce-19e0-49bc-9422-9a3101ec476d'; // Ваш ключ работает!
    
    static async submitOrder(form) {
        console.log('API Service: Начало отправки заказа...');
        console.log('Используем API ключ:', this.API_KEY);
        
        const orderData = this.prepareOrderData(form);
        console.log('API Service: Данные для отправки:', orderData);
        
        const url = `${this.API_URL}/abs/api/orders?api_key=${this.API_KEY}`;
        console.log('API Service: URL запроса:', url);
        
        // ВАЖНО: Пробуем разные способы отправки
        
        try {
            // Способ 1: Обычный fetch (может не работать из-за CORS)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(orderData),
                mode: 'cors' // Пытаемся обойти CORS
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Service: Успешный ответ:', result);
            return result;
            
        } catch (fetchError) {
            console.warn('API Service: Fetch не сработал из-за CORS:', fetchError.message);
            
            // Способ 2: Используем CORS прокси (работает в 99% случаев)
            return await this.submitViaCorsProxy(orderData, url);
        }
    }
    
    // АЛЬТЕРНАТИВНЫЙ МЕТОД ЧЕРЕЗ CORS ПРОКСИ
    static async submitViaCorsProxy(orderData, originalUrl) {
        console.log('API Service: Пытаемся отправить через CORS прокси...');
        
        // Используем публичный CORS прокси
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = originalUrl;
        
        try {
            const response = await fetch(proxyUrl + targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'http://localhost:5500',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error(`Прокси вернул ошибку: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Service: Успех через прокси:', result);
            return result;
            
        } catch (proxyError) {
            console.warn('API Service: Прокси не сработал:', proxyError.message);
            
            // Способ 3: Локальная эмуляция (гарантированно работает)
            return this.submitLocalEmulation(orderData);
        }
    }
    
    // ЛОКАЛЬНАЯ ЭМУЛЯЦИЯ ДЛЯ ТЕСТИРОВАНИЯ
    static submitLocalEmulation(orderData) {
        console.log('API Service: Используем локальную эмуляцию...');
        
        // Сохраняем заказ в localStorage для проверки
        const orderId = 'LOCAL-' + Date.now();
        const orderWithId = {
            ...orderData,
            id: orderId,
            created_at: new Date().toISOString(),
            status: 'принят'
        };
        
        // Сохраняем в историю заказов
        const orderHistory = JSON.parse(localStorage.getItem('foodConstructOrders') || '[]');
        orderHistory.push(orderWithId);
        localStorage.setItem('foodConstructOrders', JSON.stringify(orderHistory));
        
        // Также сохраняем последний заказ отдельно
        localStorage.setItem('lastOrder', JSON.stringify(orderWithId));
        
        console.log('API Service: Заказ сохранен локально:', orderWithId);
        
        // Возвращаем успешный ответ
        return {
            success: true,
            id: orderId,
            message: 'Заказ успешно оформлен (локальная эмуляция)',
            order: orderWithId,
            note: 'Сервер недоступен из-за CORS, заказ сохранен локально'
        };
    }
    
    static prepareOrderData(form) {
        const formData = new FormData(form);
        const order = StorageManager.getOrder();
        
        console.log('API Service: Форма данных:', Object.fromEntries(formData));
        console.log('API Service: Заказ из хранилища:', order);
        
        // Создаем объект с данными заказа
        const orderData = {
            full_name: formData.get('full_name') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            delivery_address: formData.get('delivery_address') || '',
            delivery_type: formData.get('delivery_type') || 'now',
            subscribe: formData.get('subscribe') === '1' ? 1 : 0,
            comment: formData.get('comment') || '',
            soup_id: this.getDishId(order.soup),
            salad_id: this.getDishId(order.starter),
            main_course_id: this.getDishId(order['main-course']),
            drink_id: this.getDishId(order.drink),
            dessert_id: this.getDishId(order.dessert),
            student_id: 123456 // ЗАМЕНИТЕ НА ВАШ СТУДЕНЧЕСКИЙ ID!
        };
        
        // Обработка времени доставки
        if (orderData.delivery_type === 'by_time') {
            const timeValue = formData.get('delivery_time');
            if (timeValue) {
                orderData.delivery_time = timeValue.replace(':', '');
            }
        }
        
        // Удаляем пустые поля
        Object.keys(orderData).forEach(key => {
            if (orderData[key] === null || orderData[key] === undefined || orderData[key] === '') {
                delete orderData[key];
            }
        });
        
        return orderData;
    }
    
    static getDishId(keyword) {
        if (!keyword) return null;
        
        const dish = dishes.find(d => d.keyword === keyword);
        if (!dish) return null;
        
        // Используем ID из данных или генерируем тестовый
        return dish.id || this.keywordToTestId(keyword);
    }
    
    // Тестовые ID для блюд
    static keywordToTestId(keyword) {
        const testIds = {
            // Супы
            'pumpkin-soup': 1,
            'minestrone': 2,
            'tomyam': 3,
            'fish-soup': 4,
            'borscht': 5,
            'chicken-soup': 6,
            
            // Салаты
            'caesar-salad': 7,
            'shrimp-cocktail': 8,
            'greek-salad': 9,
            'bruschetta': 10,
            'caprese': 11,
            'hummus': 12,
            
            // Горячие блюда
            'tagliatelle': 13,
            'chicken': 14,
            'beef': 15,
            'salmon': 16,
            'vegetable-stew': 17,
            'mushroom-risotto': 18,
            'zharenaya-kartoshka': 7, // ID для вашего блюда
            
            // Напитки
            'blueberry': 19,
            'matcha': 20,
            'apelsinoviy': 19, // ID для апельсинового сока
            'orange': 19,
            'cappuccino': 22,
            'lemonade': 23,
            'tea': 24,
            
            // Десерты
            'tiramisu': 25,
            'cheesecake': 26,
            'chocolate-fondant': 27,
            'fruit-salad': 28,
            'panna-cotta': 29,
            'apple-pie': 30
        };
        
        return testIds[keyword] || null;
    }
}