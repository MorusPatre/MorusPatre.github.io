/**
 * @file main.js
 * @description Core JavaScript functionality for the interactive photo gallery.
 * This script handles legacy browser fixes, main content navigation (show/hide articles),
 * advanced gallery interactions (marquee selection, keyboard navigation, context menus),
 * and custom scrollbar behavior.
 *
 * @author [Your Name/Team]
 * @version 1.0.0
 */

// ===================================================================================
//
// 1. GLOBAL HELPER FUNCTIONS
//
// ===================================================================================

/**
 * Asynchronously downloads an image from a given URL and saves it with a specified filename.
 * Provides a fallback to open the image in a new tab if the download fails.
 * @param {string} url - The URL of the image to download.
 * @param {string} [filename='download'] - The desired filename for the saved image.
 */
async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const blob = await response.blob();
        // The saveAs function is expected to be available globally from FileSaver.js
        saveAs(blob, filename || 'download');
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Could not download the image. It will open in a new tab for you to save manually.`);
        window.open(url, '_blank');
    }
}


// ===================================================================================
//
// 2. INITIAL PAGE SETUP & LEGACY SUPPORT (jQuery)
//
// This section handles the initial setup of the page, including animations,
// breakpoint definitions, and fixes for older browsers like Internet Explorer.
// It uses jQuery for DOM manipulation and event handling.
//
// ===================================================================================

(function($) {

    // --- Cache jQuery Objects ---
    const $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $header = $('#header'),
        $footer = $('#footer'),
        $main = $('#main'),
        $main_articles = $main.children('article');

    // --- Breakpoints ---
    // Defines responsive breakpoints for the layout.
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px']
    });

    // --- Initial Animations ---
    // Removes the 'is-preload' class to trigger CSS animations after page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // --- IE Flexbox Min-Height Fix ---
    // Addresses a common flexbox bug in Internet Explorer where min-height is not respected.
    if (browser.name == 'ie') {
        let flexboxFixTimeoutId;
        $window.on('resize.flexbox-fix', function() {
            clearTimeout(flexboxFixTimeoutId);
            flexboxFixTimeoutId = setTimeout(function() {
                if ($wrapper.prop('scrollHeight') > $window.height()) {
                    $wrapper.css('height', 'auto');
                } else {
                    $wrapper.css('height', '100vh');
                }
            }, 250);
        }).triggerHandler('resize.flexbox-fix');
    }

    // --- Main Article Navigation Logic ---
    // Manages the visibility and transitions of single-page articles (e.g., about, contact).
    (function() {
        let delay = 325;
        let locked = false;

        // --- Show Article Method ---
        $main._show = function(id, initial) {
            const $article = $main_articles.filter('#' + id);
            if ($article.length === 0) return;

            // Handle immediate show without animations (if locked or initial load)
            if (locked || (typeof initial !== 'undefined' && initial === true)) {
                $body.addClass('is-switching is-article-visible');
                $main_articles.removeClass('active');
                $header.hide();
                $footer.hide();
                $main.show();
                $article.show().addClass('active');
                locked = false;
                setTimeout(() => $body.removeClass('is-switching'), (initial ? 1000 : 0));
                return;
            }

            locked = true;

            // Handle transitions between articles or showing a new one
            if ($body.hasClass('is-article-visible')) {
                const $currentArticle = $main_articles.filter('.active');
                $currentArticle.removeClass('active');

                setTimeout(function() {
                    $currentArticle.hide();
                    $article.show();
                    setTimeout(function() {
                        $article.addClass('active');
                        $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                        setTimeout(() => locked = false, delay);
                    }, 25);
                }, delay);
            } else {
                $body.addClass('is-article-visible');
                setTimeout(function() {
                    $header.hide();
                    $footer.hide();
                    $main.show();
                    $article.show();
                    setTimeout(function() {
                        $article.addClass('active');
                        $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                        setTimeout(() => locked = false, delay);
                    }, 25);
                }, delay);
            }
        };

        // --- Hide Article Method ---
        $main._hide = function(addState) {
            const $article = $main_articles.filter('.active');
            if (!$body.hasClass('is-article-visible')) return;
            if (addState) history.pushState(null, null, '#');

            // Handle immediate hide
            if (locked) {
                $body.addClass('is-switching').removeClass('is-article-visible');
                $article.removeClass('active').hide();
                $main.hide();
                $footer.show();
                $header.show();
                $body.removeClass('is-switching');
                $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                locked = false;
                return;
            }

            locked = true;
            $article.removeClass('active');
            setTimeout(function() {
                $article.hide();
                $main.hide();
                $footer.show();
                $header.show();
                setTimeout(function() {
                    $body.removeClass('is-article-visible');
                    $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                    setTimeout(() => locked = false, delay);
                }, 25);
            }, delay);
        };

        // --- Article Initialization & Event Listeners ---
        $main_articles.each(function() {
            const $this = $(this);
            // Append close button
            $('<div class="close">Close</div>').appendTo($this).on('click', () => location.hash = '');
            // Prevent clicks inside from closing the article
            $this.on('click', event => event.stopPropagation());
        });

        // Close article on body click or Escape key press
        $body.on('click', () => { if ($body.hasClass('is-article-visible')) $main._hide(true); });
        $window.on('keyup', event => { if (event.keyCode === 27 && $body.hasClass('is-article-visible')) $main._hide(true); });

        // Handle URL hash changes to show/hide articles
        $window.on('hashchange', function(event) {
            if (location.hash === '' || location.hash === '#') {
                event.preventDefault();
                event.stopPropagation();
                $main._hide();
            } else if ($main_articles.filter(location.hash).length > 0) {
                event.preventDefault();
                event.stopPropagation();
                $main._show(location.hash.substr(1));
            }
        });

        // --- Scroll Restoration ---
        // Prevents page from jumping to top on hashchange.
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        } else {
            let oldScrollPos = 0, scrollPos = 0, $htmlbody = $('html,body');
            $window.on('scroll', () => { oldScrollPos = scrollPos; scrollPos = $htmlbody.scrollTop(); });
            $window.on('hashchange', () => $window.scrollTop(oldScrollPos));
        }

        // --- Final Initialization ---
        $main.hide();
        $main_articles.hide();
        if (location.hash !== '' && location.hash !== '#') {
            $window.on('load', () => $main._show(location.hash.substr(1), true));
        }
    })();

})(jQuery);


// ===================================================================================
//
// 3. CORE GALLERY & INTERACTIVITY LOGIC (Vanilla JS)
//
// This is the main part of the script, handling all interactions within the
// photo gallery. It is written in modern, vanilla JavaScript.
//
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Caching ---
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    const searchInput = document.getElementById('search-input');
    const marquee = document.getElementById('marquee');
    const items = gallery.getElementsByTagName('figure'); // Live HTMLCollection

    if (!gallery || !wrapper) return;

    // --- State Variables ---
    let selectedItems = new Set();
    let isMarqueeActive = false;
    let hasDragged = false;
    let marqueeStartPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();
    let mouseDownItem = null;

    // --- Helper Functions for Selection ---
    const isSelected = (el) => selectedItems.has(el);
    const clearSelection = () => {
        selectedItems.forEach(item => item.classList.remove('selected'));
        selectedItems.clear();
    };
    const setSelection = (el, shouldBeSelected) => {
        if (shouldBeSelected && !isSelected(el)) {
            selectedItems.add(el);
            el.classList.add('selected');
        } else if (!shouldBeSelected && isSelected(el)) {
            selectedItems.delete(el);
            el.classList.remove('selected');
        }
    };
    const toggleSelection = (el) => {
        setSelection(el, !isSelected(el));
    };


    // -----------------------------------------------------------------------------
    // 3.1: FINDER-STYLE KEYBOARD NAVIGATION
    // -----------------------------------------------------------------------------
    (function() {
        let selectionAnchor = null;
        let lastSelectedItem = null;
        let gridMetrics = { cols: 0 };

        function getVisibleItems() {
            return Array.from(items).filter(item => item.style.display !== 'none');
        }

        function calculateGridMetrics() {
            const visibleItems = getVisibleItems();
            if (visibleItems.length === 0) {
                gridMetrics.cols = 0;
                return;
            }
            const firstItemTop = visibleItems[0].offsetTop;
            let cols = visibleItems.filter(item => item.offsetTop === firstItemTop).length;
            gridMetrics.cols = cols > 0 ? cols : 1;
        }

        function applyRangeSelection() {
            if (!selectionAnchor || !lastSelectedItem) return;
            const visibleItems = getVisibleItems();
            const anchorIndex = visibleItems.indexOf(selectionAnchor);
            const focusIndex = visibleItems.indexOf(lastSelectedItem);
            if (anchorIndex === -1 || focusIndex === -1) return;

            const [start, end] = [Math.min(anchorIndex, focusIndex), Math.max(anchorIndex, focusIndex)];
            const itemsToSelect = new Set(visibleItems.slice(start, end + 1));

            visibleItems.forEach(item => setSelection(item, itemsToSelect.has(item)));
        }

        document.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

            e.preventDefault();
            const visibleItems = getVisibleItems();
            if (visibleItems.length === 0) return;

            let currentIndex = lastSelectedItem ? visibleItems.indexOf(lastSelectedItem) : -1;
            let newIndex = -1;

            if (currentIndex === -1) {
                newIndex = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 0 : visibleItems.length - 1;
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
                lastSelectedItem = newItem; // Always update focus

                if (e.shiftKey) {
                    applyRangeSelection();
                } else {
                    clearSelection();
                    toggleSelection(newItem);
                    selectionAnchor = newItem; // New anchor for future shift-clicks
                }
                newItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
        });

        // Observe grid changes to recalculate column count
        calculateGridMetrics();
        new ResizeObserver(calculateGridMetrics).observe(gallery);
        if (searchInput) {
            searchInput.addEventListener('keyup', () => setTimeout(calculateGridMetrics, 50));
        }

        // Expose anchor-setting to mouse events
        window.setNavigationAnchor = (item) => { selectionAnchor = item; };
        window.setLastSelectedItem = (item) => { lastSelectedItem = item; };
    })();


    // -----------------------------------------------------------------------------
    // 3.2: MOUSE-BASED SELECTION (CLICK & MARQUEE)
    // -----------------------------------------------------------------------------

    function startMarquee(e) {
        if (e.target === searchInput || e.button !== 0 || header.contains(e.target) || footer.contains(e.target)) {
            isMarqueeActive = false;
            return;
        }

        if (gallery.contains(e.target)) {
            e.preventDefault();
            if (searchInput) searchInput.blur();
        }

        isMarqueeActive = true;
        hasDragged = false;
        mouseDownItem = e.target.closest('figure');

        const galleryRect = gallery.getBoundingClientRect();
        marqueeStartPos = {
            x: e.clientX - galleryRect.left,
            y: e.clientY - galleryRect.top,
        };

        preMarqueeSelectedItems = new Set(selectedItems);
    }

    function moveMarquee(e) {
        if (!isMarqueeActive) return;

        if (footer.contains(e.target)) {
            endMarquee();
            return;
        }

        e.preventDefault();
        hasDragged = true;
        marquee.style.visibility = 'visible';

        const galleryRect = gallery.getBoundingClientRect();
        let currentX = Math.max(0, Math.min(e.clientX - galleryRect.left, galleryRect.width));
        let currentY = Math.max(0, Math.min(e.clientY - galleryRect.top, galleryRect.height));

        const marqueeRect = {
            x: Math.min(marqueeStartPos.x, currentX),
            y: Math.min(marqueeStartPos.y, currentY),
            w: Math.abs(marqueeStartPos.x - currentX),
            h: Math.abs(marqueeStartPos.y - currentY)
        };

        Object.assign(marquee.style, {
            left: `${marqueeRect.x}px`,
            top: `${marqueeRect.y}px`,
            width: `${marqueeRect.w}px`,
            height: `${marqueeRect.h}px`,
        });

        const isModifier = e.metaKey || e.ctrlKey || e.shiftKey;

        for (const item of items) {
            if (item.style.display === 'none') continue;
            const itemRect = item.getBoundingClientRect();
            const relativeItemRect = {
                left: itemRect.left - galleryRect.left, top: itemRect.top - galleryRect.top,
                right: itemRect.right - galleryRect.left, bottom: itemRect.bottom - galleryRect.top
            };

            const intersects = (marqueeRect.x < relativeItemRect.right && marqueeRect.x + marqueeRect.w > relativeItemRect.left &&
                                marqueeRect.y < relativeItemRect.bottom && marqueeRect.y + marqueeRect.h > relativeItemRect.top);

            if (isModifier) {
                setSelection(item, intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item));
            } else {
                setSelection(item, intersects);
            }
        }
    }

    function endMarquee(e) {
        if (!isMarqueeActive) return;

        if (!hasDragged) { // Handle Click
            const isModifier = e.shiftKey || e.metaKey || e.ctrlKey;
            if (mouseDownItem) {
                if (isModifier) {
                    toggleSelection(mouseDownItem);
                    if (isSelected(mouseDownItem)) {
                        window.setNavigationAnchor(mouseDownItem);
                        window.setLastSelectedItem(mouseDownItem);
                    }
                } else {
                    if (!isSelected(mouseDownItem) || selectedItems.size > 1) {
                        clearSelection();
                        toggleSelection(mouseDownItem);
                        window.setNavigationAnchor(mouseDownItem);
                        window.setLastSelectedItem(mouseDownItem);
                    } else {
                        clearSelection();
                        window.setNavigationAnchor(null);
                        window.setLastSelectedItem(null);
                    }
                }
            } else { // Click on background
                if (!isModifier) {
                    clearSelection();
                    window.setNavigationAnchor(null);
                    window.setLastSelectedItem(null);
                }
            }
        } else { // Handle Drag End
            if (mouseDownItem) {
                window.setNavigationAnchor(mouseDownItem);
            }
            const itemUnderMouse = e.target.closest('figure');
            if (itemUnderMouse && selectedItems.has(itemUnderMouse)) {
                window.setLastSelectedItem(itemUnderMouse);
            } else {
                const visibleSelected = Array.from(items).filter(item => item.style.display !== 'none' && selectedItems.has(item));
                if (visibleSelected.length > 0) {
                    window.setLastSelectedItem(visibleSelected[visibleSelected.length - 1]);
                }
            }
        }

        // Cleanup
        isMarqueeActive = false;
        hasDragged = false;
        mouseDownItem = null;
        Object.assign(marquee.style, { visibility: 'hidden', width: '0px', height: '0px' });
        preMarqueeSelectedItems.clear();
    }

    wrapper.addEventListener('mousedown', startMarquee);
    document.addEventListener('mousemove', moveMarquee);
    document.addEventListener('mouseup', endMarquee);


    // -----------------------------------------------------------------------------
    // 3.3: GLOBAL EVENT LISTENERS (SELECT-ALL, CONTEXT MENU)
    // -----------------------------------------------------------------------------

    // --- Select All (Cmd/Ctrl + A) ---
    document.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
            e.preventDefault();
            Array.from(items).filter(item => item.style.display !== 'none').forEach(item => setSelection(item, true));
        }
    });

    // --- Context Menu Logic ---
    (function() {
        const itemMenu = document.getElementById('custom-context-menu');
        const galleryMenu = document.getElementById('gallery-context-menu');
        let rightClickedItem = null;

        // Hide menus on left-click anywhere
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target)) {
                itemMenu.style.display = 'none';
                galleryMenu.style.display = 'none';
            }
            // Clear selection if clicking outside the main content area
            if (!wrapper.contains(e.target) && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target) && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
                clearSelection();
            }
        });

        // Show appropriate context menu on right-click
        gallery.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            itemMenu.style.display = 'none';
            galleryMenu.style.display = 'none';
            const figure = e.target.closest('figure');

            if (figure) {
                rightClickedItem = figure;
                if (!isSelected(figure)) {
                    clearSelection();
                    toggleSelection(figure);
                    window.setNavigationAnchor(figure);
                    window.setLastSelectedItem(figure);
                }
                const saveMenuItem = document.getElementById('context-menu-save');
                saveMenuItem.textContent = selectedItems.size > 1 ? `Save ${selectedItems.size} Images as .zip` : 'Save Image to "Downloads"';
                
                Object.assign(itemMenu.style, { display: 'block', left: `${e.clientX}px`, top: `${e.clientY}px` });
            } else if (e.target === gallery) {
                rightClickedItem = null;
                Object.assign(galleryMenu.style, { display: 'block', left: `${e.clientX}px`, top: `${e.clientY}px` });
            }
        });

        // --- Handle Item Context Menu Actions ---
        itemMenu.addEventListener('click', (e) => {
            itemMenu.style.display = 'none';
            const targetId = e.target.id;
            const primaryTarget = rightClickedItem || Array.from(selectedItems)[0];
            if (!primaryTarget || !targetId) return;

            switch (targetId) {
                case 'context-menu-open':
                    primaryTarget.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
                    break;
                case 'context-menu-open-tab': {
                    const fullSrc = primaryTarget.querySelector('img')?.dataset.fullsrc;
                    if (fullSrc) window.open(fullSrc, '_blank');
                    break;
                }
                case 'context-menu-save':
                    if (selectedItems.size > 1) { // ZIP Download
                        document.body.style.cursor = 'wait';
                        const zip = new JSZip();
                        const promises = Array.from(selectedItems).map(figure => {
                            const img = figure.querySelector('img');
                            const src = img?.dataset.fullsrc;
                            const filename = figure.querySelector('figcaption')?.childNodes[0].nodeValue.trim();
                            if (!src || !filename) return Promise.resolve();
                            
                            return fetch(src)
                                .then(res => res.ok ? res.blob() : Promise.reject(new Error(`${res.statusText} for ${filename}`)))
                                .then(blob => zip.file(filename, blob))
                                .catch(err => {
                                    console.error(err);
                                    alert(`Could not download: ${filename}\nReason: ${err.message}`);
                                });
                        });

                        Promise.all(promises).then(() => {
                            zip.generateAsync({ type: "blob" }).then(content => {
                                saveAs(content, "witcher_images.zip");
                                document.body.style.cursor = 'default';
                            }).catch(zipError => {
                                console.error("Error generating zip file:", zipError);
                                document.body.style.cursor = 'default';
                            });
                        });

                    } else { // Single Image Download
                        const img = primaryTarget.querySelector('img');
                        const fullSrc = img?.dataset.fullsrc;
                        const filename = primaryTarget.querySelector('figcaption')?.childNodes[0].nodeValue.trim();
                        if (fullSrc && filename) downloadImage(fullSrc, filename);
                    }
                    break;
            }
            rightClickedItem = null;
        });
        
        // --- Handle Gallery Context Menu Actions ---
        galleryMenu.addEventListener('click', (e) => {
            galleryMenu.style.display = 'none';
            switch (e.target.id) {
                case 'gallery-context-add': alert('Functionality for "Add Image" is not yet implemented.'); break;
                case 'gallery-context-sort': alert('Functionality for "Sort By" is not yet implemented.'); break;
                case 'gallery-context-view': alert('Functionality for "Show View Options" is not yet implemented.'); break;
            }
        });
    })();
});


// ===================================================================================
//
// 4. CUSTOM SCROLLBAR LOGIC
//
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Caching ---
    const track = document.getElementById('custom-scrollbar-track');
    const thumb = document.getElementById('custom-scrollbar-thumb');
    const header = document.getElementById('header');

    if (!track || !thumb || !header) return;

    // --- State & Optimization ---
    let ticking = false;

    // --- Core Functions ---
    function updateThumbPosition() {
        const scrollableHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        if (scrollableHeight <= viewportHeight) return;

        const trackHeight = track.offsetHeight;
        const thumbHeight = thumb.offsetHeight;
        const scrollPercentage = window.scrollY / (scrollableHeight - viewportHeight);
        const thumbPosition = scrollPercentage * (trackHeight - thumbHeight);
        
        thumb.style.transform = `translateY(${thumbPosition}px)`;
    }

    function setupScrollbar() {
        const headerHeight = header.offsetHeight;
        const scrollableHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        if (scrollableHeight <= viewportHeight) {
            track.style.display = 'none';
            return;
        }

        track.style.display = 'block';
        track.style.top = `${headerHeight}px`;
        track.style.height = `calc(100% - ${headerHeight}px)`;

        const trackHeight = track.offsetHeight;
        const thumbHeight = Math.max((viewportHeight / scrollableHeight) * trackHeight, 20); // 20px min height
        thumb.style.height = `${thumbHeight}px`;

        updateThumbPosition();
    }

    // --- Event Listeners ---
    document.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateThumbPosition();
                ticking = false;
            });
            ticking = true;
        }
    });

    thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startScrollTop = document.documentElement.scrollTop;

        function onMouseMove(moveEvent) {
            const deltaY = moveEvent.clientY - startY;
            const scrollableHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const trackHeight = track.offsetHeight;
            const thumbHeight = thumb.offsetHeight;

            if (trackHeight - thumbHeight === 0) return;

            const deltaScroll = (deltaY / (trackHeight - thumbHeight)) * (scrollableHeight - viewportHeight);
            window.scrollTo(0, startScrollTop + deltaScroll);
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // --- Initialization & Responsive Setup ---
    window.addEventListener('resize', setupScrollbar);
    window.addEventListener('load', setupScrollbar);
    window.addEventListener('orientationchange', setupScrollbar);
    
    // Initial setup call
    setupScrollbar();
    // A small timeout helps ensure all content (like images) has loaded and affected the page height
    setTimeout(setupScrollbar, 500);
});


// ===================================================================================
//
// 5. SCROLLBAR PROXIMITY EFFECT
//
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    const thumb = document.getElementById('custom-scrollbar-thumb');
    if (!thumb) return;

    const proximity = 30; // px
    let ticking = false;

    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const thumbRect = thumb.getBoundingClientRect();
                const isHorizontallyNear = e.clientX >= thumbRect.left - proximity;
                const isVerticallyNear = e.clientY >= thumbRect.top - proximity && e.clientY <= thumbRect.bottom + proximity;

                if (isHorizontallyNear && isVerticallyNear && e.clientX < window.innerWidth - 2) {
                    thumb.classList.add('is-near');
                } else {
                    thumb.classList.remove('is-near');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});
