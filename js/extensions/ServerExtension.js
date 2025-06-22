class ServerExtension extends Extension {
    init() {
        this.on('server:save', (data) => this.saveMap(data));
        this.on('server:load', (filename) => this.loadMap(filename));
        this.on('server:list', () => this.listMaps());
    }
    async saveMap({ filename, mapData }) {
        try {
            const response = await fetch('saveMap.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: this.sanitizeFilename(filename),
                    data: mapData
                })
            });
            const result = await response.json();
            if (result.success) {
                this.emit('server:saveSuccess', result.message);
                alert('¡Mapa guardado exitosamente en el servidor!');
            } else {
                this.emit('server:saveError', result.error);
                alert('Error al guardar: ' + result.error);
            }
        } catch (error) {
            console.error('Save error:', error);
            this.emit('server:saveError', error.message);
            alert('Error de conexión al guardar el mapa');
        }
    }
    async loadMap(filename) {
        try {
            const response = await fetch('loadMap.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: this.sanitizeFilename(filename)
                })
            });
            const result = await response.json();
            if (result.success) {
                this.state.set('mapData', result.data);
                this.emit('server:loadSuccess');
				this.emit('grid:render');
                this.emit('modal:close');
            } else {
                this.emit('server:loadError', result.error);
                alert('Error al cargar: ' + result.error);
            }
        } catch (error) {
            console.error('Load error:', error);
            this.emit('server:loadError', error.message);
            alert('Error de conexión al cargar el mapa');
        }
    }
    async listMaps() {
        try {
            const response = await fetch('loadMap.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'list'
                })
            });
            const result = await response.json();
            if (result.success) {
                this.emit('server:listSuccess', result.maps);
            } else {
                this.emit('server:listError', result.error);
                alert('Error al listar mapas: ' + result.error);
            }
        } catch (error) {
            console.error('List error:', error);
            this.emit('server:listError', error.message);
            alert('Error de conexión al listar mapas');
        }
    }
    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9_\-]/g, '_')
            .substring(0, 50);
    }
}