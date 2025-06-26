class HomeworkViewerExtension extends Extension {
    init() {
        this.createHomeworkFAB();
        this.createHomeworkModal();
        this.on('homework:list', () => this.loadHomeworkList());
    }
    createHomeworkFAB() {
        const fab = this.createElement('button', {
            className: 'hw-fab',
            id: 'hw-fab',
            title: 'Tareas Asignadas',
            textContent: '📚',
            onclick: () => this.showHomeworkModal()
        });
        this.app.getContainer().appendChild(fab);
        this.elements.fab = fab;
    }
    createHomeworkModal() {
        const modal = this.createElement('div', {
            id: 'homework-modal',
            className: 'modal',
            onclick: (e) => e.target === modal && this.closeModal()
        });
        const content = this.createElement('div', { className: 'modal-content' });
        const header = this.createElement('div', { 
            className: 'modal-header',
            textContent: 'Tareas Asignadas'
        });
        const mainContent = this.createElement('div', {
            id: 'homework-main-content',
            className: 'modal-main-content'
        });
        this.elements.listContainer = this.createElement('div', {
            id: 'homework-list',
            className: 'homework-list'
        });
        mainContent.appendChild(this.elements.listContainer);
        this.elements.detailsContainer = this.createElement('div', {
            id: 'homework-details',
            className: 'homework-details hidden'
        });
        mainContent.appendChild(this.elements.detailsContainer);
        const btnGroup = this.createElement('div', { className: 'btn-group' });
        this.elements.backBtn = this.createElement('button', {
            className: 'btn btn-secondary hidden',
            id: 'homework-back',
            textContent: '← Volver',
            onclick: () => this.showListView()
        });
        this.elements.startBtn = this.createElement('button', {
            className: 'btn btn-primary hidden',
            id: 'homework-start',
            textContent: '▶ Iniciar Tarea',
            onclick: () => this.startHomework()
        });
        this.elements.submitBtn = this.createElement('button', {
            className: 'btn btn-primary',
            id: 'homework-submit',
            textContent: '📤 Enviar Solución',
            onclick: () => this.submitSolution()
        });
        const closeBtn = this.createElement('button', {
            className: 'btn btn-secondary',
            textContent: 'Cerrar',
            onclick: () => this.closeModal()
        });
        btnGroup.appendChild(this.elements.backBtn);
        btnGroup.appendChild(this.elements.startBtn);
        btnGroup.appendChild(this.elements.submitBtn);
        btnGroup.appendChild(closeBtn);
        content.appendChild(header);
        content.appendChild(mainContent);
        content.appendChild(btnGroup);
        modal.appendChild(content);
        this.app.getContainer().appendChild(modal);
        this.elements.modal = modal;
    }
    showHomeworkModal() {
        this.elements.modal.classList.add('show');
        this.showListView();
        this.emit('homework:list');
    }
    closeModal() {
        this.elements.modal.classList.remove('show');
    }
    showListView() {
        this.elements.listContainer.classList.remove('hidden');
        this.elements.detailsContainer.classList.add('hidden');
        this.elements.backBtn.classList.add('hidden');
        this.elements.startBtn.classList.add('hidden');
        this.elements.submitBtn.classList.add('hidden');
    }
    showDetailsView() {
        this.elements.listContainer.classList.add('hidden');
        this.elements.detailsContainer.classList.remove('hidden');
        this.elements.backBtn.classList.remove('hidden');
        this.elements.startBtn.classList.remove('hidden');
        this.elements.submitBtn.classList.remove('hidden');
    }
    async loadHomeworkList() {
        try {
            const response = await fetch('listHomework.php');
            const result = await response.json();
            if (result.success) {
                this.showHomeworkList(result.homeworks);
            } else {
                console.error('Failed to load homework:', result.error);
                this.showError('Error al cargar tareas');
            }
        } catch (error) {
            console.error('Homework load error:', error);
            this.showError('Error de conexión');
        }
    }
    showHomeworkList(homeworks) {
        const listContainer = this.elements.listContainer;
        listContainer.innerHTML = '';
        if (!homeworks || homeworks.length === 0) {
            listContainer.appendChild(this.createElement('p', {
                className: 'no-homework-message',
                textContent: 'No hay tareas asignadas'
            }));
            return;
        }
        homeworks.forEach(hw => {
            const item = this.createElement('div', {
                className: 'homework-item',
                onclick: () => this.showHomeworkDetails(hw)
            });
            const title = this.createElement('h3', {
                className: 'homework-title',
                textContent: hw.title
            });
            const info = this.createElement('div', { className: 'homework-info' }, [
                this.createElement('span', {
                    className: 'homework-difficulty',
                    textContent: `Dificultad: ${hw.difficulty}`
                }),
                this.createElement('span', {
                    className: 'homework-duedate',
                    textContent: `Fecha límite: ${hw.dueDate}`
                })
            ]);
            item.appendChild(title);
            item.appendChild(info);
            listContainer.appendChild(item);
        });
    }
    async showHomeworkDetails(hw) {
        this.currentHomework = hw;
        const details = this.elements.detailsContainer;
        details.innerHTML = '';
        details.appendChild(this.createElement('h2', {
            textContent: hw.title
        }));
        details.appendChild(this.createElement('div', { className: 'homework-meta' }, [
            this.createElement('span', {
                className: 'homework-difficulty',
                textContent: `Dificultad: ${hw.difficulty}`
            }),
            this.createElement('span', {
                className: 'homework-duedate',
                textContent: `Fecha límite: ${hw.dueDate}`
            })
        ]));
        details.appendChild(this.createElement('h3', {
            textContent: 'Instrucciones:'
        }));
        details.appendChild(this.createElement('p', {
            className: 'homework-instructions',
            textContent: hw.instructions
        }));
        details.appendChild(this.createElement('h3', {
            textContent: 'Objetivos:'
        }));
        details.appendChild(this.createElement('p', {
            className: 'homework-objectives',
            textContent: hw.objectives
        }));
        try {
            const response = await fetch('loadMap.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: hw.map })
            });
            const result = await response.json();
            if (result.success) {
                this.state.set('mapData', result.data);
                this.emit('grid:render');
            } else {
                this.showError('Error al cargar el mapa: ' + result.error);
            }
        } catch (error) {
            console.error('Map load error:', error);
            this.showError('Error de conexión al cargar el mapa');
        }
        this.showDetailsView();
    }
    startHomework() {
        this.closeModal();
        this.app.toggleMode('program');
    }
    async submitSolution() {
        if (!this.currentHomework) return;
        const solution = this.state.get('program.code');
        if (!solution.trim()) {
            alert('Por favor escribe un programa antes de enviar');
            return;
        }
        try {
            const response = await fetch('submitHomework.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    homeworkId: this.currentHomework.filename,
                    solution: solution
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('¡Solución enviada con éxito!');
                this.closeModal();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving solution:', error);
            alert('Error de conexión');
        }
    }
    showError(message) {
        this.elements.listContainer.innerHTML = '';
        this.elements.listContainer.appendChild(this.createElement('p', {
            className: 'error-message',
            textContent: message
        }));
    }
}