class ProgrammingDebugExtension extends Extension {
    init() {
        this.tabContent = this.createElement('div', {
            className: 'tab-content',
            dataset: { content: 'debug' }
        });
        this.createDebugInfo();
        document.getElementById('tab-contents').appendChild(this.tabContent);
    }
    createDebugInfo() {
        const debugInfo = this.createElement('div', { id: 'debug-info' });
        ['pc', 'pos', 'dir', 'stack', 'regs'].forEach(field => {
            const line = this.createElement('div', {}, [
                field.toUpperCase() + ': ',
                this.createElement('span', { id: `debug-${field}` }, ['0'])
            ]);
            debugInfo.appendChild(line);
        });
        this.tabContent.appendChild(debugInfo);
    }
}