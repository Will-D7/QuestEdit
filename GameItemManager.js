class GameItemManager {
    constructor() {
        this.gameItems = [];
        this.itemTypes = {};
        this.mapData = null;
        this.grid = null;
        this.hero = null;
        this.onPickup = null;
        this.onDrop = null;
        this.onStackingAttempt = null;
    }
    async init(hero) {
        this.hero = hero;
        this.grid = document.getElementById('grid');
        this.patchHeroMovement();
        try {
            await this.loadMapFromFile();
        } catch (error) {
            console.warn('Failed to load map', error);
        }
    }
    initializeItemsWithGridSize(cellSize) {
        if (this.mapData) {
            this.gameItems.forEach(item => {
                item.currentCellSize = cellSize;
                item.updatePosition();
            });
        }
    }
    async loadMapFromFile() {
        const response = await fetch(Config.gameItems.mapFile);
        if (!response.ok) {
            throw new Error(`Failed to load ${Config.gameItems.mapFile}`);
        }
        const data = await response.json();
        this.itemTypes = data.itemTypes || Config.gameItems.defaultItemTypes;
        this.mapData = data.map;
        if (this.mapData) {
            this.loadMapData();
        }
    }
    loadMapData() {
        this.clearAllGameItems();
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                const cellData = this.mapData[y][x];
                if (cellData !== 0 && cellData !== '0') {
                    this.parseAndCreateItems(cellData, x, y);
                }
            }
        }
        Utils.log('logMovement', `Loaded ${this.gameItems.length} items from map`);
    }
    parseAndCreateItems(cellData, x, y) {
        const parts = cellData.split(':');
        const itemsStr = parts[0];
        const unicodeChar = parts.length > 1 ? parts[1] : null;
        const itemTypeNames = itemsStr.split(',');
        let bottomItem = null;
        itemTypeNames.forEach((typeName, index) => {
            const typeConfig = this.itemTypes[typeName.trim()];
            if (!typeConfig) {
                console.warn(`Unknown item type: ${typeName}`);
                return;
            }
            const itemChar = (index === itemTypeNames.length - 1) ? unicodeChar : null;
            const item = new GameItem(typeConfig, x, y, itemChar);
            this.gameItems.push(item);
            if (bottomItem) {
                bottomItem.stackedItem = item;
                item.stackedOn = bottomItem;
            }
            bottomItem = item;
        });
        const baseItem = this.gameItems.find(item => 
            item.x === x && item.y === y && !item.stackedOn
        );
        if (baseItem) {
            this.updateStackPositions(baseItem);
        }
    }
    updateStackPositions(baseItem) {
        let current = baseItem;
        while (current) {
            current.updatePosition();
            current = current.stackedItem;
        }
    }
    handleGridResize(newCellSize) {
        this.gameItems.forEach(item => {
            if (!item.isCarried) {
                item.updatePosition(newCellSize);
            }
        });
    }
    addGameItem(typeConfig, x, y, unicodeChar = null) {
        const gameItem = new GameItem(typeConfig, x, y, unicodeChar);
        this.gameItems.push(gameItem);
        gameItem.updatePosition();
        return gameItem;
    }
    removeGameItem(gameItem) {
        const index = this.gameItems.indexOf(gameItem);
        if (index > -1) {
            this.gameItems.splice(index, 1);
            gameItem.remove();
        }
    }
    getGameItemAt(x, y) {
        return this.gameItems.find(c => c.x === x && c.y === y && !c.isCarried && !c.stackedOn);
    }
    getTopGameItemAt(x, y) {
        const bottomItem = this.getGameItemAt(x, y);
        if (!bottomItem) return null;
        let topItem = bottomItem;
        while (topItem.stackedItem) {
            topItem = topItem.stackedItem;
        }
        return topItem;
    }
    getAllGameItemsAt(x, y) {
        const bottomItem = this.getGameItemAt(x, y);
        if (!bottomItem) return [];
        const stack = [bottomItem];
        let current = bottomItem;
        while (current.stackedItem) {
            stack.push(current.stackedItem);
            current = current.stackedItem;
        }
        return stack;
    }
    patchHeroMovement() {
        const originalMoveTo = this.hero.moveTo.bind(this.hero);
        this.hero.moveTo = (targetX, targetY) => {
            const items = this.getAllGameItemsAt(targetX, targetY);
            const canStep = items.every(item => item.config.stepable);
            if (this.hero.carriedItem && items.length > 0) {
                const topItem = this.getTopGameItemAt(targetX, targetY);
                if (!this.hero.carriedItem.canStackOn(topItem)) {
                    Utils.log('logMovement', 'Cannot stack on incompatible gameItem');
                    return;
                }
            } else if (!this.hero.carriedItem && items.length > 0 && !canStep) {
                Utils.log('logMovement', 'Cannot move onto non-stepable gameItem');
                return;
            }
            originalMoveTo(targetX, targetY);
        };
        this.hero.canMoveTo = (x, y) => {
            const items = this.getAllGameItemsAt(x, y);
			return items.every(item => item.config.stepable);
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
        if (this.hero.carriedItem) {
            Utils.log('logMovement', 'Already carrying an item');
            return false;
        }
        const frontPos = this.getFrontPosition();
        if (!frontPos) return false;
        const gameItem = this.getTopGameItemAt(frontPos.x, frontPos.y);
        if (!gameItem) {
            Utils.log('logMovement', 'No gameItem to pickup');
            return false;
        }
        if (!gameItem.config.pickable) {
            Utils.log('logMovement', 'Item is not pickable');
            return false;
        }
        gameItem.setCarried(true);
        gameItem.x = -1;
        gameItem.y = -1;
        gameItem.attachToHero(this.hero.config.container);
        this.hero.carriedItem = gameItem;
        this.updateVisualFeedback();
        if (this.onPickup) {
            this.onPickup(gameItem);
        }
        Utils.log('logMovement', 'Picked up', gameItem.getInfo());
        return true;
    }
    tryDrop() {
        if (!this.hero.carriedItem) {
            Utils.log('logMovement', 'Not carrying any item');
            return false;
        }
        const frontPos = this.getFrontPosition();
        if (!frontPos) return false;
        const existingItem = this.getTopGameItemAt(frontPos.x, frontPos.y);
        if (existingItem && !this.hero.carriedItem.canStackOn(existingItem)) {
            Utils.log('logMovement', 'Cannot stack on this item');
            if (this.onStackingAttempt) {
                this.onStackingAttempt(this.hero.carriedItem, existingItem, false);
            }
            return false;
        }
        const droppedItem = this.hero.carriedItem;
        droppedItem.setCarried(false);
        droppedItem.x = frontPos.x;
        droppedItem.y = frontPos.y;
        droppedItem.detachFromHero();
        if (existingItem) {
            let topItem = existingItem;
            while (topItem.stackedItem) {
                topItem = topItem.stackedItem;
            }
            topItem.stackedItem = droppedItem;
            droppedItem.stackedOn = topItem;
            if (this.onStackingAttempt) {
                this.onStackingAttempt(droppedItem, topItem, true);
            }
        }
        this.hero.carriedItem = null;
        this.updateVisualFeedback();
        if (this.onDrop) {
            this.onDrop(droppedItem);
        }
        Utils.log('logMovement', 'Dropped', droppedItem.getInfo());
        return true;
    }
    getFrontPosition() {
        const delta = Utils.getDirectionDelta(this.hero.currentDirection);
        if (!delta) return null;
        const newX = this.hero.gridX + delta.dx;
        const newY = this.hero.gridY + delta.dy;
        if (!Utils.isValidPosition(newX, newY, this.hero.config.gridWidth, this.hero.config.gridHeight)) {
            return null;
        }
        return { x: newX, y: newY };
    }
    handleSpaceKey() {
        if (!this.tryPickup()) {
            this.tryDrop();
        }
    }
    handleCommand(command) {
        if (command === 'pick') {
            return this.tryPickup();
        } else if (command === 'drop') {
            return this.tryDrop();
        }
        return false;
    }
    updateVisualFeedback() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('can-pickup', 'can-drop', 'invalid-drop');
        });
        const frontPos = this.getFrontPosition();
        if (!frontPos) return;
        const grid = document.getElementById('grid');
        const cellIndex = Utils.getGridIndex(frontPos.x, frontPos.y, this.hero.config.gridWidth);
        const cell = grid.children[cellIndex];
        if (!cell) return;
        if (this.hero.carriedItem) {
            const existingItem = this.getTopGameItemAt(frontPos.x, frontPos.y);
            if (!existingItem || this.hero.carriedItem.canStackOn(existingItem)) {
                cell.classList.add('can-drop');
            } else {
                cell.classList.add('invalid-drop');
            }
        } else {
            const gameItem = this.getTopGameItemAt(frontPos.x, frontPos.y);
            if (gameItem && gameItem.config.pickable) {
                cell.classList.add('can-pickup');
            }
        }
    }
    clearAllGameItems() {
        this.gameItems.forEach(c => c.remove());
        this.gameItems = [];
        if (this.hero.carriedItem) {
            this.hero.carriedItem.remove();
            this.hero.carriedItem = null;
        }
    }
    getState() {
        return {
            gameItems: this.gameItems.map(c => c.getInfo()),
            carriedItem: this.hero.carriedItem ? this.hero.carriedItem.getInfo() : null
        };
    }
}
window.GameItemManager = GameItemManager;