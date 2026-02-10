import { CellContent, SymbolPosition, SymbolType } from "../vision/parseTangoGrid";

type Move = {
    x: number;
    y: number;
    symbol: CellContent;
}

export class GridSolver {
    private grid: CellContent[][];
    private symbols: SymbolPosition[];

    constructor(cells: CellContent[][], symbols: SymbolPosition[]) {
        this.grid = cells;
        this.symbols = symbols;
    }

    solve(): CellContent[][] {
        do {
            const moves = this.analyseBoard();
            if (moves.length === 0) {
                throw new Error('No moves found, but grid is not complete');
            }
            moves.forEach(move => this.makeMove(move.x, move.y, move.symbol));
        } while (!this.isGridComplete());
        return this.grid;
    }

    private analyseBoard(): Move[] {
        const unusedLinks = this.detectUnusedLinks();
        const moves: Move[] = [];

        unusedLinks.forEach(link => {
            const move = this.getMoveFromLink(link);
            if (move) {
                moves.push(move);
            }
        });

        moves.push(...this.getMovesFromGrid());

        return moves;
    }

    private getMovesFromGrid(): Move[] {
        const moves: Move[] = [];
        for (let i = 0; i < this.grid.length; i++) {
            const rowMoves = this.getMovesFromLineIfFull(i, true);
            if (rowMoves) {
                moves.push(...rowMoves);
            }
            const colMoves = this.getMovesFromLineIfFull(i, false);
            if (colMoves) {
                moves.push(...colMoves);
            }

            const rowTwoInRowMoves = this.getMovesFromLineIfTwoInRow(i, true);
            if (rowTwoInRowMoves) {
                moves.push(...rowTwoInRowMoves);
            }
            const colTwoInRowMoves = this.getMovesFromLineIfTwoInRow(i, false);
            if (colTwoInRowMoves) {
                moves.push(...colTwoInRowMoves);
            }
        }
        return moves;
    }

    // next get when 2 symbols are in a row, we can fill 3rd as the other one
    private getMovesFromLineIfTwoInRow(
        lineIndex: number,
        isRow: boolean = true
    ): Move[] | null {
        const moves: Move[] = [];

        const line = isRow
            ? this.grid[lineIndex]
            : this.grid.map(row => row[lineIndex]);

        const opposite = (cell: CellContent) =>
            cell === CellContent.SUN ? CellContent.MOON : CellContent.SUN;

        for (let i = 0; i < line.length - 2; i++) {
            const a = line[i];
            const b = line[i + 1];
            const c = line[i + 2];

            // Case: AA_
            if (a === b && a !== CellContent.EMPTY && c === CellContent.EMPTY) {
                moves.push(
                    isRow
                        ? { x: lineIndex, y: i + 2, symbol: opposite(a) }
                        : { x: i + 2, y: lineIndex, symbol: opposite(a) }
                );
            }

            // Case: _AA
            if (b === c && b !== CellContent.EMPTY && a === CellContent.EMPTY) {
                moves.push(
                    isRow
                        ? { x: lineIndex, y: i, symbol: opposite(b) }
                        : { x: i, y: lineIndex, symbol: opposite(b) }
                );
            }
        }

        return moves.length ? moves : null;
    }


    // when a row/column already has 3 symbols, we can fill the others with the other one
    private getMovesFromLineIfFull(lineIndex: number, isRow: boolean = true): Move[] | null {
        const line = isRow
            ? this.grid[lineIndex]
            : this.grid.map(row => row[lineIndex]);

        const suns = line.flatMap((cell, idx) => cell === CellContent.SUN ? [idx] : []);
        const moons = line.flatMap((cell, idx) => cell === CellContent.MOON ? [idx] : []);
        const empties = line.flatMap((cell, idx) => cell === CellContent.EMPTY ? [idx] : []);

        if (suns.length === (line.length / 2)) {
            return empties.map(empty => isRow
                ? ({ x: lineIndex, y: empty, symbol: CellContent.MOON })
                : ({ x: empty, y: lineIndex, symbol: CellContent.MOON })
            );
        }
        if (moons.length === (line.length / 2)) {
            return empties.map(empty => isRow
                ? ({ x: lineIndex, y: empty, symbol: CellContent.SUN })
                : ({ x: empty, y: lineIndex, symbol: CellContent.SUN })
            );
        }
        return null;
    }

    // bookend rule.

    private getMoveFromLink(link: SymbolPosition): Move | null {
        const [cell1, cell2] = link.between;
        const content1 = this.grid[cell1[0]][cell1[1]];
        const content2 = this.grid[cell2[0]][cell2[1]];

        // if one of the cells is filled and the other isn't, we know what to fill the other one with
        if (content1 !== CellContent.EMPTY && content2 === CellContent.EMPTY) {
            return {
                x: cell2[0],
                y: cell2[1],
                symbol: link.type === SymbolType.X
                    ? (content1 === CellContent.SUN ? CellContent.MOON : CellContent.SUN)
                    : content1
            };
        } else if (content2 !== CellContent.EMPTY && content1 === CellContent.EMPTY) {
            return {
                x: cell1[0],
                y: cell1[1],
                symbol: link.type === SymbolType.X
                    ? (content2 === CellContent.SUN ? CellContent.MOON : CellContent.SUN)
                    : content2
            };
        }

        return null;
    }

    private makeMove(x: number, y: number, symbol: CellContent) {
        if (!this.grid[x] || this.grid[x][y] === undefined) {
            throw new Error('makeMove: coordinates out of bounds');
        }
        this.grid[x][y] = symbol;
    };

    // detects links which should be used but haven't been yet
    private detectUnusedLinks(): SymbolPosition[] {
        return this.symbols.filter(symbol => {
            const [cell1, cell2] = symbol.between;
            const content1 = this.grid[cell1[0]][cell1[1]];
            const content2 = this.grid[cell2[0]][cell2[1]];
            return content1 !== CellContent.EMPTY || content2 !== CellContent.EMPTY;
        });
    }

    private isGridComplete(): boolean {
        return this.grid.every(row => row.every(cell => cell !== CellContent.EMPTY));
    }
}