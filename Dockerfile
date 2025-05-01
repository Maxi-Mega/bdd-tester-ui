FROM node:23-alpine3.21 AS builder

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ .yarn/releases/
RUN corepack enable && yarn set version 4.9.1
# Installing dependencies now, so as not to refetch them all when something in src changes
RUN yarn install

COPY env.d.ts postcss.config.js tailwind.config.js tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./
COPY index.html .
COPY public/ public/
COPY src/ src/

ARG APP_VERSION=dev

RUN VITE_APP_VERSION=$APP_VERSION yarn run build --minify=true

FROM nginxinc/nginx-unprivileged:1.28-alpine3.21-slim

WORKDIR /usr/share/nginx/html/bdd-tester/ui

COPY --from=builder /app/dist .
