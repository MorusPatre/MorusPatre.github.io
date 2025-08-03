(function($) {

    var    $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $header = $('#header'),
        $footer = $('#footer'),
        $main = $('#main'),
        $main_articles = $main.children('article');

    // Breakpoints.
        breakpoints({
            xlarge:   [ '1281px',  '1680px' ],
            large:    [ '981px',   '1280px' ],
            medium:   [ '737px',   '980px'  ],
            small:    [ '481px',   '736px'  ],
            xsmall:   [ '361px',   '480px'  ],
            xxsmall:  [ null,      '360px'  ]
        });

    // Fix: Flexbox min-height bug on IE.
        if (browser.name == 'ie') {

            var flexboxFixTimeoutId;

            $window.on('resize.flexbox-fix', function() {

                clearTimeout(flexboxFixTimeoutId);

                flexboxFixTimeoutId = setTimeout(function() {

                    if ($wrapper.prop('scrollHeight') > $window.height())
                        $wrapper.css('height', 'auto');
                    else
                        $wrapper.css('height', '100vh');

                }, 250);

            }).triggerHandler('resize.flexbox-fix');

        }

    // Nav.
        var $nav = $header.children('nav'),
            $nav_li = $nav.find('li');

        // Add "middle" alignment classes if we're dealing with an even number of items.
            if ($nav_li.length % 2 == 0) {

                $nav.addClass('use-middle');
                $nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

            }

    // Main.
        var    delay = 325,
            locked = false;

        // Methods.
            $main._show = function(id, initial) {

                var $article = $main_articles.filter('#' + id);

                // No such article? Bail.
                    if ($article.length == 0)
                        return;

                // Handle lock.

                    // Already locked? Speed through "show" steps w/o delays.
                        if (locked || (typeof initial != 'undefined' && initial === true)) {

                            // Mark as switching.
                                $body.addClass('is-switching');

                            // Mark as visible.
                                $body.addClass('is-article-visible');

                            // Deactivate all articles (just in case one's already active).
                                $main_articles.removeClass('active');

                            // Hide header, footer.
                                $header.hide();
                                $footer.hide();

                            // Show main, article.
                                $main.show();
                                $article.show();

                            // Activate article.
                                $article.addClass('active');

                            // Unlock.
                                locked = false;

                            // Unmark as switching.
                                setTimeout(function() {
                                    $body.removeClass('is-switching');
                                }, (initial ? 1000 : 0));

                            return;

                        }

                    // Lock.
                        locked = true;

                // Article already visible? Just swap articles.
                    if ($body.hasClass('is-article-visible')) {

                        // Deactivate current article.
                            var $currentArticle = $main_articles.filter('.active');

                            $currentArticle.removeClass('active');

                        // Show article.
                            setTimeout(function() {

                                // Hide current article.
                                    $currentArticle.hide();

                                // Show article.
                                    $article.show();

                                // Activate article.
                                    setTimeout(function() {

                                        $article.addClass('active');

                                        // Window stuff.
                                            $window
                                                .scrollTop(0)
                                                .triggerHandler('resize.flexbox-fix');

                                        // Unlock.
                                            setTimeout(function() {
                                                locked = false;
                                            }, delay);

                                    }, 25);

                            }, delay);

                    }

                // Otherwise, handle as normal.
                    else {

                        // Mark as visible.
                            $body
                                .addClass('is-article-visible');

                        // Show article.
                            setTimeout(function() {

                                // Hide header, footer.
                                    $header.hide();
                                    $footer.hide();

                                // Show main, article.
                                    $main.show();
                                    $article.show();

                                // Activate article.
                                    setTimeout(function() {

                                        $article.addClass('active');

                                        // Window stuff.
                                            $window
                                                .scrollTop(0)
                                                .triggerHandler('resize.flexbox-fix');

                                        // Unlock.
                                            setTimeout(function() {
                                                locked = false;
                                            }, delay);

                                    }, 25);

                            }, delay);

                    }

            };

            $main._hide = function(addState) {

                var $article = $main_articles.filter('.active');

                // Article not visible? Bail.
                    if (!$body.hasClass('is-article-visible'))
                        return;

                // Add state?
                    if (typeof addState != 'undefined'
                    &&    addState === true)
                        history.pushState(null, null, '#');

                // Handle lock.

                    // Already locked? Speed through "hide" steps w/o delays.
                        if (locked) {

                            // Mark as switching.
                                $body.addClass('is-switching');

                            // Deactivate article.
                                $article.removeClass('active');

                            // Hide article, main.
                                $article.hide();
                                $main.hide();

                            // Show footer, header.
                                $footer.show();
                                $header.show();

                            // Unmark as visible.
                                $body.removeClass('is-article-visible');

                            // Unlock.
                                locked = false;

                            // Unmark as switching.
                                $body.removeClass('is-switching');

                            // Window stuff.
                                $window
                                    .scrollTop(0)
                                    .triggerHandler('resize.flexbox-fix');

                            return;

                        }

                    // Lock.
                        locked = true;

                // Deactivate article.
                    $article.removeClass('active');

                // Hide article.
                    setTimeout(function() {

                        // Hide article, main.
                            $article.hide();
                            $main.hide();

                        // Show footer, header.
                            $footer.show();
                            $header.show();

                        // Unmark as visible.
                            setTimeout(function() {

                                $body.removeClass('is-article-visible');

                                // Window stuff.
                                    $window
                                        .scrollTop(0)
                                        .triggerHandler('resize.flexbox-fix');

                                // Unlock.
                                    setTimeout(function() {
                                        locked = false;
                                    }, delay);

                            }, 25);

                    }, delay);


            };

        // Articles.
            $main_articles.each(function() {

                var $this = $(this);

                // Close.
                    $('<div class="close">Close</div>')
                        .appendTo($this)
                        .on('click', function() {
                            location.hash = '';
                        });

                // Prevent clicks from inside article from bubbling.
                    $this.on('click', function(event) {
                        event.stopPropagation();
                    });

            });

        // Events.
            $body.on('click', function(event) {

                // Article visible? Hide.
                    if ($body.hasClass('is-article-visible'))
                        $main._hide(true);

            });

            $window.on('keyup', function(event) {

                switch (event.keyCode) {

                    case 27:

                        // Article visible? Hide.
                            if ($body.hasClass('is-article-visible'))
                                $main._hide(true);

                        break;

                    default:
                        break;

                }

            });

            $window.on('hashchange', function(event) {

                // Empty hash?
                    if (location.hash == ''
                    ||    location.hash == '#') {

                        // Prevent default.
                            event.preventDefault();
                            event.stopPropagation();

                        // Hide.
                            $main._hide();

                    }

                // Otherwise, check for a matching article.
                    else if ($main_articles.filter(location.hash).length > 0) {

                        // Prevent default.
                            event.preventDefault();
                            event.stopPropagation();

                        // Show article.
                            $main._show(location.hash.substr(1));

                    }

            });

        // Scroll restoration.
        // This prevents the page from scrolling back to the top on a hashchange.
            if ('scrollRestoration' in history)
                history.scrollRestoration = 'manual';
            else {

                var    oldScrollPos = 0,
                    scrollPos = 0,
                    $htmlbody = $('html,body');

                $window
                    .on('scroll', function() {

                        oldScrollPos = scrollPos;
                        scrollPos = $htmlbody.scrollTop();

                    })
                    .on('hashchange', function() {
                        $window.scrollTop(oldScrollPos);
                    });

            }

        // Initialize.

            // Hide main, articles.
                $main.hide();
                $main_articles.hide();

            // Initial article.
                if (location.hash != ''
                &&    location.hash != '#')
                    $window.on('load', function() {
                        $main._show(location.hash.substr(1), true);
                    });

})(jQuery);


document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    const searchInput = document.getElementById('search-input');

    if (!gallery || !wrapper) return;

    const marquee = document.getElementById('marquee');
    const items = gallery.getElementsByTagName('figure');

    let selectedItems = new Set();
    let isMarquee = false;
    let startPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();

    let hasDragged = false;
    let mouseDownItem = null;
    let downloadAbortController = null;
    
    const indicator = document.getElementById('download-indicator');
    const cancelBtn = indicator.querySelector('.cancel-icon');

    // Attach a single, permanent listener to the cancel button
    cancelBtn.addEventListener('click', () => {
        if (downloadAbortController) {
            downloadAbortController.abort();
        }
    });

    /*
    ==================================================================
    // START: SEARCH LOGIC (MOVED FROM INDEX.HTML)
    ==================================================================
    */
    const clearSearchBtn = document.getElementById('clear-search');

    function simplifySearchText(text) {
        if (!text) return "";
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    searchInput.addEventListener('keyup', function(event) {
        if (searchInput.value.length > 0) {
            clearSearchBtn.style.display = 'block';
            searchInput.style.paddingRight = '30px';
        } else {
            clearSearchBtn.style.display = 'none';
            searchInput.style.paddingRight = '';
        }

        const originalQuery = simplifySearchText(event.target.value.toLowerCase());
        const galleryItems = gallery.querySelectorAll('figure');

        // This regex looks for patterns like "season 1", "s1", "e2", "s1e2", etc.
        const phraseRegex = /\b(s\d+e\d+|season\s*\d+|episode\s*\d+|s\d+|e\d+)\b/g;

        // Pull out all the special phrases (e.g., ["season 1", "episode 2"])
        const phraseTerms = originalQuery.match(phraseRegex) || [];

        // Get the rest of the query by removing the phrases we just found
        const remainingText = originalQuery.replace(phraseRegex, '').trim();

        // Split the rest of the query into individual words
        const wordTerms = remainingText.split(' ').filter(term => term.length > 0);

        // Combine them into the final list of terms to search for
        const searchTerms = [...phraseTerms, ...wordTerms];

        galleryItems.forEach(function(item) {
            const img = item.querySelector('img');
            if (!img || !img.dataset.search) {
                item.style.display = 'none';
                return;
            }

            const searchData = img.dataset.search.toLowerCase();

            // Check if ALL terms (both phrases and individual words) are present
            const isMatch = searchTerms.every(term => searchData.includes(term));

            if (isMatch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        window.scrollTo(0, 0);
        window.dispatchEvent(new CustomEvent('galleryFiltered'));
    });

    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        const keyupEvent = new Event('keyup', { bubbles: true });
        searchInput.dispatchEvent(keyupEvent);
        searchInput.focus();
    });

    /*
    ==================================================================
    // START: FINDER-STYLE ARROW KEY NAVIGATION LOGIC
    ==================================================================
    */

    // --- State Variables for Navigation ---
    let selectionAnchor = null; // For range selections (Shift key)
    let lastSelectedItem = null; // The currently "focused" item for keyboard navigation
    let gridMetrics = { cols: 0 }; // To store the calculated number of columns

    /**
     * Calculates the number of columns in the responsive grid.
     * This is crucial for Up/Down arrow navigation.
     */
    function calculateGridMetrics() {
        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) {
            gridMetrics.cols = 0;
            return;
        }

        const firstItemTop = visibleItems[0].offsetTop;
        let cols = 0;
        for (const item of visibleItems) {
            if (item.offsetTop === firstItemTop) {
                cols++;
            } else {
                break;
            }
        }
        gridMetrics.cols = cols > 0 ? cols : 1;
    }

    /**
     * Applies a selection to all items between the anchor and the focus item.
     * Mimics Finder's shift-click and shift-arrow behavior.
     */
    function applyRangeSelection() {
        if (!selectionAnchor) return;

        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        const anchorIndex = visibleItems.indexOf(selectionAnchor);
        const focusIndex = visibleItems.indexOf(lastSelectedItem);

        if (anchorIndex === -1 || focusIndex === -1) return;

        const start = Math.min(anchorIndex, focusIndex);
        const end = Math.max(anchorIndex, focusIndex);

        // First, determine the final set of selected items
        const itemsToSelect = new Set();
        for (let i = start; i <= end; i++) {
            itemsToSelect.add(visibleItems[i]);
        }

        // Now, update the DOM and the main selectedItems set in one pass
        for(const item of visibleItems) {
            if(itemsToSelect.has(item)) {
                if (!selectedItems.has(item)) {
                     item.classList.add('selected');
                     selectedItems.add(item);
                }
            } else {
                if (selectedItems.has(item)) {
                    item.classList.remove('selected');
                    selectedItems.delete(item);
                }
            }
        }
    }

    // --- Event Listener for Keyboard Navigation ---
    document.addEventListener('keydown', (e) => {
        // Ignore key events if the user is typing in the search bar
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
        }

        // We only care about arrow keys
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return;
        }

        e.preventDefault(); // Prevent page scrolling

        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) return;

        let currentIndex = lastSelectedItem ? visibleItems.indexOf(lastSelectedItem) : -1;
        let newIndex = -1;

        // If nothing is selected, start from the first or last item.
        if (currentIndex === -1) {
             if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                newIndex = 0;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                newIndex = visibleItems.length -1;
            }
        } else {
            // If an item IS selected, navigate from it.
            switch (e.key) {
                case 'ArrowLeft':
                    newIndex = currentIndex - 1;
                    break;
                case 'ArrowRight':
                    newIndex = currentIndex + 1;
                    break;
                case 'ArrowUp':
                    newIndex = currentIndex - gridMetrics.cols;
                    break;
                case 'ArrowDown':
                    newIndex = currentIndex + gridMetrics.cols;
                    break;
            }
        }

        // Check if the new index is valid
        if (newIndex >= 0 && newIndex < visibleItems.length) {
            const newItem = visibleItems[newIndex];

            if (e.shiftKey) {
                // If Shift is pressed, extend the selection
                lastSelectedItem = newItem; // Update the focus
                applyRangeSelection();
            } else {
                // This block handles arrow key presses WITHOUT the Shift key.
                clearSelection();
                toggleSelection(newItem);
                selectionAnchor = newItem; // The new item is now the anchor
                lastSelectedItem = newItem;
            }

            // Ensure the newly selected item is visible
            newItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });

    // --- Initial Setup and Observers ---

    calculateGridMetrics();

    const galleryObserver = new ResizeObserver(() => {
        calculateGridMetrics();
    });
    galleryObserver.observe(gallery);

    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            setTimeout(calculateGridMetrics, 50);
        });
    }
    /*
    ==================================================================
    // END: FINDER-STYLE ARROW KEY NAVIGATION LOGIC
    ==================================================================
    */

    // Helper functions
    const isSelected = (el) => selectedItems.has(el);
    const toggleSelection = (el) => {
        if (isSelected(el)) {
            selectedItems.delete(el);
            el.classList.remove('selected');
        } else {
            selectedItems.add(el);
            el.classList.add('selected');
        }
    };
    const clearSelection = () => {
        Array.from(selectedItems).forEach(item => {
            item.classList.remove('selected');
        });
        selectedItems.clear();
    };
    const setSelection = (el, shouldBeSelected) => {
        if (shouldBeSelected) {
            if (!isSelected(el)) {
                selectedItems.add(el);
                el.classList.add('selected');
            }
        } else {
            if (isSelected(el)) {
                selectedItems.delete(el);
                el.classList.remove('selected');
            }
        }
    };

    // --- MouseDown Listener ---
    wrapper.addEventListener('mousedown', (e) => {
        // MODIFIED: If click starts in search bar, exit to allow native text selection.
        if (e.target === searchInput) {
            return;
        }

        // MODIFIED: Check if the event target is within the header or footer
        if (e.button !== 0 || header.contains(e.target) || footer.contains(e.target)) {
            isMarquee = false; // Ensure marquee selection is not initiated if starting in header/footer
            return;
        }

        if(gallery.contains(e.target) || e.target === gallery) {
            e.preventDefault();
            if (searchInput) searchInput.blur(); // MODIFIED: Use variable and check for existence
        }

        hasDragged = false;
        isMarquee = true;
        mouseDownItem = e.target.closest('figure');

        const galleryRect = gallery.getBoundingClientRect();
        startPos = {
            x: e.clientX - galleryRect.left,
            y: e.clientY - galleryRect.top,
        };

        preMarqueeSelectedItems = new Set(selectedItems);
    });

    // --- MouseMove Listener ---
    document.addEventListener('mousemove', (e) => {
        if (!isMarquee) return;

        e.preventDefault();
        hasDragged = true;
        document.body.classList.add('is-marquee-dragging');

        marquee.style.visibility = 'visible';

        const galleryRect = gallery.getBoundingClientRect();
        let rawX = e.clientX - galleryRect.left;
        let rawY = e.clientY - galleryRect.top;
        let currentX = Math.max(0, Math.min(rawX, galleryRect.width));
        let currentY = rawY;

        const marqueeRect = {
            x: Math.min(startPos.x, currentX),
            y: Math.min(startPos.y, currentY),
            w: Math.abs(startPos.x - currentX),
            h: Math.abs(startPos.y - currentY)
        };

        marquee.style.left = `${marqueeRect.x}px`;
        marquee.style.top = `${marqueeRect.y}px`;
        marquee.style.width = `${marqueeRect.w}px`;
        marquee.style.height = `${marqueeRect.h}px`;

        const isModifier = e.metaKey || e.ctrlKey || e.shiftKey;

        for (const item of items) {
            if (item.style.display === 'none') continue;

            const itemRect = item.getBoundingClientRect();
            const relativeItemRect = {
                left: itemRect.left - galleryRect.left,
                top: itemRect.top - galleryRect.top,
                right: itemRect.right - galleryRect.left,
                bottom: itemRect.bottom - galleryRect.top
            };

            const intersects =
            marqueeRect.x < relativeItemRect.right &&
            marqueeRect.x + marqueeRect.w > relativeItemRect.left &&
            marqueeRect.y < relativeItemRect.bottom &&
            marqueeRect.y + marqueeRect.h > relativeItemRect.top;

            if (isModifier) {
                if (intersects) {
                    setSelection(item, !preMarqueeSelectedItems.has(item));
                } else {
                    setSelection(item, preMarqueeSelectedItems.has(item));
                }
            } else {
                setSelection(item, intersects);
            }
        }
    });

    /**
     * UPDATED endDragAction function
     */
    const endDragAction = (e) => {
        document.body.classList.remove('is-marquee-dragging');
        if (!isMarquee) return;

        if (!hasDragged) {
            // Logic for a simple click (no drag)
            const isShift = e.shiftKey;
            const isModifier = e.metaKey || e.ctrlKey;
            const clickedOnItem = mouseDownItem;

            if (clickedOnItem) {
                // MODIFIED: Shift+Click now acts like Ctrl+Click
                if (isShift || isModifier) {
                    toggleSelection(clickedOnItem);
                    if (isSelected(clickedOnItem)) {
                        selectionAnchor = clickedOnItem;
                        lastSelectedItem = clickedOnItem;
                    }
                } else {
                    // MODIFIED: A single click on a lone selected item now deselects it
                    if (!isSelected(clickedOnItem) || selectedItems.size > 1) {
                        clearSelection();
                        toggleSelection(clickedOnItem);
                        selectionAnchor = clickedOnItem;
                        lastSelectedItem = clickedOnItem;
                    } else {
                        clearSelection();
                        selectionAnchor = null;
                        lastSelectedItem = null;
                    }
                }
            } else {
                // Click was on the gallery background
                if (!isModifier && !isShift) {
                    clearSelection();
                    selectionAnchor = null;
                    lastSelectedItem = null;
                }
            }
        } else {
            // Logic after a marquee drag
            const itemUnderMouse = e.target.closest('figure');

            if (mouseDownItem) {
                selectionAnchor = mouseDownItem;
            }

            if (itemUnderMouse && selectedItems.has(itemUnderMouse)) {
                lastSelectedItem = itemUnderMouse;
            } else {
                const visibleSelectedItems = Array.from(items)
                    .filter(item => item.style.display !== 'none' && selectedItems.has(item));

                if (visibleSelectedItems.length > 0) {
                    lastSelectedItem = visibleSelectedItems[visibleSelectedItems.length - 1];
                }
            }
        }

        // Cleanup marquee state
        isMarquee = false;
        hasDragged = false;
        mouseDownItem = null;
        marquee.style.visibility = 'hidden';
        marquee.style.width = '0px';
        marquee.style.height = '0px';
        preMarqueeSelectedItems.clear();
    };

    document.addEventListener('mouseup', endDragAction);

    // --- Mousedown listener for the whole document ---
    document.addEventListener('mousedown', (e) => {
        const itemMenu = document.getElementById('custom-context-menu');
        const galleryMenu = document.getElementById('gallery-context-menu');

        if (e.button === 0 && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target)) {
            itemMenu.style.display = 'none';
            galleryMenu.style.display = 'none';
        }

        if (!wrapper.contains(e.target) && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target)) {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                clearSelection();
            }
        }
    });

    /**
     * SELECT ALL FUNCTIONALITY
     */
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                return;
            }
            e.preventDefault();
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            visibleItems.forEach(item => {
                setSelection(item, true);
            });
        }
    });

    /*
    ==================================================================
    // START: CUSTOM CONTEXT MENU & UPLOAD LOGIC
    ==================================================================
    */

    const itemContextMenu = document.getElementById('custom-context-menu');
    const galleryContextMenu = document.getElementById('gallery-context-menu');
    const imageUploadInput = document.getElementById('image-upload-input');
    let rightClickedItem = null;

    gallery.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        const figure = e.target.closest('figure');

        itemContextMenu.style.display = 'none';
        galleryContextMenu.style.display = 'none';

        if (figure) {
            rightClickedItem = figure;

            if (!selectedItems.has(figure)) {
                clearSelection();
                toggleSelection(figure);
                selectionAnchor = figure;
                lastSelectedItem = figure;
            }

            const saveMenuItem = document.getElementById('context-menu-save');
            if (selectedItems.size > 1) {
                saveMenuItem.textContent = `Save ${selectedItems.size} Images as .zip`;
            } else {
                saveMenuItem.textContent = 'Save Image to "Downloads"';
            }

            itemContextMenu.style.display = 'block';
            itemContextMenu.style.left = `${e.clientX}px`;
            itemContextMenu.style.top = `${e.clientY}px`;

        } else if (e.target === gallery) {
            rightClickedItem = null;
            galleryContextMenu.style.display = 'block';
            galleryContextMenu.style.left = `${e.clientX}px`;
            galleryContextMenu.style.top = `${e.clientY}px`;
        }
    });

    // =================================================================
    // START: UNIFIED DOWNLOAD LOGIC
    // =================================================================

    /**
     * Asynchronously fetches an image from a URL and returns its blob data.
     * @param {string} url - The URL of the image to fetch.
     * @returns {Promise<Blob>} A promise that resolves with the image blob.
     */
    async function fetchImageBlob(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} for URL: ${url}`);
        }
        return response.blob();
    }

    /**
     * Triggers a browser download for a given blob and filename.
     * @param {Blob} blob - The data blob to be downloaded.
     * @param {string} filename - The desired filename for the download.
     */
    function triggerDownload(blob, filename) {
        // This function uses FileSaver.js (saveAs)
        saveAs(blob, filename);
    }

    itemContextMenu.addEventListener('click', async (e) => {
        const targetId = e.target.id;
        if (!targetId) return;

        itemContextMenu.style.display = 'none';

        const primaryTarget = rightClickedItem || Array.from(selectedItems)[0];
        if (!primaryTarget) return;

        switch (targetId) {
            case 'context-menu-open': {
                const dblClickEvent = new MouseEvent('dblclick', {
                    bubbles: true, cancelable: true, view: window
                });
                primaryTarget.dispatchEvent(dblClickEvent);
                break;
            }
            case 'context-menu-open-tab': {
                const img = primaryTarget.querySelector('img');
                const fullSrc = img.dataset.fullsrc;
                if (fullSrc) window.open(fullSrc, '_blank');
                break;
            }
            case 'context-menu-save': {
                if (downloadAbortController) {
                    downloadAbortController.abort();
                }
                
                downloadAbortController = new AbortController();
                const signal = downloadAbortController.signal;

                const indicator = document.getElementById('download-indicator');
                const progressCircle = indicator.querySelector('.progress-circle');
                indicator.classList.remove('is-complete');
                indicator.classList.add('is-active', 'is-downloading');

                const parseSizeToBytes = (sizeStr) => {
                    if (!sizeStr) return 0;
                    const [value, unit] = sizeStr.split(' ');
                    const num = parseFloat(value);
                    if (isNaN(num)) return 0;
                    switch (unit.toUpperCase()) {
                        case 'KB': return num * 1024;
                        case 'MB': return num * 1024 * 1024;
                        case 'GB': return num * 1024 * 1024 * 1024;
                        default: return num;
                    }
                };

                // THIS IS THE MODIFIED HELPER FUNCTION
                const updateProgress = (percent) => {
                    // We now set the --progress-angle custom property (1% = 3.6 degrees)
                    progressCircle.style.setProperty('--progress-angle', `${percent * 3.6}deg`);
                };
                
                updateProgress(0);

                const performDownloads = async () => {
                    let totalDownloaded = 0;
                    let totalDownloadSize = 0;

                    try {
                        const itemsToDownload = Array.from(selectedItems);
                        if (itemsToDownload.length === 0) {
                             indicator.classList.remove('is-active', 'is-downloading');
                             return;
                        }

                        itemsToDownload.forEach(item => {
                            const img = item.querySelector('img');
                            totalDownloadSize += parseSizeToBytes(img.dataset.size);
                        });

                        const processInBatches = async (items, batchSize, processFn) => {
                            let position = 0;
                            while (position < items.length) {
                                if (signal.aborted) throw new Error('AbortError');
                                const itemsForBatch = items.slice(position, position + batchSize);
                                await Promise.all(itemsForBatch.map(item => processFn(item)));
                                position += batchSize;
                            }
                        };

                        await processInBatches(itemsToDownload, 6, async (item) => {
                            const img = item.querySelector('img');
                            const url = img.dataset.fullsrc;
                            const filename = url.substring(url.lastIndexOf('/') + 1);

                            try {
                                const response = await fetch(url, { signal });
                                if (!response.ok) {
                                    console.error(`Failed to fetch ${filename}: ${response.statusText}`);
                                    totalDownloadSize -= parseSizeToBytes(img.dataset.size);
                                    return;
                                }
                                const blob = await response.blob();
                                saveAs(blob, filename);

                                totalDownloaded += blob.size;
                                const percent = totalDownloadSize > 0 ? (totalDownloaded / totalDownloadSize) * 100 : 0;
                                updateProgress(percent);

                            } catch (error) {
                                if (error.name !== 'AbortError') {
                                    console.error(`Could not download ${filename}:`, error);
                                } else {
                                    throw error;
                                }
                            }
                        });
                        
                        updateProgress(100);
                        indicator.classList.remove('is-downloading');
                        indicator.classList.add('is-complete');

                    } catch (error) {
                        if (error.name === 'AbortError') {
                            console.log('Download canceled by user.');
                        } else {
                            console.error("Download failed:", error);
                            alert(`An error occurred during the download: ${error.message}`);
                        }
                        indicator.classList.remove('is-downloading', 'is-active');
                    } finally {
                        setTimeout(() => {
                            indicator.classList.remove('is-active', 'is-complete');
                            downloadAbortController = null;
                            setTimeout(() => updateProgress(0), 400);
                        }, 3000);
                    }
                };

                performDownloads();
                break;
            }
        }
        rightClickedItem = null;
    });

    galleryContextMenu.addEventListener('click', (e) => {
        galleryContextMenu.style.display = 'none';
        const targetId = e.target.id;

        switch (targetId) {
            case 'gallery-context-add':
                // Programmatically click the hidden file input
                if (imageUploadInput) {
                    imageUploadInput.click();
                }
                break;
            case 'gallery-context-sort':
                alert('Functionality for "Sort By" is not yet implemented.');
                break;
            case 'gallery-context-view':
                alert('Functionality for "Show View Options" is not yet implemented.');
                break;
        }
    });
    
    // Add event listener for when files are selected for upload
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (!files.length) {
                return; // Exit if no files were selected
            }
    
            // URL of your Cloudflare Worker
            const UPLOAD_URL = 'https://r2-upload-presigner.witcherarchive.workers.dev';
            const uploadPromises = [];
    
            document.body.style.cursor = 'wait'; // Show waiting cursor
    
            // Loop through each selected file
            for (const file of files) {
                const uploadTask = fetch(UPLOAD_URL, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type,
                        'X-Custom-Filename': file.name
                    },
                    body: file
                })
                .then(response => {
                    if (!response.ok) {
                        // If any upload fails, throw an error to be caught later
                        return response.text().then(text => { 
                            throw new Error(`Failed to upload ${file.name}: ${text}`); 
                        });
                    }
                    return response.json();
                });
    
                uploadPromises.push(uploadTask);
            }
    
            try {
                // Wait for all upload promises to resolve
                await Promise.all(uploadPromises);
                alert(`${files.length} image(s) uploaded successfully!`);
                location.reload(); // Reload the page once all uploads are complete
            } catch (error) {
                console.error('An error occurred during one of the uploads:', error);
                alert(`An error occurred during upload: ${error.message}`);
            } finally {
                // Reset cursor and input value
                document.body.style.cursor = 'default';
                event.target.value = '';
            }
        });
    }

    /*
    ==================================================================
    // START: MODAL LOGIC (SECTION WITH CHANGES)
    ==================================================================
    */
    const modal = document.getElementById('image-modal');
    const modalContent = document.querySelector('.modal-content');
    const modalImg = document.getElementById('modal-img');
    const modalFilename = document.getElementById('modal-filename');
    const modalMetadata = document.getElementById('modal-metadata');
    const downloadBtn = document.getElementById('modal-download-btn');
    const closeModal = document.querySelector('.modal-close');
    const prevButton = document.querySelector('.modal-prev');
    const nextButton = document.querySelector('.modal-next');
    const imageContainer = document.querySelector('.modal-image-container');
    const infoPanel = document.querySelector('.modal-info-panel');
    let currentImageIndex = -1;

    // A map to get the correct display label for each data key.
    const KEY_TO_LABEL_MAP = {
        season: 'Season',
        episode: 'Episode',
        cast: 'Cast',
        crew: 'Crew',
        castAndCrew: 'Cast & Crew',
        characters: 'Characters'
    };

    // The order in which to display the primary data fields.
    const primaryKeys = ['season', 'episode', 'cast', 'crew', 'castAndCrew', 'characters'];


    modalContent.addEventListener('mouseenter', () => {
        if (modal.classList.contains('is-visible')) {
            document.body.style.overflow = 'hidden';
        }
    });

    modalContent.addEventListener('mouseleave', () => {
        if (modal.classList.contains('is-visible')) {
            document.body.style.overflow = '';
        }
    });

    function showImage(index) {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        if (index < 0 || index >= visibleFigures.length) {
            return;
        }
        currentImageIndex = index;
        const figure = visibleFigures[currentImageIndex];
        const img = figure.querySelector('img');

        downloadBtn.dataset.fullsrc = img.dataset.fullsrc; // Always store the high-res URL

        // Immediately display the low-resolution thumbnail.
        modalImg.src = img.src;

        // Load the high-res version in the background.
        const highResImage = new Image();
        highResImage.src = img.dataset.fullsrc;
        highResImage.onload = function() {
            modalImg.src = highResImage.src;
        };
        modalImg.alt = img.alt;

        modalFilename.textContent = img.dataset.filename;

        let primaryHTML = '<dl class="info-grid">';
        let detailsHTML = '<dl class="info-grid">';
        const dataset = img.dataset;

        primaryKeys.forEach(key => {
            if (dataset[key] && dataset[key].trim() !== '' && dataset[key].trim() !== '-' && dataset[key].trim() !== '- (-)') {
                const label = KEY_TO_LABEL_MAP[key] || key;
                primaryHTML += `<div class="info-item"><dt>${label}</dt><dd>${dataset[key]}</dd></div>`;
            }
        });

        let hasDetails = false;
        const handledKeys = ['search', 'fullsrc', 'filename', ...primaryKeys];

        for (const key in dataset) {
            if (!handledKeys.includes(key) && dataset[key] && dataset[key].trim() !== '' && dataset[key].trim() !== '-') {
                hasDetails = true;
                let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                let value = dataset[key];
                if (label === 'Dimensions' && value.includes('×')) {
                    const parts = value.split('×');
                    value = `${parts[0]}<span class="dimensions-x">×</span>${parts[1]}`;
                }
                detailsHTML += `<div class="info-item"><dt>${label}</dt><dd>${value}</dd></div>`;
            }
        }

        primaryHTML += '</dl>';
        detailsHTML += '</dl>';

        let finalHTML = primaryHTML;
        if (hasDetails) {
            finalHTML += '<h4 class="metadata-header">Metadata</h4>' + detailsHTML;
        }

        modalMetadata.innerHTML = finalHTML;

        document.body.classList.add('is-article-visible');
        modal.classList.add('is-visible');
    }

    downloadBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const url = event.currentTarget.dataset.fullsrc; // Use the stored high-res URL
        // Get filename, with a fallback for missing names
        const filename = modalFilename.textContent || url.split('/').pop();

        if (!url || !filename) {
            console.error("Modal download failed: URL or filename not found.");
            alert("Could not download the image because its data is missing.");
            return;
        }

        const buttonText = downloadBtn.textContent;
        try {
            // Provide visual feedback to the user
            downloadBtn.textContent = 'Downloading...';
            downloadBtn.disabled = true;

            // Fetch the image blob and trigger the download
            const blob = await fetchImageBlob(url);
            triggerDownload(blob, filename);

        } catch (error) {
            console.error("Modal download failed:", error);
            alert("An error occurred while trying to download the image.");
        } finally {
            // Restore the button to its original state after a moment
            setTimeout(() => {
                downloadBtn.textContent = buttonText;
                downloadBtn.disabled = false;
            }, 1000);
        }
    });

    downloadBtn.addEventListener('dragstart', function(event) {
        event.preventDefault();
    });

    function showNextImage() {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        let nextIndex = (currentImageIndex + 1) % visibleFigures.length;
        showImage(nextIndex);
    }

    function showPrevImage() {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        let prevIndex = (currentImageIndex - 1 + visibleFigures.length) % visibleFigures.length;
        showImage(prevIndex);
    }

    gallery.addEventListener('dblclick', function(event) {
        const figure = event.target.closest('figure');
        if (!figure) return;
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        const index = visibleFigures.indexOf(figure);
        if (index > -1) {
            showImage(index);
        }
    });

    function hideModal() {
        document.body.classList.remove('is-article-visible');
        modal.classList.remove('is-visible');
        currentImageIndex = -1;

        document.body.style.overflow = '';

        setTimeout(() => {
            modalImg.src = "";
            modalFilename.textContent = "";
            modalMetadata.innerHTML = "";
        }, 250);
    }

    modalContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    closeModal.addEventListener('click', hideModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);

    let mouseDownOnOverlay = false;

    modal.addEventListener('mousedown', function(event) {
        if (event.target === modal) {
            mouseDownOnOverlay = true;
        }
    });

    modal.addEventListener('mouseup', function(event) {
        if (event.target === modal && mouseDownOnOverlay) {
            hideModal();
        }
        mouseDownOnOverlay = false;
    });

    document.addEventListener('keydown', function(event) {
        if (modal.classList.contains('is-visible')) {
            if (event.key === 'Escape') {
                hideModal();
            } else if (event.key === 'ArrowRight') {
                showNextImage();
            } else if (event.key === 'ArrowLeft') {
                showPrevImage();
            }
        }
    });

    imageContainer.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            document.body.classList.add('is-selecting-text');
        }
    });

    infoPanel.addEventListener('mousedown', (e) => {
        const validTargets = '.info-grid dt, .info-grid dd, #modal-filename, .metadata-header';
        if (e.button === 0) {
            document.body.classList.add('is-selecting-text');
            if (e.target.matches(validTargets)) {
                e.target.classList.add('selection-active');
            }
        }
        else if (e.button === 2) {
            if (e.target.matches(validTargets)) {
                const targetElement = e.target;
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(targetElement);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (document.body.classList.contains('is-selecting-text')) {
            document.body.classList.remove('is-selecting-text');
            const activeElement = document.querySelector('.selection-active');
            if (activeElement) {
                activeElement.classList.remove('selection-active');
            }
        }
    });
});

/*Custom Scrollbar Advanced*/
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('custom-scrollbar-track');
    const thumb = document.getElementById('custom-scrollbar-thumb');
    const header = document.getElementById('header');

    if (!track || !thumb || !header) return;

    let ticking = false;

    // This function now only updates the thumb's position.
    // We use transform for smoother, GPU-accelerated animation.
    function updateThumbPosition() {
        const scrollableHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const trackHeight = track.offsetHeight;
        const thumbHeight = thumb.offsetHeight;

        // Prevent division by zero if content is smaller than viewport
        if (scrollableHeight <= viewportHeight) return;

        const scrollPercentage = window.scrollY / (scrollableHeight - viewportHeight);
        const thumbPosition = scrollPercentage * (trackHeight - thumbHeight);

        thumb.style.transform = `translateY(${thumbPosition}px)`;
    }

    // This function sets up the scrollbar dimensions and is called less frequently.
    function setupScrollbar() {
        const headerHeight = header.offsetHeight;
        const scrollableHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        // Hide or show track based on whether scrolling is needed
        if (scrollableHeight <= viewportHeight) {
            track.style.display = 'none';
            return;
        }
        track.style.display = 'block';
        thumb.classList.remove('is-near');
        track.style.top = `${headerHeight}px`;
        track.style.height = `calc(100% - ${headerHeight}px)`;

        const trackHeight = track.offsetHeight;
        const thumbHeight = Math.max((viewportHeight / scrollableHeight) * trackHeight, 20); // 20px min height
        thumb.style.height = `${thumbHeight}px`;

        // Run a position update immediately
        updateThumbPosition();
    }

    // On scroll, request an animation frame to update the thumb.
    // The 'ticking' flag ensures we don't have multiple animation frames queued.
    document.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateThumbPosition();
                ticking = false;
            });
            ticking = true;
        }
    });

    // The logic for dragging the thumb doesn't need to change.
    // Calling window.scrollTo() will trigger our optimized scroll listener above.
    thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startScrollTop = document.documentElement.scrollTop;

        function onMouseMove(e) {
            const deltaY = e.clientY - startY;
            const scrollableHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const trackHeight = track.offsetHeight;
            const thumbHeight = thumb.offsetHeight;

            // Prevent division by zero
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

    // Recalculate everything on resize, load, or orientation change
    window.addEventListener('resize', setupScrollbar);
    window.addEventListener('load', setupScrollbar);
    window.addEventListener('orientationchange', setupScrollbar);
    window.addEventListener('galleryFiltered', setupScrollbar);

    // Initial setup
    setupScrollbar();
    // A small timeout helps ensure all content (like images) has loaded and affected the page height
    setTimeout(setupScrollbar, 500);
});

/*
==================================================================
// Scrollbar Proximity Effect
==================================================================
*/
document.addEventListener('DOMContentLoaded', () => {
    const thumb = document.getElementById('custom-scrollbar-thumb');
    if (!thumb) return;

    const proximity = 30; // How close in pixels the mouse needs to be to trigger the effect
    let ticking = false; // A flag to optimize performance

    document.addEventListener('mousemove', (e) => {
        // Use requestAnimationFrame to avoid running this code too often
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const thumbRect = thumb.getBoundingClientRect();

                // Check if the mouse is horizontally within range (from the left of the thumb)
                const isHorizontallyNear = e.clientX >= thumbRect.left - proximity;

                // Check if the mouse is vertically within range (above or below the thumb)
                const isVerticallyNear = (e.clientY >= thumbRect.top - proximity) && (e.clientY <= thumbRect.bottom + proximity);

                // If the mouse is near and not at the very edge of the window, add the class
                if (isHorizontallyNear && isVerticallyNear && e.clientX < window.innerWidth - 2) {
                    thumb.classList.add('is-near');
                } else {
                    thumb.classList.remove('is-near');
                }

                ticking = false; // Reset the flag
            });
            ticking = true; // Set the flag
        }
    });
});

/*
==================================================================
// Autocomplete Search Suggestions Logic
==================================================================
*/
document.addEventListener('galleryLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const galleryItems = document.querySelectorAll('#photo-gallery figure img');

    if (!searchInput || !suggestionsContainer || galleryItems.length === 0) {
        return;
    }

    // Build a unique, sorted list of searchable terms from the JSON data.
    const searchTerms = new Set();
    galleryItems.forEach(img => {
        // MODIFICATION: Check for the new data attributes: cast, crew, and castAndCrew.
        const peopleSources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew];

        peopleSources.forEach(source => {
            if (source) { // Check if the source (e.g., img.dataset.cast) exists
                source.split(',').forEach(term => {
                    const cleaned = term.trim();
                    if (cleaned && cleaned.toLowerCase() !== 'red') searchTerms.add(cleaned);
                });
            }
        });

        if (img.dataset.characters) {
            img.dataset.characters.split(',').forEach(term => {
                const cleaned = term.trim();
                if (cleaned) searchTerms.add(cleaned);
            });
        }
    });
    const sortedSearchTerms = Array.from(searchTerms).sort((a, b) => a.localeCompare(b));

    let activeSuggestionIndex = -1;

    // Updates and displays the suggestion list based on user input.
    function updateSuggestions() {
        const query = searchInput.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        activeSuggestionIndex = -1;

        if (query.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const matches = sortedSearchTerms.filter(term => term.toLowerCase().startsWith(query)).slice(0, 7);

        if (matches.length > 0) {
            matches.forEach(term => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = term;
                // Use 'mousedown' to prevent the input's 'blur' event from hiding the suggestions before the click registers.
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    selectSuggestion(term);
                });
                suggestionsContainer.appendChild(item);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }

    // Handles the selection of a suggestion from the list.
    function selectSuggestion(value) {
        searchInput.value = value;
        suggestionsContainer.style.display = 'none';
        // Manually trigger the original 'keyup' event to perform the search.
        searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
    }

    // Manages the 'active' class for keyboard navigation.
    function updateActiveSuggestion(items) {
        items.forEach((item, index) => {
            if (index === activeSuggestionIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // --- Event Listeners ---

    // Update suggestions on every input change.
    searchInput.addEventListener('input', updateSuggestions);

    // Handle keyboard navigation (arrows, Enter, Escape).
    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (activeSuggestionIndex < items.length - 1) {
                    activeSuggestionIndex++;
                    updateActiveSuggestion(items);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (activeSuggestionIndex > 0) {
                    activeSuggestionIndex--;
                    updateActiveSuggestion(items);
                }
                break;
            case 'Enter':
                if (activeSuggestionIndex > -1) {
                    e.preventDefault();
                    selectSuggestion(items[activeSuggestionIndex].textContent);
                }
                break;
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
        }
    });

    // Hide the suggestions when clicking anywhere else on the page.
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
});

document.addEventListener('keydown', (e) => {
    // Check for Ctrl+C or Command+C
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const gallery = document.getElementById('photo-gallery');
        const searchInput = document.getElementById('search-input');
        const modal = document.getElementById('image-modal');

        // Ignore if the user is focused on the search input or if the modal is visible
        if (document.activeElement === searchInput || (modal && modal.classList.contains('is-visible'))) {
            return;
        }

        const selectedFigures = gallery.querySelectorAll('figure.selected');

        if (selectedFigures.length > 0) {
            // Prevent the browser's default copy behavior
            e.preventDefault();

            // Create an array of filenames from the selected figures
            const filenames = Array.from(selectedFigures).map(figure => {
                const img = figure.querySelector('img');
                return img ? img.dataset.filename : '';
            }).filter(name => name); // Filter out any empty or undefined names

            if (filenames.length > 0) {
                // Join the filenames with a single space for pasting into the search bar
                const textToCopy = filenames.join(' ');

                // Use the modern Clipboard API to write the text
                navigator.clipboard.writeText(textToCopy).then(() => {
                    console.log(`${filenames.length} filenames copied to clipboard.`);
                }).catch(err => {
                    console.error('Could not copy filenames to clipboard: ', err);
                });
            }
        }
    }
});
