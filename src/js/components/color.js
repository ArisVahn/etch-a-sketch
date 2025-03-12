/**
 * Color Component Module
 * Handles color-related functionality
 */

import { getRandomColor, rgbToHex, adjustBrightness } from '../utils/utils.js';

/**
 * Applies the appropriate color to a cell based on the current mode
 * @param {HTMLElement} cell - The cell to apply color to
 * @param {Object} appState - The application state object
 */
export function applyColor(cell, appState) {
    switch(appState.currentMode) {
        case 'color':
            cell.style.backgroundColor = appState.currentColor;
            break;
        case 'rainbow':
            cell.style.backgroundColor = getRandomColor();
            break;
        case 'darker':
            applyShading(cell);
            break;
        case 'eraser':
            cell.style.removeProperty('background-color');
            break;
    }
}

/**
 * Updates the color selection UI and state
 * @param {string} color - The color to set
 * @param {Object} appState - The application state object
 */
export function updateColorSelection(color, appState) {
    appState.currentColor = color;
    const colorDisplay = document.getElementById('color-display');
    const colorPicker = document.getElementById('color-picker');
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorDisplay.style.backgroundColor = color;
    colorPicker.value = color;
    
    colorOptions.forEach(opt => opt.classList.remove('active'));
    
    const matchingOption = Array.from(colorOptions)
        .find(opt => opt.dataset.color === color);
        
    if (matchingOption) {
        matchingOption.classList.add('active');
    }
}

/**
 * Applies shading effect to a cell
 * @param {HTMLElement} cell - The cell to apply shading to
 */
function applyShading(cell) {
    const current = getComputedStyle(cell).backgroundColor;
    const match = current.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    
    if (!match) {
        cell.style.backgroundColor = isDarkMode ? '#191919' : '#e6e6e6';
    } else {
        const [r, g, b] = match.slice(1).map(n => parseInt(n));
        const hexColor = rgbToHex(r, g, b);
        const adjustment = isDarkMode ? 25 : -25;
        cell.style.backgroundColor = adjustBrightness(hexColor, adjustment);
    }
}