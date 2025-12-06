// storage-manager.js
class StorageManager {
    static STORAGE_KEY = 'foodConstructOrder';
    
    // Получить текущий заказ
    static getOrder() {
        const order = localStorage.getItem(this.STORAGE_KEY);
        return order ? JSON.parse(order) : {
            soup: null,
            starter: null,      // В API это 'salad', но у нас в коде 'starter'
            'main-course': null,
            drink: null,
            dessert: null
        };
    }
    
    // Сохранить блюдо в заказ
    static saveDish(category, dish) {
        const order = this.getOrder();
        
        // Приводим категории к единому формату
        let storageCategory = category;
        if (category === 'salad') {
            storageCategory = 'starter'; // В хранилище используем 'starter'
        } else if (category === 'main') {
            storageCategory = 'main-course'; // Приводим к 'main-course'
        }
        
        order[storageCategory] = dish ? dish.keyword : null;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(order));
        this.dispatchUpdateEvent();
        return dish;
    }
    
    // Удалить блюдо из заказа
    static removeDish(category) {
        const order = this.getOrder();
        
        // Приводим категории к единому формату
        let storageCategory = category;
        if (category === 'salad') {
            storageCategory = 'starter';
        } else if (category === 'main') {
            storageCategory = 'main-course';
        }
        
        order[storageCategory] = null;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(order));
        this.dispatchUpdateEvent();
    }
    
    // Очистить весь заказ
    static clearOrder() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.dispatchUpdateEvent();
    }
    
    // Получить количество выбранных блюд
    static getSelectedCount() {
        const order = this.getOrder();
        return Object.values(order).filter(value => value !== null).length;
    }
    
    // Получить выбранные ключи блюд
    static getSelectedKeywords() {
        const order = this.getOrder();
        return Object.values(order).filter(value => value !== null);
    }
    
    // Получить массив категорий с выбранными блюдами (в формате для валидации)
    static getSelectedCategories() {
        const order = this.getOrder();
        const categories = [];
        
        // Преобразуем к формату для валидации
        if (order.soup) categories.push('soup');
        if (order.starter) categories.push('starter'); // 'starter' для валидации
        if (order['main-course']) categories.push('main-course');
        if (order.drink) categories.push('drink');
        if (order.dessert) categories.push('dessert');
        
        return categories;
    }
    
    // Получить полный заказ с данными блюд
    static getOrderWithDetails(dishesArray) {
        const order = this.getOrder();
        const detailedOrder = {};
        
        Object.keys(order).forEach(category => {
            const keyword = order[category];
            if (keyword && dishesArray) {
                detailedOrder[category] = dishesArray.find(d => d.keyword === keyword);
            } else {
                detailedOrder[category] = null;
            }
        });
        
        return detailedOrder;
    }
    
    // Событие обновления заказа
    static dispatchUpdateEvent() {
        window.dispatchEvent(new CustomEvent('orderUpdated'));
    }
}