const kelvinToRgb = require('kelvin-to-rgb');

const {
    CONTROL_PACKET_ID,
    CONTROL_KEEPALIVE_ID,
    CONTROL_WRITE,
    CMD_POWER,
    CMD_BRIGH,
    CMD_COLOR
} = require("./constants");

function hexify(x) {
    let toReturn = x.toString(16)
    return toReturn.length < 2 ? '0' + toReturn : toReturn
}

function prepareMsg(bytes) {
    while (bytes.length < 19) bytes.push(0);

    let checksum = Number(bytes[0]);
    bytes.slice(1).forEach(byte => {
        checksum ^= Number(byte);
    });

    return Buffer.from([...bytes, checksum].map(hexify).join(""), "hex");
}

function buildDataPackages(data) {
    let packets = [];

    //first packet
    let first_packet = [
        CONTROL_WRITE,
        0x00,
        0x01,
        null, //this will hold the amount
        ...data.slice(0, 15)
    ];

    packets.push(first_packet);

    let i = 15;
    while (i <= data.length) {
        if (i + 17 > data.length) {
            //its the last one
            packets.push([
                CONTROL_WRITE,
                0xff,
                ...data.slice(i, i + 17)
            ]);
        } else {
            packets.push([
                CONTROL_WRITE,
                packets.length,
                ...data.slice(i, i + 17)
            ]);
        }

        i += 17;
    }

    packets[0][3] = packets.length;

    return packets.map(prepareMsg);
}

module.exports = {
    rgb(r, g, b, s1, s2) {
        return prepareMsg([
            CONTROL_PACKET_ID,
            CMD_COLOR, 0x15, 0x01,
            r, g, b,
            0x00, 0x00, 0x00, 0x00, 0x00,
            s1, s2
        ]);
    },

    brightness(percent, s1, s2) {
        percent = Math.max(0, Math.min(100, percent));
        return prepareMsg([
            CONTROL_PACKET_ID,
            CMD_COLOR, 0x15, 0x02,
            percent,
            s1, s2
        ]);
    },

    white(k, s1, s2) {
        k = Math.max(2000, Math.min(8900, k));
        let rgb = kelvinToRgb(k);

        let k1 = k >>> 8;
        let k2 = k & 0xFF;

        return prepareMsg([
            CONTROL_PACKET_ID,
            CMD_COLOR, 0x15, 0x01,
            0xFF, 0xFF, 0xFF,
            k1, k2, rgb[0], rgb[1], rgb[2],
            s1, s2
        ]);
    },

    power(state1, state2) {
        let state = 0;
        state += state1 ? 16 : 0;
        state += state2 ? 1 : 0;

        return prepareMsg([
            CONTROL_PACKET_ID,
            CMD_POWER, state
        ]);
    },

    global_brightness(percent) {
        percent = Math.max(0, Math.min(100, percent));

        return prepareMsg([
            CONTROL_PACKET_ID,
            CMD_BRIGH, percent
        ]);
    },

    scene(scene) {
        return prepareMsg([
            CONTROL_PACKET_ID,
            CMD_COLOR, 0x04,
            scene
        ]);
    },

    keepalive() {
        return prepareMsg([
            CONTROL_KEEPALIVE_ID,
            0x33
        ]);
    },

    diy(options = {}) {
        let opts = Object.assign({
            style: 0x00,
            style_mode: 0x00,
            speed: 98, //percent,
            colors: [{
                r: 255,
                g: 255,
                b: 255
            }]
        }, options);

        let color_arr = [];

        opts.colors.forEach(c => {
            color_arr.push(c.r, c.g, c.b);
        });

        //"combo" style and stylemode
        // data_packets.push([
        //     0x01, 0x00, 0x02, 0x00, 0x03, 0x03
        // ]);

        let ret = buildDataPackages([
            0x04,
            opts.style, opts.style_mode,
            opts.speed,
            color_arr.length,
            ...color_arr
        ]);

        //diy mode (this might not be needed for writing)
        ret.push(prepareMsg([
            CONTROL_PACKET_ID,
            CMD_COLOR, 0x0a, 0x01
        ]));

        return ret;
    },
    buildDataPackages
}