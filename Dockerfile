FROM node:21-alpine

WORKDIR /app

# Установка yarn нужной версии
RUN npm install -g yarn@4.1.0

COPY package.json yarn.lock ./

# Установка зависимостей
RUN yarn install --force

COPY . .

# Сборка приложения
RUN yarn build

EXPOSE 5000

CMD ["yarn", "start:prod"]
