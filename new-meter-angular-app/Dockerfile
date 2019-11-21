FROM node:10.13-slim as base

WORKDIR /app

RUN apt-get update && \
    apt-get install -y rsync && \
    rm -rf /var/lib/apt/lists

RUN yarn global add yarn@latest @angular/cli

ENV NODE_PATH /usr/local/lib/app_node_modules
RUN mkdir $NODE_PATH && \
    chmod -R 777 $NODE_PATH

COPY .yarnrc .
COPY package.json .
RUN yarn install --modules-folder $NODE_PATH
COPY . .

CMD ["ng", "serve", "--host", "0.0.0.0"]
