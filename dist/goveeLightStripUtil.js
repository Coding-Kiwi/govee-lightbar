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
exports.setInitialState = exports.sendKeepAlive = exports.setLightStripColor = exports.setLightStripPower = exports.setLightStripBrightness = void 0;
const color_1 = require("./color");
const util_1 = require("./util");
const constants = __importStar(require("./constants"));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Power"] = 1] = "Power";
    MessageType[MessageType["Brightness"] = 4] = "Brightness";
    MessageType[MessageType["Color"] = 5] = "Color";
})(MessageType || (MessageType = {}));
const sendHexMessage = async (lightStrip, message) => {
    await lightStrip.writeCharacteristic.writeAsync(Buffer.from(message, "hex"), false);
};
function assembleMessageWithChecksum(messageType, specialByte, rgbColor, flag, whiteColor) {
    let checksum = constants.CONTROL_PACKET_ID ^ messageType ^ specialByte ^ color_1.xorColor(rgbColor) ^ flag ^ color_1.xorColor(whiteColor);
    return util_1.hexify(constants.CONTROL_PACKET_ID)
        + util_1.hexify(messageType)
        + util_1.hexify(specialByte)
        + color_1.colorToHex(rgbColor)
        + util_1.hexify(flag)
        + color_1.colorToHex(whiteColor)
        + "000000000000000000"
        + util_1.hexify(checksum);
}
//
// ASSUMING ALL PROVIDED VALUES ARE ALREADY VALIDATED
//
const setLightStripBrightness = (lightStrip, newVal) => {
    sendHexMessage(lightStrip, assembleMessageWithChecksum(MessageType.Brightness, newVal, constants.EMPTY_COLOR, 0x0, constants.EMPTY_COLOR));
    lightStrip.brightness = newVal;
    return lightStrip;
};
exports.setLightStripBrightness = setLightStripBrightness;
const setLightStripPower = (lightStrip, newVal) => {
    let flag = newVal ? 1 : 0;
    sendHexMessage(lightStrip, assembleMessageWithChecksum(MessageType.Power, flag, constants.EMPTY_COLOR, 0x0, constants.EMPTY_COLOR));
    lightStrip.power = newVal;
    return lightStrip;
};
exports.setLightStripPower = setLightStripPower;
const setLightStripColor = (lightStrip, newColor, isWhite) => {
    if (isWhite) {
        sendHexMessage(lightStrip, assembleMessageWithChecksum(MessageType.Color, 0x2, constants.EMPTY_COLOR, 0x1, newColor));
    }
    else {
        sendHexMessage(lightStrip, assembleMessageWithChecksum(MessageType.Color, 0x2, newColor, 0x0, constants.EMPTY_COLOR));
    }
    lightStrip.color = newColor;
    return lightStrip;
};
exports.setLightStripColor = setLightStripColor;
const sendKeepAlive = (lightStrip) => {
    sendHexMessage(lightStrip, constants.KEEP_ALIVE_PACKET);
};
exports.sendKeepAlive = sendKeepAlive;
const setInitialState = (lightStrip) => {
    exports.setLightStripColor(lightStrip, constants.INIT_COLOR, true);
    exports.setLightStripBrightness(lightStrip, constants.INIT_BRIGHTNESS);
    exports.setLightStripPower(lightStrip, constants.INIT_POWER);
};
exports.setInitialState = setInitialState;
