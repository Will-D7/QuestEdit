import React from 'react';
import { GameStateProvider } from '../games/robot/context/GameStateContext';
import Grid from '../games/robot/components/Grid';
import Controls from '../games/robot/components/Controls';

const RobotGame = () => {
  return (
    <GameStateProvider>
      <div>
        <h1>Robot Game</h1>
        <div>
          <Grid/>
          <div>
            <Controls/>
          </div>
        </div>
      </div>
    </GameStateProvider>
  );
};

export default RobotGame;
