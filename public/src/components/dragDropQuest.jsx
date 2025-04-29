import { useState } from "react";
import "./dragDropQuest.css";

function DragAndDropQuestion() {
  const [dropped, setDropped] = useState(false);

  const correctAnswer = "diseño";

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedWord = e.dataTransfer.getData("text/plain");

    if (draggedWord === correctAnswer) {
      setDropped(true);
    } else {
      setDropped(false);
      alert("Respuesta incorrecta. Intenta de nuevo.");
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, word) => {
    e.dataTransfer.setData("text/plain", word);
  };

  return (
    <div className="drag-container">
      <h2>Arrastra la palabra correcta para completar:</h2>
      <p className="sentence">S.O.L.I.D es un acronimo mnemonico para cinco principios de  <span className="drop-zone" onDrop={handleDrop} onDragOver={allowDrop}>{dropped ? correctAnswer : "_____"}</span>.</p>

      <div className="options">
        <div className="option" draggable onDragStart={(e) => handleDragStart(e, "diseño")}>diseño</div>
        <div className="option" draggable onDragStart={(e) => handleDragStart(e, "desarrollo")}>desarrollo</div>
        <div className="option" draggable onDragStart={(e) => handleDragStart(e, "implementacion")}>implementacion</div>
      </div>

      {dropped && <div className="success-message">Correcto! </div>}
    </div>
  );
}

export default DragAndDropQuestion;
