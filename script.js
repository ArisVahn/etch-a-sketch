const gridContainer = document.querySelector('.grid-container');

function createGrid() {
    for (let i = 0; i < 256; i++) {
        const div = document.createElement('div');
        div.classList.add('grid-item');
        div.addEventListener('mouseover', (changeColor));
        gridContainer.appendChild(div);
    }
}

function changeColor(e) {
    e.target.style.backgroundColor = '#000';
}

createGrid();
