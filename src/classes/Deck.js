import { DECK_SIZE, CARD_DIMENSIONS } from "../enum/gameSizes";
import { Card } from "./Card";

export class Deck {
    constructor() {
        this.cards = [];
        this.deckSize = DECK_SIZE;

        this.create();
        this.shuffle();
    }

    create() {
        for (let value = 1; value <= this.deckSize; value++) {
            this.cards.push(new Card(value));
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [this.cards[i], this.cards[j]] =
                [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        const card = this.cards.pop();

        if (card) {
            card.revealed = true;
        }

        return card;
    }

    
}