import { Player } from "./Player";
import { Board } from "./Board";
import { BUTTON_H, BUTTON_WIDTH, HAND_CARD_GAP, HAND_SIZE, UI_MARGIN } from "../enum/gameSizes";
import { FINISH_CARD, NUMBER_CARD, START_CARD } from "../enum/cardTypes.";
import { START_GAME, GAME_PLAY, PLAY_MSG, DISCARD_CARD, DISCARD_MSG, PLAY_CARD, COMPLETE_BOARD_MSG, PLAY_START_MSG, PLAY_START_CARD, DISCARD_START_CARDS, REQUIRED_DISCARD, GAME_LOST, GAME_WON } from "../enum/gameStatus";
import { StartOverlay } from "./overlays/StartOverlay";
import { DiscardOverlay } from "./overlays/DiscardOverlay";
import { EndOverlay } from "./overlays/EndOverlay";
import { InputController } from "./InputController";
import { isPointInsideRect } from "../utils/geometry";
import { playErrorSound, startAmbience, stopAmbience } from "../ambience";
import { ParticleBackground } from "./ParticleBackground";
import { renderRainbowBorder, renderRainbowText, renderText } from "../utils/canvas";

export class Game {
    constructor() {
        this.canvas = document.querySelector("#game");
        this.ctx = this.canvas.getContext("2d");

        this.board = new Board();
        this.player = new Player();

        this.startOverlay = new StartOverlay();
        this.discardOverlay = new DiscardOverlay(this.player);
        this.endOverlay = new EndOverlay();

        this.overlay = null;

        this.layoutGap = UI_MARGIN;
        this.messageHeight = 20;

        this.status = START_GAME;
        this.action = null

        this.discardCount = 0;
        this.discardRequired = 0;
        this.message = "";

        this.input = new InputController(this);
        this.background = new ParticleBackground();

        this.audioMuted = false;
        this.audioBtn = null;

        this.resize();

        window.addEventListener("resize", () => {
            this.resize();
        })

        this.input.setup();
    }

    start() {
        this.openStartOverlay();

        this.loop();
    }

    openStartOverlay() {
        this.overlay = this.startOverlay;

        this.startOverlay.open(() => {
            this.selectGamePlay();
            this.overlay = null;
        });
    }

    selectGamePlay() {
        this.status = GAME_PLAY;
        this.action = PLAY_CARD;
        this.discardCount = 0;
        this.message = PLAY_MSG;

        if (!this.audioMuted) {
            startAmbience();
        }
    }

    loop() {
        this.update();
        this.render();

        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.overlay) {
            this.overlay.update();
        }

        this.player.update();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.render(this.ctx, this.canvas.width, this.canvas.height);

        this.board.render(this.ctx);
        this.renderMessage();
        this.player.render(this.ctx, this.input.draggedCard);

        this.renderDraggedCard();

        if (this.overlay) {
            this.overlay.render(
                this.ctx,
                this.canvas.width,
                this.canvas.height
            );
        }

        this.renderShowDiscardButton();
        this.renderAudioButton(this.ctx);
    }

    restart() {
        this.board = new Board();
        this.player = new Player();

        this.discardOverlay =
            new DiscardOverlay(this.player);

        this.overlay = null;

        this.discardCount = 0;
        this.discardRequired = 0;

        this.status = START_GAME;
        this.action = null;
        this.message = "";

        this.resize();

        this.openStartOverlay();
    }

    renderMessage() {
        const lines = this.message.split("\n");
        const lineHeight = 24;
        const startY =
            this.messageY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
            renderRainbowText(
                this.ctx,
                line,
                this.canvas.width / 2,
                startY + index * lineHeight,
                {
                    font: "20px sans-serif",
                    width: 240
                }
            );
        });
    }

    renderDraggedCard() {
        if (!this.input.draggedCard) {
            return;
        }

        this.input.draggedCard.render(
            this.ctx,
            this.input.dragX,
            this.input.dragY
        )
    }

    renderShowDiscardButton() {
    if (
        this.overlay !== this.discardOverlay ||
        this.discardOverlay.visible
    ) {
        return;
    }

    const width = BUTTON_WIDTH;
    const height = BUTTON_H;
    const borderWidth = 3;

    const x =
        this.player.discardX +
        (this.player.discardSize - width) / 2;

    const y = this.player.discardY - height - UI_MARGIN;

    this.showDiscardButton = {
        x,
        y,
        width,
        height
    };

    this.ctx.save();

    this.ctx.fillStyle = "white";

    this.ctx.beginPath();
    this.ctx.roundRect(
        x,
        y,
        width,
        height,
        HAND_CARD_GAP
    );

    this.ctx.fill();

    this.ctx.restore();

    renderRainbowBorder(
        this.ctx,
        x,
        y,
        width,
        height,
        borderWidth,
        HAND_CARD_GAP,
        this.overlay.gradientAngle
    );

    renderText(
        this.ctx,
        "Open to Discard!",
        x + width / 2,
        y + height / 2,
        {
            fillStyle: "black"
        }
    );
}

    isShowDiscardClicked(x, y) {
        if (!this.showDiscardButton) {
            return false;
        }

        return isPointInsideRect(x, y, this.showDiscardButton);
    }

    resize() {
        const screenWidth = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.width = screenWidth;
        this.canvas.height = height;

        this.board.resize(screenWidth);
        this.player.resize(screenWidth);

        this.layout();
    }

    layout() {
        const startY = this.getLayoutStartY();

        this.layoutBoard(startY);
        this.layoutMessage();
        this.layoutPlayer();
    }

    getLayoutStartY() {
        const totalHeight = this.getLayoutHeight();

        return (this.canvas.height - totalHeight) / 2;
    }

    getLayoutHeight() {
        return (
            this.board.height +
            this.messageHeight +
            this.player.cardSize +
            this.layoutGap * 2
        );
    }

    layoutBoard(startY) {
        this.board.x =
            (this.canvas.width - this.board.width) / 2;

        this.board.y = startY;
    }

    layoutMessage() {
        this.messageY =
            this.board.y +
            this.board.height +
            this.layoutGap +
            this.messageHeight / 2;
    }

    layoutPlayer() {
        const playerY =
            this.messageY +
            this.messageHeight / 2 +
            this.layoutGap;

        this.player.setLayout(
            this.canvas.width,
            this.canvas.height,
            playerY
        );
    }

    canDropCard(cell, card) {
        if (!card) {
            return false;
        }

        if (card.value === START_CARD) {
            return (
                cell.type === START_CARD &&
                this.action === PLAY_START_CARD
            );
        }

        if (card.value === FINISH_CARD) {
            return (
                cell.type === FINISH_CARD &&
                this.board.isFull()
            );
        }

        if (typeof card.value === "number") {
            return (
                cell.type === NUMBER_CARD &&
                this.board.validatePlayedCard(cell, card)
            );
        }

        return false;
    }

    dropCardOnBoard(cell) {
        if (this.action === DISCARD_CARD || this.action === REQUIRED_DISCARD) {
            this.input.cancelDrag();
            return;
        }

        const card = this.input.draggedCard;

        if (!card) {
            return;
        }

        if (!this.playCard(cell, card)) {
            this.input.cancelDrag();
            return;
        }

        this.player.removeCard(card);

        if (this.action === DISCARD_START_CARDS) {
            this.discardCount = 0;
            this.input.cancelDrag();

            return;
        }

        if (this.discardRequired > 0) {
            this.message = `Discard ${this.discardRequired} cards`;
            this.action = REQUIRED_DISCARD;
            this.input.cancelDrag();

            return;
        }

        this.endTurn();
    }

    dropCardOnDiscard() {
        const card = this.input.draggedCard;

        if (!card) {
            return false;
        }

        if (
            this.action !== PLAY_CARD &&
            this.action !== DISCARD_CARD &&
            this.action !== REQUIRED_DISCARD
        ) {
            this.input.cancelDrag();
            return false;
        }

        this.player.discard(card);
        this.discardCount++;

        if (this.player.hand.length === 0) {
            this.endGame(false);
            return true;
        }

        if (this.action === REQUIRED_DISCARD) {
            if (this.discardCount >= this.discardRequired) {
                this.endTurn();
            } else {
                const remaining = this.discardRequired - this.discardCount;

                this.message = `Discard ${remaining} cards`;

                this.input.cancelDrag();
            }

            return true;
        }

        this.action = DISCARD_CARD;

        if (this.discardCount === 2) {
            this.endTurn();
        } else {
            this.message = DISCARD_MSG;
            this.input.cancelDrag();
        }

        return true;
    }

    playCard(cell, card) {
        if (this.action === PLAY_START_CARD) {
            return this.playStartCard(cell, card);
        }

        if (card.value === FINISH_CARD) {
            return this.playFinishCard(cell, card);
        }

        if (typeof card.value === 'number' && this.action !== DISCARD_START_CARDS) {
            return this.playNCard(cell, card);
        }

        return false;
    }

    playStartCard(cell, card) {
        if (
            card.value !== START_CARD ||
            cell.type !== START_CARD
        ) {
            return false;
        }

        this.board.placeCard(cell.row, cell.col, card);
        this.player.drawCards(8);

        this.action = DISCARD_START_CARDS;

        this.openDiscardOverlay();

        return true;
    }

    openDiscardOverlay() {
        this.overlay = this.discardOverlay;

        this.discardOverlay.open((selectedCards) => {
            for (const card of selectedCards) {
                this.player.discard(card);
            }

            this.endTurn();

            this.overlay = null;
        });
    }

    playFinishCard(cell, card) {
        if (cell.type !== FINISH_CARD) {
            return false;
        }

        if (!this.board.isFull()) {
            this.message = COMPLETE_BOARD_MSG + "\n" + PLAY_MSG;

            return false;
        }

        this.board.placeCard(cell.row, cell.col, card);
        this.endGame(true);

        return true;
    }

    playNCard(cell, card) {
        if (cell.type !== NUMBER_CARD) {
            return false;
        }

        if (!this.board.validatePlayedCard(cell, card)) {
            return false;
        }

        const adjacentCards = this.board.getAdjacentCards(cell);
        const discardRequired = this.getDiscardRequired(card, adjacentCards);

        if (discardRequired === false) {
            return false;
        }

        this.board.placeCard(cell.row, cell.col, card);

        this.discardRequired = discardRequired;
        this.discardCount = 0;

        if (discardRequired > 0) {
            this.action = REQUIRED_DISCARD;
            this.message = `Discard ${discardRequired} cards`;
        } else {
            this.action = PLAY_CARD;
        }

        return true;
    }

    getDiscardRequired(card, adjacentCards) {
        let discardRequired = 0;
        let smallestDif = 0;

        for (const adjacentCard of adjacentCards) {
            const difference = this.board.getCardDifference(card, adjacentCard);

            if (smallestDif > difference || smallestDif === 0) {
                smallestDif = difference;
            }

        }

        if (smallestDif > 4) {
            return false;
        }

        discardRequired = Math.max(
            discardRequired,
            smallestDif
        );

        return discardRequired;
    }

    renderAudioButton(ctx) {
        const size = 44;
        const margin = 12;

        const x = this.canvas.width - size - margin;
        const y = margin;

        this.audioButton = {
            x,
            y,
            width: size,
            height: size
        };

        ctx.save();

        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 8);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            this.audioMuted ? "🔇" : "🔊",
            x + size / 2,
            y + size / 2
        );

        ctx.restore();
    }

    isAudioButtonClicked(x, y) {
        if (!this.audioButton) {
            return false;
        }

        return isPointInsideRect(x, y, this.audioButton);
    }

    toggleAudio() {
        this.audioMuted = !this.audioMuted;

        if (this.audioMuted) {
            stopAmbience();
        } else if (this.status === GAME_PLAY) {
            startAmbience();
        }
    }

    endTurn() {
        this.discardCount = 0;
        this.discardRequired = 0;

        const drawCards = this.player.drawCards(HAND_SIZE - this.player.hand.length);

        this.input.cancelDrag();

        if (this.player.hand.length === 0) {
            this.endGame(false);
            return;
        }

        const isStartDrawn = drawCards.some(card => card.value === START_CARD)

        if (isStartDrawn) {
            this.action = PLAY_START_CARD;
            this.message = PLAY_START_MSG;

            return;
        }

        this.action = PLAY_CARD;
        this.message = PLAY_MSG;
    }

    endGame(won) {
        this.status = won ? GAME_WON : GAME_LOST;
        this.action = null;
        this.input.cancelDrag();

        if (won) {
            playVictorySound();
        } else {
            playErrorSound();
        }

        stopAmbience();

        this.overlay = this.endOverlay;

        this.endOverlay.open(won, () => {
            this.restart();
        });
    }
} 