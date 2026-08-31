import { Player } from "./Player";
import { Board } from "./Board";
import { BOARD_Y, GAME_HEIGHT, GAME_WIDTH } from "../enum/gameSizes";

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

        window.addEventListener("pointermove", (e) => {
            this.updateDrag(e);
        });

        window.addEventListener("pointerup", (e) => {
            this.endDrag(e);
        });

        window.addEventListener("pointercancel", () => {
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

        const placed = this.board.placeCard(row, col, card);

        if (!placed) {
            this.cancelDrag();
            return false;
        }

        this.player.removeCard(card);

        this.cancelDrag();

        return true;
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