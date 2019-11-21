FROM node:8.11-slim as base

FROM base as build
WORKDIR /build
RUN yarn global add lerna@3.3.0 node-pre-gyp@0.11.0 tslint@5.11.0 typescript@3.0.1 webpack3@4.0.0
RUN apt-get update && \
    apt-get install -y \
      git \
      python \
      xsltproc \
      build-essential && \
    rm -rf /var/lib/apt/lists
COPY package.json .
RUN yarn install
COPY . .
RUN lerna bootstrap && lerna run build
RUN find . -type d -name puppeteer -exec rm -rf {} + && \
    find . -type d -name karma-spec-reporter -exec rm -rf {} + && \
    find . -type d -name prompt -exec rm -rf {} + && \
    find ./packages -maxdepth 2  -type d -name "src" -exec rm -rf {} +

FROM base as release
USER node
WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/packages ./packages
COPY --from=build /build/config/token.json ./packages/token/build/token.json
# ENTRYPOINT ["local-entrypoint.sh"]
CMD ["/usr/local/bin/node", "packages/metering-kit-node/dist/bin/main.js", "--config", "/opt/config/config.json"]
