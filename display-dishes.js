// display-dishes.js - отображение блюд на странице
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM загружен, начинаю отображение блюд...');
    
    try {
        console.log('Вызываю loadDishes()...');
        await loadDishes();
        
        console.log('Массив dishes содержит:', dishes.length, 'блюд');
        
        if (dishes.length === 0) {
            console.error('Массив dishes пустой!');
            showErrorMessage('Меню временно недоступно');
            return;
        }
        
        // Сортируем по алфавиту
        dishes.sort((a, b) => a.name.localeCompare(b.name));
        
        // Показываем все уникальные категории для проверки
        const allCategories = [...new Set(dishes.map(dish => dish.category))];
        console.log('Все категории из API:', allCategories);
        
        // ОТОБРАЖАЕМ КАТЕГОРИИ С ПРАВИЛЬНЫМИ НАЗВАНИЯМИ
        displayCategory('soup', '#soups .dish-grid', 'Супы');
        displayCategory('salad', '#starters .dish-grid', 'Салаты');
        displayCategory('main-course', '#mains .dish-grid', 'Горячие блюда');
        displayCategory('drink', '#drinks .dish-grid', 'Напитки');
        displayCategory('dessert', '#desserts .dish-grid', 'Десерты');
        
        // Проверяем результаты
        checkDisplayResults();
        
        console.log('Отображение завершено!');
        
    } catch (error) {
        console.error('Критическая ошибка:', error);
        showErrorMessage('Ошибка загрузки меню: ' + error.message);
    }
    
    function displayCategory(category, selector, categoryName) {
        const grid = document.querySelector(selector);
        
        if (!grid) {
            console.error('Не найден элемент:', selector);
            return;
        }
        
        // Фильтруем блюда по точному названию категории
        const categoryDishes = dishes.filter(dish => dish.category === category);
        
        console.log(`Категория "${category}" (${categoryName}): ${categoryDishes.length} блюд`);
        
        // Очищаем сетку
        grid.innerHTML = '';
        
        if (categoryDishes.length === 0) {
            // Если нет блюд в этой категории
            grid.innerHTML = `<p class="no-dish" style="color: #707070; padding: 20px; text-align: center; font-style: italic;">
                Нет блюд в категории "${categoryName}"
            </p>`;
            return;
        }
        
        // Создаем карточки для каждого блюда
        categoryDishes.forEach(dish => {
            const card = createDishCard(dish);
            grid.appendChild(card);
        });
    }
    
    function createDishCard(dish) {
        const article = document.createElement('article');
        article.className = 'dish-card';
        article.setAttribute('data-dish', dish.keyword || 'unknown');
        article.setAttribute('data-kind', dish.kind || 'all');
        article.setAttribute('data-category', dish.category || 'unknown');
        
        // Проверяем, выбрано ли это блюдо в localStorage
        const order = StorageManager.getOrder();
        const isSelected = order[dish.category] === dish.keyword;
        
        if (isSelected) {
            article.classList.add('selected');
        }
        
        // Используем изображение из API
        let imageUrl = dish.image;
        if (!imageUrl || imageUrl === '' || !imageUrl.startsWith('http')) {
            // Заглушка, если нет изображения
            const color = getColorForCategory(dish.category);
            const shortName = dish.name.length > 25 ? dish.name.substring(0, 22) + '...' : dish.name;
            imageUrl = `https://via.placeholder.com/300x200/${color}/FFFFFF?text=${encodeURIComponent(shortName)}`;
        }
        
        article.innerHTML = `
            <img class="dish-image" src="${imageUrl}" alt="${dish.name}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200/cccccc/333333?text=${encodeURIComponent(dish.name.substring(0, 20))}'">
            <h3 class="dish-name">${dish.name}</h3>
            <p class="dish-price">${dish.price}₽</p>
            <p class="dish-weight">${dish.count || 'не указано'}</p>
            <button class="dish-button" type="button">Добавить</button>
        `;
        
        return article;
    }
    
    function getColorForCategory(category) {
        // Разные цвета для разных категорий
        const colors = {
            'soup': 'FF6347',        // tomato
            'salad': '32CD32',       // limegreen
            'main-course': '1E90FF', // dodgerblue
            'drink': '9370DB',       // mediumpurple
            'dessert': 'FF69B4'      // hotpink
        };
        return colors[category] || 'cccccc';
    }
    
    function checkDisplayResults() {
        // Проверяем, сколько блюд отобразилось
        console.log('=== РЕЗУЛЬТАТЫ ОТОБРАЖЕНИЯ ===');
        
        const sections = [
            { category: 'soup', selector: '#soups .dish-grid', name: 'Супы' },
            { category: 'salad', selector: '#starters .dish-grid', name: 'Салаты' },
            { category: 'main-course', selector: '#mains .dish-grid', name: 'Горячие блюда' },
            { category: 'drink', selector: '#drinks .dish-grid', name: 'Напитки' },
            { category: 'dessert', selector: '#desserts .dish-grid', name: 'Десерты' }
        ];
        
        sections.forEach(section => {
            const grid = document.querySelector(section.selector);
            if (grid) {
                const cards = grid.querySelectorAll('.dish-card').length;
                const apiCount = dishes.filter(d => d.category === section.category).length;
                console.log(`${section.name}: ${cards} карточек (в API: ${apiCount} блюд)`);
            }
        });
    }
    
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #ffebee;
            border: 2px solid #f44336;
            color: #c62828;
            padding: 20px;
            margin: 20px;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
        `;
        errorDiv.textContent = message;
        
        const main = document.querySelector('main');
        if (main) {
            main.prepend(errorDiv);
        }
    }
});