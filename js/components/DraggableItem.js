
const DraggableItem = ({ id, text, description, type, containerId, canDrag = true, onNestedCommandDrop }) => {
  const [showNestedCommands, setShowNestedCommands] = React.useState(false);
  const nestedDropRef = React.useRef(null);
  
  const handleDragStart = (e) => {
    if (!canDrag) return;
    
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      itemId: id,
      containerId: containerId,
      commandType: type
    }));
    
    
    e.target.classList.add('dragging');
  };
  
  const handleDragEnd = (e) => {
    
    e.target.classList.remove('dragging');
  };
  
  
  const getCommandClass = () => {
    switch(type) {
      case 'avanzar': return 'cmd-avanzar';
      case 'girarderecha': return 'cmd-girarderecha';
      case 'girarizquierda': return 'cmd-girarizquierda';
      case 'recogersaltar': return 'cmd-recogersaltar';
      case 'transferirObjeto': return 'cmd-transferirObjeto';
      case 'repetir': return 'cmd-repetir';
      case 'sihayobstaculo': return 'cmd-sihayobstaculo';
      case 'sihayobjeto': return 'cmd-sihayobjeto';
      default: return '';
    }
  };
  
  const handleNestedDragOver = (e) => {
    if (!nestedDropRef.current) return;
    
    e.preventDefault();
    
    nestedDropRef.current.classList.add('nested-dragging-over');
  };
  
  const handleNestedDragLeave = (e) => {
    if (!nestedDropRef.current) return;
    
    nestedDropRef.current.classList.remove('nested-dragging-over');
  };
  
  const handleNestedDrop = (e) => {
    if (!nestedDropRef.current) return;
    
    e.preventDefault();
    e.stopPropagation(); 
    
    
    nestedDropRef.current.classList.remove('nested-dragging-over');
    
    try {
      
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      
      if (onNestedCommandDrop) {
        onNestedCommandDrop(data, id);
      }
    } catch (error) {
      console.error('Error processing nested drop:', error);
    }
  };
  
  
  const hasNestedCommands = type === 'repetir' || type === 'sihayobstaculo' || type === 'sihayobjeto';
  
  return (
    <div 
      className={`draggable-item ${getCommandClass()}`}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-id={id}
      data-type={type}
    >
      <div className="command-title">{text}</div>
      <div className="description">{description}</div>
      
      {}
      {hasNestedCommands && (
        <div>
          <button 
            className="nested-commands-toggle" 
            onClick={() => setShowNestedCommands(!showNestedCommands)}
          >
            {showNestedCommands ? 'Ocultar comandos' : 'Mostrar comandos'}
          </button>
          
          {showNestedCommands && (
            <div>
              <div className="nested-commands-label">Comandos:</div>
              <div 
                className="nested-commands"
                ref={nestedDropRef}
                onDragOver={handleNestedDragOver}
                onDragLeave={handleNestedDragLeave}
                onDrop={handleNestedDrop}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
