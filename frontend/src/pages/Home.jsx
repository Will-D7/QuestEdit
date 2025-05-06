
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
        <aside class="sidebar">
          <div class="sidebar-content">
            <nav class="sidebar-nav">
              <div class="nav-group">
                <h3 class="nav-title">Tipos de preguntas</h3>
                <a routerLink="/templates/multiple-choice" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#128221; Seleccion multiple</span>
                </a>
                <a routerLink="/templates/drag-drop" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#128260; Arrastra y suelta</span>
                </a>
                <a routerLink="/templates/matching" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#128279; Emparejar</span>
                </a>
                <a routerLink="/templates/puzzle" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#129513; Puzzle</span>
                </a>
                <a routerLink="/templates/sorting" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#128202; Clasificar</span>
                </a>
                
              </div>
              
              <div class="nav-group">
                <h3 class="nav-title">Manejo</h3>
                <a routerLink="/questions" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#128218; Mis preguntas</span>
                </a>
                <a routerLink="/collections" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#128193; Coleccion</span>
                </a>
                <a routerLink="/shared" routerLinkActive="active" class="nav-item">
                  <span class="nav-label">&#128101; Compartidos conmigo</span>
                </a>
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

