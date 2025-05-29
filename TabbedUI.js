class TabbedUI {
    constructor(hero) {
        this.hero = hero;
        this.currentTab = Config.ui.defaultTab;
        this.collectiblesManager = new CollectiblesManager();
        this.collectiblesManager.init(this.hero);
        this.initElements();
        this.createGrid();
        this.setupEventListeners();
        this.populateSelects();
        this.updatePositionDisplay();
        this.syncControlsWithHero();
        this.updateGridScale();
    }
    initElements() {
        this.grid = document.getElementById('grid');
        this.gridContainer = document.getElementById('grid-container');
        this.gridWrapper = document.getElementById('grid-wrapper');
        this.tabHeaders = document.querySelectorAll('.tab-header');
        this.contentPanels = document.querySelectorAll('.content-panel');
        this.floatingControls = document.getElementById('floating-controls');
        this.showFloatingControls = document.getElementById('show-floating-controls');
        this.commandInput = document.getElementById('command-input');
        this.executeButton = document.getElementById('execute-commands');
        this.positionDisplay = document.getElementById('position');
        this.clickMove = document.getElementById('click-move');
        this.showPath = document.getElementById('show-path');
        this.preserveTrail = document.getElementById('preserve-trail');
        this.clearTrailBtn = document.getElementById('clear-trail');
        this.moveSpeed = document.getElementById('move-speed');
        this.moveSpeedValue = document.getElementById('move-speed-value');
        this.gridWidthInput = document.getElementById('grid-width');
        this.gridHeightInput = document.getElementById('grid-height');
        this.resizeButton = document.getElementById('resize-grid');
        this.animationSelect = document.getElementById('animation-select');
        this.playButton = document.getElementById('play-button');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedValue = document.getElementById('speed-value');
        this.idleFrame = document.getElementById('idle-frame');
    }
    createGrid() {
        this.grid.innerHTML = '';
        const wrapperRect = this.gridWrapper.getBoundingClientRect();
        const padding = 40;
        const availableWidth = wrapperRect.width - padding;
        const availableHeight = wrapperRect.height - padding - 100;
        const maxCellWidth = availableWidth / this.hero.config.gridWidth;
        const maxCellHeight = availableHeight / this.hero.config.gridHeight;
        const cellSize = Math.min(maxCellWidth, maxCellHeight, 100);
        this.gridContainer.style.width = `${cellSize * this.hero.config.gridWidth}px`;
        this.gridContainer.style.height = `${cellSize * this.hero.config.gridHeight}px`;
        this.grid.style.gridTemplateColumns = `repeat(${this.hero.config.gridWidth}, ${cellSize}px)`;
        this.grid.style.gridTemplateRows = `repeat(${this.hero.config.gridHeight}, ${cellSize}px)`;
        for (let y = 0; y < this.hero.config.gridHeight; y++) {
            for (let x = 0; x < this.hero.config.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.grid.appendChild(cell);
            }
        }
        this.hero.config.cellSize = cellSize;
        this.updateTargetCell(this.hero.gridX, this.hero.gridY);
        this.hero.updateGridPosition(false);
        if (this.collectiblesManager) {
            this.collectiblesManager.collectibles.forEach(collectible => {
                if (!collectible.isCarried) {
                    collectible.updatePosition();
                }
            });
        }
    }
    updateGridScale() {
        this.gridContainer.style.transform = '';
    }
    setupEventListeners() {
        this.tabHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const tabName = header.dataset.tab;
                this.switchTab(tabName);
            });
        });
        window.addEventListener('resize', () => {
            this.createGrid();
        });
        document.addEventListener('keydown', (e) => {
            const activeElement = document.activeElement;
            const isInputField = activeElement.tagName === 'INPUT' || 
                               activeElement.tagName === 'TEXTAREA' || 
                               activeElement.tagName === 'SELECT';
            if (isInputField) {
                return;
            }
            const command = Utils.getKeyCommand(e.key);
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                this.collectiblesManager.handleSpaceKey();
                return;
            }
            if (command) {
                e.preventDefault();
                switch (command) {
                    case 'moveUp':
                        this.hero.move('up');
                        break;
                    case 'moveDown':
                        this.hero.move('down');
                        break;
                    case 'moveLeft':
                        this.hero.move('left');
                        break;
                    case 'moveRight':
                        this.hero.move('right');
                        break;
                    case 'returnToGrid':
                        this.switchTab('grid');
                        break;
                    case 'nextTab':
                        this.switchToNextTab();
                        break;
                }
            }
        });
        this.grid.addEventListener('click', (e) => {
            if (this.clickMove.checked && e.target.classList.contains('grid-cell')) {
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                this.hero.moveTo(x, y);
            }
        });
        document.querySelectorAll('.float-move-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hero.move(btn.dataset.dir);
            });
        });
        this.showFloatingControls.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.floatingControls.classList.remove('hidden');
            } else {
                this.floatingControls.classList.add('hidden');
            }
        });
        this.executeButton.addEventListener('click', () => {
            const commands = Utils.parseCommands(this.commandInput.value);
            if (commands.length > 0) {
                this.executeCommandSequence(commands);
                this.switchTab('grid');
            }
        });
        this.showPath.addEventListener('change', (e) => {
            this.hero.setShowPath(e.target.checked);
        });
        this.preserveTrail.addEventListener('change', (e) => {
            this.hero.setPreserveTrail(e.target.checked);
        });
        this.clearTrailBtn.addEventListener('click', () => {
            this.hero.clearTrail();
        });
        this.moveSpeed.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.hero.setMoveSpeed(value);
            this.moveSpeedValue.textContent = `${value}ms`;
        });
        this.resizeButton.addEventListener('click', () => {
            const size = Utils.validateGridSize(
                parseInt(this.gridWidthInput.value),
                parseInt(this.gridHeightInput.value)
            );
            this.hero.updateGridSize(size.width, size.height);
            this.createGrid();
        });
        this.animationSelect.addEventListener('change', (e) => {
            this.hero.setRow(parseInt(e.target.value));
        });
        this.playButton.addEventListener('click', () => {
            if (this.hero.isPlaying) {
                this.hero.pause();
                this.updatePlayButton(false);
            } else {
                this.hero.play();
                this.updatePlayButton(true);
            }
        });
        this.speedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.hero.setFPS(value);
            this.updateSpeedDisplay(value);
        });
        this.idleFrame.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            this.hero.setIdleFrame(value);
        });
        this.hero.onPositionChange = (x, y) => {
            this.updatePositionDisplay();
            this.updateTargetCell(x, y);
        };
        this.hero.onFrameChange = (row, frame) => {
            if (this.animationSelect.value != row) {
                this.animationSelect.value = row;
            }
        };
    }
    switchTab(tabName) {
        if (!Config.ui.tabs.includes(tabName)) return;
        this.currentTab = tabName;
        this.tabHeaders.forEach(header => {
            header.classList.toggle('active', header.dataset.tab === tabName);
        });
        this.contentPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
        if (tabName === 'settings') {
            this.updatePlayButton(this.hero.isPlaying);
        }
        if (tabName === 'grid') {
            setTimeout(() => this.updateGridScale(), 100);
        }
    }
    switchToNextTab() {
        const tabs = Config.ui.tabs;
        const currentIndex = tabs.indexOf(this.currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        this.switchTab(tabs[nextIndex]);
    }
    populateSelects() {
        this.animationSelect.innerHTML = '';
        for (let i = 0; i < this.hero.config.totalRows; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = Utils.getAnimationName(i);
            this.animationSelect.appendChild(option);
        }
        this.animationSelect.value = this.hero.currentRow;
    }
    syncControlsWithHero() {
        this.clickMove.checked = Config.movement.clickToMove;
        this.showPath.checked = this.hero.showPath;
        this.preserveTrail.checked = this.hero.preserveTrail;
        this.moveSpeed.value = this.hero.config.moveSpeed;
        this.moveSpeedValue.textContent = `${this.hero.config.moveSpeed}ms`;
        this.speedSlider.value = this.hero.config.fps;
        this.updateSpeedDisplay(this.hero.config.fps);
        this.idleFrame.value = this.hero.config.idleFrame;
        this.gridWidthInput.value = this.hero.config.gridWidth;
        this.gridHeightInput.value = this.hero.config.gridHeight;
        this.showFloatingControls.checked = Config.movement.showFloatingControls;
        if (!Config.movement.showFloatingControls) {
            this.floatingControls.classList.add('hidden');
        }
    }
    updatePositionDisplay() {
        const posText = window.i18n.get('settings.position', { x: this.hero.gridX, y: this.hero.gridY });
        this.positionDisplay.textContent = posText;
        this.positionDisplay.setAttribute('data-x', this.hero.gridX);
        this.positionDisplay.setAttribute('data-y', this.hero.gridY);
    }
    updateTargetCell(x, y) {
        document.querySelectorAll('.grid-cell.target').forEach(cell => {
            cell.classList.remove('target');
        });
        const index = y * this.hero.config.gridWidth + x;
        const targetCell = this.grid.children[index];
        if (targetCell) {
            targetCell.classList.add('target');
        }
    }
    updatePlayButton(isPlaying) {
        const buttonText = this.playButton.querySelector('.button-text');
        const key = isPlaying ? 'settings.pauseAnimation' : 'settings.playAnimation';
        buttonText.textContent = window.i18n.get(key);
        buttonText.setAttribute('data-i18n', key);
        this.playButton.classList.toggle('playing', isPlaying);
    }
    updateSpeedDisplay(value) {
        const speedText = window.i18n.get('settings.fps', { value: value });
        this.speedValue.textContent = speedText;
        this.speedValue.setAttribute('data-value', value);
    }
    refreshAnimationNames() {
        this.populateSelects();
    }
    executeCommandSequence(commands) {
        let delay = 0;
        const moveCommands = ['up', 'down', 'left', 'right'];
        commands.forEach(command => {
            if (moveCommands.includes(command)) {
                setTimeout(() => {
                    this.hero.move(command);
                }, delay);
                delay += this.hero.config.moveSpeed;
            } else if (command === 'pick') {
                setTimeout(() => {
                    this.collectiblesManager.tryPickup();
                }, delay);
                delay += 300;
            } else if (command === 'drop') {
                setTimeout(() => {
                    this.collectiblesManager.tryDrop();
                }, delay);
                delay += 300;
            }
        });
    }
    destroy() {
    }
}
window.addEventListener('languageChanged', () => {
    if (window.app && window.app.ui) {
        window.app.ui.refreshAnimationNames();
        window.app.ui.updatePositionDisplay();
        window.app.ui.updateSpeedDisplay(window.app.ui.speedSlider.value);
        window.app.ui.updatePlayButton(window.app.hero.isPlaying);
    }
});