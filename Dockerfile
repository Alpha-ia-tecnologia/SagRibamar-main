# Etapa de construção
FROM node:20.19.0 AS build

WORKDIR /app

# Copiar o código fonte para o contêiner
COPY package*.json ./
RUN npm ci
COPY . .

# Recebe args do docker build / compose
ARG VITE_API_URL
ARG VITE_APP_NAME

# Injeta no processo de build do Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Criar os arquivos de build
RUN npm run build

# Usar uma imagem do Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copiar os arquivos de build para o diretório do Nginx
COPY --from=build /app/dist/ /usr/share/nginx/html
# Configurar o Nginx para sempre retornar index.html em rotas internas
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80 (padrão do Nginx)
EXPOSE 80
# Iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
