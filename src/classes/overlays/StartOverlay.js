import { CARD_FRONT_IMAGE } from "../../assets";
import { BTN_H, BTN_WIDTH, DEFAULT_MARGIN } from "../../enum/gameSizes";
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

        const gap = DEFAULT_MARGIN;
        const charlieSize = 320;

        const totalHeight = DEFAULT_MARGIN + gap + charlieSize + gap + BTN_H;
        const y = this.getCenteredY(height, totalHeight);

        this.renderTitle(
            ctx,
            width,
            "Over the Rainbow",
            y + DEFAULT_MARGIN / 2
        );

        ctx.drawImage(
            CARD_FRONT_IMAGE,
            (width - charlieSize) / 2,
            y + DEFAULT_MARGIN + gap,
            charlieSize,
            charlieSize
        );

        this.renderBtn(
            ctx,
            (width - BTN_WIDTH) / 2,
            y + DEFAULT_MARGIN + gap + charlieSize + gap,
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