import path from "path";
import { CellContent, CellGrid, parseTangoGrid, SymbolPositions } from "./parseTangoGrid";

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

const expectedSymbols: SymbolPositions[] = [
    [],
    [],
    []
];

describe('readBoard', () => {
    it.each(screenshotPaths.map((path, index) => [path, expectedGrids[index], expectedSymbols[index]]))
        ('correctly parses grid from %s', async (screenshotPath, expectedGrid, expectedSymbol) => {
        const { grid, symbols } = await parseTangoGrid(screenshotPath, false);
        expect(grid).toEqual(expectedGrid);
        expect(symbols).toEqual(expectedSymbol);
    });
});