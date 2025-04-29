/**
 * EventHandler.js
 * Unified event handling for mouse and touch events
 * Normalizes event data across different input methods
 */
class EventHandler {
  /**
   * Create a new EventHandler instance
   */
  constructor() {
    // Device feature detection
    this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.hasPointer = !!window.PointerEvent;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Passive event support detection
    this.supportsPassive = this.detectPassiveSupport();
    
    // Bound handlers for use with addEventListener/removeEventListener
    this.boundHandlers = new WeakMap();
  }
  
  /**
   * Detect passive event listener support
   * @returns {Boolean} - Whether passive event listeners are supported
   */
  detectPassiveSupport() {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
          return true;
        }
      });
      window.addEventListener('testPassive', null, opts);
      window.removeEventListener('testPassive', null, opts);
    } catch (e) {}
    return supportsPassive;
  }
  
  /**
   * Register a start event (mousedown/touchstart/pointerdown)
   * @param {HTMLElement} element - The element to attach the event to
   * @param {Function} handler - The event handler function
   * @param {Object} options - Options for addEventListener
   */
  addStartEvent(element, handler, options = {}) {
    const normalizedOptions = this.supportsPassive ? { passive: false, ...options } : false;
    
    if (this.hasPointer) {
      this.addEvent(element, 'pointerdown', handler, normalizedOptions);
    } else {
      if (this.hasTouch) {
        this.addEvent(element, 'touchstart', handler, normalizedOptions);
      }
      // Always add mouse events as fallback
      this.addEvent(element, 'mousedown', handler, options);
    }
  }
  
  /**
   * Register a move event (mousemove/touchmove/pointermove)
   * @param {HTMLElement} element - The element to attach the event to
   * @param {Function} handler - The event handler function
   * @param {Object} options - Options for addEventListener
   */
  addMoveEvent(element, handler, options = {}) {
    const normalizedOptions = this.supportsPassive ? { passive: false, ...options } : false;
    
    if (this.hasPointer) {
      this.addEvent(element, 'pointermove', handler, normalizedOptions);
    } else {
      if (this.hasTouch) {
        this.addEvent(element, 'touchmove', handler, normalizedOptions);
      }
      // Always add mouse events as fallback
      this.addEvent(element, 'mousemove', handler, options);
    }
  }
  
  /**
   * Register an end event (mouseup/touchend/pointerup)
   * @param {HTMLElement} element - The element to attach the event to
   * @param {Function} handler - The event handler function
   * @param {Object} options - Options for addEventListener
   */
  addEndEvent(element, handler, options = {}) {
    if (this.hasPointer) {
      this.addEvent(element, 'pointerup', handler, options);
      this.addEvent(element, 'pointercancel', handler, options);
    } else {
      if (this.hasTouch) {
        this.addEvent(element, 'touchend', handler, options);
        this.addEvent(element, 'touchcancel', handler, options);
      }
      // Always add mouse events as fallback
      this.addEvent(element, 'mouseup', handler, options);
    }
  }
  
  /**
   * Remove a start event (mousedown/touchstart/pointerdown)
   * @param {HTMLElement} element - The element to remove the event from
   * @param {Function} handler - The original event handler function
   * @param {Object} options - Options for removeEventListener
   */
  removeStartEvent(element, handler, options = {}) {
    if (this.hasPointer) {
      this.removeEvent(element, 'pointerdown', handler, options);
    } else {
      if (this.hasTouch) {
        this.removeEvent(element, 'touchstart', handler, options);
      }
      this.removeEvent(element, 'mousedown', handler, options);
    }
  }
  
  /**
   * Remove a move event (mousemove/touchmove/pointermove)
   * @param {HTMLElement} element - The element to remove the event from
   * @param {Function} handler - The original event handler function
   * @param {Object} options - Options for removeEventListener
   */
  removeMoveEvent(element, handler, options = {}) {
    if (this.hasPointer) {
      this.removeEvent(element, 'pointermove', handler, options);
    } else {
      if (this.hasTouch) {
        this.removeEvent(element, 'touchmove', handler, options);
      }
      this.removeEvent(element, 'mousemove', handler, options);
    }
  }
  
  /**
   * Remove an end event (mouseup/touchend/pointerup)
   * @param {HTMLElement} element - The element to remove the event from
   * @param {Function} handler - The original event handler function
   * @param {Object} options - Options for removeEventListener
   */
  removeEndEvent(element, handler, options = {}) {
    if (this.hasPointer) {
      this.removeEvent(element, 'pointerup', handler, options);
      this.removeEvent(element, 'pointercancel', handler, options);
    } else {
      if (this.hasTouch) {
        this.removeEvent(element, 'touchend', handler, options);
        this.removeEvent(element, 'touchcancel', handler, options);
      }
      this.removeEvent(element, 'mouseup', handler, options);
    }
  }
  
  /**
   * Helper method to add an event listener and store the bound handler
   * @param {HTMLElement} element - The element to attach the event to
   * @param {String} eventType - The event type
   * @param {Function} handler - The event handler function
   * @param {Object|Boolean} options - Options for addEventListener
   */
  addEvent(element, eventType, handler, options) {
    // Create a bound handler that will normalize the event object
    const boundHandler = (event) => {
      const normalizedEvent = this.normalizeEvent(event);
      return handler(normalizedEvent);
    };
    
    // Store the relationship between original and bound handler
    if (!this.boundHandlers.has(handler)) {
      this.boundHandlers.set(handler, new Map());
    }
    this.boundHandlers.get(handler).set(eventType, boundHandler);
    
    // Add the event listener
    element.addEventListener(eventType, boundHandler, options);
  }
  
  /**
   * Helper method to remove an event listener using the stored bound handler
   * @param {HTMLElement} element - The element to remove the event from
   * @param {String} eventType - The event type
   * @param {Function} handler - The original event handler function
   * @param {Object|Boolean} options - Options for removeEventListener
   */
  removeEvent(element, eventType, handler, options) {
    // Get the bound handler
    const handlerMap = this.boundHandlers.get(handler);
    if (!handlerMap) return;
    
    const boundHandler = handlerMap.get(eventType);
    if (!boundHandler) return;
    
    // Remove the event listener
    element.removeEventListener(eventType, boundHandler, options);
    
    // Clean up the handler map
    handlerMap.delete(eventType);
    if (handlerMap.size === 0) {
      this.boundHandlers.delete(handler);
    }
  }
  
  /**
   * Normalize event data from different event types
   * @param {Event} event - The original event object
   * @returns {Object} - A normalized event object
   */
  normalizeEvent(event) {
    // Create a normalized event object
    const normalizedEvent = {
      originalEvent: event,
      target: event.target,
      currentTarget: event.currentTarget,
      type: event.type,
      timeStamp: event.timeStamp,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    };
    
    // Add normalized coordinates
    if (event.type.startsWith('touch') && event.touches && event.touches.length > 0) {
      const touch = event.touches[0] || event.changedTouches[0];
      normalizedEvent.clientX = touch.clientX;
      normalizedEvent.clientY = touch.clientY;
      normalizedEvent.screenX = touch.screenX;
      normalizedEvent.screenY = touch.screenY;
      normalizedEvent.pageX = touch.pageX;
      normalizedEvent.pageY = touch.pageY;
      normalizedEvent.touchCount = event.touches.length;
    } else {
      normalizedEvent.clientX = event.clientX;
      normalizedEvent.clientY = event.clientY;
      normalizedEvent.screenX = event.screenX;
      normalizedEvent.screenY = event.screenY;
      normalizedEvent.pageX = event.pageX;
      normalizedEvent.pageY = event.pageY;
      normalizedEvent.touchCount = 0;
    }
    
    // Add scroll position
    normalizedEvent.scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    normalizedEvent.scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add viewport dimensions
    normalizedEvent.viewportWidth = window.innerWidth;
    normalizedEvent.viewportHeight = window.innerHeight;
    
    return normalizedEvent;
  }
  
  /**
   * Get the current pointer position from any event
   * @param {Event} event - The event object
   * @returns {Object} - The coordinates {x, y} in client coordinates
   */
  getPointerPosition(event) {
    // Normalize the event
    const normalizedEvent = this.normalizeEvent(event);
    
    // Return client coordinates
    return {
      x: normalizedEvent.clientX,
      y: normalizedEvent.clientY
    };
  }
  
  /**
   * Prevent default browser behavior for an event
   * @param {Event} event - The event object
   */
  preventDefault(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    return false;
  }
  
  /**
   * Check if the event is a primary button interaction (left click or touch)
   * @param {Event} event - The event object
   * @returns {Boolean} - Whether it's a primary interaction
   */
  isPrimaryButton(event) {
    // For mouse events, check if it's the primary button (usually left)
    if (event.type.startsWith('mouse')) {
      return event.button === 0;
    }
    
    // For pointer events, check if it's the primary pointer
    if (event.type.startsWith('pointer')) {
      return event.isPrimary !== false && event.button === 0;
    }
    
    // For touch events, always return true
    if (event.type.startsWith('touch')) {
      return true;
    }
    
    return false;
  }
}

// Create singleton instance
const DragDropEventHandler = new EventHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragDropEventHandler;
} else if (typeof window !== 'undefined') {
  window.DragDropEventHandler = DragDropEventHandler;
}

