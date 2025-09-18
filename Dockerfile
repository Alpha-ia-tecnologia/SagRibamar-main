# Etapa de construção
FROM node:20.19.0 AS build

WORKDIR /app

# Copiar o código fonte para o contêiner
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Usar uma imagem do Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copiar os arquivos de build para o diretório do Nginx
COPY --from=build /app/dist/ /usr/share/nginx/html
# Configurar o Nginx para sempre retornar index.html em rotas internas
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
CMD ["/entrypoint.sh"]
