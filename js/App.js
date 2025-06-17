class State {
    constructor() {
        this.isEditing = false;
        this.selectedType = 'A';
        this.eraserMode = false;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.activeCell = { x: 0, y: 0 };
        this.mapData = JSON.parse(JSON.stringify(Config.DEFAULT_MAP));
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.hero = {
            x: 0,
            y: 0,
            dir: 'down',
            frame: 0,
            moving: false,
            targetX: 0,
            targetY: 0,
            sheet: 0,
            carrying: null
        };
        this.cells = [];
    }
}

class ElementCache {
    constructor() {
        this.elements = {};
    }
    
    cache() {
        this.elements.viewport = document.getElementById('viewport');
        this.elements.fab = document.getElementById('fab');
        this.elements.editorPanel = document.getElementById('editor-panel');
        this.elements.gridSize = document.getElementById('grid-size');
        this.elements.zoom = document.getElementById('zoom');
        this.elements.cell = document.getElementById('cell');
        this.elements.mode = document.getElementById('mode');
        this.elements.clearBtn = document.getElementById('clear-btn');
        this.elements.saveBtn = document.getElementById('save-btn');
        this.elements.loadBtn = document.getElementById('load-btn');
        this.elements.modal = document.getElementById('save-load-modal');
        this.elements.mapJson = document.getElementById('map-json');
        this.elements.modalTitle = document.getElementById('modal-title');
        this.elements.modalCancel = document.getElementById('modal-cancel');
        this.elements.modalConfirm = document.getElementById('modal-confirm');
        this.elements.heroLayer = document.getElementById('hero-layer');
        this.elements.hero = document.getElementById('hero');
        this.elements.heroItem = document.getElementById('hero-item');
        this.elements.pickDropBtn = document.getElementById('pick-drop');
        this.elements.heroSwitchBtn = document.getElementById('hero-switch');
        this.elements.categoryInput = document.getElementById('map-category');
        this.elements.difficultySelect = document.getElementById('map-difficulty');
        this.elements.descriptionInput = document.getElementById('map-description');
    }
    
    get(name) {
        return this.elements[name];
    }
    
    set(name, element) {
        this.elements[name] = element;
    }
}

class GridManager {
    constructor(state, elements) {
        this.state = state;
        this.elements = elements;
    }
    
    setupGrid() {
        const container = document.getElementById('grid-container');
        const grid = document.createElement('div');
        grid.className = 'grid';
        const { cols, rows } = this.getMapDimensions();
        grid.style.gridTemplateColumns = `repeat(${cols}, ${Config.CELL_SIZE}px)`;
        
        this.state.cells = [];
        for (let y = 0; y < rows; y++) {
            this.state.cells[y] = [];
            for (let x = 0; x < cols; x++) {
                const cell = this.createCell(x, y);
                grid.appendChild(cell);
                this.state.cells[y][x] = cell;
            }
        }
        
        container.appendChild(grid);
        this.elements.set('container', container);
        this.elements.set('grid', grid);
        this.updateActiveCell();
    }
    
    createCell(x, y) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        return cell;
    }
    
    getMapDimensions() {
        const map = this.state.mapData.map;
        return {
            rows: map.length,
            cols: Math.max(...map.map(row => row.length))
        };
    }
    
    updateActiveCell() {
        this.state.cells.forEach(row => row.forEach(cell => cell.classList.remove('active')));
        const { x, y } = this.state.activeCell;
        if (this.state.cells[y] && this.state.cells[y][x]) {
            this.state.cells[y][x].classList.add('active');
        }
    }
    
    centerGrid() {
        const { cols, rows } = this.getMapDimensions();
        const gridW = cols * Config.CELL_SIZE * this.state.scale;
        const gridH = rows * Config.CELL_SIZE * this.state.scale;
        const viewW = this.elements.get('viewport').clientWidth;
        const viewH = this.elements.get('viewport').clientHeight;
        this.state.offsetX = (viewW - gridW) / 2;
        this.state.offsetY = (viewH - gridH) / 2;
        this.updateTransform();
    }
    
    followActiveCell() {
        const { x, y } = this.state.activeCell;
        const cellX = x * Config.CELL_SIZE * this.state.scale;
        const cellY = y * Config.CELL_SIZE * this.state.scale;
        const cellW = Config.CELL_SIZE * this.state.scale;
        const cellH = Config.CELL_SIZE * this.state.scale;
        const viewW = this.elements.get('viewport').clientWidth;
        const viewH = this.elements.get('viewport').clientHeight;
        const cellLeft = this.state.offsetX + cellX;
        const cellRight = cellLeft + cellW;
        const cellTop = this.state.offsetY + cellY;
        const cellBottom = cellTop + cellH;
        const padding = Config.VIEWPORT_PADDING;
        
        if (cellLeft < padding) {
            this.state.offsetX += padding - cellLeft;
        } else if (cellRight > viewW - padding) {
            this.state.offsetX -= cellRight - viewW + padding;
        }
        if (cellTop < padding) {
            this.state.offsetY += padding - cellTop;
        } else if (cellBottom > viewH - padding) {
            this.state.offsetY -= cellBottom - viewH + padding;
        }
        
        this.updateTransform();
    }
    
    updateTransform() {
        const transform = `translate(${this.state.offsetX}px, ${this.state.offsetY}px) scale(${this.state.scale})`;
        this.elements.get('container').style.transform = transform;
        this.elements.get('heroLayer').style.transform = transform;
    }
    
    pan(dx, dy) {
        this.state.offsetX += dx;
        this.state.offsetY += dy;
        this.updateTransform();
    }
    
    zoom(delta, centerX, centerY) {
        const oldScale = this.state.scale;
        this.state.scale = Math.max(Config.MIN_ZOOM, Math.min(Config.MAX_ZOOM, this.state.scale + delta));
        const scaleDiff = this.state.scale - oldScale;
        this.state.offsetX -= (centerX - this.state.offsetX) * scaleDiff / oldScale;
        this.state.offsetY -= (centerY - this.state.offsetY) * scaleDiff / oldScale;
        this.updateTransform();
    }
}

class HeroManager {
    constructor(state, elements, gridManager, mapRenderer) {
        this.state = state;
        this.elements = elements;
        this.gridManager = gridManager;
        this.mapRenderer = mapRenderer;
        this.animFrame = 0;
        this.lastAnimTime = 0;
    }
    
    setupHero() {
        this.loadHeroSprite();
        this.updateHeroPosition();
    }
    
    loadHeroSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 384;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const self = this;
        
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, 384, 512);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 255 && data[i+1] === 89 && data[i+2] === 247) {
                    data[i+3] = 0;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            self.elements.get('hero').style.backgroundImage = `url(${canvas.toDataURL()})`;
            self.elements.get('hero').style.backgroundSize = '384px 512px';
            self.updateHeroSprite();
        };
        
        img.src = `hero${String(this.state.hero.sheet + 1).padStart(2, '0')}.png`;
    }
    
    updateHeroPosition() {
        this.elements.get('hero').style.left = `${this.state.hero.x * Config.CELL_SIZE}px`;
        this.elements.get('hero').style.top = `${this.state.hero.y * Config.CELL_SIZE}px`;
    }
    
    updateHeroSprite() {
        const frame = Config.HERO_FRAMES[this.state.hero.dir][this.state.hero.frame % 3];
        this.elements.get('hero').style.backgroundPosition = `-${frame[0] * 128}px -${frame[1] * 128}px`;
    }
    
    moveHero(dir) {
        if (this.state.hero.moving) return;
        if (this.state.hero.dir != dir) {
			this.state.hero.dir = dir;
			return;
		} 
        this.state.hero.dir = dir;
        const { cols, rows } = this.gridManager.getMapDimensions();
        let newX = this.state.hero.x;
        let newY = this.state.hero.y;
        
        switch(dir) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
            const cellData = this.state.mapData.map[newY][newX];
            if (this.canStepOn(cellData)) {
                this.state.hero.moving = true;
                this.state.hero.targetX = newX;
                this.state.hero.targetY = newY;
                this.state.activeCell = { x: newX, y: newY };
                this.gridManager.updateActiveCell();
                this.gridManager.followActiveCell();
            }
        }
    }
    
    canStepOn(cellData) {
        if (!cellData || cellData === 0) return true;
        const items = this.mapRenderer.parseCellData(cellData);
        return items.every(item => {
            const type = this.state.mapData.itemTypes[item.type];
            return type && type.stepable;
        });
    }
    
    switchHero() {
        this.state.hero.sheet = (this.state.hero.sheet + 1) % 8;
        this.loadHeroSprite();
    }
    
    pickDrop() {
        const { x, y, dir } = this.state.hero;
        let targetX = x, targetY = y;
        
        switch(dir) {
            case 'up': targetY--; break;
            case 'down': targetY++; break;
            case 'left': targetX--; break;
            case 'right': targetX++; break;
        }
        
        const { cols, rows } = this.gridManager.getMapDimensions();
        if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) return;
        
        if (this.state.hero.carrying) {
            this.dropItem(targetX, targetY);
        } else {
            this.pickItem(targetX, targetY);
        }
    }
    
    dropItem(targetX, targetY) {
        const cellData = this.state.mapData.map[targetY][targetX];
        const items = cellData && cellData !== 0 ? this.mapRenderer.parseCellData(cellData) : [];
        const carryingType = this.state.mapData.itemTypes[this.state.hero.carrying.type];
        
        const canPlace = items.every(item => {
            const type = this.state.mapData.itemTypes[item.type];
            return type && type.stackable;
        }) && (!items.length || carryingType.stackable);
        
        if (canPlace) {
            const itemStr = `${this.state.hero.carrying.type}${this.state.hero.carrying.text ? ':' + this.state.hero.carrying.text : ''}`;
            if (cellData && cellData !== 0) {
                this.state.mapData.map[targetY][targetX] = `${cellData},${itemStr}`;
            } else {
                this.state.mapData.map[targetY][targetX] = itemStr;
            }
            this.state.hero.carrying = null;
            this.elements.get('heroItem').innerHTML = '';
            this.mapRenderer.renderMap();
        }
    }
    
    pickItem(targetX, targetY) {
        const cellData = this.state.mapData.map[targetY][targetX];
        if (cellData && cellData !== 0) {
            const items = this.mapRenderer.parseCellData(cellData);
            let pickableIndex = -1;
            
            for (let i = items.length - 1; i >= 0; i--) {
                const type = this.state.mapData.itemTypes[items[i].type];
                if (type && type.pickable) {
                    pickableIndex = i;
                    break;
                }
            }
            
            if (pickableIndex >= 0) {
                this.state.hero.carrying = items[pickableIndex];
                items.splice(pickableIndex, 1);
                
                if (items.length) {
                    this.state.mapData.map[targetY][targetX] = items.map(item => 
                        `${item.type}${item.text ? ':' + item.text : ''}`
                    ).join(',');
                } else {
                    this.state.mapData.map[targetY][targetX] = 0;
                }
                
                const itemEl = this.mapRenderer.createGameItem(this.state.hero.carrying, this.state.mapData.itemTypes[this.state.hero.carrying.type]);
                itemEl.style.position = 'relative';
                itemEl.style.width = '40px';
                itemEl.style.height = '40px';
                itemEl.style.left = '0';
                itemEl.style.top = '0';
                const text = itemEl.querySelector('.game-item-text');
                if (text) text.style.fontSize = '16px';
                
                this.elements.get('heroItem').innerHTML = '';
                this.elements.get('heroItem').appendChild(itemEl);
                this.mapRenderer.renderMap();
            }
        }
    }
    
    update(time) {
        if (this.state.hero.moving) {
            const speed = Config.HERO_ANIMATION_SPEED;
            const dx = this.state.hero.targetX - this.state.hero.x;
            const dy = this.state.hero.targetY - this.state.hero.y;
            
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                this.state.hero.x += dx * speed;
                this.state.hero.y += dy * speed;
                this.updateHeroPosition();
                
                if (time - this.lastAnimTime > Config.HERO_FRAME_DELAY) {
                    this.state.hero.frame++;
                    this.updateHeroSprite();
                    this.lastAnimTime = time;
                }
            } else {
                this.state.hero.x = this.state.hero.targetX;
                this.state.hero.y = this.state.hero.targetY;
                this.state.hero.moving = false;
                this.updateHeroPosition();
            }
        } else if (time - this.lastAnimTime > Config.HERO_IDLE_DELAY) {
            this.state.hero.frame = 0;
            this.updateHeroSprite();
            this.lastAnimTime = time;
        }
    }
}

class EditorManager {
    constructor(state, elements, mapRenderer) {
        this.state = state;
        this.elements = elements;
        this.mapRenderer = mapRenderer;
    }
    
    setupEditor() {
        this.setupTabs();
        this.setupItemTypes();
        this.setupTypeEditor();
        this.setupSettings();
        this.updateItemTypesGrid();
    }
    
    setupSettings() {
        const categoryInput = this.elements.get('categoryInput');
        const difficultySelect = this.elements.get('difficultySelect');
        const descriptionInput = this.elements.get('descriptionInput');
        
        categoryInput.value = this.state.mapData.category || '';
        difficultySelect.value = this.state.mapData.difficulty || 'medio';
        descriptionInput.value = this.state.mapData.description || '';
        
        const self = this;
        categoryInput.addEventListener('input', function(e) {
            self.state.mapData.category = e.target.value;
        });
        
        difficultySelect.addEventListener('change', function(e) {
            self.state.mapData.difficulty = e.target.value;
        });
        
        descriptionInput.addEventListener('input', function(e) {
            self.state.mapData.description = e.target.value;
        });
    }
    
    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const content = document.querySelector(`[data-content="${tab.dataset.tab}"]`);
                content.classList.add('active');
            });
        });
    }
    
    setupItemTypes() {
        const eraserBtn = document.getElementById('eraser-btn');
        const self = this;
        
        eraserBtn.addEventListener('click', function() {
            self.state.eraserMode = !self.state.eraserMode;
            eraserBtn.textContent = self.state.eraserMode ? '✏️ Modo Dibujo' : '🧹 Modo Borrador';
            eraserBtn.classList.toggle('btn-primary', self.state.eraserMode);
            self.updateItemTypesGrid();
        });
    }
    
    setupTypeEditor() {
        const selector = document.getElementById('type-selector');
        const sizeInput = document.getElementById('type-size');
        const sizeValue = document.getElementById('size-value');
        const colorInput = document.getElementById('type-color');
        const colorPreview = document.getElementById('color-preview');
        const transparencyInput = document.getElementById('type-transparency');
        const transparencyValue = document.getElementById('transparency-value');
        const borderSelect = document.getElementById('type-border');
        const pickableCheck = document.getElementById('type-pickable');
        const stepableCheck = document.getElementById('type-stepable');
        const stackableCheck = document.getElementById('type-stackable');
        const addTypeBtn = document.getElementById('add-type-btn');
        
        const self = this;
        
        const updateTypeSelector = function() {
            selector.innerHTML = '';
            Object.keys(self.state.mapData.itemTypes).forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = `Tipo ${type}`;
                selector.appendChild(option);
            });
            loadTypeSettings();
        };
        
        const loadTypeSettings = function() {
            const type = self.state.mapData.itemTypes[selector.value];
            if (!type) return;
            
            const size = parseInt(type.width);
            sizeInput.value = size;
            sizeValue.textContent = `${size}%`;
            colorInput.value = type.color;
            colorPreview.style.backgroundColor = type.color;
            transparencyInput.value = type.transparency;
            transparencyValue.textContent = type.transparency;
            borderSelect.value = type.borderType;
            pickableCheck.checked = type.pickable;
            stepableCheck.checked = type.stepable;
            stackableCheck.checked = type.stackable;
        };
        
        selector.addEventListener('change', loadTypeSettings);
        
        sizeInput.addEventListener('input', function(e) {
            const size = e.target.value;
            sizeValue.textContent = `${size}%`;
            self.updateTypeProperty('width', `${size}%`);
            self.updateTypeProperty('height', `${size}%`);
        });
        
        colorInput.addEventListener('input', function(e) {
            colorPreview.style.backgroundColor = e.target.value;
            self.updateTypeProperty('color', e.target.value);
        });
        
        transparencyInput.addEventListener('input', function(e) {
            transparencyValue.textContent = e.target.value;
            self.updateTypeProperty('transparency', parseFloat(e.target.value));
        });
        
        borderSelect.addEventListener('change', function(e) {
            self.updateTypeProperty('borderType', e.target.value);
        });
        
        pickableCheck.addEventListener('change', function(e) {
            self.updateTypeProperty('pickable', e.target.checked);
        });
        
        stepableCheck.addEventListener('change', function(e) {
            self.updateTypeProperty('stepable', e.target.checked);
        });
        
        stackableCheck.addEventListener('change', function(e) {
            self.updateTypeProperty('stackable', e.target.checked);
        });
        
        addTypeBtn.addEventListener('click', function() {
            const newType = String.fromCharCode(65 + Object.keys(self.state.mapData.itemTypes).length);
            self.state.mapData.itemTypes[newType] = {
                width: "50%",
                height: "50%",
                color: "#" + Math.floor(Math.random()*16777215).toString(16),
                transparency: 1.0,
                borderType: "solid",
                borderWidth: 2,
                borderColor: "#333",
                pickable: true,
                stepable: false,
                stackable: true
            };
            updateTypeSelector();
            self.updateItemTypesGrid();
            selector.value = newType;
            loadTypeSettings();
        });
        
        updateTypeSelector();
    }
    
    updateTypeProperty(prop, value) {
        const type = document.getElementById('type-selector').value;
        this.state.mapData.itemTypes[type][prop] = value;
        this.updateItemTypesGrid();
        this.mapRenderer.renderMap();
    }
    
    updateItemTypesGrid() {
        const grid = document.getElementById('item-types-grid');
        grid.innerHTML = '';
        const self = this;
        
        Object.entries(this.state.mapData.itemTypes).forEach(function(entry) {
            const type = entry[0];
            const props = entry[1];
            const btn = document.createElement('button');
            btn.className = 'item-type-btn';
            btn.dataset.type = type;
            
            if (self.state.selectedType === type && !self.state.eraserMode) {
                btn.classList.add('selected');
            }
            
            btn.style.backgroundColor = props.color;
            btn.style.opacity = props.transparency;
            if (props.borderType !== 'none') {
                btn.style.borderStyle = props.borderType;
                btn.style.borderColor = props.borderColor;
            }
            
            const label = document.createElement('div');
            label.className = 'item-type-label';
            label.textContent = type;
            btn.appendChild(label);
            
            btn.addEventListener('click', function() {
                self.state.selectedType = type;
                self.state.eraserMode = false;
                document.getElementById('eraser-btn').textContent = '🧹 Modo Borrador';
                self.updateItemTypesGrid();
            });
            
            grid.appendChild(btn);
        });
    }
    
    toggleEditMode() {
        this.state.isEditing = !this.state.isEditing;
        this.elements.get('fab').classList.toggle('editing', this.state.isEditing);
        this.elements.get('editorPanel').classList.toggle('show', this.state.isEditing);
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => btn.classList.toggle('hidden', !this.state.isEditing));
    }
    
    handleCellClick(cell) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        
        if (this.state.eraserMode) {
            this.state.mapData.map[y][x] = 0;
        } else {
            const text = document.getElementById('item-text').value || '';
            const cellData = `${this.state.selectedType}${text ? ':' + text : ''}`;
            const currentData = this.state.mapData.map[y][x];
            
            if (currentData && currentData !== 0) {
                this.state.mapData.map[y][x] = `${currentData},${cellData}`;
            } else {
                this.state.mapData.map[y][x] = cellData;
            }
        }
        
        this.mapRenderer.renderMap();
    }
    
    clearMap() {
        if (confirm('¿Limpiar todo el mapa?')) {
            const gridManager = new GridManager(this.state, this.elements);
            const { cols, rows } = gridManager.getMapDimensions();
            this.state.mapData.map = Array(rows).fill(0).map(() => Array(cols).fill(0));
            this.mapRenderer.renderMap();
        }
    }
}

class MapRenderer {
    constructor(state) {
        this.state = state;
    }
    
    renderMap() {
        this.state.cells.forEach(row => {
            row.forEach(cell => {
                cell.querySelectorAll('.game-item').forEach(item => item.remove());
            });
        });
        
        const { map, itemTypes } = this.state.mapData;
        map.forEach((row, y) => {
            row.forEach((cellData, x) => {
                if (cellData && cellData !== 0) {
                    const items = this.parseCellData(cellData);
                    items.forEach((item, i) => {
                        const element = this.createGameItem(item, itemTypes[item.type]);
                        if (this.state.cells[y] && this.state.cells[y][x]) {
                            this.state.cells[y][x].appendChild(element);
                        }
                    });
                }
            });
        });
    }
    
    parseCellData(cellData) {
        const items = [];
        const parts = cellData.toString().split(',');
        parts.forEach(part => {
            const match = part.match(/^([A-Z]):?(.*)$/);
            if (match) {
                items.push({
                    type: match[1],
                    text: match[2] || ''
                });
            }
        });
        return items;
    }
    
    createGameItem(item, props) {
        const element = document.createElement('div');
        element.className = 'game-item';
        const width = parseFloat(props.width) * Config.CELL_SIZE / 100;
        const height = parseFloat(props.height) * Config.CELL_SIZE / 100;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.left = `${(Config.CELL_SIZE - width) / 2}px`;
        element.style.top = `${(Config.CELL_SIZE - height) / 2}px`;
        element.style.backgroundColor = props.color;
        element.style.opacity = props.transparency;
        
        if (props.borderType !== 'none') {
            element.style.borderStyle = props.borderType;
            element.style.borderWidth = `${props.borderWidth}px`;
            element.style.borderColor = props.borderColor;
        }
        
        if (item.text) {
            const textEl = document.createElement('div');
            textEl.className = 'game-item-text';
            if (item.text.length > 5) textEl.classList.add('small');
            if (item.text.length > 10) textEl.classList.add('tiny');
            textEl.textContent = item.text;
            element.appendChild(textEl);
        }
        
        return element;
    }
}

class UIManager {
    constructor(state, elements, gridManager) {
        this.state = state;
        this.elements = elements;
        this.gridManager = gridManager;
    }
    
    updateUI() {
        const { cols, rows } = this.gridManager.getMapDimensions();
        this.elements.get('gridSize').textContent = `${cols}×${rows}`;
        this.elements.get('zoom').textContent = `${Math.round(this.state.scale * 100)}%`;
        this.elements.get('cell').textContent = `${this.state.activeCell.x},${this.state.activeCell.y}`;
        this.elements.get('mode').textContent = this.state.isEditing ? 'Editar' : 'Jugar';
    }
}

class ModalManager {
    constructor(state, elements) {
        this.state = state;
        this.elements = elements;
    }

	saveMap() {
		const mapData = JSON.stringify(this.state.mapData);
		fetch('save.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: mapData,
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				alert('Map saved successfully!');
			} else {
				alert('Failed to save the map.');
			}
		})
		.catch(error => {
			console.error('Error saving map:', error);
			alert('An error occurred while saving the map.');
		});
	}
	
	fetchSavedMaps() {
		fetch('loadMap.php')
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					const mapList = data.maps; // Array of maps
					const modal = this.elements.get('modal');
					const modalTitle = this.elements.get('modalTitle');
					const mapJson = this.elements.get('mapJson');


					modalTitle.textContent = 'Select a Map to Load';
					mapJson.value = ''; // Clear the textarea
					mapJson.placeholder = ''; // Clear placeholder


					// Create a dropdown or list of maps
					const mapListContainer = document.createElement('div');
					mapListContainer.id = 'map-list-container';
					mapListContainer.style.maxHeight = '300px';
					mapListContainer.style.overflowY = 'auto';


					mapList.forEach(map => {
						const mapItem = document.createElement('div');
						mapItem.className = 'map-item';
						mapItem.textContent = `${map.category} - ${map.difficulty}`;
						mapItem.style.cursor = 'pointer';
						mapItem.style.padding = '8px';
						mapItem.style.borderBottom = '1px solid #ddd';


						mapItem.addEventListener('click', () => {
							this.loadMap(map.id); // Load the selected map
							modal.classList.remove('show'); // Close modal
						});


						mapListContainer.appendChild(mapItem);
					});


					mapJson.parentNode.replaceChild(mapListContainer, mapJson);
					modal.classList.add('show');
				} else {
					alert('Failed to fetch saved maps.');
				}
			})
			.catch(error => {
				console.error('Error fetching saved maps:', error);
				alert('An error occurred while fetching saved maps.');
			});
	}
/*
    loadMap() {
        this.elements.get('modalTitle').textContent = 'Cargar Mapa';
        this.elements.get('mapJson').value = '';
        this.elements.get('mapJson').placeholder = 'Pega tu JSON del mapa aquí...';
        this.elements.get('modal').classList.add('show');
    }
*/

	loadMap(mapId) {
		fetch(`loadMap.php?id=${mapId}`)
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					this.state.mapData = data.mapData; // Load the map data into the state
					this.mapRenderer.renderMap(); // Re-render the map
					this.gridManager.centerGrid(); // Center the grid
					this.uiManager.updateUI(); // Update the UI
					alert('Map loaded successfully!');
				} else {
					alert('Failed to load the map.');
				}
			})
			.catch(error => {
				console.error('Error loading map:', error);
				alert('An error occurred while loading the map.');
			});
	}

    closeModal() {
        this.elements.get('modal').classList.remove('show');
    }
    
    confirmModal() {
        if (this.elements.get('modalTitle').textContent === 'Guardar Mapa') {
            this.elements.get('mapJson').select();
            document.execCommand('copy');
            alert('¡Datos del mapa copiados al portapapeles!');
        } else {
            try {
                const data = JSON.parse(this.elements.get('mapJson').value);
                this.state.mapData = data;
                if (this.elements.get('categoryInput')) {
                    this.elements.get('categoryInput').value = data.category || '';
                }
                if (this.elements.get('difficultySelect')) {
                    this.elements.get('difficultySelect').value = data.difficulty || 'medio';
                }
                if (this.elements.get('descriptionInput')) {
                    this.elements.get('descriptionInput').value = data.description || '';
                }
                location.reload();
            } catch (e) {
                alert('¡Formato JSON inválido!');
                return;
            }
        }
        this.closeModal();
    }
}

class EventManager {
    constructor(state, elements, gridManager, heroManager, editorManager, uiManager, modalManager) {
        this.state = state;
        this.elements = elements;
        this.gridManager = gridManager;
        this.heroManager = heroManager;
        this.editorManager = editorManager;
        this.uiManager = uiManager;
        this.modalManager = modalManager;
        this.touches = {};
        this.lastDistance = 0;
    }
    
    setupEventListeners() {
        const self = this;
        
        this.elements.get('fab').addEventListener('click', function() {
            self.editorManager.toggleEditMode();
            self.uiManager.updateUI();
        });
        
        this.elements.get('viewport').addEventListener('mousedown', function(e) {
            self.handleMouseDown(e);
        });
        
        this.elements.get('viewport').addEventListener('mousemove', function(e) {
            self.handleMouseMove(e);
        });
        
        this.elements.get('viewport').addEventListener('mouseup', function() {
            self.handleMouseUp();
        });
        
        this.elements.get('viewport').addEventListener('wheel', function(e) {
            self.handleWheel(e);
        }, { passive: false });
        
        this.elements.get('viewport').addEventListener('touchstart', function(e) {
            self.handleTouchStart(e);
        }, { passive: false });
        
        this.elements.get('viewport').addEventListener('touchmove', function(e) {
            self.handleTouchMove(e);
        }, { passive: false });
        
        this.elements.get('viewport').addEventListener('touchend', function(e) {
            self.handleTouchEnd(e);
        }, { passive: false });
        
        document.addEventListener('keydown', function(e) {
            self.handleKeyDown(e);
        });
        
        this.elements.get('clearBtn').addEventListener('click', function() {
            self.editorManager.clearMap();
        });
        
        this.elements.get('saveBtn').addEventListener('click', function() {
            self.modalManager.saveMap();
        });
/*      
        this.elements.get('loadBtn').addEventListener('click', function() {
            self.modalManager.loadMap();
        });
*/
		this.elements.get('loadBtn').addEventListener('click', function() {
			//this.fetchSavedMaps();
            self.modalManager.fetchSavedMaps();
		});

        
        this.elements.get('modalCancel').addEventListener('click', function() {
            self.modalManager.closeModal();
        });
        
        this.elements.get('modalConfirm').addEventListener('click', function() {
            self.modalManager.confirmModal();
        });
        
        document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!self.state.isEditing) {
                    self.heroManager.moveHero(btn.dataset.dir);
                    self.uiManager.updateUI();
                }
            });
        });
        
        this.elements.get('pickDropBtn').addEventListener('click', function() {
            self.heroManager.pickDrop();
        });
        
        this.elements.get('heroSwitchBtn').addEventListener('click', function() {
            self.heroManager.switchHero();
        });
        
        window.addEventListener('resize', function() {
            self.gridManager.centerGrid();
            self.gridManager.followActiveCell();
        });
    }
    
    handleMouseDown(e) {
        if (e.target.classList.contains('cell') && this.state.isEditing) {
            this.editorManager.handleCellClick(e.target);
        } else {
            this.state.isDragging = true;
            this.state.dragStart = { x: e.clientX, y: e.clientY };
        }
    }
    
    handleMouseMove(e) {
        if (this.state.isDragging) {
            const dx = e.clientX - this.state.dragStart.x;
            const dy = e.clientY - this.state.dragStart.y;
            this.gridManager.pan(dx, dy);
            this.state.dragStart = { x: e.clientX, y: e.clientY };
        } else if (e.target.classList.contains('cell') && this.state.isEditing) {
            e.target.classList.add('editor-hover');
        }
    }
    
    handleMouseUp() {
        this.state.isDragging = false;
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('editor-hover');
        });
    }
    
    handleWheel(e) {
        e.preventDefault();
        const delta = -e.deltaY * Config.ZOOM_SPEED;
        this.gridManager.zoom(delta, e.clientX, e.clientY);
        this.uiManager.updateUI();
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        Array.from(e.touches).forEach(touch => {
            this.touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY
            };
        });
        
        if (e.touches.length === 1 && e.target.classList.contains('cell') && this.state.isEditing) {
            this.editorManager.handleCellClick(e.target);
        } else if (e.touches.length === 2) {
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
            if (last && !this.state.isEditing) {
                this.gridManager.pan(touch.clientX - last.x, touch.clientY - last.y);
                this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
            }
        } else if (e.touches.length === 2) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const distance = this.getDistance(t1, t2);
            const center = this.getCenter(t1, t2);
            
            if (this.lastDistance > 0) {
                const delta = (distance - this.lastDistance) * Config.PINCH_ZOOM_SPEED;
                this.gridManager.zoom(delta, center.x, center.y);
                this.uiManager.updateUI();
            }
            this.lastDistance = distance;
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
            delete this.touches[touch.identifier];
        });
        if (e.touches.length < 2) {
            this.lastDistance = 0;
        }
    }
    
    handleKeyDown(e) {
        if (this.state.isEditing) return;
        
        switch(e.key) {
            case 'ArrowUp': 
                this.heroManager.moveHero('up');
                this.uiManager.updateUI();
                break;
            case 'ArrowDown': 
                this.heroManager.moveHero('down');
                this.uiManager.updateUI();
                break;
            case 'ArrowLeft': 
                this.heroManager.moveHero('left');
                this.uiManager.updateUI();
                break;
            case 'ArrowRight': 
                this.heroManager.moveHero('right');
                this.uiManager.updateUI();
                break;
            case ' ': 
                this.heroManager.pickDrop();
                e.preventDefault();
                break;
        }
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

class App {
    constructor() {
        this.state = new State();
        this.elements = new ElementCache();
        this.mapRenderer = new MapRenderer(this.state);
        this.gridManager = new GridManager(this.state, this.elements);
        this.heroManager = new HeroManager(this.state, this.elements, this.gridManager, this.mapRenderer);
        this.editorManager = new EditorManager(this.state, this.elements, this.mapRenderer);
        this.uiManager = new UIManager(this.state, this.elements, this.gridManager);
        this.modalManager = new ModalManager(this.state, this.elements);
        this.eventManager = new EventManager(
            this.state, 
            this.elements, 
            this.gridManager, 
            this.heroManager, 
            this.editorManager, 
            this.uiManager, 
            this.modalManager
        );
    }
    
    init() {
        this.elements.cache();
        this.gridManager.setupGrid();
        this.heroManager.setupHero();
        this.editorManager.setupEditor();
        this.eventManager.setupEventListeners();
        this.mapRenderer.renderMap();
        this.gridManager.centerGrid();
        this.uiManager.updateUI();
        
        const self = this;
        requestAnimationFrame(function gameLoop(time) {
            self.heroManager.update(time);
            requestAnimationFrame(gameLoop);
        });
    }
}

// Initialize the app
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        app = new App();
        app.init();
    });
} else {
    app = new App();
    app.init();
}
