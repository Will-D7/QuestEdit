import React, { useContext } from 'react';
import { GameStateContext } from '../context/GameStateContext';

const SettingsPanel = () => {
  const { speed, setSpeed, gridSize, setGridSize } = useContext(GameStateContext);

  return (
    <div>
      <label>
        Speed (ms):
        <input
          type="number"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </label>
      <br />
      <label>
        Grid Width:
        <input
          type="number"
          value={gridSize.width}
          onChange={(e) => setGridSize({ ...gridSize, width: Number(e.target.value) })}
        />
      </label>
      <br />
      <label>
        Grid Height:
        <input
          type="number"
          value={gridSize.height}
          onChange={(e) => setGridSize({ ...gridSize, height: Number(e.target.value) })}
        />
      </label>
    </div>
  );
};

export default SettingsPanel;
