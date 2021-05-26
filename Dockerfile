FROM node:14

WORKDIR /usr/src
COPY . .

ENV NODE_ENV=production

EXPOSE 8080
CMD [ "npm", "run", "start" ]