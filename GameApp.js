document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const gridContainerWrapper = document.createElement('div');
    gridContainerWrapper.className = 'grid-container-wrapper';
    const stageArea = document.createElement('div');
    stageArea.className = 'stage-area';
    const gridWrapper = document.createElement('div');
    gridWrapper.id = 'grid-wrapper';
    gridWrapper.className = 'grid-wrapper';
    const gridContainer = document.createElement('div');
    gridContainer.id = 'grid-container';
    gridContainer.className = 'grid-container';
    const gridElement = document.createElement('div');
    gridElement.id = 'grid';
    gridElement.className = 'grid';
    const heroContainer = document.createElement('div');
    heroContainer.id = 'hero-container';
    heroContainer.className = 'hero-container';
    gridContainer.appendChild(gridElement);
    gridContainer.appendChild(heroContainer);
    gridWrapper.appendChild(gridContainer);
    stageArea.appendChild(gridWrapper);
    gridContainerWrapper.appendChild(stageArea);
    body.appendChild(gridContainerWrapper);
    const demo = new FloatingControlsDemo();
    let grid, hero, gameItems;
    const initializeGame = async () => {
        grid = new Grid({
            width: Config.grid.defaultWidth,
            height: Config.grid.defaultHeight
        });
        hero = new DirectionalHero({
            container: heroContainer,
            gridWidth: Config.grid.defaultWidth,
            gridHeight: Config.grid.defaultHeight,
            cellSize: grid.config.cellSize
        });
        gameItems = new GameItemManager();
        await gameItems.init(hero);
        gameItems.initializeItemsWithGridSize(grid.config.cellSize);
        window.hero = hero;
        window.gameItems = gameItems;
        grid.onCellClick = (x, y) => {
            if (Config.movement.clickToMove) {
                hero.moveTo(x, y);
            }
        };
        grid.onGridResize = (newCellSize) => {
            hero.config.cellSize = newCellSize;
            hero.updateGridPosition(false);
            gameItems.handleGridResize(newCellSize);
        };
        hero.onPositionChange = (x, y) => {
            grid.setTargetCell(x, y);
        };
        grid.setTargetCell(hero.gridX, hero.gridY);
        document.addEventListener('keydown', (e) => {
            const command = Utils.getKeyCommand(e.key);
            if (!command) return;
            e.preventDefault();
            switch (command) {
                case 'moveUp':
                    hero.move('up');
                    break;
                case 'moveDown':
                    hero.move('down');
                    break;
                case 'moveLeft':
                    hero.move('left');
                    break;
                case 'moveRight':
                    hero.move('right');
                    break;
                case 'interact':
                    gameItems.handleSpaceKey();
                    break;
            }
        });
        window.addEventListener('resize', () => {
            grid.handleResize();
        });
    };
    initializeGame().catch(error => {
        console.error('Failed to initialize game:', error);
    });
});