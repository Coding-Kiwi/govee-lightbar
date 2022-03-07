"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToColor = exports.colorToHex = exports.xorColor = void 0;
const util_1 = require("./util");
const xorColor = (c) => {
    return c.red ^ c.blue ^ c.green;
};
exports.xorColor = xorColor;
const colorToHex = (c) => {
    return util_1.hexify(c.red) + util_1.hexify(c.green) + util_1.hexify(c.blue);
};
exports.colorToHex = colorToHex;
const hexToColor = (s) => {
    return { red: Number("0x" + s.substring(0, 2)), green: Number("0x" + s.substring(2, 4)), blue: Number("0x" + s.substring(4, 6)) };
};
exports.hexToColor = hexToColor;
