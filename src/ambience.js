let ctx = null;
let master = null;

let effectsCtx = null;
let effectsGain = null;

let playing = false;

let timer = null;
let oceanSource = null;
let oceanGain = null;

const NOTES = [
    261.63, 293.66, 329.63, 392.0,
    440.0, 523.25, 587.33, 659.25
];

const MELODY_PATTERN = [
    [0.5, 2, 0.22],
    [0.9, 6, 0.28],
    [2.6, 5, 0.22],
    [4.7, 3, 0.20],
    [5.15, 6, 0.16],

    [6.55, 7, 0.21],
    [7.2, 5, 0.18],

    [8.55, 3, 0.16],
    [9.15, 0, 0.18],
    [10.15, 2, 0.14],

    [11.55, 4, 0.17],
    [12.25, 7, 0.19],
    [13.55, 5, 0.14],

    [15.0, 2, 0.13],
    [15.65, 1, 0.17],
    [16.65, 0, 0.14],

    [18.15, 5, 0.16],
    [19.05, 3, 0.13],
    [20.1, 4, 0.10]
];

const WIND_TIMES = [4.5, 11.5, 17.5];

export async function startAmbience() {
    if (playing) return;

    ctx = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

    if (ctx.state === "suspended") {
        await ctx.resume();
    }

    playing = true;

    master = ctx.createGain();
    master.gain.value = 0.95;
    master.connect(ctx.destination);

    if (!effectsCtx) {
        effectsCtx = new (
            window.AudioContext ||
            window.webkitAudioContext
        );

        effectsGain = effectsCtx.createGain();
        effectsGain.gain.value = 1;
        effectsGain.connect(effectsCtx.destination);
    }

    startOcean();
    animateOcean();
    playLoop();
}

function playLoop() {
    if (!playing) return;

    const now = ctx.currentTime;

    MELODY_PATTERN.forEach(([time, note, volume]) => {
        playTone(now + time, NOTES[note], volume);
    });

    WIND_TIMES.forEach(time => {
        playWind(now + time);
    });

    timer = setTimeout(playLoop, 21000);
}

function createGain(time, peak, attack, release, destination = master) {
    const gain = ctx.createGain();

    gain.gain.setValueAtTime(0.0001, time);

    gain.gain.exponentialRampToValueAtTime(
        peak,
        time + attack
    );
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        time + release
    );

    gain.connect(destination);

    return gain;
}

function playTone(time, frequency, volume) {
    const osc = ctx.createOscillator();
    const duration = 4.5 + Math.random() * 3;

    osc.type = "sine";
    osc.frequency.value = frequency;

    const gain = createGain(
        time,
        volume,
        0.05,
        duration
    );

    osc.connect(gain);

    osc.start(time);
    osc.stop(time + duration + 0.1);
}

export async function playErrorSound() {
    if (!effectsCtx || !effectsGain) return;

    if (effectsCtx.state === "suspended") {
        await effectsCtx.resume();
    }

    const time = effectsCtx.currentTime;

    const osc = effectsCtx.createOscillator();

    osc.type = "square";

    osc.frequency.setValueAtTime(220, time);

    osc.frequency.exponentialRampToValueAtTime(
        110,
        time + 0.18
    );

    const gain = effectsCtx.createGain();

    gain.gain.setValueAtTime(0.0001, time);

    gain.gain.exponentialRampToValueAtTime(
        0.09,
        time + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        time + 0.22
    );

    osc.connect(gain);
    gain.connect(effectsGain);

    osc.start(time);
    osc.stop(time + 0.23);
}

function createNoiseBuffer(duration) {
    const buffer = ctx.createBuffer(
        1,
        ctx.sampleRate * duration,
        ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    return buffer;
}

function startOcean() {
    const source = ctx.createBufferSource();

    source.buffer = createNoiseBuffer(2);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;

    oceanGain = ctx.createGain();
    oceanGain.gain.value = 0.03;

    source
        .connect(filter)
        .connect(oceanGain)
        .connect(master);

    source.start();

    oceanSource = source;
}

function animateOcean() {
    if (!playing) return;

    const now = ctx.currentTime;

    oceanGain.gain.cancelScheduledValues(now);
    oceanGain.gain.setValueAtTime(0.03, now);
    oceanGain.gain.linearRampToValueAtTime(
        0.06,
        now + 2.5
    );
    oceanGain.gain.linearRampToValueAtTime(
        0.03,
        now + 5.5
    );

    setTimeout(animateOcean, 5500);
}

function playWind(time, duration = 5) {
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();

    source.buffer = createNoiseBuffer(duration);

    filter.type = "bandpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.35;

    const gain = createGain(
        time,
        0.012,
        duration * 0.35,
        duration
    );

    source
        .connect(filter)
        .connect(gain);

    source.start(time);
    source.stop(time + duration);
}

export async function stopAmbience() {
    if (!ctx) return;

    playing = false;

    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    if (oceanSource) {
        try {
            oceanSource.stop();
        } catch { }

        oceanSource = null;
    }

    await ctx.close();

    ctx = null;
    master = null;
    oceanGain = null;
}

export function isPlaying() {
    return playing;
}