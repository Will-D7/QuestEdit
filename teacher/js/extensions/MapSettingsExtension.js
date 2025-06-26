class MapSettingsExtension extends Extension {
    init() {
        this.createSettingsTab();
        this.on('editor:switchTab', (tab) => {
            this.elements.container?.classList.toggle('active', tab === 'settings');
        });
    }
    createSettingsTab() {
        const container = this.createElement('div', {
            className: 'tab-content',
            dataset: { content: 'settings' }
        });
        const categoryGroup = this.createTextField({
            id: 'category',
            label: 'Categoría:',
            placeholder: 'Ej: Matemáticas, Lógica, etc.',
            value: this.state.get('mapData.category') || ''
        });
        const difficultyGroup = this.createSelectField({
            id: 'difficulty',
            label: 'Dificultad:',
            value: this.state.get('mapData.difficulty') || 'medio',
            options: [
                { value: 'facil', text: 'Fácil' },
                { value: 'medio', text: 'Medio' },
                { value: 'dificil', text: 'Difícil' },
                { value: 'experto', text: 'Experto' }
            ]
        });
        const descriptionGroup = this.createTextareaField({
            id: 'description',
            label: 'Descripción:',
            placeholder: 'Descripción del mapa o instrucciones...',
            value: this.state.get('mapData.description') || ''
        });
        container.appendChild(categoryGroup);
        container.appendChild(difficultyGroup);
        container.appendChild(descriptionGroup);
        const editorPanel = document.getElementById('editor-panel');
        if (editorPanel) {
            editorPanel.appendChild(container);
        }
        this.elements.container = container;
    }
    createTextField({ id, label, placeholder, value }) {
        const group = this.createElement('div', { className: 'form-group' });
        group.appendChild(this.createElement('label', {}, [label]));
        const input = this.createElement('input', {
            type: 'text',
            id: `map-${id}`,
            placeholder,
            value,
            oninput: (e) => this.state.set(`mapData.${id}`, e.target.value)
        });
        group.appendChild(input);
        return group;
    }
    createSelectField({ id, label, value, options }) {
        const group = this.createElement('div', { className: 'form-group' });
        group.appendChild(this.createElement('label', {}, [label]));
        const select = this.createElement('select', {
            id: `map-${id}`,
            onchange: (e) => this.state.set(`mapData.${id}`, e.target.value)
        });
        options.forEach(opt => {
            const option = this.createElement('option', {
                value: opt.value,
                textContent: opt.text
            });
            if (opt.value === value) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        group.appendChild(select);
        return group;
    }
    createTextareaField({ id, label, placeholder, value }) {
        const group = this.createElement('div', { className: 'form-group' });
        group.appendChild(this.createElement('label', {}, [label]));
        const textarea = this.createElement('textarea', {
            id: `map-${id}`,
            placeholder,
            style: { minHeight: '100px' },
            value,
            oninput: (e) => this.state.set(`mapData.${id}`, e.target.value)
        });
        group.appendChild(textarea);
        return group;
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'mapSettings',
    constructor: MapSettingsExtension
});
