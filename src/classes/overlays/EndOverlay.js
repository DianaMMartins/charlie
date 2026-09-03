import { BUTTON_H, DEFAULT_MARGIN } from "../../enum/gameSizes";
import { Overlay } from "./Overlay";

export class EndOverlay extends Overlay {
    constructor() {
        super();

        this.onRestart = null;
    }

    open(onRestart) {
        super.open();

        this.onRestart = onRestart;
    }

    render(ctx, width, height, endText = "The End") {
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

        this.renderTitle(ctx, width, endText, titleY);
        this.renderButton(ctx, width, buttonY, 'Play again');
    }

    handleClick(x, y) {
        if (!this.isButtonClicked(x, y)) {
            return true;
        }

        this.close();

        if (this.onRestart) {
            this.onRestart();
        }

        return true;
    }
}