const Utils = {
    getInitialPosition: function(gridWidth, gridHeight) {
        return {
            x: Math.floor(gridWidth / 2),
            y: Math.floor(gridHeight / 2)
        };
    },
    isValidPosition: function(x, y, gridWidth, gridHeight) {
        return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
    },
    getGridIndex: function(x, y, gridWidth) {
        return y * gridWidth + x;
    },
    getPositionFromIndex: function(index, gridWidth) {
        return {
            x: index % gridWidth,
            y: Math.floor(index / gridWidth)
        };
    },
    getAnimationName: function(rowIndex) {
        const animations = window.i18n ? window.i18n.get('animations') : null;
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
    getOppositeDirection: function(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        return opposites[direction] || direction;
    },
    getPerpendicularDirections: function(direction) {
        return ['left', 'right', 'up', 'down'];
    },
    getDirectionDelta: function(direction) {
        const deltas = {
            'up': { dx: 0, dy: -1 },
            'down': { dx: 0, dy: 1 },
            'left': { dx: -1, dy: 0 },
            'right': { dx: 1, dy: 0 }
        };
        return deltas[direction] || { dx: 0, dy: 0 };
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
        const aliases = Config.commands.commandAliases;
        for (const line of lines) {
            const inputCommand = line.trim().toLowerCase();
            let canonicalCommand = null;
            for (const [command, aliasList] of Object.entries(aliases)) {
                if (aliasList.includes(inputCommand)) {
                    canonicalCommand = command;
                    break;
                }
            }
            if (canonicalCommand && Config.commands.validCommands.includes(canonicalCommand)) {
                commands.push(canonicalCommand);
            }
        }
        return commands;
    },
    calculateGridScale: function(containerWidth, containerHeight, gridWidth, gridHeight, padding = 40) {
        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;
        const gridPixelWidth = gridWidth * Config.grid.cellSize;
        const gridPixelHeight = gridHeight * Config.grid.cellSize;
        const scaleX = availableWidth / gridPixelWidth;
        const scaleY = availableHeight / gridPixelHeight;
        return Math.min(scaleX, scaleY, 1);
    },
    saveToStorage: function(key, value) {
        try {
            const prefixedKey = Config.storage.prefix + key;
            localStorage.setItem(prefixedKey, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Failed to save to storage:', e);
            return false;
        }
    },
    loadFromStorage: function(key, defaultValue = null) {
        try {
            const prefixedKey = Config.storage.prefix + key;
            const stored = localStorage.getItem(prefixedKey);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from storage:', e);
            return defaultValue;
        }
    },
    clearStorage: function() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(Config.storage.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.warn('Failed to clear storage:', e);
            return false;
        }
    },
    applyTheme: function(theme) {
        if (!Config.theme.available.includes(theme)) {
            theme = Config.theme.default;
        }
        document.body.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        if (Config.theme.savePreference) {
            this.saveToStorage(Config.theme.storageKey, theme);
        }
        return theme;
    },
    getCurrentTheme: function() {
        return document.body.getAttribute('data-theme') || Config.theme.default;
    },
    toggleTheme: function() {
        const current = this.getCurrentTheme();
        const next = current === 'light' ? 'dark' : 'light';
        return this.applyTheme(next);
    },
    lerp: function(start, end, t) {
        return start + (end - start) * t;
    },
    easeInOutCubic: function(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    log: function(category, ...args) {
        if (Config.debug.enabled && Config.debug[category]) {
            console.log(`[${category.toUpperCase()}]`, ...args);
        }
    },
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randomChoice: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    createCellElement: function(x, y, additionalClasses = []) {
        const cell = document.createElement('div');
        cell.className = ['grid-cell', ...additionalClasses].join(' ');
        cell.dataset.x = x;
        cell.dataset.y = y;
        return cell;
    }
};
window.Utils = Utils;