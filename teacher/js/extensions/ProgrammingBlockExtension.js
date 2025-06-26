class ProgrammingBlockExtension extends Extension {
    init() {
        this.commandConfig = {
            'up': { args: [] },
            'down': { args: [] },
            'left': { args: [] },
            'right': { args: [] },
            'interact': { args: [] },
			'jump': { 
				args: [{ type: 'label', placeholder: 'etiqueta' }] 
			},
			'call': { 
				args: [{ type: 'label', placeholder: 'etiqueta' }] 
			},
            'return': { args: [] },
			'ifZero': { 
				args: [
					{ type: 'register', placeholder: 'r0' },
					{ type: 'label', placeholder: 'etiqueta' }
				]
			},
			'ifEmpty': { 
				args: [{ type: 'label', placeholder: 'etiqueta' }] 
			},
            'copy': { args: [
                { type: 'register', placeholder: 'dest' },
                { type: 'value', placeholder: 'valor' }
            ]},
            'add': { args: [
                { type: 'register', placeholder: 'rX' },
                { type: 'value', placeholder: 'valor' }
            ]},
            'sub': { args: [
                { type: 'register', placeholder: 'rX' },
                { type: 'value', placeholder: 'valor' }
            ]},
            'mul': { args: [
                { type: 'register', placeholder: 'rX' },
                { type: 'value', placeholder: 'valor' }
            ]},
            'label': { 
                args: [{ type: 'labelName', placeholder: 'nombre' }],
                special: true
            }
        };
        this.tabContent = this.createElement('div', {
            className: 'tab-content',
            dataset: { content: 'blocks' }
        });
        this.createPalette();
        this.createBlocksArea();
        this.createCompileSection();
        document.getElementById('tab-contents').appendChild(this.tabContent);
    }
    createLabelDropdown(placeholder) {
        const select = this.createElement('select', {
            className: 'arg-input label-selector',
            'data-placeholder': placeholder
        });
        select.appendChild(this.createElement('option', {
            value: '',
            textContent: placeholder,
            disabled: true,
            selected: true
        }));
        this.updateLabelDropdown(select);
        return select;
    }
    updateLabelDropdown(select) {
        const currentValue = select.value;
        const labels = this.getAllLabels();
        while (select.options.length > 1) {
            select.remove(1);
        }
        labels.forEach(label => {
            select.appendChild(this.createElement('option', {
                value: label,
                textContent: label
            }));
        });
        if (labels.includes(currentValue)) {
            select.value = currentValue;
        }
    }
    updateAllLabelDropdowns() {
        const dropdowns = this.blocksArea.querySelectorAll('.label-selector');
        dropdowns.forEach(dropdown => this.updateLabelDropdown(dropdown));
    }
    getAllLabels() {
        const labels = [];
        const labelBlocks = this.blocksArea?.querySelectorAll('.program-block[data-command="label"]');
        labelBlocks?.forEach(block => {
            const input = block.querySelector('.arg-input');
            if (input && input.value.trim()) {
                labels.push(input.value.trim());
            }
        });
        return [...new Set(labels)]; 
    }
    createPalette() {
        const paletteContainer = this.createElement('div', { className: 'palette-container' });
        const categories = {
            'Movimiento': ['up', 'down', 'left', 'right'],
            'Interacción': ['interact'],
            'Control': ['jump', 'call', 'return', 'label'],
            'Condiciones': ['ifZero', 'ifEmpty'],
            'Operaciones': ['copy', 'add', 'sub', 'mul']
        };
        Object.entries(categories).forEach(([category, commands]) => {
            const categoryDiv = this.createElement('div', { className: 'category' });
            categoryDiv.appendChild(this.createElement('h3', { 
                textContent: category,
                className: 'category-header'
            }));
            const grid = this.createElement('div', { className: 'cmd-grid' });
            commands.forEach(cmd => {
                const block = this.createBlockElement(cmd, true);
				if (cmd === 'label') {
					block.title = "Crea una etiqueta para saltar a esta posición";
				}
                block.draggable = true;
                block.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', cmd);
                });
                grid.appendChild(block);
            });
            categoryDiv.appendChild(grid);
            paletteContainer.appendChild(categoryDiv);
        });
        this.tabContent.appendChild(paletteContainer);
    }
    createBlockElement(command, isPalette = false) {
        const config = this.commandConfig[command];
        const isSpecial = config.special;
        const block = this.createElement('div', {
            className: `cmd-block ${isPalette ? 'palette-block' : 'program-block'} ${isSpecial ? 'special-block' : ''}`,
            textContent: command,
            dataset: { command }
        });
        config.args.forEach((arg, index) => {
            let input;
            if (arg.type === 'register') {
                input = this.createRegisterSelector(arg.placeholder);
            } else if (arg.type === 'label') {
                input = this.createLabelDropdown(arg.placeholder);
            } else if (arg.type === 'labelName') {
                input = this.createLabelNameInput(arg.placeholder);
            } else {
                input = this.createValueInput(arg.placeholder);
            }
            block.appendChild(input);
        });
        if (!isPalette) {
            const controls = this.createElement('div', { className: 'block-controls' });
            const upBtn = this.createElement('button', {
                className: 'control-btn',
                textContent: '↑',
                onclick: (e) => this.moveBlock(block, -1)
            });
            const downBtn = this.createElement('button', {
                className: 'control-btn',
                textContent: '↓',
                onclick: (e) => this.moveBlock(block, 1)
            });
            const deleteBtn = this.createElement('button', {
                className: 'control-btn delete',
                textContent: '✕',
                onclick: (e) => {
                    const isLabel = block.dataset.command === 'label';
                    block.remove();
                    if (isLabel) {
                        this.updateAllLabelDropdowns();
                    }
                }
            });
            controls.appendChild(upBtn);
            controls.appendChild(downBtn);
            controls.appendChild(deleteBtn);
            block.appendChild(controls);
            block.draggable = true;
            block.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', 'reorder');
                this.draggedBlock = block;
            });
            if (command === 'label') {
                const input = block.querySelector('.arg-input');
                input.addEventListener('blur', () => {
                    this.updateAllLabelDropdowns();
                });
            }
        }
        return block;
    }
    createLabelNameInput(placeholder) {
        const input = this.createElement('input', {
            type: 'text',
            className: 'arg-input',
            placeholder: placeholder,
            size: 12
        });
        return input;
    }
    createRegisterSelector(placeholder) {
        const select = this.createElement('select', { className: 'arg-input' });
        for (let i = 0; i < 16; i++) {
            const reg = `r${i.toString(16)}`;
            select.appendChild(this.createElement('option', {
                value: reg,
                textContent: reg
            }));
        }
        return select;
    }
    createLabelSelector(placeholder) {
        const select = this.createElement('select', { 
            className: 'arg-input',
            'data-placeholder': placeholder
        });
        select.appendChild(this.createElement('option', {
            value: '',
            textContent: placeholder,
            disabled: true,
            selected: true
        }));
        return select;
    }
    createValueInput(placeholder) {
        return this.createElement('input', {
            type: 'text',
            className: 'arg-input',
            placeholder: placeholder,
            size: 6
        });
    }
    createBlocksArea() {
        const container = this.createElement('div', { className: 'blocks-container' });
        const programBlocks = this.createElement('div', {
            className: 'program-blocks',
            id: 'program-blocks',
            ondragover: (e) => e.preventDefault(),
            ondrop: (e) => this.handleBlockDrop(e)
        });
        let touchStartY = 0;
        programBlocks.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        programBlocks.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            programBlocks.scrollTop += deltaY * 2;
            touchStartY = touchY;
            e.preventDefault();
        });
        container.appendChild(programBlocks);
        this.tabContent.appendChild(container);
        this.blocksArea = programBlocks;
    }
    createCompileSection() {
        const compileContainer = this.createElement('div', { className: 'compile-container' });
        const compileBtn = this.createElement('button', {
            className: 'btn btn-primary',
            textContent: 'Compilar a Código',
            onclick: () => this.compileToCode()
        });
        compileContainer.appendChild(compileBtn);
        this.tabContent.appendChild(compileContainer);
    }
    handleBlockDrop(e) {
        e.preventDefault();
        const command = e.dataTransfer.getData('text/plain');
        if (command === 'reorder' && this.draggedBlock) {
            const blocks = Array.from(this.blocksArea.children);
            const index = blocks.indexOf(this.draggedBlock);
            const dropIndex = this.getDropIndex(e.clientY || e.touches[0].clientY);
            if (dropIndex !== index && dropIndex !== index + 1) {
                this.blocksArea.insertBefore(
                    this.draggedBlock, 
                    blocks[dropIndex] || null
                );
            }
        } else if (this.commandConfig[command]) {
            const block = this.createBlockElement(command);
            this.blocksArea.appendChild(block);
            if (command === 'label') {
                this.updateAllLabelDropdowns();
            }
            setTimeout(() => {
                this.blocksArea.scrollTop = this.blocksArea.scrollHeight;
            }, 10);
        }
        this.draggedBlock = null;
    }
    getDropIndex(yPos) {
        const blocks = Array.from(this.blocksArea.children);
        const containerRect = this.blocksArea.getBoundingClientRect();
        const relativeY = yPos - containerRect.top;
        for (let i = 0; i < blocks.length; i++) {
            const blockRect = blocks[i].getBoundingClientRect();
            const blockMiddle = blockRect.top - containerRect.top + blockRect.height / 2;
            if (relativeY < blockMiddle) {
                return i;
            }
        }
        return blocks.length;
    }
    moveBlock(block, direction) {
        const blocks = Array.from(this.blocksArea.children);
        const currentIndex = blocks.indexOf(block);
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < blocks.length) {
            if (direction === -1) {
                this.blocksArea.insertBefore(block, blocks[newIndex]);
            } else {
                this.blocksArea.insertBefore(block, blocks[newIndex + 1] || null);
            }
        }
    }
    updateLabelSelectors() {
        const labels = this.labelsInput.value.split(',').map(l => l.trim()).filter(l => l);
        const selectors = this.blocksArea.querySelectorAll('select[data-placeholder]');
        selectors.forEach(select => {
            const currentValue = select.value;
            while (select.options.length > 1) {
                select.remove(1);
            }
            labels.forEach(label => {
                const option = this.createElement('option', {
                    value: label,
                    textContent: label
                });
                select.appendChild(option);
            });
            if (labels.includes(currentValue)) {
                select.value = currentValue;
            } else if (labels.length > 0) {
                select.value = labels[0];
            }
        });
    }
    compileToCode() {
        const blocks = Array.from(this.blocksArea.children);
        let code = '';
        const allLabels = this.getAllLabels();
        blocks.forEach(block => {
            const command = block.dataset.command;
            const args = Array.from(block.querySelectorAll('.arg-input')).map(input => {
                if (input.classList.contains('label-selector')) {
                    return input.value && allLabels.includes(input.value) ? 
                           input.value : 
                           input.dataset.placeholder;
                }
                return input.value || input.placeholder;
            });
            if (command === 'label') {
                const labelName = args[0] || `label_${Date.now()}`;
                code += `${labelName}:\n`;
            } else {
                code += `${command} ${args.join(' ')}\n`;
            }
        });
        this.emit('blocks:compiled', code);
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'programmingBlock',
    constructor: ProgrammingBlockExtension
});
