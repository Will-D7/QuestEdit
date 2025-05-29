class App {
    constructor() {
        this.hero = null;
        this.ui = null;
        this.init();
    }
    init() {
        if (!this.checkRequiredElements()) {
            console.error('Required elements not found. Please check your HTML.');
            return;
        }
        this.hero = new DirectionalHero({
            container: document.getElementById('hero-container'),
            spriteSheet: Config.sprite.spriteSheet,
            frameWidth: Config.sprite.frameWidth,
            frameHeight: Config.sprite.frameHeight,
            framesPerRow: Config.sprite.framesPerRow,
            totalRows: Config.sprite.totalRows,
            scale: Config.sprite.scale,
            fps: Config.sprite.defaultFPS,
            idleFrame: Config.sprite.idleFrame,
            gridWidth: Config.grid.defaultWidth,
            gridHeight: Config.grid.defaultHeight,
            cellSize: Config.grid.cellSize,
            moveSpeed: Config.movement.defaultSpeed
        });
        this.ui = new TabbedUI(this.hero);
        this.addInitialAnimations();
        console.log('%c╔═══════════════════════════════╗', 'color: #7C3AED');
        console.log('%c║  SPRITE HERO ADVENTURE v1.0   ║', 'color: #7C3AED; font-weight: bold');
        console.log('%c╚═══════════════════════════════╝', 'color: #7C3AED');
    }
    checkRequiredElements() {
        const requiredIds = [
            'hero-container',
            'grid-container',
            'grid-wrapper',
            'grid',
            'position',
            'animation-select',
            'play-button',
            'speed-slider',
            'speed-value',
            'floating-controls',
            'command-input',
            'execute-commands'
        ];
        for (const id of requiredIds) {
            if (!document.getElementById(id)) {
                console.error(`Required element with id '${id}' not found.`);
                return false;
            }
        }
        return true;
    }
    addInitialAnimations() {
        setTimeout(() => {
            this.hero.setRow(6);
            this.hero.play();
            setTimeout(() => {
                this.hero.pause();
                this.hero.setRow(Config.animation.directions.down);
                this.hero.currentFrame = Config.sprite.idleFrame;
                this.hero.updateSpriteFrame();
            }, 2000);
        }, 500);
    }
    getHero() {
        return this.hero;
    }
    getUI() {
        return this.ui;
    }
    executeCommands(commandString) {
        const commands = Utils.parseCommands(commandString);
        if (commands.length > 0) {
            this.hero.executeCommands(commands);
            return true;
        }
        return false;
    }
    teleportTo(x, y) {
        this.hero.gridX = Math.max(0, Math.min(this.hero.config.gridWidth - 1, x));
        this.hero.gridY = Math.max(0, Math.min(this.hero.config.gridHeight - 1, y));
        this.hero.updateGridPosition(false);
    }
    setGridSize(width, height) {
        const size = Utils.validateGridSize(width, height);
        this.hero.updateGridSize(size.width, size.height);
        this.ui.createGrid();
    }
    destroy() {
        if (this.hero) {
            this.hero.destroy();
        }
        if (this.ui) {
            this.ui.destroy();
        }
    }
}
let app = null;
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
    setTimeout(() => {
        app = new App();
        window.app = app;
        console.log('%c🕹️ Debug Commands:', 'color: #8B5CF6; font-weight: bold');
        console.log('  app.getHero() - Access hero instance');
        console.log('  app.getUI() - Access UI controller');
        console.log('  app.executeCommands("down\\nright\\nup") - Execute movement commands');
        console.log('  app.teleportTo(x, y) - Teleport to position');
        console.log('  app.setGridSize(width, height) - Resize grid');
    }, 100);
});
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});
