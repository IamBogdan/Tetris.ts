FROM node:18-alpine

WORKDIR /app/back
COPY back/package*.json ./
RUN npm install

WORKDIR /app/front
COPY front/package*.json ./
RUN npm install

WORKDIR /app
COPY . .

WORKDIR /app/back
EXPOSE 3000
CMD [ "npm", "run", "dev" ]