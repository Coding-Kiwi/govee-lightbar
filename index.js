const LightbarSet = require("./set");
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