# Kvitkova Povnya

Інтернет-магазин квітів (Next.js + Payload CMS) з адмінкою для самостійного редагування контенту.

## Локальний запуск (без Docker)

Потрібен Node.js 20+ і локальний PostgreSQL.

1. Підніми PostgreSQL, напр. одноразовим контейнером:
   ```bash
   docker run -d --name kvitkova-dev-postgres \
     -e POSTGRES_USER=payload -e POSTGRES_PASSWORD=payload -e POSTGRES_DB=kvitkova \
     -p 5433:5432 postgres:16-alpine
   ```
2. Скопіюй `.env.example` в `.env` і за потреби зміни `DATABASE_URI`/`PAYLOAD_SECRET`.
3. Встанови залежності: `npm install`
4. Заповни базу демо-даними (категорії, товари, hero, FAQ, тестові акаунти):
   ```bash
   npm run seed
   ```
   Виведе логіни: `owner@kvitkovapovnya.com` / `owner12345` та `florist@kvitkovapovnya.com` / `florist12345`.
5. Запусти дев-сервер: `npm run dev` → http://localhost:3000 (сайт) і http://localhost:3000/admin (адмінка).

## Скрипти

- `npm run dev` / `npm run build` / `npm run start` — стандартні Next.js команди.
- `npm run seed` — наповнює базу демо-контентом (можна запускати повторно на чистій БД).
- `npm run generate:types` — перегенерувати `src/payload-types.ts` після зміни колекцій/globals у `src/collections`, `src/globals`, `src/payload.config.ts`.
- `npm run generate:importmap` — перегенерувати `src/app/(payload)/admin/importMap.js` (потрібно після додавання кастомних admin-компонентів; для звичайних змін полів не потрібно).

## Структура

- `src/collections/` — Products, Categories, Orders, Users, Media.
- `src/globals/` — Hero (банер на головній), SiteSettings (контакти, міста доставки, FAQ).
- `src/access/` — функції контролю доступу (owner / florist).
- `src/app/(storefront)/` — публічний сайт.
- `src/app/(payload)/` — адмінка та API Payload (згенеровано, не редагувати вручну).
- `src/app/actions/createOrder.ts` — server action оформлення замовлення (без оплати).

## Ролі в адмінці

- **owner** — повний доступ, єдина роль що може створювати/видаляти акаунти.
- **florist** — повний доступ до каталогу, hero, налаштувань сайту та статусів замовлень; не бачить чужі акаунти і не може змінити свою роль.

## Деплой

Продакшн деплой планується на власному VPS клієнта через Docker Compose (Next.js застосунок + PostgreSQL + Caddy для TLS) — буде додано окремо.
