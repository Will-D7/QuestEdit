const Utils = {
    getInitialPosition: function(gridWidth, gridHeight) {
        return {
            x: Math.floor(gridWidth / 2),
            y: Math.floor(gridHeight / 2)
        };
    },
    getAnimationName: function(rowIndex) {
        const animations = window.i18n.get('animations');
        if (Array.isArray(animations) && animations[rowIndex]) {
            return animations[rowIndex];
        }
        const animation = Config.animationRows[rowIndex];
        return animation ? animation.name : `Row ${rowIndex + 1}`;
    },
    calculatePath: function(startX, startY, endX, endY) {
        const path = [];
        let currentX = startX;
        let currentY = startY;
        while (currentX !== endX || currentY !== endY) {
            if (currentX !== endX) {
                currentX += currentX < endX ? 1 : -1;
                path.push({ x: currentX, y: currentY });
            }
            else if (currentY !== endY) {
                currentY += currentY < endY ? 1 : -1;
                path.push({ x: currentX, y: currentY });
            }
        }
        return path;
    },
    getDirection: function(fromX, fromY, toX, toY) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        if (dx > 0) return 'right';
        if (dx < 0) return 'left';
        if (dy > 0) return 'down';
        if (dy < 0) return 'up';
        return 'down';
    },
    validateGridSize: function(width, height) {
        return {
            width: Math.max(Config.grid.minWidth, Math.min(Config.grid.maxWidth, width || Config.grid.defaultWidth)),
            height: Math.max(Config.grid.minHeight, Math.min(Config.grid.maxHeight, height || Config.grid.defaultHeight))
        };
    },
    getKeyCommand: function(key) {
        const shortcuts = Config.ui.shortcuts;
        for (const [command, keys] of Object.entries(shortcuts)) {
            if (keys.includes(key)) {
                return command;
            }
        }
        return null;
    },
    parseCommands: function(text) {
        const lines = text.trim().split('\n');
        const commands = [];
        const commandMap = {
            'up': 'up', 'arriba': 'up',
            'down': 'down', 'abajo': 'down',
            'left': 'left', 'izquierda': 'left',
            'right': 'right', 'derecha': 'right',
            'pick': 'pick', 'tomar': 'pick',
            'drop': 'drop', 'soltar': 'drop'
        };
        for (const line of lines) {
            const inputCommand = line.trim().toLowerCase();
            const normalizedCommand = commandMap[inputCommand];
            if (normalizedCommand && Config.commands.validCommands.includes(normalizedCommand)) {
                commands.push(normalizedCommand);
            }
        }
        return commands;
    },
    calculateGridScale: function(containerWidth, containerHeight, gridWidth, gridHeight) {
        const gridPixelWidth = gridWidth * Config.grid.cellSize;
        const gridPixelHeight = gridHeight * Config.grid.cellSize;
        const scaleX = containerWidth / gridPixelWidth;
        const scaleY = containerHeight / gridPixelHeight;
        return Math.min(scaleX, scaleY, 1);
    }
};
window.Utils = Utils;