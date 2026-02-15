import { CellContent, SymbolType, SymbolPosition } from "../vision/parseTangoGrid";
import { GridSolver } from "./Grid";

describe('gridSolver', () => {
    it('should make moves based on links between cells', () => {
        const grid: CellContent[][] = [[CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY]];

        const symbols: SymbolPosition[] = [
            { type: SymbolType.X, between: [[0, 0], [0, 1]] },
            { type: SymbolType.EQUALS, between: [[0, 1], [0, 2]] },
        ];

        const expectedGrid: CellContent[][] = [
            [CellContent.SUN, CellContent.MOON, CellContent.MOON],
        ];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solveWithBacktracking();
        expect(solvedGrid).toEqual(expectedGrid);

    });

    it('should fill a row when 3 cells are already filled with the same symbol', () => {
        const grid: CellContent[][] = [
            [CellContent.SUN, CellContent.SUN, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY]
        ];

        const symbols: SymbolPosition[] = [];

        const expectedGrid: CellContent[][] = [
            [CellContent.SUN, CellContent.SUN, CellContent.MOON, CellContent.SUN, CellContent.MOON, CellContent.MOON]
        ];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solveWithBacktracking();
        expect(solvedGrid).toEqual(expectedGrid);
    });

    it('should fill a column when 3 cells are already filled with the same symbol', () => {
        const grid: CellContent[][] = [
            [CellContent.SUN],
            [CellContent.SUN],
            [CellContent.EMPTY],
            [CellContent.SUN],
            [CellContent.EMPTY],
            [CellContent.EMPTY]
        ];

        const symbols: SymbolPosition[] = [];

        const expectedGrid: CellContent[][] = [
            [CellContent.SUN],
            [CellContent.SUN],
            [CellContent.MOON],
            [CellContent.SUN],
            [CellContent.MOON],
            [CellContent.MOON]
        ];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solveWithBacktracking();
        expect(solvedGrid).toEqual(expectedGrid);
    });

    it('should fill a cell when there are already 2 in a row and the third is empty', () => {
        const symbols: SymbolPosition[] = [];
        const grid: CellContent[][] = [
            [CellContent.SUN, CellContent.SUN, CellContent.EMPTY]
        ];

        const expectedGrid: CellContent[][] = [
            [CellContent.SUN, CellContent.SUN, CellContent.MOON]
        ];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solveWithBacktracking();
        expect(solvedGrid).toEqual(expectedGrid);

        // Test _AA case (2 symbols at the end)
        const reversedGrid: CellContent[][] = [
            [CellContent.EMPTY, CellContent.SUN, CellContent.SUN]
        ];
        const reversedExpectedGrid: CellContent[][] = [
            [CellContent.MOON, CellContent.SUN, CellContent.SUN]
        ];
        const reversedGridSolver = new GridSolver(reversedGrid, symbols);
        const reversedSolvedGrid = reversedGridSolver.solveWithBacktracking();
        expect(reversedSolvedGrid).toEqual(reversedExpectedGrid);
    });

    it('should handle the bookend rule for single ends', () => {
        const grid: CellContent[][] = [
            [CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN]
        ];
        const symbols: SymbolPosition[] = [];

        const expectedGrid: CellContent[][] = [
            [CellContent.SUN, CellContent.MOON, CellContent.MOON, CellContent.SUN]
        ];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solveWithBacktracking();
        expect(solvedGrid).toEqual(expectedGrid);
    });

    it('should handle the bookend rule for double ends in columns', () => {
        const grid: CellContent[][] = [
            [CellContent.SUN],
            [CellContent.SUN],
            [CellContent.EMPTY],
            [CellContent.MOON],
            [CellContent.EMPTY],
            [CellContent.EMPTY]
        ];
        const symbols: SymbolPosition[] = [];
        const expectedGrid: CellContent[][] = [
            [CellContent.SUN],
            [CellContent.SUN],
            [CellContent.MOON],
            [CellContent.MOON],
            [CellContent.SUN],
            [CellContent.MOON]
        ];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solveWithBacktracking();
        expect(solvedGrid).toEqual(expectedGrid);
    });

    it('should solve a complex grid', () => {
        const grid: CellContent[][] = [
            [CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY],
            [CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY],
            [CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN],
            [CellContent.MOON, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.MOON],
            [CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY],
            [CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY]
        ];

        const symbols: SymbolPosition[] = [
            // horizontal
            { type: SymbolType.X, between: [[0, 0], [0, 1]] },
            { type: SymbolType.EQUALS, between: [[1, 2], [1, 3]] },
            { type: SymbolType.X, between: [[1, 3], [1, 4]] },
            { type: SymbolType.X, between: [[4, 2], [4, 3]] },
            { type: SymbolType.EQUALS, between: [[4, 3], [4, 4]] },
            { type: SymbolType.EQUALS, between: [[5, 0], [5, 1]] },
            // vertical
            { type: SymbolType.X, between: [[0, 0], [1, 0]] },
            { type: SymbolType.X, between: [[4, 0], [5, 0]] },
        ];

        const expectedGrid: CellContent[][] = [[]];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solveWithBacktracking();
        expect(solvedGrid).toEqual(expectedGrid);
    });
});