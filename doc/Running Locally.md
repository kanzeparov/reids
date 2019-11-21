# Running Locally

Four components have to be run locally.
1. Buyer Hardware
2. Buyer Virtual Meter
3. Seller Hardware
4. Seller Virtual Meter

Buyer Hardware:
1. Prepare config file, see `deployment-local/buyer/hardware.json` file.
2. `yarn build`
3. Run it as `packages/metering-kit-hardware/dist/bin/main.js --config path/to/buyer/hardware.json`

Buyer Virtual Meter:
1. Prepare config file, see `deployment-local/buyer/virtual.json` file.
2. `yarn build`
3. Run it as `packages/metering-kit-node/dist/bin/main.js --config path/to/buyer/virtual.json`

Seller Hardware:
1. Prepare config file, see `deployment-local/seller/hardware.json` file.
2. `yarn build`
3. Run it as `packages/metering-kit-hardware/dist/bin/main.js --config path/to/seller/hardware.json`

Seller Virtual Meter:
1. Prepare config file, see `deployment-local/seller/virtual.json` file.
2. `yarn build`
3. Run it as `packages/metering-kit-node/dist/bin/main.js --config path/to/seller/virtual.json`

To display logs, set environment variable `DEBUG=*` before starting the commands.

After all the four parts have started, open `http://localhost:8888` in browser. 
