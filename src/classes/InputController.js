import { FINISH_CARD, START_CARD } from "../enum/cardTypes.";

export class InputController {
    constructor(game) {
        this.game = game;

        this.draggedCard = null;
        this.dragging = false;

        this.dragX = 0;
        this.dragY = 0;

        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    setup() {
        this.game.canvas.addEventListener("pointerdown", (e) => this.startDrag(e));

        this.game.canvas.addEventListener("pointermove", (e) => this.updateDrag(e));

        this.game.canvas.addEventListener("pointerup", (e) => this.endDrag(e));

        this.game.canvas.addEventListener("pointercancel", () => this.cancelDrag());
    }

    getPointerPosition(e) {
        const canvas = this.game.canvas;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrag(e) {
        const { x, y } = this.getPointerPosition(e);

        if (this.game.isShowDiscardClicked(x, y)) {
            this.game.discardOverlay.show();
            return;
        }

        if (this.game.overlay) {
            this.game.overlay.handleClick(x, y);
            return;
        }

        const card = this.game.player.getCardAtPosition(x, y);

        if (!card) {
            return;
        }

        const index = this.game.player.hand.indexOf(card);

        const { x: cardX, y: cardY } = this.game.player.renderHandCardPosition(index);

        this.draggedCard = card;
        this.dragging = true;

        this.dragOffsetX = x - cardX;
        this.dragOffsetY = y - cardY;

        this.dragX = cardX;
        this.dragY = cardY;

        this.game.canvas.setPointerCapture(e.pointerId);
    }

    updateDrag(e) {
        if (!this.dragging) return;

        const { x, y } = this.getPointerPosition(e);

        this.dragX = x - this.dragOffsetX;
        this.dragY = y - this.dragOffsetY;

        const boardCell = this.game.board.getCellAtPosition(x, y);

        if (boardCell) {
            const valid = this.game.canDropCard(
                boardCell,
                this.draggedCard
            );

            this.game.board.setHoveredCell(
                boardCell,
                valid
            );

            this.game.player.clearDiscardHover();

            return;
        }

        this.game.board.clearHoveredCell();

        if (this.game.player.isPointInsideDiscard(x, y)) {
            this.game.player.setDiscardHovered(true);
        } else {
            this.game.player.setDiscardHovered(false);
        }
    }

    endDrag(e) {
        if (!this.dragging) {
            return;
        }

        const { x, y } = this.getPointerPosition(e);

        const player = this.game.player;
        const discardArea = player.isPointInsideDiscard(x, y);

        if (discardArea) {
            this.game.dropCardOnDiscard();
            this.cancelDrag();

            return;
        }

        const boardCell = this.game.board.getCellAtPosition(x, y);

        if (boardCell && boardCell.card === null) {
            this.game.dropCardOnBoard(boardCell);
            this.cancelDrag();

            return;
        }

        this.cancelDrag();
    }

    cancelDrag() {
        this.draggedCard = null;
        this.dragging = false;

        this.game.board.clearHoveredCell();
        this.game.player.clearDiscardHover();
    }
}