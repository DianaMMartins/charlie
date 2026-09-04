export const RAINBOW_STOPS = [
    [0.00, "#ff5c5c"],
    [0.14, "#ff9f43"],
    [0.28, "#f6d743"],
    [0.42, "#4cd964"],
    [0.56, "#22d3ee"],
    [0.70, "#5b8def"],
    [0.84, "#8b6cff"],
    [0.96, "#ff69d4"],
    [1.00, "#ff5c5c"]
];

export const RAINBOW_TEXT_STOPS = [
    [0.00, "#ff5c5c"],
    [0.14, "#ff9f43"],
    [0.28, "#f6d743"],
    [0.42, "#4cd964"],
    [0.56, "#22d3ee"],
    [0.70, "#5b8def"],
    [0.84, "#8b6cff"],
    [1.00, "#ff69d4"]
];

export function addGradientStops(gradient, stops) {
    for (const [position, color] of stops) {
        gradient.addColorStop(position, color);
    }
}