FROM node:20-alpine AS builder

WORKDIR /app/docs-site

# Install dependencies first (cache layer)
COPY docs-site/package.json docs-site/package-lock.json* ./
RUN npm install

# Copy docs content
COPY docs-site/ .

# Build
RUN npm run docs:build

FROM nginx:alpine
COPY --from=builder /app/docs-site/.vitepress/dist /usr/share/nginx/html
COPY docs-site/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]