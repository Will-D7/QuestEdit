class GridExtension extends Extension {
    init() {
        this.cells = [];
        this.on('app:ready', () => {
            this.createGrid();
            this.renderMap();
            this.emit('viewport:center');
        });
        this.observe('mapData.map', () => this.renderMap());
        this.observe('activeCell', () => this.updateActiveCell());
        this.on('grid:render', () => this.renderMap());
    }
    createGrid() {
        const container = document.getElementById('grid-container');
        const grid = this.createElement('div', { className: 'grid' });
        const { cols, rows } = this.state.getMapDimensions();
        grid.style.gridTemplateColumns = `repeat(${cols}, ${Config.CELL_SIZE}px)`;
        this.cells = [];
        for (let y = 0; y < rows; y++) {
            this.cells[y] = [];
            for (let x = 0; x < cols; x++) {
                const cell = this.createCell(x, y);
                grid.appendChild(cell);
                this.cells[y][x] = cell;
            }
        }
        container.appendChild(grid);
        this.elements.grid = grid;
    }
    createCell(x, y) {
        return this.createElement('div', {
            className: 'cell',
            dataset: { x, y }
        });
    }
    renderMap() {
        if (!this.cells.length) return;
        this.cells.forEach(row => {
            row.forEach(cell => {
                cell.querySelectorAll('.game-item').forEach(item => item.remove());
            });
        });
        const { map, itemTypes } = this.state.get('mapData');
        map.forEach((row, y) => {
            row.forEach((cellData, x) => {
                if (cellData && cellData !== 0) {
                    const items = this.parseCellData(cellData);
                    items.forEach(item => {
                        const element = this.createGameItem(item, itemTypes[item.type]);
                        if (this.cells[y] && this.cells[y][x]) {
                            this.cells[y][x].appendChild(element);
                        }
                    });
                }
            });
        });
    }
    parseCellData(cellData) {
        const items = [];
        const parts = cellData.toString().split(',');
        parts.forEach(part => {
            const match = part.match(/^([A-Z]):?(.*)$/);
            if (match) {
                items.push({
                    type: match[1],
                    text: match[2] || ''
                });
            }
        });
        return items;
    }
    createGameItem(item, props) {
        const element = this.createElement('div', { className: 'game-item' });
        const width = parseFloat(props.width) * Config.CELL_SIZE / 100;
        const height = parseFloat(props.height) * Config.CELL_SIZE / 100;
        Object.assign(element.style, {
            width: `${width}px`,
            height: `${height}px`,
            left: `${(Config.CELL_SIZE - width) / 2}px`,
            top: `${(Config.CELL_SIZE - height) / 2}px`,
            backgroundColor: props.color,
            opacity: props.transparency
        });
        if (props.borderType !== 'none') {
            Object.assign(element.style, {
                borderStyle: props.borderType,
                borderWidth: `${props.borderWidth}px`,
                borderColor: props.borderColor
            });
        }
        if (item.text) {
            const textEl = this.createElement('div', {
                className: 'game-item-text' + 
                    (item.text.length > 5 ? ' small' : '') +
                    (item.text.length > 10 ? ' tiny' : ''),
                textContent: item.text
            });
            element.appendChild(textEl);
        }
        return element;
    }
    updateActiveCell() {
        this.cells.forEach(row => {
            row.forEach(cell => cell.classList.remove('active'));
        });
        const { x, y } = this.state.get('activeCell');
        if (this.cells[y] && this.cells[y][x]) {
            this.cells[y][x].classList.add('active');
        }
    }
    getCellAt(x, y) {
        return this.cells[y]?.[x];
    }
}