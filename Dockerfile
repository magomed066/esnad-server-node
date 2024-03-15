FROM node:20

WORKDIR /var/www/app

COPY ./app/package*.json ./

COPY . .

RUN npm install sqlite3 --build-from-source
RUN npm install -g nodemon
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD ["node","./src/index.js"]
