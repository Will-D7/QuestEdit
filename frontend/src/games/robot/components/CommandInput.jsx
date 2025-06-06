import React, { useContext, useState } from 'react';
import { GameStateContext } from '../context/GameStateContext';

const CommandInput = () => {
  const { position, setPosition, gridSize } = useContext(GameStateContext);
  const [commands, setCommands] = useState('');

  const executeCommands = () => {
    const cmds = commands.split('\n');
    let currentPosition = { ...position };

    cmds.forEach((cmd) => {
      let dx = 0;
      let dy = 0;
      switch (cmd.trim().toLowerCase()) {
        case 'up':
          dy = -1;
          break;
        case 'down':
          dy = 1;
          break;
        case 'left':
          dx = -1;
          break;
        case 'right':
          dx = 1;
          break;
        default:
          break;
      }
      const newX = Math.max(0, Math.min(gridSize.width - 1, currentPosition.x + dx));
      const newY = Math.max(0, Math.min(gridSize.height - 1, currentPosition.y + dy));
      currentPosition = { x: newX, y: newY };
    });

    setPosition(currentPosition);
  };

  return (
    <div>
      <textarea
        rows="5"
        cols="30"
        value={commands}
        onChange={(e) => setCommands(e.target.value)}
        placeholder="Enter commands (e.g., up, down)"
      ></textarea>
      <br />
      <button onClick={executeCommands}>Execute Commands</button>
    </div>
  );
};

export default CommandInput;
