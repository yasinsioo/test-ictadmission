FROM node:22-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN node src/init.js

EXPOSE 8000

CMD ["npm", "start"]
