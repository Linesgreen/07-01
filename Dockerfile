FROM node:18-alpine

WORKDIR /app

# Установка Python, make и g++
#RUN apk add --no-cache python3 make g++

# Установка pnpm
RUN npm install -g pnpm

# Копирование файлов package.json и pnpm-lock.yaml (если есть)
COPY package.json pnpm-lock.yaml* ./

# Установка зависимостей
RUN pnpm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN pnpm run build

# Запуск приложения
CMD ["pnpm", "start:prod"]