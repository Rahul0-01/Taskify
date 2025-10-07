# build frontend
FROM node:18-alpine AS build
WORKDIR /app

# copy package.json / package-lock.json and install
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

# copy rest of the frontend code and build
COPY . .
RUN npm run build

# production nginx image
FROM nginx:stable-alpine
# create directory for nginx config
RUN mkdir -p /etc/nginx/conf.d

# copy build artifacts
COPY --from=build /app/build /usr/share/nginx/html

# copy a custom nginx config to support SPA routing / API proxying
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
