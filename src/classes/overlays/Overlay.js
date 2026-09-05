import { DEFAULT_MARGIN, BOARD_SIZE, BUTTON_H, BUTTON_WIDTH } from "../../enum/gameSizes";
import { renderRainbowBorder, renderRainbowText } from "../../utils/canvas";
import { isPointInsideRect } from "../../utils/geometry";
import { ParticleBackground } from "../ParticleBackground";

export class Overlay {
    constructor() {
        this.active = false;
        this.buttons = {};
        this.gradientAngle = 0;

        this.background = new ParticleBackground();
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

        ctx.fillRect(
            borderWidth,
            borderWidth,
            width - borderWidth * 2,
            height - borderWidth * 2
        );

        this.background.render(
            ctx,
            width,
            height
        );

        renderRainbowBorder(
            ctx,
            0,
            0,
            width,
            height,
            borderWidth
        );

        ctx.restore();
    }

    renderButton(ctx, x, y, text, enabled = true, id = "button", colour = "black") {
        const buttonWidth = BUTTON_WIDTH;
        const buttonHeight = BUTTON_H;
        const borderWidth = 3;

        const button = {
            x,
            y,
            width: buttonWidth,
            height: buttonHeight
        };

        this.buttons[id] = button;

        ctx.save();

        ctx.fillStyle = enabled ? colour : "gray";

        ctx.beginPath();
        ctx.roundRect(
            button.x,
            button.y,
            button.width,
            button.height,
            BOARD_SIZE
        );

        ctx.fill();
        ctx.restore();

        renderRainbowBorder(
            ctx,
            button.x,
            button.y,
            button.width,
            button.height,
            borderWidth,
            BOARD_SIZE,
            this.gradientAngle
        );

        renderRainbowText(
            ctx,
            text,
            button.x + button.width / 2,
            button.y + button.height / 2,
            {
                width: button.width
            }
        );

        return button;
    }

    getCenteredY(height, contentHeight) {
        return (height - contentHeight) / 2;
    }

    renderTitle(ctx, width, text, y) {
        renderRainbowText(
            ctx,
            text,
            width / 2,
            y,
            {
                font: "42px sans-serif",
                width: 240
            }
        );
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