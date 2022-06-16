FROM node:16-alpine AS builder
COPY . /app/
WORKDIR /app/
RUN rm -rf dist/* node_modules \
    && ls -l \
    && npm install \
    && npm run build

FROM nginx:1.21
USER root
RUN rm -rf ./*
COPY ./nginx.conf /opt/bitnami/nginx/conf/server_blocks/app.conf
COPY --from=builder --chown=root:root /app/dist /app/dist
USER 1001
