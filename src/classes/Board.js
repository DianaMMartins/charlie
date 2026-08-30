import { BOARD_SIZE, BOARD_TILE_SIZE } from "../enum/gameSizes";

export class Board {
    constructor() {
        this.size = BOARD_SIZE;
        this.cellSize = BOARD_TILE_SIZE;

        this.width = this.size * this.cellSize;
        this.height = this.size * this.cellSize;

        this.x = 0;
        this.y = 0;

        this.playableArea = 6;

        this.cells = [];

        this.startSpace = {
            row: 7,
            col: 0,
            type: "start",
            card: null
        };

        this.finishSpace = {
            row: 0,
            col: 7,
            type: "finish",
            card: null
        };

        this.createCells();
    }

    render(ctx) {
        ctx.save();

        this.renderGrid(ctx);
        this.renderSpecialSpaces(ctx);
        this.renderCards(ctx);

        ctx.restore();
    }

    renderGrid(ctx) {
        const start = 1;
        const end = this.size - 1;

        for (let row = start; row < end; row++) {
            for (let col = start; col < end; col++) {
                const { x, y } = this.getCellPosition(row, col);

                ctx.strokeRect(
                    x,
                    y,
                    this.cellSize,
                    this.cellSize
                );
            }
        }
    }

    renderPlayableArea(ctx) {
        const offset = this.cellSize;

        const x = this.x + offset;
        const y = this.y + offset;

        const size = this.playableArea * this.cellSize;

        ctx.strokeRect(
            x,
            y,
            size,
            size
        )
    }

    renderSpecialSpaces(ctx) {
        const startX = this.x;
        const startY = this.y + this.cellSize * 7;

        const finishX = this.x + this.cellSize * 7;
        const finishY = this.y;

        ctx.save();

        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        this.renderSpecialSpace(
            ctx,
            startX,
            startY,
            "START"
        );

        this.renderSpecialSpace(
            ctx,
            finishX,
            finishY,
            "FINISH"
        );

        ctx.restore();
    }

    renderSpecialSpace(ctx, x, y, label) {
        ctx.strokeRect(
            x,
            y,
            this.cellSize,
            this.cellSize
        );

        ctx.fillText(
            label,
            x + this.cellSize / 2,
            y + this.cellSize / 2
        );
    }

    createCells() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {

                const playable =
                    row >= 1 &&
                    row <= 6 &&
                    col >= 1 &&
                    col <= 6;

                this.cells.push({
                    row,
                    col,
                    playable,
                    card: null
                });
            }
        }
    }

    getCellPosition(row, col) {
        return {
            x: this.x + col * this.cellSize,
            y: this.y + row * this.cellSize
        };
    }

    renderCards(ctx) {
        for (const cell of this.cells) {
            if (!cell.playable || !cell.card) {
                continue;
            }

            const { x, y } = this.getCellPosition(
                cell.row,
                cell.col
            );

            cell.card.render(ctx, x, y, this.cellSize);
        }
    }

    placeCard(row, col, card) {
        const cell = this.cells.find(
            cell => cell.row === row && cell.col === col
        );

        if (!cell || !cell.playable || cell.card) {
            return false;
        }

        cell.card = card;

        return true;
    }

    getCellAtPosition(x, y) {
        const col = Math.floor(
            (x - this.x) / this.cellSize
        );

        const row = Math.floor(
            (y - this.y) / this.cellSize
        );

        const cell = this.cells.find(cell => cell.row === row && cell.col === col)

        if (!cell || !cell.playable) {
            return null;
        }

        return cell;
    }
}