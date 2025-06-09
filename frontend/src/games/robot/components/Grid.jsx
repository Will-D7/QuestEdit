import React from 'react';
import { useGameState } from '../context/GameStateContext';
import styles from '../styles/robot.module.css';

const Grid = () => {
  const { robotPosition } = useGameState();
  const gridSize = { width: 10, height: 10 };

  const cells = [];
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const isRobot = robotPosition.x === x && robotPosition.y === y;
      cells.push(
        <div
          key={`${x}-${y}`}
          className={`${styles.cell} ${isRobot ? styles.robot : ''}`}
        ></div>
      );
    }
  }

  return <div className={styles.grid}>{cells}</div>;
};

export default Grid;
