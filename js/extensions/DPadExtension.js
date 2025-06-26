class DPadExtension extends Extension {
    init() {
        this.enabled = true;
        this.createDPad();
        this.setupKeyboardControls();
        this.observe('mode', (mode) => {
            this.enabled = mode === 'play';
            this.updateVisibility();
        });
        this.observe('program.running', (running) => {
            this.updateControls(!running);
        });
    }
    createDPad() {
        const dpad = this.createElement('div', {
            className: 'dpad'
        });
        const directions = [
            { dir: 'up', symbol: '↑', className: 'dpad-up' },
            { dir: 'down', symbol: '↓', className: 'dpad-down' },
            { dir: 'left', symbol: '←', className: 'dpad-left' },
            { dir: 'right', symbol: '→', className: 'dpad-right' }
        ];
        directions.forEach(({ dir, symbol, className }) => {
            const btn = this.createElement('button', {
                className: `dpad-btn ${className}`,
                dataset: { dir },
                textContent: symbol,
                onclick: () => this.handleDirection(dir)
            });
            dpad.appendChild(btn);
            this.elements[`btn${dir}`] = btn;
        });
        const centerBtn = this.createElement('button', {
            className: 'dpad-btn dpad-center',
            id: 'pick-drop',
            textContent: '✋',
            title: 'Agarrar',
            onclick: () => this.handleInteract()
        });
        dpad.appendChild(centerBtn);
        this.elements.centerBtn = centerBtn;
        const switchBtn = this.createElement('button', {
            className: 'hero-switch-btn',
            id: 'hero-switch',
            title: 'Cambiar héroe',
            textContent: '👤',
            onclick: () => this.emit('hero:switch')
        });
        this.app.getContainer().appendChild(dpad);
        this.app.getContainer().appendChild(switchBtn);
        this.elements.dpad = dpad;
        this.elements.switchBtn = switchBtn;
    }
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled || this.state.get('program.running')) return;
            switch(e.key) {
                case 'ArrowUp':
                    this.handleDirection('up');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.handleDirection('down');
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.handleDirection('left');
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.handleDirection('right');
                    e.preventDefault();
                    break;
                case ' ':
                    this.handleInteract();
                    e.preventDefault();
                    break;
            }
        });
    }
    handleDirection(dir) {
        if (this.enabled && !this.state.get('program.running')) {
            this.emit('hero:move', dir);
        }
    }
    handleInteract() {
        if (this.enabled && !this.state.get('program.running')) {
            this.emit('hero:interact');
        }
    }
    updateControls(enabled) {
        const opacity = enabled ? '' : '0.5';
        Object.values(this.elements).forEach(el => {
            if (el && el.classList && el.classList.contains('dpad-btn')) {
                el.style.opacity = opacity;
            }
        });
    }
    updateVisibility() {
        const show = this.state.get('mode') === 'play';
        this.dom.toggle(this.elements.dpad, show);
        this.dom.toggle(this.elements.switchBtn, show);
    }
}