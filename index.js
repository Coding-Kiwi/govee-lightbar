const noble = require("@abandonware/noble");
const readline = require('readline');

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

let writeCharacteristic;

async function sendMessage(message) {
    await writeCharacteristic.writeAsync(Buffer.from(message, "hex"), false);
}

async function setRGB(r, g, b, s1, s2) {
    await sendMessage(assembleMessageWithChecksum([
        0x05, 0x15, 0x01,
        r, g, b,
        0x00, 0x00, 0x00, 0x00, 0x00,
        s1, s2
    ]));
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

    writeCharacteristic = stuffFound.characteristics.find(c => {
        return c._serviceUuid === SERVICE && c.uuid === WRITE_CHARACTERISTIC;
    });

    //0x33 = power
    await sendMessage(assembleMessageWithChecksum([
        0x33, 0x11
    ])); // both on

    //warm white
    /* await sendMessage(assembleMessageWithChecksum([
        0x05, 0x15, 0x01, 0xFF, 0xFF, 0xFF, 0x07, 0xd0, 0xff, 0x89, 0x12,
        0x00, 0x0F
    ])); */

    //0x04 = brightness
    await sendMessage(assembleMessageWithChecksum([
        0x04, 0x64
    ])); //full brightness for both

    /* let s = 0;

    async function next() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        //0x05 = color
        await setRGB(0x00, 0x00, 0x00, 0xFF, 0x0F);
        await setRGB(0xff, 0x00, 0x00, s, 0x00);

        return new Promise(resolve => rl.question(s, ans => {
            rl.close();
            s++;
            resolve();
        }))
    }

    //0x05 = color
    while (s < 256) {
        await next();
    } */

    function blink() {
        setRGB(0x00, 0x00, 0x00, 0x55, 0x05);
        setRGB(0x00, 0x00, 0xff, 0xAA, 0x0A);

        setTimeout(() => {
            setRGB(0x00, 0x00, 0x00, 0xAA, 0x0A);
            setRGB(0xff, 0x00, 0x00, 0x55, 0x05);
        }, 1000);
    }

    setInterval(blink, 2000);

    return;

    // not possible in white mode
    await sendMessage(assembleMessageWithChecksum([
        0x05, 0x15, 0x02,
        0x32,
        0x01, 0x00
    ])); //brightness only for left half
});


noble.on("scanStart", () => {
    console.log("Scan Started!");
})

noble.on("scanStop", () => {
    console.log("Scan Stopped!");
})

noble.startScanningAsync([], false)