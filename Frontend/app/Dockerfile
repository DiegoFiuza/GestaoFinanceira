FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Build do Next.js
RUN npm run build

EXPOSE 3000

# Next.js roda na 3000 dentro do container, vamos mapear fora
CMD ["npm", "run", "start"]