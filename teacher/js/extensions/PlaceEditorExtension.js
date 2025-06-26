class PlaceEditorExtension extends Extension {
    init() {
        this.createPlaceTab();
        this.on('editor:switchTab', (tab) => {
            this.elements.container?.classList.toggle('active', tab === 'place');
        });
		this.on('editor:cellClick', (cell) => this.handleCellClick(cell));
        this.observe('editor', () => this.updateItemTypesGrid());
        this.observe('mapData.itemTypes', () => this.updateItemTypesGrid());
    }
    createPlaceTab() {
        const container = this.createElement('div', {
            className: 'tab-content active',
            dataset: { content: 'place' }
        });
        const grid = this.createElement('div', {
            className: 'item-types-grid',
            id: 'item-types-grid'
        });
        const textGroup = this.createElement('div', { className: 'form-group' }, [
            this.createElement('label', {}, ['Texto del Item (opcional):']),
            this.createElement('input', {
                type: 'text',
                id: 'item-text',
                placeholder: 'Ingresa texto o emoji',
                value: this.state.get('editor.itemText') || '',
                oninput: (e) => this.state.set('editor.itemText', e.target.value)
            })
        ]);
        const btnGroup = this.createElement('div', { className: 'btn-group' }, [
            this.createElement('button', {
                className: 'btn btn-secondary',
                id: 'eraser-btn',
                textContent: '🧹 Modo Borrador',
                onclick: () => this.toggleEraserMode()
            })
        ]);
        container.appendChild(grid);
        container.appendChild(textGroup);
        container.appendChild(btnGroup);
        const editorPanel = document.getElementById('editor-panel');
        if (editorPanel) {
            editorPanel.appendChild(container);
        }
        this.elements.container = container;
        this.elements.itemTypesGrid = grid;
        this.elements.eraserBtn = btnGroup.firstChild;
        this.updateItemTypesGrid();
    }
    updateItemTypesGrid() {
        const grid = this.elements.itemTypesGrid;
        if (!grid) return;
        this.dom.clearElement(grid);
        const selectedType = this.state.get('editor.selectedType');
        const eraserMode = this.state.get('editor.eraserMode');
        const itemTypes = this.state.get('mapData.itemTypes');
        Object.entries(itemTypes).forEach(([type, props]) => {
            const btn = this.createElement('button', {
                className: `item-type-btn ${selectedType === type && !eraserMode ? 'selected' : ''}`,
                dataset: { type },
                style: {
                    backgroundColor: props.color,
                    opacity: props.transparency,
                    borderStyle: props.borderType,
                    borderColor: props.borderColor
                },
                onclick: () => {
                    this.state.set('editor.selectedType', type);
                    this.state.set('editor.eraserMode', false);
                    this.updateItemTypesGrid();
                }
            }, [
                this.createElement('div', {
                    className: 'item-type-label',
                    textContent: type
                })
            ]);
            grid.appendChild(btn);
        });
    }
    toggleEraserMode() {
        const eraserMode = !this.state.get('editor.eraserMode');
        this.state.set('editor.eraserMode', eraserMode);
        this.elements.eraserBtn.textContent = eraserMode ? '✏️ Modo Dibujo' : '🧹 Modo Borrador';
        this.elements.eraserBtn.classList.toggle('btn-primary', eraserMode);
        this.updateItemTypesGrid();
    }
    handleCellClick(cell) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        if (this.state.get('editor.eraserMode')) {
            this.state.set(`mapData.map.${y}.${x}`, 0);
        } else {
            const type = this.state.get('editor.selectedType');
            const text = this.state.get('editor.itemText') || '';
            const cellData = `${type}${text ? ':' + text : ''}`;
            const current = this.state.get(`mapData.map.${y}.${x}`);
            this.state.set(`mapData.map.${y}.${x}`, 
                current && current !== 0 ? `${current},${cellData}` : cellData);
        }
        this.emit('grid:render');
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'placeEditor',
    constructor: PlaceEditorExtension
});
