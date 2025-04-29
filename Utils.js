/**
 * Utils.js
 * Common utility functions for DragDropJS library
 */
const Utils = {
  /**
   * DOM Helpers
   */
  dom: {
    /**
     * Select an element or list of elements
     * @param {String} selector - CSS selector
     * @param {HTMLElement} [context=document] - Context to search within
     * @param {Boolean} [all=false] - Whether to return all matches
     * @returns {HTMLElement|NodeList} - Selected element(s)
     */
    select: function(selector, context = document, all = false) {
      return all ? 
        context.querySelectorAll(selector) : 
        context.querySelector(selector);
    },
    
    /**
     * Create a DOM element with attributes and content
     * @param {String} tagName - Tag name of element to create
     * @param {Object} [attrs] - Attributes to set on the element
     * @param {String|HTMLElement} [content] - Content to append to the element
     * @returns {HTMLElement} - The created element
     */
    create: function(tagName, attrs = {}, content = '') {
      const element = document.createElement(tagName);
      
      // Set attributes
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class' || key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // Set content
      if (content) {
        if (typeof content === 'string') {
          element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          element.appendChild(content);
        }
      }
      
      return element;
    },
    
    /**
     * Add event listener with support for multiple events
     * @param {HTMLElement} element - Element to attach listener to
     * @param {String|Array} events - Event type(s) to listen for
     * @param {Function} handler - Event handler function
     * @param {Object|Boolean} [options] - Event listener options
     */
    addEvents: function(element, events, handler, options) {
      const eventList = Array.isArray(events) ? events : events.split(' ');
      
      eventList.forEach(event => {
        element.addEventListener(event, handler, options);
      });
    },
    
    /**
     * Remove event listener with support for multiple events
     * @param {HTMLElement} element - Element to remove listener from
     * @param {String|Array} events - Event type(s) to remove
     * @param {Function} handler - Event handler function
     * @param {Object|Boolean} [options] - Event listener options
     */
    removeEvents: function(element, events, handler, options) {
      const eventList = Array.isArray(events) ? events : events.split(' ');
      
      eventList.forEach(event => {
        element.removeEventListener(event, handler, options);
      });
    },
    
    /**
     * Get computed style value
     * @param {HTMLElement} element - The element
     * @param {String} property - CSS property name
     * @returns {String} - The computed style value
     */
    getStyle: function(element, property) {
      return window.getComputedStyle(element).getPropertyValue(property);
    },
    
    /**
     * Check if element matches a selector
     * @param {HTMLElement} element - The element to check
     * @param {String} selector - CSS selector
     * @returns {Boolean} - Whether the element matches the selector
     */
    matches: function(element, selector) {
      const matchesMethod = element.matches || 
                          element.webkitMatchesSelector || 
                          element.mozMatchesSelector || 
                          element.msMatchesSelector;
      
      return matchesMethod.call(element, selector);
    },
    
    /**
     * Find closest parent matching a selector
     * @param {HTMLElement} element - Starting element
     * @param {String} selector - CSS selector to match
     * @returns {HTMLElement|null} - The closest matching parent or null
     */
    closest: function(element, selector) {
      // Use native closest if available
      if (element.closest) {
        return element.closest(selector);
      }
      
      // Fallback for older browsers
      let current = element;
      while (current && current !== document) {
        if (Utils.dom.matches(current, selector)) {
          return current;
        }
        current = current.parentNode;
      }
      
      return null;
    }
  },
  
  /**
   * Unit conversion utilities
   */
  units: {
    /**
     * Convert pixels to rem
     * @param {Number} px - Value in pixels
     * @returns {Number} - Value in rem
     */
    pxToRem: function(px) {
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      return px / rootFontSize;
    },
    
    /**
     * Convert rem to pixels
     * @param {Number} rem - Value in rem
     * @returns {Number} - Value in pixels
     */
    remToPx: function(rem) {
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      return rem * rootFontSize;
    },
    
    /**
     * Convert pixels to em relative to an element
     * @param {Number} px - Value in pixels
     * @param {HTMLElement} [element=document.body] - Reference element
     * @returns {Number} - Value in em
     */
    pxToEm: function(px, element = document.body) {
      const elementFontSize = parseFloat(
        getComputedStyle(element).fontSize
      );
      return px / elementFontSize;
    },
    
    /**
     * Convert em to pixels relative to an element
     * @param {Number} em - Value in em
     * @param {HTMLElement} [element=document.body] - Reference element
     * @returns {Number} - Value in pixels
     */
    emToPx: function(em, element = document.body) {
      const elementFontSize = parseFloat(
        getComputedStyle(element).fontSize
      );
      return em * elementFontSize;
    },
    
    /**
     * Convert pixels to viewport width percentage
     * @param {Number} px - Value in pixels
     * @returns {Number} - Value in vw units
     */
    pxToVw: function(px) {
      return (px / window.innerWidth) * 100;
    },
    
    /**
     * Convert viewport width percentage to pixels
     * @param {Number} vw - Value in vw units
     * @returns {Number} - Value in pixels
     */
    vwToPx: function(vw) {
      return (vw * window.innerWidth) / 100;
    }
  },
  
  /**
   * Browser feature detection
   */
  features: {
    /**
     * Detect touch support
     * @returns {Boolean} - Whether touch is supported
     */
    hasTouch: function() {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 ||
             navigator.msMaxTouchPoints > 0;
    },
    
    /**
     * Detect pointer events support
     * @returns {Boolean} - Whether pointer events are supported
     */
    hasPointerEvents: function() {
      return !!window.PointerEvent;
    },
    
    /**
     * Detect passive event listeners support
     * @returns {Boolean} - Whether passive event listeners are supported
     */
    hasPassiveEvents: function() {
      let passive = false;
      
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get: function() {
            passive = true;
            return true;
          }
        });
        
        window.addEventListener('test', null, opts);
        window.removeEventListener('test', null, opts);
      } catch (e) {}
      
      return passive;
    },
    
    /**
     * Detect CSS transform support
     * @returns {String|Boolean} - The supported transform property or false
     */
    getTransformProperty: function() {
      const properties = [
        'transform',
        'webkitTransform',
        'MozTransform',
        'msTransform',
        'OTransform'
      ];
      
      const testElement = document.createElement('div');
      
      for (const property of properties) {
        if (testElement.style[property] !== undefined) {
          return property;
        }
      }
      
      return false;
    },
    
    /**
     * Detect if device is mobile
     * @returns {Boolean} - Whether the device is mobile
     */
    isMobile: function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  },
  
  /**
   * Miscellaneous utilities
   */
  misc: {
    /**
     * Generate a unique ID
     * @param {String} [prefix=''] - Prefix for the ID
     * @returns {String} - A unique ID
     */
    uniqueId: function(prefix = '') {
      return `${prefix}${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    },
    
    /**
     * Throttle a function
     * @param {Function} func - The function to throttle
     * @param {Number} delay - Delay in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle: function(func, delay) {
      let lastCall = 0;
      
      return function(...args) {
        const now = Date.now();
        
        if (now - lastCall >= delay) {
          lastCall = now;
          return func.apply(this, args);
        }
      };
    },
    
    /**
     * Debounce a function
     * @param {Function} func - The function to debounce
     * @param {Number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce: function(func, delay) {
      let timeout;
      
      return function(...args) {
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
          func.apply(this, args);
        }, delay);
      };
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} else if (typeof window !== 'undefined') {
  window.Utils = Utils;
}

