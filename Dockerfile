FROM node:18-alpine

WORKDIR /app

# Установка Python
RUN apk add --no-cache python3 make g++

# Установка pnpm
RUN npm install -g pnpm

# Копирование файлов package.json и pnpm-lock.yaml
COPY package.json ./
#COPY pnpm-lock.yaml ./

# Установка зависимостей
RUN pnpm install --shamefully-hoist
#RUN pnpm install

# Копирование всех файлов
COPY . .

# Запуск приложения
CMD ["npm", "start"]
