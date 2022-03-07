"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidColor = exports.isValidValue = exports.isValidPeripheral = exports.isH6160 = exports.isH6182 = void 0;
const constants = __importStar(require("./constants"));
// TODO: Change to UUID
const isH6182 = (peripheralName) => peripheralName.includes(constants.H6182_MODEL);
exports.isH6182 = isH6182;
const isH6160 = (peripheralName) => peripheralName.includes(constants.H6160_MODEL);
exports.isH6160 = isH6160;
const isValidPeripheral = (peripheral) => {
    const { address, advertisement } = peripheral;
    if (!advertisement.localName) {
        return "";
    }
    else {
        // Check all the models
        for (var model of constants.MODELS) {
            if (advertisement.localName.includes(model)) {
                return model;
            }
        }
    }
    return "";
};
exports.isValidPeripheral = isValidPeripheral;
const isValidValue = (x) => {
    return (x >= 0 && x <= 0xFF);
};
exports.isValidValue = isValidValue;
const isValidColor = (c) => {
    return exports.isValidValue(c.red) && exports.isValidValue(c.green) && exports.isValidValue(c.blue);
};
exports.isValidColor = isValidColor;
