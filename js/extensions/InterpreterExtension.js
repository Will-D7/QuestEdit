class InterpreterExtension extends Extension {
    init() {
        this.reset();
        this.on('interpreter:run', (code) => this.run(code));
        this.on('interpreter:pause', () => this.pause());
        this.on('interpreter:resume', () => this.resume());
        this.on('interpreter:step', () => this.stepSingle());
        this.on('interpreter:stop', () => this.stop());
        this.lastStepTime = 0;
    }
    reset() {
        this.pc = 0;
        this.dataStack = [];
        this.callStack = [];
        this.registers = {};
        this.commands = [];
        this.labels = {};
        for (let i = 0; i < 16; i++) {
            this.registers['r' + i.toString(16)] = 0;
        }
        this.updateDebugInfo();
    }
    parse(code) {
        const lines = code.trim().split('\n').filter(l => l && !l.trim().startsWith('//'));
        this.commands = [];
        this.labels = {};
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.endsWith(':')) {
                this.labels[trimmed.slice(0, -1)] = this.commands.length;
            } else if (trimmed) {
                const parts = trimmed.split(/\s+/);
                this.commands.push(parts);
            }
        });
    }
    run(code) {
        this.reset();
        this.parse(code);
        this.state.set('program.running', true);
        this.state.set('program.paused', false);
    }
    pause() {
        this.state.set('program.paused', true);
    }
    resume() {
        this.state.set('program.paused', false);
    }
    stop() {
        this.state.set('program.running', false);
        this.state.set('program.paused', false);
        this.reset();
    }
    stepSingle() {
        if (this.commands.length === 0) {
            const code = this.state.get('program.code');
            if (!code) return;
            this.parse(code);
        }
        const continueRunning = this.step();
        if (!continueRunning) {
            this.pc = 0;
        }
    }
    step() {
        if (this.pc >= this.commands.length) {
            this.state.set('program.running', false);
            return false;
        }
        if (this.state.get('hero.moving')) {
            return true; 
        }
        const cmd = this.commands[this.pc];
        const op = cmd[0];
        if (['up', 'down', 'left', 'right', '^', 'v', '<', '>'].includes(op)) {
            const dir = { '^': 'up', 'v': 'down', '<': 'left', '>': 'right' }[op] || op;
            this.emit('hero:move', dir);
        }
        else if (op === 'interact') {
            this.emit('hero:interact');
        }
        else if (op === 'copy' && cmd.length >= 3) {
            const reg = cmd[1];
            const val = this.getValue(cmd[2]);
            if (this.registers.hasOwnProperty(reg)) {
                this.registers[reg] = val;
            }
        }
        else if (op === 'add' && cmd.length >= 3) {
            const reg = cmd[1];
            const val = this.getValue(cmd[2]);
            if (this.registers.hasOwnProperty(reg)) {
                this.registers[reg] += val;
            }
        } else if (op === 'sub' && cmd.length >= 3) {
            const reg = cmd[1];
            const val = this.getValue(cmd[2]);
            if (this.registers.hasOwnProperty(reg)) {
                this.registers[reg] -= val;
            }
        } else if (op === 'mul' && cmd.length >= 3) {
            const reg = cmd[1];
            const val = this.getValue(cmd[2]);
            if (this.registers.hasOwnProperty(reg)) {
                this.registers[reg] *= val;
            }
        }
        else if (op === 'jump' && this.labels[cmd[1]] !== undefined) {
            this.pc = this.labels[cmd[1]] - 1;
        } else if (op === 'call' && this.labels[cmd[1]] !== undefined) {
            if (this.callStack.length < Config.MAX_CALL_STACK_DEPTH) {
                this.callStack.push(this.pc);
                this.pc = this.labels[cmd[1]] - 1;
            }
        } else if (op === 'return') {
            if (this.callStack.length > 0) {
                this.pc = this.callStack.pop();
            } else {
                return false;
            }
        }
        else if (op === 'ifZero' && cmd.length >= 3) {
            const val = this.getValue(cmd[1]);
            if (val === 0 && this.labels[cmd[2]] !== undefined) {
                this.pc = this.labels[cmd[2]] - 1;
            }
        } else if (op === 'ifEmpty' && cmd.length >= 2) {
            const heroExt = this.app.getExtension('hero');
            const next = heroExt.getNextCell();
            if (!next || next.cell === 0 || next.cell === '0') {
                if (this.labels[cmd[1]] !== undefined) {
                    this.pc = this.labels[cmd[1]] - 1;
                }
            }
        }
        this.pc++;
        this.updateDebugInfo();
        return true;
    }
    getValue(operand) {
        if (this.registers.hasOwnProperty(operand)) {
            return this.registers[operand];
        }
        return parseInt(operand) || 0;
    }
    updateDebugInfo() {
        const hero = this.state.get('hero');
        const updates = {
            pc: this.pc.toString(),
            pos: `(${hero.x},${hero.y})`,
            dir: hero.dir,
            stack: '[' + this.dataStack.slice(-5).join(',') + ']',
            regs: `r0=${this.registers.r0} r1=${this.registers.r1}`
        };
        Object.entries(updates).forEach(([key, value]) => {
            const el = document.getElementById(`debug-${key}`);
            if (el) el.textContent = value;
        });
    }
    update(deltaTime, time) {
        if (!this.state.get('program.running') || 
            this.state.get('program.paused') || 
            this.commands.length === 0) return;
        const speed = this.state.get('program.speed');
        const stepInterval = 1000 / speed;
        if (time - this.lastStepTime >= stepInterval) {
            const continueRunning = this.step();
            if (!continueRunning) {
                this.state.set('program.running', false);
                this.state.set('program.paused', false);
            }
            this.lastStepTime = time;
        }
    }
}