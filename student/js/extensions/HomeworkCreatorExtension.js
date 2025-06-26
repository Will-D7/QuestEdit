class HomeworkCreatorExtension extends Extension {
    init() {
        this.createHomeworkFAB();
        this.createHomeworkPanel();
        this.observe('mode', (mode) => {
            this.elements.fab.classList.toggle('active', mode === 'homework');
            this.elements.panel.classList.toggle('show', mode === 'homework');
        });
    }
    createHomeworkFAB() {
        const fab = this.createElement('button', {
            className: 'homework-fab',
            id: 'homework-fab',
            title: 'Crear Tarea',
            textContent: '📝',
            onclick: () => this.app.toggleMode('homework')
        });
        this.app.getContainer().appendChild(fab);
        this.elements.fab = fab;
    }
    createHomeworkPanel() {
        const panel = this.createElement('div', {
            className: 'homework-panel',
            id: 'homework-panel'
        });
        const title = this.createElement('h2', {textContent: 'Crear Nueva Tarea'});
        panel.appendChild(title);
        const form = this.createElement('div', {className: 'homework-form'});
        const mapGroup = this.createElement('div', {className: 'form-group'});
        mapGroup.appendChild(this.createElement('label', {}, ['Mapa:']));
        this.elements.mapSelect = this.createElement('select', {id: 'homework-map'});
        mapGroup.appendChild(this.elements.mapSelect);
        form.appendChild(mapGroup);
        const titleGroup = this.createElement('div', {className: 'form-group'});
        titleGroup.appendChild(this.createElement('label', {}, ['Título:']));
        this.elements.titleInput = this.createElement('input', {
            type: 'text',
            id: 'homework-title',
            placeholder: 'Nombre de la tarea'
        });
        titleGroup.appendChild(this.elements.titleInput);
        form.appendChild(titleGroup);
        const instGroup = this.createElement('div', {className: 'form-group'});
        instGroup.appendChild(this.createElement('label', {}, ['Instrucciones:']));
        this.elements.instInput = this.createElement('textarea', {
            id: 'homework-instructions',
            placeholder: 'Descripción de la tarea...'
        });
        instGroup.appendChild(this.elements.instInput);
        form.appendChild(instGroup);
        const diffGroup = this.createElement('div', {className: 'form-group'});
        diffGroup.appendChild(this.createElement('label', {}, ['Dificultad:']));
        this.elements.diffSelect = this.createElement('select', {id: 'homework-difficulty'});
        ['Fácil', 'Medio', 'Difícil'].forEach(diff => {
            this.elements.diffSelect.appendChild(this.createElement('option', {
                value: diff.toLowerCase(),
                textContent: diff
            }));
        });
        diffGroup.appendChild(this.elements.diffSelect);
        form.appendChild(diffGroup);
        const dateGroup = this.createElement('div', {className: 'form-group'});
        dateGroup.appendChild(this.createElement('label', {}, ['Fecha límite:']));
        this.elements.dateInput = this.createElement('input', {
            type: 'date',
            id: 'homework-duedate'
        });
        dateGroup.appendChild(this.elements.dateInput);
        form.appendChild(dateGroup);
        const objGroup = this.createElement('div', {className: 'form-group'});
        objGroup.appendChild(this.createElement('label', {}, ['Objetivos:']));
        this.elements.objInput = this.createElement('textarea', {
            id: 'homework-objectives',
            placeholder: 'Objetivos de aprendizaje...'
        });
        objGroup.appendChild(this.elements.objInput);
        form.appendChild(objGroup);
        const saveBtn = this.createElement('button', {
            className: 'btn btn-primary',
            textContent: 'Guardar Tarea',
            onclick: () => this.saveHomework()
        });
        form.appendChild(saveBtn);
        panel.appendChild(form);
        this.app.getContainer().appendChild(panel);
        this.elements.panel = panel;
        this.loadAvailableMaps();
    }
    async loadAvailableMaps() {
        try {
            const response = await fetch('loadMap.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'list' })
            });
            const result = await response.json();
            if (result.success) {
                this.dom.clearElement(this.elements.mapSelect);
                result.maps.forEach(map => {
                    const option = this.createElement('option', {
                        value: map.filename,
                        textContent: map.name
                    });
                    this.elements.mapSelect.appendChild(option);
                });
            } else {
                console.error('Failed to load maps:', result.error);
            }
        } catch (error) {
            console.error('Failed to load maps:', error);
        }
    }
    async saveHomework() {
        const homeworkData = {
            map: this.elements.mapSelect.value,
            title: this.elements.titleInput.value,
            instructions: this.elements.instInput.value,
            difficulty: this.elements.diffSelect.value,
            dueDate: this.elements.dateInput.value,
            objectives: this.elements.objInput.value
        };
        if (!homeworkData.title || !homeworkData.map) {
            alert('Por favor complete título y seleccione un mapa');
            return;
        }
        try {
            const response = await fetch('saveHomework.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(homeworkData)
            });
            const result = await response.json();
            if (result.success) {
                alert('Tarea guardada exitosamente!');
                this.app.toggleMode('play');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving homework:', error);
            alert('Error de conexión');
        }
    }
}

window.__extensions = window.__extensions || [];
window.__extensions.push({
    name: 'homeworkCreator',
    constructor: HomeworkCreatorExtension
});
