import {
    BTN_H,
    BTN_WIDTH,
    DEFAULT_MARGIN,
    HAND_CARD_GAP,
    UI_MARGIN
} from "../../enum/gameSizes";
import { RULES } from "../../enum/gameStatus";
import { Overlay } from "./Overlay";
import { renderRainbowText, renderText } from "../../utils/canvas";

export class StartOverlay extends Overlay {
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
            "Over the Rainbow",
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
            "Start"
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

    renderMiniLabel(ctx, x, y, size, label) {
        renderRainbowText(
            ctx,
            label,
            x + size / 2,
            y + size / 2,
            {
                font: `${Math.max(12, size * 0.25)}px sans-serif`
            }
        );
    }

    renderMiniArrows(ctx, x, y, cellSize, gap) {
        const step = cellSize + gap;
        const l = 2;

        ctx.save();

        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.lineWidth = l;

        const center = (col, row) => ({
            x: x + col * step + cellSize / l,
            y: y + row * step + cellSize / l
        });

        const arrow = (
            fromCol,
            fromRow,
            toCol,
            toRow
        ) => {
            const from = center(fromCol, fromRow);
            const to = center(toCol, toRow);

            this.renderArrow(
                ctx,
                from.x,
                from.y,
                to.x,
                to.y
            );
        };

        arrow(1, 3, l, 3);
        arrow(l, 3, 3, 3);
        arrow(3, 3, 1, 2);

        arrow(l, l, 3, l);
        arrow(1, l, l, l);
        arrow(3, l, 1, 1);

        arrow(1, 1, l, 1);
        arrow(l, 1, 3, 1);

        ctx.restore();
    }

    renderArrow(ctx, x1, y1, x2, y2) {
        const headSize = 6;
        const inset = 11;

        const angle = Math.atan2(
            y2 - y1,
            x2 - x1
        );

        const startX = x1 + Math.cos(angle) * inset;
        const startY = y1 + Math.sin(angle) * inset;

        const endX = x2 - Math.cos(angle) * inset;
        const endY = y2 - Math.sin(angle) * inset;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX, endY);

        ctx.lineTo(
            endX - headSize * Math.cos(angle - Math.PI / 6),
            endY - headSize * Math.sin(angle - Math.PI / 6)
        );

        ctx.lineTo(
            endX - headSize * Math.cos(angle + Math.PI / 6),
            endY - headSize * Math.sin(angle + Math.PI / 6)
        );

        ctx.closePath();
        ctx.fill();
    }

    renderMiniCell(ctx, x, y, size, label) {
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

        renderRainbowText(
            ctx,
            label,
            x + size / 2,
            y + size / 2,
            {
                font: `${Math.max(12, size * 0.25)}px sans-serif`
            }
        );
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