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
    // START: CONTENTEDITABLE EDITOR LOGIC
    // =================================================================
    const editor = document.getElementById('search-input');
    const searchForm = editor.closest('form');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const clearSearchBtn = document.getElementById('clear-search');

    if (!editor || !searchForm) return;

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
    
    /**
     * Checks if the editor is empty and toggles a class to show/hide the placeholder.
     */
    const updatePlaceholderVisibility = () => {
        const query = getSearchQuery();
        const isEffectivelyEmpty = query.text === '' && query.pills.length === 0;

        if (isEffectivelyEmpty) {
            editor.classList.add('is-placeholder-visible');
        } else {
            editor.classList.remove('is-placeholder-visible');
        }
    };

    // --- Event Listeners for the Editor ---
    editor.addEventListener('input', () => {
        runSearch();
        updatePlaceholderVisibility();
    });
    
    editor.addEventListener('DOMNodeRemoved', (e) => {
        if (e.target.classList && e.target.classList.contains('pill')) {
            runSearch();
            updatePlaceholderVisibility();
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
        updatePlaceholderVisibility();
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

    // Set initial placeholder state
    updatePlaceholderVisibility();
    // =================================================================
    // END: CONTENTEDITABLE EDITOR LOGIC
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

    // --- FINDER-STYLE ARROW KEY NAVIGATION LOGIC ---
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
            if (item.offsetTop === firstItemTop) cols++;
            else break;
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
        const itemsToSelect = new Set(visibleItems.slice(start, end + 1));
        for(const item of visibleItems) {
            const shouldBeSelected = itemsToSelect.has(item);
            const isSelected = selectedItems.has(item);
            if (shouldBeSelected && !isSelected) {
                 item.classList.add('selected');
                 selectedItems.add(item);
            } else if (!shouldBeSelected && isSelected) {
                item.classList.remove('selected');
                selectedItems.delete(item);
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (document.activeElement.id === 'search-input') return;
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
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
                selectedItems.forEach(item => item.classList.remove('selected'));
                selectedItems.clear();
                selectedItems.add(newItem);
                newItem.classList.add('selected');
                selectionAnchor = newItem;
                lastSelectedItem = newItem;
            }
            newItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });

    calculateGridMetrics();
    const galleryObserver = new ResizeObserver(calculateGridMetrics);
    galleryObserver.observe(gallery);
    window.addEventListener('galleryFiltered', () => setTimeout(calculateGridMetrics, 50));

    // --- GALLERY SELECTION LOGIC ---
    const toggleSelection = (el) => {
        if (selectedItems.has(el)) {
            selectedItems.delete(el);
            el.classList.remove('selected');
        } else {
            selectedItems.add(el);
            el.classList.add('selected');
        }
    };
    const clearSelection = () => {
        selectedItems.forEach(item => item.classList.remove('selected'));
        selectedItems.clear();
    };
    
    function updateMarqueeAndSelection(clientX, clientY, isModifier) {
        marquee.style.visibility = 'visible';
        const galleryRect = gallery.getBoundingClientRect();
        const marqueeRect = {
            x: Math.min(startPos.x, clientX - galleryRect.left),
            y: Math.min(startPos.y, clientY - galleryRect.top),
            w: Math.abs(startPos.x - (clientX - galleryRect.left)),
            h: Math.abs(startPos.y - (clientY - galleryRect.top))
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
            const intersects = marqueeRect.x < relativeItemRect.right && marqueeRect.x + marqueeRect.w > relativeItemRect.left &&
                             marqueeRect.y < relativeItemRect.bottom && marqueeRect.y + marqueeRect.h > relativeItemRect.top;
            const shouldBeSelected = isModifier ? (intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item)) : intersects;
            const isItemSelected = selectedItems.has(item);
            if (shouldBeSelected && !isItemSelected) {
                item.classList.add('selected');
                selectedItems.add(item);
            } else if (!shouldBeSelected && isItemSelected) {
                item.classList.remove('selected');
                selectedItems.delete(item);
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
        if (editor.contains(e.target)) return;
        if (e.button !== 0 || header.contains(e.target) || footer.contains(e.target)) {
            isMarquee = false; 
            return;
        }
        if (gallery.contains(e.target) || e.target === gallery) {
            e.preventDefault();
            editor.blur();
        }
        hasDragged = false;
        isMarquee = true;
        mouseDownItem = e.target.closest('figure');
        const galleryRect = gallery.getBoundingClientRect();
        startPos = { x: e.clientX - galleryRect.left, y: e.clientY - galleryRect.top };
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
        const scrollThreshold = 60; 
        if (e.clientY > window.innerHeight - scrollThreshold) {
            scrollSpeedY = (e.clientY - (window.innerHeight - scrollThreshold)) / scrollThreshold * 28 + 2;
        } else if (e.clientY < scrollThreshold) {
            scrollSpeedY = -((scrollThreshold - e.clientY) / scrollThreshold * 28 + 2);
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

    document.addEventListener('mouseup', (e) => {
        isAutoScrolling = false;
        scrollSpeedY = 0;
        document.body.classList.remove('is-marquee-dragging');
        if (!isMarquee) return;
        if (!hasDragged) {
            const isModifier = e.metaKey || e.ctrlKey || e.shiftKey;
            const clickedOnItem = mouseDownItem;
            if (clickedOnItem) {
                if (isModifier) {
                    toggleSelection(clickedOnItem);
                } else {
                    if (!selectedItems.has(clickedOnItem) || selectedItems.size > 1) {
                        clearSelection();
                        toggleSelection(clickedOnItem);
                    } else {
                        clearSelection();
                    }
                }
                lastSelectedItem = selectedItems.has(clickedOnItem) ? clickedOnItem : null;
                selectionAnchor = lastSelectedItem;
            } else if (!isModifier) {
                clearSelection();
                lastSelectedItem = null;
                selectionAnchor = null;
            }
        }
        isMarquee = false;
        hasDragged = false;
        mouseDownItem = null;
        marquee.style.visibility = 'hidden';
        marquee.style.width = '0px';
        marquee.style.height = '0px';
        preMarqueeSelectedItems.clear();
    });

    document.addEventListener('mousedown', (e) => {
        const itemMenu = document.getElementById('custom-context-menu');
        const galleryMenu = document.getElementById('gallery-context-menu');
        if (e.button === 0 && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target)) {
            itemMenu.style.display = 'none';
            galleryMenu.style.display = 'none';
        }
        if (!wrapper.contains(e.target) && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target) && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            clearSelection();
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            if (document.activeElement.id === 'search-input') return;
            e.preventDefault();
            Array.from(items).filter(item => item.style.display !== 'none').forEach(item => {
                item.classList.add('selected');
                selectedItems.add(item);
            });
        }
    });

    // --- CONTEXT MENU & UPLOAD LOGIC ---
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
                selectionAnchor = lastSelectedItem = figure;
            }
            document.getElementById('context-menu-save').textContent = selectedItems.size > 1 ? `Save ${selectedItems.size} Images to "Downloads"` : 'Save Image to "Downloads"';
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

    itemContextMenu.addEventListener('click', async (e) => {
        const targetId = e.target.id;
        if (!targetId) return;
        itemContextMenu.style.display = 'none';
        const primaryTarget = rightClickedItem || Array.from(selectedItems)[0];
        if (!primaryTarget) return;
        switch (targetId) {
            case 'context-menu-open':
                primaryTarget.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
                break;
            case 'context-menu-open-tab':
                const img = primaryTarget.querySelector('img');
                if (img && img.dataset.fullsrc) window.open(img.dataset.fullsrc, '_blank');
                break;
            case 'context-menu-save':
                if (downloadAbortController) downloadAbortController.abort();
                downloadAbortController = new AbortController();
                const signal = downloadAbortController.signal;
                const progressCircle = indicator.querySelector('.progress-circle');
                indicator.classList.add('is-active', 'is-downloading');
                const updateProgress = (p) => progressCircle.style.setProperty('--progress-angle', `${p * 3.6}deg`);
                updateProgress(0);
                try {
                    const itemsToDownload = Array.from(selectedItems);
                    if (itemsToDownload.length === 0) break;
                    let totalSize = 0;
                    const parseSize = s => (s ? (v => (u => v * ({KB:1024, MB:1024*1024, GB:1024*1024*1024}[u]||1))(s.split(' ')[1]))(parseFloat(s.split(' ')[0])) : 0);
                    itemsToDownload.forEach(item => totalSize += parseSize(item.querySelector('img').dataset.size));
                    let downloaded = 0;
                    await Promise.all(itemsToDownload.map(async item => {
                        if (signal.aborted) throw new Error('AbortError');
                        const img = item.querySelector('img');
                        const url = img.dataset.fullsrc;
                        try {
                            const res = await fetch(url, { signal, cache: 'no-store' });
                            if (!res.ok) throw new Error(res.statusText);
                            const blob = await res.blob();
                            saveAs(blob, url.substring(url.lastIndexOf('/') + 1));
                            downloaded += blob.size;
                            updateProgress(totalSize > 0 ? (downloaded / totalSize) * 100 : 0);
                        } catch (err) { if (err.name !== 'AbortError') console.error(`Download failed for ${url}`, err); throw err; }
                    }));
                    updateProgress(100);
                } catch (err) { if (err.name !== 'AbortError') console.error("Download failed:", err); }
                finally {
                    setTimeout(() => {
                        indicator.classList.remove('is-active', 'is-downloading');
                        downloadAbortController = null;
                        setTimeout(() => updateProgress(0), 400);
                    }, 500);
                }
                break;
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
                    headers: { 'Content-Type': file.type, 'X-Custom-Filename': file.name }, body: file
                }).then(res => { if (!res.ok) throw new Error(`Upload failed for ${file.name}`); })));
                alert(`${files.length} image(s) uploaded successfully!`);
                location.reload(); 
            } catch (err) { alert(`An error occurred during upload: ${err.message}`); }
            finally { document.body.style.cursor = 'default'; event.target.value = ''; }
        });
    }

    // --- MODAL LOGIC ---
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
    let currentImageIndex = -1;

    const KEY_TO_LABEL_MAP = { season: 'Season', episode: 'Episode', cast: 'Cast', crew: 'Crew', castAndCrew: 'Cast & Crew', characters: 'Characters' };
    const primaryKeys = ['season', 'episode', 'cast', 'crew', 'castAndCrew', 'characters'];

    function showImage(index) {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        if (index < 0 || index >= visibleFigures.length) return;
        currentImageIndex = index;
        const img = visibleFigures[currentImageIndex].querySelector('img');
        downloadBtn.dataset.fullsrc = img.dataset.fullsrc; 
        modalImg.src = img.src; // Show thumb first
        const highRes = new Image();
        highRes.onload = () => { if (currentImageIndex === index) modalImg.src = highRes.src; };
        highRes.src = img.dataset.fullsrc; // Preload high-res
        modalImg.alt = img.alt;
        modalFilename.textContent = img.dataset.filename;
        let pHTML = '<dl class="info-grid">', dHTML = '<dl class="info-grid">';
        primaryKeys.forEach(k => { if (img.dataset[k] && !['-', '- (-)'].includes(img.dataset[k].trim())) pHTML += `<div class="info-item"><dt>${KEY_TO_LABEL_MAP[k]||k}</dt><dd>${img.dataset[k]}</dd></div>`; });
        let hasDetails = false;
        const handledKeys = ['search', 'fullsrc', 'filename', ...primaryKeys];
        for (const k in img.dataset) {
            if (!handledKeys.includes(k) && img.dataset[k] && img.dataset[k].trim() !== '-') {
                hasDetails = true;
                let label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                let value = img.dataset[k];
                if (label === 'Dimensions' && value.includes('×')) value = `${value.split('×')[0]}<span class="dimensions-x">×</span>${value.split('×')[1]}`;
                dHTML += `<div class="info-item"><dt>${label}</dt><dd>${value}</dd></div>`;
            }
        }
        modalMetadata.innerHTML = pHTML + '</dl>' + (hasDetails ? '<h4 class="metadata-header">Metadata</h4>' + dHTML + '</dl>' : '');
        modal.classList.add('is-visible');
        document.body.classList.add('is-article-visible');
    }

    downloadBtn.addEventListener('click', async (event) => {
        event.preventDefault(); event.stopPropagation();
        const url = event.currentTarget.dataset.fullsrc; 
        if (!url) return;
        const buttonText = downloadBtn.textContent;
        try {
            downloadBtn.textContent = 'Downloading...'; downloadBtn.disabled = true;
            const blob = await fetchImageBlob(url);
            saveAs(blob, modalFilename.textContent || url.split('/').pop());
        } catch (error) { console.error("Modal download failed:", error); } 
        finally { setTimeout(() => { downloadBtn.textContent = buttonText; downloadBtn.disabled = false; }, 1000); }
    });

    const getVisibleFigures = () => Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
    const showNextImage = () => showImage((currentImageIndex + 1) % getVisibleFigures().length);
    const showPrevImage = () => showImage((currentImageIndex - 1 + getVisibleFigures().length) % getVisibleFigures().length);

    gallery.addEventListener('dblclick', e => {
        const figure = e.target.closest('figure');
        if (!figure) return;
        const index = getVisibleFigures().indexOf(figure);
        if (index > -1) showImage(index);
    });

    function hideModal() {
        modal.classList.remove('is-visible');
        document.body.classList.remove('is-article-visible');
        currentImageIndex = -1;
        setTimeout(() => { modalImg.src = ""; modalFilename.textContent = ""; modalMetadata.innerHTML = ""; }, 250);
    }
    
    modalContent.addEventListener('click', e => e.stopPropagation());
    closeModal.addEventListener('click', hideModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    modal.addEventListener('click', hideModal);

    document.addEventListener('keydown', e => {
        if (modal.classList.contains('is-visible')) {
            if (e.key === 'Escape') hideModal();
            else if (e.key === 'ArrowRight') showNextImage();
            else if (e.key === 'ArrowLeft') showPrevImage();
        }
    });

    imageContainer.addEventListener('mousedown', e => { if (e.button === 0) document.body.classList.add('is-selecting-text'); });
    infoPanel.addEventListener('mousedown', e => { if (e.button === 0) { document.body.classList.add('is-selecting-text'); if (e.target.closest('.info-item, #modal-filename, .metadata-header')) e.target.classList.add('selection-active'); } });
    document.addEventListener('mouseup', () => { document.body.classList.remove('is-selecting-text'); document.querySelector('.selection-active')?.classList.remove('selection-active'); });
});

/* Custom Scrollbar */
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
        const thumbPosition = (window.scrollY / (scrollableHeight - viewportHeight)) * (track.offsetHeight - thumb.offsetHeight);
        thumb.style.transform = `translateY(${thumbPosition}px)`;
    }

    function setupScrollbar() {
        const headerHeight = header.offsetHeight;
        const scrollableHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        track.style.display = (scrollableHeight <= viewportHeight) ? 'none' : 'block';
        track.style.top = `${headerHeight}px`;
        track.style.height = `calc(100% - ${headerHeight}px)`;
        thumb.style.height = `${Math.max((viewportHeight / scrollableHeight) * track.offsetHeight, 20)}px`;
        updateThumbPosition();
    }

    document.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(() => { updateThumbPosition(); ticking = false; }); ticking = true; } });
    thumb.addEventListener('mousedown', e => {
        e.preventDefault();
        const startY = e.clientY, startScrollTop = document.documentElement.scrollTop;
        const onMouseMove = e => {
            const deltaY = e.clientY - startY;
            const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
            const trackRange = track.offsetHeight - thumb.offsetHeight;
            if (trackRange > 0) window.scrollTo(0, startScrollTop + (deltaY / trackRange) * scrollRange);
        };
        const onMouseUp = () => document.removeEventListener('mousemove', onMouseMove) || document.removeEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    ['resize', 'load', 'orientationchange', 'galleryFiltered'].forEach(e => window.addEventListener(e, setupScrollbar));
    setupScrollbar();
    setTimeout(setupScrollbar, 500);
});

/* Scrollbar Proximity Effect */
document.addEventListener('DOMContentLoaded', () => {
    const thumb = document.getElementById('custom-scrollbar-thumb');
    if (!thumb) return;
    let ticking = false;
    document.addEventListener('mousemove', e => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const thumbRect = thumb.getBoundingClientRect();
                thumb.classList.toggle('is-near', e.clientX >= thumbRect.left - 30 && e.clientY >= thumbRect.top - 30 && e.clientY <= thumbRect.bottom + 30 && e.clientX < window.innerWidth - 2);
                ticking = false;
            });
            ticking = true;
        }
    });
});

/* Autocomplete Search Suggestions Logic */
document.addEventListener('galleryLoaded', () => {
    const editor = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const galleryItems = document.querySelectorAll('#photo-gallery figure img');
    if (!editor || !suggestionsContainer || galleryItems.length === 0) return;

    // This is a helper function to avoid duplicating code.
    const getSearchQuery = () => {
        const pills = [];
        let textContent = '';
        editor.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('pill')) {
                pills.push({ type: node.dataset.type, value: node.dataset.value });
            } else if (node.nodeType === Node.TEXT_NODE) {
                textContent += node.textContent;
            }
        });
        return { text: textContent.replace(/\s+/g, ' ').trim(), pills };
    };

    const searchTerms = new Set();
    galleryItems.forEach(img => {
        [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew, img.dataset.characters].forEach(source => {
            if (source) source.split(',').forEach(term => { if (term.trim()) searchTerms.add(term.trim()); });
        });
    });
    const sortedSearchTerms = Array.from(searchTerms).sort((a, b) => a.localeCompare(b));
    let activeSuggestionIndex = -1;

    function updateSuggestions() {
        const query = getSearchQuery().text.toLowerCase();
        suggestionsContainer.innerHTML = '';
        activeSuggestionIndex = -1;
        if (query.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        const existingPillValues = new Set(getSearchQuery().pills.map(p => p.value.toLowerCase()));
        const matches = sortedSearchTerms.filter(term => term.toLowerCase().startsWith(query) && !existingPillValues.has(term.toLowerCase())).slice(0, 7);
        if (matches.length > 0) {
            matches.forEach(term => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = term;
                item.addEventListener('mousedown', e => {
                    e.preventDefault();

                    // This is the fix: It stops the click event from bubbling up to the wrapper
                    // and incorrectly starting a marquee selection.
                    e.stopPropagation();

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
        // This is now the primary way to insert a pill from autocomplete
        document.dispatchEvent(new CustomEvent('insertPill', { detail: { type: 'tag', value } }));
        updateSuggestions();
        suggestionsContainer.style.display = 'none';
    }

    function updateActiveSuggestion(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeSuggestionIndex);
            if (index === activeSuggestionIndex) item.scrollIntoView({ block: 'nearest' });
        });
    }

    editor.addEventListener('input', updateSuggestions);
    editor.addEventListener('keydown', e => {
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        switch (e.key) {
            case 'ArrowDown':
                if (items.length > 0) { e.preventDefault(); activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length; updateActiveSuggestion(items); }
                break;
            case 'ArrowUp':
                if (items.length > 0) { e.preventDefault(); activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length; updateActiveSuggestion(items); }
                break;
            case 'Enter':
                e.preventDefault();
                editor.dispatchEvent(new CustomEvent('submitSearch'));
                break;
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
            case 'Backspace':
                const sel = window.getSelection();
                if (sel.isCollapsed && sel.anchorOffset === 0 && sel.anchorNode.previousSibling?.classList.contains('pill')) {
                    sel.anchorNode.previousSibling.remove();
                    e.preventDefault();
                }
                break;
        }
    });

    document.addEventListener('click', e => {
        if (!editor.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Event listener to handle pill insertion requests
    document.addEventListener('insertPill', (e) => {
        const { type, value } = e.detail;
        const sanitizedValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const pillHTML = `<span class="pill" contenteditable="false" data-type="${type}" data-value="${sanitizedValue}">${sanitizedValue}<span class="remove-pill" onclick="this.parentNode.remove()">&times;</span></span>\u200B`;
        
        editor.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        let range = selection.getRangeAt(0);
        let textNode = selection.anchorNode;
        // Logic to replace the typed text with the new pill
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
        editor.scrollLeft = editor.scrollWidth;
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
        const filenames = Array.from(selectedFigures).map(f => f.querySelector('img')?.dataset.filename).filter(Boolean);
        if (filenames.length > 0) navigator.clipboard.writeText(filenames.join('\n')).catch(err => console.error('Could not copy filenames.', err));
    }
});
