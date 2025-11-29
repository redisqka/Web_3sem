document.addEventListener('DOMContentLoaded', function() {
    // Определяем допустимые комбинации блюд
    const validCombinations = [
        ['soup', 'main', 'starter'],    
        ['soup', 'main', 'drink'],      
        ['soup', 'starter', 'drink'],   
        ['main', 'starter', 'drink'],   
        ['main', 'drink', 'dessert']   
    ];

    function isValidCombination(selectedCategories) {
        return validCombinations.some(combination => {
            return combination.every(category => selectedCategories.includes(category));
        });
    }

    // Функция для определения недостающих блюд
    function getMissingItems(selectedCategories) {
        const selectedCount = selectedCategories.length;
        
       
        if (selectedCount === 0) {
            return {
                isValid: false,
                message: 'Ничего не выбрано. Выберите блюда для заказа',
                type: 'empty'
            };
        }

        
        if (isValidCombination(selectedCategories)) {
            return {
                isValid: true,
                message: '',
                type: 'valid'
            };
        }

        // Анализируем выбранные категории для точного определения недостающего
        const hasSoup = selectedCategories.includes('soup');
        const hasMain = selectedCategories.includes('main');
        const hasStarter = selectedCategories.includes('starter');
        const hasDrink = selectedCategories.includes('drink');
        const hasDessert = selectedCategories.includes('dessert');
        
        const selectedMainCategories = selectedCategories.filter(cat => 
            cat !== 'drink' && cat !== 'dessert'
        ).length;

        // 1: Выбраны только напиток и/или десерт
        if (selectedMainCategories === 0 && (hasDrink || hasDessert)) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо',
                type: 'missing_main_with_drink'
            };
        }

        // 2: Выбран только суп
        if (hasSoup && !hasMain && !hasStarter) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо/салат/стартер',
                type: 'missing_main_or_starter_with_soup'
            };
        }

        // 3: Выбран только салат/стартер
        if (hasStarter && !hasSoup && !hasMain) {
            return {
                isValid: false,
                message: 'Выберите суп или главное блюдо',
                type: 'missing_soup_or_main_with_starter'
            };
        }

        // 4: Выбраны суп + главное, но нет напитка/салата
        if (hasSoup && hasMain && !hasStarter && !hasDrink) {
            return {
                isValid: false,
                message: 'Выберите напиток',
                type: 'missing_drink'
            };
        }

        // 5: Выбраны суп + салат, но нет главного/напитка
        if (hasSoup && hasStarter && !hasMain && !hasDrink) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо',
                type: 'missing_main_with_starter'
            };
        }

        // 6: Выбраны главное + салат, но нет напитка
        if (hasMain && hasStarter && !hasDrink) {
            return {
                isValid: false,
                message: 'Выберите напиток',
                type: 'missing_drink'
            };
        }

        // 7: Выбраны главное + десерт, но нет напитка
        if (hasMain && hasDessert && !hasDrink) {
            return {
                isValid: false,
                message: 'Выберите напиток',
                type: 'missing_drink'
            };
        }

        // не хватает напитка
        return {
            isValid: false,
            message: 'Выберите напиток',
            type: 'missing_drink_general'
        };
    }

    // Функция для показа уведомления
    function showNotification(message) {
        
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <h3 class="notification-title">Внимание</h3>
            <p class="notification-message">${message}</p>
            <button class="notification-button">Окей</button>
        `;
        
        overlay.appendChild(notification);
        document.body.appendChild(overlay);
        
        // Обработчик закрытия уведомления
        const closeButton = notification.querySelector('.notification-button');
        closeButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        // Закрытие по клику на оверлей
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    // Добавляем обработчик отправки формы
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'order-form') {
            e.preventDefault();
            
            // Получаем выбранные категории из глобальной переменной
            const selectedCategories = Object.keys(window.selectedDishes)
                .filter(category => window.selectedDishes[category] !== null);
            
            console.log('Выбранные категории:', selectedCategories); // Для отладки
            
            // Проверяем комбинацию
            const validation = getMissingItems(selectedCategories);
            
            console.log('Результат проверки:', validation); // Для отладки
            
            if (validation.isValid) {
                // Если комбинация валидна, отправляем форму
                // updateFormData() вызывается в order-manager.js
                e.target.submit();
            } else {
                // Показываем уведомление
                showNotification(validation.message);
            }
        }
    });
});