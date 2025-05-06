import { GRID_ROWS, GRID_COLS } from './config';

export function createInitialGrid() {
  const grid = [];

  for (let y = 0; y < GRID_ROWS; y++) {
    const row = [];
    for (let x = 0; x < GRID_COLS; x++) {
      row.push({
        x,
        y,
        type: 'empty' // otras opciones: 'obstacle', 'item'
      });
    }
    grid.push(row);
  }

  // ejemplo: colocar un ítem y un obstáculo
  grid[1][2].type = 'item';
  grid[2][2].type = 'obstacle';

  return grid;
}
