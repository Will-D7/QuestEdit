class App {
    constructor() {
        this.state = new State();
        this.eventBus = new EventBus();
        this.gameLoop = new GameLoop();
        this.extensions = new Map();
        this.container = null;
    }
    init() {
        this.container = DOMManager.createElement('div', {
            id: 'game-container',
            className: 'game-container'
        });
        document.getElementById('app').appendChild(this.container);
        this.discoverExtensions();
        this.extensions.forEach(ext => {
            try {
                ext.init();
            } catch (error) {
                console.error(`[App] Failed to initialize extension ${ext.constructor.name}:`, error);
            }
        });
        this.setupCoreEvents();
        this.gameLoop.start();
        this.eventBus.emit('app:ready');
    }
    discoverExtensions() {
        if (!window.__extensions || window.__extensions.length === 0) {
            console.warn('[App] No extensions found in global registry');
            return;
        }
        window.__extensions.forEach(({name, constructor}) => {
            try {
                const extension = this.loadExtension(name, constructor);
            } catch (error) {
                console.error(`[App] Failed to load extension ${name}:`, error);
            }
        });
    }
    loadExtension(name, ExtensionClass) {
        if (this.extensions.has(name)) {
            console.warn(`Extension ${name} already loaded`);
            return;
        }
        const extension = new ExtensionClass(this);
        this.extensions.set(name, extension);
        if (typeof extension.update === 'function') {
            this.gameLoop.register((dt, time) => {
                if (extension.enabled) {
                    extension.update(dt, time);
                }
            });
        }
        return extension;
    }
    getExtension(name) {
        return this.extensions.get(name);
    }
    unloadExtension(name) {
        const extension = this.extensions.get(name);
        if (extension) {
            extension.destroy();
            this.extensions.delete(name);
        }
    }
    setupCoreEvents() {
        this.eventBus.on('mode:change', (mode) => {
            const prevMode = this.state.get('mode');
            this.state.set('mode', mode);
            if (mode === 'edit' && prevMode === 'program') {
                this.eventBus.emit('programming:stop');
            } else if (mode === 'program' && prevMode === 'edit') {
                this.eventBus.emit('editor:close');
            }
        });
        window.addEventListener('resize', () => {
            this.eventBus.emit('viewport:resize');
        });
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    toggleMode(mode) {
        const current = this.state.get('mode');
        if (current === mode) {
            this.eventBus.emit('mode:change', 'play');
        } else {
            this.eventBus.emit('mode:change', mode);
        }
    }
    getContainer() {
        return this.container;
    }
}
window.app = new App();
app.init();