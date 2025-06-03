const Config = {
    sprite: {
        //spriteSheet: 'sprite-arceus.png',
        spriteSheet: 'sprite-gloria.png',
        frameWidth: 64,
        frameHeight: 64,
        framesPerRow: 4,
        totalRows: 4,
        scale: 1,
        defaultFPS: 4,
        idleFrame: 0
    },
    grid: {
        defaultWidth: 7,
        defaultHeight: 5,
        minWidth: 3,
        maxWidth: 10,
        minHeight: 3,
        maxHeight: 10,
        cellSize: 70,
        cellGap: 0
    },
    movement: {
        defaultSpeed: 300,
        minSpeed: 100,
        maxSpeed: 1000,
        speedStep: 50,
        clickToMove: true,
        showPath: false,
        preserveTrail: false,
        pathDotDuration: 2000,
        showFloatingControls: true,
        allowTurnInPlace: true 
    },
    animation: {
        minFPS: 0,
        maxFPS: 15,
        defaultFPS: 8,
        directions: {
            down: 0,
            left: 1,
            right: 2,
            up: 3
        }
    },
    ui: {
        defaultTab: 'grid',
        tabs: ['grid', 'commands', 'settings'],
        shortcuts: {
            moveUp: ['ArrowUp', 'w', 'W'],
            moveDown: ['ArrowDown', 's', 'S'],
            moveLeft: ['ArrowLeft', 'a', 'A'],
            moveRight: ['ArrowRight', 'd', 'D'],
            interact: [' ', 'Space', 'e', 'E'],
            returnToGrid: ['Escape'],
            nextTab: ['Tab'],
            prevTab: ['Shift+Tab']
        }
    },
    animationRows: [
        { name: '⬆️ Walk Up', row: 0 },
        { name: '⬇️ Walk Down', row: 1 },
        { name: '⬅️ Walk Left', row: 2 },
        { name: '➡️ Walk Right', row: 3 },
        { name: '⚔️ Attack', row: 4 },
        { name: '🛡️ Defend', row: 5 },
        { name: '🎉 Victory', row: 6 },
        { name: '💫 Special', row: 7 }
    ],
    commands: {
        validCommands: ['up', 'down', 'left', 'right', 'pick', 'drop'],
        executionDelay: 50,
        commandAliases: {
            'up': ['up', 'arriba', 'u'],
            'down': ['down', 'abajo', 'd'],
            'left': ['left', 'izquierda', 'l'],
            'right': ['right', 'derecha', 'r'],
            'pick': ['pick', 'tomar', 'grab', 'p'],
            'drop': ['drop', 'soltar', 'leave', 'dr']
        }
    },
    theme: {
        default: 'light',
        available: ['light', 'dark'],
        savePreference: true,
        storageKey: 'spriteHeroTheme'
    },
    gameItems: {
        mapFile: 'map.json',
        defaultStackOffset: 10, 
        defaultItemTypes: {}
    },
    storage: {
        prefix: 'spriteHero_',
        keys: {
            language: 'preferredLanguage',
            theme: 'theme',
            gridSize: 'gridSize',
            moveSpeed: 'moveSpeed',
            animationSpeed: 'animationSpeed',
            showControls: 'showControls',
            clickToMove: 'clickToMove',
            showPath: 'showPath',
            preserveTrail: 'preserveTrail'
        }
    },
    debug: {
        enabled: true,
        showGrid: true,
        showCoordinates: true,
        showFPS: false,
        logMovement: false,
        logCommands: true
    }
};
window.Config = Config;
