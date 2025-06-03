class GameItem {
    constructor(typeConfig, x, y, unicodeChar = null) {
        this.type = typeConfig.name;
        this.config = { ...typeConfig };
        this.x = x;
        this.y = y;
        this.unicodeChar = unicodeChar || (typeConfig.hasUnicodeCharacter ? typeConfig.unicodeCharacter : null);
        this.element = null;
        this.isCarried = false;
        this.stackedOn = null;
        this.stackedItem = null;
        this.originalStyles = null;
        this.currentCellSize = Config.grid.cellSize;
        this.sizeValue = parseFloat(this.config.width) * parseFloat(this.config.height);
        this.createElement();
    }
    createElement() {
        this.element = document.createElement('div');
        this.element.className = `gameItem ${this.type}`;
        this.element.style.position = 'absolute';
        this.element.style.width = this.config.width;
        this.element.style.height = this.config.height;
        this.element.style.backgroundColor = this.config.color;
        this.element.style.opacity = this.config.transparency;
        this.element.style.borderRadius = '8px';
        this.element.style.transition = 'all 0.3s ease';
        this.element.style.transform = 'translate(-50%, -50%)';
        if (this.config.hasBorder) {
            this.element.style.border = `${this.config.borderWidth}px ${this.config.borderType} ${this.config.borderColor}`;
        }
        if (this.unicodeChar) {
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.top = '50%';
            label.style.left = '50%';
            label.style.transform = 'translate(-50%, -50%)';
            label.style.fontFamily = 'monospace';
            label.style.fontSize = this.calculateFontSize();
            label.style.color = this.getContrastColor(this.config.color);
            label.style.fontWeight = 'bold';
            label.style.userSelect = 'none';
            label.textContent = this.unicodeChar;
            this.element.appendChild(label);
        }
        this.element.gameItem = this;
    }
    calculateFontSize(actualWidth = null, actualHeight = null) {
        let width, height;
        if (actualWidth !== null && actualHeight !== null) {
            width = actualWidth;
            height = actualHeight;
        } else {
            const widthPercent = parseFloat(this.config.width);
            const heightPercent = parseFloat(this.config.height);
            width = (this.currentCellSize * widthPercent) / 100;
            height = (this.currentCellSize * heightPercent) / 100;
        }
        const minDimension = Math.min(width, height);
        if (minDimension >= 80) return '20px';
        if (minDimension >= 60) return '16px';
        if (minDimension >= 40) return '12px';
        if (minDimension >= 20) return '10px';
        return '8px';
    }
    getContrastColor(bgColor) {
        const color = bgColor.replace('#', '');
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    updatePosition(newCellSize = null) {
        if (this.isCarried) return;
        if (newCellSize !== null) {
            this.currentCellSize = newCellSize;
        }
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) return;
        const widthPercent = parseFloat(this.config.width);
        const heightPercent = parseFloat(this.config.height);
        const actualWidth = (this.currentCellSize * widthPercent) / 100;
        const actualHeight = (this.currentCellSize * heightPercent) / 100;
        this.element.style.width = `${actualWidth}px`;
        this.element.style.height = `${actualHeight}px`;
        this.element.style.position = 'absolute';
        this.element.style.transform = 'translate(-50%, -50%)';
        this.element.style.bottom = 'auto';
        if (this.unicodeChar && this.element.firstChild) {
            this.element.firstChild.style.fontSize = this.calculateFontSize(actualWidth, actualHeight);
        }
        const cellCenterX = this.x * this.currentCellSize + (this.currentCellSize / 2);
        const cellCenterY = this.y * this.currentCellSize + (this.currentCellSize / 2);
        this.element.style.left = `${cellCenterX}px`;
        this.element.style.top = `${cellCenterY}px`;
        this.ensureProperDOMOrder();
        if (this.stackedItem) {
            this.updateStackOffset();
        }
    }
    ensureProperDOMOrder() {
        const gridContainer = document.getElementById('grid-container');
        if (!gridContainer) return;
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        gridContainer.appendChild(this.element);
        if (this.stackedItem) {
            this.stackedItem.ensureProperDOMOrder();
        }
    }
    updateStackOffset() {
        if (!this.stackedItem) return;
        const cellCenterX = this.x * this.currentCellSize + (this.currentCellSize / 2);
        const cellCenterY = this.y * this.currentCellSize + (this.currentCellSize / 2);
        const widthPercent = parseFloat(this.stackedItem.config.width);
        const heightPercent = parseFloat(this.stackedItem.config.height);
        const actualWidth = (this.currentCellSize * widthPercent) / 100;
        const actualHeight = (this.currentCellSize * heightPercent) / 100;
        this.stackedItem.element.style.width = `${actualWidth}px`;
        this.stackedItem.element.style.height = `${actualHeight}px`;
        this.stackedItem.element.style.left = `${cellCenterX}px`;
        this.stackedItem.element.style.top = `${cellCenterY}px`;
        this.stackedItem.currentCellSize = this.currentCellSize;
        if (this.stackedItem.unicodeChar && this.stackedItem.element.firstChild) {
            this.stackedItem.element.firstChild.style.fontSize = 
                this.stackedItem.calculateFontSize(actualWidth, actualHeight);
        }
        this.stackedItem.ensureProperDOMOrder();
    }
    canStackOn(other) {
        if (!this.config.stackable) return false;
        if (!other) return true;
        let topItem = other;
        while (topItem.stackedItem) {
            topItem = topItem.stackedItem;
        }
        if (!topItem.config.stackable) return false;
        if (topItem.config.allowBiggerToStack) {
            return true; 
        } else {
            return this.sizeValue <= topItem.sizeValue; 
        }
    }
    setCarried(carried) {
        this.isCarried = carried;
        if (carried) {
            if (this.stackedOn) {
                this.stackedOn.stackedItem = null;
                this.stackedOn = null;
            }
        }
    }
    attachToHero(heroContainer) {
        this.originalStyles = {
            position: this.element.style.position,
            left: this.element.style.left,
            top: this.element.style.top,
            bottom: this.element.style.bottom,
            transform: this.element.style.transform
        };
        const widthPercent = parseFloat(this.config.width);
        const heightPercent = parseFloat(this.config.height);
        const actualWidth = (this.currentCellSize * widthPercent) / 100;
        const actualHeight = (this.currentCellSize * heightPercent) / 100;
        this.element.style.position = 'absolute';
        this.element.style.width = `${actualWidth}px`;
        this.element.style.height = `${actualHeight}px`;
        this.element.style.left = '50%';
        this.element.style.bottom = '80%';
        this.element.style.top = 'auto';
        this.element.style.transform = 'translateX(-50%)';
        if (this.unicodeChar && this.element.firstChild) {
            this.element.firstChild.style.fontSize = this.calculateFontSize(actualWidth, actualHeight);
        }
        heroContainer.appendChild(this.element);
    }
    detachFromHero() {
        if (this.originalStyles) {
            this.element.style.position = this.originalStyles.position;
            this.element.style.left = this.originalStyles.left;
            this.element.style.top = this.originalStyles.top;
            this.element.style.bottom = this.originalStyles.bottom;
            this.element.style.transform = this.originalStyles.transform;
            this.originalStyles = null;
        }
        this.updatePosition();
    }
    getInfo() {
        return {
            type: this.type,
            config: this.config,
            position: { x: this.x, y: this.y },
            unicodeChar: this.unicodeChar,
            isCarried: this.isCarried,
            hasStack: !!this.stackedItem,
            stackedOnType: this.stackedOn ? this.stackedOn.type : null
        };
    }
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
window.GameItem = GameItem;