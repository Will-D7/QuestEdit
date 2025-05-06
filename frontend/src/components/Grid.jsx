import React from 'react'
import Robot from './Robot'
import "../styles/Grid.css"

const Grid = ({ grid, robotPosition }) => {
  return (
    <div
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${grid[0].length}, 50px)`,
        gap: '2px'
      }}
    >
      {grid.flat().map(cell => {
        const isRobot = robotPosition.x === cell.x && robotPosition.y === cell.y;
        const cellClass = `cell ${cell.type}`;
        return (
          <div key={`${cell.x}-${cell.y}`} className={cellClass}>
            {isRobot && <Robot />}
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
