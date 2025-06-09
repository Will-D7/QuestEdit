import '../styles/Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <h1 className="logo">QuestEdit</h1>
          <nav className="main-nav">
            <button className="buttonHeader">Panel</button>
            <button className="buttonHeader">Mis cuestionarios</button>
          </nav>
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <div className="sidebar-content">
            <nav className="sidebar-nav">
              <div className="nav-group">
                <h3 className="nav-title">Tipos de preguntas</h3>
                <Link to="/templates/multiple-choice"   className="nav-item">&#128221; Selección múltiple</Link>
                <Link to="/templates/drag-drop"         className="nav-item">&#128260; Arrastra y suelta</Link>
                <Link to="/templates/matching"          className="nav-item">&#128279; Emparejar</Link>
                <Link to="/templates/puzzle"            className="nav-item">&#129513; Puzzle</Link>
                <Link to="/templates/sorting"           className="nav-item">&#128202; Clasificar</Link>
              </div>

              <div className="nav-group">
                <h3 className="nav-title">Manejo</h3>
                <Link to="/questions"   className="nav-item">&#128218; Mis preguntas</Link>
                <Link to="/collections" className="nav-item">&#128193; Colección</Link>
                <Link to="/shared"      className="nav-item">&#128101; Compartidos conmigo</Link>
                <Link to="/editors"     className="nav-item">&#128102; Editores</Link>
              </div>
            </nav>
          </div>
        </aside>

        <div className="dashboard">
          <div className="home-container">
            <h1 className="home-title">Bienvenido a QuestEdit</h1>
            <p className="home-description">Elige el tipo de Juego para comenzar a practicar:</p>
            <div className="home-buttons">
              <Link to="/robotGame" className="home-button">Juego ROBOT</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;