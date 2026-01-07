import { intToRGBA, Jimp, rgbaToInt } from "jimp";
import path from "path";

// this may potentially need adjustment based on the size of the grid
// as very occasionally the grid is 8x8 instead of 6x6
const WIDTH_OF_CELL_PX = 64;
const START_COORDS = [435, 101];
const GRID_SPACING_PX = 2;
const GRID_SIZE_IN_CELLS = 6;

export enum CellContent {
    EMPTY = '.',
    SUN = 'S',
    MOON = 'M'
}

enum SymbolType {
    X = 'x',
    EQUALS = '='
}

export type CellGrid = CellContent[][];
export type SymbolPositions = {
    type: SymbolType,
    between: [[number, number], [number, number]]
}[];


/**
 * Draw a visible black cross at a pixel
 */
function markCross(image: any, x: number, y: number) {
    const black = rgbaToInt(0, 0, 0, 255);
    const points = [
        [0, 0],
        [-1, 0], [1, 0],
        [0, -1], [0, 1],
    ];

    for (const [dx, dy] of points) {
        image.setPixelColor(black, x + dx, y + dy);
    }
}

/**
 * Draw a red outline around a cell
 */
function drawCellOutline(image: any, x: number, y: number, size: number) {
    const red = rgbaToInt(255, 0, 0, 255);

    for (let i = 0; i < size; i++) {
        image.setPixelColor(red, x + i, y);
        image.setPixelColor(red, x + i, y + size);
        image.setPixelColor(red, x, y + i);
        image.setPixelColor(red, x + size, y + i);
    }
}

/**
 * Detect cell content by sampling the center pixel, or an offset pixel
 */
function detectColour(image: any, px: number, py: number, offset: number = 0): CellContent {
    const cx = Math.floor(px + offset + WIDTH_OF_CELL_PX / 2);
    const cy = Math.floor(py + offset + WIDTH_OF_CELL_PX / 2);

    const pixel = image.getPixelColor(cx, cy);
    const { r, g, b } = intToRGBA(pixel);

    markCross(image, cx, cy);

    // console.log(`Pixel at (${cx}, ${cy}): R=${r} G=${g} B=${b}`);
    // sun approx R=255 G=179 B=30
    if (r > 200 && g > 160 && b < 50) return CellContent.SUN;  // yellow
    // moon approx R=76 G=140 B=230
    if (r < 80 && g < 150 && b > 220) return CellContent.MOON; // blue

    return CellContent.EMPTY;
}


export async function parseTangoGrid(pathToImage: string, debug = false) {
    const image = await Jimp.read(pathToImage);

    const grid: CellGrid = [];
    for (let r = 0; r < GRID_SIZE_IN_CELLS; r++) {
        const row: CellContent[] = [];
        for (let c = 0; c < GRID_SIZE_IN_CELLS; c++) {
            const x = START_COORDS[0] + c * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);
            const y = START_COORDS[1] + r * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);

            if (debug) {
                // Draw cell outline for debugging
                drawCellOutline(image, x, y, WIDTH_OF_CELL_PX);
            }

            const content = detectColour(image, x, y, 5);
            row.push(content);
        }

        grid.push(row);
    }

    if(debug) {
        const fullDebugPath = path.resolve(__dirname, "../../assets/board_debug.png") as '`${string}.${string}`';
        await image.write(fullDebugPath);
    }

    const symbols: SymbolPositions = [];

    return { grid, symbols };
}
