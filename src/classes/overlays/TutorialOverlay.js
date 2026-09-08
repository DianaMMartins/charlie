import {
    BTN_H,
    BTN_WIDTH,
    DEFAULT_MARGIN,
    HAND_CARD_GAP,
    UI_MARGIN
} from "../../enum/gameSizes";
import { RULES } from "../../enum/gameStatus";
import { Overlay } from "./Overlay";
import { renderRainbowText } from "../../utils/canvas";

export class TutorialOverlay extends Overlay {
    constructor() {
        super();

        this.onStart = null;
    }

    open(onStart) {
        super.open();

        this.onStart = onStart;
    }

    render(ctx, width, height) {
        if (!this.active) {
            return;
        }

        super.render(ctx, width, height);

        const titleHeight = DEFAULT_MARGIN;
        const gap = DEFAULT_MARGIN;
        const ruleGap = HAND_CARD_GAP;
        const lineHeight = UI_MARGIN;
        const pWidth = width * 0.7;

        const titleFontSize = DEFAULT_MARGIN;
        const bodyFontSize = 16;

        const boardSize = BTN_WIDTH;
        const boardGap = 4;

        let rulesHeight = 0;

        RULES.forEach((rule, index) => {
            rulesHeight += this.getPHeight(
                ctx,
                rule,
                pWidth,
                lineHeight,
                bodyFontSize
            );

            if (index < RULES.length - 1) {
                rulesHeight += ruleGap;
            }
        });

        const totalHeight =
            titleHeight +
            gap +
            boardSize +
            gap +
            rulesHeight +
            gap +
            BTN_H;

        let y = this.getCenteredY(height, totalHeight);

        this.renderTitle(
            ctx,
            width,
            "Tutorial",
            y + titleHeight / 2,
            titleFontSize
        );

        y += titleHeight + gap;

        this.renderMiniBoard(
            ctx,
            width / 2,
            y,
            boardSize,
            boardGap
        );

        y += boardSize + gap;

        RULES.forEach((rule, index) => {
            y += this.renderP(
                ctx,
                rule,
                width / 2,
                y,
                pWidth,
                lineHeight,
                bodyFontSize
            );

            if (index < RULES.length - 1) {
                y += ruleGap;
            }
        });

        const btnX = (width - BTN_WIDTH) / 2;

        this.renderBtn(
            ctx,
            btnX,
            y + gap,
            "Continue"
        );
    }

    renderMiniBoard(ctx, centerX, y, size, gap) {
        const cellSize = size / 5;

        const boardWidth =
            cellSize * 5 +
            gap * 4;

        const x = centerX - boardWidth / 2;

        const cells = [
            ["", "", "", "", "F"],
            ["", "7", "8", "9", ""],
            ["", "4", "5", "6", ""],
            ["", "1", "2", "3", ""],
            ["S", "", "", "", ""]
        ];

        for (let row = 0; row < cells.length; row++) {
            for (let col = 0; col < cells[row].length; col++) {
                const label = cells[row][col];

                if (!label) {
                    continue;
                }

                const cellX =
                    x + col * (cellSize + gap);

                const cellY =
                    y + row * (cellSize + gap);

                this.renderMiniCellBackground(
                    ctx,
                    cellX,
                    cellY,
                    cellSize
                );
            }
        }

        this.renderMiniArrows(
            ctx,
            x,
            y,
            cellSize,
            gap
        );

        for (let row = 0; row < cells.length; row++) {
            for (let col = 0; col < cells[row].length; col++) {
                const label = cells[row][col];

                if (!label) {
                    continue;
                }

                const cellX =
                    x + col * (cellSize + gap);

                const cellY =
                    y + row * (cellSize + gap);

                this.renderMiniLabel(
                    ctx,
                    cellX,
                    cellY,
                    cellSize,
                    label
                );
            }
        }
    }

    renderMiniCellBackground(ctx, x, y, size) {
        ctx.save();

        ctx.fillStyle = "white";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );

        ctx.strokeStyle = "black";

        ctx.strokeRect(
            x,
            y,
            size,
            size
        );

        ctx.restore();
    }

    renderMiniLabel(c, x, y, size, label) {
        renderRainbowText(
            c,
            label,
            x + size / 2,
            y + size / 2,
            {
                font: `${Math.max(12, size * 0.25)}px sans-serif`
            }
        );
    }

    renderMiniArrows(c, x, y, s, g) {
        let t = s + g, h = s / 2;

        c.save();
        c.strokeStyle = c.fillStyle = "red";
        c.lineWidth = 2;

        let p = [
            [1, 3, 2, 3], [2, 3, 3, 3], [3, 3, 1, 2],
            [2, 2, 3, 2], [1, 2, 2, 2], [3, 2, 1, 1],
            [1, 1, 2, 1], [2, 1, 3, 1]
        ];

        for (let a of p) {
            let x1 = x + a[0] * t + h, y1 = y + a[1] * t + h,
                x2 = x + a[2] * t + h, y2 = y + a[3] * t + h,
                A = Math.atan2(y2 - y1, x2 - x1),
                d = 10;

            x1 += Math.cos(A) * d;
            y1 += Math.sin(A) * d;
            x2 -= Math.cos(A) * d;
            y2 -= Math.sin(A) * d;

            c.beginPath();
            c.moveTo(x1, y1);
            c.lineTo(x2, y2);
            c.stroke();

            c.beginPath();
            c.moveTo(x2, y2);
            c.lineTo(
                x2 - 6 * Math.cos(A - .52),
                y2 - 6 * Math.sin(A - .52)
            );
            c.lineTo(
                x2 - 6 * Math.cos(A + .52),
                y2 - 6 * Math.sin(A + .52)
            );

            c.fill();
        }
        c.restore();
    }

    getPHeight(ctx, text, maxWidth, lineHeight, fontSize) {
        ctx.save();

        ctx.font = `${fontSize}px sans-serif`;

        const height =
            this.getPLines(ctx, text, maxWidth).length *
            lineHeight;

        ctx.restore();

        return height;
    }

    renderP(ctx, text, x, y, maxWidth, lineHeight, fontSize) {
        ctx.save();

        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const lines = this.getPLines(
            ctx,
            text,
            maxWidth
        );

        lines.forEach((line, index) => {
            ctx.fillText(
                line,
                x,
                y + index * lineHeight
            );
        });

        ctx.restore();

        return lines.length * lineHeight;
    }

    getPLines(ctx, text, maxWidth) {
        const words = text.split(" ");
        const lines = [];

        let line = "";

        for (const word of words) {
            const test = line
                ? `${line} ${word}`
                : word;

            if (
                ctx.measureText(test).width > maxWidth &&
                line
            ) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }

        if (line) {
            lines.push(line);
        }

        return lines;
    }

    handleClick(x, y) {
        if (!this.isBtnClicked(x, y)) {
            return true;
        }

        this.close();

        if (this.onStart) {
            this.onStart();
        }

        return true;
    }
}