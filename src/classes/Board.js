import { FINISH_CARD, NUMBER_CARD, START_CARD } from "../enum/cardTypes.";
import { BOARD_SIZE, BOARD_TILE_SIZE } from "../enum/gameSizes";
import { renderRainbowText } from "../utils/canvas";
import { isPointInsideRect } from "../utils/geometry";

export class Board {
    constructor() {
        this.size = BOARD_SIZE;

        this.baseCellSize = BOARD_TILE_SIZE;
        this.baseCellGap = 4;

        this.scale = 1;

        this.cellSize = BOARD_TILE_SIZE;
        this.cellGap = this.baseCellGap;

        this.width = this.size * this.cellSize;
        this.height = this.size * this.cellSize;

        this.x = 0;
        this.y = 0;

        this.playableArea = 6;

        this.cells = [];

        this.createCells();

        this.hoveredCell = null;
        this.hoveredCellValid = false;
    }

    render(ctx) {
        ctx.save();

        this.renderGrid(ctx);
        this.renderSpecialSpaces(ctx);
        this.renderCards(ctx);

        ctx.restore();
    }

    setScale(scale) {
        this.scale = scale;

        this.cellSize = this.baseCellSize * scale;
        this.cellGap = this.baseCellGap * scale;

        this.width = this.size * this.cellSize + (this.size - 1) * this.cellGap;
        this.height = this.size * this.cellSize + (this.size - 1) * this.cellGap;
    }

    getScale(screenWidth) {
        const baseWidth = this.size * this.baseCellSize + (this.size - 1) * this.baseCellGap;

        return Math.min(1, (screenWidth * 0.9) / baseWidth);
    }

    resize(screenWidth) {
        const scale = this.getScale(screenWidth);
        this.setScale(scale);
    }

    renderGrid(ctx) {
        const start = 1;
        const end = this.size - 1;

        for (let row = start; row < end; row++) {
            for (let col = start; col < end; col++) {
                const cell = this.getCell(row, col);
                const { x, y } = this.getCellPosition(row, col);

                ctx.save();

                if (cell === this.hoveredCell) {
                    ctx.fillStyle = this.hoveredCellValid
                        ? "rgb(32, 187, 32)"
                        : "rgb(168, 32, 32)";

                    ctx.fillRect(
                        x,
                        y,
                        this.cellSize,
                        this.cellSize
                    );
                } else if (!cell.card) {
                    ctx.fillStyle = "rgba(21, 37, 88, 0.8)";

                    ctx.fillRect(
                        x,
                        y,
                        this.cellSize,
                        this.cellSize
                    );
                }

                ctx.strokeRect(
                    x,
                    y,
                    this.cellSize,
                    this.cellSize
                );
                ctx.restore();
            }
        }
    }

    renderSpecialSpaces(ctx) {
        const startCell = this.getCell(BOARD_SIZE - 1, 0);
        const finishCell = this.getCell(0, BOARD_SIZE - 1);

        this.renderSpecialSpace(ctx, startCell, "START");
        this.renderSpecialSpace(ctx, finishCell, "FINISH");
    }

    renderSpecialSpace(ctx, cell, label) {
        const { x, y } = this.getCellPosition(
            cell.row,
            cell.col
        );

        ctx.save();

        if (cell === this.hoveredCell) {
            ctx.fillStyle = this.hoveredCellValid
                ? "rgb(32, 187, 32)"
                : "rgb(168, 32, 32)";
        } else {
            ctx.fillStyle = "rgba(21, 37, 88, 0.8)";
        }

        ctx.fillRect(
            x,
            y,
            this.cellSize,
            this.cellSize
        );

        ctx.strokeStyle = "black";
        ctx.strokeRect(
            x,
            y,
            this.cellSize,
            this.cellSize
        );

        renderRainbowText(
            ctx,
            label,
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            {
                font: "12px sans-serif",
                width: this.cellSize
            }
        );

        ctx.restore();
    }

    createCells() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                let type = null;

                if (row >= 1 && row <= this.playableArea && col >= 1 && col <= this.playableArea) {
                    type = NUMBER_CARD;
                } else if (row === BOARD_SIZE - 1 && col === 0) {
                    type = START_CARD;
                } else if (row === 0 && col === BOARD_SIZE - 1) {
                    type = FINISH_CARD;
                }

                this.cells.push({
                    row,
                    col,
                    type,
                    card: null
                });
            }
        }
    }

    getCellPosition(row, col) {
        return {
            x: this.x + col * (this.cellSize + this.cellGap),
            y: this.y + row * (this.cellSize + this.cellGap)
        };
    }

    renderCards(ctx) {
        for (const cell of this.cells) {
            if (cell.type === null || !cell.card) {
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
        const cell = this.getCell(row, col);

        if (!cell || cell.card) {
            return false;
        }

        cell.card = card;

        return true;
    }

    getCell(row, col) {
        return this.cells.find(
            cell => cell.row === row && cell.col === col
        );
    }

    validatePlayedCard(cell, card) {
        const cells = this.getPlayableCells();

        if (cells.filter(cell => cell.card).length === 0) {
            return true;
        }

        const i = cells.indexOf(cell);

        const before = cells.slice(0, i).reverse().find(cell => cell.card);
        const after = cells.slice(i + 1).find(cell => cell.card);

        if (
            (before && card.value <= before.card.value) ||
            (after && card.value >= after.card.value)
        ) {
            return false;
        }

        return true;
    }

    getPlayableCells() {
        return this.cells
            .filter(cell => cell.type === NUMBER_CARD)
            .sort((a, b) => {
                if (a.row !== b.row) {
                    return b.row - a.row;
                }

                return a.col - b.col;
            });
    }

    getCellAtPosition(x, y) {
        const cellStep = this.cellSize + this.cellGap;

        const col = Math.floor((x - this.x) / cellStep);
        const row = Math.floor((y - this.y) / cellStep);

        const cell = this.getCell(row, col);

        if (!cell?.type) {
            return null;
        }

        const { x: cellX, y: cellY } =
            this.getCellPosition(row, col);

        const inside = isPointInsideRect(x, y, {
            x: cellX,
            y: cellY,
            width: this.cellSize,
            height: this.cellSize
        });

        return inside ? cell : null;
    }

    isFull() {
        return this.getPlayableCells().every(cell => cell.card !== null);
    }

    getCardDifference(cardA, cardB) {
        return Math.abs(cardA.value - cardB.value);
    }

    getAdjacentCards(cell) {
        const playableCells = this.getPlayableCells();
        const index = playableCells.indexOf(cell);

        const cards = [];

        const before = playableCells[index - 1];
        const after = playableCells[index + 1];

        if (before?.card) {
            cards.push(before.card);
        }

        if (after?.card) {
            cards.push(after.card);
        }

        return cards;
    }

    setHoveredCell(cell, valid) {
        this.hoveredCell = cell;
        this.hoveredCellValid = valid;
    }

    clearHoveredCell() {
        this.hoveredCell = null;
        this.hoveredCellValid = false;
    }

    getCellWithCard(card) {
        return this.cells.find(cell => cell.card === card);
    }

    removeCard(cell) {
        const card = cell.card;

        cell.card = null;

        return card;
    }
}
