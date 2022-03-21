const BluetoothHandler = require("./bluetooth");
const commands = require('./commands');
const Lightbar = require("./lightbar");

class LightbarSet {
    constructor() {
        this.debug = false;

        this.swapped = false;
        this.left = new Lightbar("left");
        this.right = new Lightbar("right");

        this.left._full_segments = this.convertSegmentIndexes([0, 1, 2, 3, 4, 5], []);
        this.right._full_segments = this.convertSegmentIndexes([], [0, 1, 2, 3, 4, 5]);

        this.bluetooth = new BluetoothHandler(this);
    }

    log(...msg) {
        if (this.debug) console.log(...msg);
    }

    disconnect() {
        return this.bluetooth.disconnect();
    }

    swap() {
        let tmp = this.left;
        this.left = this.right;
        this.right = tmp;

        this.left.position = "left";
        this.right.position = "right";

        this.swapped = !this.swapped;
    }

    async sendMessage(type, ...args) {
        this.log("Sending command '" + type + "' with args " + args.join(", "));
        await this.bluetooth.write(commands[type](...args));
    }

    sendMessages(msgs) {
        return new Promise((resolve, reject) => {
            if (!msgs.length) return resolve();

            let curr = 0;

            const next = () => {
                this.bluetooth.write(msgs[curr]).then(() => {
                    curr++;

                    if (curr < msgs.length) {
                        next();
                    } else {
                        resolve();
                    }
                });
            }
            next();
        });
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
        let kelvin_side = {};

        const assembleSegments = (bar) => {
            if (bar.mode === "kelvin") {
                //set kelvin_side
                kelvin_side[bar.side] = {
                    k: bar.kelvin,
                    s: bar._full_segments
                };
            } else {
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

                    unique_colors[key]["segments_" + bar.side].push(s.index);

                    //unique brightness
                    key = s.brightness;

                    if (!unique_brighness[key]) {
                        unique_brighness[key] = {
                            segments_left: [],
                            segments_right: [],
                            brightness: s.brightness
                        };
                    }

                    unique_brighness[key]["segments_" + bar.side].push(s.index);
                });
            }
        }

        assembleSegments(this.left);
        assembleSegments(this.right);

        let msgs = [];
        Object.values(unique_colors).forEach(async (s) => {
            let seg = this.convertSegmentIndexes(s.segments_left, s.segments_right);
            msgs.push(commands.rgb(s.r, s.g, s.b, seg[0], seg[1]));
            this.log("Saving color [rgb]", s, seg);
        });

        Object.values(unique_brighness).forEach(async (s) => {
            let seg = this.convertSegmentIndexes(s.segments_left, s.segments_right);
            msgs.push(commands.brightness(s.brightness, seg[0], seg[1]));
            this.log("Saving color [brightness]", s.brightness, seg);
        });

        Object.values(kelvin_side).forEach(async (s) => {
            msgs.push(commands.white(s.k, s.s[0], s.s[1]));
            this.log("Saving color [white]", s.k, s.s);
        });

        return this.sendMessages(msgs);
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

    async scene(scene) {
        await this.sendMessage("scene", scene);
    }

    async diy(options) {
        return this.sendMessages(commands.diy(options));
    }
}

module.exports = LightbarSet;