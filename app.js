/**
 * app.js
 * Demo application showcasing the DragDropJS library
 * With fixed Shopping Cart Demo
 */
document.addEventListener('DOMContentLoaded', function() {
  /**
   * Initialize the DragDropJS library with custom configuration
   */
  DragDropJS.init({
    draggableClass: 'draggable',
    droppableClass: 'droppable',
    draggingClass: 'dragging',
    overClass: 'drop-over',
    // Auto-initialize elements with designated classes
    autoInitialize: false // Changed to false to manually initialize everything
  });
  
  /**
   * Task Board Demo - Setup
   * Makes all task columns droppable and configures drop behavior
   * Now with sortable functionality within columns
   */
  function setupTaskBoard() {
    // Make all zones droppable
    const dropZones = document.querySelectorAll('.drop-zone');
    
    dropZones.forEach(zone => {
      DragDropJS.makeDroppable(zone, {
        // Accept only task items
        accept: '.task-item',
        // Element must be at least 50% inside the droppable
        tolerance: 'intersect',
        // Event handlers
        dropEnter: function(e) {
          console.log('Task entered zone:', this.querySelector('.drop-zone-title').textContent);
        },
        drop: function(e) {
          const taskName = e.detail.draggable.querySelector('h4').textContent;
          const zoneName = this.querySelector('.drop-zone-title').textContent;
          console.log(`Task "${taskName}" moved to "${zoneName}"`);
          
          // Get the dragged item
          const draggedItem = e.detail.draggable;
          const mouseY = e.detail.originalEvent.clientY;
          
          // Find the closest task item based on mouse position
          const taskItems = Array.from(this.querySelectorAll('.task-item'));
          let closestItem = null;
          let closestDistance = Infinity;
          
          taskItems.forEach(item => {
            if (item === draggedItem) return;
            
            const rect = item.getBoundingClientRect();
            const itemMiddleY = rect.top + rect.height / 2;
            const distance = Math.abs(mouseY - itemMiddleY);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestItem = item;
            }
          });
          
          // Insert at the right position
          if (closestItem) {
            const rect = closestItem.getBoundingClientRect();
            const itemMiddleY = rect.top + rect.height / 2;
            
            if (mouseY < itemMiddleY) {
              this.insertBefore(draggedItem, closestItem);
            } else {
              this.insertBefore(draggedItem, closestItem.nextElementSibling);
            }
          } else {
            // If no closest item found, just append
            this.appendChild(draggedItem);
          }
          
          // Reset the transform
          draggedItem.style.transform = '';
          
          // Add a subtle animation effect
          draggedItem.classList.add('drop-success');
          setTimeout(() => {
            draggedItem.classList.remove('drop-success');
          }, 300);
        }
      });
    });
    
    // Configure all task items as draggable
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(task => {
      DragDropJS.makeDraggable(task, {
        // Constrain movement to both axes to allow column changes
        // while still enabling sorting within columns
        axis: 'both',
        // Contain within viewport
        containment: 'viewport',
        // Event handlers
        dragStart: function(e) {
          console.log('Started dragging task:', this.querySelector('h4').textContent);
        }
      });
    });
  }
  
  /**
   * Sortable List Demo - Setup
   * Creates a sortable list where items can be reordered
   */
  function setupSortableList() {
    const sortableList = document.getElementById('sortable-list');
    
    // Make the list itself a droppable container
    DragDropJS.makeDroppable(sortableList, {
      accept: '.list-item',
      tolerance: 'pointer',
      drop: function(e) {
        // Create a placeholder where to insert the dragged item
        const draggedItem = e.detail.draggable;
        const listItems = Array.from(this.querySelectorAll('.list-item'));
        const mouseY = e.detail.originalEvent.clientY;
        
        // Find the closest item based on mouse position
        let closestItem = null;
        let closestDistance = Infinity;
        
        listItems.forEach(item => {
          if (item === draggedItem) return;
          
          const rect = item.getBoundingClientRect();
          const itemMiddleY = rect.top + rect.height / 2;
          const distance = Math.abs(mouseY - itemMiddleY);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestItem = item;
          }
        });
        
        if (closestItem) {
          // Determine if we should insert before or after the closest item
          const rect = closestItem.getBoundingClientRect();
          const itemMiddleY = rect.top + rect.height / 2;
          
          if (mouseY < itemMiddleY) {
            sortableList.insertBefore(draggedItem, closestItem);
          } else {
            sortableList.insertBefore(draggedItem, closestItem.nextElementSibling);
          }
        } else {
          // If no closest item found, just append
          sortableList.appendChild(draggedItem);
        }
        
        // Reset the transform
        draggedItem.style.transform = '';
      }
    });
    
    // Make all list items draggable with a handle
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
      DragDropJS.makeDraggable(item, {
        // Only allow vertical dragging
        axis: 'y',
        // Use the handle element for dragging
        handle: '.handle',
        // Contain within parent element
        containment: 'parent'
      });
    });
  }
  
  /**
   * Shopping Cart Demo - Setup
   * Demonstrates product dragging to cart with cloning
   * FIXED VERSION
   */
  function setupShoppingCart() {
    // Get references to elements
    const shoppingCart = document.getElementById('shopping-cart');
    const cartCountElement = document.getElementById('cart-count');
    let cartCount = 0;
    
    // Remove any existing class to ensure clean initialization
    if (shoppingCart.classList.contains('droppable')) {
      shoppingCart.classList.remove('droppable');
      console.log('Removed existing droppable class from shopping cart');
    }
    
    // First, explicitly destroy any existing droppable initialization
    if (DragDropJS.droppables && DragDropJS.droppables.has(shoppingCart)) {
      DragDropJS.droppables.delete(shoppingCart);
      console.log('Removed existing droppable initialization from shopping cart');
    }
    
    // Make shopping cart droppable with explicit configuration
    console.log('Making shopping cart droppable');
    DragDropJS.makeDroppable(shoppingCart, {
      accept: '.product-item', // Accept products
      tolerance: 'intersect',  // Easier to drop with 'intersect'
      
      // Visual feedback when dragging over
      dropEnter: function(e) {
        console.log('Product entered cart');
        this.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
        this.style.borderColor = '#2ecc71';
        this.style.borderStyle = 'solid';
      },
      
      // Reset visual feedback when leaving
      dropLeave: function(e) {
        console.log('Product left cart');
        this.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
        this.style.borderStyle = 'dashed';
        this.style.borderColor = 'var(--primary-color)';
      },
      
      // Handle actual drop
      drop: function(e) {
        console.log('Product dropped into cart!', e.detail);
        
        // Reset background color
        this.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
        this.style.borderStyle = 'dashed';
        this.style.borderColor = 'var(--primary-color)';
        
        // Get product info
        const product = e.detail.draggable;
        const productName = product.querySelector('p').textContent;
        const productPrice = product.querySelectorAll('p')[1].textContent;
        
        console.log(`Adding ${productName} at ${productPrice} to cart`);
        
        // Create a cart item element
        const cartItem = document.createElement('div');
        cartItem.className = 'list-item';
        cartItem.innerHTML = `
          <div>${productName}</div>
          <div style="margin-left: auto;">${productPrice}</div>
          <button class="remove-btn" style="margin-left: 0.5rem; background: #e74c3c; color: white; border: none; border-radius: 0.25rem; padding: 0.25rem 0.5rem;">X</button>
        `;
        
        // Add remove button handler
        const removeBtn = cartItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
          cartItem.remove();
          cartCount--;
          cartCountElement.textContent = cartCount;
        });
        
        // Add to cart with animation
        cartItem.style.opacity = '0';
        cartItem.style.transform = 'translateY(10px)';
        shoppingCart.appendChild(cartItem);
        
        // Update cart count
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Animate in the item
        setTimeout(() => {
          cartItem.style.transition = 'all 0.3s ease';
          cartItem.style.opacity = '1';
          cartItem.style.transform = 'translateY(0)';
        }, 10);
      }
    });
    
    // Configure all products as draggable
    const products = document.querySelectorAll('.product-item');
    products.forEach(product => {
      // First clean up any existing initialization
      if (DragDropJS.draggables && DragDropJS.draggables.has(product)) {
        DragDropJS.draggables.delete(product);
        console.log('Removed existing draggable initialization from product');
      }
      
      console.log('Making product draggable', product.id);
      DragDropJS.makeDraggable(product, {
        // Basic configuration for reliable drag behavior
        axis: 'both',
        containment: 'viewport',
        dragStart: function(e) {
          console.log('Started dragging product:', this.id);
        },
        dragEnd: function(e) {
          console.log('Stopped dragging product:', this.id);
        }
      });
    });
  }
  
  // Initialize all demos
  setupTaskBoard();
  setupSortableList();
  setupShoppingCart();
  
  // Add global event listeners for debugging
  document.addEventListener('dragdrop:dragStart', function(e) {
    console.log('Global dragStart:', e.detail);
    // Add subtle visual feedback
    document.querySelectorAll('.drop-zone, .shopping-cart').forEach(zone => {
      zone.style.transition = 'background-color 0.2s ease';
      zone.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
    });
  });
  
  document.addEventListener('dragdrop:dragEnd', function(e) {
    console.log('Global dragEnd:', e.detail);
    // Reset visual feedback
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.style.backgroundColor = '';
    });
  });
  
  document.addEventListener('dragdrop:drop', function(e) {
    console.log('Global drop event:', e.detail);
  });
  
  console.log('DragDropJS Demo initialized successfully');
});

