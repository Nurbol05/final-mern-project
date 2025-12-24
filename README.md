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
  - `username`, `email`, `password`, `role`
- **Product**
  - `name`, `description`, `price`, `category`
- **Category**
  - `name`, `description`
- **Order**
  - `userId`, `products`, `status`, `totalPrice`

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

## Как запустить локально

### 1. Через Docker

```bash
docker-compose up --build
