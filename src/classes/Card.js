import { BOARD_SIZE, CARD_DIMENSIONS } from "../enum/gameSizes";
import { CARD_BACK_IMAGE, CARD_FRONT_IMAGE } from "../assets";

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

        const gradient = ctx.createLinearGradient(
            x,
            y,
            x + size,
            y
        );

        ctx.fillStyle = "black";
        ctx.fillRect(x, y, size, size);

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
        ctx.roundRect(x, y, size, size, BOARD_SIZE);

        ctx.fillStyle = "black";
        ctx.fill();

        const padding = size * 0.08;
        const imageSize = size - padding * 2;
        const imageX = x + (size - imageSize) / 2;
        const imageY = y + (size - imageSize) / 2;

        ctx.drawImage(
            CARD_FRONT_IMAGE,
            imageX,
            imageY,
            imageSize,
            imageSize
        );

        const textPadding = size * 0.05;

        this.renderCardText(
            ctx,
            this.value,
            x + size - textPadding,
            y + textPadding,
            {
                rainbow: true
            }
        );

        ctx.restore();
    }

    renderCardText(ctx, text, x, y, {
        font = "20px sans-serif",
        align = "right",
        baseline = "top",
        rainbow = false
    } = {}) {
        ctx.save();

        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;

        if (rainbow) {
            const gradient = ctx.createLinearGradient(
                x - 40,
                y,
                x,
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
        } else {
            ctx.fillStyle = "black";
        }

        ctx.fillText(text, x, y);

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

    // might not be needed - To confirm when implementing overlay
    // renderDiscardCards() {
    //     const ctx = this.ctx;

    //     const columns = 4;
    //     const cardSize = this.player.cardSize;

    //     const gap = 20;

    //     const totalWidth =
    //         columns * cardSize +
    //         (columns - 1) * gap;

    //     const startX =
    //         (this.canvas.width - totalWidth) / 2;

    //     const startY = 100;

    //     this.discardCardPositions = [];

    //     for (let i = 0; i < this.player.hand.length; i++) {
    //         const card = this.player.hand[i];

    //         const column = i % columns;
    //         const row = Math.floor(i / columns);

    //         const x =
    //             startX +
    //             column * (cardSize + gap);

    //         const y =
    //             startY +
    //             row * (cardSize + gap);

    //         this.discardCardPositions.push({
    //             card,
    //             x,
    //             y
    //         });

    //         card.render(ctx, x, y, cardSize);

    //         if (this.discardSelection.includes(card)) {
    //             this.renderSelectedCard(x, y, cardSize);
    //         }
    //     }
    // }
}