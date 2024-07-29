FROM node:18-alpine

WORKDIR /app

# Установка Python для node-gyp и других инструментов
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

COPY package*.json ./
#COPY pnpm-lock.yaml ./

# Установка зависимостей
RUN pnpm install

COPY . .

# Сборка приложения
RUN pnpm build

EXPOSE 5000

CMD [ "pnpm", "start:prod" ]
