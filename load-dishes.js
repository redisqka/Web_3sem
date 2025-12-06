// load-dishes.js - функция для загрузки блюд с API
let dishesLoaded = false;

async function loadDishes() {
    console.log('loadDishes: Начинаю загрузку блюд с API...');
    
    // Если уже загружены, возвращаем
    if (dishesLoaded && window.dishes && window.dishes.length > 0) {
        console.log('loadDishes: Блюда уже загружены');
        return window.dishes;
    }
    
    try {
        const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
        console.log('loadDishes: Запрос к:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('loadDishes: Получено блюд:', data.length);
        
        // Анализируем данные
        console.log('loadDishes: === ПОЛНЫЙ АНАЛИЗ ДАННЫХ ===');
        const allCategories = {};
        data.forEach((dish, index) => {
            const cat = dish.category;
            if (cat) {
                if (!allCategories[cat]) {
                    allCategories[cat] = [];
                }
                allCategories[cat].push(dish.name);
            }
            // Первые 3 блюда для примера
            if (index < 3) {
                console.log(`loadDishes: Пример: ${dish.name}: category="${dish.category}", keyword="${dish.keyword}"`);
            }
        });
        
        console.log('loadDishes: === КАТЕГОРИИ И КОЛИЧЕСТВО ===');
        Object.keys(allCategories).forEach(cat => {
            console.log(`loadDishes: "${cat}": ${allCategories[cat].length} блюд`);
        });
        
        // ЗАПОЛНЯЕМ глобальный массив dishes
        if (!window.dishes) {
            window.dishes = [];
        }
        window.dishes.length = 0;
        window.dishes.push(...data);
        dishesLoaded = true;
        
        console.log('loadDishes: Блюда успешно загружены в глобальный массив dishes');
        return window.dishes;
        
    } catch (error) {
        console.error('loadDishes: Ошибка загрузки:', error);
        
        // Тестовые данные для отладки
        console.log('loadDishes: Использую тестовые данные...');
        
        const testDishes = [
            {
                keyword: 'pumpkin-soup',
                name: 'Тыквенный крем-суп',
                price: 320,
                category: 'soup',
                count: '250 мл',
                image: 'images/soup-pumpkin.svg',
                kind: 'veg',
                id: 1
            },
            {
                keyword: 'caesar-salad',
                name: 'Цезарь с курицей',
                price: 320,
                category: 'salad',
                count: '240 г',
                image: 'images/starter-caesar.jpg',
                kind: 'meat',
                id: 7
            },
            {
                keyword: 'beef',
                name: 'Говяжьи щёчки с пюре',
                price: 480,
                category: 'main',
                count: '310 г',
                image: 'images/main-beef.svg',
                kind: 'meat',
                id: 15
            },
            {
                keyword: 'blueberry',
                name: 'Черничный морс',
                price: 150,
                category: 'drink',
                count: '250 мл',
                image: 'images/drink-blueberry.svg',
                kind: 'cold',
                id: 19
            },
            {
                keyword: 'tiramisu',
                name: 'Тирамису',
                price: 280,
                category: 'dessert',
                count: '150 г',
                image: 'images/dessert-tiramisu.jpg',
                kind: 'medium',
                id: 25
            }
        ];
        
        if (!window.dishes) {
            window.dishes = [];
        }
        window.dishes.length = 0;
        window.dishes.push(...testDishes);
        dishesLoaded = true;
        
        return window.dishes;
    }
}

// Делаем функцию доступной глобально
window.loadDishes = loadDishes;