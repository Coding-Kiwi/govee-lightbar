"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const prompt = prompt_sync_1.default();
index_1.debug(true);
index_1.startDiscovery();
index_1.registerDiscoveryCallback(async (ledStrip) => {
    // while(true)
    // {
    //     const color =  prompt("Enter color: ")
    //     setColorOfStrip(ledStrip, hexToColor(color!))
    // }
    // console.log("found: " + ledStrip.name)
    index_1.setBrightnessOfStrip(ledStrip, 100);
    index_1.setPowerOfStrip(ledStrip, false);
    while (true) {
        // for(var i = 0; i < WHITE_SHADES.length; ++i)
        // {
        //     await new Promise(resolve => setTimeout(resolve, 500));
        //     setColorOfStrip(ledStrip, hexToColor(WHITE_SHADES[i]), true)
        // }
        // await new Promise(resolve => setTimeout(resolve, 2000));
        // setColorOfStrip(ledStrip, hexToColor("d6e1ff"), true)
        // await new Promise(resolve => setTimeout(resolve, 2000));
        // setColorOfStrip(ledStrip, hexToColor("ffffff"), false)
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // setColorOfStrip(ledStrip, hexToColor("fcf8ff"), true)
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // setColorOfStrip(ledStrip, hexToColor("eceeff"), true)
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // setColorOfStrip(ledStrip, hexToColor("d6e1ff"), true)
    }
});
