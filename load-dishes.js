// load-dishes.js - функция для загрузки блюд с API
async function loadDishes() {
    console.log('Начинаю загрузку блюд с API...');
    
    try {
        const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
        console.log('Запрос к:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получено блюд:', data.length);
        
        // ВАЖНО: Анализируем ВСЕ категории и их синонимы
        console.log('=== ПОЛНЫЙ АНАЛИЗ ДАННЫХ ===');
        
        // Собираем все уникальные категории
        const allCategories = {};
        data.forEach((dish, index) => {
            const cat = dish.category;
            if (cat) {
                if (!allCategories[cat]) {
                    allCategories[cat] = [];
                }
                allCategories[cat].push(dish.name);
            }
            // Первые 5 блюд для примера
            if (index < 5) {
                console.log(`${dish.name}: category="${dish.category}", kind="${dish.kind}", keyword="${dish.keyword}"`);
            }
        });
        
        console.log('=== КАТЕГОРИИ И КОЛИЧЕСТВО ===');
        Object.keys(allCategories).forEach(cat => {
            console.log(`"${cat}": ${allCategories[cat].length} блюд`);
            console.log(`  Примеры: ${allCategories[cat].slice(0, 3).join(', ')}`);
        });
        
        // ЗАПОЛНЯЕМ глобальный массив dishes
        dishes.length = 0;
        dishes.push(...data);
        
        console.log('Блюда успешно загружены в массив dishes');
        return dishes;
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        
        // Тестовые данные с правильными категориями
        console.log('Использую тестовые данные...');
        
        const testDishes = [
            // Супы
            {
                keyword: 'gaspacho',
                name: 'Гаспачо',
                price: 195,
                category: 'soup',
                count: '350 г',
                image: 'http://lab7-api.std-900.ist.mospolytech.ru/images/soups/gazpacho',
                kind: 'veg'
            },
            // Стартеры
            {
                keyword: 'caesar',
                name: 'Цезарь с курицей',
                price: 320,
                category: 'salad',
                count: '250 г',
                image: 'http://lab7-api.std-900.ist.mospolytech.ru/images/salads/caesar',
                kind: 'meat'
            },
            // Горячие блюда
            {
                keyword: 'lasagna',
                name: 'Лазанья',
                price: 385,
                category: 'hot',
                count: '350 г',
                image: 'http://lab7-api.std-900.ist.mospolytech.ru/images/hot/lasagna',
                kind: 'meat'
            },
            // Напитки
            {
                keyword: 'tea',
                name: 'Чай',
                price: 100,
                category: 'drink',
                count: '250 мл',
                image: 'http://lab7-api.std-900.ist.mospolytech.ru/images/drinks/tea',
                kind: 'hot'
            },
            // Десерты
            {
                keyword: 'tiramisu',
                name: 'Тирамису',
                price: 280,
                category: 'dessert',
                count: '150 г',
                image: 'http://lab7-api.std-900.ist.mospolytech.ru/images/desserts/tiramisu',
                kind: 'medium'
            }
        ];
        
        dishes.length = 0;
        dishes.push(...testDishes);
        
        return dishes;
    }
}