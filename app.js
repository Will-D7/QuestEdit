(function() {
    
    const config = {
        numOfSlots: 24,
        itemsPerRow: 8,
        marginBottom: 30,
        aspectWidth: 4,
        aspectHeight: 4
    };

    
    const state = {
        slots: [],
        items: [
            { id: 1, title: 'Red Block', color: 'color-1' },
            { id: 2, title: 'Yellow Block', color: 'color-2' },
            { id: 3, title: 'Teal Block', color: 'color-3' },
            { id: 4, title: 'Green Block', color: 'color-4' },
            { id: 5, title: 'Purple Block', color: 'color-5' },
            { id: 6, title: 'Orange Block', color: 'color-6' },
            { id: 7, title: 'Blue Block', color: 'color-7' },
            { id: 8, title: 'Pink Block', color: 'color-8' }
        ],
        activeItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 
        selectedElement: null,
        originalSlot: null,
        originalClickCoords: null,
        lastTouchedSlotId: null
    };

    
    const refs = {
        container: null
    };

    
    function init() {
        
        const container = document.createElement('div');
        container.className = 'dd-container';
        document.getElementById('dragDrop').appendChild(container);
        refs.container = container;

        
        createSlots();
        createItems();

        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleTouchEnd);
    }

    
    function createSlots() {
        for (let i = 0; i < config.numOfSlots; i++) {
            
            const slot = document.createElement('div');
            slot.className = 'dd-slot';
            
            
            const width = 100 / config.itemsPerRow;
            const height = (width * config.aspectHeight) / config.aspectWidth;
            
            slot.style.width = `${width}%`;
            slot.style.paddingBottom = `${height}%`;
            slot.style.marginBottom = `${config.marginBottom}px`;
            
            
            const number = document.createElement('p');
            number.className = 'dd-slot-num';
            number.textContent = i + 1;
            slot.appendChild(number);
            
            
            refs.container.appendChild(slot);
            
            
            state.slots[i] = {
                width: 0, 
                height: 0,
                x: 0,
                y: 0
            };
        }
        
        
        measureSlots();
    }
    
    
    function measureSlots() {
        const slots = document.querySelectorAll('.dd-slot');
        slots.forEach((slot, i) => {
            const rect = slot.getBoundingClientRect();
            state.slots[i] = {
                width: rect.width,
                height: rect.height,
                x: (i % config.itemsPerRow) * rect.width,
                y: Math.floor(i / config.itemsPerRow) * (rect.height + config.marginBottom)
            };
        });
    }

    
    function createItems() {
        for (let i = 0; i < config.numOfSlots; i++) {
            const itemId = state.activeItems[i] || -1;
            if (itemId === -1) continue;
            
            const item = getItemById(itemId);
            if (!item) continue;
            
            const slot = state.slots[i];
            
            
            const itemElement = document.createElement('div');
            itemElement.className = 'dd-item';
            itemElement.setAttribute('data-item-id', itemId);
            itemElement.style.width = `${slot.width}px`;
            itemElement.style.height = `${slot.height}px`;
            itemElement.style.transform = `translate3d(${slot.x}px, ${slot.y}px, 0)`;
            
            
            const inner = document.createElement('div');
            inner.className = `dd-item-inner ${item.color}`;
            
            
            const panel = document.createElement('div');
            panel.className = 'dd-item-panel';
            
            
            const title = document.createElement('h3');
            title.className = 'dd-item-title';
            title.textContent = item.title;
            
            
            panel.appendChild(title);
            inner.appendChild(panel);
            itemElement.appendChild(inner);
            refs.container.appendChild(itemElement);
            
            
            itemElement.addEventListener('mousedown', handleMouseDown);
            itemElement.addEventListener('touchstart', handleTouchStart);
        }
    }

    
    function arrangeItems() {
        state.activeItems.forEach((itemId, index) => {
            if (itemId === -1) return;
            
            const slot = state.slots[index];
            const element = document.querySelector(`[data-item-id="${itemId}"]`);
            
            if (element) {
                element.style.transform = `translate3d(${slot.x}px, ${slot.y}px, 0)`;
            }
        });
    }

    
    function handleMouseDown(event) {
        selectElement(event.currentTarget, event.pageX, event.pageY);
        event.preventDefault();
    }

    function handleTouchStart(event) {
        const touch = event.touches[0];
        selectElement(event.currentTarget, touch.pageX, touch.pageY);
        event.preventDefault();
    }

    function handleMouseMove(event) {
        if (state.selectedElement) {
            moveElement(event.pageX, event.pageY);
        }
    }

    function handleTouchMove(event) {
        if (state.selectedElement) {
            const touch = event.touches[0];
            moveElement(touch.pageX, touch.pageY);
            event.preventDefault();
        }
    }

    function handleMouseUp() {
        releaseElement();
    }

    function handleTouchEnd() {
        releaseElement();
    }

    
    function selectElement(element, pageX, pageY) {
        if (!state.selectedElement) {
            state.selectedElement = element;
            state.originalClickCoords = { x: pageX, y: pageY };
            state.originalSlot = getIndexOfItemId(parseInt(element.getAttribute('data-item-id')));
            
            element.classList.add('dd-selected');
            element.style.transition = 'none';
        }
    }

    
    function moveElement(pageX, pageY) {
        const containerRect = refs.container.getBoundingClientRect();
        const left = containerRect.left;
        const top = containerRect.top;
        
        const clickX = pageX - left;
        const clickY = pageY - top;
        const hoverSlotId = getSlotIdByCoords({ x: clickX, y: clickY });
        
        const ele = state.selectedElement;
        const itemId = parseInt(ele.getAttribute('data-item-id'));
        const index = state.originalSlot;
        const newIndex = getIndexOfItemId(itemId);
        const slot = state.slots[index];
        
        const resultX = slot.x + (pageX - state.originalClickCoords.x);
        const resultY = slot.y + (pageY - state.originalClickCoords.y);
        
        if (hoverSlotId !== undefined && state.lastTouchedSlotId !== hoverSlotId && hoverSlotId < config.numOfSlots) {
            state.lastTouchedSlotId = hoverSlotId;
            
            
            state.activeItems.splice(
                hoverSlotId, 
                0, 
                state.activeItems.splice(newIndex, 1)[0]
            );
            
            arrangeItems();
        }
        
        ele.style.transform = `translate3d(${resultX}px, ${resultY}px, 0)`;
    }

    
    function releaseElement() {
        if (!state.selectedElement) return;
        
        state.selectedElement.classList.remove('dd-selected');
        state.selectedElement.style.transition = 'all 0.3s ease';
        
        state.selectedElement = null;
        state.originalClickCoords = null;
        state.lastTouchedSlotId = null;
        
        arrangeItems();
    }

    
    function getSlotIdByCoords(coords) {
        for (let id in state.slots) {
            const slot = state.slots[id];
            
            if (
                slot.x <= coords.x && 
                coords.x <= slot.x + slot.width && 
                slot.y <= coords.y && 
                coords.y <= slot.y + slot.height
            ) {
                return parseInt(id);
            }
        }
        return undefined;
    }

    function getItemById(id) {
        return state.items.find(item => item.id === id);
    }

    function getIndexOfItemId(id) {
        return state.activeItems.indexOf(id);
    }

    
    function handleResize() {
        measureSlots();
        arrangeItems();
    }

    
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('resize', handleResize);
})();
