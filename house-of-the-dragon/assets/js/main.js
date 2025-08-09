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
    // =================================================================
    // START: NEW CONTENTEDITABLE EDITOR LOGIC
    // =================================================================
    const editor = document.getElementById('search-input');
    const searchForm = editor.closest('form');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const clearSearchBtn = document.getElementById('clear-search');

    if (!editor || !searchForm) return;

    /**
     * Inserts a pill at the current cursor position in the editor.
     * @param {string} type - The type of pill (e.g., 'tag', 'character').
     * @param {string} value - The text content of the pill.
     */
    const insertPill = (type, value) => {
        editor.focus();
        
        const sanitizedValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        const pillHTML = `
            <span class="pill" contenteditable="false" data-type="${type}" data-value="${sanitizedValue}">
                ${sanitizedValue}
                <span class="remove-pill" onclick="this.parentNode.remove()">&times;</span>
            </span>&nbsp;`;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        let range = selection.getRangeAt(0);
        
        // This part is tricky: we want to replace the text that triggered the autocomplete.
        // A simple way is to find the text node the cursor is in and replace its content.
        let textNode = selection.anchorNode;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
             // Find the last word the user typed, which triggered the suggestion
             const textContent = textNode.textContent;
             const query = getSearchQuery().text;
             const lastWordIndex = textContent.toLowerCase().lastIndexOf(query.toLowerCase());
             if (lastWordIndex !== -1) {
                 range.setStart(textNode, lastWordIndex);
                 range.setEnd(textNode, lastWordIndex + query.length);
             }
        }
        range.deleteContents();

        const fragment = document.createRange().createContextualFragment(pillHTML);
        const lastNode = fragment.lastChild;
        range.insertNode(fragment);
        
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        editor.dispatchEvent(new Event('input', { bubbles: true }));
    };

    /**
     * Parses the editor's content and returns a structured query.
     * @returns {{text: string, pills: Array<{type: string, value: string}>}}
     */
    const getSearchQuery = () => {
        const pills = [];
        let textContent = '';

        editor.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('pill')) {
                pills.push({
                    type: node.dataset.type,
                    value: node.dataset.value
                });
            } else if (node.nodeType === Node.TEXT_NODE) {
                textContent += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'DIV' || node.tagName === 'BR')) {
                // Handle cases where browsers wrap text in <div> or add <br>
                textContent += ' ' + node.textContent;
            }
        });
        
        const text = textContent.replace(/\s+/g, ' ').trim();

        return { text, pills };
    };

    /**
     * The main search/filter function for the gallery.
     */
    const runSearch = () => {
        const query = getSearchQuery();
        const galleryItems = document.querySelectorAll('#photo-gallery figure');
        const hasQuery = query.text || query.pills.length > 0;

        clearSearchBtn.style.display = hasQuery ? 'block' : 'none';
        searchForm.style.paddingRight = hasQuery ? '30px' : '12px';

        galleryItems.forEach(figure => {
            const img = figure.querySelector('img');
            if (!img || !img.dataset.search) {
                figure.style.display = 'none';
                return;
            }
            const searchData = img.dataset.search.toLowerCase();
            let isMatch = true;

            if (query.pills.length > 0) {
                isMatch = query.pills.every(pill => searchData.includes(pill.value.toLowerCase()));
            }

            if (isMatch && query.text) {
                isMatch = query.text.toLowerCase().split(' ').filter(term => term).every(term => searchData.includes(term));
            }
            
            figure.style.display = isMatch ? 'flex' : 'none';
        });
        
        window.dispatchEvent(new CustomEvent('galleryFiltered'));
    };

    // --- Event Listeners for the Editor ---
    editor.addEventListener('input', runSearch);
    
    editor.addEventListener('DOMNodeRemoved', (e) => {
        if (e.target.classList && e.target.classList.contains('pill')) {
            runSearch();
        }
    });

    editor.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });
    
    clearSearchBtn.addEventListener('click', () => {
        editor.innerHTML = '';
        runSearch();
        editor.focus();
    });

    editor.addEventListener('submitSearch', () => {
        const activeSuggestion = suggestionsContainer.querySelector('.suggestion-item.active');
        const firstSuggestion = suggestionsContainer.querySelector('.suggestion-item');
        
        const suggestionToClick = activeSuggestion || firstSuggestion;

        if (suggestionsContainer.style.display === 'block' && suggestionToClick) {
            suggestionToClick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        }
    });
    // =================================================================
    // END: NEW CONTENTEDITABLE EDITOR LOGIC
    // =================================================================
    
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    
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

    let isAutoScrolling = false;
    let scrollSpeedY = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let lastClientModifierKey = false;


    cancelBtn.addEventListener('click', () => {
        if (downloadAbortController) {
            downloadAbortController.abort();
        }
    });

    /*
    ==================================================================
    // START: FINDER-STYLE ARROW KEY NAVIGATION LOGIC
    ==================================================================
    */

    let selectionAnchor = null;
    let lastSelectedItem = null;
    let gridMetrics = { cols: 0 };

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

    function applyRangeSelection() {
        if (!selectionAnchor) return;

        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        const anchorIndex = visibleItems.indexOf(selectionAnchor);
        const focusIndex = visibleItems.indexOf(lastSelectedItem);

        if (anchorIndex === -1 || focusIndex === -1) return;

        const start = Math.min(anchorIndex, focusIndex);
        const end = Math.max(anchorIndex, focusIndex);

        const itemsToSelect = new Set();
        for (let i = start; i <= end; i++) {
            itemsToSelect.add(visibleItems[i]);
        }

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

    document.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        const isSearchActive = activeEl && activeEl.id === 'search-input';
        
        if (isSearchActive) {
            // Let the search input's own keydown handler manage events
            return; 
        }

        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return;
        }

        e.preventDefault();

        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) return;

        let currentIndex = lastSelectedItem ? visibleItems.indexOf(lastSelectedItem) : -1;
        let newIndex = -1;

        if (currentIndex === -1) {
             if (e.key === 'ArrowRight' || e.key === 'ArrowDown') newIndex = 0;
             else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') newIndex = visibleItems.length -1;
        } else {
            switch (e.key) {
                case 'ArrowLeft': newIndex = currentIndex - 1; break;
                case 'ArrowRight': newIndex = currentIndex + 1; break;
                case 'ArrowUp': newIndex = currentIndex - gridMetrics.cols; break;
                case 'ArrowDown': newIndex = currentIndex + gridMetrics.cols; break;
            }
        }

        if (newIndex >= 0 && newIndex < visibleItems.length) {
            const newItem = visibleItems[newIndex];

            if (e.shiftKey) {
                lastSelectedItem = newItem;
                applyRangeSelection();
            } else {
                clearSelection();
                toggleSelection(newItem);
                selectionAnchor = newItem;
                lastSelectedItem = newItem;
            }

            newItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });

    calculateGridMetrics();

    const galleryObserver = new ResizeObserver(() => {
        calculateGridMetrics();
    });
    galleryObserver.observe(gallery);
    
    window.addEventListener('galleryFiltered', () => {
        setTimeout(calculateGridMetrics, 50);
    });

    /*
    ==================================================================
    // END: FINDER-STYLE ARROW KEY NAVIGATION LOGIC
    ==================================================================
    */

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
        Array.from(selectedItems).forEach(item => item.classList.remove('selected'));
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
    
    function updateMarqueeAndSelection(clientX, clientY, isModifier) {
        marquee.style.visibility = 'visible';
    
        const galleryRect = gallery.getBoundingClientRect();
        let rawX = clientX - galleryRect.left;
        let rawY = clientY - galleryRect.top;
    
        const marqueeRect = {
            x: Math.round(Math.min(startPos.x, rawX)),
            y: Math.round(Math.min(startPos.y, rawY)),
            w: Math.round(Math.abs(startPos.x - rawX)),
            h: Math.round(Math.abs(startPos.y - rawY))
        };
    
        marquee.style.left = `${marqueeRect.x}px`;
        marquee.style.top = `${marqueeRect.y}px`;
        marquee.style.width = `${marqueeRect.w}px`;
        marquee.style.height = `${marqueeRect.h}px`;
    
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
                setSelection(item, intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item));
            } else {
                setSelection(item, intersects);
            }
        }
    }
    
    function autoScrollLoop() {
        if (!isMarquee || !isAutoScrolling) {
            isAutoScrolling = false;
            return;
        }
    
        window.scrollBy(0, Math.round(scrollSpeedY));
        updateMarqueeAndSelection(lastClientX, lastClientY, lastClientModifierKey);
    
        requestAnimationFrame(autoScrollLoop);
    }

    wrapper.addEventListener('mousedown', (e) => {
        if (editor.contains(e.target)) {
            return;
        }

        if (e.button !== 0 || header.contains(e.target) || footer.contains(e.target)) {
            isMarquee = false; 
            return;
        }

        if(gallery.contains(e.target) || e.target === gallery) {
            e.preventDefault();
            if (editor) editor.blur();
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

    document.addEventListener('mousemove', (e) => {
        if (!isMarquee) return;
        
        hasDragged = true;
        document.body.classList.add('is-marquee-dragging');
    
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        lastClientModifierKey = e.metaKey || e.ctrlKey || e.shiftKey;
        
        updateMarqueeAndSelection(e.clientX, e.clientY, lastClientModifierKey);

        const viewportHeight = window.innerHeight;
        const scrollThreshold = 60; 
        const minScrollSpeed = 2;
        const maxScrollSpeed = 30;
    
        if (e.clientY > viewportHeight - scrollThreshold) {
            const overshoot = e.clientY - (viewportHeight - scrollThreshold);
            const speedRatio = overshoot / scrollThreshold;
            scrollSpeedY = minScrollSpeed + (speedRatio * (maxScrollSpeed - minScrollSpeed));
        } else if (e.clientY < scrollThreshold) {
            const overshoot = scrollThreshold - e.clientY;
            const speedRatio = overshoot / scrollThreshold;
            scrollSpeedY = -(minScrollSpeed + (speedRatio * (maxScrollSpeed - minScrollSpeed)));
        } else {
            scrollSpeedY = 0;
        }
    
        if (scrollSpeedY !== 0 && !isAutoScrolling) {
            isAutoScrolling = true;
            autoScrollLoop();
        } else if (scrollSpeedY === 0) {
            isAutoScrolling = false;
        }
    });

    const endDragAction = (e) => {
        isAutoScrolling = false;
        scrollSpeedY = 0;

        document.body.classList.remove('is-marquee-dragging');
        if (!isMarquee) return;

        if (!hasDragged) {
            const isShift = e.shiftKey;
            const isModifier = e.metaKey || e.ctrlKey;
            const clickedOnItem = mouseDownItem;

            if (clickedOnItem) {
                if (isShift || isModifier) {
                    toggleSelection(clickedOnItem);
                    if (isSelected(clickedOnItem)) {
                        selectionAnchor = clickedOnItem;
                        lastSelectedItem = clickedOnItem;
                    }
                } else {
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
                if (!isModifier && !isShift) {
                    clearSelection();
                    selectionAnchor = null;
                    lastSelectedItem = null;
                }
            }
        } else {
            const itemUnderMouse = e.target.closest('figure');
            if (mouseDownItem) selectionAnchor = mouseDownItem;
            if (itemUnderMouse && selectedItems.has(itemUnderMouse)) {
                lastSelectedItem = itemUnderMouse;
            } else {
                const visibleSelectedItems = Array.from(items).filter(item => item.style.display !== 'none' && selectedItems.has(item));
                if (visibleSelectedItems.length > 0) {
                    lastSelectedItem = visibleSelectedItems[visibleSelectedItems.length - 1];
                }
            }
        }

        isMarquee = false;
        hasDragged = false;
        mouseDownItem = null;
        marquee.style.visibility = 'hidden';
        marquee.style.width = '0px';
        marquee.style.height = '0px';
        preMarqueeSelectedItems.clear();
    };

    document.addEventListener('mouseup', endDragAction);

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

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            const activeEl = document.activeElement;
            if (activeEl && activeEl.id === 'search-input') return;
            e.preventDefault();
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            visibleItems.forEach(item => setSelection(item, true));
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
            saveMenuItem.textContent = selectedItems.size > 1 ? `Save ${selectedItems.size} Images to "Downloads"` : 'Save Image to "Downloads"';
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

    async function fetchImageBlob(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} for URL: ${url}`);
        return response.blob();
    }

    function triggerDownload(blob, filename) {
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
                const dblClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
                primaryTarget.dispatchEvent(dblClickEvent);
                break;
            }
            case 'context-menu-open-tab': {
                const img = primaryTarget.querySelector('img');
                if (img && img.dataset.fullsrc) window.open(img.dataset.fullsrc, '_blank');
                break;
            }
            case 'context-menu-save': {
                if (downloadAbortController) downloadAbortController.abort();
                downloadAbortController = new AbortController();
                const signal = downloadAbortController.signal;

                const indicator = document.getElementById('download-indicator');
                const progressCircle = indicator.querySelector('.progress-circle');
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
                const updateProgress = (percent) => progressCircle.style.setProperty('--progress-angle', `${percent * 3.6}deg`);
                updateProgress(0);

                const performDownloads = async () => {
                    try {
                        const itemsToDownload = Array.from(selectedItems);
                        if (itemsToDownload.length === 0) {
                             indicator.classList.remove('is-active', 'is-downloading');
                             return;
                        }

                        let totalDownloadSize = 0;
                        itemsToDownload.forEach(item => totalDownloadSize += parseSizeToBytes(item.querySelector('img').dataset.size));
                        
                        let totalDownloaded = 0;
                        const processInBatches = async (items, batchSize, processFn) => {
                            for (let i = 0; i < items.length; i += batchSize) {
                                if (signal.aborted) throw new Error('AbortError');
                                const batch = items.slice(i, i + batchSize);
                                await Promise.all(batch.map(item => processFn(item)));
                            }
                        };
                        
                        await processInBatches(itemsToDownload, 6, async (item) => {
                            const img = item.querySelector('img');
                            const url = img.dataset.fullsrc;
                            const filename = url.substring(url.lastIndexOf('/') + 1);
                            try {
                                const response = await fetch(url, { signal, cache: 'no-store' });
                                if (!response.ok) throw new Error(response.statusText);
                                const blob = await response.blob();
                                saveAs(blob, filename);
                                totalDownloaded += blob.size;
                                updateProgress(totalDownloadSize > 0 ? (totalDownloaded / totalDownloadSize) * 100 : 0);
                            } catch (error) {
                                if (error.name !== 'AbortError') console.error(`Could not download ${filename}:`, error);
                                throw error;
                            }
                        });
                        
                        updateProgress(100);
                        await new Promise(resolve => setTimeout(resolve, 400));
                    } catch (error) {
                        if (error.name !== 'AbortError') console.error("Download failed:", error);
                    } finally {
                        indicator.classList.remove('is-active', 'is-downloading');
                        downloadAbortController = null;
                        setTimeout(() => updateProgress(0), 400);
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
        if (e.target.id === 'gallery-context-add' && imageUploadInput) imageUploadInput.click();
    });
    
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (!files.length) return;
            const UPLOAD_URL = 'https://r2-upload-presigner.witcherarchive.workers.dev';
            document.body.style.cursor = 'wait';
            try {
                await Promise.all(Array.from(files).map(file => fetch(UPLOAD_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type, 'X-Custom-Filename': file.name },
                    body: file
                }).then(response => { if (!response.ok) throw new Error(`Upload failed for ${file.name}`); })));
                alert(`${files.length} image(s) uploaded successfully!`);
                location.reload(); 
            } catch (error) {
                alert(`An error occurred during upload: ${error.message}`);
            } finally {
                document.body.style.cursor = 'default';
                event.target.value = '';
            }
        });
    }

    /*
    ==================================================================
    // START: MODAL LOGIC
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

    const KEY_TO_LABEL_MAP = { season: 'Season', episode: 'Episode', cast: 'Cast', crew: 'Crew', castAndCrew: 'Cast & Crew', characters: 'Characters' };
    const primaryKeys = ['season', 'episode', 'cast', 'crew', 'castAndCrew', 'characters'];

    function showImage(index) {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        if (index < 0 || index >= visibleFigures.length) return;
        currentImageIndex = index;
        const img = visibleFigures[currentImageIndex].querySelector('img');

        downloadBtn.dataset.fullsrc = img.dataset.fullsrc; 
        modalImg.src = img.src; // Show thumbnail first
        new Image().src = img.dataset.fullsrc; // Preload high-res
        modalImg.alt = img.alt;
        modalFilename.textContent = img.dataset.filename;

        let primaryHTML = '<dl class="info-grid">';
        let detailsHTML = '<dl class="info-grid">';
        primaryKeys.forEach(key => {
            if (img.dataset[key] && img.dataset[key].trim() !== '-' && img.dataset[key].trim() !== '- (-)') {
                primaryHTML += `<div class="info-item"><dt>${KEY_TO_LABEL_MAP[key] || key}</dt><dd>${img.dataset[key]}</dd></div>`;
            }
        });
        let hasDetails = false;
        const handledKeys = ['search', 'fullsrc', 'filename', ...primaryKeys];
        for (const key in img.dataset) {
            if (!handledKeys.includes(key) && img.dataset[key] && img.dataset[key].trim() !== '-') {
                hasDetails = true;
                let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                let value = img.dataset[key];
                if (label === 'Dimensions' && value.includes('×')) {
                    value = `${value.split('×')[0]}<span class="dimensions-x">×</span>${value.split('×')[1]}`;
                }
                detailsHTML += `<div class="info-item"><dt>${label}</dt><dd>${value}</dd></div>`;
            }
        }
        primaryHTML += '</dl>';
        detailsHTML += '</dl>';
        modalMetadata.innerHTML = primaryHTML + (hasDetails ? '<h4 class="metadata-header">Metadata</h4>' + detailsHTML : '');

        modal.classList.add('is-visible');
        document.body.classList.add('is-article-visible');
    }

    downloadBtn.addEventListener('click', async (event) => {
        event.preventDefault(); event.stopPropagation();
        const url = event.currentTarget.dataset.fullsrc; 
        const filename = modalFilename.textContent || url.split('/').pop();
        if (!url || !filename) return;
        const buttonText = downloadBtn.textContent;
        try {
            downloadBtn.textContent = 'Downloading...'; downloadBtn.disabled = true;
            const blob = await fetchImageBlob(url);
            triggerDownload(blob, filename);
        } catch (error) { console.error("Modal download failed:", error); } 
        finally { setTimeout(() => { downloadBtn.textContent = buttonText; downloadBtn.disabled = false; }, 1000); }
    });

    const showNextImage = () => showImage((currentImageIndex + 1) % gallery.querySelectorAll('figure:not([style*="display: none"])').length);
    const showPrevImage = () => showImage((currentImageIndex - 1 + gallery.querySelectorAll('figure:not([style*="display: none"])').length) % gallery.querySelectorAll('figure:not([style*="display: none"])').length);

    gallery.addEventListener('dblclick', function(event) {
        const figure = event.target.closest('figure');
        if (!figure) return;
        const index = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])')).indexOf(figure);
        if (index > -1) showImage(index);
    });

    function hideModal() {
        modal.classList.remove('is-visible');
        document.body.classList.remove('is-article-visible');
        setTimeout(() => { modalImg.src = ""; modalFilename.textContent = ""; modalMetadata.innerHTML = ""; }, 250);
    }
    
    modalContent.addEventListener('click', e => e.stopPropagation());
    closeModal.addEventListener('click', hideModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    modal.addEventListener('click', hideModal);

    document.addEventListener('keydown', function(event) {
        if (modal.classList.contains('is-visible')) {
            if (event.key === 'Escape') hideModal();
            else if (event.key === 'ArrowRight') showNextImage();
            else if (event.key === 'ArrowLeft') showPrevImage();
        }
    });

    imageContainer.addEventListener('mousedown', (e) => { if (e.button === 0) document.body.classList.add('is-selecting-text'); });
    infoPanel.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            document.body.classList.add('is-selecting-text');
            if (e.target.closest('.info-item, #modal-filename, .metadata-header')) e.target.classList.add('selection-active');
        }
    });
    document.addEventListener('mouseup', () => { document.body.classList.remove('is-selecting-text'); document.querySelector('.selection-active')?.classList.remove('selection-active'); });
});

/*Custom Scrollbar Advanced*/
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('custom-scrollbar-track');
    const thumb = document.getElementById('custom-scrollbar-thumb');
    const header = document.getElementById('header');

    if (!track || !thumb || !header) return;

    let ticking = false;

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
        track.style.display = (scrollableHeight <= viewportHeight) ? 'none' : 'block';
        track.style.top = `${headerHeight}px`;
        track.style.height = `calc(100% - ${headerHeight}px)`;
        const trackHeight = track.offsetHeight;
        const thumbHeight = Math.max((viewportHeight / scrollableHeight) * trackHeight, 20);
        thumb.style.height = `${thumbHeight}px`;
        updateThumbPosition();
    }

    document.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => { updateThumbPosition(); ticking = false; });
            ticking = true;
        }
    });

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

    const setupEvents = ['resize', 'load', 'orientationchange', 'galleryFiltered'];
    setupEvents.forEach(event => window.addEventListener(event, setupScrollbar));
    setupScrollbar();
    setTimeout(setupScrollbar, 500);
});

/* Scrollbar Proximity Effect */
document.addEventListener('DOMContentLoaded', () => {
    const thumb = document.getElementById('custom-scrollbar-thumb');
    if (!thumb) return;
    const proximity = 30;
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const thumbRect = thumb.getBoundingClientRect();
                const isNear = e.clientX >= thumbRect.left - proximity && e.clientY >= thumbRect.top - proximity && e.clientY <= thumbRect.bottom + proximity && e.clientX < window.innerWidth - 2;
                thumb.classList.toggle('is-near', isNear);
                ticking = false;
            });
            ticking = true;
        }
    });
});

/* Autocomplete Search Suggestions Logic */
document.addEventListener('galleryLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const galleryItems = document.querySelectorAll('#photo-gallery figure img');

    if (!searchInput || !suggestionsContainer || galleryItems.length === 0) return;

    const getSearchQuery = () => {
        const pills = [];
        let textContent = '';
        searchInput.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('pill')) {
                pills.push({ type: node.dataset.type, value: node.dataset.value });
            } else if (node.nodeType === Node.TEXT_NODE) {
                textContent += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'DIV' || node.tagName === 'BR')) {
                textContent += ' ' + node.textContent;
            }
        });
        return { text: textContent.replace(/\s+/g, ' ').trim(), pills };
    };

    const searchTerms = new Set();
    galleryItems.forEach(img => {
        const sources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew, img.dataset.characters];
        sources.forEach(source => {
            if (source) source.split(',').forEach(term => { if (term.trim()) searchTerms.add(term.trim()); });
        });
    });
    const sortedSearchTerms = Array.from(searchTerms).sort((a, b) => a.localeCompare(b));
    let activeSuggestionIndex = -1;

    function updateSuggestions() {
        const query = getSearchQuery().text.toLowerCase();
        suggestionsContainer.innerHTML = '';
        activeSuggestionIndex = -1;

        const existingPillValues = new Set(getSearchQuery().pills.map(p => p.value.toLowerCase()));

        if (query.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const matches = sortedSearchTerms.filter(term => {
            const termLower = term.toLowerCase();
            return termLower.startsWith(query) && !existingPillValues.has(termLower);
        }).slice(0, 7);

        if (matches.length > 0) {
            matches.forEach((term, index) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = term;
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

    function selectSuggestion(value) {
        window.insertPill('tag', value);
        updateSuggestions();
        suggestionsContainer.style.display = 'none';
    }

    function updateActiveSuggestion(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeSuggestionIndex);
            if (index === activeSuggestionIndex) item.scrollIntoView({ block: 'nearest' });
        });
    }

    searchInput.addEventListener('input', updateSuggestions);

    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch (e.key) {
            case 'ArrowDown':
                if (items.length > 0) {
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
                    updateActiveSuggestion(items);
                }
                break;
            case 'ArrowUp':
                if (items.length > 0) {
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
                    updateActiveSuggestion(items);
                }
                break;
            case 'Enter':
                e.preventDefault();
                searchInput.dispatchEvent(new CustomEvent('submitSearch'));
                break;
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
            case 'Backspace': {
                const selection = window.getSelection();
                if (selection.isCollapsed && selection.anchorOffset === 0) {
                    const previousSibling = selection.anchorNode.previousSibling;
                    if (previousSibling && previousSibling.nodeType === Node.ELEMENT_NODE && previousSibling.classList.contains('pill')) {
                        previousSibling.remove();
                        e.preventDefault();
                    }
                }
                break;
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Make insertPill globally available for the autocomplete logic
    window.insertPill = (type, value) => {
        const event = new CustomEvent('insertPill', { detail: { type, value } });
        document.dispatchEvent(event);
    };

    document.addEventListener('insertPill', (e) => {
        const { type, value } = e.detail;
        const editor = document.getElementById('search-input');
        editor.focus();
        
        const sanitizedValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        const pillHTML = `
            <span class="pill" contenteditable="false" data-type="${type}" data-value="${sanitizedValue}">
                ${sanitizedValue}
                <span class="remove-pill" onclick="this.parentNode.remove()">&times;</span>
            </span>&nbsp;`;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        let range = selection.getRangeAt(0);
        let textNode = selection.anchorNode;

        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const currentText = textNode.textContent;
            const queryText = getSearchQuery().text.toLowerCase();
            const lastWordIndex = currentText.toLowerCase().lastIndexOf(queryText);
            if (lastWordIndex !== -1) {
                range.setStart(textNode, lastWordIndex);
                range.setEnd(textNode, lastWordIndex + queryText.length);
            }
        }
        range.deleteContents();

        const fragment = document.createRange().createContextualFragment(pillHTML);
        const lastNode = fragment.lastChild;
        range.insertNode(fragment);
        
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        editor.dispatchEvent(new Event('input', { bubbles: true }));
    });
});

/* Copy Filenames on Ctrl+C */
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const searchInput = document.getElementById('search-input');
        const modal = document.getElementById('image-modal');

        if (document.activeElement === searchInput || (modal && modal.classList.contains('is-visible'))) return;

        const selectedFigures = document.querySelectorAll('#photo-gallery figure.selected');
        if (selectedFigures.length === 0) return;
        
        e.preventDefault();
        const filenames = Array.from(selectedFigures).map(figure => figure.querySelector('img')?.dataset.filename).filter(Boolean);
        if (filenames.length > 0) {
            navigator.clipboard.writeText(filenames.join(' ')).catch(err => console.error('Could not copy filenames.', err));
        }
    }
});
