class State {
    constructor() {
        this.data = {
            mode: 'play', 
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            activeCell: { x: 0, y: 0 },
            mapData: JSON.parse(JSON.stringify(Config.DEFAULT_MAP)),
            hero: {
                x: 0,
                y: 0,
                dir: 'down',
                frame: 0,
                moving: false,
                targetX: 0,
                targetY: 0,
                sheet: 0,
                carrying: null
            },
            editor: {
                selectedType: 'A',
                eraserMode: false,
                itemText: ''
            },
            program: {
                running: false,
                speed: Config.PROGRAM_SPEED_DEFAULT,
                code: '',
                blocks: []
            },
            ui: {
                isDragging: false,
                dragStart: { x: 0, y: 0 }
            }
        };
        this.observers = {};
    }
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.data);
    }
    set(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const obj = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.data);
        const oldValue = obj[last];
        obj[last] = value;
        this.notify(path, value, oldValue);
    }
    update(path, updates) {
        const current = this.get(path) || {};
        this.set(path, { ...current, ...updates });
    }
    observe(path, callback) {
        if (!this.observers[path]) {
            this.observers[path] = [];
        }
        this.observers[path].push(callback);
        return () => this.unobserve(path, callback);
    }
    unobserve(path, callback) {
        if (this.observers[path]) {
            this.observers[path] = this.observers[path].filter(cb => cb !== callback);
        }
    }
    notify(path, value, oldValue) {
        if (this.observers[path]) {
            this.observers[path].forEach(cb => cb(value, oldValue, path));
        }
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            if (this.observers[parentPath]) {
                this.observers[parentPath].forEach(cb => cb(this.get(parentPath), null, parentPath));
            }
        }
    }
    getMapDimensions() {
        const map = this.data.mapData.map;
        return {
            rows: map.length,
            cols: Math.max(...map.map(row => row.length))
        };
    }
    getMode() {
        const mode = this.data.mode;
        return mode.charAt(0).toUpperCase() + mode.slice(1);
    }
}