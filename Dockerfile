FROM node:7.10-alpine

EXPOSE 8080
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app/
RUN yarn install --production && yarn clean

CMD [ "node", "index.js" ]

