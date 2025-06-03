class FloatingControls {
    constructor(options = {}) {
        this.options = {
            containerId: null,
            parentElement: document.body,
            arrangement: 'grid', 
            buttonsPerRow: 3,
            minWidth: 0,
            minHeight: 0,
            buttonSize: 50,
            gap: 5,
            padding: 10,
            backgroundColor: '#8B5CF6',
            hoverColor: '#A78BFA',
            textColor: 'white',
            borderRadius: 10,
            fontSize: 20,
            position: { bottom: 20, right: 20 },
            draggable: true,
            opacity: 0.75,
            hoverOpacity: 0.9,
            focusOnInteraction: true,
            buttons: [],
            inputs: [],
            onButtonClick: null,
            onInputChange: null,
            onFocus: null,
            onBlur: null,
            ...options
        };
        this.element = null;
        this.dragInstance = null;
        this.buttons = [];
        this.inputs = [];
        this.isExpanded = false;
        this.originalDimensions = null;
        this.originalButtons = null;
        this.expandedButtons = null;
        this.outsideClickOverlay = null;
        this.init();
    }
    init() {
        this.createElement();
        this.createContent();
        this.applyStyles();
        this.setupEventListeners();
        this.setupDragging();
        this.setupFocus();
    }
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'floating-controls';
        if (this.options.containerId) {
            this.element.id = this.options.containerId;
        } else {
            this.element.id = 'floating-controls-' + Math.random().toString(36).substr(2, 9);
        }
        this.options.parentElement.appendChild(this.element);
    }
    createContent() {
        this.element.innerHTML = '';
        this.buttons = [];
        this.inputs = [];
        this.options.inputs.forEach(inputConfig => {
            const input = this.createInput(inputConfig);
            this.inputs.push(input);
            this.element.appendChild(input);
        });
        if (this.options.buttons.length > 0) {
            const buttonsContainer = this.createButtonsContainer();
            this.element.appendChild(buttonsContainer);
        }
    }
    createInput(inputConfig) {
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';
        if (inputConfig.label) {
            const label = document.createElement('label');
            label.textContent = inputConfig.label;
            label.style.cssText = `
                color: ${this.options.textColor};
                font-size: ${this.options.fontSize * 0.7}px;
            `;
            inputWrapper.appendChild(label);
        }
        const input = document.createElement('input');
        input.type = inputConfig.type || 'text';
        input.placeholder = inputConfig.placeholder || '';
        input.value = inputConfig.value || '';
        input.style.cssText = `
            border-radius: ${this.options.borderRadius * 0.5}px;
            font-size: ${this.options.fontSize * 0.8}px;
            margin-bottom: ${this.options.gap}px;
        `;
        if (inputConfig.onChange) {
            input.addEventListener('input', (e) => {
                inputConfig.onChange(e.target.value, e);
            });
        }
        inputWrapper.appendChild(input);
        return inputWrapper;
    }
    createButtonsContainer() {
        const container = document.createElement('div');
        container.className = `buttons-container ${this.options.arrangement}`;
        const layoutStyles = this.getLayoutStyles();
        Object.assign(container.style, layoutStyles);
        this.options.buttons.forEach((buttonConfig, index) => {
            const button = this.createButton(buttonConfig, index);
            this.buttons.push(button);
            container.appendChild(button);
        });
        return container;
    }
    getLayoutStyles() {
        const { arrangement, buttonsPerRow, gap, buttonSize } = this.options;
        const baseStyles = {
            gap: `${gap}px`
        };
        switch (arrangement) {
            case 'horizontal':
                return {
                    ...baseStyles,
                    display: 'flex',
                    flexDirection: 'row'
                };
            case 'vertical':
                return {
                    ...baseStyles,
                    display: 'flex',
                    flexDirection: 'column'
                };
            case 'grid':
            default:
                return {
                    ...baseStyles,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${buttonsPerRow}, ${buttonSize}px)`
                };
        }
    }
    createButton(buttonConfig, index) {
        const button = document.createElement('button');
        button.className = 'float-control-btn';
        button.textContent = buttonConfig.text || buttonConfig.label || '';
        button.dataset.action = buttonConfig.action || '';
        button.dataset.index = index;
        button.style.cssText = `
            background: linear-gradient(135deg, ${this.options.backgroundColor} 0%, ${this.options.hoverColor} 100%);
            color: ${this.options.textColor};
            border-radius: ${this.options.borderRadius}px;
            width: ${this.options.buttonSize}px;
            height: ${this.options.buttonSize}px;
            font-size: ${this.options.fontSize}px;
        `;
        if (buttonConfig.gridPosition && this.options.arrangement === 'grid') {
            button.style.gridColumn = buttonConfig.gridPosition.column;
            button.style.gridRow = buttonConfig.gridPosition.row;
        }
        return button;
    }
    applyStyles() {
        const { minWidth, minHeight, padding, borderRadius, position, opacity } = this.options;
        this.element.style.cssText += `
            min-width: ${minWidth}px;
            min-height: ${minHeight}px;
            padding: ${padding}px;
            border-radius: ${borderRadius}px;
            opacity: ${opacity};
            ${position.bottom !== undefined ? `bottom: ${position.bottom}px;` : ''}
            ${position.top !== undefined ? `top: ${position.top}px;` : ''}
            ${position.left !== undefined ? `left: ${position.left}px;` : ''}
            ${position.right !== undefined ? `right: ${position.right}px;` : ''}
        `;
    }
    setupEventListeners() {
        this.element.addEventListener('mouseenter', () => {
            this.element.style.opacity = this.options.hoverOpacity;
        });
        this.element.addEventListener('mouseleave', () => {
            this.element.style.opacity = this.options.opacity;
        });
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('float-control-btn')) {
                const action = e.target.dataset.action;
                const index = parseInt(e.target.dataset.index);
                if (this.options.onButtonClick) {
                    this.options.onButtonClick(action, index, e);
                }
            }
        });
    }
    setupDragging() {
        if (this.options.draggable) {
            this.dragInstance = new DragDrop(this.element, {
                savePosition: true,
                storageKey: this.element.id + '_position',
                excludeElements: ['.float-control-btn', 'input'],
                hoverEffects: false,
                dragThreshold: 5,
                draggingClass: 'dragging'
            });
        }
    }
    setupFocus() {
        if (!this.options.focusOnInteraction) return;
        this.element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('float-control-btn') || 
                e.target.tagName === 'INPUT') {
                return;
            }
            const parent = this.element.parentNode;
            if (parent) {
                parent.removeChild(this.element);
                parent.appendChild(this.element);
            }
        });
    }
    setPosition(x, y) {
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
    }
    show() {
        this.element.style.display = 'block';
    }
    hide() {
        this.element.style.display = 'none';
    }
    destroy() {
        if (this.dragInstance) {
            this.dragInstance.destroy();
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}