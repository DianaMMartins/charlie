import { Player } from "./Player";
import { Board } from "./Board";
import { BTN_H, BTN_WIDTH, DEFAULT_MARGIN, HAND_CARD_GAP, HAND_SIZE, UI_MARGIN } from "../enum/gameSizes";import { FINISH_CARD, NUMBER_CARD, START_CARD } from "../enum/cardTypes.";
import { START, GAME_PLAY, PLAY_MSG, DISCARD_CARD, DISCARD_MSG, PLAY_CARD, COMPLETE_BOARD_MSG, PLAY_START_MSG, PLAY_START_CARD, DISCARD_START_CARDS, REQUIRED_DISCARD, GAME_LOST, GAME_WON, TUTORIAL, DRAW_CARDS } from "../enum/gameStatus";
import { StartOverlay } from "./overlays/StartOverlay";
import { DiscardOverlay } from "./overlays/DiscardOverlay";
import { EndOverlay } from "./overlays/EndOverlay";
import { InputController } from "./InputController";
import { isPointInsideRect } from "../utils/geometry";
import { playErrorSound, playVictorySound, startAmbience as startSound, stopAmbience } from "../ambience";
import { ParticleBackground as Background } from "./Background";
import { renderRainbowBorder, renderRainbowText, renderText } from "../utils/canvas";
import { TutorialOverlay } from "./overlays/TutorialOverlay";

export class Game {
    constructor() {
        this.canvas = document.querySelector("#game");
        this.ctx = this.canvas.getContext("2d");

        this.board = new Board();
        this.player = new Player();

        this.startOverlay = new StartOverlay();
        this.tutorialOverlay = new TutorialOverlay();
        this.discardOverlay = new DiscardOverlay(this.player);
        this.endOverlay = new EndOverlay();

        this.overlay = null;

        this.layoutGap = UI_MARGIN;
        this.msgHeight = 20;

        this.status = START;
        this.action = null

        this.discardCount = 0;
        this.discardRequired = 0;

        this.lastPlayedCard = null;

        this.msg = "";

        this.input = new InputController(this);
        this.background = new Background();

        this.audioMuted = false;
        this.audioBtn = null;
        this.drawBtn = null;

        this.resize();

        window.addEventListener("resize", () => {
            this.resize();
        })

        this.input.setup();
    }

    start() {
        this.openStart();

        this.loop();
    }

    openStart() {
        this.overlay = this.startOverlay;

        this.startOverlay.open(() => {
            this.startTutorial();
        });
    }

    startTutorial() {
        this.status = TUTORIAL;

        this.overlay = this.tutorialOverlay;

        this.tutorialOverlay.open(() => {
            this.selectGamePlay();
            this.overlay = null;
        });

        if (!this.audioMuted) {
            startSound();
        }
    }

    selectGamePlay() {
        this.status = GAME_PLAY;
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
        this.renderMsg();
        this.player.render(this.ctx, this.input.draggedCard);

        this.renderDragCard();

        if (this.overlay) {
            this.overlay.render(
                this.ctx,
                this.canvas.width,
                this.canvas.height
            );
        }

        this.renderOpenDiscardBtn();
        this.renderDrawBtn();
        this.renderAudioBtn();
    }

    restart() {
        this.board = new Board();
        this.player = new Player();

        this.discardOverlay =
            new DiscardOverlay(this.player);

        this.overlay = null;

        this.discardCount = 0;
        this.discardRequired = 0;

        this.status = START;
        this.action = null;
        this.msg = "";

        this.resize();

        this.openStart();
    }

    renderMsg() {
        const lines = this.msg.split("\n");
        const lineHeight = 24;
        const startY =
            this.msgY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
            renderRainbowText(
                this.ctx,
                line,
                this.canvas.width / 2,
                startY + index * lineHeight,
                {
                    font: "20px sans-serif",
                }
            );
        });
    }

    renderDragCard() {
        if (!this.input.draggedCard) {
            return;
        }

        this.input.draggedCard.render(
            this.ctx,
            this.input.dragX,
            this.input.dragY
        )
    }

    renderOpenDiscardBtn() {
        this.showDiscardBtn = null;

        if (
            this.overlay !== this.discardOverlay ||
            this.discardOverlay.visible
        ) {
            return;
        }

        const width = BTN_WIDTH;
        const height = BTN_H;
        const borderWidth = 3;

        const x =
            this.player.discardX +
            (this.player.discardSize - width) / 2;

        const y = this.player.discardY - height - UI_MARGIN;

        this.showDiscardBtn = {
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
        if (!this.showDiscardBtn) {
            return false;
        }

        return isPointInsideRect(x, y, this.showDiscardBtn);
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
        this.layoutMsg();
        this.layoutPlayer();
    }

    getLayoutStartY() {
        const totalHeight = this.getLayoutHeight();

        return (this.canvas.height - totalHeight) / 2;
    }

    getLayoutHeight() {
        return (
            this.board.height +
            this.msgHeight +
            this.player.cardSize +
            this.layoutGap * 2
        );
    }

    layoutBoard(startY) {
        this.board.x = (this.canvas.width - this.board.width) / 2;
        this.board.y = startY;
    }

    layoutMsg() {
        this.msgY =
            this.board.y +
            this.board.height +
            this.layoutGap +
            this.msgHeight / 2;
    }

    layoutPlayer() {
        const playerY = this.msgY + this.msgHeight / 2 + this.layoutGap;

        this.player.setLayout(this.canvas.width, playerY);
    }

    canDropCard(cell, card) {
        if (!card) return false;

        if (card.value === START_CARD) {
            return cell.type === START_CARD &&
                this.action === PLAY_START_CARD;
        }

        if (card.value === FINISH_CARD) {
            return cell.type === FINISH_CARD &&
                this.board.isFull();
        }

        if (typeof card.value === "number") {
            return this.canPlayNCard(cell, card);
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
            this.msg = `Discard ${this.discardRequired} cards`;
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
                this.msg = `Discard ${this.discardRequired - this.discardCount} cards`;
                this.input.cancelDrag();
            }

            return true;
        }

        this.action = DISCARD_CARD;

        if (this.discardCount === 2) {
            this.endTurn();
        } else {
            this.msg = DISCARD_MSG;
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
            this.msg = COMPLETE_BOARD_MSG + "\n" + PLAY_MSG;

            return false;
        }

        this.board.placeCard(cell.row, cell.col, card);
        this.endGame(true);

        return true;
    }

    playNCard(cell, card) {
        if (!this.canPlayNCard(cell, card)) return false;

        const discardRequired = this.getDiscardRequired(
            card,
            this.board.getAdjacentCards(cell)
        );

        this.board.placeCard(cell.row, cell.col, card);
        this.lastPlayedCard = card;
        this.discardRequired = discardRequired;
        this.discardCount = 0;

        if (discardRequired > 0) {
            this.action = REQUIRED_DISCARD;
            this.msg = `Discard ${discardRequired} cards`;
        } else {
            this.endTurn();
        }

        return true;
    }

    canPlayNCard(cell, card) {
        if (cell.type !== NUMBER_CARD) {
            return false;
        }
        
        if (!this.board.validatePlayedCard(cell, card)) {
            return false;
        }

        return this.getDiscardRequired(
            card,
            this.board.getAdjacentCards(cell)
        ) !== false;
    }

    startLastCardDrag(x, y) {
        if (
            this.action !== DRAW_CARDS ||
            !this.lastPlayedCard
        ) {
            return false;
        }

        const cell = this.board.getCellWithCard(
            this.lastPlayedCard
        );

        if (!cell) {
            return false;
        }

        const position = this.board.getCellPosition(
            cell.row,
            cell.col
        );

        this.input.dragOriginalCell = cell;

        this.board.removeCard(cell);

        this.input.draggedCard = this.lastPlayedCard;
        this.input.dragging = true;

        this.input.dragOffsetX = x - position.x;
        this.input.dragOffsetY = y - position.y;

        this.input.dragX = position.x;
        this.input.dragY = position.y;

        return true;
    }

    moveLastPlayedCard(cell) {
        const card = this.input.draggedCard;

        if (this.action !== DRAW_CARDS 
            || card !== this.lastPlayedCard 
            || !this.canPlayNCard(cell, card)
        ) {
            return false;
        }

        this.board.placeCard(cell.row, cell.col, card);
        this.input.dragOriginalCell = null;

        return true;
    }

    getDiscardRequired(card, adjacentCards) {
        let discard = 0;

        for (const c of adjacentCards) {
            const x = this.board.getCardDifference(card, c);
            if (!discard || x < discard) discard = x;
        }

        return discard > 4 ? false : discard;
    }

    renderDrawBtn() {
        this.drawBtn = null;

        if (this.action !== DRAW_CARDS) {
            return;
        }

        const width = BTN_WIDTH;
        const height = BTN_H;
        const borderWidth = 3;

        const x =
            this.canvas.width / 2 -
            width / 2;

        const y =
            this.player.handY -
            height -
            UI_MARGIN;

        this.drawBtn = {
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
            this.overlay?.gradientAngle || 0
        );

        renderText(
            this.ctx,
            "Draw",
            x + width / 2,
            y + height / 2,
            {
                fillStyle: "black"
            }
        );
    }

    isDrawBtnClicked(x, y) {
        if (!this.drawBtn) {
            return false;
        }

        return isPointInsideRect(x, y, this.drawBtn);
    }

    renderAudioBtn() {
        const size = DEFAULT_MARGIN;
        const margin = HAND_CARD_GAP;

        const x = this.canvas.width - size - margin;
        const y = margin;

        this.audioBtn = {
            x,
            y,
            width: size,
            height: size
        };

        this.ctx.save();

        this.ctx.fillStyle = "black";

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, size, size, 8);
        this.ctx.fill();

        renderText(
            this.ctx,
            this.audioMuted ? "🔇" : "🔊",
            x + size / 2,
            y + size / 2,
            {
                font: "22px sans-serif",
                fillStyle: "white"
            }
        );

        this.ctx.restore();
    }

    isAudioBtnClicked(x, y) {
        if (!this.audioBtn) {
            return false;
        }

        return isPointInsideRect(x, y, this.audioBtn);
    }

    toggleAudio() {
        this.audioMuted = !this.audioMuted;

        if (this.audioMuted) {
            stopAmbience();
        } else if (this.status === GAME_PLAY) {
            startSound();
        }
    }

    endTurn() {
        this.discardCount = 0;
        this.discardRequired = 0;

        this.input.cancelDrag();

        this.action = DRAW_CARDS;
        this.msg = "Draw cards";
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

    drawTurnCards() {
        if (this.action !== DRAW_CARDS) {
            return;
        }

        const drawCards = this.player.drawCards(
            HAND_SIZE - this.player.hand.length
        );

        if (this.player.hand.length === 0) {
            this.endGame(false);
            return;
        }

        const isStartDrawn = drawCards.some(
            card => card.value === START_CARD
        );

        if (isStartDrawn) {
            this.action = PLAY_START_CARD;
            this.msg = PLAY_START_MSG;
            return;
        }

        this.action = PLAY_CARD;
        this.msg = PLAY_MSG;
    }
} 