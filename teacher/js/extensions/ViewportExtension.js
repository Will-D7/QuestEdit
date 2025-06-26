class ViewportExtension extends Extension {
    init() {
        this.touches = {};
        this.lastDistance = 0;
        this.createViewport();
        this.setupEventHandlers();
        this.observe('scale', () => this.updateTransform());
        this.observe('offsetX', () => this.updateTransform());
        this.observe('offsetY', () => this.updateTransform());
        this.on('viewport:center', () => this.centerView());
        this.on('viewport:followActive', () => this.followActiveCell());
        this.on('viewport:resize', () => this.handleResize());
    }
    createViewport() {
        const viewport = this.createElement('div', {
            id: 'viewport',
            className: 'viewport'
        });
        const gridContainer = this.createElement('div', {
            id: 'grid-container',
            className: 'grid-container'
        });
        const heroLayer = this.createElement('div', {
            id: 'hero-layer',
            className: 'hero-layer'
        });
        viewport.appendChild(gridContainer);
        viewport.appendChild(heroLayer);
        this.app.getContainer().appendChild(viewport);
        this.elements.viewport = viewport;
        this.elements.gridContainer = gridContainer;
        this.elements.heroLayer = heroLayer;
    }
    setupEventHandlers() {
        const viewport = this.elements.viewport;
        this.dom.on(viewport, 'mousedown', (e) => this.handleMouseDown(e));
        this.dom.on(viewport, 'mousemove', (e) => this.handleMouseMove(e));
        this.dom.on(viewport, 'mouseup', () => this.handleMouseUp());
        this.dom.on(viewport, 'wheel', (e) => this.handleWheel(e));
        this.dom.on(viewport, 'touchstart', (e) => this.handleTouchStart(e));
        this.dom.on(viewport, 'touchmove', (e) => this.handleTouchMove(e));
        this.dom.on(viewport, 'touchend', (e) => this.handleTouchEnd(e));
    }
    handleMouseDown(e) {
        if (e.target.classList.contains('cell') && this.state.get('mode') === 'edit') {
            this.emit('editor:cellClick', e.target);
        } else {
            this.state.update('ui', {
                isDragging: true,
                dragStart: { x: e.clientX, y: e.clientY }
            });
        }
    }
    handleMouseMove(e) {
        const ui = this.state.get('ui');
        if (ui.isDragging) {
            const dx = e.clientX - ui.dragStart.x;
            const dy = e.clientY - ui.dragStart.y;
            this.pan(dx, dy);
            this.state.update('ui', { dragStart: { x: e.clientX, y: e.clientY } });
        }
    }
    handleMouseUp() {
        this.state.set('ui.isDragging', false);
    }
    handleWheel(e) {
        e.preventDefault();
        const delta = -e.deltaY * Config.ZOOM_SPEED;
        this.zoom(delta, e.clientX, e.clientY);
    }
    handleTouchStart(e) {
        e.preventDefault();
        Array.from(e.touches).forEach(touch => {
            this.touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY,
                target: e.target
            };
        });
        if (e.touches.length === 1 && this.state.get('mode') === 'edit') {
            this.initialTouchTarget = e.target;
        }
        else if (e.touches.length === 2) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            this.lastDistance = this.getDistance(t1, t2);
        }
    }
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const last = this.touches[touch.identifier];
            if (last && this.state.get('mode') !== 'edit') {
                this.pan(touch.clientX - last.x, touch.clientY - last.y);
                this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
            }
        } else if (e.touches.length === 2) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const distance = this.getDistance(t1, t2);
            const center = this.getCenter(t1, t2);
            if (this.lastDistance > 0) {
                const delta = (distance - this.lastDistance) * Config.PINCH_ZOOM_SPEED;
                this.zoom(delta, center.x, center.y);
            }
            this.lastDistance = distance;
        }
    }
    handleTouchEnd(e) {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
            delete this.touches[touch.identifier];
        });
        // Handle single-tap for editor actions
        if (e.changedTouches.length === 1 && 
            this.state.get('mode') === 'edit' && 
            this.initialTouchTarget &&
            this.initialTouchTarget.classList.contains('cell')) {
            
            this.emit('editor:cellClick', this.initialTouchTarget);
        }
        this.initialTouchTarget = null;
        if (e.touches.length < 2) {
            this.lastDistance = 0;
        }
    }
    pan(dx, dy) {
        const offsetX = this.state.get('offsetX') + dx;
        const offsetY = this.state.get('offsetY') + dy;
        this.state.set('offsetX', offsetX);
        this.state.set('offsetY', offsetY);
    }
    zoom(delta, centerX, centerY) {
        const oldScale = this.state.get('scale');
        const newScale = Math.max(Config.MIN_ZOOM, Math.min(Config.MAX_ZOOM, oldScale + delta));
        const scaleDiff = newScale - oldScale;
        const offsetX = this.state.get('offsetX');
        const offsetY = this.state.get('offsetY');
        this.state.set('scale', newScale);
        this.state.set('offsetX', offsetX - (centerX - offsetX) * scaleDiff / oldScale);
        this.state.set('offsetY', offsetY - (centerY - offsetY) * scaleDiff / oldScale);
    }
    updateTransform() {
        const scale = this.state.get('scale');
        const offsetX = this.state.get('offsetX');
        const offsetY = this.state.get('offsetY');
        const transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        this.elements.gridContainer.style.transform = transform;
        this.elements.heroLayer.style.transform = transform;
    }
    centerView() {
        const dims = this.state.getMapDimensions();
        const gridW = dims.cols * Config.CELL_SIZE * this.state.get('scale');
        const gridH = dims.rows * Config.CELL_SIZE * this.state.get('scale');
        const viewW = this.elements.viewport.clientWidth;
        const viewH = this.elements.viewport.clientHeight;
        this.state.set('offsetX', (viewW - gridW) / 2);
        this.state.set('offsetY', (viewH - gridH) / 2);
    }
    followActiveCell() {
        const { x, y } = this.state.get('activeCell');
        const scale = this.state.get('scale');
        const cellX = x * Config.CELL_SIZE * scale;
        const cellY = y * Config.CELL_SIZE * scale;
        const cellSize = Config.CELL_SIZE * scale;
        const viewW = this.elements.viewport.clientWidth;
        const viewH = this.elements.viewport.clientHeight;
        const offsetX = this.state.get('offsetX');
        const offsetY = this.state.get('offsetY');
        const cellLeft = offsetX + cellX;
        const cellRight = cellLeft + cellSize;
        const cellTop = offsetY + cellY;
        const cellBottom = cellTop + cellSize;
        const padding = Config.VIEWPORT_PADDING;
        let newOffsetX = offsetX;
        let newOffsetY = offsetY;
        if (cellLeft < padding) {
            newOffsetX += padding - cellLeft;
        } else if (cellRight > viewW - padding) {
            newOffsetX -= cellRight - viewW + padding;
        }
        if (cellTop < padding) {
            newOffsetY += padding - cellTop;
        } else if (cellBottom > viewH - padding) {
            newOffsetY -= cellBottom - viewH + padding;
        }
        this.state.set('offsetX', newOffsetX);
        this.state.set('offsetY', newOffsetY);
    }
    handleResize() {
        this.centerView();
        this.followActiveCell();
    }
    getDistance(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    getCenter(t1, t2) {
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
        };
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'viewport',
    constructor: ViewportExtension
});
