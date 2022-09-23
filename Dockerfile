FROM node:18-alpine

WORKDIR /app/back
COPY back/package*.json ./
RUN npm install

WORKDIR /app/front
COPY front/package*.json ./
RUN npm install

WORKDIR /app
COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start" ]