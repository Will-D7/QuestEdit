class InfoPanelExtension extends Extension {
    init() {
        this.createInfoPanel();
        this.observe('scale', () => this.updateZoom());
        this.observe('activeCell', () => this.updateCell());
        this.observe('mode', () => this.updateMode());
        this.observe('mapData.map', () => this.updateGridSize());
        this.updateAll();
    }
    createInfoPanel() {
        const panel = this.createElement('div', {
            className: 'controls',
            style: {
                position: 'fixed',
                top: '10px',
                right: '10px'
            }
        });
        const createLine = (label, id) => {
            const line = this.createElement('div', {}, [
                this.createElement('strong', {}, [label + ': ']),
                this.createElement('span', { id })
            ]);
            panel.appendChild(line);
            return line;
        };
        createLine('Cuadrícula', 'grid-size');
        createLine('Zoom', 'zoom');
        createLine('Celda', 'cell');
        createLine('Modo', 'mode');
        this.app.getContainer().appendChild(panel);
        this.elements.panel = panel;
    }
    updateGridSize() {
        const dims = this.state.getMapDimensions();
        const el = document.getElementById('grid-size');
        if (el) el.textContent = `${dims.cols}×${dims.rows}`;
    }
    updateZoom() {
        const scale = this.state.get('scale');
        const el = document.getElementById('zoom');
        if (el) el.textContent = `${Math.round(scale * 100)}%`;
    }
    updateCell() {
        const cell = this.state.get('activeCell');
        const el = document.getElementById('cell');
        if (el) el.textContent = `${cell.x},${cell.y}`;
    }
    updateMode() {
        const mode = this.state.getMode();
        const el = document.getElementById('mode');
        if (el) el.textContent = mode;
    }
    updateAll() {
        this.updateGridSize();
        this.updateZoom();
        this.updateCell();
        this.updateMode();
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'infoPanel',
    constructor: InfoPanelExtension
});
