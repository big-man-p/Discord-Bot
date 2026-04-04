FROM node:alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY build ./build
RUN npm ci
WORKDIR /app/build
CMD ["node", "main.js"]