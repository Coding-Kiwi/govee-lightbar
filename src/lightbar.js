const {
    KELVIN_MIN,
    KELVIN_MAX
} = require("./constants");

class Lightbar {
    constructor(position) {
        this.side = position; //the logical side
        this.position = position; //where it's actually placed

        this.segments = [];

        for (let i = 0; i < 6; i++) {
            this.segments.push({
                brightness: 100,
                r: 0,
                g: 0,
                b: 0
            });
        }

        this.mode = "rgb";
        this.kelvin = 0;
    }

    getSegments() {
        return this.segments.map((s, i) => ({
            index: i,
            ...s
        }));
    }

    setRGB(i, r, g, b) {
        this.segments[i].r = r;
        this.segments[i].g = g;
        this.segments[i].b = b;

        this.mode = "rgb";
    }

    setRGBFull(r, g, b) {
        this.segments.forEach(s => {
            s.r = r;
            s.g = g;
            s.b = b;
        });
        this.mode = "rgb";
    }

    setWhite(k) {
        this.kelvin = Math.max(KELVIN_MIN, Math.min(KELVIN_MAX, k));
        this.mode = "kelvin";
    }
}

module.exports = Lightbar