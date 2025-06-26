class Extension {
    constructor(app) {
        this.app = app;
        this.state = app.state;
        this.eventBus = app.eventBus;
        this.dom = DOMManager;
        this.elements = {};
        this.subscriptions = [];
        this.enabled = true;
    }
    init() {
    }
    destroy() {
        this.cleanup();
    }
    enable() {
        this.enabled = true;
        this.onEnable();
    }
    disable() {
        this.enabled = false;
        this.onDisable();
    }
    onEnable() {
    }
    onDisable() {
    }
    on(event, handler) {
        const unsubscribe = this.eventBus.on(event, handler);
        this.subscriptions.push(unsubscribe);
        return unsubscribe;
    }
    emit(event, data) {
        this.eventBus.emit(event, data);
    }
    observe(path, handler) {
        const unsubscribe = this.state.observe(path, handler);
        this.subscriptions.push(unsubscribe);
        return unsubscribe;
    }
    createElement(tag, attrs, children) {
        const el = this.dom.createElement(tag, attrs, children);
        if (attrs && attrs.id) {
            this.elements[attrs.id] = el;
        }
        return el;
    }
    cleanup() {
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions = [];
        Object.values(this.elements).forEach(el => {
            this.dom.removeElement(el);
        });
        this.elements = {};
    }
    update(deltaTime, time) {
    }
}