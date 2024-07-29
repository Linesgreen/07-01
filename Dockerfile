FROM node:21-bullseye-slim

WORKDIR /app



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
