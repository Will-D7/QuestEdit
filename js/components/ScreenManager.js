
const ScreenManager = () => {
  const [activeScreen, setActiveScreen] = React.useState('dnd');
  
  
  const navigateTo = (screenId) => {
    setActiveScreen(screenId);
  };
  
  return (
    <div className="screen-manager">
      <h1 className="app-title">🤖 Robokids: Programación para niños</h1>
      
      <nav className="nav-buttons">
        <button 
          id="dnd-button"
          className={`nav-button ${activeScreen === 'dnd' ? 'active' : ''}`} 
          onClick={() => navigateTo('dnd')}
        >
          Programar Robot
        </button>
        <button 
          id="classroom-button"
          className={`nav-button ${activeScreen === 'classroom' ? 'active' : ''}`} 
          onClick={() => navigateTo('classroom')}
        >
          Simulación del Robot
        </button>
      </nav>
      
      {activeScreen === 'dnd' && (
        <div className="screen active dnd-screen">
          <DndScreen />
        </div>
      )}
      
      {activeScreen === 'classroom' && (
        <div className="screen active classroom-screen">
          <ClassroomScreen />
        </div>
      )}
      
      <footer>
        Robokids © 2025 - Aplicación educativa para niños
      </footer>
    </div>
  );
};
