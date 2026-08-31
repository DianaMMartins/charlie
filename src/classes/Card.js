import { BOARD_SIZE, CARD_DIMENSIONS } from "../enum/gameSizes";
import { CARD_BACK_IMAGE } from "../assets";

export class Card {
    constructor(value) {
        this.value = value;
        this.revealed = false;
    }

    render(ctx, x, y, size = CARD_DIMENSIONS) {
        if (this.revealed) {
            this.renderFront(ctx, x, y, size);
        } else {
            this.renderBack(ctx, x, y, size);
        }
    }

    renderBack(ctx, x, y, size = CARD_DIMENSIONS) {
        this.renderCardBackImage(ctx, x, y, size);
        this.renderRainbowBorder(ctx, x, y, size);
    }

    renderFront(ctx, x, y, size = CARD_DIMENSIONS) {
        this.renderCardFront(ctx, x, y, size);
        this.renderRainbowBorder(ctx, x, y, size);
    }

    renderCardBackImage(ctx, x, y, size) {
        ctx.save();

        ctx.beginPath();
        ctx.roundRect(x, y, size, size, BOARD_SIZE);
        ctx.clip();

        ctx.drawImage(
            CARD_BACK_IMAGE,
            x,
            y,
            size,
            size
        );

        ctx.restore();
    }

    renderCardFront(ctx, x, y, size) {
        ctx.save();

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            size,
            size,
            BOARD_SIZE
        );

        ctx.fillStyle = "white";
        ctx.fill();

        this.renderCardText(ctx, x, y, size);
        
        ctx.restore();
    }

    renderCardText(ctx, x, y, size) {
        ctx.save();

        ctx.font = "20px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            this.value,
            x + size / 2,
            y + size / 2
        );

        ctx.restore();
    }

    renderRainbowBorder(ctx, x, y, size) {
        ctx.save();

        const gradient = ctx.createLinearGradient(
            x,
            y,
            x + size,
            y + size
        );

        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.2, "orange");
        gradient.addColorStop(0.4, "yellow");
        gradient.addColorStop(0.6, "green");
        gradient.addColorStop(0.8, "blue");
        gradient.addColorStop(1, "violet");

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            size,
            size,
            BOARD_SIZE
        );

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}