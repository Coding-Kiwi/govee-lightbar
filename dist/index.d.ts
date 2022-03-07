import { GoveeLightStrip } from "./goveeLightStrip";
import { Color } from "./color";
export declare const debug: (on: boolean) => void;
export declare const startDiscovery: () => Promise<void>;
export declare const stopDiscovery: () => Promise<void>;
export declare const getListOfStrips: () => {
    [uuid: string]: GoveeLightStrip;
};
export declare const setColorOfStrip: (ledStrip: GoveeLightStrip, newColor: Color, isWhite: boolean) => GoveeLightStrip | undefined;
export declare const setBrightnessOfStrip: (ledStrip: GoveeLightStrip, newBrightness: number) => GoveeLightStrip | undefined;
export declare const setPowerOfStrip: (ledStrip: GoveeLightStrip, power: boolean) => GoveeLightStrip | undefined;
export declare const registerScanStart: (callback: Function) => void;
export declare const registerScanStop: (callback: Function) => void;
export declare const registerDiscoveryCallback: (callback: (ledStrip: GoveeLightStrip) => void) => void;
export * from "./goveeLightStrip";
export * from "./color";
//# sourceMappingURL=index.d.ts.map