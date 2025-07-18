# Etapa 1: Build da aplicação
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:stable-alpine

# Copia os arquivos de build para a pasta do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copia configuração personalizada do Nginx (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
