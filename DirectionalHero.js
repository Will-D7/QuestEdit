class DirectionalHero {
    constructor(options = {}) {
        this.config = {
            ...Config.sprite,
            ...Config.movement,
            gridWidth: Config.grid.defaultWidth,
            gridHeight: Config.grid.defaultHeight,
            cellSize: Config.grid.cellSize,
            container: document.body,
            ...options
        };
        this.currentRow = 0;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isMoving = false;
        this.lastFrameTime = 0;
        this.animationId = null;
        this.currentDirection = 'down';
        const initialPos = Utils.getInitialPosition(this.config.gridWidth, this.config.gridHeight);
        this.gridX = initialPos.x;
        this.gridY = initialPos.y;
        this.movementQueue = [];
        this.moveTimeoutId = null;
        this.directionAnimations = {
            up: Config.animation.directions.up,
            down: Config.animation.directions.down,
            left: Config.animation.directions.left,
            right: Config.animation.directions.right
        };
        this.showPath = Config.movement.showPath;
        this.preserveTrail = Config.movement.preserveTrail;
        this.pathDots = [];
        this.onPositionChange = null;
        this.onFrameChange = null;
        this.onMovementComplete = null;
        this.init();
    }
    init() {
        this.sprite = document.createElement('div');
        this.sprite.className = 'hero-sprite';
        this.sprite.style.width = `${this.config.frameWidth * this.config.scale}px`;
        this.sprite.style.height = `${this.config.frameHeight * this.config.scale}px`;
        this.sprite.style.backgroundImage = `url('${this.config.spriteSheet}')`;
        this.sprite.style.backgroundRepeat = 'no-repeat';
        const totalWidth = this.config.frameWidth * this.config.framesPerRow * this.config.scale;
        const totalHeight = this.config.frameHeight * this.config.totalRows * this.config.scale;
        this.sprite.style.backgroundSize = `${totalWidth}px ${totalHeight}px`;
        this.config.container.appendChild(this.sprite);
        this.setRow(this.directionAnimations[this.currentDirection]);
        this.currentFrame = this.config.idleFrame;
        this.updateSpriteFrame();
        this.updateGridPosition(false);
    }
    updateSpriteFrame() {
        const xPos = this.currentFrame * this.config.frameWidth * this.config.scale;
        const yPos = this.currentRow * this.config.frameHeight * this.config.scale;
        this.sprite.style.backgroundPosition = `-${xPos}px -${yPos}px`;
    }
    updateGridPosition(animate = true) {
        const x = this.gridX * this.config.cellSize + (this.config.cellSize - this.config.frameWidth * this.config.scale) / 2;
        const y = this.gridY * this.config.cellSize + (this.config.cellSize - this.config.frameHeight * this.config.scale) / 2;
        if (animate) {
            this.config.container.style.transition = `all ${this.config.moveSpeed}ms ease`;
        } else {
            this.config.container.style.transition = '';
        }
        this.config.container.style.left = `${x}px`;
        this.config.container.style.top = `${y}px`;
        if (this.onPositionChange) {
            this.onPositionChange(this.gridX, this.gridY);
        }
    }
    moveTo(targetX, targetY) {
        targetX = Math.max(0, Math.min(this.config.gridWidth - 1, targetX));
        targetY = Math.max(0, Math.min(this.config.gridHeight - 1, targetY));
        if (targetX === this.gridX && targetY === this.gridY) return;
        const path = Utils.calculatePath(this.gridX, this.gridY, targetX, targetY);
        this.movementQueue.push(...path);
        if (!this.isMoving) {
            this.processMovementQueue();
        }
    }
    processMovementQueue() {
        if (this.movementQueue.length === 0) {
            this.isMoving = false;
            this.pause();
            this.currentFrame = this.config.idleFrame;
            this.updateSpriteFrame();
            if (this.onMovementComplete) {
                this.onMovementComplete();
            }
            return;
        }
        this.isMoving = true;
        const nextPosition = this.movementQueue.shift();
        const direction = Utils.getDirection(this.gridX, this.gridY, nextPosition.x, nextPosition.y);
        this.currentDirection = direction;
        this.setRow(this.directionAnimations[direction]);
        if (!this.isPlaying) {
            this.play();
        }
        if (this.showPath) {
            this.createPathDot(this.gridX, this.gridY);
        }
        this.gridX = nextPosition.x;
        this.gridY = nextPosition.y;
        this.updateGridPosition(true);
        this.moveTimeoutId = setTimeout(() => {
            this.processMovementQueue();
        }, this.config.moveSpeed);
    }
    createPathDot(x, y) {
        const dot = document.createElement('div');
        dot.className = 'path-dot';
        if (!this.preserveTrail) {
            dot.classList.add('fading');
        }
        const gridContainer = document.getElementById('grid-container');
        dot.style.left = `${x * this.config.cellSize + this.config.cellSize / 2 - 5}px`;
        dot.style.top = `${y * this.config.cellSize + this.config.cellSize / 2 - 5}px`;
        gridContainer.appendChild(dot);
        this.pathDots.push(dot);
        if (!this.preserveTrail) {
            setTimeout(() => {
                dot.remove();
                const index = this.pathDots.indexOf(dot);
                if (index > -1) {
                    this.pathDots.splice(index, 1);
                }
            }, Config.movement.pathDotDuration);
        }
    }
    clearTrail() {
        this.pathDots.forEach(dot => dot.remove());
        this.pathDots = [];
    }
    move(direction) {
        const moves = {
            'up': [0, -1],
            'down': [0, 1],
            'left': [-1, 0],
            'right': [1, 0]
        };
        if (moves[direction]) {
            const [dx, dy] = moves[direction];
            this.moveTo(this.gridX + dx, this.gridY + dy);
        }
    }
    executeCommands(commands) {
        let currentX = this.gridX;
        let currentY = this.gridY;
        for (const command of commands) {
            const moves = {
                'up': [0, -1],
                'down': [0, 1],
                'left': [-1, 0],
                'right': [1, 0]
            };
            if (moves[command]) {
                const [dx, dy] = moves[command];
                currentX = Math.max(0, Math.min(this.config.gridWidth - 1, currentX + dx));
                currentY = Math.max(0, Math.min(this.config.gridHeight - 1, currentY + dy));
                this.movementQueue.push({ x: currentX, y: currentY });
            }
        }
        if (!this.isMoving && this.movementQueue.length > 0) {
            this.processMovementQueue();
        }
    }
    stop() {
        this.movementQueue = [];
        if (this.moveTimeoutId) {
            clearTimeout(this.moveTimeoutId);
            this.moveTimeoutId = null;
        }
        this.isMoving = false;
        this.pause();
        this.currentFrame = this.config.idleFrame;
        this.updateSpriteFrame();
    }
    setRow(row) {
        this.currentRow = row % this.config.totalRows;
        this.updateSpriteFrame();
    }
    setFPS(fps) {
        this.config.fps = fps;
    }
    setMoveSpeed(speed) {
        this.config.moveSpeed = speed;
    }
    setIdleFrame(frame) {
        this.config.idleFrame = frame % this.config.framesPerRow;
        if (!this.isPlaying && !this.isMoving) {
            this.currentFrame = this.config.idleFrame;
            this.updateSpriteFrame();
        }
    }
    setDirectionAnimation(direction, row) {
        this.directionAnimations[direction] = row;
    }
    setShowPath(show) {
        this.showPath = show;
    }
    setPreserveTrail(preserve) {
        this.preserveTrail = preserve;
        if (!preserve) {
            this.pathDots.forEach(dot => {
                if (!dot.classList.contains('fading')) {
                    dot.classList.add('fading');
                    setTimeout(() => {
                        dot.remove();
                        const index = this.pathDots.indexOf(dot);
                        if (index > -1) {
                            this.pathDots.splice(index, 1);
                        }
                    }, Config.movement.pathDotDuration);
                }
            });
        }
    }
    updateGridSize(width, height) {
        this.config.gridWidth = width;
        this.config.gridHeight = height;
        this.gridX = Math.min(this.gridX, width - 1);
        this.gridY = Math.min(this.gridY, height - 1);
        this.stop();
        this.updateGridPosition(false);
    }
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }
    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    animate() {
        if (!this.isPlaying) return;
        const now = performance.now();
        const frameDuration = 1000 / this.config.fps;
        const deltaTime = now - this.lastFrameTime;
        if (deltaTime >= frameDuration) {
            this.currentFrame = (this.currentFrame + 1) % this.config.framesPerRow;
            this.updateSpriteFrame();
            this.lastFrameTime = now;
            if (this.onFrameChange) {
                this.onFrameChange(this.currentRow, this.currentFrame);
            }
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    destroy() {
        this.stop();
        this.clearTrail();
        if (this.sprite && this.sprite.parentNode) {
            this.sprite.parentNode.removeChild(this.sprite);
        }
    }
}