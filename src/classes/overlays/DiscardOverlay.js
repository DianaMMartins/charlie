import { BTN_H, BTN_WIDTH, DEFAULT_MARGIN, UI_MARGIN } from "../../enum/gameSizes";
import { DISCARD } from "../../enum/gameStatus";
import { isPointInsideRect } from "../../utils/geometry";
import { Overlay } from "./Overlay";

export class DiscardOverlay extends Overlay {
    constructor(player) {
        super();

        this.player = player;

        this.visible = false;
        this.wasOpened = false;

        this.onHide = null;
        this.onDiscard = null;

        this.cards = [];
        this.selectedCards = [];
        this.cardPositions = [];

        this.columns = 4;
        this.gap = UI_MARGIN;
    }

    open(onDiscard, onHide) {
        super.open();

        this.visible = true;
        this.wasOpened = true;

        this.cards = this.player.hand;
        this.selectedCards = [];
        this.cardPositions = [];

        this.onDiscard = onDiscard;
        this.onHide = onHide;
    }

    close() {
        super.close();

        this.visible = false;
        this.selectedCards = [];
    }

    render(ctx, width, height) {
        if (!this.active || !this.visible) {
            return;
        }

        super.render(ctx, width, height);

        const titleHeight = DEFAULT_MARGIN;
        const gap = UI_MARGIN;
        const btnHeight = BTN_H;

        const rows = Math.ceil(this.player.hand.length / this.columns);
        const cardsHeight = rows * this.player.cardSize + (rows - 1) * this.gap;

        const totalHeight = titleHeight + gap + cardsHeight + gap + btnHeight;
        const startY = this.getCenteredY(height, totalHeight);

        const titleY = startY + titleHeight / 2;
        const cardsY = startY + titleHeight + gap;
        const btnY = cardsY + cardsHeight + gap;


        this.renderTitle(
            ctx,
            width,
            "Select 8 cards to " + DISCARD,
            titleY
        );
        this.renderCards(ctx, width, cardsY);

        const btnWidth = BTN_WIDTH;

        const totalBtnWidth = btnWidth * 2 + gap;
        const btnStartX = (width - totalBtnWidth) / 2;

        this.discardBtn = this.renderBtn(ctx, btnStartX, btnY, DISCARD, this.selectedCards.length === 8, DISCARD);
        this.hideBtn = this.renderBtn(ctx, btnStartX + btnWidth + gap, btnY, "Hide", true, "hide", "white");
    }

    renderCards(ctx, width, startY) {
        const cardSize = this.player.cardSize;

        const totalWidth =
            this.columns * cardSize +
            (this.columns - 1) * this.gap;

        const startX =
            (width - totalWidth) / 2;

        this.cardPositions = [];

        for (let i = 0; i < this.player.hand.length; i++) {
            const card = this.player.hand[i];

            const column = i % this.columns;
            const row = Math.floor(i / this.columns);

            const x = startX + column * (cardSize + this.gap);

            const y = startY + row * (cardSize + this.gap);

            this.cardPositions.push({
                card,
                x,
                y,
                width: cardSize,
                height: cardSize
            });

            card.renderFront(
                ctx,
                x,
                y,
                cardSize
            );

            if (this.selectedCards.includes(card)) {
                this.renderSelectedCard(
                    ctx,
                    x,
                    y,
                    cardSize
                );
            }
        }
    }

    renderSelectedCard(ctx, x, y, size) {
        ctx.save();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.roundRect(
            x - 4,
            y - 4,
            size + 8,
            size + 8,
            8
        );

        ctx.stroke();

        ctx.restore();
    }

    toggleCard(card) {
        const index = this.selectedCards.indexOf(card);

        if (index !== -1) {
            this.selectedCards.splice(index, 1);
            return;
        }

        if (this.selectedCards.length >= 8) {
            return;
        }

        this.selectedCards.push(card);
    }

    handleClick(x, y) {
        for (const item of this.cardPositions) {
            if (isPointInsideRect(x, y, item)) {
                this.toggleCard(item.card);
                return true;
            }
        }

        if (isPointInsideRect(x, y, this.hideBtn)) {
            this.hide();
            return true;
        }

        if (isPointInsideRect(x, y, this.discardBtn)) {
            if (this.selectedCards.length !== 8) {
                return true;
            }

            if (this.onDiscard) {
                this.onDiscard(this.selectedCards);
            }

            this.close();

            return true;
        }

        return true;
    }

    hide() {
        this.visible = false;

        if (this.onHide) this.onHide();
    }

    show() {
        this.visible = true;
    }
}