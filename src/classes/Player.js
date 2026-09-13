import {
    HAND_SIZE,
    BOARD_SIZE,
    CARD_SIZE,
    HAND_CARD_GAP,
    DISCARD_SIZE,
    UI_MARGIN
} from "../enum/gameSizes";
import { DISCARD } from "../enum/gameStatus";
import { renderText } from "../utils/canvas";
import { isPointInsideRect } from "../utils/geometry";
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

        this.cardSize = CARD_SIZE;
        this.cardGap = HAND_CARD_GAP;
        this.discardSize = DISCARD_SIZE;
        this.uiMargin = UI_MARGIN;

        this.drawCards(HAND_SIZE);
        this.deck.finishSetup();

        this.discardHovered = false;
    }

    setLayout(gameWidth, y) {
        this.width = gameWidth;

        const handWidth = this.getMaxHandWidth();
        const totalWidth =
            this.cardSize +
            this.uiMargin +
            handWidth +
            this.uiMargin +
            this.discardSize;

        const startX = (this.width - totalWidth) / 2;

        this.deckX = startX;

        this.handX = startX + this.cardSize + this.uiMargin;

        this.discardX = this.handX + handWidth + this.uiMargin;

        this.deckY = y;
        this.handY = y;
        this.discardY = y;
    }

    setScale(scale) {
        this.scale = scale;

        this.cardSize = CARD_SIZE * scale;
        this.cardGap = HAND_CARD_GAP * scale;
        this.discardSize = DISCARD_SIZE * scale;
        this.uiMargin = UI_MARGIN * scale;
    }

    getBaseWidth() {
        return (
            CARD_SIZE +
            UI_MARGIN +
            (HAND_SIZE * CARD_SIZE) +
            ((HAND_SIZE - 1) * HAND_CARD_GAP) +
            UI_MARGIN +
            DISCARD_SIZE
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
    }

    render(ctx, draggedCard = null) {
        this.renderDeck(ctx);
        this.renderHand(ctx, draggedCard);
        this.renderDiscard(ctx);
    }

    renderHandCardPosition(index) {
        return {
            x: this.handX + index * (this.cardSize + this.cardGap),
            y: this.handY
        };
    }

    renderHand(ctx, draggedCard) {
        ctx.save();

        const maxHandWidth = this.getMaxHandWidth();

        ctx.beginPath();
        ctx.rect(
            this.handX,
            this.handY,
            maxHandWidth,
            this.cardSize
        );
        ctx.clip();

        for (let i = 0; i < this.hand.length; i++) {
            const card = this.hand[i];

            if (card === draggedCard) {
                continue;
            }

            const rect = this.getHandCardRect(i);

            card.render(
                ctx,
                rect.x,
                rect.y,
                rect.width
            );
        }

        ctx.restore();
    }

    renderDeck(ctx) {
        if (this.deck.length === 0) {
            return;
        }

        const topCard = this.deck.cards[this.deck.cards.length - 1];

        if (topCard) {
            topCard.render(ctx, this.deckX, this.deckY, this.cardSize);
        }
    }

    renderDiscard(ctx) {
        const card = this.discardPile[this.discardPile.length - 1];

        renderText(
            ctx,
            DISCARD,
            this.discardX + this.discardSize / 2,
            this.discardY - this.uiMargin / 2,
        );

        if (card) {
            card.renderBack(
                ctx,
                this.discardX,
                this.discardY,
                this.discardSize
            );

            this.renderDeckOverlay(ctx);
        } else {
            this.drawEmptyDiscard(ctx);
        }

        if (this.discardHovered) {
            ctx.save();

            ctx.fillStyle = "rgb(20, 139, 20)";
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
    }

    renderDeckOverlay(ctx) {
        ctx.save();

        const padding = 1;

        ctx.fillStyle = "rgba(21, 37, 88, 0.8)";

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

        ctx.fillStyle = "rgba(21, 37, 88, 0.8)";
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

    getMaxHandWidth() {
        return this.cardSize * HAND_SIZE + (HAND_SIZE - 1) * this.cardGap;
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

    removeCard(card) {
        const index = this.hand.indexOf(card);

        if (index === -1) {
            return false;
        }

        this.hand.splice(index, 1);

        return true;
    }

    discard(card) {
        this.removeCard(card);
        this.discardPile.push(card);
    }

    getCardAtPosition(x, y) {
        for (let i = 0; i < this.hand.length; i++) {
            const rect = this.getHandCardRect(i);

            if (isPointInsideRect(x, y, rect)) {
                return this.hand[i];
            }
        }

        return null;
    }

    getHandCardRect(index) {
        const { x, y } = this.renderHandCardPosition(index);

        return {
            x,
            y,
            width: this.cardSize,
            height: this.cardSize
        };
    }

    isPointInsideDiscard(x, y) {
        return isPointInsideRect(x, y, {
            x: this.discardX,
            y: this.discardY,
            width: this.discardSize,
            height: this.discardSize
        });
    }

    setDiscardHovered(value) {
        this.discardHovered = value;
    }

    clearDiscardHover() {
        this.discardHovered = false;
    }
}