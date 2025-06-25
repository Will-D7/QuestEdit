class ProgrammingExtension extends Extension {
    init() {
        this.createProgrammingFAB();
        this.createProgrammingPanel();
        this.observe('mode', (mode) => {
            const isProgram = mode === 'program';
            this.elements.fab.classList.toggle('active', isProgram);
            this.elements.panel.classList.toggle('show', isProgram);
        });
		this.on('blocks:compiled', (code) => {
			const codeArea = document.getElementById('code');
			if (codeArea) {
				codeArea.value = code;
				this.emit('blocks:compile');
			}
		});
    }
    createProgrammingFAB() {
        const fab = this.createElement('button', {
            className: 'prog-fab',
            id: 'prog-fab',
            title: 'Programación',
            textContent: '{ }',
            onclick: () => this.app.toggleMode('program')
        });
        this.app.getContainer().appendChild(fab);
        this.elements.fab = fab;
    }
    createProgrammingPanel() {
        const panel = this.createElement('div', {
            className: 'prog-panel',
            id: 'prog-panel'
        });
        const tabs = this.createElement('div', { className: 'tabs' });
        ['program', 'blocks', 'debug'].forEach(tab => {
            tabs.appendChild(this.createElement('button', {
                className: `tab-btn${tab === 'program' ? ' active' : ''}`,
                dataset: { tab },
                textContent: tab === 'program' ? 'Código' : tab === 'blocks' ? 'Bloques' : 'Debug',
                onclick: () => this.switchTab(tab)
            }));
        });
        panel.appendChild(tabs);
        const tabContents = this.createElement('div');
        tabContents.id = 'tab-contents';
        panel.appendChild(tabContents);
        this.app.getContainer().appendChild(panel);
        this.elements.panel = panel;
    }
    switchTab(tabName) {
        document.querySelectorAll('#prog-panel .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('#prog-panel .tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });
    }
}