import { DEFAULT_MARGIN, BOARD_SIZE, BTN_H, BTN_WIDTH } from "../../enum/gameSizes";
import { renderRainbowBorder, renderRainbowText } from "../../utils/canvas";
import { isPointInsideRect } from "../../utils/geometry";
import { ParticleBackground } from "../Background";

export class Overlay {
    constructor() {
        this.active = false;
        this.btns = {};
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

    renderBtn(ctx, x, y, text, enabled = true, id = "btn", colour = "black") {
        const btnWidth = BTN_WIDTH;
        const btnHeight = BTN_H;
        const borderWidth = 3;

        const btn = {
            x,
            y,
            width: btnWidth,
            height: btnHeight
        };

        this.btns[id] = btn;

        ctx.save();

        ctx.fillStyle = enabled ? colour : "gray";

        ctx.beginPath();
        ctx.roundRect(
            btn.x,
            btn.y,
            btn.width,
            btn.height,
            BOARD_SIZE
        );

        ctx.fill();
        ctx.restore();

        renderRainbowBorder(
            ctx,
            btn.x,
            btn.y,
            btn.width,
            btn.height,
            borderWidth,
            BOARD_SIZE,
            this.gradientAngle
        );

        renderRainbowText(
            ctx,
            text,
            btn.x + btn.width / 2,
            btn.y + btn.height / 2,
            {
                width: btn.width
            }
        );

        return btn;
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
            }
        );
    }

    isBtnClicked(x, y, id = "btn") {
        const btn = this.btns[id];

        if (!btn) {
            return false;
        }

        return isPointInsideRect(x, y, btn);
    }

    handleClick(x, y) {
        return false;
    }
}