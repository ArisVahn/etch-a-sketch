/**
 * Brush Component Module
 * Handles brush functionality and preview
 */

import { debounce, calculateAffectedCells } from '../utils/utils.js';

/**
 * Shows a preview of the brush on the grid
 * @param {number} centerRow - Center row of the brush
 * @param {number} centerCol - Center column of the brush
 * @param {Object} appState - The application state object
 * @param {Array} gridCells - Array of grid cell elements
 * @param {number} gridSize - Size of the grid
 */
export function showBrushPreview(centerRow, centerCol, appState, gridCells, gridSize) {
    clearBrushPreview();
    const affectedCells = calculateAffectedCells(centerRow, centerCol, gridSize, appState.brushSize);
    const previewColor = getPreviewColor(appState);
    
    affectedCells.forEach(({ row, col }) => {
        const cellIndex = row * gridSize + col;
        const cell = gridCells[cellIndex];
        if (cell) {
            cell.classList.add('brush-preview');
            cell.style.outlineColor = previewColor;
        }
    });
}

/**
 * Clears the brush preview from all cells
 */
export function clearBrushPreview() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('brush-preview');
        cell.style.removeProperty('outline-color');
    });
}

/**
 * Gets the appropriate preview color based on the current mode
 * @param {Object} appState - The application state object
 * @returns {string} The preview color
 */
function getPreviewColor(appState) {
    switch(appState.currentMode) {
        case 'color': return appState.currentColor;
        case 'rainbow': return 'var(--accent-color)';
        case 'darker': return '#888888';
        case 'eraser': return '#cccccc';
        default: return appState.currentColor;
    }
}

/**
 * Updates the brush size in the application state and UI
 * @param {Object} appState - The application state object
 * @param {Array} gridCells - Array of grid cell elements
 * @param {number} gridSize - Size of the grid
 */
export function updateBrushSize(appState, gridCells, gridSize) {
    const brushSizeSlider = document.getElementById('brush-size-slider');
    const brushSizeValue = document.getElementById('brush-size-value');
    
    appState.brushSize = parseInt(brushSizeSlider.value);
    brushSizeValue.textContent = appState.brushSize;
    
    debouncedRefreshPreview(appState, gridCells, gridSize);
}

// Debounced version of refreshBrushPreview for better performance
const debouncedRefreshPreview = debounce((appState, gridCells, gridSize) => {
    refreshBrushPreview(appState, gridCells, gridSize);
}, 50);

/**
 * Refreshes the brush preview when needed
 * @param {Object} appState - The application state object
 * @param {Array} gridCells - Array of grid cell elements
 * @param {number} gridSize - Size of the grid
 */
export function refreshBrushPreview(appState, gridCells, gridSize) {
    clearBrushPreview();
    const hoveredCell = document.querySelector('.grid-cell:hover');
    if (hoveredCell) {
        const row = parseInt(hoveredCell.dataset.row);
        const col = parseInt(hoveredCell.dataset.col);
        showBrushPreview(row, col, appState, gridCells, gridSize);
    }
}