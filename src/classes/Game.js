import { Player } from "./Player";
import { Board } from "./Board";
import { HAND_SIZE, UI_MARGIN } from "../enum/gameSizes";
import { FINISH_CARD, NUMBER_CARD, START_CARD } from "../enum/cardTypes.";
import { START_GAME, GAME_PLAY, PLAY_MSG, DISCARD_CARD, DISCARD_MSG, PLAY_CARD, COMPLETE_BOARD_MSG, PLAY_START_MSG, PLAY_START_CARD, DISCARD_START_CARDS, REQUIRED_DISCARD, GAME_LOST, GAME_WON } from "../enum/gameStatus";
import { StartOverlay } from "./overlays/StartOverlay";
import { DiscardOverlay } from "./overlays/DiscardOverlay";
import { EndOverlay } from "./overlays/EndOverlay";

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

        this.draggedCard = null;
        this.dragging = false;

        this.dragX = 0;
        this.dragY = 0;

        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.resize();

        window.addEventListener("resize", () => {
            this.resize();
        })

        this.setupInput();
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

        this.board.render(this.ctx);
        this.renderMessage();
        this.player.render(this.ctx, this.draggedCard);

        this.renderDraggedCard();

        if (this.overlay) {
            this.overlay.render(
                this.ctx,
                this.canvas.width,
                this.canvas.height
            );
        }
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
        this.ctx.save();

        this.ctx.fillStyle = "black";
        this.ctx.font = "20px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        const lines = this.message.split("\n");
        const lineHeight = 24;
        const startY = this.messageY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
            this.ctx.fillText(
                line,
                this.canvas.width / 2,
                startY + index * lineHeight
            );
        });

        this.ctx.restore();
    }
    
    renderDraggedCard() {
        if (!this.draggedCard) {
            return;
        }

        this.draggedCard.render(
            this.ctx,
            this.dragX,
            this.dragY
        )
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

    setupInput() {
        this.canvas.addEventListener("pointerdown", (e) => {
            const { x, y } = this.getPointerPosition(e);

            if (this.overlay) {
                this.overlay.handleClick(x, y);
                return;
            }

            this.startDrag(e);
        });

        if (!this.overlay) {
            this.canvas.addEventListener("pointermove", (e) => {

                this.updateDrag(e);
            });

            this.canvas.addEventListener("pointerup", (e) => {

                this.endDrag(e);
            });

            this.canvas.addEventListener("pointercancel", () => {
                this.cancelDrag();
            });
        }
    }

    getPointerPosition(e) {
        const rect = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrag(e) {
        const { x, y } = this.getPointerPosition(e);
        const card = this.player.getCardAtPosition(x, y);

        if (!card) {
            return;
        }

        const index = this.player.hand.indexOf(card);
        const { x: cardX, y: cardY } = this.player.renderHandCardPosition(index);

        this.draggedCard = card;
        this.dragging = true;

        this.dragOffsetX = x - cardX;
        this.dragOffsetY = y - cardY;

        this.dragX = cardX;
        this.dragY = cardY;

        this.canvas.setPointerCapture(e.pointerId);
    }

    updateDrag(e) {
        if (!this.dragging) {
            return;
        }

        const { x, y } = this.getPointerPosition(e);

        this.dragX = x - this.dragOffsetX;
        this.dragY = y - this.dragOffsetY;
    }

    endDrag(e) {
        if (!this.dragging) {
            return;
        }

        const { x, y } = this.getPointerPosition(e);

        const discardArea = this.player.isPointInsideDiscard(x, y);

        if (discardArea) {
            this.dropCardOnDiscard();
            return;
        }

        const boardCell = this.board.getCellAtPosition(x, y);

        if (boardCell && boardCell.card === null) {
            this.dropCardOnBoard(boardCell);

            return;
        }

        this.cancelDrag();
    }

    cancelDrag() {
        this.draggedCard = null;
        this.dragging = false;
    }

    dropCardOnBoard(cell) {
        if (this.action === DISCARD_CARD || this.action === REQUIRED_DISCARD) {
            this.cancelDrag();
            return;
        }

        const card = this.draggedCard;

        if (!card) {
            return;
        }

        if (!this.playCard(cell, card)) {
            this.cancelDrag();
            return;
        }

        this.player.removeCard(card);

        if (this.action === DISCARD_START_CARDS) {
            this.discardCount = 0;
            this.cancelDrag();

            return;
        }

        if (this.discardRequired > 0) {
            this.message = `Discard ${this.discardRequired} cards`;
            this.action = REQUIRED_DISCARD;
            this.cancelDrag();

            return;
        }

        this.endTurn();
    }

    dropCardOnDiscard() {
        const card = this.draggedCard;

        if (!card) {
            return false;
        }

        if (
            this.action !== PLAY_CARD &&
            this.action !== DISCARD_CARD &&
            this.action !== REQUIRED_DISCARD
        ) {
            this.cancelDrag();
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

                this.cancelDrag();
            }

            return true;
        }

        this.action = DISCARD_CARD;

        if (this.discardCount === 2) {
            this.endTurn();
        } else {
            this.message = DISCARD_MSG;
            this.cancelDrag();
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

        // show win screen & end game
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

    endTurn() {
        this.discardCount = 0;
        this.discardRequired = 0;

        const drawCards = this.player.drawCards(HAND_SIZE - this.player.hand.length);

        this.cancelDrag();

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
        this.cancelDrag();

        this.overlay = this.endOverlay;

        this.endOverlay.open(won, () => {
            this.restart();
        });
    }
} 