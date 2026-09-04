import { BUTTON_H, BUTTON_WIDTH, DEFAULT_MARGIN } from "../../enum/gameSizes";
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
        const buttonHeight = BUTTON_H;

        const totalHeight = titleHeight + gap + buttonHeight;
        const startY = this.getCenteredY(height, totalHeight);
        const titleY = startY + titleHeight / 2;
        const buttonY = startY + titleHeight + gap;
        const buttonX = (width - BUTTON_WIDTH) / 2;

        this.renderTitle(ctx, width, "Over the Rainbow", titleY);
        this.renderButton(ctx, buttonX, buttonY, "Start");
    }

    handleClick(x, y) {
        if (!this.isButtonClicked(x, y)) {
            return true;
        }

        this.close();

        if (this.onStart) {
            this.onStart();
        }

        return true;
    }
}