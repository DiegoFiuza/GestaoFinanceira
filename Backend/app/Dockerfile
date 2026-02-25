# 1. Usamos a imagem do Node.js
FROM node:20-alpine

# 2. Definimos a pasta de trabalho dentro do contentor
WORKDIR /usr/src/app

# 3. Copiamos apenas os ficheiros de dependências primeiro (otimiza o cache)
COPY package*.json ./

# 4. Instalamos as dependências
RUN npm install

# 5. Copiamos todo o código da pasta 'app' para o contentor
COPY . .

# 6. Criamos a versão de produção (gera a pasta dist que vi na tua imagem)
RUN npm run build

# 7. Expomos a porta do NestJS
EXPOSE 3000

# 8. Comando para iniciar
CMD ["npm", "run", "start:prod"]