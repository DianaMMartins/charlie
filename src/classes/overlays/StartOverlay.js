import {
    BTN_H,
    BTN_WIDTH,
    DEFAULT_MARGIN,
    HAND_CARD_GAP,
    UI_MARGIN
} from "../../enum/gameSizes";
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

        const titleHeight = DEFAULT_MARGIN;
        const gap = DEFAULT_MARGIN;
        const ruleGap = HAND_CARD_GAP;
        const lineHeight = UI_MARGIN;
        const pWidth = width * 0.7;

        const titleFontSize = DEFAULT_MARGIN;
        const bodyFontSize = 16;

        const boardSize = BTN_WIDTH;
        const boardGap = 4;

        const totalHeight =
            titleHeight +
            gap +
            boardSize +
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

              const btnX = (width - BTN_WIDTH) / 2;

        this.renderBtn(
            ctx,
            btnX,
            y + gap,
            "Start"
        );
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