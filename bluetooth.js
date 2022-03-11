const noble = require("@abandonware/noble");
const mitt = require("mitt");

const MODEL = "Govee_H6054_1146";
const SERVICE = "000102030405060708090a0b0c0d1910";

const WRITE_CHARACTERISTIC = "000102030405060708090a0b0c0d2b11";
const READ_CHARACTERISTIC = "000102030405060708090a0b0c0d2b10";

class BluetoothHandler {
    constructor() {
        this.writeCharacteristic = null;
        this.events = mitt();
    }

    discover() {
        noble.on("discover", async (peripheral) => {
            const {
                id,
                uuid,
                address,
                state,
                rssi,
                advertisement
            } = peripheral;

            if (advertisement.localName !== MODEL) return;

            console.log("Discovered", id, uuid, address, state, rssi, advertisement.localName);

            peripheral.on("disconnect", (err) => {
                if (err) console.error("error ", err);
                console.log(advertisement.localName + " disconnected");
                this.events.emit("disconnected");
            });

            peripheral.on("connect", (err) => {
                if (err) console.error("error ", err);
                console.log(advertisement.localName + " connected")
                this.events.emit("connected");
            });

            // Connect and find the writing characteristic
            await peripheral.connectAsync();

            let stuffFound = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [WRITE_CHARACTERISTIC, READ_CHARACTERISTIC])
            if (!stuffFound.characteristics) {
                return
            }

            this.writeCharacteristic = stuffFound.characteristics.find(c => {
                return c._serviceUuid === SERVICE && c.uuid === WRITE_CHARACTERISTIC;
            });

            if (this.writeCharacteristic) {
                this.events.emit("ready");
            }
        });


        noble.on("scanStart", () => {
            this.events.emit("scanstart");
        });

        noble.on("scanStop", () => {
            this.events.emit("scanstop");
        });

        noble.startScanningAsync([], false);
    }
}

module.exports = BluetoothHandler;