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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDiscoveryCallback = exports.registerScanStop = exports.registerScanStart = exports.setPowerOfStrip = exports.setBrightnessOfStrip = exports.setColorOfStrip = exports.getListOfStrips = exports.stopDiscovery = exports.startDiscovery = exports.debug = void 0;
const noble_1 = __importDefault(require("@abandonware/noble"));
const color_1 = require("./color");
const validation_1 = require("./validation");
const goveeLightStripUtil_1 = require("./goveeLightStripUtil");
const constants = __importStar(require("./constants"));
process.env.NOBLE_REPORT_ALL_HCI_EVENTS = "1"; // needed on Linux including Raspberry Pi
let DEBUG = true;
let scanStartCallback;
let scanStopCallback;
let discoveryCallback; // called when a light strip is found and connected
var ledStrips = {};
noble_1.default.on("discover", async (peripheral) => {
    const { id, uuid, address, state, rssi, advertisement } = peripheral;
    if (DEBUG) {
        // Print all discovered devices
        console.log("Discovered", id, uuid, address, state, rssi, advertisement.localName);
    }
    let model = validation_1.isValidPeripheral(peripheral);
    if (model == "") {
        if (DEBUG) {
            // TODO: Print something
        }
        return;
    }
    // Strip already exists
    if (ledStrips[uuid]) {
        return;
    }
    // Save the LED Strip
    if (DEBUG) {
        peripheral.on("disconnect", (err) => {
            console.log(advertisement.localName + " disconnected with error: " + err);
        });
        peripheral.on("connect", (err) => {
            console.log(advertisement.localName + " connected with error: " + err);
        });
    }
    // Connect and find the writing characteristic
    await peripheral.connectAsync();
    let stuffFound = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [constants.WRITE_CHAR_UUID]);
    if (!stuffFound.characteristics) {
        return;
    }
    // Save the Light Strip with Initial State
    let toSave = {
        uuid,
        name: advertisement.localName,
        model,
        writeCharacteristic: stuffFound.characteristics[0],
        color: constants.INIT_COLOR,
        isWhite: false,
        brightness: constants.INIT_BRIGHTNESS,
        power: constants.INIT_POWER
    };
    // Set initial state
    goveeLightStripUtil_1.setInitialState(toSave);
    ledStrips[toSave.uuid] = toSave;
    // Setup Keep Alive for connection
    setInterval(() => {
        goveeLightStripUtil_1.sendKeepAlive(toSave);
        if (DEBUG) {
            console.log("sending KEEP ALIVE");
        }
    }, constants.KEEP_ALIVE_INTERVAL_MS);
    // Setup discovery callback
    if (discoveryCallback) {
        discoveryCallback(toSave);
    }
});
noble_1.default.on("scanStart", () => {
    if (DEBUG) {
        console.log("Scan Started!");
    }
    if (scanStartCallback) {
        scanStartCallback();
    }
});
noble_1.default.on("scanStop", () => {
    if (DEBUG) {
        console.log("Scan Stopped!");
    }
    if (scanStopCallback) {
        scanStopCallback();
    }
});
// expose the debug variable
const debug = (on) => {
    DEBUG = on;
};
exports.debug = debug;
const startDiscovery = async () => {
    await noble_1.default.startScanningAsync([], false);
};
exports.startDiscovery = startDiscovery;
const stopDiscovery = async () => {
    await noble_1.default.stopScanningAsync();
    scanStartCallback = undefined;
    scanStopCallback = undefined;
};
exports.stopDiscovery = stopDiscovery;
const getListOfStrips = () => {
    return ledStrips;
};
exports.getListOfStrips = getListOfStrips;
// CONTROL RELATED EXPORTS
const setColorOfStrip = (ledStrip, newColor, isWhite) => {
    if (DEBUG) {
        console.log('Color: #' + color_1.colorToHex(newColor) + ', White: ' + isWhite + ', Strip: ' + ledStrip.uuid);
    }
    if (!validation_1.isValidColor(newColor)) {
        if (DEBUG) {
            console.log('ERROR: INVALID COLOR');
        }
        // TODO: Make error types
        return;
    }
    ledStrips[ledStrip.uuid] = goveeLightStripUtil_1.setLightStripColor(ledStrip, newColor, isWhite);
    return ledStrips[ledStrip.uuid];
};
exports.setColorOfStrip = setColorOfStrip;
const setBrightnessOfStrip = (ledStrip, newBrightness) => {
    if (!validation_1.isValidValue(newBrightness)) {
        // TODO: Make error types
        return;
    }
    ledStrips[ledStrip.uuid] = goveeLightStripUtil_1.setLightStripBrightness(ledStrip, newBrightness);
    return ledStrips[ledStrip.uuid];
};
exports.setBrightnessOfStrip = setBrightnessOfStrip;
const setPowerOfStrip = (ledStrip, power) => {
    ledStrips[ledStrip.uuid] = goveeLightStripUtil_1.setLightStripPower(ledStrip, power);
    return ledStrips[ledStrip.uuid];
};
exports.setPowerOfStrip = setPowerOfStrip;
const registerScanStart = (callback) => { scanStartCallback = callback; };
exports.registerScanStart = registerScanStart;
const registerScanStop = (callback) => { scanStopCallback = callback; };
exports.registerScanStop = registerScanStop;
const registerDiscoveryCallback = (callback) => { discoveryCallback = callback; };
exports.registerDiscoveryCallback = registerDiscoveryCallback;
__exportStar(require("./goveeLightStrip"), exports);
__exportStar(require("./color"), exports);
