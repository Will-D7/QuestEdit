class Grid {
    constructor(options = {}) {
        this.config = {
            width: Config.grid.defaultWidth,
            height: Config.grid.defaultHeight,
            cellSize: Config.grid.cellSize,
            cellGap: Config.grid.cellGap,
            containerId: 'grid',
            wrapperId: 'grid-wrapper',
            containerClass: 'grid-container',
            ...options
        };
        this.gridElement = null;
        this.gridContainer = null;
        this.gridWrapper = null;
        this.cells = [];
        this.targetCell = null;
        this.highlightedCells = new Set();
        this.onCellClick = null;
        this.onCellHover = null;
        this.onGridResize = null;
        this.init();
    }
    init() {
        this.gridElement = document.getElementById(this.config.containerId);
        this.gridContainer = document.getElementById('grid-container');
        this.gridWrapper = document.getElementById(this.config.wrapperId);
        if (!this.gridElement || !this.gridContainer || !this.gridWrapper) {
            console.error('Required grid elements not found');
            return;
        }
        this.create();
        this.setupEventListeners();
    }
    create() {
        this.gridElement.innerHTML = '';
        this.cells = [];
        const cellSize = this.calculateOptimalCellSize();
        this.gridContainer.style.width = `${cellSize * this.config.width}px`;
        this.gridContainer.style.height = `${cellSize * this.config.height}px`;
        this.gridElement.style.gridTemplateColumns = `repeat(${this.config.width}, ${cellSize}px)`;
        this.gridElement.style.gridTemplateRows = `repeat(${this.config.height}, ${cellSize}px)`;
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                const cell = this.createCell(x, y);
                this.gridElement.appendChild(cell);
                this.cells.push(cell);
            }
        }
        this.config.cellSize = cellSize;
        Utils.log('debug', `Grid created: ${this.config.width}x${this.config.height}, cell size: ${cellSize}px`);
    }
    createCell(x, y) {
        const cell = Utils.createCellElement(x, y);
        cell.addEventListener('click', (e) => this.handleCellClick(e, x, y));
        cell.addEventListener('mouseenter', (e) => this.handleCellHover(e, x, y));
        cell.addEventListener('mouseleave', (e) => this.handleCellLeave(e, x, y));
        return cell;
    }
    calculateOptimalCellSize() {
        const wrapperRect = this.gridWrapper.getBoundingClientRect();
        const padding = 40;
        const bottomPadding = 100; 
        const availableWidth = wrapperRect.width - padding;
        const availableHeight = wrapperRect.height - padding - bottomPadding;
        const maxCellWidth = availableWidth / this.config.width;
        const maxCellHeight = availableHeight / this.config.height;
        return Math.floor(Math.min(maxCellWidth, maxCellHeight, 100));
    }
    setupEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }
    handleResize() {
        const oldCellSize = this.config.cellSize;
        this.create();
        if (oldCellSize !== this.config.cellSize && this.onGridResize) {
            this.onGridResize(this.config.cellSize);
        }
    }
    handleCellClick(event, x, y) {
        if (this.onCellClick) {
            this.onCellClick(x, y, event);
        }
    }
    handleCellHover(event, x, y) {
        if (this.onCellHover) {
            this.onCellHover(x, y, event);
        }
    }
    handleCellLeave(event, x, y) {
    }
    getCell(x, y) {
        if (!Utils.isValidPosition(x, y, this.config.width, this.config.height)) {
            return null;
        }
        const index = Utils.getGridIndex(x, y, this.config.width);
        return this.cells[index];
    }
    getCells() {
        return this.cells;
    }
    setTargetCell(x, y) {
        if (this.targetCell) {
            this.targetCell.classList.remove('target');
        }
        this.targetCell = this.getCell(x, y);
        if (this.targetCell) {
            this.targetCell.classList.add('target');
        }
    }
    highlightCell(x, y, className) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.classList.add(className);
            this.highlightedCells.add({ cell, className });
        }
    }
    unhighlightCell(x, y, className) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.classList.remove(className);
        }
    }
    clearHighlights() {
        this.highlightedCells.forEach(({ cell, className }) => {
            cell.classList.remove(className);
        });
        this.highlightedCells.clear();
    }
    clearHighlightClass(className) {
        this.cells.forEach(cell => {
            cell.classList.remove(className);
        });
    }
    resize(width, height) {
        const validated = Utils.validateGridSize(width, height);
        this.config.width = validated.width;
        this.config.height = validated.height;
        this.create();
        if (this.onGridResize) {
            this.onGridResize(this.config.cellSize);
        }
        Utils.log('debug', `Grid resized to: ${this.config.width}x${this.config.height}`);
    }
    getDimensions() {
        return {
            width: this.config.width,
            height: this.config.height,
            cellSize: this.config.cellSize
        };
    }
    getBounds() {
        const rect = this.gridContainer.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
        };
    }
    gridToPixel(x, y) {
        return {
            x: x * this.config.cellSize + this.config.cellSize / 2,
            y: y * this.config.cellSize + this.config.cellSize / 2
        };
    }
    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.config.cellSize),
            y: Math.floor(pixelY / this.config.cellSize)
        };
    }
    animateCell(x, y, animationClass, duration = 1000) {
        const cell = this.getCell(x, y);
        if (!cell) return;
        cell.classList.add(animationClass);
        setTimeout(() => {
            cell.classList.remove(animationClass);
        }, duration);
    }
    applyTheme(theme) {
        this.gridElement.setAttribute('data-theme', theme);
        this.gridContainer.setAttribute('data-theme', theme);
    }
    getState() {
        return {
            width: this.config.width,
            height: this.config.height,
            cellSize: this.config.cellSize,
            targetCell: this.targetCell ? {
                x: parseInt(this.targetCell.dataset.x),
                y: parseInt(this.targetCell.dataset.y)
            } : null
        };
    }
    setState(state) {
        if (state.width && state.height) {
            this.resize(state.width, state.height);
        }
        if (state.targetCell) {
            this.setTargetCell(state.targetCell.x, state.targetCell.y);
        }
    }
    destroy() {
        this.cells.forEach(cell => {
            cell.replaceWith(cell.cloneNode(true));
        });
        this.cells = [];
        this.highlightedCells.clear();
        if (this.gridElement) {
            this.gridElement.innerHTML = '';
        }
    }
}
window.Grid = Grid;