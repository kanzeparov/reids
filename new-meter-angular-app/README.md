# OnderOperator

Project description

## Prepare to start

Install *yarn* and run `yarn install`

## How to run

Run `ng serve` for a dev server

## How to run with Docker

Run `docker-compose build`, then `docker-compose up`

## How to see the app

Navigate to `http://localhost:4201/` to see the app.

## How to build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/onder-meter-ui` directory.

To serve properly with `nginx`, use `try_files $uri $uri/ /index.html;` instead of `try_files $uri $uri/ =404;`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
