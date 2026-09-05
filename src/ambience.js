let ctx = null;

let master = null;

let playing = false;

let timer = null;

let oceanSource = null;

let oceanGain = null;

let oceanFilter = null;

const NOTES = [
    261.63,
    293.66,
    329.63,
    392.0, 
    440.0, 
    523.25,
    587.33,
    659.25 
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

const WIND_TIMES = [
    4.5,
    11.5,
    17.5
];

export async function startAmbience() {
    if (playing) {
        return;
    }

    ctx = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

    if (ctx.state === "suspended") {
        await ctx.resume();
    }

    playing = true;

    master = ctx.createGain();

    master.gain.setValueAtTime(
        0,
        ctx.currentTime
    );

    master.gain.linearRampToValueAtTime(
        0.95,
        ctx.currentTime + 5
    );

    master.connect(ctx.destination);

    startOcean();

    animateOcean();

    playLoop();
}

function playLoop() {
    if (!playing) {
        return;
    }

    const now = ctx.currentTime;

    MELODY_PATTERN.forEach(([time, note, volume]) => {
        tone(now + time, NOTES[note], volume);
    });

    WIND_TIMES.forEach(time => {
        wind(now + time, 5);
    });

    timer = setTimeout(
        playLoop,
        21000
    );
}

function tone(time, frequency, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";

    osc.frequency.value = frequency;

    const duration = 4.5 + Math.random() * 3;

    gain.gain.setValueAtTime(
        0.0001,
        time
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        time + 0.05
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        time + duration
    );

    osc.connect(gain);
  
    gain.connect(master);

    osc.start(time);
   
    osc.stop(time + duration + 0.1);
}

function startOcean() {
    const bufferSize = ctx.sampleRate * 2;

    const buffer = ctx.createBuffer(
        1,
        bufferSize,
        ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    oceanSource = ctx.createBufferSource();

    oceanSource.buffer = buffer;
    oceanSource.loop = true;

    oceanFilter = ctx.createBiquadFilter();

    oceanFilter.type = "lowpass";

    oceanFilter.frequency.value = 900;

    oceanFilter.Q.value = 0.7;

    oceanGain = ctx.createGain();

    oceanGain.gain.value = 0.03;

    oceanSource
        .connect(oceanFilter)
        .connect(oceanGain)
        .connect(master);

    oceanSource.start();
}

function animateOcean() {
    if (!playing) {
        return;
    }

    const now = ctx.currentTime;

    oceanGain.gain.cancelScheduledValues(now);

    oceanGain.gain.setValueAtTime(
        0.03,
        now
    );

    oceanGain.gain.linearRampToValueAtTime(
        0.06,
        now + 2.5
    );

    oceanGain.gain.linearRampToValueAtTime(
        0.03,
        now + 5.5
    );

    setTimeout(
        animateOcean,
        5500
    );
}

function wind(time, duration = 5) {
    const buffer = ctx.createBuffer(
        1,
        ctx.sampleRate * duration,
        ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();

    const filter = ctx.createBiquadFilter();

    const gain = ctx.createGain();

    source.buffer = buffer;

    filter.type = "bandpass";

    filter.frequency.value = 1400;

    filter.Q.value = 0.35;

    gain.gain.setValueAtTime(
        0.0001,
        time
    );

    gain.gain.linearRampToValueAtTime(
        0.012,
        time + duration * 0.35
    );

    gain.gain.linearRampToValueAtTime(
        0.0001,
        time + duration
    );

    source
        .connect(filter)
        .connect(gain)
        .connect(master);

    source.start(time);

    source.stop(time + duration);
}

export async function stopAmbience() {
    if (!playing) {
        return;
    }

    playing = false;

    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    if (oceanSource) {
        try {
            oceanSource.stop();
        } catch {
           
        }

        oceanSource = null;
    }

    if (!ctx) {
        return;
    }

    await ctx.close();

    ctx = null;
    master = null;
    oceanGain = null;
    oceanFilter = null;
}

export function isPlaying() {
    return playing;
}