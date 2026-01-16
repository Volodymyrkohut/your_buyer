# Інструкція з експорту зображень з Figma

## Швидкий спосіб (через Figma UI)

1. Відкрийте дизайн в Figma: https://www.figma.com/design/GgvThj8CrZbvXq4beuHs1p/Shopping-Ecommerce-Website-UI--Community-?node-id=3225-5596

2. Для кожного зображення:
   - Виберіть елемент з зображенням
   - У правій панелі знайдіть секцію "Export"
   - Натисніть "+" щоб додати налаштування експорту
   - Виберіть формат: PNG або JPG
   - Встановіть scale: 2x (для retina дисплеїв)
   - Натисніть "Export" і збережіть файл

3. Розмістіть зображення в наступних папках:

### Hero Section
- `/public/images/hero/hero-image.jpg` - зображення жінки в червоному пальті з головної секції

### Categories
- `/public/images/categories/casual-wear.jpg` - чоловік в червоній сорочці
- `/public/images/categories/women-top.jpg` - жінка в кремовій блузці
- `/public/images/categories/ethnic-wear.jpg` - жінка в помаранчевому топі
- `/public/images/categories/kids-wear.jpg` - дитина в світло-блакитному топі

### Products (Bestseller)
- `/public/images/products/product-1.jpg` - чорна футболка з білими смугами
- `/public/images/products/product-2.jpg` - бежева сумка з візерунком
- `/public/images/products/product-3.jpg` - сірі кросівки
- `/public/images/products/product-4.jpg` - фіолетове плаття
- `/public/images/products/product-5.jpg` - чорно-рожеве плаття
- `/public/images/products/product-6.jpg` - темно-синя сорочка
- `/public/images/products/product-7.jpg` - чорні підбори
- `/public/images/products/product-8.jpg` - сумка з леопардовим принтом

### Deals of the Month
- `/public/images/deals/deals-image.jpg` - жінка в чорному пальті з капелюхом

### Instagram Stories
- `/public/images/instagram/instagram-1.jpg` - жінка в світлому костюмі
- `/public/images/instagram/instagram-2.jpg` - жінка в червоній сукні
- `/public/images/instagram/instagram-3.jpg` - жінка в сірому одязі
- `/public/images/instagram/instagram-4.jpg` - чоловік в світло-коричневій куртці

### Testimonials
- `/public/images/testimonials/avatar-1.jpg` - аватар Leslie Alexander
- `/public/images/testimonials/avatar-2.jpg` - аватар Jacob Jones
- `/public/images/testimonials/avatar-3.jpg` - аватар Jenny Wilson

## Альтернативний спосіб (через Figma API)

Якщо у вас є Figma Personal Access Token:

1. Отримайте токен: https://www.figma.com/developers/api#access-tokens

2. Встановіть змінну оточення:
```bash
export FIGMA_TOKEN=your_token_here
```

3. Запустіть скрипт (потрібно оновити node IDs в скрипті):
```bash
node scripts/export-figma-images.js
```

## Примітки

- Всі зображення мають бути оптимізовані для веб-використання
- Рекомендований формат: JPG для фотографій, PNG для графіки з прозорістю
- Розмір: не більше 500KB на зображення для швидкого завантаження
- Роздільність: мінімум 2x для retina дисплеїв
