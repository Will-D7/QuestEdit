const Config = {
    sprite: {
        spriteSheet: 'sprite-sheet.png',
        frameWidth: 32,
        frameHeight: 32,
        framesPerRow: 3,
        totalRows: 8,
        scale: 2,
        defaultFPS: 8,
        idleFrame: 1
    },
    grid: {
        defaultWidth: 7,
        defaultHeight: 5,
        minWidth: 3,
        maxWidth: 10,
        minHeight: 3,
        maxHeight: 10,
        cellSize: 70,
        cellGap: 2
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
        showFloatingControls: true
    },
    animation: {
        minFPS: 0,
        maxFPS: 15,
        defaultFPS: 8,
        directions: {
            down: 0,
            right: 1,
            up: 2,
            left: 3
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
            returnToGrid: ['Escape'],
            nextTab: ['Tab']
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
        executionDelay: 50
    }
};
window.Config = Config;