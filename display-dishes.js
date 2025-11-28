// display-dishes.js - отображение блюд на странице
document.addEventListener('DOMContentLoaded', function() {
    // Сортируем блюда в алфавитном порядке по названию
    const sortedDishes = dishes.sort((a, b) => a.name.localeCompare(b.name));
    
    // Отображаем блюда по категориям
    displayDishesByCategory('soup', '#soups .dish-grid');
    displayDishesByCategory('starter', '#starters .dish-grid');
    displayDishesByCategory('main', '#mains .dish-grid');
    displayDishesByCategory('drink', '#drinks .dish-grid');
    displayDishesByCategory('dessert', '#desserts .dish-grid');
    
    function displayDishesByCategory(category, gridSelector) {
        const grid = document.querySelector(gridSelector);
        const categoryDishes = sortedDishes.filter(dish => dish.category === category);
        
        categoryDishes.forEach(dish => {
            const dishCard = createDishCard(dish);
            grid.appendChild(dishCard);
        });
    }
    
    function createDishCard(dish) {
        const article = document.createElement('article');
        article.className = 'dish-card';
        article.setAttribute('data-dish', dish.keyword);
        article.setAttribute('data-kind', dish.kind);
        
        article.innerHTML = `
            <img class="dish-image" src="${dish.image}" alt="${dish.name}">
            <h3 class="dish-name">${dish.name}</h3>
            <p class="dish-price">${dish.price}₽</p>
            <p class="dish-weight">${dish.count}</p>
            <button class="dish-button" type="button">Добавить</button>
        `;
        
        return article;
    }
});