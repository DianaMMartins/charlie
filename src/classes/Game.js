import { Player } from "./Player";
import { Board } from "./Board";
import { BOARD_SIZE, BOARD_TILE_SIZE, BOARD_Y, GAME_HEIGHT, GAME_WIDTH, HAND_SIZE, UI_MARGIN } from "../enum/gameSizes";
import { FINISH_CARD, NUMBER_CARD, START_CARD } from "../enum/cardTypes.";
import { END_GAME, START_GAME, GAME_PLAY, PLAY_MSG, DISCARD_CARD, DISCARD_MSG, DRAW_MSG, PLAY_CARD } from "../enum/gameStatus";

export class Game {
    constructor() {
        this.canvas = document.querySelector("#game");
        this.ctx = this.canvas.getContext("2d");

        this.board = new Board();
        this.player = new Player();

        this.layoutGap = UI_MARGIN;
        this.messageHeight = 20;

        this.status = START_GAME;
        this.action = null

        this.discardCount = 0;
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
        this.selectGamePlay();

        this.loop();
    }
    
    selectGamePlay() {
        this.status = GAME_PLAY;
        this.action = null;
        this.discardCount = 0;
        this.message = PLAY_MSG;
    }

    loop() {
        this.update();

        // if (this.status === START_GAME) {
        //     console.log('game start');

        // } else if (this.status === END_GAME) {

        // } else {
        this.render();
        // 
        // }

        requestAnimationFrame(() => this.loop());
    }

    update() {
        // Game logic
        this.player.update();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.board.render(this.ctx);
        this.renderMessage();
        this.player.render(this.ctx, this.draggedCard);

        this.renderDraggedCard();
    }

    renderMessage() {
        this.ctx.save();

        this.ctx.fillStyle = "black";
        this.ctx.font = "20px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.fillText(
            this.message,
            this.canvas.width / 2,
            this.messageY
        );

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
            this.startDrag(e);
        });

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

        const boardCell = this.board.getCellAtPosition(x, y);

        if (boardCell) {
            this.dropCardOnBoard(boardCell);

            return;
        }

        const discardCell = this.player.isPointInsideDiscard(x, y);

        if (discardCell) {
            this.dropCardOnDiscard();
            return
        }

        this.cancelDrag();
    }

    cancelDrag() {
        this.draggedCard = null;
        this.dragging = false;
    }

    dropCardOnBoard(cell) {
        if (this.action === DISCARD_CARD) {
            this.cancelDrag();
            return false;
        }

        const card = this.draggedCard;

        if (!card) {
            return false;
        }

        this.action = PLAY_CARD;
        const played = this.playCard(cell, card)

        if (!played) {
            this.cancelDrag();
            return false;
        }

        this.player.removeCard(card);

        this.endTurn();

        return true;
    }

    dropCardOnDiscard() {
        if (this.action === PLAY_CARD) {
            this.cancelDrag();
            return false;
        }

        const card = this.draggedCard;

        if (!card) {
            return false;
        }

        this.action = DISCARD_CARD;

        this.player.discard(card);
        this.discardCount++;

        if (this.discardCount === 2) {
            this.endTurn();
        } else {
            this.message = DISCARD_MSG;

            this.cancelDrag();
        }

        return true;
    }

    playCard(cell, card) {
        console.log(card.value, cell.type);

        if (card.value === START_CARD && cell.type === START_CARD) {
            return this.playStartCard(cell, card);
        } else if (card.value === FINISH_CARD && cell.type === FINISH_CARD) {
            return this.playFinishCard(cell, card);
        } else if (typeof (card.value) === 'number' && cell.type === NUMBER_CARD) {
            return this.playNCard(cell, card);
        }
    }

    playStartCard(cell, card) {
        console.log(cell);

        this.board.placeCard(cell.row, cell.col, card);
        this.player.drawCards(8);

        return true;

        // place card in start position
        // draw 8 cards to playe hand
        // make player discard 8 cards
    }

    playFinishCard(cell, card) {
        console.log(cell);

        this.board.isFull();

        // check if board is full
        // if board is full play finish card in finish position
        // show win screen & end game
        this.board.placeCard(cell.row, cell.col, card);

        return true;
    }

    playNCard(cell, card) {
        // if played next to another card 
        // discard cards with value difference (payCardToll)
        const isValidPlacement = this.board.validatePlayedCard(cell, card);

        if (isValidPlacement) {
            this.board.placeCard(cell.row, cell.col, card);

            return true;
        }

        return false;
    }

    endTurn() {
        this.action = null;
        this.discardCount = 0;
        this.message = PLAY_MSG;

        //probably move this to be a button!
        this.player.drawCards(HAND_SIZE - this.player.hand.length);

        this.cancelDrag();
    }
} 