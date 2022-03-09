const noble = require("@abandonware/noble");

const MODEL = "Govee_H6054_1146";
const SERVICE = "000102030405060708090a0b0c0d1910";

const WRITE_CHARACTERISTIC = "000102030405060708090a0b0c0d2b11";
const READ_CHARACTERISTIC = "000102030405060708090a0b0c0d2b10";

const CONTROL_PACKET_ID = 0x33;

function hexify(x) {
    let toReturn = x.toString(16)
    return toReturn.length < 2 ? '0' + toReturn : toReturn
}

function assembleMessageWithChecksum(bytes) {
    while (bytes.length < 18) bytes.push(0);

    let checksum = Number(CONTROL_PACKET_ID);
    bytes.forEach(byte => {
        checksum ^= Number(byte);
    });

    return [CONTROL_PACKET_ID, ...bytes, checksum].map(hexify).join("");
}

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
    });

    peripheral.on("connect", (err) => {
        if (err) console.error("error ", err);
        console.log(advertisement.localName + " connected")
    });

    // Connect and find the writing characteristic
    await peripheral.connectAsync();

    let stuffFound = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [WRITE_CHARACTERISTIC, READ_CHARACTERISTIC])
    if (!stuffFound.characteristics) {
        return
    }

    let writeCharacteristic = stuffFound.characteristics.find(c => {
        return c._serviceUuid === SERVICE && c.uuid === WRITE_CHARACTERISTIC;
    });

    async function sendMessage(message) {
        await writeCharacteristic.writeAsync(Buffer.from(message, "hex"), false);
    }

    sendMessage(assembleMessageWithChecksum([0x33, 0x11])); // both on
});


noble.on("scanStart", () => {
    console.log("Scan Started!");
})

noble.on("scanStop", () => {
    console.log("Scan Stopped!");
})

noble.startScanningAsync([], false)