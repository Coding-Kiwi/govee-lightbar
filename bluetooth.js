const noble = require("@abandonware/noble");

const MODEL = "Govee_H6054_1146";
const SERVICE = "000102030405060708090a0b0c0d1910";

const WRITE_CHARACTERISTIC = "000102030405060708090a0b0c0d2b11";
const READ_CHARACTERISTIC = "000102030405060708090a0b0c0d2b10";

class BluetoothHandler {
    constructor() {
        this.writeCharacteristic = null;
        this.connected = false;
        this.connect_cb = () => {};

        noble.on("discover", async (peripheral) => {
            await noble.stopScanningAsync();

            if (peripheral.advertisement.localName !== MODEL) return;

            peripheral.on("disconnect", (err) => {
                if (err) console.error("error ", err);
                console.log(peripheral.advertisement.localName + " disconnected");
                this.connected = false;
            });

            peripheral.on("connect", async (err) => {
                if (err) console.error("error ", err);
                console.log(peripheral.advertisement.localName + " connected")
                this.connected = true;

                let stuffFound = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync([], [WRITE_CHARACTERISTIC, READ_CHARACTERISTIC])
                if (!stuffFound.characteristics) {
                    return
                }

                this.writeCharacteristic = stuffFound.characteristics.find(c => {
                    return c._serviceUuid === SERVICE && c.uuid === WRITE_CHARACTERISTIC;
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
                this.peripheral.connectAsync();
            } else {
                noble.startScanningAsync([], false);
            }
        });
    }

    async write(buffer) {
        if (!this.connected) await this.connect();
        return await this.writeCharacteristic.writeAsync(buffer, false);
    }
}

module.exports = BluetoothHandler;