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

export enum SymbolType {
    X = 'x',
    EQUALS = '='
}

export type CellGrid = CellContent[][];
export type SymbolPosition = {
    type: SymbolType,
    between: [[number, number], [number, number]]
};


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

function detectSymbolInBox(
    image: any,
    x: number,
    y: number,
    size: number
): SymbolType | null {
    let darkPixels: { x: number; y: number }[] = [];

    // 1. Collect dark pixels inside the box
    for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
            const px = image.getPixelColor(x + dx, y + dy);
            const { r, g, b } = intToRGBA(px);

            // symbol color is dark grey / brown
            if (r < 180 && g < 160 && b < 140) {
                darkPixels.push({ x: dx, y: dy });
            }
        }
    }

    // Too few pixels = no symbol
    if (darkPixels.length < 6) return null;

    const xs = darkPixels.map(p => p.x);
    const ys = darkPixels.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    // '=' → wide, short, two horizontal bars
    if (width > height * 1.3) {
        return SymbolType.EQUALS;
    }

    // 'x' → roughly square with diagonal spread
    return SymbolType.X;
}


export async function parseTangoGrid(pathToImage: string, debug = false) {
    const image = await Jimp.read(pathToImage);

    // read the cells of the grid
    const grid: CellGrid = [];
    for (let r = 0; r < GRID_SIZE_IN_CELLS; r++) {
        const row: CellContent[] = [];
        for (let c = 0; c < GRID_SIZE_IN_CELLS; c++) {
            const x = START_COORDS[0] + c * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);
            const y = START_COORDS[1] + r * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);

            // Draw cell outline for debugging
            // drawCellOutline(image, x, y, WIDTH_OF_CELL_PX);

            const content = detectColour(image, x, y, 5);
            row.push(content);
        }

        grid.push(row);
    }



    // read the symbols between cells
    const symbols: SymbolPosition[] = [];

    const HORIZONTAL_START_COORDS = [491, 124];
    const SAMPLE_SIZE = 18;
    // horizontal symbols
    for (let r = 0; r < GRID_SIZE_IN_CELLS; r++) {
        for (let c = 0; c < GRID_SIZE_IN_CELLS - 1; c++) {
            // read pixel between cells
            const x = HORIZONTAL_START_COORDS[0] + c * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);
            const y = HORIZONTAL_START_COORDS[1] + r * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);

            drawCellOutline(image, x, y, SAMPLE_SIZE);
            const symbol = detectSymbolInBox(image, x, y, SAMPLE_SIZE);
            if (symbol) {
                symbols.push({
                    type: symbol,
                    between: [[r, c], [r, c + 1]]
                });
            }
        }
    }

    const VERTICAL_START_COORDS = [457, 156];
    // vertical symbols
    for (let r = 0; r < GRID_SIZE_IN_CELLS - 1; r++) {
        for (let c = 0; c < GRID_SIZE_IN_CELLS; c++) {
            // read pixel between cells
            const x = VERTICAL_START_COORDS[0] + c * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);
            const y = VERTICAL_START_COORDS[1] + r * (WIDTH_OF_CELL_PX + GRID_SPACING_PX);

            drawCellOutline(image, x, y, SAMPLE_SIZE);
            const symbol = detectSymbolInBox(image, x, y, SAMPLE_SIZE);
            if (symbol) {
                symbols.push({
                    type: symbol,
                    between: [[r, c], [r + 1, c]]
                });
            }
        }
    }

    
    if(debug) {
        const fullDebugPath = path.resolve(__dirname, "../../assets/board_debug.png") as '`${string}.${string}`';
        await image.write(fullDebugPath);
    }
    return { grid, symbols };
}
