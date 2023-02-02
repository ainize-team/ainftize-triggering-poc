FROM node

COPY . .

RUN yarn install

EXPOSE 80

CMD ["node", "docker/index.js"]