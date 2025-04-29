/**
 * PositionCalculator.js
 * Utility for position calculations with scroll offsets
 * Handles coordinate conversions and viewport considerations
 */
class PositionCalculator {
  /**
   * Create a new PositionCalculator
   */
  constructor() {
    // Reference viewport dimensions
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    
    // Bind resize handler
    this.handleResize = this.handleResize.bind(this);
    
    // Listen for viewport changes
    window.addEventListener('resize', this.handleResize);
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
  }
  
  /**
   * Get current scroll offsets
   * @returns {Object} - Current scroll position {x, y}
   */
  getScrollOffsets() {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  }
  
  /**
   * Get viewport dimensions
   * @returns {Object} - Current viewport size {width, height}
   */
  getViewportDimensions() {
    return {
      width: this.viewportWidth,
      height: this.viewportHeight
    };
  }
  
  /**
   * Calculate element position with respect to the document
   * @param {HTMLElement} element - The element to calculate position for
   * @returns {Object} - Position {top, left, right, bottom, width, height}
   */
  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const scrollOffsets = this.getScrollOffsets();
    
    return {
      top: rect.top + scrollOffsets.y,
      left: rect.left + scrollOffsets.x,
      right: rect.right + scrollOffsets.x,
      bottom: rect.bottom + scrollOffsets.y,
      width: rect.width,
      height: rect.height
    };
  }
  
  /**
   * Convert absolute (px) position to relative position
   * @param {Number} value - The value to convert
   * @param {String} unit - The unit to convert to ('rem', 'em', '%', 'vh', 'vw')
   * @param {HTMLElement} [relativeTo] - The reference element for relative units
   * @returns {Number} - The converted value
   */
  absoluteToRelative(value, unit, relativeTo) {
    switch (unit) {
      case 'rem':
        // Convert to rem based on root font size
        const rootFontSize = parseFloat(
          getComputedStyle(document.documentElement).fontSize
        );
        return value / rootFontSize;
      
      case 'em':
        // Convert to em based on element's font size
        const elementFontSize = relativeTo ? 
          parseFloat(getComputedStyle(relativeTo).fontSize) : 
          parseFloat(getComputedStyle(document.body).fontSize);
        return value / elementFontSize;
      
      case '%':
        // Convert to percentage of parent element's dimension
        if (!relativeTo) return value;
        const parentWidth = relativeTo.offsetWidth;
        return (value / parentWidth) * 100;
      
      case 'vh':
        // Convert to viewport height percentage
        return (value / this.viewportHeight) * 100;
      
      case 'vw':
        // Convert to viewport width percentage
        return (value / this.viewportWidth) * 100;
      
      default:
        return value;
    }
  }
  
  /**
   * Convert relative position to absolute (px) position
   * @param {Number} value - The value to convert
   * @param {String} unit - The unit to convert from ('rem', 'em', '%', 'vh', 'vw')
   * @param {HTMLElement} [relativeTo] - The reference element for relative units
   * @returns {Number} - The converted value in pixels
   */
  relativeToAbsolute(value, unit, relativeTo) {
    switch (unit) {
      case 'rem':
        // Convert from rem based on root font size
        const rootFontSize = parseFloat(
          getComputedStyle(document.documentElement).fontSize
        );
        return value * rootFontSize;
      
      case 'em':
        // Convert from em based on element's font size
        const elementFontSize = relativeTo ? 
          parseFloat(getComputedStyle(relativeTo).fontSize) : 
          parseFloat(getComputedStyle(document.body).fontSize);
        return value * elementFontSize;
      
      case '%':
        // Convert from percentage of parent element's dimension
        if (!relativeTo) return value;
        const parentWidth = relativeTo.offsetWidth;
        return (value * parentWidth) / 100;
      
      case 'vh':
        // Convert from viewport height percentage
        return (value * this.viewportHeight) / 100;
      
      case 'vw':
        // Convert from viewport width percentage
        return (value * this.viewportWidth) / 100;
      
      default:
        return value;
    }
  }
  
  /**
   * Calculate relative position between two elements
   * @param {HTMLElement} element - The element to position
   * @param {HTMLElement} relativeTo - The reference element
   * @returns {Object} - Relative position {top, left}
   */
  getRelativePosition(element, relativeTo) {
    const elementRect = element.getBoundingClientRect();
    const relativeRect = relativeTo.getBoundingClientRect();
    
    return {
      top: elementRect.top - relativeRect.top,
      left: elementRect.left - relativeRect.left
    };
  }
  
  /**
   * Check if an element is within the viewport
   * @param {HTMLElement} element - The element to check
   * @param {Number} [threshold=0] - Threshold in pixels for partial visibility
   * @returns {Boolean} - Whether the element is visible
   */
  isElementInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= (this.viewportHeight + threshold) &&
      rect.right <= (this.viewportWidth + threshold)
    );
  }
  
  /**
   * Calculate intersection area between two elements
   * @param {HTMLElement} element1 - First element
   * @param {HTMLElement} element2 - Second element
   * @returns {Number} - Intersection area in pixels
   */
  calculateIntersectionArea(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    // Calculate intersection dimensions
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    
    // Calculate area
    return xOverlap * yOverlap;
  }
  
  /**
   * Calculate percentage of element1 that intersects with element2
   * @param {HTMLElement} element1 - First element (the one we're calculating percentage for)
   * @param {HTMLElement} element2 - Second element
   * @returns {Number} - Percentage of intersection (0-100)
   */
  calculateIntersectionPercentage(element1, element2) {
    const intersectionArea = this.calculateIntersectionArea(element1, element2);
    const rect1 = element1.getBoundingClientRect();
    const element1Area = rect1.width * rect1.height;
    
    if (element1Area === 0) return 0;
    
    return (intersectionArea / element1Area) * 100;
  }
  
  /**
   * Clean up and remove event listeners
   */
  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}

// Create singleton instance
const positionCalculator = new PositionCalculator();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = positionCalculator;
} else if (typeof window !== 'undefined') {
  window.positionCalculator = positionCalculator;
}

