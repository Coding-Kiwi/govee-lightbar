"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIT_BRIGHTNESS = exports.INIT_COLOR = exports.INIT_POWER = exports.CONTROL_PACKET_ID = exports.KEEP_ALIVE_INTERVAL_MS = exports.KEEP_ALIVE_PACKET = exports.EMPTY_COLOR = exports.WRITE_CHAR_UUID = exports.MODELS = exports.H6160_MODEL = exports.H6182_MODEL = void 0;
// ----------------
// Models Supported
// ----------------
// export const H6182_MODEL = "H6182"; // RGB Bluetooth + WiFi TV Backlight LED Strip
exports.H6182_MODEL = "TEMP"; // RGB Bluetooth + WiFi TV Backlight LED Strip
exports.H6160_MODEL = "H6160"; // RGB Bluetooth + WiFi Waterproof 16.4 ft. LED Strip
exports.MODELS = [
    exports.H6182_MODEL,
    exports.H6160_MODEL
];
// -----------------
// General Constants
// -----------------
exports.WRITE_CHAR_UUID = "000102030405060708090a0b0c0d2b11"; // Fixed writing characteristic for all Govee LED strips
exports.EMPTY_COLOR = { red: 0, green: 0, blue: 0 }; // Empty placeholder color with RGB = 0
exports.KEEP_ALIVE_PACKET = "aa010000000000000000000000000000000000ab"; // Packet sent every 2 seconds to keep connection alive
exports.KEEP_ALIVE_INTERVAL_MS = 2000;
exports.CONTROL_PACKET_ID = 0x33;
// -------------
// Initial State
// -------------
exports.INIT_POWER = true;
exports.INIT_COLOR = { red: 0xFF, green: 0xFF, blue: 0xFF };
exports.INIT_BRIGHTNESS = 0xFF;
