class GameLoop {
    constructor() {
        this.running = false;
        this.updaters = [];
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameId = null;
    }
    register(updater) {
        if (typeof updater === 'function') {
            this.updaters.push(updater);
        } else if (updater && typeof updater.update === 'function') {
            this.updaters.push((dt, time) => updater.update(dt, time));
        }
        return () => this.unregister(updater);
    }
    unregister(updater) {
        const index = this.updaters.indexOf(updater);
        if (index > -1) {
            this.updaters.splice(index, 1);
        }
    }
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }
    stop() {
        this.running = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    loop() {
        if (!this.running) return;
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.updaters.forEach(updater => {
            try {
                updater(this.deltaTime, currentTime);
            } catch (error) {
                console.error('GameLoop update error:', error);
            }
        });
        this.frameId = requestAnimationFrame(() => this.loop());
    }
    pause() {
        this.running = false;
    }
    resume() {
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            this.loop();
        }
    }
}