# govee-lightbar

Simple Node module used to control Govee Light Bars (Flow Pro H6054) over BLE.

## Installation

`npm install govee-lightbar`

## Supported Models

Currently supported and tested models are:
- `H6054`


## Controls

The module can be used to control:

- Power:
  - Turn led strip on or off
- RGB Color and Brightness
  - Turn led strip to any RGB color using hex
  - Control each of the 12 individual color segments
- Tunable White Color
  - Turn led strip to any white color temperature. Uses different LEDs than the RGB.
- Brightness
  - adjust global led brightness
- DIY
  - program govee diy effects

## Exported Methods

- `swap()`
  - Swap the left and right bar software-side
- `saveColor()`
  - Apply the colors and brightness values of the individual light bar segments
- `turnOn(left, right)`
  - Turn the individual bars on
- `turnOff(left, right)`
  - Turn the individual bars off
- `setBrightness(brightness)`
  - Set the global brightness for both bars
- `keepalive()`
  - Send a keepalive package if you want to keep the bluetooth connection alive
- `scene(scene_id)`
  - Change to 'scene' mode, parameter is the scene id
  - Get scene ids from `const { scenes } = require("govee-lightbar");`
- `diy(options = {})`
  - Store a diy effect on the bars
  - `options.style` the effect id, see `const { diyEffects } = require("govee-lightbar");`
  - `options.style_mode` some effects accept an additional mode (0 by default)
  - `options.speed` effect speed from 0 - 100
  - `options.colors` array of up to 8 colors in the format `{r: 255,g: 255,b: 255}`
- `<side>.setRGB(segment, r, g, b)`
  - Set the segment's rgb color
- `<side>.setBrightness(segment, brightness)`
  - Set the segment's rgb brightness
- `<side>.setRGBFull(r, g, b)`
  - Set all segments of the bar to the same color
- `<side>.setWhite(k)`
  - Set all segments of the bar to a white color, k is the kelvin value from 2000 to 8900

## Bar Segments

Each bar has 6 segments, they are indexed from 0 to 5, 0 being the segment closest to where the cable is attached.

Each bar can either be in "rgb" or in "white" mode because it uses different leds, setting a segment's color or brightness switches it to "rgb" mode, setting a bar's white color switches it to "white" mode

## Example

```js
const { LightbarSet, diyEffects } = require("govee-lightbar");

let l = new LightbarSet();
l.debug = true;

await l.turnOn(true, true);
await l.setBrightness(100);

//setting both bars to warm white
l.left.setWhite(2000);
l.right.setWhite(2000);
await l.saveColor();

//setting left bar to red
l.left.setRGBFull(255, 0, 0);
await l.saveColor();

//setting individual color segments
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

await l.saveColor();

//example diy command, slow moving gradient

await l.diy({
    style: diyEffects.RAINBOW,
    speed: 50,
    colors: [
      {r: 27,g: 161,b: 152},
      {r: 0,g: 150,b: 176},
      {r: 0,g: 134,b: 191},
      {r: 71,g: 113,b: 188},
      {r: 128,g: 86,b: 163},
      {r: 157,g: 56,b: 119}
    ]
})
```

## Credit

The work for reverse engineering the bluetooth protocol was done partly by me and partly by [egold555](https://github.com/egold555)'s work [here](https://github.com/egold555/Govee-Reverse-Engineering/blob/master/Products/H6053.md)
