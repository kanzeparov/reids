FROM node:10.13-slim as base

WORKDIR /app
RUN npm install -g json-server
COPY . .

CMD ["json-server", "db.json", "--routes", "routes.json", "--host", "0.0.0.0"]
