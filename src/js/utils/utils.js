/**
 * Digital Sketch Board - Utility Functions
 * Common helper functions used across components
 */

/**
 * Debounces a function to prevent excessive calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Converts RGB color to hexadecimal
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color code
 */
export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Converts hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {Object} RGB color object
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Generates a random color in hex format
 * @returns {string} Random hex color
 */
export function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return rgbToHex(r, g, b);
}

/**
 * Adjusts the brightness of a color
 * @param {string} color - Hex color code
 * @param {number} amount - Amount to adjust (-255 to 255)
 * @returns {string} Adjusted hex color
 */
export function adjustBrightness(color, amount) {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    return rgbToHex(
        Math.max(0, Math.min(255, rgb.r + amount)),
        Math.max(0, Math.min(255, rgb.g + amount)),
        Math.max(0, Math.min(255, rgb.b + amount))
    );
}

/**
 * Calculates which cells are affected by a brush at given coordinates
 * Uses a more efficient rectangular bounds check
 * @param {number} centerRow - Center row of the brush
 * @param {number} centerCol - Center column of the brush
 * @param {number} size - Grid size
 * @param {number} brushSize - Size of the brush
 * @returns {Array<{row: number, col: number}>} Array of affected cell coordinates
 */
export function calculateAffectedCells(centerRow, centerCol, size, brushSize) {
    const offset = Math.floor(brushSize / 2);
    const cells = [];
    
    // Calculate bounds with clamping
    const startRow = Math.max(0, centerRow - offset);
    const endRow = Math.min(size - 1, centerRow + (brushSize - offset));
    const startCol = Math.max(0, centerCol - offset);
    const endCol = Math.min(size - 1, centerCol + (brushSize - offset));
    
    // Only iterate over cells that are actually in bounds
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            cells.push({ row, col });
        }
    }
    
    return cells;
}