document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const grid = document.getElementById('grid');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValue = document.getElementById('size-value');
    const brushSizeSlider = document.getElementById('brush-size-slider');
    const brushSizeValue = document.getElementById('brush-size-value');
    const colorMode = document.getElementById('color-mode');
    const colorPicker = document.getElementById('color-picker');
    const colorDisplay = document.getElementById('color-display');
    const colorOptions = document.querySelectorAll('.color-option');
    const toolButtons = document.querySelectorAll('.tool-btn');
    const rainbowMode = document.getElementById('rainbow-mode');
    const darkerMode = document.getElementById('darker-mode');
    const eraserMode = document.getElementById('eraser-mode');
    const clearBtn = document.getElementById('clear-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // State variables
    let currentMode = 'color';
    let currentSize = 16;
    let brushSize = 1;
    let currentColor = '#000000';
    let isDrawing = false;
    
    // Initialize theme from localStorage
    initializeTheme();
    
    // Grid functions
    function createGrid(size) {
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            const row = Math.floor(i / size);
            const col = i % size;
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            cell.addEventListener('mousedown', handleCellMouseDown);
            cell.addEventListener('mousemove', handleCellMouseMove);
            cell.addEventListener('mouseup', () => isDrawing = false);
            cell.addEventListener('mouseleave', handleCellMouseLeave);
            
            grid.appendChild(cell);
        }
        
        currentSize = size;
    }
    
    function handleCellMouseDown(e) {
        e.preventDefault();
        isDrawing = true;
        const cell = e.target;
        const centerRow = parseInt(cell.dataset.row);
        const centerCol = parseInt(cell.dataset.col);
        applyBrush(centerRow, centerCol);
    }
    
    function handleCellMouseMove(e) {
        const cell = e.target;
        const centerRow = parseInt(cell.dataset.row);
        const centerCol = parseInt(cell.dataset.col);
        
        clearBrushPreview();
        showBrushPreview(centerRow, centerCol);
        
        if (isDrawing) {
            applyBrush(centerRow, centerCol);
        }
    }
    
    function handleCellMouseLeave(e) {
        e.target.classList.remove('brush-preview');
    }
    
    function clearGrid() {
        createGrid(currentSize);
    }
    
    // Brush functions
    function applyBrush(centerRow, centerCol) {
        const offset = Math.floor(brushSize / 2);
        const cells = Array.from(grid.children);
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (row >= centerRow - offset && row < centerRow + (brushSize - offset) &&
                col >= centerCol - offset && col < centerCol + (brushSize - offset)) {
                applyColor(cell);
            }
        });
    }
    
    function showBrushPreview(centerRow, centerCol) {
        const offset = Math.floor(brushSize / 2);
        const cells = Array.from(grid.children);
        const previewColor = getPreviewColor();
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (row >= centerRow - offset && row < centerRow + (brushSize - offset) &&
                col >= centerCol - offset && col < centerCol + (brushSize - offset)) {
                cell.classList.add('brush-preview');
                cell.style.outlineColor = previewColor;
            }
        });
    }
    
    function getPreviewColor() {
        switch(currentMode) {
            case 'color': return currentColor;
            case 'rainbow': return 'var(--accent-color)';
            case 'darker': return '#888888';
            case 'eraser': return '#cccccc';
            default: return currentColor;
        }
    }
    
    function clearBrushPreview() {
        const cells = Array.from(grid.children);
        cells.forEach(cell => cell.classList.remove('brush-preview'));
    }
    
    function updateBrushSize() {
        brushSize = parseInt(brushSizeSlider.value);
        brushSizeValue.textContent = brushSize;
        
        refreshBrushPreview();
    }
    
    // Color functions
    function applyColor(cell) {
        switch(currentMode) {
            case 'color':
                cell.style.backgroundColor = currentColor;
                break;
            case 'rainbow':
                const r = Math.floor(Math.random() * 256);
                const g = Math.floor(Math.random() * 256);
                const b = Math.floor(Math.random() * 256);
                cell.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                break;
            case 'darker':
                applyShading(cell);
                break;
            case 'eraser':
                cell.style.removeProperty('background-color');
                break;
        }
    }
    
    function applyShading(cell) {
        const current = getComputedStyle(cell).backgroundColor;
        const match = current.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        if (!match) {
            cell.style.backgroundColor = isDarkMode ? 
                'rgb(25, 25, 25)' : 'rgb(230, 230, 230)';
        } else {
            const adjustment = isDarkMode ? 25 : -25;
            const [r, g, b] = match.slice(1).map(n => 
                Math.min(255, Math.max(0, parseInt(n) + adjustment))
            );
            cell.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
    }
    
    function updateColorSelection(color) {
        currentColor = color;
        colorDisplay.style.backgroundColor = color;
        colorPicker.value = color;
        
        colorOptions.forEach(opt => opt.classList.remove('active'));
        
        const matchingOption = Array.from(colorOptions)
            .find(opt => opt.dataset.color === color);
            
        if (matchingOption) {
            matchingOption.classList.add('active');
        }
    }
    
    // Mode and theme functions
    function setActiveMode(mode) {
        currentMode = mode;
        toolButtons.forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'color') {
            colorMode.classList.add('active');
        } else {
            document.getElementById(`${mode}-mode`).classList.add('active');
        }
        
        refreshBrushPreview();
    }
    
    function refreshBrushPreview() {
        clearBrushPreview();
        const hoveredCell = document.querySelector('.grid-cell:hover');
        if (hoveredCell) {
            const row = parseInt(hoveredCell.dataset.row);
            const col = parseInt(hoveredCell.dataset.col);
            showBrushPreview(row, col);
        }
    }
    
    function toggleDarkMode() {
        const htmlEl = document.documentElement;
        const isDarkMode = htmlEl.classList.contains('dark-mode');
        
        htmlEl.classList.toggle('dark-mode', !isDarkMode);
        htmlEl.classList.toggle('light-mode', isDarkMode);
        localStorage.setItem('darkMode', !isDarkMode);
    }
    
    function initializeTheme() {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        document.documentElement.classList.toggle('dark-mode', savedDarkMode);
        document.documentElement.classList.toggle('light-mode', !savedDarkMode);
    }
    
    function updateGridSize() {
        const size = parseInt(sizeSlider.value);
        sizeValue.textContent = `${size} × ${size}`;
        createGrid(size);
    }
    
    // Event listeners
    sizeSlider.addEventListener('input', updateGridSize);
    brushSizeSlider.addEventListener('input', updateBrushSize);
    
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            updateColorSelection(option.dataset.color);
            setActiveMode('color');
        });
    });
    
    colorPicker.addEventListener('input', (e) => {
        updateColorSelection(e.target.value);
        setActiveMode('color');
    });
    
    colorMode.addEventListener('click', () => setActiveMode('color'));
    rainbowMode.addEventListener('click', () => setActiveMode('rainbow'));
    darkerMode.addEventListener('click', () => setActiveMode('darker'));
    eraserMode.addEventListener('click', () => setActiveMode('eraser'));
    clearBtn.addEventListener('click', clearGrid);
    themeToggleBtn.addEventListener('click', toggleDarkMode);
    
    grid.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('mouseup', () => isDrawing = false);
    
    // Initialize application
    sizeSlider.value = currentSize;
    brushSizeSlider.value = brushSize;
    sizeValue.textContent = `${currentSize} × ${currentSize}`;
    brushSizeValue.textContent = brushSize;
    createGrid(currentSize);
    setActiveMode('color');
});