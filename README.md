# Store Delivery Web

Веб-версия приложения доставки (React + TypeScript + Zustand + React Router + Yandex Maps JS API).

## Возможности

- 2 вкладки: **Магазины** и **Корзина**
- выбор магазинов и товаров
- редактирование количества товаров в каталоге и в корзине
- ограничение веса заказа до **1 кг** на этапе оформления
- выбор точки доставки на Яндекс Картах (перетаскиваемый маркер)
- отправка заказа на почту через EmailJS

## Быстрый старт

1. Установите Node.js 20+
2. Установите зависимости:

```bash
npm install
```

3. Скопируйте `.env.example` в `.env` и заполните ключи EmailJS
   и ключ Яндекс Карт (`VITE_YANDEX_MAPS_API_KEY`)
4. Запустите:

```bash
npm run dev
```

## Переменные окружения

```env
VITE_GEOCODER_PROVIDER=yandex
VITE_GOOGLE_GEOCODING_API_KEY=
VITE_YANDEX_GEOCODER_API_KEY=
VITE_YANDEX_MAPS_API_KEY=

VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxx
VITE_EMAILJS_PRIVATE_KEY=
VITE_ORDER_RECIPIENT_EMAIL=your_email@example.com
```

`VITE_GEOCODER_PROVIDER`:
- `yandex` - вариант по умолчанию
- `nominatim` - бесплатный fallback
- `google` - Google Geocoding API
- `yandex` - Yandex Geocoder

`VITE_YANDEX_MAPS_API_KEY`:
- обязателен для отображения карты доставки

## Replit

- Импортируйте проект в Replit
- Run command уже настроен в `.replit`
- Если нужно вручную:

```bash
npm install && npm run dev -- --host 0.0.0.0 --port 3000
```

## GitHub

В проект добавлен workflow: `.github/workflows/deploy-pages.yml`.

1. Загрузите проект в GitHub (ветка `main`)
2. В репозитории откройте **Settings -> Pages**
3. Source: **GitHub Actions**
4. После push в `main` сайт соберется и будет опубликован автоматически

Локальная сборка:

```bash
npm run build
```

Артефакты будут в `dist`.
