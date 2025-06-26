class KeyboardExtension extends Extension {
    init() {
        this.enabled = true;
        this.setupKeyboardControls();
        this.observe('mode', (mode) => {
            this.enabled = mode === 'play';
        });
        this.observe('program.running', (running) => {
            // Track enabled state for key handling
        });
    }
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled || this.state.get('program.running')) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.emit('hero:move', 'up');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.emit('hero:move', 'down');
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.emit('hero:move', 'left');
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.emit('hero:move', 'right');
                    e.preventDefault();
                    break;
                case ' ':
                    this.emit('hero:interact');
                    e.preventDefault();
                    break;
                case 'h': // New hero switch key
                case 'H':
                    this.emit('hero:switch');
                    e.preventDefault();
                    break;
            }
        });
    }
}
window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'keyboard',
    constructor: KeyboardExtension
});