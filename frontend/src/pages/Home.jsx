
import '../styles/Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Bienvenido a QuestEdit</h1>
      <p className="home-description">Elige el tipo de Juego para comenzar a practicar:</p>
      
      <div className="home-buttons">
        <Link to="/robotGame" className="home-button">Juego ROBOT</Link>
        
      </div>
    </div>
  );
}

export default Home;

