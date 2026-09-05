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

export function renderText(
    ctx,
    text,
    x,
    y,
    {
        font = "20px sans-serif",
        fillStyle = "black",
        align = "center",
        baseline = "middle"
    } = {}
) {
    ctx.save();

    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillStyle = fillStyle;

    ctx.fillText(text, x, y);

    ctx.restore();
}

export function renderRainbowText(
    ctx,
    text,
    x,
    y,
    {
        font = "20px sans-serif",
        align = "center",
        baseline = "middle",
        width = 100
    } = {}
) {
    ctx.save();

    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    const gradient = ctx.createLinearGradient(
        x - width / 2,
        y,
        x + width / 2,
        y
    );

    addGradientStops(gradient, RAINBOW_TEXT_STOPS);

    ctx.fillStyle = gradient;
    ctx.fillText(text, x, y);

    ctx.restore();
}

export function renderRainbowBorder(
    ctx,
    x,
    y,
    width,
    height,
    borderWidth = 3,
    rounded = 0,
    angle = 0
) {
    ctx.save();

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const gradient = ctx.createConicGradient(
        angle,
        centerX,
        centerY
    );

    addGradientStops(gradient, RAINBOW_STOPS);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = borderWidth;

    ctx.beginPath();

    ctx.roundRect(
        x + borderWidth / 2,
        y + borderWidth / 2,
        width - borderWidth,
        height - borderWidth,
        rounded
    );

    ctx.stroke();

    ctx.restore();
}