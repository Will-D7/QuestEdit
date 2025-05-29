class Collectible {
    constructor(type, size, x, y) {
        this.type = type; 
        this.size = size; 
        this.x = x;
        this.y = y;
        this.element = null;
        this.isCarried = false;
        this.stackedOn = null; 
        this.stackedItem = null; 
        this.sizeValue = {
            'small': 1,
            'mid': 2,
            'large': 3
        }[size];
        this.colors = {
            'SquareA': { bg: '#FF6B6B', border: '#EE5A6F' },
            'SquareB': { bg: '#4ECDC4', border: '#45B7B8' },
            'SquareC': { bg: '#FFE66D', border: '#FFD93D' }
        };
        this.sizes = {
            'small': 30,
            'mid': 40,
            'large': 50
        };
        this.createElement();
    }
    createElement() {
        this.element = document.createElement('div');
        this.element.className = `collectible ${this.type} ${this.size}`;
        this.element.style.position = 'absolute';
        this.element.style.width = `${this.sizes[this.size]}%`;
        this.element.style.height = `${this.sizes[this.size]}%`;
        this.element.style.backgroundColor = this.colors[this.type].bg;
        this.element.style.border = `3px solid ${this.colors[this.type].border}`;
        this.element.style.borderRadius = '8px';
        this.element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        this.element.style.transition = 'all 0.3s ease';
        this.element.style.zIndex = '8';
        this.element.style.left = '50%';
        this.element.style.top = '50%';
        this.element.style.transform = 'translate(-50%, -50%)';
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = '50%';
        label.style.left = '50%';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.fontFamily = 'Press Start 2P, monospace';
        label.style.fontSize = this.size === 'small' ? '8px' : this.size === 'mid' ? '10px' : '12px';
        label.style.color = 'rgba(0,0,0,0.5)';
        label.textContent = this.type.charAt(6); 
        this.element.appendChild(label);
    }
    updatePosition() {
        if (this.isCarried) return;
        const grid = document.getElementById('grid');
        const cells = grid.children;
        const gridWidth = window.Config.grid.defaultWidth;
        const cellIndex = this.y * gridWidth + this.x;
        const cell = cells[cellIndex];
        if (cell) {
            if (this.stackedOn) {
                const stackHeight = this.getStackPosition();
                this.element.style.bottom = `${stackHeight}%`;
                this.element.style.top = 'auto';
                this.element.style.transform = 'translateX(-50%)';
            } else {
                this.element.style.bottom = 'auto';
                this.element.style.top = '50%';
                this.element.style.transform = 'translate(-50%, -50%)';
            }
            cell.appendChild(this.element);
        }
    }
    getStackPosition() {
        let height = 50; 
        let current = this.stackedOn;
        while (current) {
            height += this.sizes[current.size] * 0.8; 
            current = current.stackedOn;
        }
        return height;
    }
    canStackOn(other) {
        if (!other) return true; 
        let topItem = other;
        while (topItem.stackedItem) {
            topItem = topItem.stackedItem;
        }
        return this.sizeValue < topItem.sizeValue;
    }
    setCarried(carried) {
        this.isCarried = carried;
        if (carried) {
            this.element.style.zIndex = '15';
            if (this.stackedOn) {
                this.stackedOn.stackedItem = null;
                this.stackedOn = null;
            }
        } else {
            this.element.style.zIndex = '8';
        }
    }
    attachToHero(heroContainer) {
        this.element.style.position = 'absolute';
        this.element.style.left = '50%';
        this.element.style.bottom = '80%';
        this.element.style.top = 'auto';
        this.element.style.transform = 'translateX(-50%)';
        heroContainer.appendChild(this.element);
    }
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
class CollectiblesManager {
    constructor() {
        this.collectibles = [];
        this.grid = null;
        this.hero = null;
    }
    init(hero) {
        this.hero = hero;
        this.grid = document.getElementById('grid');
        this.patchHeroMovement();
        this.generateRandomCollectibles();
    }
    generateRandomCollectibles() {
        const types = ['SquareA', 'SquareB', 'SquareC'];
        const sizes = ['small', 'mid', 'large'];
        const count = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.hero.config.gridWidth);
                y = Math.floor(Math.random() * this.hero.config.gridHeight);
            } while ((x === this.hero.gridX && y === this.hero.gridY) || 
                     this.getCollectibleAt(x, y));
            const type = types[Math.floor(Math.random() * types.length)];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            this.addCollectible(type, size, x, y);
        }
    }
    addCollectible(type, size, x, y) {
        const collectible = new Collectible(type, size, x, y);
        this.collectibles.push(collectible);
        collectible.updatePosition();
        return collectible;
    }
    getCollectibleAt(x, y) {
        return this.collectibles.find(c => c.x === x && c.y === y && !c.isCarried);
    }
    getTopCollectibleAt(x, y) {
        const bottomItem = this.getCollectibleAt(x, y);
        if (!bottomItem) return null;
        let topItem = bottomItem;
        while (topItem.stackedItem) {
            topItem = topItem.stackedItem;
        }
        return topItem;
    }
    patchHeroMovement() {
        const originalMoveTo = this.hero.moveTo.bind(this.hero);
        this.hero.moveTo = (targetX, targetY) => {
            const collectible = this.getCollectibleAt(targetX, targetY);
            if (this.hero.carriedItem && collectible) {
                if (!this.hero.carriedItem.canStackOn(collectible)) {
                    return; 
                }
            } else if (!this.hero.carriedItem && collectible) {
                return; 
            }
            originalMoveTo(targetX, targetY);
        };
		const originalUpdatePosition = this.hero.updateGridPosition.bind(this.hero);
		this.hero.updateGridPosition = (animate) => {
			originalUpdatePosition(animate);
			this.updateVisualFeedback();
		};
		const originalSetRow = this.hero.setRow.bind(this.hero);
		this.hero.setRow = (row) => {
			originalSetRow(row);
			this.updateVisualFeedback();
		};
        this.hero.carriedItem = null;
    }
    tryPickup() {
        if (this.hero.carriedItem) return false; 
        const frontPos = this.getFrontPosition();
        if (!frontPos) return false;
        const collectible = this.getTopCollectibleAt(frontPos.x, frontPos.y);
        if (!collectible) return false;
        collectible.setCarried(true);
        collectible.x = -1; 
        collectible.y = -1;
        collectible.attachToHero(this.hero.config.container);
        this.hero.carriedItem = collectible;
		this.updateVisualFeedback();
        return true;
    }
    tryDrop() {
        if (!this.hero.carriedItem) return false; 
        const frontPos = this.getFrontPosition();
        if (!frontPos) return false;
        const existingItem = this.getTopCollectibleAt(frontPos.x, frontPos.y);
        if (existingItem && !this.hero.carriedItem.canStackOn(existingItem)) {
            return false; 
        }
        const droppedItem = this.hero.carriedItem;
        droppedItem.setCarried(false);
        droppedItem.x = frontPos.x;
        droppedItem.y = frontPos.y;
        if (existingItem) {
            let topItem = existingItem;
            while (topItem.stackedItem) {
                topItem = topItem.stackedItem;
            }
            topItem.stackedItem = droppedItem;
            droppedItem.stackedOn = topItem;
        }
        droppedItem.updatePosition();
        this.hero.carriedItem = null;
		this.updateVisualFeedback();
        return true;
    }
    getFrontPosition() {
        const directions = {
            'up': { dx: 0, dy: -1 },
            'down': { dx: 0, dy: 1 },
            'left': { dx: -1, dy: 0 },
            'right': { dx: 1, dy: 0 }
        };
        const dir = directions[this.hero.currentDirection];
        if (!dir) return null;
        const newX = this.hero.gridX + dir.dx;
        const newY = this.hero.gridY + dir.dy;
        if (newX < 0 || newX >= this.hero.config.gridWidth ||
            newY < 0 || newY >= this.hero.config.gridHeight) {
            return null;
        }
        return { x: newX, y: newY };
    }
    handleSpaceKey() {
        if (!this.tryPickup()) {
            this.tryDrop();
        }
    }
	updateVisualFeedback() {
		document.querySelectorAll('.grid-cell').forEach(cell => {
			cell.classList.remove('can-pickup', 'can-drop', 'invalid-drop');
		});
		const frontPos = this.getFrontPosition();
		if (!frontPos) return;
		const grid = document.getElementById('grid');
		const gridWidth = this.hero.config.gridWidth;
		const cellIndex = frontPos.y * gridWidth + frontPos.x;
		const cell = grid.children[cellIndex];
		if (!cell) return;
		if (this.hero.carriedItem) {
			const existingItem = this.getTopCollectibleAt(frontPos.x, frontPos.y);
			if (!existingItem || this.hero.carriedItem.canStackOn(existingItem)) {
				cell.classList.add('can-drop');
			} else {
				cell.classList.add('invalid-drop');
			}
		} else {
			const collectible = this.getTopCollectibleAt(frontPos.x, frontPos.y);
			if (collectible) {
				cell.classList.add('can-pickup');
			}
		}
	}
}
window.CollectiblesManager = CollectiblesManager;