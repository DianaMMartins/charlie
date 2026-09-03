import { UI_MARGIN } from "../../enum/gameSizes";

export class Overlay {
    constructor() {
        this.active = false;
        this.button = null;
    }

    open() {
        this.active = true;
    }

    close() {
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

        ctx.fillStyle = "black";
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

    renderButton(ctx, width, y, text, enabled = true) {
        const buttonWidth = 180;
        const buttonHeight = 50;

        this.button = {
            x: (width - buttonWidth) / 2,
            y: y,
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

        gradient.addColorStop(0.00, "#ff5c5c");
        gradient.addColorStop(0.14, "#ff9f43");
        gradient.addColorStop(0.28, "#f6d743");
        gradient.addColorStop(0.42, "#4cd964");
        gradient.addColorStop(0.56, "#22d3ee");
        gradient.addColorStop(0.70, "#5b8def");
        gradient.addColorStop(0.84, "#8b6cff");
        gradient.addColorStop(1.00, "#ff69d4");

        ctx.fillStyle = gradient;
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(text, x, y);

        ctx.restore();
    }

    isButtonClicked(x, y) {
        if (!this.button) {
            return false;
        }

        return (
            x >= this.button.x &&
            x <= this.button.x + this.button.width &&
            y >= this.button.y &&
            y <= this.button.y + this.button.height
        )
    }

    handleClick(x, y) {
        return false;
    }
}