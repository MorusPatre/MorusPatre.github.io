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

    /*
    ==================================================================
    // START: SEARCH LOGIC
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

        const phraseRegex = /\b(s\d+e\d+|season\s*\d+|episode\s*\d+|s\d+|e\d+)\b/g;
        const phraseTerms = originalQuery.match(phraseRegex) || [];
        const remainingText = originalQuery.replace(phraseRegex, '').trim();
        const wordTerms = remainingText.split(' ').filter(term => term.length > 0);
        const searchTerms = [...phraseTerms, ...wordTerms];

        galleryItems.forEach(function(item) {
            const img = item.querySelector('img');
            if (!img || !img.dataset.search) {
                item.style.display = 'none';
                return;
            }

            const searchData = img.dataset.search.toLowerCase();
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
    // START: FINDER-STYLE NAVIGATION AND SELECTION LOGIC
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
        const itemsToSelect = new Set(visibleItems.slice(start, end + 1));
        
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
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
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
    const galleryObserver = new ResizeObserver(calculateGridMetrics);
    galleryObserver.observe(gallery);
    if (searchInput) searchInput.addEventListener('keyup', () => setTimeout(calculateGridMetrics, 50));
    
    const isSelected = (el) => selectedItems.has(el);
    const toggleSelection = (el) => { isSelected(el) ? selectedItems.delete(el) : selectedItems.add(el); el.classList.toggle('selected'); };
    const clearSelection = () => { selectedItems.forEach(item => item.classList.remove('selected')); selectedItems.clear(); };
    const setSelection = (el, shouldBeSelected) => { shouldBeSelected ? (isSelected(el) || toggleSelection(el)) : (isSelected(el) && toggleSelection(el)); };
    
    wrapper.addEventListener('mousedown', (e) => {
        if (e.target === searchInput || e.button !== 0 || header.contains(e.target) || footer.contains(e.target)) return;
        if(gallery.contains(e.target) || e.target === gallery) { e.preventDefault(); if (searchInput) searchInput.blur(); }
        hasDragged = false; isMarquee = true; mouseDownItem = e.target.closest('figure');
        const galleryRect = gallery.getBoundingClientRect();
        startPos = { x: e.clientX - galleryRect.left, y: e.clientY - galleryRect.top };
        preMarqueeSelectedItems = new Set(selectedItems);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isMarquee) return;
        if (footer.contains(e.target)) { isMarquee = false; hasDragged = false; marquee.style.visibility = 'hidden'; return; }
        e.preventDefault(); hasDragged = true; marquee.style.visibility = 'visible';
        const galleryRect = gallery.getBoundingClientRect();
        let currentX = Math.max(0, Math.min(e.clientX - galleryRect.left, galleryRect.width));
        let currentY = Math.max(0, Math.min(e.clientY - galleryRect.top, galleryRect.height));
        const marqueeRect = { x: Math.min(startPos.x, currentX), y: Math.min(startPos.y, currentY), w: Math.abs(startPos.x - currentX), h: Math.abs(startPos.y - currentY) };
        Object.assign(marquee.style, { left: `${marqueeRect.x}px`, top: `${marqueeRect.y}px`, width: `${marqueeRect.w}px`, height: `${marqueeRect.h}px` });
        
        for (const item of items) {
            if (item.style.display === 'none') continue;
            const itemRect = item.getBoundingClientRect();
            const relativeItemRect = { left: itemRect.left - galleryRect.left, top: itemRect.top - galleryRect.top, right: itemRect.right - galleryRect.left, bottom: itemRect.bottom - galleryRect.top };
            const intersects = marqueeRect.x < relativeItemRect.right && marqueeRect.x + marqueeRect.w > relativeItemRect.left && marqueeRect.y < relativeItemRect.bottom && marqueeRect.y + marqueeRect.h > relativeItemRect.top;
            setSelection(item, (e.metaKey || e.ctrlKey || e.shiftKey) ? (intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item)) : intersects);
        }
    });
    
    const endDragAction = (e) => {
        if (!isMarquee) return;
        if (!hasDragged) {
            const clickedOnItem = mouseDownItem;
            if (clickedOnItem) {
                if (e.shiftKey || e.metaKey || e.ctrlKey) { toggleSelection(clickedOnItem); }
                else {
                    const wasSelected = isSelected(clickedOnItem) && selectedItems.size === 1;
                    clearSelection();
                    if (!wasSelected) toggleSelection(clickedOnItem);
                }
                selectionAnchor = lastSelectedItem = isSelected(clickedOnItem) ? clickedOnItem : null;
            } else if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { clearSelection(); selectionAnchor = lastSelectedItem = null; }
        }
        isMarquee = false; hasDragged = false; mouseDownItem = null; marquee.style.visibility = 'hidden';
    };
    document.addEventListener('mouseup', endDragAction);
    
    document.addEventListener('mousedown', (e) => {
        const itemMenu = document.getElementById('custom-context-menu');
        const galleryMenu = document.getElementById('gallery-context-menu');
        if (e.button === 0 && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target)) {
            itemMenu.style.display = 'none'; galleryMenu.style.display = 'none';
        }
        if (!wrapper.contains(e.target) && !itemMenu.contains(e.target) && !galleryMenu.contains(e.target) && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            clearSelection();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA'))) {
            e.preventDefault();
            Array.from(items).filter(item => item.style.display !== 'none').forEach(item => setSelection(item, true));
        }
    });

    /*
    ==================================================================
    // START: CUSTOM RIGHT-CLICK CONTEXT MENU LOGIC
    ==================================================================
    */

    const itemContextMenu = document.getElementById('custom-context-menu');
    const galleryContextMenu = document.getElementById('gallery-context-menu');
    let rightClickedItem = null;

    gallery.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const figure = e.target.closest('figure');
        itemContextMenu.style.display = 'none'; galleryContextMenu.style.display = 'none';
        
        if (figure) {
            rightClickedItem = figure;
            if (!selectedItems.has(figure)) { clearSelection(); toggleSelection(figure); selectionAnchor = lastSelectedItem = figure; }
            const saveMenuItem = document.getElementById('context-menu-save');
            saveMenuItem.textContent = selectedItems.size > 1 ? `Save ${selectedItems.size} Images as .zip` : 'Save Image to "Downloads"';
            Object.assign(itemContextMenu.style, { display: 'block', left: `${e.clientX}px`, top: `${e.clientY}px` });
        } else if (e.target === gallery) {
            rightClickedItem = null;
            Object.assign(galleryContextMenu.style, { display: 'block', left: `${e.clientX}px`, top: `${e.clientY}px` });
        }
    });
    
    itemContextMenu.addEventListener('click', (e) => {
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
                window.open(primaryTarget.querySelector('img').dataset.fullsrc, '_blank');
                break;
            case 'context-menu-save': {
                if (selectedItems.size > 1) {
                    document.body.style.cursor = 'wait';
                    const zip = new JSZip();
                    const promises = Array.from(selectedItems).map(figure => {
                        const img = figure.querySelector('img');
                        return fetch(img.dataset.fullsrc)
                            .then(response => response.ok ? response.blob() : Promise.reject(new Error(`Fetch failed: ${response.statusText}`)))
                            .then(blob => zip.file(img.dataset.filename || 'image.jpg', blob))
                            .catch(err => console.error(`Failed to add ${img.dataset.filename} to zip:`, err));
                    });

                    Promise.all(promises).then(() => {
                        zip.generateAsync({ type: "blob" }).then(content => {
                            saveAs(content, "house_of_the_dragon_images.zip");
                            document.body.style.cursor = 'default';
                        });
                    });
                } else {
                    // --- MODIFICATION: Use robust dataset.filename for single download ---
                    const img = primaryTarget.querySelector('img');
                    downloadImage(img.dataset.fullsrc, img.dataset.filename);
                }
                break;
            }
        }
        rightClickedItem = null;
    });

    galleryContextMenu.addEventListener('click', (e) => {
        galleryContextMenu.style.display = 'none';
        // Placeholder for future actions
    });

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
    let currentImageIndex = -1;

    const KEY_TO_LABEL_MAP = {
        season: 'Season', episode: 'Episode', cast: 'Cast', crew: 'Crew',
        castAndCrew: 'Cast & Crew', characters: 'Characters'
    };
    const primaryKeys = ['season', 'episode', 'cast', 'crew', 'castAndCrew', 'characters'];

    function showImage(index) {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        if (index < 0 || index >= visibleFigures.length) return;
        currentImageIndex = index;
        const figure = visibleFigures[currentImageIndex];
        const img = figure.querySelector('img');

        // --- MODIFICATION: Progressive image loading restored ---
        modalImg.src = img.src; // Show thumbnail immediately
        const highResImage = new Image();
        highResImage.src = img.dataset.fullsrc;
        highResImage.onload = () => { modalImg.src = highResImage.src; };
        // ---
        
        modalImg.alt = img.alt;
        modalFilename.textContent = img.dataset.filename;

        let primaryHTML = '<dl class="info-grid">';
        let detailsHTML = '<dl class="info-grid">';
        const dataset = img.dataset;

        primaryKeys.forEach(key => {
            if (dataset[key] && dataset[key].trim()) {
                const label = KEY_TO_LABEL_MAP[key] || key;
                primaryHTML += `<div class="info-item"><dt>${label}</dt><dd>${dataset[key]}</dd></div>`;
            }
        });

        let hasDetails = false;
        const handledKeys = new Set(['search', 'fullsrc', 'filename', ...primaryKeys]);
        
        for (const key in dataset) {
            if (!handledKeys.has(key) && dataset[key] && dataset[key].trim()) {
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
        modalMetadata.innerHTML = primaryHTML + (hasDetails ? `<h4 class="metadata-header">Metadata</h4>${detailsHTML}` : '');
        
        downloadBtn.href = img.dataset.fullsrc;
        downloadBtn.download = img.dataset.filename || 'download.jpg';

        modal.classList.add('is-visible');
    }
    
    // --- MODIFICATION: Download button listener fixed ---
    downloadBtn.addEventListener('click', function(event) {
        event.preventDefault();
        downloadImage(this.href, this.download); // Use the button's own href and download attributes
    });

    function showNextImage() { const vis = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])')); showImage((currentImageIndex + 1) % vis.length); }
    function showPrevImage() { const vis = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])')); showImage((currentImageIndex - 1 + vis.length) % vis.length); }
    function hideModal() { modal.classList.remove('is-visible'); currentImageIndex = -1; setTimeout(() => { modalImg.src = ""; }, 250); }
    
    gallery.addEventListener('dblclick', e => { const fig = e.target.closest('figure'); if(fig) { const vis = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])')); const idx = vis.indexOf(fig); if (idx > -1) showImage(idx); } });
    closeModal.addEventListener('click', hideModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    document.addEventListener('keydown', (e) => { if (modal.classList.contains('is-visible')) { if (e.key === 'Escape') hideModal(); if (e.key === 'ArrowRight') showNextImage(); if (e.key === 'ArrowLeft') showPrevImage(); } });
});

/*
==================================================================
// Autocomplete Search Suggestions Logic
==================================================================
*/
document.addEventListener('galleryLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestions-container';
    searchInput.parentNode.appendChild(suggestionsContainer);

    const galleryItems = document.querySelectorAll('#photo-gallery figure img');
    if (!searchInput || galleryItems.length === 0) return;

    // Build a unique, sorted list of searchable terms.
    const searchTerms = new Set();
    galleryItems.forEach(img => {
        // --- MODIFICATION: Check for new data attributes: cast, crew, and castAndCrew ---
        const peopleSources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew];
        peopleSources.forEach(source => {
            if (source) {
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

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        if (query.length < 2) return;

        const matches = sortedSearchTerms.filter(term => term.toLowerCase().includes(query));
        
        matches.slice(0, 10).forEach(term => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = term;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = term;
                suggestionsContainer.innerHTML = '';
                const keyupEvent = new Event('keyup', { bubbles: true });
                searchInput.dispatchEvent(keyupEvent);
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});
