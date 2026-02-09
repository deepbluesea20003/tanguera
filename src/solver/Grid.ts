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
        
        return moves;
    }

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