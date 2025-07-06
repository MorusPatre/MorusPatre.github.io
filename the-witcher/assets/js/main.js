const PROXY_URL = 'https://working-witcher.witcherarchive.workers.dev?url=';

async function downloadImage(url, filename) {
    try {
        // We now fetch from our proxy, passing the original URL as a parameter
        const response = await fetch(PROXY_URL + encodeURIComponent(url));
        
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const blob = await response.blob();
        saveAs(blob, filename || 'download');
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Could not download the image. It will open in a new tab for you to save manually.`);
        window.open(url, '_blank');
    }
}

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const blob = await response.blob();
        saveAs(blob, filename || 'download');
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Could not download the image. It will open in a new tab for you to save manually.`);
        window.open(url, '_blank');
    }
}

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

    // Play initial animations on page load.
        $window.on('load', function() {
            window.setTimeout(function() {
                $body.removeClass('is-preload');
            }, 100);
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
    const searchInput = document.getElementById('search-input'); // MOVED

    if (!gallery || !wrapper) return;

    const marquee = document.getElementById('marquee');
    const items = gallery.getElementsByTagName('figure');

    let selectedItems = new Set();
    let isMarquee = false;
    let startPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();

    let hasDragged = false;
    let mouseDownItem = null;

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

        // NEW: If the mouse moves over the footer, stop the marquee selection
        if (footer.contains(e.target)) {
            isMarquee = false;
            hasDragged = false;
            marquee.style.visibility = 'hidden';
            marquee.style.width = '0px';
            marquee.style.height = '0px';
            preMarqueeSelectedItems.clear();
            return;
        }
        
        e.preventDefault();
        hasDragged = true;
        
        marquee.style.visibility = 'visible';
        
        const galleryRect = gallery.getBoundingClientRect();
        let rawX = e.clientX - galleryRect.left;
        let rawY = e.clientY - galleryRect.top;
        let currentX = Math.max(0, Math.min(rawX, galleryRect.width));
        let currentY = Math.max(0, Math.min(rawY, galleryRect.height));
        
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
    
    /**
     * ----------------------------------------------------------------
     * Custom Right-Click Context Menu Logic
     * ----------------------------------------------------------------
     */
    const itemContextMenu = document.getElementById('custom-context-menu');
    const galleryContextMenu = document.getElementById('gallery-context-menu');
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
    
    itemContextMenu.addEventListener('click', (e) => {
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
                if (selectedItems.size > 1) {
                    // ZIP DOWNLOAD LOGIC
                    document.body.style.cursor = 'wait';
                    const zip = new JSZip();
                    const promises = [];

                    for (const figure of selectedItems) {
                        const itemImg = figure.querySelector('img');
                        const itemSrc = itemImg.dataset.fullsrc;
                        const itemFilename = figure.querySelector('figcaption').childNodes[0].nodeValue.trim();
                        
                        if (itemSrc) {
                            const promise = fetch(itemSrc)
                                .then(response => {
                                    if (!response.ok) throw new Error(`Fetch failed for ${itemFilename}: ${response.statusText}`);
                                    return response.blob();
                                })
                                .then(blob => {
                                    if (blob) zip.file(itemFilename, blob);
                                })
                                .catch(error => {
                                    console.error(error);
                                    alert(`Could not download: ${itemFilename}\nReason: ${error.message}`);
                                });
                            promises.push(promise);
                        }
                    }

                    Promise.all(promises).then(() => {
                        zip.generateAsync({ type: "blob" }).then(content => {
                            if (typeof saveAs !== 'undefined') {
                                saveAs(content, "witcher_images.zip");
                            } else {
                                console.error("FileSaver.js (saveAs) is not loaded.");
                            }
                            document.body.style.cursor = 'default';
                        }).catch(zipError => {
                            console.error("Error generating zip file:", zipError);
                            document.body.style.cursor = 'default';
                        });
                    });
                } else {
                    // SINGLE IMAGE DOWNLOAD LOGIC
                    const img = primaryTarget.querySelector('img');
                    const fullSrc = img.dataset.fullsrc;
                    const filename = primaryTarget.querySelector('figcaption').childNodes[0].nodeValue.trim();
                    if (fullSrc && filename) {
                        downloadImage(fullSrc, filename);
                    }
                }
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
                alert('Functionality for "Add Image" is not yet implemented.');
                break;
            case 'gallery-context-sort':
                alert('Functionality for "Sort By" is not yet implemented.');
                break;
            case 'gallery-context-view':
                alert('Functionality for "Show View Options" is not yet implemented.');
                break;
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
