import { Player } from "./Player";
import { Board } from "./Board";
import { BOARD_Y, GAME_HEIGHT, GAME_WIDTH } from "../enum/gameSizes";
import { FINISH, PLAY, START } from "../enum/cardTypes.";

export class Game {
    constructor() {
        this.canvas = document.querySelector("#game");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;

        this.board = new Board();
        this.player = new Player();

        this.layout();

        this.draggedCard = null;
        this.dragging = false;

        this.dragX = 0;
        this.dragY = 0;

        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.setupInput();
    }

    start() {
        this.loop();
    }

    loop() {
        this.gameLogicUpdate();
        this.drawGameRender();

        requestAnimationFrame(() => this.loop());
    }

    gameLogicUpdate() {
        // Game logic
        this.player.update();
    }

    drawGameRender() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.board.render(this.ctx);
        this.player.render(this.ctx, this.draggedCard);

        this.renderDraggedCard();
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

    layout() {
        this.board.x = (GAME_WIDTH - this.board.width) / 2;
        this.board.y = BOARD_Y;

        this.player.setLayout(
            GAME_WIDTH,
            GAME_HEIGHT
        );
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

        if (!boardCell) {
            this.cancelDrag();
            return;
        }

        this.dropCard(boardCell.row, boardCell.col);
    }

    cancelDrag() {
        this.draggedCard = null;
        this.dragging = false;
    }

    dropCard(row, col) {
        const card = this.draggedCard;

        if (!card) {
            return false;
        }

        const cell = this.board.getCell(row, col);

        if (!cell || cell.card !== null) {
            this.cancelDrag();
            return false;
        }

        const played = this.playCard(cell, card)

        if (!played) {
            this.cancelDrag();
            return false;
        }

        this.player.removeCard(card);
        this.cancelDrag();

        return true;
    }

    playCard(cell, card) {
        if (cell.type === START) {
            return this.playStartCard(cell, card);
        } else if (cell.type === FINISH) {
            return this.playFinishCard(cell, card);
        } else if (cell.type === PLAY) {
            return this.playNCard(cell, card);
        }

        return false;
    }

    playStartCard(cell, card) {
        this.board.placeCard(cell.row, cell.col, card);
        this.player.drawCards(8);

        return true;

        // place card in start position
        // draw 8 cards to playe hand
        // make player discard 8 cards
    }

    playFinishCard(cell, card) {
        // check if board is full
        // if board is full play finish card in finish position
        // show win screen & end game
        this.board.placeCard(cell.row, cell.col, card);

        return true;
    }

    playNCard(cell, card) {
        // if all cards bellow played card are lower numbers
        // if lower, play card
        // if played next to another card 
        // discard cards with value difference (payCardToll)

        const isValidPlacement = this.board.validatePlayedCard(cell, card);

        console.log(isValidPlacement);

        if (isValidPlacement) {
            this.board.placeCard(cell.row, cell.col, card);

            return true;
        }

        return false;
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
}