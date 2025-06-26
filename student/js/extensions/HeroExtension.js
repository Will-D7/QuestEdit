class HeroExtension extends Extension {
    init() {
        this.animFrame = 0;
        this.lastAnimTime = 0;
        this.on('app:ready', () => {
            this.createHero();
            this.loadHeroSprite();
        });
        this.observe('hero', () => this.updateHeroPosition());
        this.observe('hero.dir', () => this.updateHeroSprite());
        this.observe('hero.frame', () => this.updateHeroSprite());
        this.observe('hero.sheet', () => this.loadHeroSprite());
        this.observe('hero.carrying', () => this.updateCarrying());
        this.on('hero:move', (dir) => this.moveHero(dir));
        this.on('hero:interact', () => this.pickDrop());
        this.on('hero:switch', () => this.switchHero());
    }
    createHero() {
        const heroLayer = document.getElementById('hero-layer');
        const hero = this.createElement('div', {
            id: 'hero',
            className: 'hero'
        });
        const heroItem = this.createElement('div', {
            id: 'hero-item',
            className: 'hero-item'
        });
        hero.appendChild(heroItem);
        heroLayer.appendChild(hero);
        this.elements.hero = hero;
        this.elements.heroItem = heroItem;
        let h = this.state.get('hero');
		this.state.set('activeCell', { x: h.x, y: h.y });
    }
    loadHeroSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 384;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, 384, 512);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 255 && data[i+1] === 89 && data[i+2] === 247) {
                    data[i+3] = 0;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            this.elements.hero.style.backgroundImage = `url(${canvas.toDataURL()})`;
            this.elements.hero.style.backgroundSize = '384px 512px';
            this.updateHeroSprite();
        };
        const sheet = this.state.get('hero.sheet');
        img.src = `hero${String(sheet + 1).padStart(2, '0')}.png`;
    }
    moveHero(dir) {
        const hero = this.state.get('hero');
        if (hero.moving) return;
        if (hero.dir !== dir) {
            this.state.set('hero.dir', dir);
            return;
        }
        const dims = this.state.getMapDimensions();
        let newX = hero.x;
        let newY = hero.y;
        switch(dir) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        if (newX >= 0 && newX < dims.cols && newY >= 0 && newY < dims.rows) {
            const cellData = this.state.get(`mapData.map.${newY}.${newX}`);
            if (this.canStepOn(cellData)) {
                this.state.update('hero', {
                    moving: true,
                    targetX: newX,
                    targetY: newY
                });
                this.state.set('activeCell', { x: newX, y: newY });
                this.emit('viewport:followActive');
            }
        }
    }
    canStepOn(cellData) {
        if (!cellData || cellData === 0) return true;
        const grid = this.app.getExtension('grid');
        const items = grid.parseCellData(cellData);
        const itemTypes = this.state.get('mapData.itemTypes');
        return items.every(item => {
            const type = itemTypes[item.type];
            return type && type.stepable;
        });
    }
    pickDrop() {
        const hero = this.state.get('hero');
        let targetX = hero.x, targetY = hero.y;
        switch(hero.dir) {
            case 'up': targetY--; break;
            case 'down': targetY++; break;
            case 'left': targetX--; break;
            case 'right': targetX++; break;
        }
        const dims = this.state.getMapDimensions();
        if (targetX < 0 || targetX >= dims.cols || targetY < 0 || targetY >= dims.rows) return;
        if (hero.carrying) {
            this.dropItem(targetX, targetY);
        } else {
            this.pickItem(targetX, targetY);
        }
    }
    dropItem(x, y) {
        const carrying = this.state.get('hero.carrying');
        const cellData = this.state.get(`mapData.map.${y}.${x}`);
        const grid = this.app.getExtension('grid');
        const items = cellData && cellData !== 0 ? grid.parseCellData(cellData) : [];
        const itemTypes = this.state.get('mapData.itemTypes');
        const carryingType = itemTypes[carrying.type];
        const canPlace = this.checkStackability(items, carrying, itemTypes);
        if (canPlace) {
            const itemStr = `${carrying.type}${carrying.text ? ':' + carrying.text : ''}`;
            const newData = cellData && cellData !== 0 ? `${cellData},${itemStr}` : itemStr;
            this.state.set(`mapData.map.${y}.${x}`, newData);
            this.state.set('hero.carrying', null);
        }
    }
    checkStackability(items, newItem, itemTypes) {
        const newType = itemTypes[newItem.type];
        if (!newType.stackable) return false;
        return items.every(item => {
            const type = itemTypes[item.type];
            if (!type.stackable) return false;
            const newSize = parseInt(newType.width);
            const itemSize = parseInt(type.width);
            if (newSize > itemSize && !type.allowBiggerToStack) {
                return false;
            }
            return true;
        });
    }
    pickItem(x, y) {
        const cellData = this.state.get(`mapData.map.${y}.${x}`);
        if (!cellData || cellData === 0) return;
        const grid = this.app.getExtension('grid');
        const items = grid.parseCellData(cellData);
        const itemTypes = this.state.get('mapData.itemTypes');
        let pickableIndex = -1;
        for (let i = items.length - 1; i >= 0; i--) {
            const type = itemTypes[items[i].type];
            if (type && type.pickable) {
                pickableIndex = i;
                break;
            }
        }
        if (pickableIndex >= 0) {
            this.state.set('hero.carrying', items[pickableIndex]);
            items.splice(pickableIndex, 1);
            const newData = items.length ? 
                items.map(item => `${item.type}${item.text ? ':' + item.text : ''}`).join(',') : 0;
            this.state.set(`mapData.map.${y}.${x}`, newData);
        }
    }
    switchHero() {
        const sheet = this.state.get('hero.sheet');
        this.state.set('hero.sheet', (sheet + 1) % 8);
    }
    updateHeroPosition() {
        const hero = this.state.get('hero');
        this.elements.hero.style.left = `${hero.x * Config.CELL_SIZE}px`;
        this.elements.hero.style.top = `${hero.y * Config.CELL_SIZE}px`;
    }
    updateHeroSprite() {
        const hero = this.state.get('hero');
        const frame = Config.HERO_FRAMES[hero.dir][hero.frame % 3];
        this.elements.hero.style.backgroundPosition = `-${frame[0] * 128}px -${frame[1] * 128}px`;
    }
    updateCarrying() {
        const carrying = this.state.get('hero.carrying');
        this.dom.clearElement(this.elements.heroItem);
        if (carrying) {
            const grid = this.app.getExtension('grid');
            const itemTypes = this.state.get('mapData.itemTypes');
            const itemEl = grid.createGameItem(carrying, itemTypes[carrying.type]);
            Object.assign(itemEl.style, {
                position: 'relative',
                width: '40px',
                height: '40px',
                left: '0',
                top: '0'
            });
            const text = itemEl.querySelector('.game-item-text');
            if (text) text.style.fontSize = '16px';
            this.elements.heroItem.appendChild(itemEl);
        }
    }
    update(deltaTime, time) {
        const hero = this.state.get('hero');
        if (hero.moving) {
            const speed = Config.HERO_ANIMATION_SPEED;
            const dx = hero.targetX - hero.x;
            const dy = hero.targetY - hero.y;
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                this.state.update('hero', {
                    x: hero.x + dx * speed,
                    y: hero.y + dy * speed
                });
                if (time - this.lastAnimTime > Config.HERO_FRAME_DELAY) {
                    this.state.set('hero.frame', hero.frame + 1);
                    this.lastAnimTime = time;
                }
            } else {
                this.state.update('hero', {
                    x: hero.targetX,
                    y: hero.targetY,
                    moving: false
                });
            }
        } else if (time - this.lastAnimTime > Config.HERO_IDLE_DELAY) {
            this.state.set('hero.frame', 0);
            this.lastAnimTime = time;
        }
    }
    getNextCell() {
        const hero = this.state.get('hero');
        let nx = hero.x;
        let ny = hero.y;
        switch(hero.dir) {
            case 'up': ny--; break;
            case 'down': ny++; break;
            case 'left': nx--; break;
            case 'right': nx++; break;
        }
        const dims = this.state.getMapDimensions();
        if (ny >= 0 && ny < dims.rows && nx >= 0 && nx < dims.cols) {
            return {
                x: nx,
                y: ny,
                cell: this.state.get(`mapData.map.${ny}.${nx}`)
            };
        }
        return null;
    }
}
window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'hero',
    constructor: HeroExtension
});