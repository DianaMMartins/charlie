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

        this.renderTitle(ctx, width, endText);
        this.renderButton(ctx, width, height, 'Play again');
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