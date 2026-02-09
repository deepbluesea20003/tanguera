import { CellContent, SymbolType, SymbolPosition } from "../vision/parseTangoGrid";
import { GridSolver } from "./Grid";

describe('gridSolver', () => {
    it('should detect moves based on links between cells', () => {
        const grid: CellContent[][] = [[ CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY ]];

        const symbols: SymbolPosition[] = [
            { type: SymbolType.X, between: [[0,0], [0,1]] },
            { type: SymbolType.EQUALS, between: [[0,1], [0,2]] },
        ];

       const expectedGrid: CellContent[][] = [
            [ CellContent.SUN,  CellContent.MOON, CellContent.MOON ],
        ];

        const gridSolver = new GridSolver(grid, symbols);
        const solvedGrid = gridSolver.solve();
        expect(solvedGrid).toEqual(expectedGrid);

    });
});