import { CellContent, CellGrid, SymbolPosition, SymbolType } from "../vision/parseTangoGrid";

type Move = {
    x: number;
    y: number;
    symbol: CellContent;
};

export class GridSolver {
    private size: number;

    constructor(
        private grid: CellGrid,
        private symbols: SymbolPosition[]
    ) {
        this.size = grid.length;
    }

    /* ================================
       PUBLIC ENTRY
    ================================= */

    solveWithBacktracking(): CellGrid {
        // First exhaust logic
        this.solveLogical();

        if (this.isComplete()) {
            return this.grid;
        }

        const guessCell = this.findBestGuessCell();
        if (!guessCell) {
            throw new Error('No valid guess cell found');
        }

        const [x, y] = guessCell;

        for (const guess of [CellContent.SUN, CellContent.MOON]) {
            const clone = this.cloneGrid(this.grid);
            clone[x][y] = guess;

            try {
                const solver = new GridSolver(clone, this.symbols);
                return solver.solveWithBacktracking();
            } catch {
                // try next guess
            }
        }

        throw new Error(`Backtracking failed at ${x},${y}`);
    }

    /* ================================
       LOGICAL SOLVER
    ================================= */

    private solveLogical(): void {
        while (true) {
            const moves = this.analyse();

            if (moves.length === 0) break;

            for (const move of moves) {
                this.grid[move.x][move.y] = move.symbol;
            }
        }
    }

    private analyse(): Move[] {
        const moves: Move[] = [];

        moves.push(...this.applyLinkPropagation());
        moves.push(...this.preventTriples());
        moves.push(...this.enforceCounts());
        moves.push(...this.forcedByContradiction());

        return this.dedupeMoves(moves);
    }

    /* ================================
       RULES
    ================================= */

    private applyLinkPropagation(): Move[] {
        const moves: Move[] = [];

        for (const sym of this.symbols) {
            const [[x1, y1], [x2, y2]] = sym.between;
            const a = this.grid[x1][y1];
            const b = this.grid[x2][y2];

            if (a !== CellContent.EMPTY && b === CellContent.EMPTY) {
                moves.push({
                    x: x2,
                    y: y2,
                    symbol: this.linkResult(a, sym.type)
                });
            }

            if (b !== CellContent.EMPTY && a === CellContent.EMPTY) {
                moves.push({
                    x: x1,
                    y: y1,
                    symbol: this.linkResult(b, sym.type)
                });
            }
        }

        return moves;
    }

    private preventTriples(): Move[] {
        const moves: Move[] = [];

        for (let i = 0; i < this.size; i++) {
            moves.push(...this.scanLine(this.getRow(i), true, i));
            moves.push(...this.scanLine(this.getCol(i), false, i));
        }

        return moves;
    }

    private enforceCounts(): Move[] {
        const moves: Move[] = [];
        const half = this.size / 2;

        for (let i = 0; i < this.size; i++) {
            const row = this.getRow(i);
            const col = this.getCol(i);

            moves.push(...this.completeLine(row, true, i, half));
            moves.push(...this.completeLine(col, false, i, half));
        }

        return moves;
    }

    /* ================================
       STRONG CONSTRAINT ELIMINATION
    ================================= */

    private forcedByContradiction(): Move[] {
        const moves: Move[] = [];

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.grid[x][y] !== CellContent.EMPTY) continue;

                const canBeSun = this.isValidPlacement(x, y, CellContent.SUN);
                const canBeMoon = this.isValidPlacement(x, y, CellContent.MOON);

                if (canBeSun && !canBeMoon) {
                    moves.push({ x, y, symbol: CellContent.SUN });
                }

                if (!canBeSun && canBeMoon) {
                    moves.push({ x, y, symbol: CellContent.MOON });
                }

                if (!canBeSun && !canBeMoon) {
                    throw new Error(`Contradiction at ${x},${y}`);
                }
            }
        }

        return moves;
    }

    private isValidPlacement(x: number, y: number, sym: CellContent): boolean {
        const prev = this.grid[x][y];
        this.grid[x][y] = sym;

        const valid =
            !this.breaksTriple(x, y) &&
            !this.breaksCounts(x, y) &&
            !this.breaksLinks(x, y);

        this.grid[x][y] = prev;
        return valid;
    }

    /* ================================
       VALIDATION CHECKS
    ================================= */

    private breaksTriple(x: number, y: number): boolean {
        return this.hasTriple(this.getRow(x)) ||
               this.hasTriple(this.getCol(y));
    }

    private breaksCounts(x: number, y: number): boolean {
        const half = this.size / 2;

        const row = this.getRow(x);
        const col = this.getCol(y);

        return (
            this.count(row, CellContent.SUN) > half ||
            this.count(row, CellContent.MOON) > half ||
            this.count(col, CellContent.SUN) > half ||
            this.count(col, CellContent.MOON) > half
        );
    }

    private breaksLinks(x: number, y: number): boolean {
        for (const sym of this.symbols) {
            const [[x1, y1], [x2, y2]] = sym.between;

            if ((x === x1 && y === y1) ||
                (x === x2 && y === y2)) {

                const a = this.grid[x1][y1];
                const b = this.grid[x2][y2];

                if (a !== CellContent.EMPTY &&
                    b !== CellContent.EMPTY) {

                    if (sym.type === SymbolType.EQUALS && a !== b)
                        return true;

                    if (sym.type === SymbolType.X && a === b)
                        return true;
                }
            }
        }

        return false;
    }

    /* ================================
       SMART GUESS SELECTION
    ================================= */

    private findBestGuessCell(): [number, number] | null {
        let best: [number, number] | null = null;
        let bestScore = -1;

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.grid[x][y] !== CellContent.EMPTY) continue;

                let score = 0;

                score += this.count(this.getRow(x), CellContent.EMPTY);
                score += this.count(this.getCol(y), CellContent.EMPTY);

                for (const sym of this.symbols) {
                    const [[x1, y1], [x2, y2]] = sym.between;
                    if ((x === x1 && y === y1) ||
                        (x === x2 && y === y2)) {
                        score += 2;
                    }
                }

                if (score > bestScore) {
                    bestScore = score;
                    best = [x, y];
                }
            }
        }

        return best;
    }

    /* ================================
       HELPERS
    ================================= */

    private scanLine(line: CellContent[], isRow: boolean, index: number): Move[] {
        const moves: Move[] = [];

        for (let i = 0; i < line.length - 2; i++) {
            const a = line[i];
            const b = line[i + 1];
            const c = line[i + 2];

            if (a === b && a !== CellContent.EMPTY && c === CellContent.EMPTY) {
                moves.push(this.coord(isRow, index, i + 2, this.opposite(a)));
            }

            if (b === c && b !== CellContent.EMPTY && a === CellContent.EMPTY) {
                moves.push(this.coord(isRow, index, i, this.opposite(b)));
            }

            if (a === c && a !== CellContent.EMPTY && b === CellContent.EMPTY) {
                moves.push(this.coord(isRow, index, i + 1, this.opposite(a)));
            }
        }

        return moves;
    }

    private completeLine(
        line: CellContent[],
        isRow: boolean,
        index: number,
        half: number
    ): Move[] {
        const moves: Move[] = [];

        const suns = this.count(line, CellContent.SUN);
        const moons = this.count(line, CellContent.MOON);

        if (suns === half || moons === half) {
            const fill = suns === half ? CellContent.MOON : CellContent.SUN;

            line.forEach((cell, i) => {
                if (cell === CellContent.EMPTY) {
                    moves.push(this.coord(isRow, index, i, fill));
                }
            });
        }

        return moves;
    }

    private hasTriple(line: CellContent[]): boolean {
        for (let i = 0; i < line.length - 2; i++) {
            if (
                line[i] !== CellContent.EMPTY &&
                line[i] === line[i + 1] &&
                line[i] === line[i + 2]
            ) {
                return true;
            }
        }
        return false;
    }

    private coord(
        isRow: boolean,
        fixed: number,
        variable: number,
        symbol: CellContent
    ): Move {
        return isRow
            ? { x: fixed, y: variable, symbol }
            : { x: variable, y: fixed, symbol };
    }

    private getRow(x: number): CellContent[] {
        return [...this.grid[x]];
    }

    private getCol(y: number): CellContent[] {
        return this.grid.map(r => r[y]);
    }

    private count(line: CellContent[], sym: CellContent): number {
        return line.filter(c => c === sym).length;
    }

    private opposite(sym: CellContent): CellContent {
        return sym === CellContent.SUN
            ? CellContent.MOON
            : CellContent.SUN;
    }

    private linkResult(
        sym: CellContent,
        type: SymbolType
    ): CellContent {
        return type === SymbolType.EQUALS
            ? sym
            : this.opposite(sym);
    }

    private isComplete(): boolean {
        return this.grid.every(row =>
            row.every(cell => cell !== CellContent.EMPTY)
        );
    }

    private cloneGrid(grid: CellGrid): CellGrid {
        return grid.map(row => [...row]);
    }

    private dedupeMoves(moves: Move[]): Move[] {
        const seen = new Map<string, CellContent>();

        for (const m of moves) {
            const key = `${m.x},${m.y}`;

            if (seen.has(key) && seen.get(key) !== m.symbol) {
                throw new Error(`Conflict at ${key}`);
            }

            seen.set(key, m.symbol);
        }

        return [...seen.entries()].map(([key, symbol]) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y, symbol };
        });
    }
}
