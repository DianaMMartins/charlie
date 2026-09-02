import { Overlay } from "./Overlay";

export class DiscardOverlay extends Overlay {
    constructor(player) {
        super();

        this.player = player;

        this.cards = [];
        this.selectedCards = [];
        this.cardPositions = [];

        this.columns = 4;
        this.gap = 20;

        this.button = null;
    }

    open() {
        this.cards = this.player.hand;
        this.selectedCards = [];
        this.cardPositions = [];

        console.log(this.cards);
        
    }

    close() {
        super.close();

        this.selectedCards = [];
    }

    render(ctx, width, height) {
        if (!this.active) {
            return;
        }

        super.render(ctx, width, height);

        this.renderTitle(ctx, width);
        this.renderCards(ctx, width);
        this.renderButton(ctx, width, height);
    }

    renderTitle(ctx, width) {
        ctx.save();

        ctx.fillStyle = 'black';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';

        ctx.fillText(
            `Select 8 cards to discard`,
            width / 2,
            70
        );

        ctx.restore();
    }

    renderCards(ctx, width) {
        const cardSize = this.player.cardSize;

        const totalWidth =
            this.columns * cardSize +
            (this.columns - 1) * this.gap;

        const startX =
            (width - totalWidth) / 2;

        const startY = 100;

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
                y
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

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;

        ctx.strokeRect(
            x - 4,
            y - 4,
            size + 8,
            size + 8
        );

        ctx.restore();
    }

    renderButton(ctx, width, height) {
        super.renderButton(
            ctx,
            width,
            height,
            "Discard",
            this.selectedCards.length === 8
        );
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
            if (
                x >= item.x &&
                x <= item.x + this.player.cardSize &&
                y >= item.y &&
                y <= item.y + this.player.cardSize
            ) {
                this.toggleCard(item.card);
                return false;
            }
        }

        if (this.isButtonClicked(x, y)) {
            return this.selectedCards.length === 8;
        }

        return false;
    }
}