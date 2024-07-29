FROM node:16-alpine

WORKDIR /app

# Установка pnpm
RUN npm install -g pnpm

# Копирование файлов package.json и pnpm-lock.yaml
COPY package.json ./
#pnpm-lock.yaml
# Установка зависимостей
RUN pnpm install

# Копирование всех файлов
COPY . .

# Запуск приложения
CMD ["npm", "start"]
