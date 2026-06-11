FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
RUN sed -i 's/^# server_tokens .*/server_tokens off;/' /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.dev.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /run

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]