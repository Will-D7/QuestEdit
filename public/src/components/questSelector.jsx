import { useState } from "react";
import TrueFalseQuestion from "./trueFalseQuest";
import DragDropQuestion from "./dragDropQuest"
import './questSelector.css'

function QuestionSelector() {
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);

  const handleSelection = (questionType) => {
    setSelectedQuestionType(questionType);
  };

  return (
    <div className="container">
      {!selectedQuestionType ? (
        <div className="quest-selection-container">
          <h2>Selecciona un tipo de pregunta</h2>
          <button className="selection-button" onClick={() => handleSelection("trueFalse")}>
            Pregunta de Verdadero/Falso
          </button>
          <button className="selection-button" onClick={() => handleSelection("dragDrop")}>
            Pregunta de Arrastrar y Soltar
          </button>
        </div>
      ) : selectedQuestionType === "trueFalse" ? (
        <TrueFalseQuestion />
      ) : (
        <DragDropQuestion />
      )}
    </div>
  );
}

export default QuestionSelector;
