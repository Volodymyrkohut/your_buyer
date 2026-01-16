# Інструкція з додавання зображень з Figma

## Проблема
Зображення з Figma не були автоматично завантажені через обмеження API (rate limits).

## Рішення - два способи

### Спосіб 1: Експорт через Figma UI (Найпростіший)

1. **Відкрийте дизайн в Figma:**
   https://www.figma.com/design/GgvThj8CrZbvXq4beuHs1p/Shopping-Ecommerce-Website-UI--Community-?node-id=3225-5596

2. **Для кожного зображення:**
   - Виберіть елемент з зображенням
   - У правій панелі знайдіть "Export"
   - Натисніть "+" щоб додати налаштування
   - Виберіть: **PNG** або **JPG**, **Scale: 2x**
   - Натисніть "Export" і збережіть

3. **Розмістіть файли:**

```
public/images/
├── hero/
│   └── hero-image.jpg          (жінка в червоному пальті)
├── categories/
│   ├── casual-wear.jpg         (чоловік в червоній сорочці)
│   ├── women-top.jpg           (жінка в кремовій блузці)
│   ├── ethnic-wear.jpg         (жінка в помаранчевому топі)
│   └── kids-wear.jpg           (дитина в світло-блакитному)
├── products/
│   ├── product-1.jpg           (чорна футболка)
│   ├── product-2.jpg           (бежева сумка)
│   ├── product-3.jpg           (сірі кросівки)
│   ├── product-4.jpg           (фіолетове плаття)
│   ├── product-5.jpg           (чорно-рожеве плаття)
│   ├── product-6.jpg           (темно-синя сорочка)
│   ├── product-7.jpg           (чорні підбори)
│   └── product-8.jpg           (сумка з леопардовим принтом)
├── deals/
│   └── deals-image.jpg         (жінка в чорному пальті)
├── instagram/
│   ├── instagram-1.jpg        (жінка в світлому костюмі)
│   ├── instagram-2.jpg        (жінка в червоній сукні)
│   ├── instagram-3.jpg        (жінка в сірому одязі)
│   └── instagram-4.jpg        (чоловік в світло-коричневій куртці)
└── testimonials/
    ├── avatar-1.jpg            (Leslie Alexander)
    ├── avatar-2.jpg            (Jacob Jones)
    └── avatar-3.jpg            (Jenny Wilson)
```

### Спосіб 2: Через Figma API (Для автоматизації)

1. **Отримайте Personal Access Token:**
   - Відкрийте: https://www.figma.com/developers/api#access-tokens
   - Створіть новий токен

2. **Знайдіть Node IDs:**
   - Відкрийте дизайн в Figma
   - Виберіть елемент
   - Подивіться на URL - там буде `node-id=XXXX-YYYY`
   - Перетворіть на формат `XXXX:YYYY`

3. **Оновіть скрипт:**
   - Відкрийте `scripts/export-figma-images.js`
   - Оновіть `imageMapping` з вашими Node IDs

4. **Запустіть скрипт:**
   ```bash
   export FIGMA_TOKEN=your_token_here
   node scripts/export-figma-images.js
   ```

## Важливо

- Всі зображення мають бути в форматі JPG або PNG
- Рекомендований розмір: не більше 500KB на файл
- Scale: 2x для retina дисплеїв
- Після додавання зображень вони автоматично відображатимуться на сайті

## Поточна ситуація

Зараз компоненти використовують `SafeImage`, який показує placeholder, якщо зображення відсутнє. Після додавання реальних зображень вони автоматично підхопляться.
