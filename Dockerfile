FROM node:8.4-alpine

EXPOSE 8080
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY . /app/
RUN yarn install --production && yarn clean

CMD [ "node", "index.js" ]

