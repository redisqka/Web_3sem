// filter-dishes.js - фильтрация блюд по категориям
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики событий для всех кнопок фильтра
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            const filterBtn = e.target;
            const menuSection = filterBtn.closest('.menu-section');
            const categoryGrid = menuSection.querySelector('.dish-grid');
            const allFilterBtns = menuSection.querySelectorAll('.filter-btn');
            
            // Снимаем активный класс со всех кнопок в этой секции
            allFilterBtns.forEach(btn => btn.classList.remove('active'));
            
            // Если кликнули на уже активный фильтр "Все", ничего не делаем
            if (filterBtn.getAttribute('data-kind') === 'all' && filterBtn.classList.contains('active')) {
                return;
            }
            
            // Добавляем активный класс нажатой кнопке
            filterBtn.classList.add('active');
            
            // Получаем выбранный тип фильтра
            const selectedKind = filterBtn.getAttribute('data-kind');
            
            // Фильтруем блюда
            filterDishesByKind(categoryGrid, selectedKind);
        }
    });
    
    function filterDishesByKind(grid, kind) {
        const allDishCards = grid.querySelectorAll('.dish-card');
        
        allDishCards.forEach(card => {
            if (kind === 'all') {
                // Показываем все блюда
                card.style.display = 'flex';
            } else {
                // Показываем только блюда с выбранным kind
                const dishKind = card.getAttribute('data-kind');
                if (dishKind === kind) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }
});