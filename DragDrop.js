class DragDrop {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            savePosition: true,
            storageKey: null, 
            dragHandle: null, 
            excludeElements: [], 
            dragThreshold: 5, 
            constrainToViewport: true,
            draggingClass: 'dragging',
            hoverEffects: true,
            onDragStart: null,
            onDrag: null,
            onDragEnd: null,
            onClick: null, 
            ...options
        };
        this.isDragging = false;
        this.hasActuallyDragged = false;
        this.dragOffset = { x: 0, y: 0 };
        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.init();
    }
    init() {
        this.setupStyles();
        this.setupEventListeners();
        this.loadPosition();
    }
    setupStyles() {
        this.element.style.userSelect = 'none';
        if (this.options.hoverEffects) {
            this.addHoverEffects();
        }
    }
    addHoverEffects() {
        const target = this.options.dragHandle ? 
            this.element.querySelector(this.options.dragHandle) : this.element;
        if (!target) return;
        const hoverEffect = document.createElement('div');
        hoverEffect.style.cssText = `
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            background: transparent;
            border-radius: 15px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        target.style.position = 'relative';
        target.appendChild(hoverEffect);
        target.addEventListener('mouseenter', () => {
            hoverEffect.style.opacity = '1';
            hoverEffect.style.background = 'rgba(139, 92, 246, 0.1)';
            hoverEffect.style.border = '2px dashed rgba(139, 92, 246, 0.3)';
        });
        target.addEventListener('mouseleave', () => {
            hoverEffect.style.opacity = '0';
        });
    }
    setupEventListeners() {
        const dragTarget = this.options.dragHandle ? 
            this.element.querySelector(this.options.dragHandle) : this.element;
        if (!dragTarget) return;
        dragTarget.addEventListener('mousedown', this.handleDragStart.bind(this));
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
        dragTarget.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleDrag.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
    }
    handleDragStart(e) {
        if (this.shouldExcludeElement(e.target)) {
            return;
        }
        e.preventDefault();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        this.startPos.x = clientX;
        this.startPos.y = clientY;
        this.currentPos.x = clientX;
        this.currentPos.y = clientY;
        const rect = this.element.getBoundingClientRect();
        this.dragOffset.x = clientX - rect.left;
        this.dragOffset.y = clientY - rect.top;
        this.isDragging = true; 
        this.hasActuallyDragged = false;
        this.element.style.transition = 'none';
        if (this.options.onDragStart) {
            this.options.onDragStart(e);
        }
    }
    handleDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        this.currentPos.x = clientX;
        this.currentPos.y = clientY;
        const deltaX = Math.abs(clientX - this.startPos.x);
        const deltaY = Math.abs(clientY - this.startPos.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (!this.hasActuallyDragged && distance > this.options.dragThreshold) {
            this.hasActuallyDragged = true;
            this.element.classList.add(this.options.draggingClass);
        }
        if (this.hasActuallyDragged) {
            let newX = clientX - this.dragOffset.x;
            let newY = clientY - this.dragOffset.y;
            if (this.options.constrainToViewport) {
                const viewport = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
                const elementRect = this.element.getBoundingClientRect();
                newX = Math.max(0, Math.min(newX, viewport.width - elementRect.width));
                newY = Math.max(0, Math.min(newY, viewport.height - elementRect.height));
            }
            this.element.style.position = 'fixed';
            this.element.style.left = `${newX}px`;
            this.element.style.top = `${newY}px`;
            this.element.style.right = 'auto';
            this.element.style.bottom = 'auto';
            if (this.options.onDrag) {
                this.options.onDrag(e, { x: newX, y: newY });
            }
        }
    }
    handleDragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.element.classList.remove(this.options.draggingClass);
        this.element.style.transition = '';
        if (!this.hasActuallyDragged) {
            if (this.options.onClick) {
                this.options.onClick(e);
            }
        } else {
            if (this.options.savePosition && this.options.storageKey) {
                this.savePosition();
            }
        }
        if (this.options.onDragEnd) {
            this.options.onDragEnd(e, this.hasActuallyDragged);
        }
        this.hasActuallyDragged = false;
    }
    shouldExcludeElement(target) {
        return this.options.excludeElements.some(selector => {
            return target.matches && target.matches(selector) || 
                   target.closest && target.closest(selector);
        });
    }
    savePosition() {
        const rect = this.element.getBoundingClientRect();
        const position = {
            left: rect.left,
            top: rect.top,
            right: 'auto',
            bottom: 'auto'
        };
        localStorage.setItem(this.options.storageKey, JSON.stringify(position));
    }
    loadPosition() {
        if (!this.options.savePosition || !this.options.storageKey) return;
        const saved = localStorage.getItem(this.options.storageKey);
        if (saved) {
            try {
                const position = JSON.parse(saved);
                this.element.style.position = 'fixed';
                this.element.style.left = `${position.left}px`;
                this.element.style.top = `${position.top}px`;
                this.element.style.right = 'auto';
                this.element.style.bottom = 'auto';
            } catch (e) {
                console.warn('Failed to load position for', this.options.storageKey);
            }
        }
    }
    setPosition(x, y) {
        this.element.style.position = 'fixed';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
    }
    destroy() {
        const dragTarget = this.options.dragHandle ? 
            this.element.querySelector(this.options.dragHandle) : this.element;
        if (dragTarget) {
            dragTarget.removeEventListener('mousedown', this.handleDragStart);
            dragTarget.removeEventListener('touchstart', this.handleDragStart);
        }
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.handleDragEnd);
        document.removeEventListener('touchmove', this.handleDrag);
        document.removeEventListener('touchend', this.handleDragEnd);
    }
}
window.DragDrop = DragDrop;