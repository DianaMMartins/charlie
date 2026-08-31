import {
    HAND_SIZE,
    CARD_DIMENSIONS,
    DISCARD_DIMENSIONS,
    HAND_CARD_GAP,
    DECK_X,
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

        this.drawCards(HAND_SIZE);
    }

    setLayout(gameWidth, gameHeight) {
        this.width = gameWidth;
        this.height = gameHeight;

        const handWidth = this.getHandWidth();
        const startX = this.getX(handWidth);

        this.deckX = startX;
        this.handX = startX + CARD_DIMENSIONS + UI_MARGIN;
        this.discardX = this.handX + handWidth + HAND_CARD_GAP;

        const h = gameHeight - CARD_DIMENSIONS - UI_MARGIN

        this.deckY = h;
        this.handY = h;
        this.discardY = gameHeight - CARD_DIMENSIONS - 20;
    } 

    update() {
        console.log('update');
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
            x: startX + index * (CARD_DIMENSIONS + HAND_CARD_GAP),
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

            card.render(ctx, x, y);
        }
    }

    renderDeck(ctx) {
        const topCard = this.deck.cards[this.deck.cards.length - 1];

        if (topCard) {
            topCard.render(ctx, this.deckX, this.deckY, CARD_DIMENSIONS);
        }
    }

    renderDiscard(ctx) {
        const card = this.discardPile[this.discardPile.length - 1];

        this.debugDiscard(ctx);

        if (card) {
            card.renderBack(
                ctx,
                this.discardX,
                this.discardY,
                DISCARD_DIMENSIONS
            );

        }
    }

    // temp
    debugDiscard(ctx) {
         ctx.save();

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            this.discardX,
            this.discardY,
            DISCARD_DIMENSIONS,
            DISCARD_DIMENSIONS
        );
         ctx.restore();
    }

    getHandWidth() {
        return (
            this.hand.length * CARD_DIMENSIONS +
            (this.hand.length - 1) * HAND_CARD_GAP
        );
    }

    getX(handWidth) {
        const totalWidth = CARD_DIMENSIONS + UI_MARGIN + handWidth + UI_MARGIN + DISCARD_DIMENSIONS;

        return (this.width - totalWidth) / 2;
    }

    drawCards(amount) {
        for (let i = 0; i < amount; i++) {
            const card = this.deck.draw();

            if (card) {
                this.hand.push(card);
            }
        }
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

    isPointInsideCard(x, y, cardX, cardY, size = CARD_DIMENSIONS) {
        return (
            x >= cardX &&
            x <= cardX + size &&
            y >= cardY &&
            y <= cardY + size
        )
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

    removeCard(card) {
        const index = this.hand.indexOf(card);

        if (index === -1) {
            return false;
        }

        this.hand.splice(index, 1);

        return true;
    }
}