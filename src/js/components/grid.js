/**
 * Drawing Grid System
 * 
 * This is the core drawing functionality of our Etch-A-Sketch app. Here's how it works:
 * 
 * 1. We create a grid of cells that you can draw on
 * 2. We use event delegation to handle mouse/touch interactions efficiently
 * 3. When drawing quickly, we use line interpolation to ensure no gaps
 *    (Like connecting dots between where your mouse was and where it is now)
 * 
 * The grid supports both mouse and touch input, so it works on mobile too!
 */
import { applyColor } from './color.js';
import { showBrushPreview, clearBrushPreview } from './brush.js';
import { calculateAffectedCells } from '../utils/utils.js';

// Store references to DOM elements and state we'll need often
// This is more efficient than querying the DOM each time
let gridElement = null;
let gridCells = [];
let gridSize = 0;
let lastTouchCell = null;
let isMouseDown = false;

// Track mouse state globally
document.addEventListener('mousedown', () => isMouseDown = true);
document.addEventListener('mouseup', () => isMouseDown = false);

/**
 * Creates our drawing grid
 * 
 * Instead of making lots of individual <div> elements with their own event listeners,
 * we create them all at once and use "event delegation" - this means we put one
 * listener on the parent grid and check which cell was clicked.
 * 
 * This is MUCH more efficient, especially for larger grids!
 */
export function createGrid(size, appState) {
    gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    // Create cells without individual event listeners
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        const row = Math.floor(i / size);
        const col = i % size;
        cell.dataset.row = row;
        cell.dataset.col = col;
        gridElement.appendChild(cell);
    }
    
    gridCells = Array.from(gridElement.children);
    gridSize = size;
    appState.currentSize = size;
    
    // Set up event delegation on the grid container
    setupGridEvents(appState);
}

/**
 * Initializes grid event handlers using event delegation
 * Handles both mouse and touch interactions with interpolation support
 */
function setupGridEvents(appState) {
    if (!gridElement._eventsInitialized) {
        // Mouse events
        gridElement.addEventListener('mousedown', e => {
            if (e.target.classList.contains('grid-cell')) {
                appState.isDrawing = true;
                handleCellMouseDown(e, appState);
            }
        });
        
        gridElement.addEventListener('mousemove', e => {
            if (e.target.classList.contains('grid-cell')) {
                handleCellMouseMove(e, appState);
            }
        });
        
        gridElement.addEventListener('mouseleave', () => {
            clearBrushPreview();
            if (!isMouseDown) {
                appState.isDrawing = false;
                appState.lastPosition = null;
            }
        });
        
        gridElement.addEventListener('mouseup', () => {
            isMouseDown = false;
            appState.isDrawing = false;
            appState.lastPosition = null;
        });
        
        // Touch events
        gridElement.addEventListener('touchstart', e => {
            if (e.target.classList.contains('grid-cell')) {
                e.preventDefault();
                handleCellTouchStart(e, appState);
            }
        }, { passive: false });
        
        gridElement.addEventListener('touchmove', e => {
            e.preventDefault();
            handleCellTouchMove(e, appState);
        }, { passive: false });
        
        gridElement.addEventListener('touchend', () => {
            appState.isDrawing = false;
            lastTouchCell = null;
            clearBrushPreview();
            appState.lastPosition = null;
        });
        
        gridElement._eventsInitialized = true;
    }
}

/**
 * Resets the grid to its initial state while maintaining current size
 */
export function clearGrid(appState) {
    createGrid(appState.currentSize, appState);
}

/**
 * Initiates drawing on mouse press
 */
function handleCellMouseDown(e, appState) {
    e.preventDefault();
    const cell = e.target;
    const centerRow = parseInt(cell.dataset.row);
    const centerCol = parseInt(cell.dataset.col);
    applyBrush(centerRow, centerCol, appState);
}

/**
 * Handles continuous drawing with mouse movement
 * Uses line interpolation to prevent gaps when moving quickly
 */
function handleCellMouseMove(e, appState) {
    const cell = e.target;
    const centerRow = parseInt(cell.dataset.row);
    const centerCol = parseInt(cell.dataset.col);
    
    clearBrushPreview();
    showBrushPreview(centerRow, centerCol, appState, gridCells, gridSize);
    
    if (appState.isDrawing) {
        // Get the last position from appState or initialize it
        if (!appState.lastPosition) {
            appState.lastPosition = { row: centerRow, col: centerCol };
        }

        // Interpolate between last position and current position
        const points = interpolatePoints(
            appState.lastPosition.row,
            appState.lastPosition.col,
            centerRow,
            centerCol
        );

        // Apply brush to all points along the path
        points.forEach(point => {
            applyBrush(point.row, point.col, appState);
        });

        // Update last position
        appState.lastPosition = { row: centerRow, col: centerCol };
    }
}

/**
 * Creates a line between two points
 * 
 * When drawing quickly, your mouse/finger might "jump" over some cells.
 * To fix this, we use Bresenham's line algorithm to figure out which cells
 * you would have drawn on if you moved more slowly.
 * 
 * Think of it like connecting dots between your last position and current position!
 */
function interpolatePoints(x1, y1, x2, y2) {
    const points = [];
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        points.push({ row: x1, col: y1 });
        if (x1 === x2 && y1 === y2) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }

    return points;
}

/**
 * Initiates drawing on touch start
 */
function handleCellTouchStart(e, appState) {
    appState.isDrawing = true;
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (cell && cell.classList.contains('grid-cell')) {
        lastTouchCell = cell;
        const centerRow = parseInt(cell.dataset.row);
        const centerCol = parseInt(cell.dataset.col);
        applyBrush(centerRow, centerCol, appState);
    }
}

/**
 * Handles continuous drawing with touch movement
 * Uses line interpolation to prevent gaps when moving quickly
 */
function handleCellTouchMove(e, appState) {
    if (!appState.isDrawing) return;
    
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (cell && cell.classList.contains('grid-cell')) {
        const centerRow = parseInt(cell.dataset.row);
        const centerCol = parseInt(cell.dataset.col);

        // Only interpolate if we have a last position
        if (lastTouchCell) {
            const lastRow = parseInt(lastTouchCell.dataset.row);
            const lastCol = parseInt(lastTouchCell.dataset.col);
            
            // Interpolate between last position and current position
            const points = interpolatePoints(
                lastRow,
                lastCol,
                centerRow,
                centerCol
            );

            // Apply brush to all points along the path
            points.forEach(point => {
                applyBrush(point.row, point.col, appState);
            });
        } else {
            // If no last position, just paint current cell
            applyBrush(centerRow, centerCol, appState);
        }
        
        lastTouchCell = cell;
    }
}

/**
 * Cleans up cell preview when mouse leaves
 */
function handleCellMouseLeave(e) {
    e.target.classList.remove('brush-preview');
}

/**
 * Colors in the grid cells
 * 
 * This is where the actual drawing happens! We:
 * 1. Figure out which cells to color based on brush size
 * 2. Apply the current color or special effect (like rainbow mode)
 * 
 * The brush can be bigger than 1 cell, so we calculate all cells
 * that should be colored for the current brush position.
 */
export function applyBrush(centerRow, centerCol, appState) {
    const affectedCells = calculateAffectedCells(centerRow, centerCol, gridSize, appState.brushSize);
    
    affectedCells.forEach(({ row, col }) => {
        const cellIndex = row * gridSize + col;
        const cell = gridCells[cellIndex];
        if (cell) {
            applyColor(cell, appState);
        }
    });
}
