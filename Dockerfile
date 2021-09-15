FROM node:14-alpine

COPY . /app

WORKDIR /app

RUN npm install -g pnpm --registry=https://registry.npm.taobao.org
RUN pnpm install
RUN pnpm run tsc

EXPOSE 3000

CMD npm run serve