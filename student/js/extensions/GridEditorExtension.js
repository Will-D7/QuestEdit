class GridEditorExtension extends Extension {
    init() {
        this.createGridSizeTab();
        this.on('editor:switchTab', (tab) => {
            this.elements.container?.classList.toggle('active', tab === 'size');
        });
    }
    
    createGridSizeTab() {
        const container = this.createElement('div', {
            className: 'tab-content',
            dataset: { content: 'size' }
        });
        
        const warning = this.createElement('div', {
            className: 'warning-message',
            style: { 
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                border: '1px solid #ffeeba'
            },
            innerHTML: '<strong>⚠️ Atención:</strong> Cambiar el tamaño del grid eliminará elementos fuera del área nueva.'
        });
        
        const dimensionsGroup = this.createElement('div', { 
            className: 'form-group',
            style: { display: 'flex', gap: '15px' }
        });
        
        const rowsGroup = this.createNumberField({
            id: 'rows',
            label: 'Filas:',
            min: 5,
            max: 30,
            value: this.state.getMapDimensions().rows
        });
        
        const colsGroup = this.createNumberField({
            id: 'cols',
            label: 'Columnas:',
            min: 5,
            max: 30,
            value: this.state.getMapDimensions().cols
        });
        
        dimensionsGroup.appendChild(rowsGroup);
        dimensionsGroup.appendChild(colsGroup);
        
        const applyBtn = this.createElement('button', {
            className: 'btn btn-primary',
            style: { width: '100%', marginTop: '15px' },
            textContent: 'Aplicar Cambios',
            onclick: () => this.resizeGrid()
        });
        
        container.appendChild(warning);
        container.appendChild(dimensionsGroup);
        container.appendChild(applyBtn);
        
        const editorPanel = document.getElementById('editor-panel');
        if (editorPanel) {
            editorPanel.appendChild(container);
        }
        
        this.elements.container = container;
    }
    
    createNumberField({ id, label, min, max, value }) {
        const group = this.createElement('div', { className: 'form-group' });
        group.appendChild(this.createElement('label', {}, [label]));
        
        const input = this.createElement('input', {
            type: 'number',
            id: `grid-${id}`,
            min,
            max,
            value,
            style: { width: '100%', padding: '8px' },
            oninput: (e) => {
                let val = parseInt(e.target.value);
                if (val < min) val = min;
                if (val > max) val = max;
                e.target.value = val;
            }
        });
        
        group.appendChild(input);
        return group;
    }
    
    resizeGrid() {
        const newRows = parseInt(document.getElementById('grid-rows').value);
        const newCols = parseInt(document.getElementById('grid-cols').value);
        
        if (!newRows || !newCols) {
            alert('Por favor ingresa valores válidos');
            return;
        }
        
        const currentMap = [...this.state.get('mapData.map')];
        const newMap = [];
        
        // Create new grid with specified dimensions
        for (let y = 0; y < newRows; y++) {
            const newRow = [];
            for (let x = 0; x < newCols; x++) {
                // Copy existing cells or use 0 for new cells
                if (y < currentMap.length && x < currentMap[y].length) {
                    newRow.push(currentMap[y][x]);
                } else {
                    newRow.push(0);
                }
            }
            newMap.push(newRow);
        }
        
        // Update hero position if out of bounds
        const hero = this.state.get('hero');
        if (hero.x >= newCols || hero.y >= newRows) {
            this.state.set('hero', {
                ...hero,
                x: Math.min(hero.x, newCols - 1),
                y: Math.min(hero.y, newRows - 1)
            });
        }
        
        // Update active cell if out of bounds
        const activeCell = this.state.get('activeCell');
        if (activeCell.x >= newCols || activeCell.y >= newRows) {
            this.state.set('activeCell', {
                x: Math.min(activeCell.x, newCols - 1),
                y: Math.min(activeCell.y, newRows - 1)
            });
        }
        
        // Update state with new grid
        this.state.set('mapData.map', newMap);
        
        // Re-render grid and center view
        this.emit('grid:resize');
        this.emit('viewport:center');
        
        //alert(`Grid cambiado a ${newRows} filas × ${newCols} columnas`);
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'gridEditor',
    constructor: GridEditorExtension
});

