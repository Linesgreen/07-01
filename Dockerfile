FROM node:21-alpine

WORKDIR /app

# Установка необходимых инструментов для сборки нативных зависимостей
RUN apk add --no-cache python3 make g++ libc6-compat openssl-dev

# Установка corepack для управления Yarn
RUN npm install -g corepack
RUN corepack enable
RUN corepack prepare yarn@stable --activate

COPY package.json yarn.lock ./

# Установка зависимостей
RUN yarn install

COPY . .

# Сборка приложения
RUN yarn build

EXPOSE 5000

CMD ["yarn", "start:prod"]
