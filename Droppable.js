/**
 * Droppable.js
 * Class for handling droppable zones
 * Provides drop targets for draggable elements
 */
class Droppable {
  /**
   * Create a new Droppable instance
   * @param {HTMLElement} element - The element to make droppable
   * @param {Object} options - Options for droppable behavior
   * @param {DragDropManager} manager - Reference to the DragDropManager instance
   */
  constructor(element, options = {}, manager) {
    this.element = element;
    this.options = options;
    this.manager = manager;
    
    // State
    this.isOver = false;
    this.currentDraggable = null;
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the droppable element
   */
  init() {
    // Add droppable attribute for accessibility
    this.element.setAttribute('aria-dropeffect', 'none');
    
    // Add droppable class from config
    if (this.manager.activeConfig.droppableClass) {
      this.element.classList.add(this.manager.activeConfig.droppableClass);
    }
  }
  
  /**
   * Handle drag enter event
   * @param {Event} event - The original mouse/touch event
   * @param {Draggable} draggable - The draggable element that entered
   */
  handleDragEnter(event, draggable) {
    if (this.isOver) return;
    
    // Set state
    this.isOver = true;
    this.currentDraggable = draggable;
    
    // Add over class
    if (this.manager.activeConfig.overClass) {
      this.element.classList.add(this.manager.activeConfig.overClass);
    }
    
    // Update accessibility
    this.element.setAttribute('aria-dropeffect', 'move');
    
    // Trigger dropEnter event
    this.triggerEvent('dropEnter', {
      originalEvent: event,
      draggable: draggable.element,
      droppable: this.element
    });
  }
  
  /**
   * Handle drag leave event
   * @param {Event} event - The original mouse/touch event
   * @param {Draggable} draggable - The draggable element that left
   */
  handleDragLeave(event, draggable) {
    if (!this.isOver) return;
    
    // Set state
    this.isOver = false;
    
    // Remove over class
    if (this.manager.activeConfig.overClass) {
      this.element.classList.remove(this.manager.activeConfig.overClass);
    }
    
    // Update accessibility
    this.element.setAttribute('aria-dropeffect', 'none');
    
    // Trigger dropLeave event
    this.triggerEvent('dropLeave', {
      originalEvent: event,
      draggable: draggable.element,
      droppable: this.element
    });
    
    this.currentDraggable = null;
  }
  
  /**
   * Handle drop event
   * @param {Event} event - The original mouse/touch event
   * @param {Draggable} draggable - The draggable element that was dropped
   */
  handleDrop(event, draggable) {
    if (!this.isOver) return;
    
    // Set state
    this.isOver = false;
    
    // Remove over class
    if (this.manager.activeConfig.overClass) {
      this.element.classList.remove(this.manager.activeConfig.overClass);
    }
    
    // Update accessibility
    this.element.setAttribute('aria-dropeffect', 'none');
    
    // Handle drop behavior based on options
    if (this.options.revert !== false) {
      // Default behavior: revert the draggable to its original position
      draggable.resetPosition();
    }
    
    if (this.options.append === true) {
      // Append draggable to droppable if specified
      this.element.appendChild(draggable.element);
      // Reset transform since the element is now in a new parent
      draggable.element.style.transform = '';
    }
    
    // Trigger drop event
    this.triggerEvent('drop', {
      originalEvent: event,
      draggable: draggable.element,
      droppable: this.element
    });
    
    this.currentDraggable = null;
  }
  
  /**
   * Check if the droppable is hoverable by the current draggable
   * @param {HTMLElement} draggableElement - The draggable element to check
   * @returns {Boolean} - Whether the draggable is acceptable
   */
  canAccept(draggableElement) {
    const accept = this.options.accept;
    
    if (accept === '*') {
      return true;
    }
    
    if (typeof accept === 'function') {
      return accept.call(this.element, draggableElement);
    }
    
    if (typeof accept === 'string') {
      return draggableElement.matches(accept);
    }
    
    return false;
  }
  
  /**
   * Trigger a custom event on the element
   * @param {String} eventName - Name of the event
   * @param {Object} data - Data to pass with the event
   */
  triggerEvent(eventName, data) {
    const customEvent = new CustomEvent(`dragdrop:${eventName}`, {
      bubbles: true,
      cancelable: true,
      detail: {
        droppable: this,
        ...data
      }
    });
    
    this.element.dispatchEvent(customEvent);
    
    // If event handler is defined in options, call it
    if (typeof this.options[eventName] === 'function') {
      this.options[eventName].call(this.element, customEvent);
    }
  }
  
  /**
   * Destroy this droppable instance and clean up
   */
  destroy() {
    // Remove droppable class if present
    if (this.manager.activeConfig.droppableClass) {
      this.element.classList.remove(this.manager.activeConfig.droppableClass);
    }
    
    // Remove over class if present
    if (this.manager.activeConfig.overClass) {
      this.element.classList.remove(this.manager.activeConfig.overClass);
    }
    
    // Remove attributes
    this.element.removeAttribute('aria-dropeffect');
    
    // Reset state
    this.isOver = false;
    this.currentDraggable = null;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Droppable;
} else if (typeof window !== 'undefined') {
  window.Droppable = Droppable;
}

