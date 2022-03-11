const CONTROL_PACKET_ID = 0x33;
const CONTROL_KEEPALIVE_ID = 0xaa;
const CONTROL_DIY_ID = 0xa1;

const CMD_POWER = 0x33;
const CMD_BRIGH = 0x04;
const CMD_COLOR = 0x05;

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

    white(b1, b2, b3, b4, b5, s1, s2) {
        return prepareMsg([
            CONTROL_PACKET_ID,
            CMD_COLOR, 0x15, 0x01,
            0xFF, 0xFF, 0xFF,
            b1, b2, b3, b4, b5,
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

    diy() {
        let opts = {
            name: 0x3b, //no clue
            style: 0x00,
            style_mode: 0x00,
            speed: 98, //percent,
            colors: [{
                r: 255,
                g: 255,
                b: 255
            }]
        };

        let color_arr = [];

        opts.colors.forEach(c => {
            color_arr.push(c.r, c.g, c.b);
        });

        let data_packets = [];

        //color packet 1
        data_packets.push([
            opts.name,
            opts.style, opts.style_mode,
            opts.speed,
            0x18,
            ...color_arr.slice(0, 11)
        ]);

        //optional color packet 2
        if (color_arr.length > 10) {
            data_packets.push([
                ...color_arr.slice(11),
                0x08
            ]);
        }

        //"combo" style and stylemode
        // data_packets.push([
        //     0x01, 0x00, 0x02, 0x00, 0x03, 0x03
        // ]);

        let ret = [];

        //keepalive
        ret.push([
            CONTROL_KEEPALIVE_ID,
            0x33
        ]);

        //start write
        ret.push([
            CONTROL_DIY_ID, 0x02,
            0x00, data_packets.length
        ]);

        //data
        data_packets.forEach((d, di) => {
            ret.push([
                CONTROL_DIY_ID, 0x02, di + 1,
                ...d
            ]);
        });

        //end write
        ret.push([
            CONTROL_DIY_ID, 0x02,
            0xff
        ]);

        //diy mode (this might not be needed for writing)
        ret.push([
            CONTROL_PACKET_ID,
            CMD_COLOR, 0x0a
        ]);

        return ret.map(prepareMsg);
    },
}