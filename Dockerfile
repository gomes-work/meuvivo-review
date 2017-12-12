FROM node:8.9.1-alpine

EXPOSE 8080
RUN mkdir -p /app
WORKDIR /app

RUN apk --no-cache add bash

# Install app dependencies
COPY . /app/
RUN mv /app/docker-entrypoint.sh / && chmod +x /docker-entrypoint.sh
RUN yarn install --production

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["node", "index.js"]

