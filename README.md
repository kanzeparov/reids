# ØNDER

ØNDER is a commonwealth cryptoeconomic platform for the energy sector. A full description of the platform can be found on our [website](https://onder.tech).

This repository is a monorepo, including core components, commonwealth services and numerous developer tools.

## Packages

| Package                                                   | Description                                               |
| --------------------------------------------------------- | --------------------------------------------------------- |
| [metering-kit-node](packages/metering-kit-node)       | Virtualised metering node                                 |
| [metering-kit-hardware](packages/metering-kit-hardware)       | Hardware meter, sends data to a virtualised metering node |
| [generator-node](./packages/generator-node)               | Energy seller node                                        |
| [frontend](./packages/frontend)                           | Dashboard for the nodes                                   |
| [archiver](./packages/archiver)                           | Gather historical information from the nodes              |
| [common](./packages/common)                               | Common code shared by all the packages                    |

## Install
Pre install. You mast have: node v10,  yarn, xsltproc.
* `yarn global add lerna node-gyp node-pre-gyp  xsltproc ts-node`
* `yarn install`

## Run
One has to run two parties: buyer, and seller. Each is represented as hardware (emulates hardware meter),
and virtual meter (thing that manages private keys, and payment channels).

First, build everything:
```
yarn build
```

Start buyer hardware:
```
DEBUG=* node packages/metering-kit-hardware/dist/bin/main.js --config ./config/buyer-hardware.json
```
Start buyer seller hardware
```
DEBUG=* node packages/metering-kit-hardware/dist/bin/main.js --config ./config/seller-hardware.json
```

Start buyer virtual node:
```
DEBUG=* node packages/metering-kit-node/dist/bin/main.js --config ./config/buyer-virtual.json
```
Start seller virtual node:
```
DEBUG=* node packages/metering-kit-node/dist/bin/main.js --config ./config/seller-virtual.json
```

API is accessible on ports set in `webInterfacePort` and `port` clause in the config file.
Also check `packages/common/src/DefaultPorts.ts`.  

## Configuration

##### Configs for counter
https://www.notion.so/onder/Manufacturing-6cbeddfec69344a497495e9c5dbee026#54e25d5c06644b4d88634f13d2a75330

##### Configs for VM
https://www.notion.so/onder/Run-VM-locally-44bf1eced24f406fa207ef0110fff044
