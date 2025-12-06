// order-validation.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Order Validation: Загружен');
    
    // Делаем функции глобальными сразу
    window.validCombinations = [
        ['soup', 'main-course', 'starter'],    
        ['soup', 'main-course', 'drink'],      
        ['soup', 'starter', 'drink'],   
        ['main-course', 'starter', 'drink'],   
        ['main-course', 'drink', 'dessert']   
    ];

    window.isValidCombination = function(selectedCategories) {
        if (!selectedCategories || !Array.isArray(selectedCategories)) {
            console.warn('isValidCombination: selectedCategories не массив:', selectedCategories);
            return false;
        }
        
        console.log('isValidCombination: Проверяем категории:', selectedCategories);
        
        const result = window.validCombinations.some(combination => {
            const isValid = combination.every(category => selectedCategories.includes(category));
            if (isValid) {
                console.log('isValidCombination: Найдено валидное комбо:', combination);
            }
            return isValid;
        });
        
        console.log('isValidCombination: Результат:', result);
        return result;
    };

    window.getMissingItems = function(selectedCategories) {
        console.log('getMissingItems: Категории:', selectedCategories);
        
        if (!selectedCategories || selectedCategories.length === 0) {
            return {
                isValid: false,
                message: 'Ничего не выбрано. Выберите блюда для заказа',
                type: 'empty'
            };
        }

        if (window.isValidCombination(selectedCategories)) {
            return {
                isValid: true,
                message: 'Заказ соответствует одному из доступных комбо',
                type: 'valid'
            };
        }

        // Анализируем
        const hasSoup = selectedCategories.includes('soup');
        const hasMain = selectedCategories.includes('main-course');
        const hasStarter = selectedCategories.includes('starter');
        const hasDrink = selectedCategories.includes('drink');
        const hasDessert = selectedCategories.includes('dessert');
        
        // 1. Только напиток/десерт
        if ((hasDrink || hasDessert) && !hasSoup && !hasMain && !hasStarter) {
            return {
                isValid: false,
                message: 'Добавьте суп, главное блюдо или салат к напитку/десерту',
                type: 'missing_main'
            };
        }
        
        // 2. Только суп
        if (hasSoup && !hasMain && !hasStarter && !hasDrink) {
            return {
                isValid: false,
                message: 'Добавьте главное блюдо или салат + напиток к супу',
                type: 'missing_combo_with_soup'
            };
        }
        
        // 3. Суп + главное, но нет напитка/салата
        if (hasSoup && hasMain && !hasDrink && !hasStarter) {
            return {
                isValid: false,
                message: 'Добавьте напиток или салат к супу и главному блюду',
                type: 'missing_drink_or_salad'
            };
        }
        
        // 4. Суп + салат, но нет главного/напитка
        if (hasSoup && hasStarter && !hasMain && !hasDrink) {
            return {
                isValid: false,
                message: 'Добавьте главное блюдо или напиток к супу и салату',
                type: 'missing_main_or_drink'
            };
        }
        
        // 5. Главное + салат, но нет напитка
        if (hasMain && hasStarter && !hasDrink) {
            return {
                isValid: false,
                message: 'Добавьте напиток к главному блюду и салату',
                type: 'missing_drink'
            };
        }
        
        // 6. Главное + десерт, но нет напитка
        if (hasMain && hasDessert && !hasDrink) {
            return {
                isValid: false,
                message: 'Добавьте напиток к главному блюду и десерту',
                type: 'missing_drink_with_dessert'
            };
        }
        
        // 7. Общий случай - не хватает напитка
        if (!hasDrink) {
            return {
                isValid: false,
                message: 'В любом комбо должен быть напиток. Добавьте напиток.',
                type: 'missing_drink_general'
            };
        }
        
        // 8. Общий случай - не хватает второго элемента комбо
        const selectedCount = selectedCategories.length;
        if (selectedCount < 3) {
            return {
                isValid: false,
                message: 'Выберите еще одно блюдо для составления комбо (нужно минимум 3 блюда)',
                type: 'not_enough_items'
            };
        }
        
        // 9. Неизвестная комбинация
        return {
            isValid: false,
            message: 'Выбранная комбинация не соответствует доступным комбо. Выберите суп + главное + салат/напиток ИЛИ главное + салат + напиток ИЛИ главное + напиток + десерт',
            type: 'invalid_combo'
        };
    };

    console.log('Order Validation: Функции инициализированы');
});