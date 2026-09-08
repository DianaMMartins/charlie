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
        const totalHeight = DEFAULT_MARGIN + gap + BTN_H;
        const y = this.getCenteredY(height, totalHeight);

        this.renderTitle(
            ctx,
            width,
            "Over the Rainbow",
            y + DEFAULT_MARGIN / 2
        );

        this.renderBtn(
            ctx,
            (width - BTN_WIDTH) / 2,
            y + DEFAULT_MARGIN + gap,
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