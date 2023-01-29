const noble = require("./noble");

const {
    BT_MODEL,
    BT_SERVICE,
    BT_WRITE_CHARACTERISTIC,
    BT_READ_CHARACTERISTIC
} = require("./constants");

const STATUS_MAPPER = require('@abandonware/noble/lib/hci-socket/hci-status');

class BluetoothHandler {
    constructor(set) {
        this.writeCharacteristic = null;
        this.connected = false;
        this.set = set;
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                return resolve();
            }

            noble.on("discover", async (peripheral) => {
                if (peripheral.advertisement.localName !== BT_MODEL) return;

                this.peripheral = peripheral;
                this.set.log(peripheral.advertisement.localName + " found")

                await noble.stopScanningAsync();

                peripheral.once('disconnect', (reason) => {
                    let reason_msg = STATUS_MAPPER[reason];
                    this.set.log(peripheral.advertisement.localName + " disconnected, reason: " + reason_msg + " " + reason);
                    this.connected = false;
                });

                peripheral.once("connect", async (err) => {
                    if (err) console.error("error ", err);
                    this.set.log(peripheral.advertisement.localName + " connected")

                    setTimeout(async () => {
                        let stuffFound = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync([], [BT_WRITE_CHARACTERISTIC, BT_READ_CHARACTERISTIC])
                        if (!stuffFound.characteristics) {
                            return
                        }

                        this.writeCharacteristic = stuffFound.characteristics.find(c => {
                            return c._serviceUuid === BT_SERVICE && c.uuid === BT_WRITE_CHARACTERISTIC;
                        });

                        this.set.log("service and characteristics found");

                        this.connected = true;
                        resolve();
                    }, 100);
                });

                await peripheral.connectAsync();
            });

            noble.startScanningAsync([], false);
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.peripheral) {
                this.set.log("Disconnecting");

                this.writeCharacteristic = null;
                this.peripheral.disconnectAsync().then(() => {
                    this.peripheral = null;
                    this.connected = false;
                    noble.stop();
                }).then(resolve);
            } else {
                resolve();
            }
        });
    }

    async write(buffer) {
        if (!this.connected) {
            this.set.log("Connecting for write");
            await this.connect();
        }

        this.set.log("Bluetooth writing: ", buffer);

        return await this.writeCharacteristic.writeAsync(buffer, false);
    }
}

module.exports = BluetoothHandler;