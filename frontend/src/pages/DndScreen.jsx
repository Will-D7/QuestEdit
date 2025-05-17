import React, { useState } from 'react';
import DroppableZone from '../components/dnd/DroppableZone';
import styles from '../styles/DndScreen.module.css';

const DndScreen = () => {
  const [availableCommands, setAvailableCommands] = useState([
    { id: 1, text: "Avanzar", description: "El robot avanza un paso hacia adelante", type: "avanzar", canDuplicate: true },
    { id: 2, text: "Girar Derecha", description: "El robot gira 90° hacia la derecha", type: "girarderecha", canDuplicate: true },
    { id: 3, text: "Girar Izquierda", description: "El robot gira 90° hacia la izquierda", type: "girarizquierda", canDuplicate: true },
    { id: 4, text: "Recoger/Soltar", description: "El robot recoge o suelta un objeto", type: "recogersaltar", canDuplicate: true },
    { id: 5, text: "Transferir Objeto", description: "Recoge un objeto de un escritorio y lo lleva a otro", type: "transferirObjeto", canDuplicate: true },
    { id: 6, text: "Repetir 3 Veces", description: "Repite los comandos anidados tres veces", type: "repetir", canDuplicate: true, nestedCommands: [] },
    { id: 7, text: "Si Hay Obstáculo", description: "Ejecuta comandos si hay un obstáculo adelante", type: "sihayobstaculo", canDuplicate: true, nestedCommands: [] },
    { id: 8, text: "Si Hay Objeto", description: "Ejecuta comandos si hay un objeto adelante", type: "sihayobjeto", canDuplicate: true, nestedCommands: [] }
  ]);

  const [programSequence, setProgramSequence] = useState([]);
  const [nextId, setNextId] = useState(100);

  const handleDrop = (itemId, sourceContainerId, targetContainerId, insertIndex, commandType) => {
    if (sourceContainerId === targetContainerId) {
      if (sourceContainerId === 'sequence') {
        reorderItems(programSequence, setProgramSequence, itemId, insertIndex);
      }
    } else {
      if (sourceContainerId === 'available') {
        moveFromAvailableToSequence(itemId, insertIndex);
      } else if (sourceContainerId === 'sequence' && targetContainerId === 'available') {
        removeFromSequence(itemId);
      }
    }
  };

  const handleNestedCommandDrop = (data, parentId) => {
    const { itemId, containerId } = data;
    if (containerId !== 'available') return;

    const parentIndex = programSequence.findIndex(item => item.id === parseInt(parentId));
    if (parentIndex === -1) return;

    const sourceItem = availableCommands.find(item => item.id === parseInt(itemId));
    if (!sourceItem) return;

    const newSequence = [...programSequence];
    const parentCommand = { ...newSequence[parentIndex] };

    if (!parentCommand.nestedCommands) {
      parentCommand.nestedCommands = [];
    }

    const nestedCommand = { ...sourceItem, id: nextId };
    parentCommand.nestedCommands.push(nestedCommand);
    newSequence[parentIndex] = parentCommand;

    setProgramSequence(newSequence);
    setNextId(nextId + 1);
  };

  const reorderItems = (items, setItems, itemId, toIndex) => {
    const fromIndex = items.findIndex(item => item.id === parseInt(itemId));
    if (fromIndex === -1 || fromIndex === toIndex) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;

    newItems.splice(adjustedToIndex, 0, movedItem);
    setItems(newItems);
  };

  const moveFromAvailableToSequence = (itemId, insertIndex) => {
    const sourceIndex = availableCommands.findIndex(item => item.id === parseInt(itemId));
    if (sourceIndex === -1) return;

    const originalItem = availableCommands[sourceIndex];
    const clonedItem = { ...originalItem, id: nextId };

    if (['repetir', 'sihayobstaculo', 'sihayobjeto'].includes(clonedItem.type)) {
      clonedItem.nestedCommands = [];
    }

    setNextId(nextId + 1);
    const newSequence = [...programSequence];
    newSequence.splice(insertIndex, 0, clonedItem);
    setProgramSequence(newSequence);
  };

  const removeFromSequence = (itemId) => {
    const index = programSequence.findIndex(item => item.id === parseInt(itemId));
    if (index === -1) return;

    const newSequence = [...programSequence];
    newSequence.splice(index, 1);
    setProgramSequence(newSequence);
  };

  const handleRunProgram = () => {
    if (programSequence.length === 0) {
      alert('¡Primero agrega algunos comandos a tu programa!');
      return;
    }

    localStorage.setItem('robotProgram', JSON.stringify(programSequence));
    document.getElementById('classroom-button')?.click();
    alert('¡Programa listo! El robot ejecutará tus comandos en la simulación.');
  };

  const handleClearProgram = () => {
    setProgramSequence([]);
  };

  return (
    <div className={styles.programRobotScreen}>
      <h1>Programa tu Robot</h1>
      <div className={styles.instructions}>
        Arrastra comandos desde "Comandos Disponibles" a "Secuencia del Programa" para crear una secuencia de acciones para el robot
      </div>

      <div className={styles.programContainer}>
        <div className={styles.commandsArea}>
          <DroppableZone
            id="available"
            title="Comandos Disponibles"
            items={availableCommands}
            onDrop={handleDrop}
          />
        </div>

        <div className={styles.sequenceArea}>
          <DroppableZone
            id="sequence"
            title="Secuencia del Programa"
            items={programSequence}
            onDrop={handleDrop}
            onNestedCommandDrop={handleNestedCommandDrop}
            emptyMessage="Arrastra comandos aquí para crear tu programa"
          />
        </div>
      </div>

      <div className={styles.programControls}>
        <button className={styles.playButton} onClick={handleRunProgram}>▶️ Ejecutar Programa</button>
        <button className={styles.controlButton} onClick={handleClearProgram}>🗑️ Borrar Programa</button>
      </div>
    </div>
  );
};

export default DndScreen;
