import React, { createContext, useState, useContext } from 'react';

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
  const [grid, setGrid] = useState([]);
  const [commands, setCommands] = useState([]);
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0, direction: 'right' });

  const value = {
    grid,
    setGrid,
    commands,
    setCommands,
    robotPosition,
    setRobotPosition,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
