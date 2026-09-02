import {
    HAND_SIZE,
    BOARD_SIZE,
    CARD_DIMENSIONS,
    HAND_CARD_GAP,
    DISCARD_DIMENSIONS,
    UI_MARGIN
} from "../enum/gameSizes";
import { Deck } from "./Deck";

export class Player {
    constructor() {
        this.deck = new Deck();
        this.hand = [];
        this.discardPile = [];

        this.width = 0;
        this.height = 0;

        this.deckX = 0;
        this.deckY = 0;

        this.handX = 0;
        this.handY = 0;

        this.discardX = 0;
        this.discardY = 0;

        this.scale = 1;

        this.cardSize = CARD_DIMENSIONS;
        this.cardGap = HAND_CARD_GAP;
        this.discardSize = DISCARD_DIMENSIONS;
        this.uiMargin = UI_MARGIN;

        this.selectedCards = [];

        this.drawCards(HAND_SIZE);
        this.deck.finishSetup();
    }

    setLayout(gameWidth, gameHeight, y) {
        this.width = gameWidth;
        this.height = gameHeight;

        const handWidth = this.getHandWidth();
        const startX = this.getX(handWidth);

        this.deckX = startX;
        this.handX = startX + this.cardSize + this.uiMargin;
        this.discardX = this.handX + handWidth + this.cardGap;

        this.deckY = y;
        this.handY = y;
        this.discardY = y;
    }

    setScale(scale) {
        this.scale = scale;

        this.cardSize = CARD_DIMENSIONS * scale;
        this.cardGap = HAND_CARD_GAP * scale;
        this.discardSize = DISCARD_DIMENSIONS * scale;
        this.uiMargin = UI_MARGIN * scale;
    }

    getBaseWidth() {
        return (
            CARD_DIMENSIONS +
            UI_MARGIN +
            (HAND_SIZE * CARD_DIMENSIONS) +
            ((HAND_SIZE - 1) * HAND_CARD_GAP) +
            UI_MARGIN +
            DISCARD_DIMENSIONS
        );
    }

    getScale(screenWidth) {
        return Math.min(
            1,
            (screenWidth * 0.9) / this.getBaseWidth()
        );
    }

    resize(screenWidth) {
        const scale = this.getScale(screenWidth);
        this.setScale(scale);
    }

    update() {
        // console.log('update');
    }

    render(ctx, draggedCard = null) {
        this.renderDeck(ctx);
        this.renderHand(ctx, draggedCard);
        this.renderDiscard(ctx);
    }

    renderHandCardPosition(index) {
        const handWidth = this.getHandWidth();
        const startX = (this.width - handWidth) / 2;

        return {
            x: startX + index * (this.cardSize + this.cardGap),
            y: this.handY
        };
    }

    renderHand(ctx, draggedCard) {
        for (let i = 0; i < this.hand.length; i++) {
            const card = this.hand[i];

            if (card === draggedCard) {
                continue;
            }

            const { x, y } = this.renderHandCardPosition(i);

            card.render(ctx, x, y, this.cardSize);
        }
    }

    renderDeck(ctx) {
        const topCard = this.deck.cards[this.deck.cards.length - 1];

        if (topCard) {
            topCard.render(ctx, this.deckX, this.deckY, this.cardSize);
        }
    }

    renderDiscard(ctx) {
        const card = this.discardPile[this.discardPile.length - 1];

        if (card) {
            card.renderBack(
                ctx,
                this.discardX,
                this.discardY,
                this.discardSize
            );

            this.renderDiscardOverlay(ctx);
        } else {
            this.drawEmptyDiscard(ctx);
        }
    }

    renderDiscardOverlay(ctx) {
        ctx.save();

        const padding = 1;

        ctx.fillStyle = "rgb(212, 212, 212, 0.7)";

        ctx.beginPath();

        ctx.roundRect(
            this.discardX - padding,
            this.discardY - padding,
            this.discardSize + padding * 2,
            this.discardSize + padding * 2,
            BOARD_SIZE
        );

        ctx.fill();

        ctx.restore();
    }

    drawEmptyDiscard(ctx) {
        ctx.save();

        ctx.fillStyle = "rgb(212, 212, 212)";
        ctx.beginPath();

        ctx.roundRect(
            this.discardX,
            this.discardY,
            this.discardSize,
            this.discardSize,
            BOARD_SIZE
        );

        ctx.fill();
        ctx.restore();
    }

    getHandWidth() {
        return (
            this.hand.length * this.cardSize +
            (this.hand.length - 1) * this.cardGap
        );
    }

    getX(handWidth) {
        const totalWidth = this.cardSize + this.uiMargin + handWidth + this.uiMargin + this.cardSize;

        return (this.width - totalWidth) / 2;
    }

    drawCards(amount) {
        const drawnCards = [];

        for (let i = 0; i < amount; i++) {
            const card = this.deck.draw();

            if (card) {
                this.hand.push(card);
                drawnCards.push(card);
            }
        }

        return drawnCards;
    }

    discard(card) {
        const index = this.hand.indexOf(card);

        if (index === -1) {
            return;
        }

        this.hand.splice(index, 1);
        this.discardPile.push(card);
    }

    playSelectedCard(card, row, col) {
        const index = this.hand.indexOf(card);

        if (index === -1) {
            return false;
        }

        const placed = this.board.placeCard(row, col, card);

        if (!placed) {
            return false;
        }

        this.hand.splice(index, 1);

        return true;
    }

    getCardAtPosition(x, y) {
        for (let i = 0; i < this.hand.length; i++) {
            const { x: cardX, y: cardY } = this.renderHandCardPosition(i);

            if (this.isPointInsideCard(x, y, cardX, cardY)) {
                return this.hand[i];
            }
        }

        return null;
    }

    isPointInsideCard(x, y, cardX, cardY, size = this.cardSize) {
        return (
            x >= cardX &&
            x <= cardX + size &&
            y >= cardY &&
            y <= cardY + size
        )
    }

    isPointInsideDiscard(x, y) {
        return this.isPointInsideCard(
            x,
            y,
            this.discardX,
            this.discardY,
            this.discardSize
        );
    }

    removeCard(card) {
        const index = this.hand.indexOf(card);

        if (index === -1) {
            return false;
        }

        this.hand.splice(index, 1);

        return true;
    }
}