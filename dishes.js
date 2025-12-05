// dishes.js - массив всех блюд (будет заполнен из API)
let dishes = []; // Изменяем const на let, чтобы можно было обновлять

// Резервные данные на случай проблем с API (можно удалить после тестирования)
/*
dishes = [
    // Супы
    {
        keyword: 'pumpkin-soup',
        name: 'Тыквенный крем-суп',
        price: 320,
        category: 'soup',
        count: '250 мл',
        image: 'images/soup-pumpkin.svg',
        kind: 'veg'
    },
    {
        keyword: 'minestrone',
        name: 'Минестроне с овощами',
        price: 340,
        category: 'soup',
        count: '280 мл',
        image: 'images/soup-minestrone.svg',
        kind: 'veg'
    },
    {
        keyword: 'tomyam',
        name: 'Том-ям с креветками',
        price: 390,
        category: 'soup',
        count: '260 мл',
        image: 'images/soup-tomyam.svg',
        kind: 'fish'
    },
    {
        keyword: 'fish-soup',
        name: 'Уха по-фински',
        price: 370,
        category: 'soup',
        count: '270 мл',
        image: 'images/soup-fish.jpg',
        kind: 'fish'
    },
    {
        keyword: 'borscht',
        name: 'Борщ с говядиной',
        price: 350,
        category: 'soup',
        count: '300 мл',
        image: 'images/soup-borscht.jpg',
        kind: 'meat'
    },
    {
        keyword: 'chicken-soup',
        name: 'Куриный суп с лапшой',
        price: 330,
        category: 'soup',
        count: '290 мл',
        image: 'images/soup-chicken.jpg',
        kind: 'meat'
    },
    
    // Горячие блюда
    {
        keyword: 'tagliatelle',
        name: 'Тальятелле с лососем',
        price: 450,
        category: 'main',
        count: '320 г',
        image: 'images/main-tagliatelle.svg',
        kind: 'fish'
    },
    {
        keyword: 'chicken',
        name: 'Куриная грудка с киноа',
        price: 410,
        category: 'main',
        count: '300 г',
        image: 'images/main-chicken.svg',
        kind: 'meat'
    },
    {
        keyword: 'beef',
        name: 'Говяжьи щёчки с пюре',
        price: 480,
        category: 'main',
        count: '310 г',
        image: 'images/main-beef.svg',
        kind: 'meat'
    },
    {
        keyword: 'salmon',
        name: 'Лосось на гриле',
        price: 520,
        category: 'main',
        count: '280 г',
        image: 'images/main-salmon.jpg',
        kind: 'fish'
    },
    {
        keyword: 'vegetable-stew',
        name: 'Овощное рагу',
        price: 380,
        category: 'main',
        count: '320 г',
        image: 'images/main-vegetable.jpg',
        kind: 'veg'
    },
    {
        keyword: 'mushroom-risotto',
        name: 'Грибной ризотто',
        price: 420,
        category: 'main',
        count: '300 г',
        image: 'images/main-risotto.jpg',
        kind: 'veg'
    },
    
    // Напитки
    {
        keyword: 'blueberry',
        name: 'Черничный морс',
        price: 150,
        category: 'drink',
        count: '250 мл',
        image: 'images/drink-blueberry.svg',
        kind: 'cold'
    },
    {
        keyword: 'matcha',
        name: 'Матча латте',
        price: 180,
        category: 'drink',
        count: '250 мл',
        image: 'images/drink-matcha.svg',
        kind: 'hot'
    },
    {
        keyword: 'orange',
        name: 'Апельсиновый фреш',
        price: 210,
        category: 'drink',
        count: '300 мл',
        image: 'images/drink-orange.svg',
        kind: 'cold'
    },
    {
        keyword: 'cappuccino',
        name: 'Капучино',
        price: 190,
        category: 'drink',
        count: '250 мл',
        image: 'images/drink-cappuccino.jpg',
        kind: 'hot'
    },
    {
        keyword: 'lemonade',
        name: 'Домашний лимонад',
        price: 170,
        category: 'drink',
        count: '350 мл',
        image: 'images/drink-lemonade.jpg',
        kind: 'cold'
    },
    {
        keyword: 'tea',
        name: 'Чай эрл грей',
        price: 140,
        category: 'drink',
        count: '300 мл',
        image: 'images/drink-tea.jpg',
        kind: 'hot'
    },
    
    // Салаты и стартеры
    {
        keyword: 'caesar-salad',
        name: 'Цезарь с курицей',
        price: 320,
        category: 'starter',
        count: '240 г',
        image: 'images/starter-caesar.jpg',
        kind: 'meat'
    },
    {
        keyword: 'shrimp-cocktail',
        name: 'Коктейль из креветок',
        price: 380,
        category: 'starter',
        count: '200 г',
        image: 'images/starter-shrimp.jpg',
        kind: 'fish'
    },
    {
        keyword: 'greek-salad',
        name: 'Греческий салат',
        price: 290,
        category: 'starter',
        count: '260 г',
        image: 'images/starter-greek.jpg',
        kind: 'veg'
    },
    {
        keyword: 'bruschetta',
        name: 'Брускетта с томатами',
        price: 250,
        category: 'starter',
        count: '180 г',
        image: 'images/starter-bruschetta.jpg',
        kind: 'veg'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе',
        price: 310,
        category: 'starter',
        count: '220 г',
        image: 'images/starter-caprese.jpg',
        kind: 'veg'
    },
    {
        keyword: 'hummus',
        name: 'Хумус с лавашом',
        price: 270,
        category: 'starter',
        count: '230 г',
        image: 'images/starter-hummus.jpg',
        kind: 'veg'
    },
    
    // Десерты
    {
        keyword: 'tiramisu',
        name: 'Тирамису',
        price: 280,
        category: 'dessert',
        count: '150 г',
        image: 'images/dessert-tiramisu.jpg',
        kind: 'medium'
    },
    {
        keyword: 'cheesecake',
        name: 'Чизкейк Нью-Йорк',
        price: 320,
        category: 'dessert',
        count: '180 г',
        image: 'images/dessert-cheesecake.jpg',
        kind: 'large'
    },
    {
        keyword: 'chocolate-fondant',
        name: 'Шоколадный фондан',
        price: 240,
        category: 'dessert',
        count: '120 г',
        image: 'images/dessert-fondant.jpg',
        kind: 'small'
    },
    {
        keyword: 'fruit-salad',
        name: 'Фруктовый салат',
        price: 190,
        category: 'dessert',
        count: '200 г',
        image: 'images/dessert-fruit.jpg',
        kind: 'small'
    },
    {
        keyword: 'panna-cotta',
        name: 'Панна котта',
        price: 260,
        category: 'dessert',
        count: '140 г',
        image: 'images/dessert-panna.jpg',
        kind: 'small'
    },
    {
        keyword: 'apple-pie',
        name: 'Яблочный пирог',
        price: 300,
        category: 'dessert',
        count: '160 г',
        image: 'images/dessert-apple.jpg',
        kind: 'medium'
    }
];
*/