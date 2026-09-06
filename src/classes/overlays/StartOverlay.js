import { BTN_H as BTN_H, BTN_WIDTH as BTN_WIDTH, DEFAULT_MARGIN, HAND_CARD_GAP, UI_MARGIN } from "../../enum/gameSizes";
import { RULES } from "../../enum/gameStatus";
import { Overlay } from "./Overlay";

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

        const isMobile = width < 600;

        const titleHeight = isMobile
            ? width * 0.10
            : DEFAULT_MARGIN;

        const gap = isMobile
            ? width * 0.025
            : DEFAULT_MARGIN;

        const ruleGap = isMobile
            ? width * 0.025
            : HAND_CARD_GAP;

        const lineHeight = isMobile
            ? width * 0.055
            : UI_MARGIN;

        const btnHeight = BTN_H;

        const pWidth = isMobile
            ? width * 0.84
            : width * 0.70;

        const titleFontSize = isMobile
            ? Math.max(28, Math.min(42, width * 0.09))
            : 42;

        const bodyFontSize = isMobile
            ? Math.max(14, Math.min(18, width * 0.045))
            : 18;

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

        const totalHeight = titleHeight + gap + rulesHeight + gap + btnHeight;

        let y = this.getCenteredY(height, totalHeight);

        this.renderTitle(
            ctx,
            width,
            "Over the Rainbow",
            y + titleHeight / 2,
            titleFontSize
        );

        y += titleHeight + gap;

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

        this.renderBtn(ctx, btnX, y + gap, "Start");
    }

    getPHeight(ctx, text, maxWidth, lineHeight, fontSize) {
        ctx.save();

        ctx.font = `${fontSize}px sans-serif`;

        const height =
            this.getPLines(
                ctx,
                text,
                maxWidth
            ).length * lineHeight;

        ctx.restore();

        return height;
    }

    renderP(ctx, text, x, y, maxWidth, lineHeight, fontSize) {
        ctx.save();

        ctx.font = `${fontSize} sans-serif`;
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