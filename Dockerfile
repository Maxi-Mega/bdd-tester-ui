FROM node:26.3-alpine3.24 AS builder

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ .yarn/releases/

# Installing dependencies now, so as not to refetch them all when something in src changes
RUN node .yarn/releases/yarn-4.17.0.cjs install

COPY env.d.ts postcss.config.js tailwind.config.js tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./
COPY index.html .
COPY public/ public/
COPY src/ src/

ARG APP_VERSION=dev

RUN VITE_APP_VERSION=$APP_VERSION node .yarn/releases/yarn-4.17.0.cjs run build --minify=true

FROM nginxinc/nginx-unprivileged:1.31-alpine3.23-slim

WORKDIR /usr/share/nginx/html/bdd-tester/ui

COPY --from=builder /app/dist .
