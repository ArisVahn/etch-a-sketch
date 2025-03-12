# Digital Sketch Board

A modern, responsive web-based sketching application with various drawing tools and dark/light mode support.

## Features

- Adjustable canvas resolution
- Variable brush sizes
- Multiple drawing modes:
  - Color mode with custom color picker
  - Rainbow mode for random colors
  - Shade mode for gradual darkening/lightening
  - Eraser mode
- Dark/Light theme support
- Responsive design for all screen sizes
- Smooth performance optimizations

## Project Structure

```
src/
├── assets/
│   └── images/        # Image assets
├── css/
│   ├── base.css       # Base styles and variables
│   ├── main.css       # Main CSS entry point
│   └── components/    # Component-specific styles
│       ├── header.css
│       ├── toolbox.css
│       ├── controls.css
│       ├── canvas.css
│       └── color-palette.css
└── js/
    ├── app.js         # Main JavaScript entry point
    ├── components/    # Component modules
    │   ├── brush.js
    │   ├── color.js
    │   ├── events.js
    │   ├── grid.js
    │   └── theme.js
    └── utils/         # Utility functions
        └── utils.js
```

## Usage

1. Open `index.html` in a modern web browser
2. Use the canvas resolution slider to adjust grid size
3. Select brush size using the brush size slider
4. Choose a drawing mode:
   - Color: Pick a color from the palette or use the custom color picker
   - Rainbow: Draw with random colors
   - Shade: Gradually darken or lighten existing colors
   - Eraser: Remove color from cells
5. Click and drag on the grid to draw
6. Use the theme toggle in the header to switch between dark and light modes
7. Click "Clear Canvas" to reset the grid

## Technical Details

The application is built using vanilla JavaScript with a modular architecture for maintainability and performance. Key technical features include:

- CSS Custom Properties for theming
- ES6 Modules for code organization
- Performance optimizations:
  - Debounced event handlers
  - DOM element caching
  - Optimized drawing algorithms
- Responsive CSS Grid layout
- Local storage for theme preference

## Browser Support

Supports all modern browsers that implement ES6 Modules and CSS Grid:
- Chrome
- Firefox
- Safari
- Edge

## License

This project is licensed under the MIT License - see the LICENSE file for details.