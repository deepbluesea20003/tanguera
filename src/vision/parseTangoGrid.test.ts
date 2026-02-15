import path from "path";
import { CellContent, CellGrid, parseTangoGrid, SymbolPosition, SymbolType } from "./parseTangoGrid";

const screenshotPaths = [
    path.resolve(__dirname,'../../assets/previous/board1.png'),
    path.resolve(__dirname,'../../assets/previous/board2.png'),
    path.resolve(__dirname,'../../assets/previous/board3.png')
]

const expectedGrids: CellGrid[] = [
    [
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN ],
        [ CellContent.MOON, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.MOON ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ]
    ],
    [
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.MOON, CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.MOON, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.MOON, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.MOON, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ]
    ],
    [
        [ CellContent.MOON, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.SUN, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.MOON, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.SUN, CellContent.EMPTY, CellContent.MOON ],
        [ CellContent.EMPTY, CellContent.EMPTY, CellContent.EMPTY, CellContent.MOON, CellContent.EMPTY, CellContent.SUN ]
    ]
]

const expectedSymbols: SymbolPosition[][] = [
    [
        // horizontal
        {type: SymbolType.X, between: [[0,0],[0,1]]},
        {type: SymbolType.EQUALS, between: [[1,2],[1,3]]},
        {type: SymbolType.X, between: [[1,3],[1,4]]},
        {type: SymbolType.X, between: [[4,2],[4,3]]},
        {type: SymbolType.EQUALS, between: [[4,3],[4,4]]},
        {type: SymbolType.EQUALS, between: [[5,0],[5,1]]},
        // vertical
        {type: SymbolType.X, between: [[0,0],[1,0]]},
        {type: SymbolType.X, between: [[4,0],[5,0]]},
    ],
    [
        // horizontal
        {type: SymbolType.EQUALS, between: [[0,0],[0,1]]},
        {type: SymbolType.X, between: [[0,2],[0,3]]},
        {type: SymbolType.EQUALS, between: [[0,4],[0,5]]},
        {type: SymbolType.X, between: [[5,0],[5,1]]},
        {type: SymbolType.X, between: [[5,2],[5,3]]},
        {type: SymbolType.X, between: [[5,4],[5,5]]},
        // vertical
        {type: SymbolType.X, between: [[1,0],[2,0]]},
        {type: SymbolType.EQUALS, between: [[1,5],[2,5]]},
        {type: SymbolType.EQUALS, between: [[3,0],[4,0]]},
        {type: SymbolType.X, between: [[3,5],[4,5]]},
    ],
    [
        // vertical only
        { type: SymbolType.EQUALS, between: [[1,3], [2,3]] },
        { type: SymbolType.X, between: [[1,5], [2,5]] },
        { type: SymbolType.X, between: [[3,0], [4,0]] },
        { type: SymbolType.X, between: [[3,2], [4,2]] },
    ]
];

describe('readBoard', () => {
    it.each(screenshotPaths.map((path, index) => [path, expectedGrids[index], expectedSymbols[index]]))
        ('correctly parses grid from %s', async (screenshotPath, expectedGrid, expectedSymbol) => {
        const { grid, symbols } = await parseTangoGrid(screenshotPath, false);
        expect(grid).toEqual(expectedGrid);
        expect(symbols).toEqual(expectedSymbol);
    });
});