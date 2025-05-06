import { useState } from 'react';
import { INITIAL_ROBOT_POSITION, GRID_ROWS, GRID_COLS } from './config';
import { createInitialGrid } from './useGrid';

export function useRobot() {
  const [position, setPosition] = useState(INITIAL_ROBOT_POSITION);
  const [carrying, setCarrying] = useState(null);
  const [grid, setGrid] = useState(createInitialGrid());

  const isBlocked = (x, y) => {
    return grid[y][x].type === 'obstacle';
  };

  const move = (dx, dy) => {
    const newX = Math.max(0, Math.min(GRID_COLS - 1, position.x + dx));
    const newY = Math.max(0, Math.min(GRID_ROWS - 1, position.y + dy));

    if (!isBlocked(newX, newY)) {
      setPosition({ x: newX, y: newY });
    }
  };

  const moveUp = () => move(0, -1);
  const moveDown = () => move(0, 1);
  const moveLeft = () => move(-1, 0);
  const moveRight = () => move(1, 0);

  const togglePickup = () => {
    const cell = grid[position.y][position.x];

    if (cell.type === 'item' && !carrying) {
      setCarrying('Item');

      const newGrid = grid.map(row =>
        row.map(c =>
          c.x === position.x && c.y === position.y ? { ...c, type: 'empty' } : c
        )
      );
      setGrid(newGrid);
    } else if (carrying) {
      const newGrid = grid.map(row =>
        row.map(c =>
          c.x === position.x && c.y === position.y ? { ...c, type: 'item' } : c
        )
      );
      setGrid(newGrid);
      setCarrying(null);
    }
  };

  const reset = () => {
    setPosition(INITIAL_ROBOT_POSITION);
    setCarrying(null);
    setGrid(createInitialGrid());
  };

  return {
    position,
    carrying,
    grid,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    togglePickup,
    reset
  };
}
