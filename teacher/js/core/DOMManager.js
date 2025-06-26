class DOMManager {
    static createElement(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    el.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on')) {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                el[key] = value;
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child) {
                el.appendChild(child);
            }
        });
        return el;
    }
    static addStyles(styles) {
        const styleEl = this.createElement('style', {
            textContent: styles
        });
        document.head.appendChild(styleEl);
        return styleEl;
    }
    static removeElement(el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
    static clearElement(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
    static on(el, event, handler) {
        el.addEventListener(event, handler);
        return () => el.removeEventListener(event, handler);
    }
    static show(el) {
        el.style.display = '';
        el.classList.remove('hidden');
    }
    static hide(el) {
        el.style.display = 'none';
    }
    static toggle(el, show) {
        if (show !== undefined) {
            show ? this.show(el) : this.hide(el);
        } else {
            el.style.display === 'none' ? this.show(el) : this.hide(el);
        }
    }
}