class TypeEditorExtension extends Extension {
    init() {
        this.createTypeEditorTab();
        this.on('editor:switchTab', (tab) => {
            this.elements.container?.classList.toggle('active', tab === 'types');
        });
        this.observe('mapData.itemTypes', () => this.updateTypeSelector());
    }
    createTypeEditorTab() {
        const container = this.createElement('div', {
            className: 'tab-content',
            dataset: { content: 'types' }
        });
        const typeSelect = this.createElement('select', {
            id: 'type-selector',
            onchange: (e) => this.loadTypeSettings(e.target.value)
        });
        const typeGroup = this.createElement('div', { className: 'form-group' }, [
            this.createElement('label', {}, ['Seleccionar Tipo:']),
            typeSelect
        ]);
        const sizeGroup = this.createRangeControl({
            id: 'size',
            label: 'Tamaño (%):',
            min: '10',
            max: '100',
            step: '10',
            suffix: '%',
            handler: (value) => {
                this.updateTypeProperty('width', `${value}%`);
                this.updateTypeProperty('height', `${value}%`);
            }
        });
        const colorGroup = this.createColorControl({
            id: 'color',
            label: 'Color:',
            handler: (value) => this.updateTypeProperty('color', value)
        });
        const transparencyGroup = this.createRangeControl({
            id: 'transparency',
            label: 'Transparencia:',
            min: '0',
            max: '1',
            step: '0.1',
            handler: (value) => this.updateTypeProperty('transparency', parseFloat(value))
        });
        const borderGroup = this.createSelectControl({
            id: 'border',
            label: 'Borde:',
            options: [
                { value: 'none', text: 'Ninguno' },
                { value: 'solid', text: 'Sólido' },
                { value: 'dashed', text: 'Discontinuo' },
                { value: 'double', text: 'Doble' }
            ],
            handler: (value) => this.updateTypeProperty('borderType', value)
        });
        const propsGroup = this.createElement('div', { className: 'form-group' }, [
            this.createElement('label', {}, ['Propiedades:'])
        ]);
        const props = [
            { id: 'pickable', label: 'Recogible' },
            { id: 'stepable', label: 'Pisable' },
            { id: 'stackable', label: 'Apilable' },
            { id: 'allowBiggerToStack', label: 'Permitir apilar más grande' }
        ];
        props.forEach(({ id, label }) => {
            const checkbox = this.createElement('label', {}, [
                this.createElement('input', {
                    type: 'checkbox',
                    id: `type-${id}`,
                    onchange: (e) => this.updateTypeProperty(id, e.target.checked)
                }),
                ' ' + label
            ]);
            propsGroup.appendChild(checkbox);
            propsGroup.appendChild(this.createElement('br'));
        });
        const addBtn = this.createElement('button', {
            className: 'btn btn-primary',
            textContent: '➕ Agregar Nuevo Tipo',
            onclick: () => this.addNewType()
        });
        container.appendChild(typeGroup);
        container.appendChild(sizeGroup);
        container.appendChild(colorGroup);
        container.appendChild(transparencyGroup);
        container.appendChild(borderGroup);
        container.appendChild(propsGroup);
        container.appendChild(addBtn);
        const editorPanel = document.getElementById('editor-panel');
        if (editorPanel) {
            editorPanel.appendChild(container);
        }
        this.elements.container = container;
        this.elements.typeSelector = typeSelect;
        this.updateTypeSelector();
    }
    createRangeControl({ id, label, min, max, step, suffix = '', handler }) {
        const group = this.createElement('div', { className: 'form-group' });
        group.appendChild(this.createElement('label', {}, [label]));
        const input = this.createElement('input', {
            type: 'range',
            id: `type-${id}`,
            min,
            max,
            step,
            oninput: (e) => {
                handler(e.target.value);
                const valueEl = document.getElementById(`${id}-value`);
                if (valueEl) valueEl.textContent = e.target.value + suffix;
            }
        });
        const valueSpan = this.createElement('span', {
            id: `${id}-value`
        });
        group.appendChild(input);
        group.appendChild(valueSpan);
        return group;
    }
    createColorControl({ id, label, handler }) {
        const group = this.createElement('div', { className: 'form-group' });
        group.appendChild(this.createElement('label', {}, [label]));
        const wrapper = this.createElement('div', { className: 'color-input-wrapper' });
        const input = this.createElement('input', {
            type: 'color',
            id: `type-${id}`,
            oninput: (e) => {
                handler(e.target.value);
                const preview = document.getElementById('color-preview');
                if (preview) preview.style.backgroundColor = e.target.value;
            }
        });
        const preview = this.createElement('div', {
            className: 'color-preview',
            id: 'color-preview'
        });
        wrapper.appendChild(input);
        wrapper.appendChild(preview);
        group.appendChild(wrapper);
        return group;
    }
    createSelectControl({ id, label, options, handler }) {
        const group = this.createElement('div', { className: 'form-group' });
        group.appendChild(this.createElement('label', {}, [label]));
        const select = this.createElement('select', {
            id: `type-${id}`,
            onchange: (e) => handler(e.target.value)
        });
        options.forEach(opt => {
            select.appendChild(this.createElement('option', {
                value: opt.value,
                textContent: opt.text
            }));
        });
        group.appendChild(select);
        return group;
    }
    updateTypeSelector() {
        const selector = this.elements.typeSelector;
        if (!selector) return;
        const current = selector.value;
        this.dom.clearElement(selector);
        Object.keys(this.state.get('mapData.itemTypes')).forEach(type => {
            const option = this.createElement('option', {
                value: type,
                textContent: `Tipo ${type}`
            });
            if (type === current) option.selected = true;
            selector.appendChild(option);
        });
        if (!current || !selector.value) {
            selector.value = Object.keys(this.state.get('mapData.itemTypes'))[0];
        }
        this.loadTypeSettings(selector.value);
    }
    loadTypeSettings(type) {
        const typeData = this.state.get(`mapData.itemTypes.${type}`);
        if (!typeData) return;
        const updates = {
            'type-size': { value: parseInt(typeData.width), suffix: '%' },
            'type-color': { value: typeData.color },
            'type-transparency': { value: typeData.transparency },
            'type-border': { value: typeData.borderType },
            'type-pickable': { checked: typeData.pickable },
            'type-stepable': { checked: typeData.stepable },
            'type-stackable': { checked: typeData.stackable },
            'type-allowBiggerToStack': { checked: typeData.allowBiggerToStack }
        };
        Object.entries(updates).forEach(([id, props]) => {
            const el = document.getElementById(id);
            if (!el) return;
            if ('checked' in props) {
                el.checked = props.checked;
            } else {
                el.value = props.value;
                if (id === 'type-size') {
                    const sizeVal = document.getElementById('size-value');
                    if (sizeVal) sizeVal.textContent = props.value + props.suffix;
                } else if (id === 'type-transparency') {
                    const transVal = document.getElementById('transparency-value');
                    if (transVal) transVal.textContent = props.value;
                } else if (id === 'type-color') {
                    const preview = document.getElementById('color-preview');
                    if (preview) preview.style.backgroundColor = props.value;
                }
            }
        });
    }
    updateTypeProperty(prop, value) {
        const type = this.elements.typeSelector.value;
        this.state.set(`mapData.itemTypes.${type}.${prop}`, value);
        this.emit('grid:render');
    }
    addNewType() {
        const types = Object.keys(this.state.get('mapData.itemTypes'));
        const newType = String.fromCharCode(65 + types.length);
        this.state.set(`mapData.itemTypes.${newType}`, {
            width: "50%",
            height: "50%",
            color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
            transparency: 1.0,
            borderType: "solid",
            borderWidth: 2,
            borderColor: "#333",
            pickable: true,
            stepable: false,
            stackable: true,
            allowBiggerToStack: false
        });
        this.updateTypeSelector();
        this.elements.typeSelector.value = newType;
        this.loadTypeSettings(newType);
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'typeEditor',
    constructor: TypeEditorExtension
});
