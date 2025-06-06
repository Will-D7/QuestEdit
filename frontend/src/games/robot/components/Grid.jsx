import React, { useContext } from 'react';
import { GameStateContext } from '../context/GameStateContext';
import styles from '../styles/robot.module.css';

const Grid = () => {
  const { position, gridSize } = useContext(GameStateContext);

  const cells = [];
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const isRobot = position.x === x && position.y === y;
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
