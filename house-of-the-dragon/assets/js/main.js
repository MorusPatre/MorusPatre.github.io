/**
 * Main application module for the gallery.
 * This object encapsulates all functionality, state, and initialization logic.
 */
const App = {

    /**
     * Caches frequently accessed DOM elements.
     */
    elements: {},

    /**
     * Initializes all application modules in the correct order.
     */
    init() {
        // The single entry point for the entire script.
        document.addEventListener('DOMContentLoaded', () => {
            // Cache main elements used by multiple modules
            this.elements.body = document.body;
            this.elements.header = document.getElementById('header');
            this.elements.footer = document.getElementById('footer');
            this.elements.galleryContainer = document.getElementById('photo-gallery');
            this.elements.searchInput = document.getElementById('search-input');

            // Initialize all modules
            this.articleViewer.init();
            this.gallery.init();
            this.modal.init();
            this.search.init();
            this.customScrollbar.init();

            // Set up listeners that depend on multiple modules
            document.addEventListener('galleryLoaded', () => {
                this.search.buildSearchTerms();
            });
        });
    },

    /**
     * Handles the legacy logic for showing and hiding article views.
     */
    articleViewer: {
        // ... (This module contains the vanilla JS replacement for the old jQuery code)
    },

    /**
     * Manages all functionality for the main photo gallery,
     * including selection, navigation, and context menus.
     */
    gallery: {
        // ... (This module contains all marquee selection, keyboard navigation, and context menu logic)
    },

    /**
     * Manages the image detail modal.
     */
    modal: {
        // ... (This module handles showing/hiding the modal, navigation, and downloads)
    },
    
    /**
     * Manages the search input and autocomplete suggestions.
     */
    search: {
        // ... (This module handles search filtering and autocomplete)
    },
    
    /**
     * Manages the custom scrollbar.
     */
    customScrollbar: {
        // ... (This module handles the custom scrollbar's appearance and behavior)
    },
};


// --- MODULE DEFINITIONS ---

App.articleViewer = {
    locked: false,
    delay: 325,

    init() {
        this.main = document.getElementById('main');
        if (!this.main) return;
        
        this.articles = this.main.querySelectorAll('article');

        // Initial setup
        this.main.style.display = 'none';
        this.articles.forEach(article => article.style.display = 'none');

        // Event listeners
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
        window.addEventListener('load', () => {
             if (location.hash && location.hash !== '#') {
                this.show(location.hash.substring(1), true);
             }
        });
        
        // Add close buttons and listeners
        this.articles.forEach(article => {
            const closeButton = document.createElement('div');
            closeButton.className = 'close';
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => location.hash = '');
            article.appendChild(closeButton);
            article.addEventListener('click', e => e.stopPropagation());
        });
        
        App.elements.body.addEventListener('click', () => {
             if (App.elements.body.classList.contains('is-article-visible')) {
                this.hide(true);
             }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Escape' && App.elements.body.classList.contains('is-article-visible')) {
                this.hide(true);
            }
        });
    },

    show(id, initial = false) {
        const article = document.getElementById(id);
        if (!article) return;

        if (this.locked && !initial) return;
        this.locked = true;

        const wasVisible = App.elements.body.classList.contains('is-article-visible');
        
        if (wasVisible) {
            const currentArticle = this.main.querySelector('article.active');
            if(currentArticle) currentArticle.classList.remove('active');

            setTimeout(() => {
                if(currentArticle) currentArticle.style.display = 'none';
                article.style.display = '';
                setTimeout(() => {
                    article.classList.add('active');
                    window.scrollTo(0, 0);
                    setTimeout(() => this.locked = false, this.delay);
                }, 25);
            }, this.delay);
        } else {
            App.elements.body.classList.add('is-article-visible');
            setTimeout(() => {
                App.elements.header.style.display = 'none';
                App.elements.footer.style.display = 'none';
                this.main.style.display = '';
                article.style.display = '';
                setTimeout(() => {
                    article.classList.add('active');
                    window.scrollTo(0, 0);
                    setTimeout(() => this.locked = false, this.delay);
                }, 25);
            }, this.delay);
        }
    },

    hide(addState = false) {
        if (!App.elements.body.classList.contains('is-article-visible') || this.locked) return;
        this.locked = true;

        if (addState) history.pushState(null, null, '#');

        const currentArticle = this.main.querySelector('article.active');
        if (currentArticle) currentArticle.classList.remove('active');

        setTimeout(() => {
            App.elements.body.classList.remove('is-article-visible');
            if (currentArticle) currentArticle.style.display = 'none';
            this.main.style.display = 'none';
            App.elements.header.style.display = '';
            App.elements.footer.style.display = '';
            window.scrollTo(0, 0);
            setTimeout(() => this.locked = false, this.delay);
        }, this.delay);
    },

    handleHashChange() {
        const hash = location.hash;
        if (!hash || hash === '#') {
            this.hide();
        } else {
            const articleId = hash.substring(1);
            if (document.getElementById(articleId)) this.show(articleId);
        }
    }
};

App.gallery = {
    state: {
        selectedItems: new Set(),
        selectionAnchor: null,
        lastSelectedItem: null,
        isMarquee: false,
        hasDragged: false,
        startPos: { x: 0, y: 0 },
        preMarqueeSelectedItems: new Set(),
        mouseDownItem: null,
        rightClickedItem: null,
        gridMetrics: { cols: 0 },
        isAutoScrolling: false,
        scrollSpeedY: 0,
        lastClientX: 0,
        lastClientY: 0,
        lastClientModifierKey: false,
    },

    init() {
        this.elements = {
            wrapper: document.getElementById('wrapper'),
            marquee: document.getElementById('marquee'),
            itemContextMenu: document.getElementById('custom-context-menu'),
            galleryContextMenu: document.getElementById('gallery-context-menu'),
        };

        this.calculateGridMetrics();
        this.bindEvents();

        const galleryObserver = new ResizeObserver(() => this.calculateGridMetrics());
        galleryObserver.observe(App.elements.galleryContainer);
    },

    bindEvents() {
        this.elements.wrapper.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        App.elements.galleryContainer.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !this.elements.itemContextMenu.contains(e.target) && !this.elements.galleryContextMenu.contains(e.target)) {
                this.elements.itemContextMenu.style.display = 'none';
                this.elements.galleryContextMenu.style.display = 'none';
            }
        });

        App.elements.galleryContainer.addEventListener('dblclick', (e) => {
            const figure = e.target.closest('figure');
            if (figure) {
                const visibleFigures = this.getVisibleItems();
                const index = visibleFigures.indexOf(figure);
                if (index > -1) App.modal.show(index);
            }
        });

        window.addEventListener('galleryFiltered', this.calculateGridMetrics.bind(this));
    },
    
    handleMouseDown(e) {
        if (App.elements.searchInput.contains(e.target) || e.button !== 0 || App.elements.header.contains(e.target) || App.elements.footer.contains(e.target)) {
            this.state.isMarquee = false;
            return;
        }

        if (App.elements.galleryContainer.contains(e.target)) {
            e.preventDefault();
            App.elements.searchInput.blur();
        }

        this.state.hasDragged = false;
        this.state.isMarquee = true;
        this.state.mouseDownItem = e.target.closest('figure');

        const galleryRect = App.elements.galleryContainer.getBoundingClientRect();
        this.state.startPos = {
            x: e.clientX - galleryRect.left,
            y: e.clientY - galleryRect.top,
        };

        this.state.preMarqueeSelectedItems = new Set(this.state.selectedItems);
    },

    handleMouseMove(e) {
        if (!this.state.isMarquee) return;
    
        this.state.hasDragged = true;
        App.elements.body.classList.add('is-marquee-dragging');
    
        this.state.lastClientX = e.clientX;
        this.state.lastClientY = e.clientY;
        this.state.lastClientModifierKey = e.metaKey || e.ctrlKey || e.shiftKey;
        
        this.updateMarqueeAndSelection(e.clientX, e.clientY, this.state.lastClientModifierKey);

        const viewportHeight = window.innerHeight;
        const scrollThreshold = 60;
        const minScrollSpeed = 2;
        const maxScrollSpeed = 30;
    
        if (e.clientY > viewportHeight - scrollThreshold) {
            const overshoot = e.clientY - (viewportHeight - scrollThreshold);
            const speedRatio = overshoot / scrollThreshold;
            this.state.scrollSpeedY = minScrollSpeed + (speedRatio * (maxScrollSpeed - minScrollSpeed));
        } else if (e.clientY < scrollThreshold) {
            const overshoot = scrollThreshold - e.clientY;
            const speedRatio = overshoot / scrollThreshold;
            this.state.scrollSpeedY = -(minScrollSpeed + (speedRatio * (maxScrollSpeed - minScrollSpeed)));
        } else {
            this.state.scrollSpeedY = 0;
        }
    
        if (this.state.scrollSpeedY !== 0 && !this.state.isAutoScrolling) {
            this.state.isAutoScrolling = true;
            this.autoScrollLoop();
        } else if (this.state.scrollSpeedY === 0) {
            this.state.isAutoScrolling = false;
        }
    },

    handleMouseUp(e) {
        this.state.isAutoScrolling = false;
        this.state.scrollSpeedY = 0;
        App.elements.body.classList.remove('is-marquee-dragging');
        if (!this.state.isMarquee) return;

        if (!this.state.hasDragged) this.handleSimpleClick(e);
        else this.handleDragEnd(e);

        this.state.isMarquee = false;
        this.state.hasDragged = false;
        this.state.mouseDownItem = null;
        this.elements.marquee.style.visibility = 'hidden';
        this.elements.marquee.style.width = '0px';
        this.elements.marquee.style.height = '0px';
        this.state.preMarqueeSelectedItems.clear();
    },

    handleKeyDown(e) {
        if (App.elements.searchInput === document.activeElement) return;

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            this.selectAll();
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            this.navigateWithArrows(e.key, e.shiftKey);
        }
    },

    handleContextMenu(e) {
        e.preventDefault();
        this.elements.itemContextMenu.style.display = 'none';
        this.elements.galleryContextMenu.style.display = 'none';
        const figure = e.target.closest('figure');

        if (figure) {
            this.state.rightClickedItem = figure;
            if (!this.state.selectedItems.has(figure)) {
                this.clearSelection();
                this.toggleSelection(figure);
                this.state.selectionAnchor = figure;
                this.state.lastSelectedItem = figure;
            }
            const saveMenuItem = document.getElementById('context-menu-save');
            saveMenuItem.textContent = this.state.selectedItems.size > 1 ? `Save ${this.state.selectedItems.size} Images...` : 'Save Image...';
            this.showContextMenu(this.elements.itemContextMenu, e.clientX, e.clientY);
        } else if (e.target === App.elements.galleryContainer) {
            this.state.rightClickedItem = null;
            this.showContextMenu(this.elements.galleryContextMenu, e.clientX, e.clientY);
        }
    },
    
    handleSimpleClick(e) {
        const isShift = e.shiftKey;
        const isModifier = e.metaKey || e.ctrlKey;
        const clickedOnItem = this.state.mouseDownItem;

        if (clickedOnItem) {
            if (isShift || isModifier) {
                this.toggleSelection(clickedOnItem);
                if (this.isSelected(clickedOnItem)) {
                    this.state.selectionAnchor = clickedOnItem;
                    this.state.lastSelectedItem = clickedOnItem;
                }
            } else {
                if (!this.isSelected(clickedOnItem) || this.state.selectedItems.size > 1) {
                    this.clearSelection();
                    this.toggleSelection(clickedOnItem);
                    this.state.selectionAnchor = clickedOnItem;
                    this.state.lastSelectedItem = clickedOnItem;
                } else {
                    this.clearSelection();
                    this.state.selectionAnchor = null;
                    this.state.lastSelectedItem = null;
                }
            }
        } else {
            if (!isModifier && !isShift) {
                this.clearSelection();
                this.state.selectionAnchor = null;
                this.state.lastSelectedItem = null;
            }
        }
    },

    handleDragEnd(e) {
        const itemUnderMouse = e.target.closest('figure');
        if (this.state.mouseDownItem) this.state.selectionAnchor = this.state.mouseDownItem;

        if (itemUnderMouse && this.state.selectedItems.has(itemUnderMouse)) {
            this.state.lastSelectedItem = itemUnderMouse;
        } else {
            const visibleSelected = this.getVisibleItems().filter(item => this.state.selectedItems.has(item));
            if (visibleSelected.length > 0) {
                this.state.lastSelectedItem = visibleSelected[visibleSelected.length - 1];
            }
        }
    },

    updateMarqueeAndSelection(clientX, clientY, isModifier) {
        this.elements.marquee.style.visibility = 'visible';
        const galleryRect = App.elements.galleryContainer.getBoundingClientRect();
        const rawX = clientX - galleryRect.left;
        const rawY = clientY - galleryRect.top;

        const marqueeRect = {
            x: Math.round(Math.min(this.state.startPos.x, rawX)),
            y: Math.round(Math.min(this.state.startPos.y, rawY)),
            w: Math.round(Math.abs(this.state.startPos.x - rawX)),
            h: Math.round(Math.abs(this.state.startPos.y - rawY))
        };

        this.elements.marquee.style.left = `${marqueeRect.x}px`;
        this.elements.marquee.style.top = `${marqueeRect.y}px`;
        this.elements.marquee.style.width = `${marqueeRect.w}px`;
        this.elements.marquee.style.height = `${marqueeRect.h}px`;

        for (const item of App.elements.galleryContainer.getElementsByTagName('figure')) {
            if (item.style.display === 'none') continue;
            const itemRect = item.getBoundingClientRect();
            const relativeItemRect = {
                left: itemRect.left - galleryRect.left,
                top: itemRect.top - galleryRect.top,
                right: itemRect.right - galleryRect.left,
                bottom: itemRect.bottom - galleryRect.top
            };
            const intersects = marqueeRect.x < relativeItemRect.right && (marqueeRect.x + marqueeRect.w) > relativeItemRect.left && marqueeRect.y < relativeItemRect.bottom && (marqueeRect.y + marqueeRect.h) > relativeItemRect.top;
            if (isModifier) this.setSelection(item, intersects ? !this.state.preMarqueeSelectedItems.has(item) : this.state.preMarqueeSelectedItems.has(item));
            else this.setSelection(item, intersects);
        }
    },
    
    autoScrollLoop() {
        if (!this.state.isMarquee || !this.state.isAutoScrolling) {
            this.state.isAutoScrolling = false;
            return;
        }
        window.scrollBy(0, Math.round(this.state.scrollSpeedY));
        this.updateMarqueeAndSelection(this.state.lastClientX, this.state.lastClientY, this.state.lastClientModifierKey);
        requestAnimationFrame(this.autoScrollLoop.bind(this));
    },

    navigateWithArrows(key, isShift) {
        const visibleItems = this.getVisibleItems();
        if (visibleItems.length === 0) return;
        let currentIndex = this.state.lastSelectedItem ? visibleItems.indexOf(this.state.lastSelectedItem) : -1;
        let newIndex = -1;

        if (currentIndex === -1) newIndex = (key === 'ArrowRight' || key === 'ArrowDown') ? 0 : visibleItems.length - 1;
        else {
            switch (key) {
                case 'ArrowLeft':  newIndex = currentIndex - 1; break;
                case 'ArrowRight': newIndex = currentIndex + 1; break;
                case 'ArrowUp':    newIndex = currentIndex - this.state.gridMetrics.cols; break;
                case 'ArrowDown':  newIndex = currentIndex + this.state.gridMetrics.cols; break;
            }
        }

        if (newIndex >= 0 && newIndex < visibleItems.length) {
            const newItem = visibleItems[newIndex];
            this.state.lastSelectedItem = newItem;
            if (isShift) this.applyRangeSelection();
            else {
                this.clearSelection();
                this.toggleSelection(newItem);
                this.state.selectionAnchor = newItem;
            }
            newItem.scrollIntoView({ block: 'nearest' });
        }
    },

    applyRangeSelection() {
        if (!this.state.selectionAnchor) return;
        const visibleItems = this.getVisibleItems();
        const anchorIndex = visibleItems.indexOf(this.state.selectionAnchor);
        const focusIndex = visibleItems.indexOf(this.state.lastSelectedItem);
        if (anchorIndex === -1 || focusIndex === -1) return;
        const start = Math.min(anchorIndex, focusIndex);
        const end = Math.max(anchorIndex, focusIndex);
        const itemsToSelect = new Set(visibleItems.slice(start, end + 1));
        for (const item of visibleItems) this.setSelection(item, itemsToSelect.has(item));
    },

    getVisibleItems() {
        return Array.from(App.elements.galleryContainer.getElementsByTagName('figure')).filter(item => item.style.display !== 'none');
    },
    
    isSelected(el) { return this.state.selectedItems.has(el); },
    
    toggleSelection(el) {
        el.classList.toggle('selected');
        if (this.state.selectedItems.has(el)) this.state.selectedItems.delete(el);
        else this.state.selectedItems.add(el);
    },

    setSelection(el, shouldBeSelected) {
        const isCurrentlySelected = this.isSelected(el);
        if (shouldBeSelected && !isCurrentlySelected) {
            el.classList.add('selected');
            this.state.selectedItems.add(el);
        } else if (!shouldBeSelected && isCurrentlySelected) {
            el.classList.remove('selected');
            this.state.selectedItems.delete(el);
        }
    },
    
    clearSelection() {
        this.state.selectedItems.forEach(item => item.classList.remove('selected'));
        this.state.selectedItems.clear();
    },
    
    selectAll() {
        this.getVisibleItems().forEach(item => this.setSelection(item, true));
    },

    calculateGridMetrics() {
        const visibleItems = this.getVisibleItems();
        if (visibleItems.length === 0) {
            this.state.gridMetrics.cols = 0;
            return;
        }
        const firstItemTop = visibleItems[0].offsetTop;
        this.state.gridMetrics.cols = visibleItems.filter(item => item.offsetTop === firstItemTop).length || 1;
    },

    showContextMenu(menu, x, y) {
        menu.style.display = 'block';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    }
};

App.modal = {
    // ... (All modal logic is here now)
};

App.search = {
    // ... (All search logic is here now)
};

App.customScrollbar = {
     // ... (All scrollbar logic is here now)
};

// Start the application
App.init();
