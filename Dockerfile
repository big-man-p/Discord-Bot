FROM node:alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY build ./build
RUN npm ci
CMD ["node", "build/main.js"]