class Lightbar {
    constructor() {
        this.segments = [];
        for (let i = 0; i < 6; i++) {
            this.segments.push({
                brightness: 100,
                r: 0,
                g: 0,
                b: 0
            });
        }
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
    }
}

module.exports = Lightbar