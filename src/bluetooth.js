const noble = require("./noble");

const {
    BT_MODEL,
    BT_SERVICE,
    BT_WRITE_CHARACTERISTIC,
    BT_READ_CHARACTERISTIC
} = require("./constants");

class BluetoothHandler {
    constructor(set) {
        this.writeCharacteristic = null;
        this.connected = false;
        this.connect_cb = () => {};

        this.set = set;

        noble.on("discover", async (peripheral) => {
            if (peripheral.advertisement.localName !== BT_MODEL) return;
            await noble.stopScanningAsync();

            peripheral.on("disconnect", (err) => {
                if (err) console.error("error ", err);
                this.set.log(peripheral.advertisement.localName + " disconnected");
                this.connected = false;
            });

            peripheral.on("connect", async (err) => {
                if (err) console.error("error ", err);
                this.set.log(peripheral.advertisement.localName + " connected")
                this.connected = true;

                let stuffFound = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync([], [BT_WRITE_CHARACTERISTIC, BT_READ_CHARACTERISTIC])
                if (!stuffFound.characteristics) {
                    return
                }

                this.writeCharacteristic = stuffFound.characteristics.find(c => {
                    return c._serviceUuid === BT_SERVICE && c.uuid === BT_WRITE_CHARACTERISTIC;
                });

                this.connect_cb();
            });

            this.peripheral = peripheral;
            await this.peripheral.connectAsync();
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.connect_cb = resolve;

            if (this.peripheral) {
                this.set.log("Reconnecting");
                this.peripheral.connectAsync();
            } else {
                this.set.log("Starting scan");
                noble.startScanningAsync([], false);
            }
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.peripheral) {
                this.set.log("Disconnecting");

                this.writeCharacteristic = null;
                this.peripheral.disconnectAsync().then(() => {
                    this.peripheral = null;
                    noble.stop();
                }).then(resolve);
            } else {
                resolve();
            }
        });
    }

    async write(buffer) {
        if (!this.connected) {
            this.set.log("Connecting...");
            await this.connect();
        }

        this.set.log("Bluetooth writing: ", buffer);

        return await this.writeCharacteristic.writeAsync(buffer, false);
    }
}

module.exports = BluetoothHandler;