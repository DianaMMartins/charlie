import { DEFAULT_MARGIN, BOARD_SIZE, BUTTON_H, BUTTON_WIDTH } from "../../enum/gameSizes";
import { addGradientStops, RAINBOW_STOPS, RAINBOW_TEXT_STOPS } from "../../utils/canvas";
import { isPointInsideRect } from "../../utils/geometry";

export class Overlay {
    constructor() {
        this.active = false;
        this.buttons = {};
        this.gradientAngle = 0;
    }

    open() {
        this.active = true;
    }

    close() {
        this.active = false;
    }

    update() {
        if (!this.active) {
            return;
        }

        this.gradientAngle += 0.006;
    }

    render(ctx, width, height) {
        if (!this.active) {
            return;
        }

        this.renderBackground(ctx, width, height);
    }

    renderBackground(ctx, width, height) {
        ctx.save();

        const borderWidth = DEFAULT_MARGIN;

        ctx.fillStyle = "#f4e0ff";

        ctx.fillRect(
            borderWidth,
            borderWidth,
            width - borderWidth * 2,
            height - borderWidth * 2
        );


        this.renderRainbowBorder(
            ctx,
            0,
            0,
            width,
            height,
            borderWidth
        );

        ctx.restore();
    }

    renderRainbowBorder(ctx, x, y, width, height, borderWidth) {
        ctx.save();

        const centerX = width / 2;
        const centerY = height / 2;

        const gradient = ctx.createConicGradient(
            this.gradientAngle,
            centerX,
            centerY
        );

        addGradientStops(gradient, RAINBOW_STOPS);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = borderWidth;

        ctx.beginPath();

        ctx.roundRect(
            borderWidth / 2,
            borderWidth / 2,
            width - borderWidth,
            height - borderWidth,
        );

        ctx.stroke();

        ctx.restore();
    }

    renderButton(ctx, x, y, text, enabled = true, id = "button") {
        const buttonWidth = BUTTON_WIDTH;
        const buttonHeight = BUTTON_H;

        const button = {
            x,
            y,
            width: buttonWidth,
            height: buttonHeight
        };

        this.buttons[id] = button;

        ctx.save();

        ctx.fillStyle = enabled ? "black" : "gray";

        ctx.beginPath();

        ctx.roundRect(
            button.x,
            button.y,
            button.width,
            button.height,
            BOARD_SIZE
        );

        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            text,
            button.x + button.width / 2,
            button.y + button.height / 2
        );

        ctx.restore();

        return button;
    }

    getCenteredY(height, contentHeight) {
        return (height - contentHeight) / 2;
    }

    renderTitle(ctx, width, text, y) {
        ctx.save();

        const x = width / 2;
        const gradient = ctx.createLinearGradient(
            x - 120,
            y,
            x + 120,
            y
        );

        addGradientStops(gradient, RAINBOW_TEXT_STOPS);

        ctx.fillStyle = gradient;
        ctx.font = "42px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(text, x, y);

        ctx.restore();
    }

    isButtonClicked(x, y, id = "button") {
        const button = this.buttons[id];

        if (!button) {
            return false;
        }

        return isPointInsideRect(x, y, button);
    }

    handleClick(x, y) {
        return false;
    }
}