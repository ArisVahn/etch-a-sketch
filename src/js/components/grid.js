/**
 * Grid Component Module
 * Handles creation and manipulation of the sketch grid
 */
import { applyColor } from './color.js';
import { showBrushPreview, clearBrushPreview } from './brush.js';
import { calculateAffectedCells } from '../utils/utils.js';

// Cache DOM references
let gridElement = null;
let gridCells = [];
let gridSize = 0;
let lastTouchCell = null;

/**
 * Creates a grid of the specified size
 * @param {number} size - The size of the grid (size x size)
 * @param {Object} appState - The application state object
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
 * Set up event delegation for the grid
 * @param {Object} appState - The application state object
 */
function setupGridEvents(appState) {
    if (!gridElement._eventsInitialized) {
        // Mouse events
        gridElement.addEventListener('mousedown', e => {
            if (e.target.classList.contains('grid-cell')) {
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
            appState.isDrawing = false;
        });
        
        gridElement.addEventListener('mouseup', () => {
            appState.isDrawing = false;
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
        });
        
        gridElement._eventsInitialized = true;
    }
}

/**
 * Clears the grid by recreating it with the same size
 * @param {Object} appState - The application state object
 */
export function clearGrid(appState) {
    createGrid(appState.currentSize, appState);
}

/**
 * Handle mousedown event on grid cells
 * @param {Event} e - The mousedown event
 * @param {Object} appState - The application state object
 */
function handleCellMouseDown(e, appState) {
    e.preventDefault();
    appState.isDrawing = true;
    const cell = e.target;
    const centerRow = parseInt(cell.dataset.row);
    const centerCol = parseInt(cell.dataset.col);
    applyBrush(centerRow, centerCol, appState);
}

/**
 * Handle mousemove event on grid cells
 * @param {Event} e - The mousemove event
 * @param {Object} appState - The application state object
 */
function handleCellMouseMove(e, appState) {
    const cell = e.target;
    const centerRow = parseInt(cell.dataset.row);
    const centerCol = parseInt(cell.dataset.col);
    
    clearBrushPreview();
    showBrushPreview(centerRow, centerCol, appState, gridCells, gridSize);
    
    if (appState.isDrawing) {
        applyBrush(centerRow, centerCol, appState);
    }
}

/**
 * Handle touch start event on grid cells
 * @param {TouchEvent} e - The touch event
 * @param {Object} appState - The application state object
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
 * Handle touch move event on grid cells
 * @param {TouchEvent} e - The touch event
 * @param {Object} appState - The application state object
 */
function handleCellTouchMove(e, appState) {
    if (!appState.isDrawing) return;
    
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (cell && cell.classList.contains('grid-cell') && cell !== lastTouchCell) {
        lastTouchCell = cell;
        const centerRow = parseInt(cell.dataset.row);
        const centerCol = parseInt(cell.dataset.col);
        applyBrush(centerRow, centerCol, appState);
    }
}

/**
 * Handle mouseleave event on grid cells
 * @param {Event} e - The mouseleave event
 */
function handleCellMouseLeave(e) {
    e.target.classList.remove('brush-preview');
}

/**
 * Apply the brush to the grid at the specified coordinates
 * @param {number} centerRow - The row coordinate
 * @param {number} centerCol - The column coordinate
 * @param {Object} appState - The application state object
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