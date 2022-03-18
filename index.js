const BluetoothHandler = require("./bluetooth");
const commands = require('./commands');
const Lightbar = require("./lightbar");

class LightbarSet {
    constructor() {
        this.swapped = false;

        this.bar_1 = new Lightbar();
        this.bar_2 = new Lightbar();

        this.bluetooth = new BluetoothHandler();
    }

    get left() {
        return this.swapped ? this.bar_2 : this.bar_1;
    }

    get right() {
        return this.swapped ? this.bar_1 : this.bar_2;
    }

    swap() {
        this.swapped = !this.swapped;
    }

    async sendMessage(type, ...args) {
        await this.bluetooth.write(commands[type](...args));
    }

    convertSegmentIndexes(left, right) {
        //we need two 8 bit numbers           00000000 00000000
        //but each side has only 6 segments: 0000 000000 000000
        //mapped like this:                  bbbb bbbbaa aaaaaa

        let s1 = left.reduce((c, i) => c + Math.pow(2, i), 0);
        let s2 = right.reduce((c, i) => c + Math.pow(2, i), 0);
        let combined = (s1 << 6) + s2;
        return [
            combined & 0xFF,
            (combined >> 8) & 0xFF
        ];
    }

    saveColor() {
        let unique_colors = {};
        let unique_brighness = {};

        function assembleSegments(bar, side) {
            let segments = bar.getSegments();

            segments.forEach(s => {
                // unique color
                let key = [s.r, s.g, s.b].join("-");

                if (!unique_colors[key]) {
                    unique_colors[key] = {
                        segments_left: [],
                        segments_right: [],
                        r: s.r,
                        g: s.g,
                        b: s.b
                    };
                }

                unique_colors[key]["segments_" + side].push(s.index);

                //unique brightness
                key = s.brightness;

                if (!unique_brighness[key]) {
                    unique_brighness[key] = {
                        segments_left: [],
                        segments_right: [],
                        brightness: s.brightness
                    };
                }

                unique_brighness[key]["segments_" + side].push(s.index);
            });
        }

        assembleSegments(this.left, "left");
        assembleSegments(this.right, "right");

        Object.values(unique_colors).forEach(async (s) => {
            let seg = this.convertSegmentIndexes(s.segments_left, s.segments_right);
            await this.sendMessage("rgb", s.r, s.g, s.b, seg[0], seg[1]);
        });

        Object.values(unique_brighness).forEach(async (s) => {
            let seg = this.convertSegmentIndexes(s.segments_left, s.segments_right);
            await this.sendMessage("brightness", s.brightness, seg[0], seg[1]);
        });
    }

    async turnOn(left = true, right = true) {
        await this.sendMessage("power", this.swapped ? right : left, this.swapped ? left : right);
    }

    async turnOff(left = true, right = true) {
        await this.sendMessage("power", this.swapped ? !right : !left, this.swapped ? !left : !right);
    }

    async setBrightness(brightness) {
        await this.sendMessage("global_brightness", brightness);
    }

    async diy(options) {
        commands.diy(options).forEach(async cmd => {
            await this.bluetooth.writeCharacteristic.writeAsync(cmd, false);
        });
    }
}

let l = new LightbarSet();

l.turnOn(true, true).then(() => {
    return l.setBrightness(100);
}).then(() => {
    // === moving gradient ===
    return l.diy({
        style: 0x09,
        speed: 50,
        colors: [{
                r: 27,
                g: 161,
                b: 152
            },
            {
                r: 0,
                g: 150,
                b: 176
            },
            {
                r: 0,
                g: 134,
                b: 191
            },
            {
                r: 71,
                g: 113,
                b: 188
            },
            {
                r: 128,
                g: 86,
                b: 163
            },
            {
                r: 157,
                g: 56,
                b: 119
            },
        ]
    });
}).then(() => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // === fixed gradient ===
            l.left.setRGB(0, 0x1b, 0xa1, 0x98);
            l.left.setRGB(1, 0x00, 0x96, 0xB0);
            l.left.setRGB(2, 200, 50, 255);
            l.left.setRGB(3, 200, 50, 255);
            l.left.setRGB(4, 255, 0, 128);
            l.left.setRGB(5, 255, 0, 128);

            l.right.setRGB(0, 0x1b, 0xa1, 0x98);
            l.right.setRGB(1, 0x00, 0x96, 0xB0);
            l.right.setRGB(2, 200, 50, 255);
            l.right.setRGB(3, 200, 50, 255);
            l.right.setRGB(4, 255, 0, 128);
            l.right.setRGB(5, 255, 0, 128);

            l.saveColor();
            resolve();
        }, 15000);
    });
});