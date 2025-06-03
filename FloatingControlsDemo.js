class FloatingControlsDemo {
    constructor() {
        this.demos = [];
        this.init();
    }
    init() {
        this.createMainGameControls();
        this.createDemos();
    }
    createMainGameControls() {
        const gameControls = new FloatingControls({
            containerId: 'game-controls',
            arrangement: 'grid',
            buttonsPerRow: 3,
            buttons: [
                { text: '↑', action: 'up', gridPosition: { column: 2, row: 1 } },
                { text: '←', action: 'left', gridPosition: { column: 1, row: 2 } },
                { text: '⚡', action: 'interact', gridPosition: { column: 2, row: 2 } },
                { text: '→', action: 'right', gridPosition: { column: 3, row: 2 } },
                { text: '↓', action: 'down', gridPosition: { column: 2, row: 3 } }
            ],
            position: { bottom: 20, right: 20 },
            backgroundColor: '#8B5CF6',
            hoverColor: '#A78BFA',
            minWidth: 135,
            minHeight: 135,
            buttonSize: 45,
            onButtonClick: (action) => {
                if (window.hero) {
                    if (action === 'interact') {
                        if (window.gameItems) {
                            window.gameItems.handleSpaceKey();
                        }
                    } else {
                        window.hero.move(action);
                    }
                }
            }
        });
        this.demos.push(gameControls);
    }
    createDemos() {
        const exercises = new FloatingControls({
            containerId: 'demo-horizontal',
            arrangement: 'horizontal',
            buttons: [
                { text: '🎮', action: 'game' },
                { text: '🎵', action: 'music' },
                { text: '🎨', action: 'art' },
                { text: '📚', action: 'book' }
            ],
            position: { top: 250, left: 50 },
            backgroundColor: '#F59E0B',
            hoverColor: '#FBBF24',
            buttonSize: 40,
            gap: 6,
            onButtonClick: (action) => console.log('Horizontal button clicked:', action)
        });
        this.demos.push(exercises);
        const commands = new FloatingControls({
            containerId: 'demo-input',
            arrangement: 'horizontal',
            inputs: [
                { 
                    type: 'text', 
                    placeholder: 'Enter command...', 
                    label: 'Command Input',
                    onChange: (value) => console.log('Input changed:', value)
                }
            ],
            buttons: [
                { text: '✓', action: 'submit' },
                { text: '✗', action: 'cancel' }
            ],
            position: { top: 350, left: 50 },
            backgroundColor: '#8B5CF6',
            hoverColor: '#A78BFA',
            buttonSize: 35,
            minWidth: 200,
            minHeight: 0,
            gap: 5,
            onButtonClick: (action) => console.log('Input demo button clicked:', action)
        });
        this.demos.push(commands);
		commands.hide();
		exercises.hide();
		let toggleCmd = 0;
		let toggleExercises = 0;
		let toggleSettings = 0;
        const mainMenu = new FloatingControls({
            containerId: 'demo-vertical',
            arrangement: 'vertical',
            buttons: [
                { text: '⌘', action: 'cmd' },
                { text: '📝', action: 'exercises' },
                { text: '⚙️', action: 'settings' }
            ],
            position: { top: 50, left: 300 },
            backgroundColor: '#10B981',
            hoverColor: '#34D399',
            buttonSize: 45,
            gap: 10,
            padding: 10,
            minWidth: 0,
            minHeight: 0,
            onButtonClick: (action) => {
				console.log('Vertical button clicked:', action)
				if(action == 'cmd'){
					if(toggleCmd){
						commands.hide();
						toggleCmd = 0;
					}
					else{
						commands.show();
						toggleCmd = 1;
					}
				}
				else if(action == 'exercises'){
					if(toggleExercises){
						exercises.hide();
						toggleExercises = 0;
					}
					else{
						exercises.show();
						toggleExercises = 1;
					}
				}
			}
        });
        this.demos.push(mainMenu);
		mainMenu.show();
    }
    destroy() {
        this.demos.forEach(demo => demo.destroy());
        this.demos = [];
    }
}