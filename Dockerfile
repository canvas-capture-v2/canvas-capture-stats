FROM node:22.14-slim

WORKDIR /app

COPY . .

RUN npm install
EXPOSE 4003

CMD ["npm", "start"]