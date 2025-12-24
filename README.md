# final-mern-project

## Описание проекта

**Цель:** Создать полноценное онлайн-приложение с backend на Node.js/Express/GraphQL и frontend на React, поддерживающее работу в реальном времени через Socket.IO.  

**Домен:** Онлайн-магазин (e-commerce) гаджетов.  

**Роли пользователей:**
- **Admin:** Управление продуктами, категориями.
- **Пользователь:** Просмотр и купить продуктов.

---

## Схема данных

- **User**
  - `email`, `password`, `role`, `isDeleted`
- **Product**
  - `title`, `description`, `price`, `category`, `stock`, `imageUrl`, `isDeleted`
- **Category**
  - `name`, `description`, `isDeleted`
- **Order**
  - `product`, `quantity`, `price`, `totalPrice`, `status`, `userid`

**Связи:**
- User → Order (1:N)
- Category → Product (1:N)

##**Роли студентов**

### Nurbol
- Backend архитектурасы
- GraphQL schema (Query/Mutation)
- JWT аутентификация
- MongoDB модельдері
- Docker (server)

### Nursultan
- Frontend (Next.js App Router)
- UI (TailwindCSS)
- Apollo Client + Zustand
- Реалтайм Subscription UI
- Docker (client)

---
Как проверить Real-time (Subscription):
    Открой сайт в двух разных браузерах (например, Chrome и Edge).
    В Chrome зайди под Админом и нажми кнопку «+ Добавить товар».
    В Edge открой страницу «Все товары».
    Создай товар в Chrome.
    Смотри в Edge: В нижнем правом углу вылетит синее окно «🎁 Новое поступление!», а сам товар появится в списке без перезагрузки.

Демо-ссылки
    http://localhost:3000/login
    http://localhost:4000/graphql
    https://www.canva.com/design/DAG8caI3Cms/5Aj83NEGffDg4JtpdNL-Kg/edit?utm_content=DAG8caI3Cms&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Как запустить локально

### 1. Через Docker

```bash
docker-compose up --build

