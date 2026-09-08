import { FINISH_CARD, START_CARD } from "../enum/cardTypes.";
import { NUMBER_CARDS } from "../enum/gameSizes";
import { Card } from "./Card";

export class Deck {
    constructor() {
        this.cards = [];
        this.topDeck = [];
        this.bottomDeck = [];

        this.create();
        this.shuffle();
    }

    create() {
        for (let value = 1; value <= NUMBER_CARDS ; value++) {
            this.cards.push(new Card(value));
        }

        for (let value = 1; value <= 5; value++) {
            this.cards.push(new Card(FINISH_CARD));
        }
    }

    shuffle(cards = this.cards) {        
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }

    draw() {        
        const card = this.cards.shift();

        if (card) {
            card.revealed = true;
        }

        return card;
    }

    finishSetup() {  
        const half = Math.ceil(this.cards.length / 2);

        this.topDeck = this.cards.splice(0, half);
        this.bottomDeck = this.cards.splice(0);

        this.topDeck.push(new Card(START_CARD));

        this.shuffle(this.topDeck);
     
        this.cards = this.topDeck.concat(this.bottomDeck);
    }
}