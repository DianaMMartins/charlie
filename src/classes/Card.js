import { BOARD_SIZE, CARD_DIMENSIONS } from "../enum/gameSizes";
import { CARD_BACK_IMAGE, CARD_FRONT_IMAGE } from "../assets";
import { renderRainbowBorder, renderRainbowText } from "../utils/canvas";

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
        renderRainbowBorder(ctx, x, y, size, size, 2, BOARD_SIZE);
    }

    renderFront(ctx, x, y, size = CARD_DIMENSIONS) {
        this.renderCardFront(ctx, x, y, size);
        renderRainbowBorder(ctx, x, y, size, size, 2, BOARD_SIZE);
    }

    renderCardBackImage(ctx, x, y, size) {
        ctx.save();

        ctx.beginPath();
        ctx.roundRect(x, y, size, size, BOARD_SIZE);
        ctx.clip();

        ctx.fillStyle = "black";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );

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

    renderCardText(
        ctx,
        text,
        x,
        y,
        {
            font = "20px sans-serif",
            align = "right",
            baseline = "top",
            rainbow = false
        } = {}
    ) {
        ctx.save();

        if (rainbow) {
            renderRainbowText(
                ctx,
                text,
                x,
                y,
                {
                    font,
                    align,
                    baseline,
                    width: 40
                }
            );
        } else {
            renderText(
                ctx,
                text,
                x,
                y,
                {
                    font,
                    align,
                    baseline
                }
            );
        }

        ctx.restore();
    }
}