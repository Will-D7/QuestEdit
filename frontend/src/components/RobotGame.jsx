import React from 'react';
import { useRobot } from '../game/useRobot';
import Grid from './Grid';
import "../styles/RobotGame.css"

const RobotGame = () => {
  const {
    position,
    carrying,
    grid,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    togglePickup,
    reset
  } = useRobot();

  return (
    <div className="game-wrapper">
      <h1>Classroom Robot Game</h1>

      <Grid grid={grid} robotPosition={position} />

      <div className="controls">
        <button onClick={moveUp}>↑</button>
        <div>
          <button onClick={moveLeft}>←</button>
          <button onClick={moveRight}>→</button>
        </div>
        <button onClick={moveDown}>↓</button>
      </div>

      <button onClick={togglePickup}>Pick Up / Drop</button>
      <button onClick={reset}>Reset</button>

      <p>Robot is carrying: <strong>{carrying || 'Nothing'}</strong></p>
    </div>
  );
};

export default RobotGame;
