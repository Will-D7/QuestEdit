import React, { useState, useRef } from 'react';
import styles from '../../styles/DraggableItem.module.css';


const DraggableItem = ({
  id,
  text,
  description,
  type,
  containerId,
  canDrag = true,
  onNestedCommandDrop,
}) => {
  const [showNestedCommands, setShowNestedCommands] = useState(false);
  const nestedDropRef = useRef(null);

  const handleDragStart = (e) => {
    if (!canDrag) return;

    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        itemId: id,
        containerId: containerId,
        commandType: type,
      })
    );
    e.target.classList.add(styles.dragging);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove(styles.dragging);
  };

  const getCommandClass = () => {
    switch (type) {
      case 'avanzar':
        return styles.cmdAvanzar;
      case 'girarderecha':
        return styles.cmdGirarderecha;
      case 'girarizquierda':
        return styles.cmdGirarizquierda;
      case 'recogersaltar':
        return styles.cmdRecogersaltar;
      case 'transferirObjeto':
        return styles.cmdTransferirObjeto;
      case 'repetir':
        return styles.cmdRepetir;
      case 'sihayobstaculo':
        return styles.cmdSihayobstaculo;
      case 'sihayobjeto':
        return styles.cmdSihayobjeto;
      default:
        return '';
    }
  };

  const handleNestedDragOver = (e) => {
    if (!nestedDropRef.current) return;
    e.preventDefault();
    nestedDropRef.current.classList.add(styles.nestedDraggingOver);
  };

  const handleNestedDragLeave = () => {
    if (nestedDropRef.current) {
      nestedDropRef.current.classList.remove(styles.nestedDraggingOver);
    }
  };

  const handleNestedDrop = (e) => {
    if (!nestedDropRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    nestedDropRef.current.classList.remove(styles.nestedDraggingOver);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (onNestedCommandDrop) {
        onNestedCommandDrop(data, id);
      }
    } catch (error) {
      console.error('Error processing nested drop:', error);
    }
  };

  const hasNestedCommands = ['repetir', 'sihayobstaculo', 'sihayobjeto'].includes(type);

  return (
    <div
      className={`${styles.draggableItem} ${getCommandClass()}`}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-id={id}
      data-type={type}
    >
      <div className={styles.commandTitle}>{text}</div>
      <div className={styles.description}>{description}</div>

      {hasNestedCommands && (
        <div>
          <button
            className={styles.nestedToggle}
            onClick={() => setShowNestedCommands(!showNestedCommands)}
          >
            {showNestedCommands ? 'Ocultar comandos' : 'Mostrar comandos'}
          </button>

          {showNestedCommands && (
            <div>
              <div className={styles.nestedLabel}>Comandos:</div>
              <div
                className={styles.nestedCommands}
                ref={nestedDropRef}
                onDragOver={handleNestedDragOver}
                onDragLeave={handleNestedDragLeave}
                onDrop={handleNestedDrop}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggableItem;
