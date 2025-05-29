class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.loadedLanguages = new Set();
    }
    registerLanguage(langCode, translations) {
        this.translations[langCode] = translations;
        this.loadedLanguages.add(langCode);
    }
    setLanguage(langCode) {
        if (!this.loadedLanguages.has(langCode)) {
            console.warn(`Language ${langCode} not loaded`);
            return false;
        }
        this.currentLang = langCode;
        localStorage.setItem('preferredLanguage', langCode);
        this.updateDOM();
        this.updateAnimationNames();
        return true;
    }
    get(key, args = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key;
            }
        }
        if (typeof value === 'string') {
            return this.interpolate(value, args);
        }
        return key;
    }
    interpolate(str, args) {
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return args.hasOwnProperty(key) ? args[key] : match;
        });
    }
    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const argsAttr = element.getAttribute('data-i18n-args');
            let args = {};
            if (argsAttr) {
                const argNames = argsAttr.split(',');
                argNames.forEach((argName, index) => {
                    const value = element.getAttribute(`data-${argName}`) || element[argName] || '';
                    args[argName] = value;
                });
            }
            const translation = this.get(key, args);
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.get(key);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.get(key);
        });
    }
    updateAnimationNames() {
        if (window.Config && window.Config.animationRows) {
            const animNames = this.get('animations', {});
            window.Config.animationRows.forEach((anim, index) => {
                if (animNames[index]) {
                    anim.name = animNames[index];
                }
            });
        }
    }
    init() {
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        if (this.loadedLanguages.has(savedLang)) {
            this.setLanguage(savedLang);
        }
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = this.currentLang;
            langSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
}
window.i18n = new I18n();