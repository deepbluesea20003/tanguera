import { intToRGBA, Jimp, rgbaToInt } from "jimp";
import path from "path";

const WIDTH_OF_CELL = 64;
const START_COORDS = [435, 101];

enum CellContent {
    EMPTY = '.',
    SUN = 'S',
    MOON = 'M'
}

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
    const cx = Math.floor(px + offset + WIDTH_OF_CELL / 2);
    const cy = Math.floor(py + offset + WIDTH_OF_CELL / 2);

    const pixel = image.getPixelColor(cx, cy);
    const { r, g, b } = intToRGBA(pixel);

    markCross(image, cx, cy);

    console.log(`Pixel at (${cx}, ${cy}): R=${r} G=${g} B=${b}`);
    // sun approx R=255 G=179 B=30
    if (r > 200 && g > 160 && b < 50) return CellContent.SUN;  // yellow
    // moon approx R=76 G=140 B=230
    if (r < 80 && g < 150 && b > 220) return CellContent.MOON; // blue

    return CellContent.EMPTY;
}

export async function parseTangoGrid() {
    const fullPath = path.resolve(__dirname, "../../assets/board.png");
    const image = await Jimp.read(fullPath);

    const rows = 6;
    const cols = 6;

    const grid: CellContent[][] = [];

    for (let r = 0; r < rows; r++) {
        const row: CellContent[] = [];

        for (let c = 0; c < cols; c++) {
            const x = START_COORDS[0] + c * (WIDTH_OF_CELL + 2);
            const y = START_COORDS[1] + r * (WIDTH_OF_CELL + 2);

            // Draw cell outline for debugging
            drawCellOutline(image, x, y, WIDTH_OF_CELL);

            const content = detectColour(image, x, y, 5);
            row.push(content);
        }

        grid.push(row);
    }

    const fullDebugPath = path.resolve(__dirname, "../../assets/board_debug.png") as '`${string}.${string}`';
    await image.write(fullDebugPath);

    const symbols: {
        type: 'x' | '=',
        between: [[number, number], [number, number]]
    }[] = [];

    return { grid, symbols };
}
