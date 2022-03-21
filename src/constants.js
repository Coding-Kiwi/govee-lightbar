const scenes = Object.freeze({
    MOVIE: 4,

    ROMANTIC: 7,

    CANDLELIGHT: 9,
    RAINBOW_BREATHE: 10,

    READING: 13,

    SNOWFLAKE: 15,
    ENERGETIC: 16, //allows extra data

    AURORA: 18,

    CROSSING: 21, //allows extra data
    RAINBOW: 22, //allows extra data

    SEASONAL: 29,
    STREAM: 30,

    METEOR: 0x87, //allows extra data
    FIRE: 0x88, //allows extra data
    FIREWORK: 0x89,
    PARTY: 0x8a, //allows extra data
    ALARM: 0x8b, //allows extra data
    TUNNEL: 0x8c, //allows extra data
    COLORFUL: 0x8d, //allows extra data
    SLEEPING: 0x8e,
    SPARKLE: 0x8f, //allows extra data
    FEAR: 0x90, //allows extra data
    DRUMS: 0x91, //allows extra data

    //not in the app
    SUNRISE: 0,
    SUNSET: 1,
    RAINBOW: 3,
    ROMANTIC_2: 5,
    ENERGETIC_2: 8,
});

const configurableScenes = Object.freeze([
    scenes.ENERGETIC,
    scenes.PARTY,
    scenes.ALARM,
    scenes.TUNNEL,
    scenes.COLORFUL,
    scenes.RAINBOW,
    scenes.METEOR,
    scenes.FIRE,
    scenes.CROSSING,
    scenes.SPARKLE,
    scenes.FEAR,
    scenes.DRUMS
]);

const diyEffects = Object.freeze({
    FADE: 0x00,
    JUMPING: 0x01,
    BREATHING: 0x05,
    SPARKLE: 0x02,
    AURORA: 0x0d,
    SNOWFLAKE: 0x0b,
    STREAM: 0x08,
    CROSSING: 0x0a,
    RAINBOW: 0x09,
    COMBO: 0xff
});

module.exports = {
    scenes,
    configurableScenes,
    diyEffects,
    KELVIN_MIN: 2000,
    KELVIN_MAX: 8900
};