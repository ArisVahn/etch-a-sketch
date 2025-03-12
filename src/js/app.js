/**
 * Digital Sketch Board - Main Application
 * Entry point for the Digital Sketch Board application
 * 
 * This file initializes the application and coordinates all components
 */

import { createGrid, clearGrid } from './components/grid.js';
import { initializeEventListeners } from './components/events.js';
import { initializeTheme, onThemeChange } from './components/theme.js';

// Application initialization
const init = () => {
    // Initialize application state
    const appState = {
        currentMode: 'color',
        currentSize: 16,
        brushSize: 1,
        currentColor: '#000000',
        isDrawing: false,
        isDarkMode: false
    };

    // Initialize theme from localStorage and set up theme change handler
    initializeTheme();
    const unsubscribe = onThemeChange((isDarkMode) => {
        appState.isDarkMode = isDarkMode;
    });
    
    // Initialize UI elements with current state
    const sizeSlider = document.getElementById('size-slider');
    const brushSizeSlider = document.getElementById('brush-size-slider');
    const sizeValue = document.getElementById('size-value');
    const brushSizeValue = document.getElementById('brush-size-value');
    
    sizeSlider.value = appState.currentSize;
    brushSizeSlider.value = appState.brushSize;
    sizeValue.textContent = `${appState.currentSize} × ${appState.currentSize}`;
    brushSizeValue.textContent = appState.brushSize;
    
    // Create initial grid
    createGrid(appState.currentSize, appState);
    
    // Set up event listeners
    initializeEventListeners(appState);

    // Return cleanup function
    return () => {
        unsubscribe();
        // Add any future cleanup here
    };
};

// Initialize app when DOM is ready
let cleanup;
document.addEventListener('DOMContentLoaded', () => {
    cleanup = init();
});

// Cleanup when window unloads
window.addEventListener('unload', () => {
    if (cleanup) cleanup();
});