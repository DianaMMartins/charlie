import { UI_MARGIN } from "../enum/gameSizes";

export class Overlay {
    constructor() {
        this.type = null;
        this.active = false;

        this.button = null;
    }

    open() {
        this.active = true;
    }

    close() {
        this.type = null;
        this.active = false;
    }

    render(ctx, width, height) {
        if (!this.active) {
            return;
        }

        this.renderBackground(ctx, width, height);
    }

    renderBackground(ctx, width, height) {
        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, height);

        const padding = UI_MARGIN;

        ctx.fillStyle = "white";
        ctx.fillRect(
            padding,
            padding,
            width - padding * 2,
            height - padding * 2
        );

        ctx.restore();
    }

   renderButton(ctx, width, height, text, enabled = true) {
        const buttonWidth = 180;
        const buttonHeight = 50;

        this.button = {
            x: (width - buttonWidth) / 2,
            y: height - 90,
            width: buttonWidth,
            height: buttonHeight
        };

        ctx.save();

        ctx.fillStyle = enabled ? "black" : "gray";

        ctx.fillRect(
            this.button.x,
            this.button.y,
            this.button.width,
            this.button.height
        );

        ctx.fillStyle = "white";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            text,
            this.button.x + this.button.width / 2,
            this.button.y + this.button.height / 2
        );

        ctx.restore();
    }
}