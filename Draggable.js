/**
 * Draggable.js
 * Class for handling draggable elements
 * Supports mouse and touch events
 */
class Draggable {
  /**
   * Create a new Draggable instance
   * @param {HTMLElement} element - The element to make draggable
   * @param {Object} options - Options for draggable behavior
   * @param {DragDropManager} manager - Reference to the DragDropManager instance
   */
  constructor(element, options = {}, manager) {
    this.element = element;
    this.options = options;
    this.manager = manager;
    
    // State
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Initial element position and style
    this.originalPosition = {
      position: '',
      top: '',
      left: '',
      transform: ''
    };
    
    // Event handlers - bound to maintain 'this' context
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragMove = this.handleDragMove.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the draggable element
   */
  init() {
    // Save original styles for reset
    const computedStyle = window.getComputedStyle(this.element);
    this.originalPosition = {
      position: this.element.style.position,
      top: this.element.style.top,
      left: this.element.style.left,
      transform: this.element.style.transform
    };
    
    // Make the element relatively positioned if it's not already positioned
    if (computedStyle.position === 'static') {
      this.element.style.position = 'relative';
    }
    
    // Add draggable attribute for accessibility
    this.element.setAttribute('aria-grabbed', 'false');
    this.element.setAttribute('tabindex', '0');
    
    // Add draggable class from config
    if (this.manager.activeConfig.draggableClass) {
      this.element.classList.add(this.manager.activeConfig.draggableClass);
    }
    
    // Attach event listeners based on handle option
    const handle = this.options.handle ? 
      this.element.querySelector(this.options.handle) : 
      this.element;
      
    if (!handle) {
      console.warn(`Handle selector "${this.options.handle}" not found in element:`, this.element);
      return;
    }
    
    // Mouse events
    handle.addEventListener('mousedown', this.handleDragStart);
    
    // Touch events
    handle.addEventListener('touchstart', this.handleDragStart, { passive: false });
    
    // Keyboard events for accessibility
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        this.element.setAttribute('aria-grabbed', 'true');
      }
    });
    
    // Prevent default drag behavior for native HTML5 drag-drop
    this.element.addEventListener('dragstart', (e) => e.preventDefault());
  }
  
  /**
   * Handle drag start event
   * @param {Event} e - Mouse or Touch event
   */
  handleDragStart(e) {
    // Prevent default behavior
    e.preventDefault();
    
    // Stop if already dragging
    if (this.isDragging) return;
    
    // Set the active element in manager
    this.manager.setActiveDraggable(this);
    
    // Determine event type and get coordinates
    const isTouchEvent = e.type.startsWith('touch');
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    
    // Save starting position
    const rect = this.element.getBoundingClientRect();
    this.startX = rect.left;
    this.startY = rect.top;
    this.offsetX = clientX - rect.left;
    this.offsetY = clientY - rect.top;
    
    // Set dragging state
    this.isDragging = true;
    this.element.setAttribute('aria-grabbed', 'true');
    
    // Add dragging class
    if (this.manager.activeConfig.draggingClass) {
      this.element.classList.add(this.manager.activeConfig.draggingClass);
    }
    
    // Attach move and end event listeners
    if (isTouchEvent) {
      document.addEventListener('touchmove', this.handleDragMove, { passive: false });
      document.addEventListener('touchend', this.handleDragEnd);
      document.addEventListener('touchcancel', this.handleDragEnd);
    } else {
      document.addEventListener('mousemove', this.handleDragMove);
      document.addEventListener('mouseup', this.handleDragEnd);
    }
    
    // Trigger dragStart event
    this.triggerEvent('dragStart', { 
      originalEvent: e,
      startX: this.startX,
      startY: this.startY
    });
  }
  
  /**
   * Handle drag move event
   * @param {Event} e - Mouse or Touch event
   */
  handleDragMove(e) {
    // Prevent default behavior
    e.preventDefault();
    
    // Stop if not dragging
    if (!this.isDragging) return;
    
    // Determine event type and get coordinates
    const isTouchEvent = e.type.startsWith('touch');
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    
    // Calculate new position
    let newX = clientX - this.offsetX;
    let newY = clientY - this.offsetY;
    
    // Apply axis constraint if specified
    if (this.options.axis === 'x') {
      newY = this.startY;
    } else if (this.options.axis === 'y') {
      newX = this.startX;
    }
    
    // Apply containment if specified
    if (this.options.containment) {
      const constrainedPosition = this.applyContainment(newX, newY);
      newX = constrainedPosition.x;
      newY = constrainedPosition.y;
    }
    
    // Update current position
    this.currentX = newX;
    this.currentY = newY;
    
    // Apply the transformation
    this.updateElementPosition();
    
    // Check for intersections with droppables
    this.manager.checkDroppableIntersections(e);
    
    // Trigger dragMove event
    this.triggerEvent('dragMove', { 
      originalEvent: e,
      currentX: this.currentX,
      currentY: this.currentY
    });
  }
  
  /**
   * Handle drag end event
   * @param {Event} e - Mouse or Touch event
   */
  handleDragEnd(e) {
    // Stop if not dragging
    if (!this.isDragging) return;
    
    // Reset dragging state
    this.isDragging = false;
    this.element.setAttribute('aria-grabbed', 'false');
    
    // Remove dragging class
    if (this.manager.activeConfig.draggingClass) {
      this.element.classList.remove(this.manager.activeConfig.draggingClass);
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('touchmove', this.handleDragMove);
    document.removeEventListener('touchend', this.handleDragEnd);
    document.removeEventListener('touchcancel', this.handleDragEnd);
    
    // Handle drop
    this.manager.handleDrop(e);
    
    // Trigger dragEnd event
    this.triggerEvent('dragEnd', { 
      originalEvent: e,
      finalX: this.currentX,
      finalY: this.currentY
    });
  }
  
  /**
   * Apply containment constraints to the position
   * @param {Number} x - The unconstrained X position
   * @param {Number} y - The unconstrained Y position
   * @returns {Object} - The constrained position {x, y}
   */
  applyContainment(x, y) {
    let containerEl;
    const containment = this.options.containment;
    
    if (containment === 'parent') {
      containerEl = this.element.parentElement;
    } else if (containment === 'viewport') {
      // Use viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const elementRect = this.element.getBoundingClientRect();
      
      // Calculate bounds
      const minX = 0;
      const minY = 0;
      const maxX = viewportWidth - elementRect.width;
      const maxY = viewportHeight - elementRect.height;
      
      // Apply constraints
      return {
        x: Math.max(minX, Math.min(x, maxX)),
        y: Math.max(minY, Math.min(y, maxY))
      };
    } else if (typeof containment === 'string') {
      // Try to find the container by selector
      containerEl = document.querySelector(containment);
    }
    
    if (!containerEl) {
      // No valid container found, return unconstrained position
      return { x, y };
    }
    
    // Get container and element dimensions
    const containerRect = containerEl.getBoundingClientRect();
    const elementRect = this.element.getBoundingClientRect();
    
    // Calculate bounds
    const minX = containerRect.left;
    const minY = containerRect.top;
    const maxX = containerRect.right - elementRect.width;
    const maxY = containerRect.bottom - elementRect.height;
    
    // Apply constraints
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY))
    };
  }
  
  /**
   * Update the element's position
   */
  updateElementPosition() {
    // Calculate the translation from the original position
    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    
    // Apply the transformation
    this.element.style.transform = 
      `translate(${deltaX}px, ${deltaY}px)`;
  }
  
  /**
   * Reset the element position to its original state
   */
  resetPosition() {
    this.element.style.transform = this.originalPosition.transform;
    this.currentX = this.startX;
    this.currentY = this.startY;
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
        draggable: this,
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
   * Destroy this draggable instance and clean up
   */
  destroy() {
    // Remove event listeners
    const handle = this.options.handle ? 
      this.element.querySelector(this.options.handle) : 
      this.element;
    
    if (handle) {
      handle.removeEventListener('mousedown', this.handleDragStart);
      handle.removeEventListener('touchstart', this.handleDragStart);
    }
    
    // Remove dragging class if present
    if (this.manager.activeConfig.draggingClass) {
      this.element.classList.remove(this.manager.activeConfig.draggingClass);
    }
    
    // Remove draggable class if present
    if (this.manager.activeConfig.draggableClass) {
      this.element.classList.remove(this.manager.activeConfig.draggableClass);
    }
    
    // Reset element to original state
    this.element.style.position = this.originalPosition.position;
    this.element.style.top = this.originalPosition.top;
    this.element.style.left = this.originalPosition.left;
    this.element.style.transform = this.originalPosition.transform;
    
    // Remove attributes
    this.element.removeAttribute('aria-grabbed');
    
    // Reset state
    this.isDragging = false;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Draggable;
} else if (typeof window !== 'undefined') {
  window.Draggable = Draggable;
}

