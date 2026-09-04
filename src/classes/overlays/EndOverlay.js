import { BUTTON_H, BUTTON_WIDTH, DEFAULT_MARGIN } from "../../enum/gameSizes";
import { Overlay } from "./Overlay";

export class EndOverlay extends Overlay {
    constructor() {
        super();

        this.won = false;
        this.onRestart = null;
    }

    open(won, onRestart) {
        super.open();

        this.won = won;
        this.onRestart = onRestart;
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

        const title = this.won
            ? "You Won!"
            : "You Lost, try again!";

        this.renderTitle(ctx, width, title, titleY);
        this.renderButton(ctx, buttonX, buttonY, 'Play again');
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