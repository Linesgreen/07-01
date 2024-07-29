FROM node:21-alpine

WORKDIR /app



RUN npm install -g pnpm

COPY package*.json ./


# Установка зависимостей
RUN pnpm install

COPY . .

# Сборка приложения
RUN pnpm build

EXPOSE 5000

CMD [ "pnpm", "start:prod" ]
