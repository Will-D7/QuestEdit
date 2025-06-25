class ModalExtension extends Extension {
    init() {
        this.createModal();
        this.on('modal:show', (mode) => this.showModal(mode));
        this.on('modal:close', () => this.closeModal());
        this.on('server:listSuccess', (maps) => this.showMapList(maps));
    }
    createModal() {
        const modal = this.createElement('div', {
            id: 'save-load-modal',
            className: 'modal',
            onclick: (e) => e.target === modal && this.closeModal()
        });
        const content = this.createElement('div', { className: 'modal-content' });
        const header = this.createElement('div', { className: 'modal-header', id: 'modal-title' });
        const mainContent = this.createElement('div', { 
            id: 'modal-main-content',
            className: 'modal-main-content'
        });
        const textarea = this.createElement('textarea', {
            id: 'map-json',
            className: 'json-textarea'
        });
        const serverArea = this.createElement('div', {
            id: 'server-area',
            className: 'server-area hidden'
        });
        const filenameInput = this.createElement('input', {
            type: 'text',
            id: 'map-filename',
            className: 'form-control',
            placeholder: 'Nombre del mapa (sin extensión)'
        });
        const mapListDiv = this.createElement('div', {
            id: 'map-list',
            className: 'map-list'
        });
        serverArea.appendChild(filenameInput);
        serverArea.appendChild(mapListDiv);
        mainContent.appendChild(textarea);
        mainContent.appendChild(serverArea);
        const btnGroup = this.createElement('div', { className: 'btn-group' });
        const cancelBtn = this.createElement('button', {
            className: 'btn btn-secondary',
            textContent: 'Cancelar',
            onclick: () => this.closeModal()
        });
        const confirmBtn = this.createElement('button', {
            className: 'btn btn-primary',
            id: 'modal-confirm-btn',
            textContent: 'Confirmar',
            onclick: () => this.confirmModal()
        });
        const serverBtn = this.createElement('button', {
            className: 'btn btn-primary',
            id: 'server-btn',
            textContent: 'Servidor',
            onclick: () => this.toggleServerMode()
        });
        btnGroup.appendChild(cancelBtn);
        btnGroup.appendChild(serverBtn);
        btnGroup.appendChild(confirmBtn);
        content.appendChild(header);
        content.appendChild(mainContent);
        content.appendChild(btnGroup);
        modal.appendChild(content);
        this.app.getContainer().appendChild(modal);
        this.elements = {
            modal,
            modalTitle: header,
            mapJson: textarea,
            serverArea,
            filenameInput,
            mapListDiv,
            confirmBtn,
            serverBtn
        };
        this.serverMode = false;
    }
    showModal(mode) {
        this.currentMode = mode;
        this.serverMode = false;
        const { modalTitle, mapJson, serverArea, serverBtn, confirmBtn } = this.elements;
        mapJson.classList.remove('hidden');
        serverArea.classList.add('hidden');
        serverBtn.classList.remove('hidden');
        confirmBtn.classList.remove('hidden');
        if (mode === 'save') {
            modalTitle.textContent = 'Guardar Mapa';
            mapJson.value = JSON.stringify(this.state.get('mapData'), null, 2);
            mapJson.placeholder = '';
            mapJson.select();
            serverBtn.textContent = '☁️ Guardar en Servidor';
            confirmBtn.textContent = '📋 Copiar al Portapapeles';
        } else {
            modalTitle.textContent = 'Cargar Mapa';
            mapJson.value = '';
            mapJson.placeholder = 'Pega tu JSON del mapa aquí...';
            serverBtn.textContent = '☁️ Cargar del Servidor';
            confirmBtn.textContent = 'Cargar JSON';
        }
        this.elements.modal.classList.add('show');
    }
    toggleServerMode() {
        this.serverMode = !this.serverMode;
        const { mapJson, serverArea, confirmBtn, serverBtn, filenameInput, mapListDiv } = this.elements;
        mapJson.classList.toggle('hidden', this.serverMode);
        serverArea.classList.toggle('hidden', !this.serverMode);
        confirmBtn.classList.toggle('hidden', false);
        if (this.serverMode) {
            if (this.currentMode === 'save') {
                this.elements.modalTitle.textContent = 'Guardar en Servidor';
                confirmBtn.textContent = '💾 Guardar';
                serverBtn.textContent = '📄 Modo Local';
                filenameInput.classList.remove('hidden');
                mapListDiv.classList.add('hidden');
                const category = this.state.get('mapData.category') || 'mapa';
                const timestamp = new Date().toISOString().slice(0, 10);
                filenameInput.value = `${category}_${timestamp}`;
            } else {
                this.elements.modalTitle.textContent = 'Cargar del Servidor';
                confirmBtn.textContent = '📂 Cargar';
                serverBtn.textContent = '📄 Modo Local';
                filenameInput.classList.add('hidden');
                mapListDiv.classList.remove('hidden');
				mapListDiv.appendChild(this.createElement('p', {
					className: 'loading-text',
				}, ['Cargando mapas...']));
                this.emit('server:list');
            }
        } else {
            this.showModal(this.currentMode);
        }
    }
    showMapList(maps) {
        const mapListDiv = this.elements.mapListDiv;
        mapListDiv.innerHTML = '';
        if (!maps || maps.length === 0) {
            mapListDiv.appendChild(this.createElement('p', {
                className: 'no-maps-message',
                textContent: 'No hay mapas guardados'
            }));
            return;
        }
        maps.forEach(map => {
            const item = this.createElement('div', {
                className: 'map-list-item',
                onclick: () => {
                    mapListDiv.querySelectorAll('.map-list-item').forEach(el => {
                        el.classList.remove('selected');
                    });
                    item.classList.add('selected');
                    this.selectedMap = map.filename;
                }
            });
            const nameDiv = this.createElement('div', {
                className: 'map-name',
                textContent: map.name
            });
            const infoDiv = this.createElement('div', {
                className: 'map-info',
                textContent: `Modificado: ${map.modified} | Tamaño: ${map.size}`
            });
            item.appendChild(nameDiv);
            item.appendChild(infoDiv);
            mapListDiv.appendChild(item);
        });
    }
    closeModal() {
        this.elements.modal.classList.remove('show');
        this.serverMode = false;
    }
    confirmModal() {
        if (this.serverMode) {
            if (this.currentMode === 'save') {
                const filename = this.elements.filenameInput.value.trim();
                if (!filename) {
                    alert('Por favor ingresa un nombre para el mapa');
                    return;
                }
                this.emit('server:save', {
                    filename,
                    mapData: this.state.get('mapData')
                });
            } else {
                if (!this.selectedMap) {
                    alert('Por favor selecciona un mapa para cargar');
                    return;
                }
                this.emit('server:load', this.selectedMap);
            }
        } else {
            if (this.currentMode === 'save') {
                this.elements.mapJson.select();
                document.execCommand('copy');
                alert('¡Datos del mapa copiados al portapapeles!');
                this.closeModal();
            } else {
                try {
                    const data = JSON.parse(this.elements.mapJson.value);
                    this.state.set('mapData', data);
                    this.emit('grid:render');
                    this.closeModal();
                } catch (e) {
                    alert('¡Formato JSON inválido!');
                }
            }
        }
    }
}