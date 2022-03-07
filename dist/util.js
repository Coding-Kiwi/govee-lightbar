"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexify = void 0;
const hexify = (x) => {
    let toReturn = x.toString(16);
    return toReturn.length < 2 ? '0' + toReturn : toReturn;
};
exports.hexify = hexify;
