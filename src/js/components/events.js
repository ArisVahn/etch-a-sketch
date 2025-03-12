/**
 * Events Component Module
 * Centralizes all event listeners and UI interactions
 */

import { updateColorSelection } from './color.js';
import { createGrid, clearGrid } from './grid.js';
import { updateBrushSize, refreshBrushPreview } from './brush.js';
import { toggleDarkMode } from './theme.js';
import { debounce } from '../utils/utils.js';

/**
 * Sets up all event listeners for the application
 * @param {Object} appState - The application state object
 */
export function initializeEventListeners(appState) {
    // DOM Elements
    const sizeSlider = document.getElementById('size-slider');
    const brushSizeSlider = document.getElementById('brush-size-slider');
    const colorMode = document.getElementById('color-mode');
    const colorPicker = document.getElementById('color-picker');
    const colorOptions = document.querySelectorAll('.color-option');
    const rainbowMode = document.getElementById('rainbow-mode');
    const darkerMode = document.getElementById('darker-mode');
    const eraserMode = document.getElementById('eraser-mode');
    const clearBtn = document.getElementById('clear-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const grid = document.getElementById('grid');
    
    // Grid size slider events - debounced to improve performance
    const updateGridSize = debounce((size) => {
        createGrid(size, appState);
    }, 150);
    
    sizeSlider.addEventListener('input', () => {
        const size = parseInt(sizeSlider.value);
        const sizeValue = document.getElementById('size-value');
        sizeValue.textContent = `${size} × ${size}`;
        updateGridSize(size);
    });
    
    // Brush size slider events - now passing grid info
    brushSizeSlider.addEventListener('input', () => {
        const gridCells = Array.from(grid.children);
        const gridSize = appState.currentSize;
        updateBrushSize(appState, gridCells, gridSize);
    });
    
    // Color selection events
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            updateColorSelection(option.dataset.color, appState);
            setActiveMode('color', appState);
        });
    });
    
    // Color picker events
    colorPicker.addEventListener('input', (e) => {
        updateColorSelection(e.target.value, appState);
        setActiveMode('color', appState);
    });
    
    // Mode selection events
    colorMode.addEventListener('click', () => setActiveMode('color', appState));
    rainbowMode.addEventListener('click', () => setActiveMode('rainbow', appState));
    darkerMode.addEventListener('click', () => setActiveMode('darker', appState));
    eraserMode.addEventListener('click', () => setActiveMode('eraser', appState));
    
    // Clear grid event
    clearBtn.addEventListener('click', () => clearGrid(appState));
    
    // Theme toggle event
    themeToggleBtn.addEventListener('click', toggleDarkMode);
    
    // Prevent dragging on the grid
    grid.addEventListener('dragstart', e => e.preventDefault());
    
    // Stop drawing when mouse button is released anywhere in the document
    document.addEventListener('mouseup', () => appState.isDrawing = false);
}

/**
 * Sets the active drawing mode
 * @param {string} mode - The mode to set ('color', 'rainbow', 'darker', or 'eraser')
 * @param {Object} appState - The application state object
 */
function setActiveMode(mode, appState) {
    appState.currentMode = mode;
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'color') {
        document.getElementById('color-mode').classList.add('active');
    } else {
        document.getElementById(`${mode}-mode`).classList.add('active');
    }
    
    const grid = document.getElementById('grid');
    const gridCells = Array.from(grid.children);
    const gridSize = appState.currentSize;
    refreshBrushPreview(appState, gridCells, gridSize);
}