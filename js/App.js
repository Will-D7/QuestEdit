const CELL_SIZE = 128;
const DEFAULT_MAP = {
	category: "",
	difficulty: "medio",
	description: "",
	itemTypes: {
		A: { width: "90%", height: "90%", color: "#FF6B6B", transparency: 0.9, borderType: "solid", borderWidth: 3, borderColor: "#EE5A6F", pickable: true, stepable: false, stackable: true },
		B: { width: "70%", height: "70%", color: "#4ECDC4", transparency: 0.9, borderType: "dashed", borderWidth: 2, borderColor: "#45B7B8", pickable: true, stepable: false, stackable: true },
		C: { width: "50%", height: "50%", color: "#FFE66D", transparency: 0.8, borderType: "solid", borderWidth: 2, borderColor: "#FFD93D", pickable: true, stepable: false, stackable: true },
		D: { width: "100%", height: "100%", color: "#B794F4", transparency: 0.3, borderType: "none", pickable: false, stepable: true, stackable: true },
		E: { width: "80%", height: "80%", color: "#F687B3", transparency: 1.0, borderType: "double", borderWidth: 3, borderColor: "#D53F8C", pickable: true, stepable: false, stackable: true }
	},
	map: [[0,0,0,0,0,0,"A:★"],[0,"A,B:8",0,0,0,0,"C:🎯"],[0,0,"A:😃","D",0,0,0],["B:♥",0,0,"B:あ",0,"A:🎮",0],["E:$",0,0,0,"C:♣",0,0]]
};
const HERO_FRAMES = {
	down: [[2,1], [2,2], [2,3]],
	left: [[0,2], [0,3], [0,1]],
	right: [[1,0], [1,1], [1,2]],
	up: [[0,0], [1,3], [2,0]]
};
const state = {
	isEditing: false,
	selectedType: 'A',
	eraserMode: false,
	scale: 1,
	offsetX: 0,
	offsetY: 0,
	activeCell: { x: 0, y: 0 },
	mapData: JSON.parse(JSON.stringify(DEFAULT_MAP)),
	isDragging: false,
	dragStart: { x: 0, y: 0 },
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
	}
};
const elements = {};
let animFrame = 0;
let lastAnimTime = 0;
function init() {
	cacheElements();
	setupGrid();
	setupHero();
	setupEditor();
	setupEventListeners();
	renderMap();
	centerGrid();
	updateUI();
	requestAnimationFrame(gameLoop);
}
function cacheElements() {
	elements.viewport = document.getElementById('viewport');
	elements.fab = document.getElementById('fab');
	elements.editorPanel = document.getElementById('editor-panel');
	elements.gridSize = document.getElementById('grid-size');
	elements.zoom = document.getElementById('zoom');
	elements.cell = document.getElementById('cell');
	elements.mode = document.getElementById('mode');
	elements.clearBtn = document.getElementById('clear-btn');
	elements.saveBtn = document.getElementById('save-btn');
	elements.loadBtn = document.getElementById('load-btn');
	elements.modal = document.getElementById('save-load-modal');
	elements.mapJson = document.getElementById('map-json');
	elements.modalTitle = document.getElementById('modal-title');
	elements.modalCancel = document.getElementById('modal-cancel');
	elements.modalConfirm = document.getElementById('modal-confirm');
	elements.heroLayer = document.getElementById('hero-layer');
	elements.hero = document.getElementById('hero');
	elements.heroItem = document.getElementById('hero-item');
	elements.pickDropBtn = document.getElementById('pick-drop');
	elements.heroSwitchBtn = document.getElementById('hero-switch');
	elements.categoryInput = document.getElementById('map-category');
	elements.difficultySelect = document.getElementById('map-difficulty');
	elements.descriptionInput = document.getElementById('map-description');
}
function setupGrid() {
	const container = document.getElementById('grid-container');
	const grid = document.createElement('div');
	grid.className = 'grid';
	const { cols, rows } = getMapDimensions();
	grid.style.gridTemplateColumns = `repeat(${cols}, ${CELL_SIZE}px)`;
	state.cells = [];
	for (let y = 0; y < rows; y++) {
		state.cells[y] = [];
		for (let x = 0; x < cols; x++) {
			const cell = createCell(x, y);
			grid.appendChild(cell);
			state.cells[y][x] = cell;
		}
	}
	container.appendChild(grid);
	elements.container = container;
	elements.grid = grid;
	updateActiveCell();
}
function setupHero() {
	loadHeroSprite();
	updateHeroPosition();
}
function loadHeroSprite() {
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
		elements.hero.style.backgroundImage = `url(${canvas.toDataURL()})`;
		elements.hero.style.backgroundSize = '384px 512px';
		updateHeroSprite();
	};
	img.src = `hero${String(state.hero.sheet + 1).padStart(2, '0')}.png`;
}
function createCell(x, y) {
	const cell = document.createElement('div');
	cell.className = 'cell';
	cell.dataset.x = x;
	cell.dataset.y = y;
	return cell;
}
function getMapDimensions() {
	const map = state.mapData.map;
	return {
		rows: map.length,
		cols: Math.max(...map.map(row => row.length))
	};
}
function setupEditor() {
	setupTabs();
	setupItemTypes();
	setupTypeEditor();
	setupSettings();
	updateItemTypesGrid();
}
function setupSettings() {
	elements.categoryInput.value = state.mapData.category || '';
	elements.difficultySelect.value = state.mapData.difficulty || 'medio';
	elements.descriptionInput.value = state.mapData.description || '';
	elements.categoryInput.addEventListener('input', (e) => {
		state.mapData.category = e.target.value;
	});
	elements.difficultySelect.addEventListener('change', (e) => {
		state.mapData.difficulty = e.target.value;
	});
	elements.descriptionInput.addEventListener('input', (e) => {
		state.mapData.description = e.target.value;
	});
}
function setupTabs() {
	const tabs = document.querySelectorAll('.tab-btn');
	const contents = document.querySelectorAll('.tab-content');
	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			tabs.forEach(t => t.classList.remove('active'));
			contents.forEach(c => c.classList.remove('active'));
			tab.classList.add('active');
			const content = document.querySelector(`[data-content="${tab.dataset.tab}"]`);
			content.classList.add('active');
		});
	});
}
function setupItemTypes() {
	const eraserBtn = document.getElementById('eraser-btn');
	eraserBtn.addEventListener('click', () => {
		state.eraserMode = !state.eraserMode;
		eraserBtn.textContent = state.eraserMode ? '✏️ Modo Dibujo' : '🧹 Modo Borrador';
		eraserBtn.classList.toggle('btn-primary', state.eraserMode);
		updateItemTypesGrid();
	});
}
function setupTypeEditor() {
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
	function updateTypeSelector() {
		selector.innerHTML = '';
		Object.keys(state.mapData.itemTypes).forEach(type => {
			const option = document.createElement('option');
			option.value = type;
			option.textContent = `Tipo ${type}`;
			selector.appendChild(option);
		});
		loadTypeSettings();
	}
	function loadTypeSettings() {
		const type = state.mapData.itemTypes[selector.value];
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
	}
	selector.addEventListener('change', loadTypeSettings);
	sizeInput.addEventListener('input', (e) => {
		const size = e.target.value;
		sizeValue.textContent = `${size}%`;
		updateTypeProperty('width', `${size}%`);
		updateTypeProperty('height', `${size}%`);
	});
	colorInput.addEventListener('input', (e) => {
		colorPreview.style.backgroundColor = e.target.value;
		updateTypeProperty('color', e.target.value);
	});
	transparencyInput.addEventListener('input', (e) => {
		transparencyValue.textContent = e.target.value;
		updateTypeProperty('transparency', parseFloat(e.target.value));
	});
	borderSelect.addEventListener('change', (e) => {
		updateTypeProperty('borderType', e.target.value);
	});
	pickableCheck.addEventListener('change', (e) => {
		updateTypeProperty('pickable', e.target.checked);
	});
	stepableCheck.addEventListener('change', (e) => {
		updateTypeProperty('stepable', e.target.checked);
	});
	stackableCheck.addEventListener('change', (e) => {
		updateTypeProperty('stackable', e.target.checked);
	});
	addTypeBtn.addEventListener('click', () => {
		const newType = String.fromCharCode(65 + Object.keys(state.mapData.itemTypes).length);
		state.mapData.itemTypes[newType] = {
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
		updateItemTypesGrid();
		selector.value = newType;
		loadTypeSettings();
	});
	updateTypeSelector();
}
function updateTypeProperty(prop, value) {
	const type = document.getElementById('type-selector').value;
	state.mapData.itemTypes[type][prop] = value;
	updateItemTypesGrid();
	renderMap();
}
function updateItemTypesGrid() {
	const grid = document.getElementById('item-types-grid');
	grid.innerHTML = '';
	Object.entries(state.mapData.itemTypes).forEach(([type, props]) => {
		const btn = document.createElement('button');
		btn.className = 'item-type-btn';
		btn.dataset.type = type;
		if (state.selectedType === type && !state.eraserMode) {
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
		btn.addEventListener('click', () => {
			state.selectedType = type;
			state.eraserMode = false;
			document.getElementById('eraser-btn').textContent = '🧹 Modo Borrador';
			updateItemTypesGrid();
		});
		grid.appendChild(btn);
	});
}
function setupEventListeners() {
	elements.fab.addEventListener('click', toggleEditMode);
	elements.viewport.addEventListener('mousedown', handleMouseDown);
	elements.viewport.addEventListener('mousemove', handleMouseMove);
	elements.viewport.addEventListener('mouseup', handleMouseUp);
	elements.viewport.addEventListener('wheel', handleWheel, { passive: false });
	elements.viewport.addEventListener('touchstart', handleTouchStart, { passive: false });
	elements.viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
	elements.viewport.addEventListener('touchend', handleTouchEnd, { passive: false });
	document.addEventListener('keydown', handleKeyDown);
	elements.clearBtn.addEventListener('click', clearMap);
	elements.saveBtn.addEventListener('click', saveMap);
	elements.loadBtn.addEventListener('click', loadMap);
	elements.modalCancel.addEventListener('click', closeModal);
	elements.modalConfirm.addEventListener('click', confirmModal);
	document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
		btn.addEventListener('click', () => {
			if (!state.isEditing) {
				moveHero(btn.dataset.dir);
			}
		});
	});
	elements.pickDropBtn.addEventListener('click', pickDrop);
	elements.heroSwitchBtn.addEventListener('click', switchHero);
	window.addEventListener('resize', () => {
		centerGrid();
		followActiveCell();
	});
}
function toggleEditMode() {
	state.isEditing = !state.isEditing;
	elements.fab.classList.toggle('editing', state.isEditing);
	elements.editorPanel.classList.toggle('show', state.isEditing);
	const actionBtns = document.querySelectorAll('.action-btn');
	actionBtns.forEach(btn => btn.classList.toggle('hidden', !state.isEditing));
	updateUI();
}
function handleMouseDown(e) {
	if (e.target.classList.contains('cell') && state.isEditing) {
		handleCellClick(e.target);
	} else {
		state.isDragging = true;
		state.dragStart = { x: e.clientX, y: e.clientY };
	}
}
function handleMouseMove(e) {
	if (state.isDragging) {
		const dx = e.clientX - state.dragStart.x;
		const dy = e.clientY - state.dragStart.y;
		pan(dx, dy);
		state.dragStart = { x: e.clientX, y: e.clientY };
	} else if (e.target.classList.contains('cell') && state.isEditing) {
		e.target.classList.add('editor-hover');
	}
}
function handleMouseUp() {
	state.isDragging = false;
	document.querySelectorAll('.cell').forEach(cell => {
		cell.classList.remove('editor-hover');
	});
}
function handleWheel(e) {
	e.preventDefault();
	const delta = -e.deltaY * 0.001;
	zoom(delta, e.clientX, e.clientY);
}
let touches = {};
let lastDistance = 0;
function handleTouchStart(e) {
	e.preventDefault();
	Array.from(e.touches).forEach(touch => {
		touches[touch.identifier] = {
			x: touch.clientX,
			y: touch.clientY
		};
	});
	if (e.touches.length === 1 && e.target.classList.contains('cell') && state.isEditing) {
		handleCellClick(e.target);
	} else if (e.touches.length === 2) {
		const [t1, t2] = e.touches;
		lastDistance = getDistance(t1, t2);
	}
}
function handleTouchMove(e) {
	e.preventDefault();
	if (e.touches.length === 1) {
		const touch = e.touches[0];
		const last = touches[touch.identifier];
		if (last && !state.isEditing) {
			pan(touch.clientX - last.x, touch.clientY - last.y);
			touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
		}
	} else if (e.touches.length === 2) {
		const [t1, t2] = e.touches;
		const distance = getDistance(t1, t2);
		const center = getCenter(t1, t2);
		if (lastDistance > 0) {
			const delta = (distance - lastDistance) * 0.01;
			zoom(delta, center.x, center.y);
		}
		lastDistance = distance;
	}
}
function handleTouchEnd(e) {
	e.preventDefault();
	Array.from(e.changedTouches).forEach(touch => {
		delete touches[touch.identifier];
	});
	if (e.touches.length < 2) {
		lastDistance = 0;
	}
}
function handleKeyDown(e) {
	if (state.isEditing) return;
	switch(e.key) {
		case 'ArrowUp': moveHero('up'); break;
		case 'ArrowDown': moveHero('down'); break;
		case 'ArrowLeft': moveHero('left'); break;
		case 'ArrowRight': moveHero('right'); break;
		case ' ': pickDrop(); e.preventDefault(); break;
	}
}
function handleCellClick(cell) {
	const x = parseInt(cell.dataset.x);
	const y = parseInt(cell.dataset.y);
	if (state.eraserMode) {
		state.mapData.map[y][x] = 0;
	} else {
		const text = document.getElementById('item-text').value || '';
		const cellData = `${state.selectedType}${text ? ':' + text : ''}`;
		const currentData = state.mapData.map[y][x];
		if (currentData && currentData !== 0) {
			state.mapData.map[y][x] = `${currentData},${cellData}`;
		} else {
			state.mapData.map[y][x] = cellData;
		}
	}
	renderMap();
}
function moveHero(dir) {
	if (state.hero.moving) return;
	state.hero.dir = dir;
	const { cols, rows } = getMapDimensions();
	let newX = state.hero.x;
	let newY = state.hero.y;
	switch(dir) {
		case 'up': newY--; break;
		case 'down': newY++; break;
		case 'left': newX--; break;
		case 'right': newX++; break;
	}
	if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
		const cellData = state.mapData.map[newY][newX];
		if (canStepOn(cellData)) {
			state.hero.moving = true;
			state.hero.targetX = newX;
			state.hero.targetY = newY;
			state.activeCell = { x: newX, y: newY };
			updateActiveCell();
			followActiveCell();
			updateUI();
		}
	}
}
function canStepOn(cellData) {
	if (!cellData || cellData === 0) return true;
	const items = parseCellData(cellData);
	return items.every(item => {
		const type = state.mapData.itemTypes[item.type];
		return type && type.stepable;
	});
}
function switchHero() {
	state.hero.sheet = (state.hero.sheet + 1) % 8;
	loadHeroSprite();
}
function pickDrop() {
	const { x, y, dir } = state.hero;
	let targetX = x, targetY = y;
	switch(dir) {
		case 'up': targetY--; break;
		case 'down': targetY++; break;
		case 'left': targetX--; break;
		case 'right': targetX++; break;
	}
	const { cols, rows } = getMapDimensions();
	if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) return;
	if (state.hero.carrying) {
		const cellData = state.mapData.map[targetY][targetX];
		const items = cellData && cellData !== 0 ? parseCellData(cellData) : [];
		const carryingType = state.mapData.itemTypes[state.hero.carrying.type];
		const canPlace = items.every(item => {
			const type = state.mapData.itemTypes[item.type];
			return type && type.stackable;
		}) && (!items.length || carryingType.stackable);
		if (canPlace) {
			const itemStr = `${state.hero.carrying.type}${state.hero.carrying.text ? ':' + state.hero.carrying.text : ''}`;
			if (cellData && cellData !== 0) {
				state.mapData.map[targetY][targetX] = `${cellData},${itemStr}`;
			} else {
				state.mapData.map[targetY][targetX] = itemStr;
			}
			state.hero.carrying = null;
			elements.heroItem.innerHTML = '';
			renderMap();
		}
	} else {
		const cellData = state.mapData.map[targetY][targetX];
		if (cellData && cellData !== 0) {
			const items = parseCellData(cellData);
			let pickableIndex = -1;
			for (let i = items.length - 1; i >= 0; i--) {
				const type = state.mapData.itemTypes[items[i].type];
				if (type && type.pickable) {
					pickableIndex = i;
					break;
				}
			}
			if (pickableIndex >= 0) {
				state.hero.carrying = items[pickableIndex];
				items.splice(pickableIndex, 1);
				if (items.length) {
					state.mapData.map[targetY][targetX] = items.map(item => 
						`${item.type}${item.text ? ':' + item.text : ''}`
					).join(',');
				} else {
					state.mapData.map[targetY][targetX] = 0;
				}
				const itemEl = createGameItem(state.hero.carrying, state.mapData.itemTypes[state.hero.carrying.type]);
				itemEl.style.position = 'relative';
				itemEl.style.width = '40px';
				itemEl.style.height = '40px';
				itemEl.style.left = '0';
				itemEl.style.top = '0';
				const text = itemEl.querySelector('.game-item-text');
				if (text) text.style.fontSize = '16px';
				elements.heroItem.innerHTML = '';
				elements.heroItem.appendChild(itemEl);
				renderMap();
			}
		}
	}
}
function pan(dx, dy) {
	state.offsetX += dx;
	state.offsetY += dy;
	updateTransform();
}
function zoom(delta, centerX, centerY) {
	const oldScale = state.scale;
	state.scale = Math.max(0.25, Math.min(4, state.scale + delta));
	const scaleDiff = state.scale - oldScale;
	state.offsetX -= (centerX - state.offsetX) * scaleDiff / oldScale;
	state.offsetY -= (centerY - state.offsetY) * scaleDiff / oldScale;
	updateTransform();
	updateUI();
}
function updateTransform() {
	elements.container.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
	elements.heroLayer.style.transform = elements.container.style.transform;
}
function updateActiveCell() {
	state.cells.forEach(row => row.forEach(cell => cell.classList.remove('active')));
	const { x, y } = state.activeCell;
	if (state.cells[y] && state.cells[y][x]) {
		state.cells[y][x].classList.add('active');
	}
}
function followActiveCell() {
	const { x, y } = state.activeCell;
	const cellX = x * CELL_SIZE * state.scale;
	const cellY = y * CELL_SIZE * state.scale;
	const cellW = CELL_SIZE * state.scale;
	const cellH = CELL_SIZE * state.scale;
	const viewW = elements.viewport.clientWidth;
	const viewH = elements.viewport.clientHeight;
	const cellLeft = state.offsetX + cellX;
	const cellRight = cellLeft + cellW;
	const cellTop = state.offsetY + cellY;
	const cellBottom = cellTop + cellH;
	const padding = 40;
	if (cellLeft < padding) {
		state.offsetX += padding - cellLeft;
	} else if (cellRight > viewW - padding) {
		state.offsetX -= cellRight - viewW + padding;
	}
	if (cellTop < padding) {
		state.offsetY += padding - cellTop;
	} else if (cellBottom > viewH - padding) {
		state.offsetY -= cellBottom - viewH + padding;
	}
	updateTransform();
}
function centerGrid() {
	const { cols, rows } = getMapDimensions();
	const gridW = cols * CELL_SIZE * state.scale;
	const gridH = rows * CELL_SIZE * state.scale;
	const viewW = elements.viewport.clientWidth;
	const viewH = elements.viewport.clientHeight;
	state.offsetX = (viewW - gridW) / 2;
	state.offsetY = (viewH - gridH) / 2;
	updateTransform();
}
function renderMap() {
	state.cells.forEach(row => {
		row.forEach(cell => {
			cell.querySelectorAll('.game-item').forEach(item => item.remove());
		});
	});
	const { map, itemTypes } = state.mapData;
	map.forEach((row, y) => {
		row.forEach((cellData, x) => {
			if (cellData && cellData !== 0) {
				const items = parseCellData(cellData);
				items.forEach((item, i) => {
					const element = createGameItem(item, itemTypes[item.type]);
					if (state.cells[y] && state.cells[y][x]) {
						state.cells[y][x].appendChild(element);
					}
				});
			}
		});
	});
}
function parseCellData(cellData) {
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
function createGameItem(item, props) {
	const element = document.createElement('div');
	element.className = 'game-item';
	const width = parseFloat(props.width) * CELL_SIZE / 100;
	const height = parseFloat(props.height) * CELL_SIZE / 100;
	element.style.width = `${width}px`;
	element.style.height = `${height}px`;
	element.style.left = `${(CELL_SIZE - width) / 2}px`;
	element.style.top = `${(CELL_SIZE - height) / 2}px`;
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
function updateUI() {
	const { cols, rows } = getMapDimensions();
	elements.gridSize.textContent = `${cols}×${rows}`;
	elements.zoom.textContent = `${Math.round(state.scale * 100)}%`;
	elements.cell.textContent = `${state.activeCell.x},${state.activeCell.y}`;
	elements.mode.textContent = state.isEditing ? 'Editar' : 'Jugar';
}
function clearMap() {
	if (confirm('¿Limpiar todo el mapa?')) {
		const { cols, rows } = getMapDimensions();
		state.mapData.map = Array(rows).fill(0).map(() => Array(cols).fill(0));
		renderMap();
	}
}
function saveMap() {
	elements.modalTitle.textContent = 'Guardar Mapa';
	elements.mapJson.value = JSON.stringify(state.mapData, null, 2);
	elements.modal.classList.add('show');
	elements.mapJson.select();
}
function loadMap() {
	elements.modalTitle.textContent = 'Cargar Mapa';
	elements.mapJson.value = '';
	elements.mapJson.placeholder = 'Pega tu JSON del mapa aquí...';
	elements.modal.classList.add('show');
}
function closeModal() {
	elements.modal.classList.remove('show');
}
function confirmModal() {
	if (elements.modalTitle.textContent === 'Guardar Mapa') {
		elements.mapJson.select();
		document.execCommand('copy');
		alert('¡Datos del mapa copiados al portapapeles!');
	} else {
		try {
			const data = JSON.parse(elements.mapJson.value);
			state.mapData = data;
			if (elements.categoryInput) {
				elements.categoryInput.value = data.category || '';
			}
			if (elements.difficultySelect) {
				elements.difficultySelect.value = data.difficulty || 'medio';
			}
			if (elements.descriptionInput) {
				elements.descriptionInput.value = data.description || '';
			}
			location.reload();
		} catch (e) {
			alert('¡Formato JSON inválido!');
			return;
		}
	}
	closeModal();
}
function getDistance(t1, t2) {
	const dx = t1.clientX - t2.clientX;
	const dy = t1.clientY - t2.clientY;
	return Math.sqrt(dx * dx + dy * dy);
}
function getCenter(t1, t2) {
	return {
		x: (t1.clientX + t2.clientX) / 2,
		y: (t1.clientY + t2.clientY) / 2
	};
}
function updateHeroPosition() {
	elements.hero.style.left = `${state.hero.x * CELL_SIZE}px`;
	elements.hero.style.top = `${state.hero.y * CELL_SIZE}px`;
}
function updateHeroSprite() {
	const frame = HERO_FRAMES[state.hero.dir][state.hero.frame % 3];
	elements.hero.style.backgroundPosition = `-${frame[0] * 128}px -${frame[1] * 128}px`;
}
function gameLoop(time) {
	if (state.hero.moving) {
		const speed = 0.15;
		const dx = state.hero.targetX - state.hero.x;
		const dy = state.hero.targetY - state.hero.y;
		if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
			state.hero.x += dx * speed;
			state.hero.y += dy * speed;
			updateHeroPosition();
			if (time - lastAnimTime > 100) {
				state.hero.frame++;
				updateHeroSprite();
				lastAnimTime = time;
			}
		} else {
			state.hero.x = state.hero.targetX;
			state.hero.y = state.hero.targetY;
			state.hero.moving = false;
			updateHeroPosition();
		}
	} else if (time - lastAnimTime > 400) {
		state.hero.frame = 0;
		updateHeroSprite();
		lastAnimTime = time;
	}
	requestAnimationFrame(gameLoop);
}
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}