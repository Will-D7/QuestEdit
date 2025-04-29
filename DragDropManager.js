/**
 * DragDropManager.js
 * Main controller class for the DragDropJS library
 * Handles initialization and coordination between draggable and droppable elements
 */
class DragDropManager {
  constructor() {
    this.draggables = new Map();
    this.droppables = new Map();
    this.initialized = false;
    this.defaultConfig = {
      draggableClass: 'draggable',
      droppableClass: 'droppable',
      draggingClass: 'dragging',
      overClass: 'drop-over',
      // Default options for draggable items
      draggableOptions: {
        axis: 'both', // 'x', 'y', or 'both'
        containment: 'viewport', // 'parent', 'viewport', or selector
        handle: null, // selector for drag handle
      },
      // Default options for droppable zones
      droppableOptions: {
        accept: '*', // selector for acceptable draggables
        tolerance: 'intersect', // 'touch', 'fit', 'intersect'
      }
    };
    this.activeConfig = { ...this.defaultConfig };
    this.activeElement = null;
  }

  /**
   * Initialize the drag and drop library
   * @param {Object} config - Configuration options
   * @returns {DragDropManager} - Returns the manager instance for chaining
   */
  init(config = {}) {
    if (this.initialized) {
      console.warn('DragDropJS is already initialized. Call destroy() before initializing again.');
      return this;
    }

    // Merge default config with provided config
    this.activeConfig = { 
      ...this.defaultConfig,
      ...config,
      draggableOptions: { ...this.defaultConfig.draggableOptions, ...(config.draggableOptions || {}) },
      droppableOptions: { ...this.defaultConfig.droppableOptions, ...(config.droppableOptions || {}) }
    };

    // Auto-initialize elements with draggable/droppable classes if specified in config
    if (this.activeConfig.autoInitialize !== false) {
      const draggableElements = document.querySelectorAll(`.${this.activeConfig.draggableClass}`);
      const droppableElements = document.querySelectorAll(`.${this.activeConfig.droppableClass}`);

      draggableElements.forEach(el => this.makeDraggable(el));
      droppableElements.forEach(el => this.makeDroppable(el));
    }

    this.initialized = true;
    return this;
  }

  /**
   * Make an element draggable
   * @param {HTMLElement|String} element - Element or selector to make draggable
   * @param {Object} options - Options for the draggable behavior
   * @returns {DragDropManager} - Returns the manager instance for chaining
   */
  makeDraggable(element, options = {}) {
    // Resolve element if it's a string selector
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!el) {
      console.error('Element not found:', element);
      return this;
    }

    // Skip if element is already draggable
    if (this.draggables.has(el)) {
      console.warn('Element is already draggable:', el);
      return this;
    }

    // Merge default options with provided options
    const mergedOptions = { 
      ...this.activeConfig.draggableOptions,
      ...options
    };

    // Create new Draggable instance
    try {
      const draggable = new Draggable(el, mergedOptions, this);
      this.draggables.set(el, draggable);
    } catch (error) {
      console.error('Error creating draggable:', error);
    }

    return this;
  }

  /**
   * Make an element droppable
   * @param {HTMLElement|String} element - Element or selector to make droppable
   * @param {Object} options - Options for the droppable behavior
   * @returns {DragDropManager} - Returns the manager instance for chaining
   */
  makeDroppable(element, options = {}) {
    // Resolve element if it's a string selector
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!el) {
      console.error('Element not found:', element);
      return this;
    }

    // Skip if element is already droppable
    if (this.droppables.has(el)) {
      console.warn('Element is already droppable:', el);
      return this;
    }

    // Merge default options with provided options
    const mergedOptions = { 
      ...this.activeConfig.droppableOptions,
      ...options
    };

    // Create new Droppable instance
    try {
      // We assume Droppable class is available
      const droppable = new Droppable(el, mergedOptions, this);
      this.droppables.set(el, droppable);
    } catch (error) {
      console.error('Error creating droppable:', error);
    }

    return this;
  }

  /**
   * Set the active draggable element
   * @param {Draggable} draggable - The active draggable element
   */
  setActiveDraggable(draggable) {
    this.activeElement = draggable;
  }

  /**
   * Get the active draggable element
   * @returns {Draggable|null} - The active draggable or null
   */
  getActiveDraggable() {
    return this.activeElement;
  }

  /**
   * Check for intersection between the active draggable and all droppables
   * @param {Event} event - The drag event
   */
  checkDroppableIntersections(event) {
    if (!this.activeElement) return;

    const activeDraggableEl = this.activeElement.element;
    const activeDraggableRect = activeDraggableEl.getBoundingClientRect();

    this.droppables.forEach((droppable, droppableEl) => {
      // Check if this droppable should accept this draggable
      if (!this.isAcceptable(activeDraggableEl, droppable)) {
        return;
      }

      const droppableRect = droppableEl.getBoundingClientRect();
      const isIntersecting = this.checkIntersection(
        activeDraggableRect, 
        droppableRect, 
        droppable.options.tolerance
      );

      if (isIntersecting && !droppable.isOver) {
        // Enter event
        droppable.handleDragEnter(event, this.activeElement);
      } else if (!isIntersecting && droppable.isOver) {
        // Leave event
        droppable.handleDragLeave(event, this.activeElement);
      }
    });
  }

  /**
   * Check if a draggable is acceptable for a droppable based on the accept option
   * @param {HTMLElement} draggableEl - The draggable element
   * @param {Droppable} droppable - The droppable instance
   * @returns {Boolean} - Whether the draggable is acceptable
   */
  isAcceptable(draggableEl, droppable) {
    const acceptOption = droppable.options.accept;
    
    // If accept is '*', accept all draggables
    if (acceptOption === '*') return true;
    
    // If accept is a selector, check if draggable matches
    if (typeof acceptOption === 'string') {
      return draggableEl.matches(acceptOption);
    }
    
    // If accept is a function, call it with the draggable element
    if (typeof acceptOption === 'function') {
      return acceptOption(draggableEl);
    }
    
    return false;
  }

  /**
   * Check intersection between two rectangles
   * @param {DOMRect} draggableRect - The draggable element's rectangle
   * @param {DOMRect} droppableRect - The droppable element's rectangle
   * @param {String} tolerance - Intersection tolerance type
   * @returns {Boolean} - Whether the elements intersect
   */
  checkIntersection(draggableRect, droppableRect, tolerance) {
    // Basic intersection check
    if (
      draggableRect.right < droppableRect.left ||
      draggableRect.left > droppableRect.right ||
      draggableRect.bottom < droppableRect.top ||
      draggableRect.top > droppableRect.bottom
    ) {
      return false;
    }
    
    switch (tolerance) {
      case 'fit':
        // Draggable must be completely inside the droppable
        return (
          draggableRect.left >= droppableRect.left &&
          draggableRect.right <= droppableRect.right &&
          draggableRect.top >= droppableRect.top &&
          draggableRect.bottom <= droppableRect.bottom
        );
      case 'touch':
        // Any part of draggable touches the droppable
        return true; // If we've reached this point, we have at least one point overlapping
      case 'intersect':
      default:
        // At least 50% of draggable must be inside droppable
        const draggableArea = draggableRect.width * draggableRect.height;
        const intersectionWidth = Math.min(draggableRect.right, droppableRect.right) - 
                                Math.max(draggableRect.left, droppableRect.left);
        const intersectionHeight = Math.min(draggableRect.bottom, droppableRect.bottom) - 
                                 Math.max(draggableRect.top, droppableRect.top);
        const intersectionArea = intersectionWidth * intersectionHeight;
        
        return intersectionArea >= draggableArea * 0.5;
    }
  }

  /**
   * Handle drop event
   * @param {Event} event - The drop event
   */
  handleDrop(event) {
    if (!this.activeElement) return;
    
    const activeDraggableEl = this.activeElement.element;
    const activeDraggableRect = activeDraggableEl.getBoundingClientRect();
    let dropped = false;

    this.droppables.forEach((droppable, droppableEl) => {
      // Check if this droppable should accept this draggable
      if (!this.isAcceptable(activeDraggableEl, droppable)) {
        return;
      }

      const droppableRect = droppableEl.getBoundingClientRect();
      const isIntersecting = this.checkIntersection(
        activeDraggableRect, 
        droppableRect, 
        droppable.options.tolerance
      );

      if (isIntersecting) {
        droppable.handleDrop(event, this.activeElement);
        dropped = true;
      }
    });

    if (!dropped) {
      // No drop occurred, return to original position
      this.activeElement.resetPosition();
    }

    this.activeElement = null;
  }

  /**
   * Destroy the drag and drop manager and clean up event listeners
   */
  destroy() {
    // Clean up all draggables
    this.draggables.forEach(draggable => {
      draggable.destroy();
    });
    this.draggables.clear();

    // Clean up all droppables
    this.droppables.forEach(droppable => {
      droppable.destroy();
    });
    this.droppables.clear();

    this.initialized = false;
    this.activeElement = null;
    this.activeConfig = { ...this.defaultConfig };
    
    return this;
  }
}

// Create singleton instance
const DragDropJS = new DragDropManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragDropJS;
} else {
  window.DragDropJS = DragDropJS;
}

