FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY build/ ./build
WORKDIR /app/build
CMD ["node", "main.js"]