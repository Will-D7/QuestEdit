import { useState } from "react";
import './trueFalseQuest.css'

function TrueFalseQuestion() {
  // state
  const [answerSelected, setAnswerSelected] = useState(null);

  // data
  const question = "Los pingüinos pueden volar.";
  const correctAnswer = false;

  // fucntion
  const handleAnswer = (userAnswer) => {
    setAnswerSelected(userAnswer === correctAnswer);
  };

  return (
    <div className="container">
      <h2 className="question">{question}</h2>
      <div className="button-container">
        <button className="option-button true-button" onClick={() => handleAnswer(true)}>Verdadero</button>
        <button className="option-button false-button" onClick={() => handleAnswer(false)}>Falso</button>
      </div>
      
      {answerSelected !== null && (
        <div className={answerSelected ? "correct" : "incorrect"}>
          {answerSelected ? "¡Correcto!" : "Incorrecto"}
        </div>
      )}
    </div>
  );
}

export default TrueFalseQuestion;

