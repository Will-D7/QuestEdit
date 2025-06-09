import React, { useContext } from 'react';
import { useGameState } from '../context/GameStateContext';

const Controls = () => {
  const { robotPosition, setRobotPosition } = useGameState;

  const move = (dx, dy) => {
    const newX = Math.max(0, Math.min(gridSize.width - 1, position.x + dx));
    const newY = Math.max(0, Math.min(gridSize.height - 1, position.y + dy));
    setPosition({ x: newX, y: newY });
  };

  return (
    <div>
      <button onClick={() => move(0, -1)}>⬆️</button>
      <button onClick={() => move(-1, 0)}>⬅️</button>
      <button onClick={() => move(1, 0)}>➡️</button>
      <button onClick={() => move(0, 1)}>⬇️</button>
    </div>
  );
};

export default Controls;
