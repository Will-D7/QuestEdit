class ProgrammingCodeExtension extends Extension {
    init() {
        this.tabContent = this.createElement('div', {
            className: 'tab-content active',
            dataset: { content: 'program' }
        });
        this.createCodeArea();
        this.createControls();
        this.observe('program.running', () => this.updateRunButton());
        this.observe('program.paused', () => this.updateRunButton());
        document.getElementById('tab-contents').appendChild(this.tabContent);
    }
    createCodeArea() {
        this.codeArea = this.createElement('textarea', {
            id: 'code',
            placeholder: '// Comandos: up, down, left, right, interact\n// Control: jump label, call label, return',
            value: '// Mover y recoger\nright\nright\ninteract\ndown\ndown\ninteract'
        });
        this.tabContent.appendChild(this.codeArea);
    }
    createControls() {
        const btnGroup = this.createElement('div', { className: 'btn-group' });
        this.runBtn = this.createElement('button', {
            className: 'btn btn-primary',
            textContent: '▶ Ejecutar',
            onclick: () => this.toggleExecution()
        });
        const stepBtn = this.createElement('button', {
            className: 'btn btn-secondary',
            textContent: 'Paso',
            onclick: () => this.step()
        });
        const stopBtn = this.createElement('button', {
            className: 'btn btn-secondary',
            textContent: '⏹ Detener',
            onclick: () => this.stop()
        });
        btnGroup.appendChild(this.runBtn);
        btnGroup.appendChild(stepBtn);
        btnGroup.appendChild(stopBtn);
        this.tabContent.appendChild(btnGroup);
        const speedControl = this.createElement('div', { className: 'speed-control' }, ['Velocidad: ']);
        const speedInput = this.createElement('input', {
            type: 'range',
            id: 'speed',
            min: Config.PROGRAM_SPEED_MIN,
            max: Config.PROGRAM_SPEED_MAX,
            value: Config.PROGRAM_SPEED_DEFAULT,
            oninput: (e) => {
                this.state.set('program.speed', parseInt(e.target.value));
                this.speedVal.textContent = e.target.value + '/s';
            }
        });
        this.speedVal = this.createElement('span', {
            id: 'speedVal',
            textContent: Config.PROGRAM_SPEED_DEFAULT + '/s'
        });
        speedControl.appendChild(speedInput);
        speedControl.appendChild(this.speedVal);
        this.tabContent.appendChild(speedControl);
    }
    toggleExecution() {
        const running = this.state.get('program.running');
        const paused = this.state.get('program.paused');
        if (!running) {
            this.run();
        } else if (!paused) {
            this.pause();
        } else {
            this.resume();
        }
    }
    run() {
        const code = this.codeArea.value;
        this.state.set('program.code', code);
        this.state.set('program.running', true);
        this.emit('interpreter:run', code);
    }
    pause() {
        this.emit('interpreter:pause');
    }
    resume() {
        this.emit('interpreter:resume');
    }
    stop() {
        this.state.set('program.running', false);
        this.state.set('program.paused', false);
        this.emit('interpreter:stop');
    }
    step() {
        const code = this.codeArea.value;
        this.state.set('program.code', code);
        this.emit('interpreter:step');
    }
    updateRunButton() {
        const running = this.state.get('program.running');
        const paused = this.state.get('program.paused');
        if (!running) {
            this.runBtn.textContent = '▶ Ejecutar';
            this.runBtn.className = 'btn btn-primary';
        } else if (!paused) {
            this.runBtn.textContent = '⏸ Pausar';
            this.runBtn.className = 'btn btn-warning';
        } else {
            this.runBtn.textContent = '▶ Continuar';
            this.runBtn.className = 'btn btn-success';
        }
    }
}