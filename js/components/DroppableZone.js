
const DroppableZone = ({ id, title, items, onDrop, onNestedCommandDrop, emptyMessage = null }) => {
  const handleDragOver = (e) => {
    
    e.preventDefault();
    
    e.currentTarget.classList.add('dragging-over');
  };
  
  const handleDragLeave = (e) => {
    
    e.currentTarget.classList.remove('dragging-over');
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    e.currentTarget.classList.remove('dragging-over');
    
    try {
      
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { itemId, containerId, commandType } = data;
      
      
      const dropY = e.clientY;
      const droppableItems = [...e.currentTarget.querySelectorAll('.draggable-item')];
      
      
      let insertIndex = items.length; 
      
      for (let i = 0; i < droppableItems.length; i++) {
        const rect = droppableItems[i].getBoundingClientRect();
        const itemMiddle = rect.top + (rect.height / 2);
        
        
        if (dropY < itemMiddle) {
          insertIndex = i;
          break;
        }
      }
      
      
      onDrop(itemId, containerId, id, insertIndex, commandType);
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };
  
  return (
    <div
      className="drop-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-id={id}
    >
      <h2>{title}</h2>
      
      {items.length === 0 && emptyMessage && (
        <div className="empty-message">{emptyMessage}</div>
      )}
      
      <div className="items-container">
        {items.map((item) => (
          <DraggableItem 
            key={item.id} 
            id={item.id} 
            text={item.text}
            description={item.description}
            type={item.type}
            containerId={id}
            canDrag={id !== "available" || item.canDuplicate !== false}
            onNestedCommandDrop={id === "sequence" ? onNestedCommandDrop : null}
          />
        ))}
      </div>
    </div>
  );
};
