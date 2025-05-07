
const ClassroomScreen = () => {
  
  const [robot, setRobot] = React.useState({
    x: 1, 
    y: 1, 
    direction: 0, 
    holding: null, 
    status: 'idle' 
  });
  
  
  const [commandHistory, setCommandHistory] = React.useState([]);
  const [robotMessage, setRobotMessage] = React.useState('Esperando comandos...');
  
  
  const [desks, setDesks] = React.useState([
    { id: 1, col: 1, row: 1, hasObject: 'book' },
    { id: 2, col: 1, row: 3, hasObject: null },
    { id: 3, col: 1, row: 5, hasObject: 'pencil' },
    { id: 4, col: 3, row: 1, hasObject: null },
    { id: 5, col: 3, row: 3, hasObject: 'apple' },
    { id: 6, col: 3, row: 5, hasObject: null },
    { id: 7, col: 5, row: 1, hasObject: 'pencil' },
    { id: 8, col: 5, row: 3, hasObject: null },
    { id: 9, col: 5, row: 5, hasObject: 'book' },
    { id: 10, col: 7, row: 1, hasObject: null },
    { id: 11, col: 7, row: 3, hasObject: 'book' },
    { id: 12, col: 7, row: 5, hasObject: 'apple' },
  ]);
  
  
  const [droppedObjects, setDroppedObjects] = React.useState([]);
  
  
  const programExecutionRef = React.useRef({ running: false });
  
  
  const resetRobot = () => {
    setRobot({
      x: 1,
      y: 1,
      direction: 0,
      holding: null,
      status: 'idle'
    });
    setCommandHistory([]);
    setRobotMessage('Robot reiniciado. Esperando comandos...');
    
    
    setDesks([
      { id: 1, col: 1, row: 1, hasObject: 'book' },
      { id: 2, col: 1, row: 3, hasObject: null },
      { id: 3, col: 1, row: 5, hasObject: 'pencil' },
      { id: 4, col: 3, row: 1, hasObject: null },
      { id: 5, col: 3, row: 3, hasObject: 'apple' },
      { id: 6, col: 3, row: 5, hasObject: null },
      { id: 7, col: 5, row: 1, hasObject: 'pencil' },
      { id: 8, col: 5, row: 3, hasObject: null },
      { id: 9, col: 5, row: 5, hasObject: 'book' },
      { id: 10, col: 7, row: 1, hasObject: null },
      { id: 11, col: 7, row: 3, hasObject: 'book' },
      { id: 12, col: 7, row: 5, hasObject: 'apple' },
    ]);
    
    
    setDroppedObjects([]);
    
    
    programExecutionRef.current.running = false;
  };
  
  
  const runProgram = async () => {
    
    const programData = localStorage.getItem('robotProgram');
    if (!programData) {
      setRobotMessage('No hay programa para ejecutar. ¡Crea uno primero!');
      return;
    }
    
    try {
      const program = JSON.parse(programData);
      if (program.length === 0) {
        setRobotMessage('El programa está vacío. ¡Agrega algunos comandos!');
        return;
      }
      
      
      if (programExecutionRef.current.running) {
        setRobotMessage('¡El programa ya está en ejecución!');
        return;
      }
      
      programExecutionRef.current.running = true;
      setRobotMessage('¡Ejecutando programa!');
      setCommandHistory([]);
      
      
      await executeCommands(program);
      
      programExecutionRef.current.running = false;
      setRobotMessage('¡Programa completado!');
      
    } catch (error) {
      console.error('Error running program:', error);
      setRobotMessage('Error al ejecutar el programa.');
      programExecutionRef.current.running = false;
    }
  };
  
  
  const executeCommands = async (commands) => {
    for (const command of commands) {
      if (!programExecutionRef.current.running) break;
      
      await executeCommand(command);
      
      
      if (command.nestedCommands && command.nestedCommands.length > 0) {
        if (command.type === 'repetir') {
          
          setRobotMessage('Repitiendo comandos 3 veces');
          for (let i = 0; i < 3; i++) {
            if (!programExecutionRef.current.running) break;
            await executeCommands(command.nestedCommands);
          }
        } else if (command.type === 'sihayobstaculo') {
          
          const hasObstacle = checkObstacleInFront();
          if (hasObstacle) {
            setRobotMessage('Hay obstáculo. Ejecutando comandos anidados.');
            await executeCommands(command.nestedCommands);
          } else {
            setRobotMessage('No hay obstáculo. Saltando comandos anidados.');
          }
        } else if (command.type === 'sihayobjeto') {
          
          const hasObject = checkObjectInFront();
          if (hasObject) {
            setRobotMessage('Hay objeto. Ejecutando comandos anidados.');
            await executeCommands(command.nestedCommands);
          } else {
            setRobotMessage('No hay objeto. Saltando comandos anidados.');
          }
        }
      }
      
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };
  
  
  const executeCommand = async (command) => {
    
    setCommandHistory(prev => [...prev, command.text]);
    
    switch(command.type) {
      case 'avanzar':
        await moveForward();
        break;
      case 'girarderecha':
        await turnRight();
        break;
      case 'girarizquierda':
        await turnLeft();
        break;
      case 'recogersaltar':
        await pickupOrDrop();
        break;
      case 'repetir':
        
        break;
      case 'sihayobstaculo':
        
        break;
      case 'sihayobjeto':
        
        break;
      default:
        setRobotMessage('Comando desconocido');
    }
  };
  
  
  const checkObstacleInFront = () => {
    
    return false;
  };
  
  
  const checkObjectInFront = () => {
    
    let frontX = robot.x;
    let frontY = robot.y;
    
    
    if (robot.direction === 0) frontX += 1; 
    if (robot.direction === 90) frontY += 1; 
    if (robot.direction === 180) frontX -= 1; 
    if (robot.direction === 270) frontY -= 1; 
    
    
    const deskInFront = desks.find(desk => desk.col === frontX && desk.row === frontY);
    if (deskInFront && deskInFront.hasObject) {
      return true;
    }
    
    
    const objectInFront = droppedObjects.find(obj => obj.x === frontX && obj.y === frontY);
    if (objectInFront) {
      return true;
    }
    
    return false;
  };
  
  
  const moveForward = async () => {
    setRobot(prev => {
      
      let newX = prev.x;
      let newY = prev.y;
      
      
      if (prev.direction === 0) newX += 1; 
      if (prev.direction === 90) newY += 1; 
      if (prev.direction === 180) newX -= 1; 
      if (prev.direction === 270) newY -= 1; 
      
      
      newX = Math.max(1, Math.min(newX, 7));
      newY = Math.max(1, Math.min(newY, 5));
      
      
      const isDesk = (newX % 2 === 1) && (newY % 2 === 1);
      if (isDesk) {
        
        setRobotMessage('No puedo caminar sobre los escritorios!');
        return prev;
      }
      
      setRobotMessage('Avanzando un paso');
      
      return {
        ...prev,
        x: newX,
        y: newY,
        status: 'moving'
      };
    });
    
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    
    setRobot(prev => ({
      ...prev,
      status: 'idle'
    }));
  };
  
  
  const turnRight = async () => {
    setRobot(prev => {
      
      let newDirection = (prev.direction + 90) % 360;
      
      setRobotMessage('Girando a la derecha');
      
      return {
        ...prev,
        direction: newDirection,
        status: 'turning'
      };
    });
    
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    
    setRobot(prev => ({
      ...prev,
      status: 'idle'
    }));
  };
  
  
  const turnLeft = async () => {
    setRobot(prev => {
      
      let newDirection = (prev.direction - 90 + 360) % 360;
      
      setRobotMessage('Girando a la izquierda');
      
      return {
        ...prev,
        direction: newDirection,
        status: 'turning'
      };
    });
    
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    
    setRobot(prev => ({
      ...prev,
      status: 'idle'
    }));
  };
  
  
  const getAdjacentDesk = () => {
    return desks.find(desk => 
      
      (Math.abs(desk.col - robot.x) === 1 && desk.row === robot.y) ||
      (Math.abs(desk.row - robot.y) === 1 && desk.col === robot.x)
    );
  };
  
  
  const pickupOrDrop = async () => {
    
    if (robot.holding) {
      
      const adjacentDesk = getAdjacentDesk();
      
      if (adjacentDesk && !adjacentDesk.hasObject) {
        
        setRobotMessage(`Soltando ${getObjectName(robot.holding)} en el escritorio`);
        
        
        const updatedDesks = desks.map(desk => {
          if (desk.id === adjacentDesk.id) {
            return { ...desk, hasObject: robot.holding };
          }
          return desk;
        });
        
        setDesks(updatedDesks);
        
        
        setRobot(prev => ({
          ...prev,
          holding: null,
          status: 'action'
        }));
      } else {
        
        setRobotMessage(`Soltando ${getObjectName(robot.holding)} en el suelo`);
        
        
        setDroppedObjects(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            type: robot.holding, 
            x: robot.x, 
            y: robot.y 
          }
        ]);
        
        
        setRobot(prev => ({
          ...prev,
          holding: null,
          status: 'action'
        }));
      }
    } else {
      
      const adjacentDesk = getAdjacentDesk();
      
      if (adjacentDesk && adjacentDesk.hasObject) {
        
        setRobotMessage(`Recogiendo ${getObjectName(adjacentDesk.hasObject)} del escritorio`);
        
        
        setRobot(prev => ({
          ...prev,
          holding: adjacentDesk.hasObject,
          status: 'action'
        }));
        
        
        const updatedDesks = desks.map(desk => {
          if (desk.id === adjacentDesk.id) {
            return { ...desk, hasObject: null };
          }
          return desk;
        });
        
        setDesks(updatedDesks);
      } else {
        
        const objectAtPosition = droppedObjects.find(
          obj => obj.x === robot.x && obj.y === robot.y
        );
        
        if (objectAtPosition) {
          setRobotMessage(`Recogiendo ${getObjectName(objectAtPosition.type)} del suelo`);
          
          
          setRobot(prev => ({
            ...prev,
            holding: objectAtPosition.type,
            status: 'action'
          }));
          
          
          setDroppedObjects(prev => 
            prev.filter(obj => obj.id !== objectAtPosition.id)
          );
        } else {
          setRobotMessage('No hay objeto para recoger');
          return;
        }
      }
    }
    
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    
    setRobot(prev => ({
      ...prev,
      status: 'idle'
    }));
  };
  
  
  const getObjectName = (objectType) => {
    switch(objectType) {
      case 'book': return 'el libro';
      case 'apple': return 'la manzana';
      case 'pencil': return 'el lápiz';
      default: return 'el objeto';
    }
  };
  
  return (
    <div className="classroom-container">
      <h1>Simulación del Robot</h1>
      
      <div className="instructions">
        El robot ejecutará los comandos que programaste en la pantalla anterior
      </div>
      
      <div className="classroom-grid">
        {}
        {desks.map((desk) => (
          <div 
            key={desk.id}
            className="desk"
            style={{
              gridColumn: desk.col,
              gridRow: desk.row
            }}
          >
            {desk.hasObject && (
              <div className={`object ${desk.hasObject}`}></div>
            )}
          </div>
        ))}
        
        {}
        {droppedObjects.map((object) => (
          <div
            key={object.id}
            className={`dropped-object ${object.type}`}
            style={{
              gridColumn: object.x,
              gridRow: object.y
            }}
          ></div>
        ))}
        
        {}
        <div 
          className={`robot ${robot.status === 'action' ? 'robot-action' : ''}`}
          style={{
            gridColumn: robot.x,
            gridRow: robot.y,
            transform: `rotate(${robot.direction}deg)`,
            transition: robot.status === 'idle' ? 'none' : 'all 0.5s ease'
          }}
        >
          {robot.holding && (
            <div className={`carried-object ${robot.holding}`}></div>
          )}
        </div>
      </div>
      
      <div className="robot-status">
        <h3>Estado del Robot</h3>
        <div className="robot-message">{robotMessage}</div>
        
        <div className="command-history">
          {commandHistory.length > 0 ? (
            commandHistory.map((cmd, index) => (
              <div key={index}>▶ {cmd}</div>
            ))
          ) : (
            <div>Sin comandos ejecutados</div>
          )}
        </div>
      </div>
      
      <div className="program-controls">
        <button className="control-button start-button" onClick={runProgram}>
          ▶️ Iniciar Simulación
        </button>
        <button className="control-button reset-button" onClick={resetRobot}>
          🔄 Reiniciar Robot
        </button>
      </div>
    </div>
  );
};
