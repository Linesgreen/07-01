FROM node:18-alpine

WORKDIR /app


# Установка pnpm
RUN npm install -g pnpm

# Копирование файлов package.json и pnpm-lock.yaml
COPY package.json ./
COPY pnpm-lock.yaml ./

# Установка только production зависимостей
RUN pnpm install --prod

# Копирование всех файлов
COPY . .

# Запуск приложения
CMD ["pnpm", "start"]
