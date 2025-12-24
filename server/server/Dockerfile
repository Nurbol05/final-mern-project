# Используем Node 20
FROM node:20-alpine

# Устанавливаем curl для healthcheck (нужно для docker-compose)
RUN apk add --no-cache curl

WORKDIR /app

# Сначала копируем только файлы зависимостей
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для компиляции)
RUN npm install

# Копируем остальной код
COPY . .

# Устанавливаем ts-node глобально
RUN npm install -g ts-node typescript

EXPOSE 4000

# Используем npx для запуска, чтобы избежать проблем с путями
CMD ["npx", "ts-node", "src/index.ts"]
FROM node:20-alpine

# Устанавливаем curl для healthcheck (нужно для docker-compose)
RUN apk add --no-cache curl

WORKDIR /app

# Сначала копируем только файлы зависимостей
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для компиляции)
RUN npm install

# Копируем остальной код
COPY . .

# Устанавливаем ts-node глобально
RUN npm install -g ts-node typescript

EXPOSE 4000

# Используем npx для запуска, чтобы избежать проблем с путями
CMD ["npx", "ts-node", "src/index.ts"]