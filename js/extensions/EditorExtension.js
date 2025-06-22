class EditorExtension extends Extension {
    init() {
        this.createEditorFAB();
        this.createEditorPanel();
        this.createActionButtons();
        this.observe('mode', (mode) => {
            const isEditing = mode === 'edit';
            this.elements.fab.classList.toggle('editing', isEditing);
            this.elements.panel.classList.toggle('show', isEditing);
            this.updateActionButtons(isEditing);
        });
        this.on('editor:close', () => this.app.toggleMode('play'));
    }
    createEditorFAB() {
        this.elements.fab = this.createElement('button', {
            className: 'fab',
            id: 'fab',
            textContent: '✏️',
            onclick: () => this.app.toggleMode('edit')
        });
        this.app.getContainer().appendChild(this.elements.fab);
    }
    createActionButtons() {
        const container = this.createElement('div', { className: 'action-buttons' });
        const buttons = [
            { id: 'clear-btn', icon: '🗑️', title: 'Limpiar Mapa', action: () => this.clearMap() },
            { id: 'save-btn', icon: '💾', title: 'Guardar Mapa', action: () => this.emit('modal:show', 'save') },
            { id: 'load-btn', icon: '📁', title: 'Cargar Mapa', action: () => this.emit('modal:show', 'load') }
        ];
        buttons.forEach(({ id, icon, title, action }) => {
            const btn = this.createElement('button', {
                className: 'action-btn hidden',
                id,
                title,
                textContent: icon,
                onclick: action
            });
            container.appendChild(btn);
            this.elements[id] = btn;
        });
        this.app.getContainer().appendChild(container);
    }
    updateActionButtons(show) {
        ['clear-btn', 'save-btn', 'load-btn'].forEach(id => {
            this.elements[id]?.classList.toggle('hidden', !show);
        });
    }
    createEditorPanel() {
        const panel = this.createElement('div', {
            className: 'editor-panel',
            id: 'editor-panel'
        });
        const tabs = this.createElement('div', { className: 'tabs' });
        const tabButtons = [
            { id: 'place', label: 'Colocar Items' },
            { id: 'types', label: 'Editar Tipos' },
            { id: 'settings', label: 'Configuración' }
        ];
        tabButtons.forEach(({ id, label }, i) => {
            const btn = this.createElement('button', {
                className: `tab-btn ${i === 0 ? 'active' : ''}`,
                dataset: { tab: id },
                textContent: label,
                onclick: () => this.emit('editor:switchTab', id)
            });
            tabs.appendChild(btn);
        });
        panel.appendChild(tabs);
        this.app.getContainer().appendChild(panel);
        this.elements.panel = panel;
        this.on('editor:switchTab', (tab) => {
            document.querySelectorAll('#editor-panel .tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tab);
            });
        });
    }
    clearMap() {
        if (!confirm('¿Limpiar todo el mapa?')) return;
        const dims = this.state.getMapDimensions();
        const newMap = Array(dims.rows).fill(0).map(() => Array(dims.cols).fill(0));
        this.state.set('mapData.map', newMap);
    }
}