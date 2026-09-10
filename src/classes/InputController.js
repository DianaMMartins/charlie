import { playErrorSound } from "../ambience";
import { DISCARD_CARD, DRAW_CARDS, PLAY_CARD, PLAY_START_CARD, REQUIRED_DISCARD } from "../enum/gameStatus";

export class InputController {
    constructor(game) {
        this.game = game;

        this.draggedCard = null;
        this.dragging = false;

        this.dragOriginalCell = null;

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

        if (this.game.isAudioBtnClicked(x, y)) {
            this.game.toggleAudio();
            return;
        }

        if (this.game.isDrawBtnClicked(x, y)) {
            this.game.drawTurnCards();
            return;
        }

        if (this.game.isShowDiscardClicked(x, y)) {
            this.game.openDiscardOverlayFromButton();
            return;
        }

        if (this.game.overlay) {
            this.game.overlay.handleClick(x, y);
            return;
        }

        if (this.game.action === DRAW_CARDS) {
            this.game.startLastCardDrag(x, y);

            if (this.dragging) {
                this.game.canvas.setPointerCapture(e.pointerId);
            }

            return;
        }

        const canDragHand =
            this.game.action === PLAY_CARD ||
            this.game.action === PLAY_START_CARD ||
            this.game.action === DISCARD_CARD ||
            this.game.action === REQUIRED_DISCARD;

        if (!canDragHand) return;

        const card = this.game.player.getCardAtPosition(x, y);

        if (!card) return;

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
        const canDiscard = this.game.action === PLAY_CARD || this.game.action === DISCARD_CARD || this.game.action === REQUIRED_DISCARD;
        const overDiscard = this.game.player.isPointInsideDiscard(x, y);

        this.game.player.setDiscardHovered(canDiscard && overDiscard);

        if (boardCell) {
            let valid = false;

            if (this.game.action === DRAW_CARDS) {
                valid = this.game.canPlayNCard(
                    boardCell,
                    this.draggedCard
                );
            } else {
                valid = this.game.canDropCard(
                    boardCell,
                    this.draggedCard
                );
            }

            this.game.board.setHoveredCell(
                boardCell,
                valid
            );

            return;
        }

        this.game.board.clearHoveredCell();
    }

    endDrag(e) {
        if (!this.dragging) {
            return;
        }

        const { x, y } = this.getPointerPosition(e);
        if (this.game.action === DRAW_CARDS) {
            const boardCell = this.game.board.getCellAtPosition(x, y);

            if (
                boardCell &&
                this.game.moveLastPlayedCard(boardCell)
            ) {
                this.cancelDrag();
                return;
            }

            playErrorSound();
            this.cancelDrag();
            return;
        }

        const player = this.game.player;
        const discardArea = player.isPointInsideDiscard(x, y);

        if (discardArea) {
            this.game.dropCardOnDiscard();
            this.cancelDrag();

            return;
        }

        const boardCell = this.game.board.getCellAtPosition(x, y);

        if (boardCell && boardCell.card === null) {
            if (!this.game.canDropCard(boardCell, this.draggedCard)) {
                playErrorSound();
                this.cancelDrag();
                return;
            }

            this.game.dropCardOnBoard(boardCell);
            this.cancelDrag();
            return;
        }

        this.cancelDrag();
    }

    restoreDraggedCard() {
        if (
            this.draggedCard &&
            this.dragOriginalCell &&
            !this.dragOriginalCell.card
        ) {
            this.dragOriginalCell.card = this.draggedCard;
        }

        this.dragOriginalCell = null;
    }

    cancelDrag() {
        this.restoreDraggedCard();

        this.draggedCard = null;
        this.dragging = false;

        this.game.board.clearHoveredCell();
        this.game.player.clearDiscardHover();
    }

    isAudioBtnClicked(x, y) {
        if (!this.audioBtn) {
            return false;
        }

        return isPointInsideRect(x, y, this.audioBtn);
    }
}