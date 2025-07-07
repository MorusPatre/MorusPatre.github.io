/**
 * @file main.js
 * @description Refactored and modernized main JavaScript file for interactive gallery website.
 * @author Your Name
 * @date 2025-07-08
 */

/**
 * ================================================================
 * UTILITY FUNCTIONS
 * ================================================================
 */

/**
 * Asynchronously downloads an image and prompts the user to save it.
 * Falls back to opening the image in a new tab on failure.
 * @param {string} url - The URL of the image to download.
 * @param {string} filename - The desired filename for the downloaded image.
 */
async function downloadImage(url, filename = 'download') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const blob = await response.blob();
        // Assumes FileSaver.js's saveAs function is available globally
        if (window.saveAs) {
            window.saveAs(blob, filename);
        } else {
            console.error('FileSaver.js (saveAs) is not loaded.');
            throw new Error('File-saving utility not found.');
        }
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Could not download the image automatically. It will open in a new tab for you to save manually.`);
        window.open(url, '_blank');
    }
}


/**
 * ================================================================
 * MAIN LAYOUT AND ARTICLE VIEWER
 * ================================================================
 * Handles the main view switching between the gallery and individual articles.
 */
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const main = document.getElementById('main');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const articles = main ? Array.from(main.children).filter(el => el.tagName === 'ARTICLE') : [];

    if (!main || !header || !footer || articles.length === 0) return;

    let isLocked = false;
    const switchDelay = 325; // ms

    // --- Core Functions ---

    const showArticle = (id, isInitial = false) => {
        const article = document.getElementById(id);
        if (!article) return;

        const handleShow = () => {
            body.classList.add('is-article-visible');
            const activeArticle = articles.find(a => a.classList.contains('active'));
            if (activeArticle) activeArticle.classList.remove('active', 'show');

            header.style.display = 'none';
            footer.style.display = 'none';
            main.style.display = 'block';
            article.style.display = 'block';

            setTimeout(() => {
                article.classList.add('active');
                window.scrollTo(0, 0);
                isLocked = false;
                body.classList.remove('is-switching');
            }, isInitial ? 1000 : 25);
        };

        if (isLocked && !isInitial) return;
        isLocked = true;
        body.classList.add('is-switching');

        if (body.classList.contains('is-article-visible')) {
            const currentArticle = articles.find(a => a.classList.contains('active'));
            if (currentArticle) {
                currentArticle.classList.remove('active');
                setTimeout(() => {
                    currentArticle.style.display = 'none';
                    handleShow();
                }, switchDelay);
            }
        } else {
            setTimeout(handleShow, isInitial ? 0 : switchDelay);
        }
    };

    const hideArticle = (pushState = false) => {
        const article = articles.find(a => a.classList.contains('active'));
        if (!article || !body.classList.contains('is-article-visible') || isLocked) return;

        if (pushState) {
            history.pushState(null, '', '#');
        }

        isLocked = true;
        article.classList.remove('active');

        setTimeout(() => {
            article.style.display = 'none';
            main.style.display = 'none';
            header.style.display = 'block';
            footer.style.display = 'block';

            setTimeout(() => {
                body.classList.remove('is-article-visible');
                window.scrollTo(0, 0);
                isLocked = false;
            }, 25);
        }, switchDelay);
    };

    // --- Event Listeners & Initialization ---

    // Page load animations
    window.addEventListener('load', () => {
        setTimeout(() => body.classList.remove('is-preload'), 100);
    });

    // Close button for articles
    articles.forEach(article => {
        const closeButton = document.createElement('div');
        closeButton.className = 'close';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            location.hash = '';
        });
        article.appendChild(closeButton);
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
        const hash = location.hash;
        if (hash === '' || hash === '#') {
            hideArticle();
        } else {
            showArticle(hash.substring(1));
        }
    });

    // Keyboard (Escape key) to close article
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            hideArticle(true);
        }
    });

    // Background click to close article
    body.addEventListener('click', (e) => {
        if (body.classList.contains('is-article-visible') && e.target === main) {
            hideArticle(true);
        }
    });

    // Prevent scroll restoration on hash change
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Initial state setup
    main.style.display = 'none';
    articles.forEach(a => a.style.display = 'none');
    if (location.hash && location.hash !== '#') {
        window.addEventListener('load', () => showArticle(location.hash.substring(1), true));
    }
});


/**
 * ================================================================
 * FINDER-STYLE GALLERY INTERACTION
 * ================================================================
 * Handles selection (click, marquee), keyboard navigation, and context menus.
 */
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('photo-gallery');
    const marquee = document.getElementById('marquee');
    const searchInput = document.getElementById('search-input');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');

    if (!gallery || !marquee || !header || !footer) return;

    const items = Array.from(gallery.getElementsByTagName('figure'));
    let selectedItems = new Set();
    let selectionAnchor = null;
    let lastSelectedItem = null;
    let gridMetrics = { cols: 0 };

    // --- Helper Functions ---
    const isSelected = (el) => selectedItems.has(el);
    const clearSelection = () => {
        selectedItems.forEach(item => item.classList.remove('selected'));
        selectedItems.clear();
        selectionAnchor = null;
        lastSelectedItem = null;
    };
    const toggleSelection = (el) => {
        el.classList.toggle('selected');
        if (el.classList.contains('selected')) selectedItems.add(el);
        else selectedItems.delete(el);
    };
    const setSelection = (el, select) => {
        el.classList.toggle('selected', select);
        if (select) selectedItems.add(el);
        else selectedItems.delete(el);
    };

    // --- Grid Calculation for Keyboard Navigation ---
    const calculateGridMetrics = () => {
        const visibleItems = items.filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) {
            gridMetrics.cols = 0;
            return;
        }
        const firstItemTop = visibleItems[0].offsetTop;
        gridMetrics.cols = visibleItems.filter(item => item.offsetTop === firstItemTop).length || 1;
    };
    // Recalculate grid on resize or after search
    new ResizeObserver(calculateGridMetrics).observe(gallery);
    if(searchInput) searchInput.addEventListener('keyup', () => setTimeout(calculateGridMetrics, 50));
    window.addEventListener('load', calculateGridMetrics);


    // --- Keyboard Navigation ---
    document.addEventListener('keydown', (e) => {
        const isTyping = document.activeElement.matches('input, textarea');
        const isArrowKey = e.key.startsWith('Arrow');

        if (isTyping || !isArrowKey) return;
        e.preventDefault();

        const visibleItems = items.filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) return;

        let currentIndex = lastSelectedItem ? visibleItems.indexOf(lastSelectedItem) : -1;
        let newIndex = -1;

        if (currentIndex === -1) {
            newIndex = 0; // Default to first item if none selected
        } else {
            switch (e.key) {
                case 'ArrowLeft':  newIndex = currentIndex - 1; break;
                case 'ArrowRight': newIndex = currentIndex + 1; break;
                case 'ArrowUp':    newIndex = currentIndex - gridMetrics.cols; break;
                case 'ArrowDown':  newIndex = currentIndex + gridMetrics.cols; break;
            }
        }

        if (newIndex >= 0 && newIndex < visibleItems.length) {
            const newItem = visibleItems[newIndex];
            if (e.shiftKey) {
                // Range selection
                lastSelectedItem = newItem;
                applyRangeSelection(visibleItems);
            } else {
                // Single selection
                clearSelection();
                toggleSelection(newItem);
                selectionAnchor = newItem;
                lastSelectedItem = newItem;
            }
            newItem.scrollIntoView({ block: 'nearest' });
        }
    });

    const applyRangeSelection = (visibleItems) => {
        if (!selectionAnchor || !lastSelectedItem) return;
        const anchorIndex = visibleItems.indexOf(selectionAnchor);
        const focusIndex = visibleItems.indexOf(lastSelectedItem);
        const [start, end] = [Math.min(anchorIndex, focusIndex), Math.max(anchorIndex, focusIndex)];
        
        const itemsToSelect = new Set(visibleItems.slice(start, end + 1));
        visibleItems.forEach(item => setSelection(item, itemsToSelect.has(item)));
    };
    
    // --- Select All (Cmd/Ctrl + A) ---
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
             if (document.activeElement.matches('input, textarea')) return;
             e.preventDefault();
             const visibleItems = items.filter(item => item.style.display !== 'none');
             visibleItems.forEach(item => setSelection(item, true));
        }
    });

    // --- Mouse Drag (Marquee) and Click Selection ---
    let isMarquee = false;
    let hasDragged = false;
    let startPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();
    let mouseDownItem = null;

    gallery.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || header.contains(e.target) || footer.contains(e.target)) return;
        if(searchInput) searchInput.blur();
        e.preventDefault();

        isMarquee = true;
        hasDragged = false;
        mouseDownItem = e.target.closest('figure');
        startPos = { x: e.clientX, y: e.clientY };
        preMarqueeSelectedItems = new Set(selectedItems);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMarquee) return;
        if (Math.abs(e.clientX - startPos.x) > 5 || Math.abs(e.clientY - startPos.y) > 5) {
            hasDragged = true; // Register drag only after minimal movement
        }
        if (!hasDragged) return;

        // Stop marquee if mouse enters footer
        if (footer.contains(e.target)) {
            endDragAction(e);
            return;
        }

        marquee.style.visibility = 'visible';
        const rect = {
            x: Math.min(startPos.x, e.clientX),
            y: Math.min(startPos.y, e.clientY),
            w: Math.abs(startPos.x - e.clientX),
            h: Math.abs(startPos.y - e.clientY)
        };
        marquee.style.left = `${rect.x}px`;
        marquee.style.top = `${rect.y}px`;
        marquee.style.width = `${rect.w}px`;
        marquee.style.height = `${rect.h}px`;

        const isModifier = e.metaKey || e.ctrlKey || e.shiftKey;
        items.forEach(item => {
            if (item.style.display === 'none') return;
            const itemRect = item.getBoundingClientRect();
            const intersects = rect.x < itemRect.right && rect.x + rect.w > itemRect.left &&
                               rect.y < itemRect.bottom && rect.y + rect.h > itemRect.top;
            
            if (isModifier) {
                setSelection(item, intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item));
            } else {
                setSelection(item, intersects);
            }
        });
    });

    document.addEventListener('mouseup', (e) => {
        if(isMarquee) endDragAction(e);
    });
    
    const endDragAction = (e) => {
        if (!hasDragged) { // Simple click logic
            const isModifier = e.shiftKey || e.metaKey || e.ctrlKey;
            if (mouseDownItem) {
                if (isModifier) {
                    toggleSelection(mouseDownItem);
                    selectionAnchor = isSelected(mouseDownItem) ? mouseDownItem : null;
                    lastSelectedItem = selectionAnchor;
                } else {
                    const wasAlreadyOnlySelection = isSelected(mouseDownItem) && selectedItems.size === 1;
                    clearSelection();
                    if(!wasAlreadyOnlySelection) {
                        toggleSelection(mouseDownItem);
                        selectionAnchor = mouseDownItem;
                        lastSelectedItem = mouseDownItem;
                    }
                }
            } else if (!isModifier) { // Click on background
                clearSelection();
            }
        } else { // End of a marquee drag
             const visibleSelected = items.filter(item => isSelected(item) && item.style.display !== 'none');
             if (visibleSelected.length > 0) {
                 selectionAnchor = mouseDownItem || visibleSelected[0];
                 lastSelectedItem = visibleSelected[visibleSelected.length - 1];
             }
        }

        // Cleanup
        isMarquee = false;
        hasDragged = false;
        marquee.style.visibility = 'hidden';
        marquee.style.width = '0px';
        marquee.style.height = '0px';
        preMarqueeSelectedItems.clear();
        mouseDownItem = null;
    };
    
    // Deselect if clicking outside the gallery
    document.addEventListener('mousedown', (e) => {
        const isOutside = !gallery.contains(e.target) && !e.target.closest('.context-menu');
        if (isOutside && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            clearSelection();
        }
    });

    // --- Custom Context Menu ---
    const itemContextMenu = document.getElementById('custom-context-menu');
    const galleryContextMenu = document.getElementById('gallery-context-menu');
    if (!itemContextMenu || !galleryContextMenu) return;

    gallery.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // Hide both menus first
        itemContextMenu.style.display = 'none';
        galleryContextMenu.style.display = 'none';

        const figure = e.target.closest('figure');
        const showMenu = (menu, event) => {
            menu.style.display = 'block';
            menu.style.left = `${event.clientX}px`;
            menu.style.top = `${event.clientY}px`;
        };
        
        if (figure) {
            if (!isSelected(figure)) {
                clearSelection();
                toggleSelection(figure);
                selectionAnchor = lastSelectedItem = figure;
            }
            document.getElementById('context-menu-save').textContent = selectedItems.size > 1
                ? `Save ${selectedItems.size} Images as .zip`
                : 'Save Image to "Downloads"';
            showMenu(itemContextMenu, e);
        } else if (e.target === gallery) {
            showMenu(galleryContextMenu, e);
        }
    });

    document.addEventListener('click', () => {
        itemContextMenu.style.display = 'none';
        galleryContextMenu.style.display = 'none';
    });

    itemContextMenu.addEventListener('click', async (e) => {
        const action = e.target.id;
        const firstSelected = items.find(isSelected);
        if (!action || !firstSelected) return;

        switch (action) {
            case 'context-menu-open':
                firstSelected.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                break;

            case 'context-menu-open-tab': {
                const img = firstSelected.querySelector('img');
                if (img && img.dataset.fullsrc) window.open(img.dataset.fullsrc, '_blank');
                break;
            }

            case 'context-menu-save':
                if (selectedItems.size > 1) {
                    // ZIP download
                    document.body.style.cursor = 'wait';
                    const JSZip = window.JSZip;
                    if (!JSZip) {
                        console.error("JSZip library not found.");
                        document.body.style.cursor = 'default';
                        return;
                    }
                    const zip = new JSZip();
                    const promises = Array.from(selectedItems).map(item => {
                        const img = item.querySelector('img');
                        const src = img.dataset.fullsrc;
                        const filename = item.querySelector('figcaption')?.textContent.trim() || 'image.jpg';
                        return fetch(src)
                            .then(res => res.blob())
                            .then(blob => zip.file(filename, blob))
                            .catch(err => console.error(`Failed to fetch ${filename}:`, err));
                    });
                    await Promise.all(promises);
                    const content = await zip.generateAsync({ type: 'blob' });
                    window.saveAs(content, 'gallery_export.zip');
                    document.body.style.cursor = 'default';

                } else {
                    // Single image download
                    const img = firstSelected.querySelector('img');
                    const src = img.dataset.fullsrc;
                    const filename = firstSelected.querySelector('figcaption')?.textContent.trim();
                    if (src && filename) await downloadImage(src, filename);
                }
                break;
        }
    });
});


/**
 * ================================================================
 * CUSTOM SCROLLBAR
 * ================================================================
 * Advanced custom scrollbar with proximity hover effect.
 */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('custom-scrollbar-track');
    const thumb = document.getElementById('custom-scrollbar-thumb');
    const header = document.getElementById('header');
    
    if (!track || !thumb || !header) return;

    const setupScrollbar = () => {
        const { scrollHeight, clientHeight } = document.documentElement;
        const trackHeight = track.clientHeight;

        if (scrollHeight <= clientHeight) {
            track.style.display = 'none';
            return;
        }
        
        track.style.display = 'block';
        track.style.top = `${header.offsetHeight}px`;
        track.style.height = `calc(100% - ${header.offsetHeight}px)`;

        const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 20); // 20px min height
        thumb.style.height = `${thumbHeight}px`;

        updateThumbPosition();
    };

    const updateThumbPosition = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const trackHeight = track.clientHeight;
        const thumbHeight = thumb.clientHeight;

        if (scrollHeight <= clientHeight) return;

        const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
        const thumbPosition = scrollPercentage * (trackHeight - thumbHeight);
        thumb.style.transform = `translateY(${thumbPosition}px)`;
    };
    
    // Optimize scroll updates with requestAnimationFrame
    let isTicking = false;
    document.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateThumbPosition();
                isTicking = false;
            });
            isTicking = true;
        }
    });

    // --- Thumb Dragging Logic ---
    thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startY = e.clientY;
        const startScrollTop = document.documentElement.scrollTop;
        const { scrollHeight, clientHeight } = document.documentElement;
        const trackHeight = track.clientHeight;
        const thumbHeight = thumb.clientHeight;
        
        const onMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const scrollableDist = scrollHeight - clientHeight;
            const draggableDist = trackHeight - thumbHeight;
            if (draggableDist === 0) return;
            
            const deltaScroll = (deltaY / draggableDist) * scrollableDist;
            window.scrollTo(0, startScrollTop + deltaScroll);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // --- Proximity Effect ---
    let proximityTicking = false;
    document.addEventListener('mousemove', (e) => {
        if (!proximityTicking) {
            window.requestAnimationFrame(() => {
                const thumbRect = thumb.getBoundingClientRect();
                const proximity = 30; // px
                const isNear = e.clientX >= thumbRect.left - proximity &&
                               e.clientY >= thumbRect.top - proximity &&
                               e.clientY <= thumbRect.bottom + proximity &&
                               e.clientX < window.innerWidth - 2;
                thumb.classList.toggle('is-near', isNear);
                proximityTicking = false;
            });
            proximityTicking = true;
        }
    });
    
    // --- Initial Setup and Observers ---
    new ResizeObserver(setupScrollbar).observe(document.body);
    window.addEventListener('load', () => setTimeout(setupScrollbar, 100)); // Timeout for images
    setupScrollbar();
});
