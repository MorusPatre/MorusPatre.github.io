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

const galleryFilters = {
    searchTerms: [],
    sidebar: {
        season: 'all',
        episode: 'all',
        person: 'all',
        // Set while the sidebar's "All People…" node is open: the names picked
        // in its column, and whether an image needs all of them or any one.
        allPeople: null
    }
};

window.galleryFilters = galleryFilters;

function simplifyGallerySearchText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildGallerySearchTerms(text) {
    const simplifiedQuery = simplifyGallerySearchText(text.toLowerCase());
    const phraseRegex = /\b(s\d+e\d+|season\s*\d+|episode\s*\d+|s\d+|e\d+)\b/g;
    const phraseTerms = simplifiedQuery.match(phraseRegex) || [];
    const remainingText = simplifiedQuery.replace(phraseRegex, '').trim();
    const wordTerms = remainingText.split(' ').filter(term => term.length > 0);

    return [...phraseTerms, ...wordTerms];
}

function normalizeGalleryFilterValue(value) {
    return String(value || '').trim().toLowerCase();
}

function matchesGalleryNumberFilter(actual, expected) {
    return expected === 'all' || Number(actual) === Number(expected);
}

function matchesGalleryPersonFilter(img, selectedPerson) {
    if (selectedPerson === 'all') return true;

    const normalizedPerson = normalizeGalleryFilterValue(selectedPerson);
    const sources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew];

    return sources.some(source => {
        if (!source) return false;

        return source.split(',').some(name => normalizeGalleryFilterValue(name) === normalizedPerson);
    });
}

const galleryImagePeopleCache = new WeakMap();

// Every name an image credits (cast, crew, cast & crew), as written.
function getGalleryImagePeople(img) {
    let people = galleryImagePeopleCache.get(img);

    if (!people) {
        people = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew]
            .flatMap(source => (source || '').split(','))
            .map(name => name.trim())
            .filter(name => name.length > 0);
        galleryImagePeopleCache.set(img, people);
    }

    return people;
}

// Case and accents don't make another person, as Binder folds tag names.
function foldGalleryPersonName(name) {
    return simplifyGallerySearchText(normalizeGalleryFilterValue(name));
}

function matchesGalleryAllPeopleFilter(img, allPeople) {
    // Nothing picked yet: everyone, as the sidebar's old "All people" row showed.
    if (allPeople.names.length === 0) return true;

    const imagePeople = new Set(getGalleryImagePeople(img).map(foldGalleryPersonName));
    const isCredited = name => imagePeople.has(foldGalleryPersonName(name));

    return allPeople.matchAny ? allPeople.names.some(isCredited) : allPeople.names.every(isCredited);
}

function applyGalleryFilters(options = {}) {
    const gallery = document.getElementById('photo-gallery');
    if (!gallery) return;

    const state = window.galleryFilters || galleryFilters;
    const sidebar = state.sidebar || galleryFilters.sidebar;
    const searchTerms = state.searchTerms || [];
    const galleryItems = gallery.querySelectorAll('figure');

    galleryItems.forEach(item => {
        const img = item.querySelector('img');

        if (!img) {
            item.style.display = 'none';
            return;
        }

        const searchData = simplifyGallerySearchText((img.dataset.search || '').toLowerCase());
        const matchesSearch = searchTerms.every(term => searchData.includes(term));
        const matchesSidebar =
            matchesGalleryNumberFilter(img.dataset.season, sidebar.season || 'all') &&
            matchesGalleryNumberFilter(img.dataset.episode, sidebar.episode || 'all') &&
            (sidebar.allPeople
                ? matchesGalleryAllPeopleFilter(img, sidebar.allPeople)
                : matchesGalleryPersonFilter(img, sidebar.person || 'all'));

        item.style.display = matchesSearch && matchesSidebar ? 'flex' : 'none';
    });

    if (options.scroll) {
        window.scrollTo(0, 0);
    }

    window.dispatchEvent(new CustomEvent('galleryFiltered'));
}

window.applyGalleryFilters = applyGalleryFilters;

// Each page sets its own placeholder in index.html; remember it before pills clear it.
function getDefaultSearchPlaceholder(searchInput) {
    if (searchInput.dataset.defaultPlaceholder === undefined) {
        searchInput.dataset.defaultPlaceholder = searchInput.placeholder;
    }
    return searchInput.dataset.defaultPlaceholder;
}


document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    const sidebar = document.getElementById('finder-sidebar');
    const searchInput = document.getElementById('search-input');
    getDefaultSearchPlaceholder(searchInput);
    
    // =================================================================
    // START: MODIFIED SEARCH AND AUTOCOMPLETE LOGIC
    // =================================================================
    const searchWrapper = document.getElementById('search-wrapper');
    const clearSearchBtn = document.getElementById('clear-search');

    // Make the entire wrapper focus the input field when clicked
    if (searchWrapper) {
        searchWrapper.addEventListener('click', () => {
            searchInput.focus();
        });
    }

    // Add/remove focus class to the wrapper for styling
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchWrapper.classList.add('is-focused');
        });
        searchInput.addEventListener('blur', () => {
            searchWrapper.classList.remove('is-focused');
        });
    }

    // This is the core function that filters the gallery
    function runSearch() {
        // Build the query string from pills and the current input value
        const pills = searchWrapper.querySelectorAll('.search-pill');
        let pillQueries = [];
        pills.forEach(pill => {
            pillQueries.push(pill.dataset.value);
        });
        
        const fullQueryText = pillQueries.join(' ') + ' ' + searchInput.value;

        // Show/hide clear button based on whether there's any query
        if (fullQueryText.trim().length > 0) {
            clearSearchBtn.style.display = 'block';
            searchWrapper.style.paddingRight = '30px';
        } else {
            clearSearchBtn.style.display = 'none';
            searchWrapper.style.paddingRight = '';
        }
        
        galleryFilters.searchTerms = buildGallerySearchTerms(fullQueryText);

        // If there are pills, hide the placeholder
        if (pills.length > 0) {
            searchInput.placeholder = '';
        } else {
            searchInput.placeholder = getDefaultSearchPlaceholder(searchInput);
        }

        applyGalleryFilters({ scroll: true });
    }

    // Original search input listener, now just calls runSearch
    searchInput.addEventListener('keyup', runSearch);

    // Update clear button to remove pills too
    clearSearchBtn.addEventListener('click', function() {
        const pills = searchWrapper.querySelectorAll('.search-pill');
        pills.forEach(pill => pill.remove());
        searchInput.value = '';
        runSearch(); // Update display and placeholder
        searchInput.focus();
    });

    // =================================================================
    // END: MODIFIED SEARCH AND AUTOCOMPLETE LOGIC
    // =================================================================


    if (!gallery || !wrapper) return;

    const marquee = document.getElementById('marquee');
    const marqueeGutterHighlight = document.getElementById('marquee-gutter-highlight');
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

    // --- Auto-scroll state variables ---
    let isAutoScrolling = false;
    let scrollSpeedY = 0;
    let scrollSpeedX = 0;
    let hasAutoScrolledUpDuringMarquee = false;
    let marqueeStartScrollY = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let lastClientModifierKey = false;
    let marqueeItemRects = null;


    // Attach a single, permanent listener to the cancel button
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

    // --- State Variables for Navigation ---
    let selectionAnchor = null; // For range selections (Shift key)
    let lastSelectedItem = null; // The currently "focused" item for keyboard navigation
    let gridMetrics = { cols: 0, rows: 0 }; // Columns, and items down a column when the gallery runs sideways

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

        const firstItemLeft = visibleItems[0].offsetLeft;
        let rows = 0;
        for (const item of visibleItems) {
            if (item.offsetLeft === firstItemLeft) {
                rows++;
            } else {
                break;
            }
        }
        gridMetrics.rows = rows > 0 ? rows : 1;
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
        // MODIFIED: Also check for selected pills
        const activeEl = document.activeElement;
        const isSearchActive = (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) || searchWrapper.querySelector('.search-pill.selected');
        
        if (isSearchActive) {
            return;
        }

        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return;
        }

        e.preventDefault(); // Prevent page scrolling

        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) return;

        let currentIndex = lastSelectedItem ? visibleItems.indexOf(lastSelectedItem) : -1;
        let newIndex = -1;

        if (currentIndex === -1) {
             if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                newIndex = 0;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                newIndex = visibleItems.length -1;
            }
        } else {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    // Sideways, the items run down columns: left and right go
                    // a column over, and right into a short last column lands
                    // on its last item, as in Binder.
                    if (isGallerySideways()) {
                        const step = e.key === 'ArrowLeft' ? -gridMetrics.rows : gridMetrics.rows;
                        const last = visibleItems.length - 1;
                        newIndex = currentIndex + step;
                        if (newIndex > last && Math.floor(currentIndex / gridMetrics.rows) < Math.floor(last / gridMetrics.rows)) {
                            newIndex = last;
                        }
                    } else {
                        newIndex = currentIndex + (e.key === 'ArrowLeft' ? -1 : 1);
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    // Grouped, rows break at every group and a collapsed group
                    // is one row, so up and down go by where items are.
                    if (isGallerySideways()) {
                        newIndex = currentIndex + (e.key === 'ArrowUp' ? -1 : 1);
                    } else if (isGalleryGrouped()) {
                        newIndex = visibleItems.indexOf(getGroupedVerticalNeighbor(lastSelectedItem, e.key === 'ArrowUp' ? -1 : 1));
                    } else {
                        newIndex = currentIndex + (e.key === 'ArrowUp' ? -gridMetrics.cols : gridMetrics.cols);
                    }
                    break;
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

    // --- Icon Grid ---
    // Binder's icon grid, after Finder's (TIconCollectionViewKeepArrangedLayout):
    // as many cells as fit between the 4px side insets with 2px between them.
    // While they fill one row or less they stay packed left, as the stylesheet
    // lays them out. Past one row the spare width is spread into cols + 1 equal
    // gaps, each column's distance from its packed place floored to a whole
    // pixel by Finder's own loop, so neighbouring gaps can differ by a pixel.
    const ICON_GRID_INSET = 4;
    const ICON_GRID_MINIMUM_GAP = 2;
    const galleryWidthProbe = document.createElement('div');
    galleryWidthProbe.id = 'gallery-width-probe';
    galleryWidthProbe.setAttribute('aria-hidden', 'true');
    gallery.appendChild(galleryWidthProbe);
    let iconGridColumns = '';

    function layoutIconGrid() {
        const cellWidth = parseFloat(getComputedStyle(gallery).getPropertyValue('--cell-width'));
        const width = galleryWidthProbe.getBoundingClientRect().width;
        if (!(cellWidth > 0)) return;

        const pitch = cellWidth + ICON_GRID_MINIMUM_GAP;
        const cols = Math.max(1, Math.floor((width + ICON_GRID_MINIMUM_GAP) / pitch));
        let visibleCount = 0;
        // Grouped, each group lays out its own rows, packed left as Finder's
        // grouped grid is. Sideways, the columns fill down and are never
        // spread.
        if (!isGalleryGrouped() && !isGallerySideways()) {
            for (const item of items) {
                if (item.style.display !== 'none' && ++visibleCount > cols) break;
            }
        }

        // Each track ends at its cell's right edge, and the cell sits at the end.
        let columns = '';
        if (visibleCount > cols) {
            const spacing = Math.max(0, (width - cols * cellWidth) / (cols + 1));
            const tracks = [];
            let center = ICON_GRID_INSET + cellWidth * 0.5 + spacing;
            let trackStart = ICON_GRID_INSET;
            for (let col = 0; col < cols; col++) {
                const base = ICON_GRID_INSET + col * pitch;
                const right = base + Math.floor(center - (base + cellWidth * 0.5)) + cellWidth;
                tracks.push(`${right - trackStart}px`);
                trackStart = right;
                center += cellWidth + spacing;
            }
            columns = tracks.join(' ');
        }

        if (columns === iconGridColumns) return;
        iconGridColumns = columns;
        gallery.style.gridTemplateColumns = columns;
        gallery.style.columnGap = columns ? '0px' : '';
    }

    function refreshIconGrid() {
        layoutIconGrid();
        calculateGridMetrics();
        marqueeItemRects = null;
        if (isGalleryGrouped()) refreshGroupSections();
    }

    // --- Initial Setup and Observers ---

    refreshIconGrid();

    // The probe, not the gallery, is watched: justifying the grid can change
    // the gallery's height, and a size changed inside an observer's own
    // callback is only reported the frame after, as an error. The gallery
    // filling and its filters are what else moves the items.
    const galleryObserver = new ResizeObserver(refreshIconGrid);
    galleryObserver.observe(galleryWidthProbe);
    document.addEventListener('galleryLoaded', refreshIconGrid);
    window.addEventListener('galleryFiltered', refreshIconGrid);

    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            setTimeout(calculateGridMetrics, 50);
        });
    }

    // --- Group By ---
    // Binder's Group By, after Finder's grouped icon view. Each group is a
    // section: a 32px header with its title 19px in and "Show All (n)" or
    // "Show Less" 19px from the right, then 10px down to the first row, and
    // 2px from the last row to the next header. Grouped rows are packed left,
    // never justified. A collapsed group is one row holding all of its items,
    // scrolled sideways, and its button shows only when they need more than
    // one row; the count is the whole group's. The header of the group at the
    // top pins under the top bar until the next one pushes it out, fading as
    // it goes. Items keep the gallery's order within a group, and the groups
    // follow their key's own order, the group of images without a value last.
    // An image with several values shows in each of their groups, as Finder
    // shows a file in each of its tags' groups; Binder shows it only once.
    const GROUP_HEADER_HEIGHT = 32;
    const GROUP_ITEMS_TOP = 10;
    const GROUP_ITEMS_BOTTOM = 2;
    // A row runs on under the next header, where a selected name's glow reaches.
    const GROUP_ROW_OVERHANG = 20;
    const GROUP_BY_STORAGE_PREFIX = 'galleryGroupBy:';
    const GROUP_EXPANDED_STORAGE_PREFIX = 'galleryGroupExpanded:';
    // A scene number among the photographers' keywords: "SC14", "sc48pt".
    const SCENE_KEYWORD = /^(?:sc|scn|scene)[\s._#-]*0*(\d{1,3})[a-z]{0,3}$/i;
    const galleryStorageId = gallery.dataset.galleryId || location.pathname;
    const groupCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    const galleryContextMenuElement = document.getElementById('gallery-context-menu');
    const groupByMenuRow = document.getElementById('gallery-context-group');
    const groupByMenu = document.getElementById('gallery-group-by-menu');
    const sortByMenuRow = document.getElementById('gallery-context-sort');
    const sortByMenu = document.getElementById('gallery-sort-by-menu');
    const sidebarGroupByList = document.getElementById('sidebar-group-by-options');
    const viewOptionsGroupBy = document.getElementById('view-options-group-by');
    // Each page lists its show's episode titles, by season and episode.
    const galleryEpisodeTitles = (() => {
        const source = document.getElementById('gallery-episode-titles');
        try {
            return source ? JSON.parse(source.textContent) : {};
        } catch (error) {
            return {};
        }
    })();

    // None, then the keys, as Binder's menu separates them. A key is offered
    // only where some image has a value for it.
    const GROUP_BY_OPTIONS = [
        { key: 'none', label: 'None' },
        {
            key: 'episode',
            label: 'Episode',
            hasValue: img => Boolean(img.dataset.season || img.dataset.episode),
            buckets: getEpisodeGroupBuckets
        },
        {
            key: 'scene',
            label: 'Scene',
            hasValue: img => Boolean(img.dataset.scene) || getKeywordSceneNumbers(img).length > 0,
            buckets: getSceneGroupBuckets
        },
        {
            key: 'location',
            label: 'Location',
            hasValue: img => Boolean(img.dataset.location),
            buckets: img => getValueGroupBuckets('location', splitGroupValues(img.dataset.location), 'No Location')
        },
        {
            key: 'character',
            label: 'Character',
            hasValue: img => Boolean(img.dataset.characters),
            buckets: img => getValueGroupBuckets('character', splitGroupValues(img.dataset.characters), 'No Characters')
        },
        {
            key: 'actor',
            label: 'Actor',
            hasValue: img => Boolean(img.dataset.cast || img.dataset.castAndCrew),
            buckets: img => getValueGroupBuckets('actor', [
                ...splitGroupValues(img.dataset.cast),
                ...splitGroupValues(img.dataset.castAndCrew)
            ], 'No Actors')
        }
    ];

    let groupBy = 'none';
    let galleryFigures = [];
    let groupSections = [];
    let shownGroupSections = [];
    let groupClones = [];
    let expandedGroupIds = new Set();
    let pinnedGroupHeader = null;
    let stickyGroupHeaders = new Set();
    let groupPinFrame = 0;

    function isGalleryGrouped() {
        return gallery.classList.contains('is-grouped');
    }

    // The label on the right and no groups: the gallery runs sideways.
    function isGallerySideways() {
        return gallery.classList.contains('is-label-right') && !isGalleryGrouped();
    }

    function getGroupByOption(key) {
        return GROUP_BY_OPTIONS.find(option => option.key === key && option.isAvailable !== false) || null;
    }

    function readGroupStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function writeGroupStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Private browsing: the choice lasts for this visit only.
        }
    }

    function splitGroupValues(value) {
        return (value || '').split(',').map(part => part.trim()).filter(part => part.length > 0);
    }

    // An episode in short, S1 E1. When only its season or only its number is
    // known, that one is written out.
    function describeEpisode(season, episode) {
        if (season && episode) return `S${season}\u2009E${episode}`;
        if (season) return `Season ${season}`;
        if (episode) return `Episode ${episode}`;
        return '';
    }

    function getEpisodeOrder(img) {
        const season = normalizeSidebarNumberValue(img.dataset.season);
        const episode = normalizeSidebarNumberValue(img.dataset.episode);
        return {
            season,
            episode,
            order: [season ? Number(season) : Infinity, episode ? Number(episode) : Infinity]
        };
    }

    // The gallery's own order: season, then episode. An image without a
    // season comes after every season, as in the gallery.
    function getEpisodeGroupBuckets(img) {
        const { season, episode, order } = getEpisodeOrder(img);
        if (!season && !episode) {
            return [{ id: 'episode:', title: 'No Episode', order: [...order, 1] }];
        }

        const seasonTitles = galleryEpisodeTitles[season] || {};
        return [{
            id: `episode:${season}:${episode}`,
            title: describeEpisode(season, episode),
            subtitle: season && episode ? seasonTitles[episode] || '' : '',
            order: [...order, 0]
        }];
    }

    function getKeywordSceneNumbers(img) {
        const numbers = new Set();
        splitGroupValues(img.dataset.keywords).forEach(keyword => {
            const match = keyword.match(SCENE_KEYWORD);
            if (match) numbers.add(Number(match[1]));
        });
        return Array.from(numbers);
    }

    // A scene the image is tagged with by name, or else the scene numbers its
    // keywords give, which count within the image's episode. By episode, then
    // numbered scenes by number, then named ones by name.
    function getSceneGroupBuckets(img) {
        const { season, episode, order } = getEpisodeOrder(img);
        const named = splitGroupValues(img.dataset.scene);
        if (named.length > 0) {
            return named.map(name => ({
                id: `scene:${foldGalleryPersonName(name)}`,
                title: name,
                sharedSubtitle: describeEpisode(season, episode),
                order: [...order, 1, name]
            }));
        }

        const numbers = getKeywordSceneNumbers(img);
        if (numbers.length === 0) {
            return [{ id: 'scene:', title: 'No Scene', order: [Infinity, Infinity, 2] }];
        }

        return numbers.map(number => ({
            id: `scene:${season}:${episode}:${number}`,
            title: `Scene ${number}`,
            subtitle: describeEpisode(season, episode),
            order: [...order, 0, number]
        }));
    }

    // One group per value, by name in Finder's collation, as Binder's tag
    // groups are. Case and accents don't make another group.
    function getValueGroupBuckets(kind, values, emptyTitle) {
        if (values.length === 0) {
            return [{ id: `${kind}:`, title: emptyTitle, order: [1] }];
        }

        return values.map(value => ({
            id: `${kind}:${foldGalleryPersonName(value)}`,
            title: value,
            order: [0, value]
        }));
    }

    function compareGroupOrder(a, b) {
        const length = Math.max(a.order.length, b.order.length);
        for (let index = 0; index < length; index++) {
            const left = a.order[index];
            const right = b.order[index];
            if (left === right) continue;
            if (left === undefined) return -1;
            if (right === undefined) return 1;

            const result = typeof left === 'number' && typeof right === 'number'
                ? left - right
                : groupCollator.compare(String(left), String(right));
            if (result !== 0) return result;
        }
        return groupCollator.compare(a.title, b.title);
    }

    function cloneGroupFigure(figure) {
        const clone = figure.cloneNode(true);
        clone.classList.remove('selected');
        clone.querySelector('.item-download-button')?.remove();
        if (!clone.classList.contains('is-visible')) {
            const img = clone.querySelector('img');
            img.addEventListener('load', () => {
                img.classList.toggle('is-portrait', img.naturalHeight > img.naturalWidth);
                clone.classList.add('is-visible');
            }, { once: true });
        }
        groupClones.push(clone);
        return clone;
    }

    function createGroupSection(group) {
        const element = document.createElement('section');
        element.className = 'gallery-group';

        const header = document.createElement('div');
        header.className = 'gallery-group-header';

        // Binder's Enclosing Folder header: the name, then an em space and
        // what places it, lighter. Tail truncation gives up the second first.
        const title = document.createElement('span');
        title.className = 'gallery-group-title';
        title.textContent = group.title;
        const subtitle = group.subtitle || group.sharedSubtitle;
        if (subtitle) {
            const detail = document.createElement('span');
            detail.className = 'gallery-group-subtitle';
            detail.textContent = subtitle;
            title.append(' ', detail);
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gallery-group-toggle';
        button.hidden = true;

        // The rows, in a body of their own that isn't laid out off screen;
        // the header stays out of it, so it can be drawn above the marquee.
        const body = document.createElement('div');
        body.className = 'gallery-group-body';
        const list = document.createElement('div');
        list.className = 'gallery-group-items';
        list.append(...group.figures);
        body.appendChild(list);

        header.append(title, button);
        element.append(header, body);

        const section = { id: group.id, element, header, body, list, button, figures: group.figures, count: 0 };
        button.addEventListener('click', () => toggleGroupCollapse(section));
        return section;
    }

    function buildGroupSections(option) {
        const groups = new Map();

        galleryFigures.forEach(figure => {
            const img = figure.querySelector('img');
            const placed = new Set();

            option.buckets(img).forEach(bucket => {
                if (placed.has(bucket.id)) return;

                let group = groups.get(bucket.id);
                if (!group) {
                    group = { ...bucket, figures: [] };
                    groups.set(bucket.id, group);
                } else {
                    // A named scene goes where its first known episode is, and
                    // names its episode unless its images name two.
                    if (compareGroupOrder(bucket, group) < 0) group.order = bucket.order;
                    if (bucket.sharedSubtitle && !group.isMixed && bucket.sharedSubtitle !== group.sharedSubtitle) {
                        if (group.sharedSubtitle) {
                            group.sharedSubtitle = '';
                            group.isMixed = true;
                        } else {
                            group.sharedSubtitle = bucket.sharedSubtitle;
                        }
                    }
                }

                group.figures.push(placed.size === 0 ? figure : cloneGroupFigure(figure));
                placed.add(bucket.id);
            });
        });

        return Array.from(groups.values()).sort(compareGroupOrder).map(createGroupSection);
    }

    function ungroupGallery() {
        if (!isGalleryGrouped()) return;

        groupClones.forEach(clone => selectedItems.delete(clone));
        if (groupClones.includes(lastSelectedItem)) lastSelectedItem = null;
        if (groupClones.includes(selectionAnchor)) selectionAnchor = null;

        const fragment = document.createDocumentFragment();
        galleryFigures.forEach(figure => fragment.appendChild(figure));
        groupSections.forEach(section => section.element.remove());
        gallery.appendChild(fragment);

        groupSections = [];
        shownGroupSections = [];
        groupClones = [];
        pinnedGroupHeader = null;
        stickyGroupHeaders = new Set();
        gallery.classList.remove('is-grouped');
        document.body.classList.remove('is-gallery-grouped');
    }

    // A cell's height and the gap between rows, from a probe that is always
    // laid out, since a group off screen isn't.
    const galleryCellProbe = document.createElement('div');
    galleryCellProbe.id = 'gallery-cell-probe';
    galleryCellProbe.setAttribute('aria-hidden', 'true');
    gallery.appendChild(galleryCellProbe);

    function getGroupCellMetrics() {
        return {
            cellHeight: galleryCellProbe.offsetHeight,
            rowGap: parseFloat(getComputedStyle(gallery).rowGap) || 0
        };
    }

    function getGroupRowsHeight(rows, metrics) {
        return rows * metrics.cellHeight + (rows - 1) * metrics.rowGap;
    }

    function getGroupColumnCount() {
        const cellWidth = parseFloat(getComputedStyle(gallery).getPropertyValue('--cell-width'));
        const width = galleryWidthProbe.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(gallery).getPropertyValue('--column-gap')) || ICON_GRID_MINIMUM_GAP;
        if (!(cellWidth > 0)) return 1;
        return Math.max(1, Math.floor((width + gap) / (cellWidth + gap)));
    }

    // Counts what the search and the sidebar leave in each group. A group with
    // nothing left is not shown, and only the first group shown has no rule.
    function refreshGroupSections() {
        if (!isGalleryGrouped()) return;

        // Read before any group is told its height, so the gallery is laid
        // out once, not once a group.
        const columns = getGroupColumnCount();
        const metrics = getGroupCellMetrics();
        shownGroupSections = [];

        groupSections.forEach(section => {
            let count = 0;
            for (const figure of section.figures) {
                if (figure.style.display !== 'none') count++;
            }
            section.count = count;

            const isShown = count > 0;
            const isCollapsed = !expandedGroupIds.has(section.id);
            const label = isCollapsed ? `Show All (${count})` : 'Show Less';
            section.element.hidden = !isShown;
            section.element.classList.toggle('is-collapsed', isCollapsed);
            section.element.classList.toggle('is-first', isShown && shownGroupSections.length === 0);
            section.button.hidden = count <= columns;
            if (section.button.textContent !== label) section.button.textContent = label;

            // A group off screen isn't laid out, so its body is told the
            // height its rows will have.
            if (isShown) {
                const rows = isCollapsed ? 1 : Math.ceil(count / columns);
                const height = `${GROUP_ITEMS_TOP + getGroupRowsHeight(rows, metrics) + GROUP_ITEMS_BOTTOM + GROUP_ROW_OVERHANG}px`;
                if (section.body.style.containIntrinsicHeight !== height) section.body.style.containIntrinsicHeight = height;
                shownGroupSections.push(section);
            }
        });

        marqueeItemRects = null;
        updatePinnedGroupHeader();
    }

    function getExpandedGroupStorageKey() {
        return `${GROUP_EXPANDED_STORAGE_PREFIX}${galleryStorageId}|${groupBy}`;
    }

    // Only the open groups are kept, so a group that turns up later arrives
    // collapsed, as in Binder.
    function loadExpandedGroupIds() {
        const stored = readGroupStorage(getExpandedGroupStorageKey());
        if (stored === null) return null;

        try {
            const ids = JSON.parse(stored);
            return Array.isArray(ids) ? new Set(ids) : null;
        } catch (error) {
            return null;
        }
    }

    function saveExpandedGroupIds() {
        writeGroupStorage(getExpandedGroupStorageKey(), JSON.stringify(Array.from(expandedGroupIds)));
    }

    // Finder's first pass for a key that isn't a date: every group opens whole
    // when each of them starts within the window, laid out whole, and
    // otherwise every group is collapsed. Binder runs it once per key.
    function seedExpandedGroupIds() {
        if (shownGroupSections.length === 0) return new Set();

        const columns = getGroupColumnCount();
        const metrics = getGroupCellMetrics();
        const galleryTop = gallery.getBoundingClientRect().top;
        const windowTop = -galleryTop;
        const windowBottom = window.innerHeight - galleryTop;
        let top = 0;

        for (const section of shownGroupSections) {
            const bottom = top + GROUP_HEADER_HEIGHT + GROUP_ITEMS_TOP +
                getGroupRowsHeight(Math.ceil(section.count / columns), metrics) + GROUP_ITEMS_BOTTOM;
            if (!(top < windowBottom && bottom > windowTop)) return new Set();
            top = bottom;
        }

        return new Set(shownGroupSections.map(section => section.id));
    }

    function applyGroupBy(key) {
        const option = getGroupByOption(key) || GROUP_BY_OPTIONS[0];

        ungroupGallery();
        groupBy = option.key;

        if (option.buckets) {
            groupSections = buildGroupSections(option);
            const fragment = document.createDocumentFragment();
            groupSections.forEach(section => fragment.appendChild(section.element));
            gallery.appendChild(fragment);
            gallery.classList.add('is-grouped');
            document.body.classList.add('is-gallery-grouped');

            const storedIds = loadExpandedGroupIds();
            expandedGroupIds = storedIds || new Set();
            refreshGroupSections();
            if (!storedIds) {
                expandedGroupIds = seedExpandedGroupIds();
                saveExpandedGroupIds();
            }
        }

        syncGalleryAxis();
        refreshIconGrid();
        syncGroupByControls();
        window.dispatchEvent(new CustomEvent('galleryRearranged'));
    }

    function setGroupBy(key) {
        if (key === groupBy) return;

        writeGroupStorage(GROUP_BY_STORAGE_PREFIX + galleryStorageId, key);
        applyGroupBy(key);
        window.scrollTo(0, 0);
    }

    function toggleGroupCollapse(section) {
        const pinLine = getGroupPinLine();
        const top = section.element.getBoundingClientRect().top;

        if (expandedGroupIds.has(section.id)) {
            expandedGroupIds.delete(section.id);
        } else {
            expandedGroupIds.add(section.id);
        }
        saveExpandedGroupIds();
        section.list.scrollLeft = 0;
        refreshGroupSections();

        // Collapsed from its pinned header, the group stays where its header was.
        if (top < pinLine) {
            window.scrollBy(0, section.element.getBoundingClientRect().top - pinLine);
        }
        window.dispatchEvent(new CustomEvent('galleryRearranged'));
    }

    // --- Pinned Group Header ---
    // The pin line is the top bar's bottom edge. The group there floats on the
    // top bar's material with a divider along its bottom, its own rule hidden,
    // even when it is at the top on its own, as Finder's first header is. Its
    // end pushes it up under the top bar as the next header arrives, and it
    // fades by the fraction pushed out, as AppKit fades it. Only the headers
    // of the groups around the pin line are sticky: Safari gives every sticky
    // header a layer of its own, and with a few hundred groups each scroll
    // step cost milliseconds more. Two either side cover a group passing in
    // one frame.
    function getGroupPinLine() {
        return header.getBoundingClientRect().bottom;
    }

    function updatePinnedGroupHeader() {
        groupPinFrame = 0;

        let pinned = null;
        let push = 0;
        let stickyIndex = -1;
        if (shownGroupSections.length > 0) {
            const pinLine = getGroupPinLine();
            let low = 0;
            let high = shownGroupSections.length - 1;
            let index = -1;
            while (low <= high) {
                const middle = (low + high) >> 1;
                if (shownGroupSections[middle].element.getBoundingClientRect().bottom > pinLine) {
                    index = middle;
                    high = middle - 1;
                } else {
                    low = middle + 1;
                }
            }

            stickyIndex = index === -1 ? shownGroupSections.length - 1 : index;
            if (index !== -1) {
                const rect = shownGroupSections[index].element.getBoundingClientRect();
                if (rect.top <= pinLine + 0.5) {
                    pinned = shownGroupSections[index].header;
                    push = Math.min(GROUP_HEADER_HEIGHT, Math.max(0, pinLine + GROUP_HEADER_HEIGHT - rect.bottom));
                }
            }
        }

        const sticky = new Set(stickyIndex === -1 ? [] : shownGroupSections
            .slice(Math.max(0, stickyIndex - 2), stickyIndex + 3)
            .map(section => section.header));
        stickyGroupHeaders.forEach(groupHeader => {
            if (!sticky.has(groupHeader)) groupHeader.classList.remove('is-sticky');
        });
        sticky.forEach(groupHeader => {
            if (!stickyGroupHeaders.has(groupHeader)) groupHeader.classList.add('is-sticky');
        });
        stickyGroupHeaders = sticky;

        if (pinned !== pinnedGroupHeader) {
            if (pinnedGroupHeader) {
                pinnedGroupHeader.classList.remove('is-floating');
                pinnedGroupHeader.style.opacity = '';
            }
            if (pinned) pinned.classList.add('is-floating');
            pinnedGroupHeader = pinned;
        }
        if (pinned) {
            const opacity = push > 0 ? String(1 - push / GROUP_HEADER_HEIGHT) : '';
            if (pinned.style.opacity !== opacity) pinned.style.opacity = opacity;
        }
    }

    window.addEventListener('scroll', () => {
        if (shownGroupSections.length === 0 || groupPinFrame) return;
        groupPinFrame = requestAnimationFrame(updatePinnedGroupHeader);
    }, { passive: true });

    // A collapsed row that scrolls moves its items under the marquee.
    gallery.addEventListener('scroll', event => {
        if (event.target !== gallery) marqueeItemRects = null;
    }, true);

    // --- Grouped Hit Testing and Navigation ---
    function toGalleryRect(rect, galleryRect) {
        return {
            left: rect.left - galleryRect.left,
            top: rect.top - galleryRect.top,
            right: rect.right - galleryRect.left,
            bottom: rect.bottom - galleryRect.top
        };
    }

    // Grouped, only the groups a click, the band or an arrow key reaches are
    // measured, each once until the gallery changes. A group off screen isn't
    // laid out, and measuring its items would lay it out: every group, some
    // 300 ms in Safari, on each click. A collapsed row shows its items only
    // within its own width.
    function getGroupedItemRects(galleryRect, range) {
        if (!marqueeItemRects) {
            marqueeItemRects = [];
            marqueeItemRects.measuredItems = new Set();
            marqueeItemRects.groups = shownGroupSections.map(section => ({
                section,
                bounds: toGalleryRect(section.element.getBoundingClientRect(), galleryRect),
                isMeasured: false
            }));
        }

        for (const group of marqueeItemRects.groups) {
            if (group.isMeasured) continue;
            if (range && (group.bounds.bottom <= range.top || group.bounds.top >= range.bottom)) continue;

            group.isMeasured = true;
            const section = group.section;
            const clip = section.element.classList.contains('is-collapsed')
                ? toGalleryRect(section.list.getBoundingClientRect(), galleryRect)
                : null;
            for (const item of section.figures) {
                if (item.style.display === 'none') continue;

                marqueeItemRects.push({ ...toGalleryRect(item.getBoundingClientRect(), galleryRect), item, clip, hitBox: null });
                marqueeItemRects.measuredItems.add(item);
            }
        }

        return marqueeItemRects;
    }

    function settleUnmeasuredSelection(isModifier) {
        const measuredItems = marqueeItemRects.measuredItems;
        for (const item of Array.from(selectedItems)) {
            if (!measuredItems.has(item) && !(isModifier && preMarqueeSelectedItems.has(item))) {
                setSelection(item, false);
            }
        }
    }

    function intersectRects(a, b) {
        return {
            left: Math.max(a.left, b.left),
            top: Math.max(a.top, b.top),
            right: Math.min(a.right, b.right),
            bottom: Math.min(a.bottom, b.bottom)
        };
    }

    // AppKit's up and down arrows in an icon view: the nearest row above or
    // below, and in it the item whose centre is nearest across.
    function getGroupedVerticalNeighbor(item, direction) {
        if (!isMarquee) marqueeItemRects = null;
        if (!item) return null;

        // The next row either way starts within two cells' height.
        const galleryRect = getGalleryOrigin();
        const itemRect = toGalleryRect(item.getBoundingClientRect(), galleryRect);
        const reach = 2 * (itemRect.bottom - itemRect.top);
        const entries = getMarqueeItemRects(galleryRect, { top: itemRect.top - reach, bottom: itemRect.bottom + reach });
        const current = entries.find(entry => entry.item === item);
        if (!current) return null;

        let rowTop = null;
        for (const entry of entries) {
            const isPast = direction < 0 ? entry.top < current.top - 1 : entry.top > current.top + 1;
            if (isPast && (rowTop === null || (direction < 0 ? entry.top > rowTop : entry.top < rowTop))) {
                rowTop = entry.top;
            }
        }
        if (rowTop === null) return null;

        const center = (current.left + current.right) / 2;
        let nearest = null;
        let nearestDistance = Infinity;
        for (const entry of entries) {
            if (Math.abs(entry.top - rowTop) > 1) continue;

            const distance = Math.abs((entry.left + entry.right) / 2 - center);
            if (distance < nearestDistance) {
                nearest = entry;
                nearestDistance = distance;
            }
        }
        return nearest ? nearest.item : null;
    }

    // An image shown in several groups is one image to save.
    function getDistinctImageItems(figures) {
        const bySource = new Map();
        figures.forEach(figure => {
            const source = figure.querySelector('img').dataset.fullsrc;
            if (!bySource.has(source)) bySource.set(source, figure);
        });
        return Array.from(bySource.values());
    }

    // --- Group By Menus ---
    // The gallery's context menu has Group By above Sort By, as Binder's
    // background menu does, each opening a submenu, and the sidebar lists the
    // same choices.
    const contextSubmenus = [[groupByMenuRow, groupByMenu], [sortByMenuRow, sortByMenu]]
        .filter(([row, menu]) => row && menu);

    function isInContextSubmenu(target) {
        return contextSubmenus.some(([, menu]) => menu.contains(target));
    }

    function showContextSubmenu(row) {
        const submenu = contextSubmenus.find(([parent]) => parent === row);
        if (!submenu) return;

        const menu = submenu[1];
        hideContextSubmenus();
        menu.style.display = 'block';
        row.classList.add('is-open');

        const rowRect = row.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const menuPadding = parseFloat(getComputedStyle(menu).paddingTop) || 0;
        let left = rowRect.right;
        if (left + menuRect.width > window.innerWidth) left = rowRect.left - menuRect.width;
        const top = clamp(rowRect.top - menuPadding, 0, Math.max(0, window.innerHeight - menuRect.height));

        menu.style.left = `${Math.max(0, left)}px`;
        menu.style.top = `${top}px`;
    }

    function hideContextSubmenus() {
        contextSubmenus.forEach(([row, menu]) => {
            menu.style.display = 'none';
            row.classList.remove('is-open');
        });
    }

    function renderGroupByControls() {
        const options = GROUP_BY_OPTIONS.filter(option => option.isAvailable !== false);

        if (groupByMenu) {
            const menuRows = [];
            options.forEach(option => {
                const row = document.createElement('li');
                row.dataset.groupBy = option.key;
                row.textContent = option.label;
                menuRows.push(row);

                if (option.key === 'none') {
                    const separator = document.createElement('li');
                    separator.className = 'separator';
                    menuRows.push(separator);
                }
            });
            groupByMenu.querySelector('ul').replaceChildren(...menuRows);
        }

        if (sidebarGroupByList) {
            sidebarGroupByList.replaceChildren(...options.map(option => {
                const button = document.createElement('button');
                button.className = 'sidebar-option';
                button.type = 'button';
                button.dataset.groupBy = option.key;
                button.textContent = option.label;
                return button;
            }));
        }

        if (viewOptionsGroupBy) {
            const popupItems = [];
            options.forEach(option => {
                popupItems.push(new Option(option.label, option.key));
                if (option.key === 'none') popupItems.push(document.createElement('hr'));
            });
            viewOptionsGroupBy.replaceChildren(...popupItems);
        }

        syncGroupByControls();
    }

    function syncGroupByControls() {
        if (groupByMenu) {
            groupByMenu.querySelectorAll('[data-group-by]').forEach(row => {
                row.classList.toggle('is-checked', row.dataset.groupBy === groupBy);
            });
        }

        if (sidebarGroupByList) {
            sidebarGroupByList.querySelectorAll('[data-group-by]').forEach(button => {
                const isActive = button.dataset.groupBy === groupBy;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
        }

        if (viewOptionsGroupBy) viewOptionsGroupBy.value = groupBy;
    }

    if (galleryContextMenuElement) {
        galleryContextMenuElement.addEventListener('mouseover', event => {
            const row = event.target.closest('li');
            if (!row || row.classList.contains('separator') || row.classList.contains('is-open')) return;

            if (contextSubmenus.some(([parent]) => parent === row)) {
                showContextSubmenu(row);
            } else {
                hideContextSubmenus();
            }
        });
    }

    if (groupByMenu) {
        groupByMenu.addEventListener('click', event => {
            const row = event.target.closest('[data-group-by]');
            if (!row) return;

            if (galleryContextMenuElement) galleryContextMenuElement.style.display = 'none';
            hideContextSubmenus();
            setGroupBy(row.dataset.groupBy);
        });
    }

    if (sidebarGroupByList) {
        sidebarGroupByList.addEventListener('click', event => {
            const button = event.target.closest('[data-group-by]');
            if (button) setGroupBy(button.dataset.groupBy);
        });
    }

    if (viewOptionsGroupBy) {
        viewOptionsGroupBy.addEventListener('change', () => setGroupBy(viewOptionsGroupBy.value));
    }

    // The key is kept per gallery, and comes back with the page.
    document.addEventListener('galleryLoaded', () => {
        galleryFigures = Array.from(items);
        GROUP_BY_OPTIONS.forEach(option => {
            option.isAvailable = !option.hasValue ||
                galleryFigures.some(figure => option.hasValue(figure.querySelector('img')));
        });

        renderGroupByControls();
        // Sorted before it is grouped, as Binder groups a sorted list.
        loadSortBy();

        // A gallery never grouped here takes the defaults' Group By.
        const defaults = readStoredJSON(VIEW_OPTIONS_DEFAULTS_STORAGE_KEY);
        const storedKey = readGroupStorage(GROUP_BY_STORAGE_PREFIX + galleryStorageId) ?? (defaults && defaults.groupBy);
        if (storedKey && getGroupByOption(storedKey)) applyGroupBy(storedKey);
    });

    // --- View Options ---
    // Binder's View Options panel, after Finder's: a small window floating over
    // the gallery while you work, titled with the gallery it sets. Show View
    // Options in the background menu or Command-J opens it; Hide View Options,
    // Command-J again or its close button closes it. It opens where it was last
    // left, at first centred in the window. Its options are kept per gallery,
    // as Binder keeps them per folder; Group By keeps its own key. Sort By is
    // its own section below. Use as Defaults keeps them, Group By with them,
    // as the defaults a gallery opens with until it has options of its own,
    // as Binder's do for a folder.
    // Icon size runs 16 to 512 through Finder's slider curve, in steps of 4;
    // the gallery starts at 253, where its thumbnail box is 225px. Grid
    // spacing runs 1 to 100, Finder's 54 by default, the slider's value
    // floored. Corner radius runs 0 to 50% of the thumbnail box in whole
    // percent, as Binder's slider does. The gallery starts at 6%, where Binder
    // starts at 10%.
    // Show item info shows or hides the dimensions line, and the cells keep
    // room for it only while it shows. Show icon preview off shows every
    // image's kind icon in place of its thumbnail. Text size runs 10 to 16
    // points, Finder's 12 by default, and the cells follow the caption's type.
    // Label position Right puts the name beside the icon; ungrouped, the
    // gallery then runs sideways, as Finder's does. Background is Default or
    // a Color, picked as Binder picks it; Binder's Picture is left out.
    const VIEW_OPTIONS_STORAGE_PREFIX = 'galleryViewOptions:';
    const VIEW_OPTIONS_PANEL_STORAGE_KEY = 'galleryViewOptionsPanel';
    const VIEW_OPTIONS_DEFAULTS_STORAGE_KEY = 'galleryViewOptionsDefaults';
    const DEFAULT_VIEW_OPTIONS = { sortBy: 'none', sortReversed: false, iconSize: 253, gridSpacing: 54, cornerRadius: 0.06, textSize: 12, labelPosition: 'bottom', showItemInfo: true, showIconPreview: true, background: 'default', backgroundColor: null };
    const viewOptionsPanel = document.getElementById('view-options-panel');
    const viewOptionsTitleBar = viewOptionsPanel && viewOptionsPanel.querySelector('.view-options-title-bar');
    const viewOptionsCloseButton = viewOptionsPanel && viewOptionsPanel.querySelector('.view-options-close');
    const viewOptionsMenuRow = document.getElementById('gallery-context-view');
    const iconSizeSlider = document.getElementById('view-options-icon-size');
    const iconSizeValue = document.getElementById('view-options-icon-size-value');
    const gridSpacingSlider = document.getElementById('view-options-grid-spacing');
    const cornerRadiusSlider = document.getElementById('view-options-corner-radius');
    const cornerRadiusValue = document.getElementById('view-options-corner-radius-value');
    const textSizePopup = document.getElementById('view-options-text-size');
    const labelPositionRadios = viewOptionsPanel ? Array.from(viewOptionsPanel.querySelectorAll('input[name="view-options-label-position"]')) : [];
    const showItemInfoCheckbox = document.getElementById('view-options-show-item-info');
    const showIconPreviewCheckbox = document.getElementById('view-options-show-icon-preview');
    const backgroundRadios = viewOptionsPanel ? Array.from(viewOptionsPanel.querySelectorAll('input[name="view-options-background"]')) : [];
    const backgroundColorInput = document.getElementById('view-options-background-color');
    const useAsDefaultsButton = document.getElementById('view-options-use-as-defaults');
    let viewOptions = readViewOptions();
    let viewOptionsPanelPosition = null;
    let viewOptionsDrag = null;

    function readStoredJSON(key) {
        try {
            return JSON.parse(readGroupStorage(key));
        } catch (error) {
            return null;
        }
    }

    function readViewOptions() {
        const stored = readStoredJSON(VIEW_OPTIONS_STORAGE_PREFIX + galleryStorageId) ||
            readStoredJSON(VIEW_OPTIONS_DEFAULTS_STORAGE_KEY);
        const options = { ...DEFAULT_VIEW_OPTIONS };
        if (stored && typeof stored.sortBy === 'string') options.sortBy = stored.sortBy;
        if (stored && typeof stored.sortReversed === 'boolean') options.sortReversed = stored.sortReversed;
        if (stored && Number.isInteger(stored.iconSize) && stored.iconSize >= 16 && stored.iconSize <= 512) {
            options.iconSize = stored.iconSize;
        }
        if (stored && Number.isInteger(stored.gridSpacing) && stored.gridSpacing >= 1 && stored.gridSpacing <= 100) {
            options.gridSpacing = stored.gridSpacing;
        }
        if (stored && Number.isFinite(stored.cornerRadius)) {
            options.cornerRadius = Math.min(Math.max(Math.round(stored.cornerRadius * 100), 0), 50) / 100;
        }
        if (stored && Number.isInteger(stored.textSize) && stored.textSize >= 10 && stored.textSize <= 16) {
            options.textSize = stored.textSize;
        }
        if (stored && (stored.labelPosition === 'bottom' || stored.labelPosition === 'right')) {
            options.labelPosition = stored.labelPosition;
        }
        if (stored && typeof stored.showItemInfo === 'boolean') options.showItemInfo = stored.showItemInfo;
        if (stored && typeof stored.showIconPreview === 'boolean') options.showIconPreview = stored.showIconPreview;
        if (stored && (stored.background === 'default' || stored.background === 'color')) options.background = stored.background;
        if (stored && /^#[0-9a-f]{6}$/i.test(stored.backgroundColor)) options.backgroundColor = stored.backgroundColor;
        return options;
    }

    function saveViewOptions() {
        writeGroupStorage(VIEW_OPTIONS_STORAGE_PREFIX + galleryStorageId, JSON.stringify(viewOptions));
    }

    // Binder's relayout after the cells change size (relayoutGrid, after
    // Finder): the row at the top of the window stays there. The anchor is
    // that row's first item, the row being the cell and the gap under it. A
    // row partly scrolled off keeps the same share of itself off; space above
    // the first row stays as it was. At the very top nothing is anchored, so
    // the gallery stays at the top.
    function getRowPitch() {
        const metrics = getGroupCellMetrics();
        return metrics.cellHeight + metrics.rowGap;
    }

    function getViewportAnchor() {
        if (window.scrollY < 1 || isGallerySideways()) return null;

        // Grouped, the rows are those of the group at the top of the window.
        let candidates = null;
        if (isGalleryGrouped()) {
            const section = shownGroupSections.find(shown => shown.element.getBoundingClientRect().bottom > 0);
            if (section) candidates = section.figures.filter(figure => figure.style.display !== 'none');
        } else {
            candidates = Array.from(items).filter(item => item.style.display !== 'none');
        }
        if (!candidates || candidates.length === 0) return null;

        const pitch = getRowPitch();
        let low = 0;
        let high = candidates.length - 1;
        while (low < high) {
            const middle = (low + high) >> 1;
            if (candidates[middle].getBoundingClientRect().top + pitch > 0) high = middle;
            else low = middle + 1;
        }
        return { item: candidates[low], offset: candidates[low].getBoundingClientRect().top, pitch };
    }

    function restoreViewportAnchor(anchor) {
        if (!anchor || !anchor.item.isConnected) return;

        const offset = anchor.offset < 0 ? anchor.offset * getRowPitch() / anchor.pitch : anchor.offset;
        const scale = window.devicePixelRatio || 1;
        const top = window.scrollY + anchor.item.getBoundingClientRect().top - offset;
        window.scrollTo(window.scrollX, Math.round(top * scale) / scale);
    }

    function relayoutGallery(change) {
        const anchor = getViewportAnchor();
        change();
        refreshIconGrid();
        restoreViewportAnchor(anchor);
    }

    // Finder's TIconSizeSliderValueTransformer (Binder's
    // IconSizeSliderTransform): the slider runs 0 to 112, 2px a step up to
    // 128, then on a log curve to 512; sizes are rounded to a multiple of 4,
    // the slider's position truncated first.
    const ICON_SIZE_SLIDER_RANGE = 112;
    const ICON_SIZE_SLIDER_PER_LOG = ICON_SIZE_SLIDER_RANGE / (Math.log(512 - 16 + Math.exp(4)) - 4);

    function getIconSizeSliderValue(size) {
        if (size - 16 <= ICON_SIZE_SLIDER_RANGE) return (size - 16) * 0.5;
        return ICON_SIZE_SLIDER_PER_LOG * (Math.log(Math.exp(4) + size - 16) - 4);
    }

    function getIconSizeForSliderValue(value) {
        const step = Math.trunc(Math.max(value, 0));
        const relative = step <= ICON_SIZE_SLIDER_RANGE * 0.5
            ? 2 * step
            : Math.exp(4 + step / ICON_SIZE_SLIDER_PER_LOG) - Math.exp(4);
        const size = 16 + relative + 2;
        return Math.trunc(size - size % 4);
    }

    // Binder's thumbnail shadow by the icon's size in device pixels: the
    // Gaussian's sigma and its drop, fitted to Finder's (ThumbnailShadowSpec),
    // linear between rows and in proportion past the last.
    const THUMBNAIL_SHADOW_TABLE = [
        [32, 1.18, 0.98], [48, 1.20, 1.01], [64, 2.18, 1.01], [96, 2.21, 1.01],
        [128, 3.25, 1.97], [192, 5.23, 2.25], [256, 6.19, 3.12], [320, 7.21, 4.11],
        [424, 9.28, 4.25], [512, 10.19, 4.51], [768, 15.16, 6.81], [1024, 20.13, 9.12]
    ];

    function getThumbnailShadowSpec(canvas) {
        const first = THUMBNAIL_SHADOW_TABLE[0];
        const last = THUMBNAIL_SHADOW_TABLE[THUMBNAIL_SHADOW_TABLE.length - 1];
        if (canvas <= first[0]) return { sigma: first[1], offset: first[2] };
        if (canvas >= last[0]) return { sigma: last[1] * canvas / last[0], offset: last[2] * canvas / last[0] };

        const index = THUMBNAIL_SHADOW_TABLE.findIndex(row => canvas <= row[0]);
        const [lowCanvas, lowSigma, lowOffset] = THUMBNAIL_SHADOW_TABLE[index - 1];
        const [highCanvas, highSigma, highOffset] = THUMBNAIL_SHADOW_TABLE[index];
        const t = (canvas - lowCanvas) / (highCanvas - lowCanvas);
        return { sigma: lowSigma + t * (highSigma - lowSigma), offset: lowOffset + t * (highOffset - lowOffset) };
    }

    // The cells, the thumbnail box and the kind icons follow the icon size.
    // The thumbnail's shadow grows as Binder's does, against the 253px icon
    // its tokens are drawn for, and the selection glow as the selection box,
    // in proportion. The knob stays where it was let go.
    function applyIconSize() {
        const size = viewOptions.iconSize;
        gallery.style.setProperty('--icon-size', `${size}px`);
        gallery.classList.toggle('has-large-icons', size > DEFAULT_VIEW_OPTIONS.iconSize);
        gallery.classList.toggle('has-tiny-icons', size <= 16);

        const scale = window.devicePixelRatio || 1;
        const shadow = getThumbnailShadowSpec(size * scale);
        const baseShadow = getThumbnailShadowSpec(DEFAULT_VIEW_OPTIONS.iconSize * scale);
        const root = document.documentElement.style;
        root.setProperty('--thumb-shadow-blur-scale', String(shadow.sigma / baseShadow.sigma));
        root.setProperty('--thumb-shadow-offset-scale', String(shadow.offset / baseShadow.offset));
        root.setProperty('--selection-glow-scale', String(size / DEFAULT_VIEW_OPTIONS.iconSize));

        if (iconSizeSlider && getIconSizeForSliderValue(Number(iconSizeSlider.value)) !== size) {
            iconSizeSlider.value = String(getIconSizeSliderValue(size));
        }
        if (iconSizeValue) iconSizeValue.textContent = `${size}×${size}`;
    }

    // The cells take their width and their name's lines from it. The knob
    // stays where it was let go, between whole values.
    function applyGridSpacing() {
        gallery.style.setProperty('--grid-spacing', String(viewOptions.gridSpacing));
        if (gridSpacingSlider && Math.floor(Number(gridSpacingSlider.value)) !== viewOptions.gridSpacing) {
            gridSpacingSlider.value = String(viewOptions.gridSpacing);
        }
    }

    // What the names are fitted to: the cell's width and its whole lines.
    function getCaptionFit() {
        const style = getComputedStyle(gallery);
        return `${style.getPropertyValue('--cell-width')} ${Math.floor(parseFloat(style.getPropertyValue('--name-lines')))}`;
    }

    // The thumbnails take the radius from the gallery's --corner-radius.
    function applyCornerRadius() {
        const percent = Math.round(viewOptions.cornerRadius * 100);
        gallery.style.setProperty('--corner-radius', String(viewOptions.cornerRadius));
        if (cornerRadiusSlider) cornerRadiusSlider.value = String(percent);
        if (cornerRadiusValue) cornerRadiusValue.textContent = `${percent}%`;
    }

    // The caption's type is the gallery's, which its cells are measured in.
    function applyTextSize() {
        gallery.style.setProperty('--text-size', String(viewOptions.textSize));
        if (textSizePopup) textSizePopup.value = String(viewOptions.textSize);
    }

    function applyLabelPosition() {
        gallery.classList.toggle('is-label-right', viewOptions.labelPosition === 'right');
        labelPositionRadios.forEach(radio => {
            radio.checked = radio.value === viewOptions.labelPosition;
        });
        syncGalleryAxis();
    }

    // Finder flips the scroll axis with the layout and starts the new one at
    // its beginning. Sideways, a vertical wheel scrolls the gallery along, as
    // AppKit's horizontal-only scroll views take it.
    let galleryScrollsSideways = false;

    function scrollGallerySideways(event) {
        if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

        const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery.clientWidth : 1;
        gallery.scrollLeft += event.deltaY * scale;
        event.preventDefault();
    }

    function syncGalleryAxis() {
        const sideways = isGallerySideways();
        if (sideways === galleryScrollsSideways) return;

        galleryScrollsSideways = sideways;
        gallery.scrollLeft = 0;
        window.scrollTo(0, 0);
        if (sideways) {
            gallery.addEventListener('wheel', scrollGallerySideways, { passive: false });
        } else {
            gallery.removeEventListener('wheel', scrollGallerySideways);
        }
    }

    function applyShowItemInfo() {
        gallery.classList.toggle('hides-item-info', !viewOptions.showItemInfo);
        if (showItemInfoCheckbox) showItemInfoCheckbox.checked = viewOptions.showItemInfo;
    }

    function applyShowIconPreview() {
        gallery.classList.toggle('hides-icon-preview', !viewOptions.showIconPreview);
        if (showIconPreviewCheckbox) showIconPreviewCheckbox.checked = viewOptions.showIconPreview;
    }

    // Color fills the area right of the sidebar, and the gallery takes the
    // light appearance over it. Until a colour is picked, Color shows as
    // Default, as in Binder; the colour is kept while Default is chosen.
    function applyBackground() {
        const color = viewOptions.background === 'color' ? viewOptions.backgroundColor : null;
        wrapper.style.backgroundColor = color || '';
        gallery.classList.toggle('has-custom-background', Boolean(color));
        backgroundRadios.forEach(radio => {
            radio.checked = radio.value === (color ? 'color' : 'default');
        });
        if (backgroundColorInput && viewOptions.backgroundColor) backgroundColorInput.value = viewOptions.backgroundColor;
    }

    // Whether an item draws its thumbnail rather than its kind icon.
    function showsThumbnail(item) {
        return viewOptions.showIconPreview && item.classList.contains('is-visible');
    }

    function isViewOptionsShown() {
        return Boolean(viewOptionsPanel) && !viewOptionsPanel.hidden;
    }

    function isInViewOptions(target) {
        return Boolean(viewOptionsPanel && viewOptionsPanel.contains(target));
    }

    // Kept whole inside the window, which may have shrunk since it was put there.
    function positionViewOptionsPanel() {
        const maxLeft = Math.max(0, window.innerWidth - viewOptionsPanel.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - viewOptionsPanel.offsetHeight);
        viewOptionsPanel.style.left = `${Math.round(clamp(viewOptionsPanelPosition.left, 0, maxLeft))}px`;
        viewOptionsPanel.style.top = `${Math.round(clamp(viewOptionsPanelPosition.top, 0, maxTop))}px`;
    }

    function showViewOptions() {
        if (!viewOptionsPanel || isViewOptionsShown()) return;

        viewOptionsPanel.hidden = false;
        if (!viewOptionsPanelPosition) {
            const stored = readStoredJSON(VIEW_OPTIONS_PANEL_STORAGE_KEY);
            viewOptionsPanelPosition = stored && Number.isFinite(stored.left) && Number.isFinite(stored.top)
                ? stored
                : {
                    left: (window.innerWidth - viewOptionsPanel.offsetWidth) / 2,
                    top: (window.innerHeight - viewOptionsPanel.offsetHeight) / 2
                };
        }
        positionViewOptionsPanel();
        if (viewOptionsMenuRow) viewOptionsMenuRow.textContent = 'Hide View Options';
    }

    function hideViewOptions() {
        if (!isViewOptionsShown()) return;

        viewOptionsPanel.hidden = true;
        if (viewOptionsMenuRow) viewOptionsMenuRow.textContent = 'Show View Options';
    }

    function toggleViewOptions() {
        if (isViewOptionsShown()) {
            hideViewOptions();
        } else {
            showViewOptions();
        }
    }

    // As in Binder, each size the slider passes is applied and kept. What a
    // thumbnail draws changes, so the hit test reads its shadows again, and
    // large kind icons get their masks.
    if (iconSizeSlider) {
        iconSizeSlider.addEventListener('input', () => {
            const size = getIconSizeForSliderValue(Number(iconSizeSlider.value));
            if (size === viewOptions.iconSize) return;

            const fit = getCaptionFit();
            viewOptions.iconSize = size;
            saveViewOptions();
            relayoutGallery(applyIconSize);
            thumbnailShadows = null;
            preloadKindIconMasks();
            if (getCaptionFit() !== fit) document.dispatchEvent(new CustomEvent('galleryCaptionsChanged'));
        });
    }

    // As in Binder, each whole value the slider passes is applied and kept.
    if (gridSpacingSlider) {
        gridSpacingSlider.addEventListener('input', () => {
            const spacing = Math.min(Math.max(Math.floor(Number(gridSpacingSlider.value)), 1), 100);
            if (spacing === viewOptions.gridSpacing) return;

            const fit = getCaptionFit();
            viewOptions.gridSpacing = spacing;
            saveViewOptions();
            relayoutGallery(applyGridSpacing);
            if (getCaptionFit() !== fit) document.dispatchEvent(new CustomEvent('galleryCaptionsChanged'));
        });
    }

    if (cornerRadiusSlider) {
        cornerRadiusSlider.addEventListener('input', () => {
            viewOptions.cornerRadius = Number(cornerRadiusSlider.value) / 100;
            applyCornerRadius();
        });
        cornerRadiusSlider.addEventListener('change', saveViewOptions);
    }

    // The names wrap at a new width in a new type, so they are fitted again.
    if (textSizePopup) {
        textSizePopup.addEventListener('change', () => {
            viewOptions.textSize = Number(textSizePopup.value);
            saveViewOptions();
            relayoutGallery(applyTextSize);
            document.dispatchEvent(new CustomEvent('galleryCaptionsChanged'));
        });
    }

    // Changing axis starts the gallery at its beginning; otherwise the row at
    // the top stays put.
    labelPositionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;

            const fit = getCaptionFit();
            const wasSideways = isGallerySideways();
            viewOptions.labelPosition = radio.value;
            saveViewOptions();
            if (wasSideways || (radio.value === 'right' && !isGalleryGrouped())) {
                applyLabelPosition();
                refreshIconGrid();
            } else {
                relayoutGallery(applyLabelPosition);
            }
            marqueeItemRects = null;
            window.dispatchEvent(new CustomEvent('galleryRearranged'));
            if (getCaptionFit() !== fit) document.dispatchEvent(new CustomEvent('galleryCaptionsChanged'));
        });
    });

    // Binder's Color button opens the colour panel on every click, chosen or
    // not; here the browser's colour picker. Each colour picked applies and
    // is kept at once. The selection's glow and the thumbnails' shadows change
    // with the appearance, so the hit test reads them again.
    function setBackground(background) {
        viewOptions.background = background;
        saveViewOptions();
        applyBackground();
        thumbnailShadows = null;
    }

    backgroundRadios.forEach(radio => {
        radio.addEventListener('click', () => {
            if (radio.value === 'default') {
                setBackground('default');
                return;
            }

            if (viewOptions.backgroundColor) {
                setBackground('color');
            } else {
                applyBackground();
            }
            if (!backgroundColorInput) return;
            try {
                backgroundColorInput.showPicker();
            } catch (error) {
                backgroundColorInput.click();
            }
        });
    });

    if (backgroundColorInput) {
        backgroundColorInput.addEventListener('input', () => {
            viewOptions.backgroundColor = backgroundColorInput.value;
            setBackground('color');
        });
    }

    // Binder's Use as Defaults: every option, saved for the galleries that
    // have none of their own. This one keeps its own.
    if (useAsDefaultsButton) {
        useAsDefaultsButton.addEventListener('click', () => {
            writeGroupStorage(VIEW_OPTIONS_DEFAULTS_STORAGE_KEY, JSON.stringify({ ...viewOptions, groupBy }));
        });
    }

    if (showItemInfoCheckbox) {
        showItemInfoCheckbox.addEventListener('change', () => {
            viewOptions.showItemInfo = showItemInfoCheckbox.checked;
            saveViewOptions();
            relayoutGallery(applyShowItemInfo);
        });
    }

    // What an item draws changes, so the hit boxes are measured again.
    if (showIconPreviewCheckbox) {
        showIconPreviewCheckbox.addEventListener('change', () => {
            viewOptions.showIconPreview = showIconPreviewCheckbox.checked;
            saveViewOptions();
            applyShowIconPreview();
            marqueeItemRects = null;
        });
    }

    if (viewOptionsCloseButton) {
        viewOptionsCloseButton.addEventListener('click', hideViewOptions);
    }

    // Moved by its title bar, as a window is, and kept where it was let go.
    if (viewOptionsTitleBar) {
        viewOptionsTitleBar.addEventListener('pointerdown', event => {
            if (event.button !== 0 || event.target.closest('button')) return;

            event.preventDefault();
            viewOptionsTitleBar.setPointerCapture(event.pointerId);
            viewOptionsDrag = {
                pointerId: event.pointerId,
                x: event.clientX - viewOptionsPanel.offsetLeft,
                y: event.clientY - viewOptionsPanel.offsetTop
            };
        });

        viewOptionsTitleBar.addEventListener('pointermove', event => {
            if (!viewOptionsDrag || event.pointerId !== viewOptionsDrag.pointerId) return;

            viewOptionsPanelPosition = { left: event.clientX - viewOptionsDrag.x, top: event.clientY - viewOptionsDrag.y };
            positionViewOptionsPanel();
        });

        const endViewOptionsDrag = event => {
            if (!viewOptionsDrag || event.pointerId !== viewOptionsDrag.pointerId) return;

            viewOptionsDrag = null;
            viewOptionsPanelPosition = { left: viewOptionsPanel.offsetLeft, top: viewOptionsPanel.offsetTop };
            writeGroupStorage(VIEW_OPTIONS_PANEL_STORAGE_KEY, JSON.stringify(viewOptionsPanelPosition));
        };
        viewOptionsTitleBar.addEventListener('pointerup', endViewOptionsDrag);
        viewOptionsTitleBar.addEventListener('pointercancel', endViewOptionsDrag);
    }

    window.addEventListener('resize', () => {
        if (isViewOptionsShown()) positionViewOptionsPanel();
    });

    document.addEventListener('keydown', event => {
        if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey &&
            event.key.toLowerCase() === 'j') {
            event.preventDefault();
            toggleViewOptions();
        }
    });

    applyIconSize();
    applyGridSpacing();
    applyCornerRadius();
    applyTextSize();
    applyLabelPosition();
    applyShowItemInfo();
    applyShowIconPreview();
    applyBackground();

    // --- Sort By ---
    // Binder's Sort By, after Finder's, with the keys these galleries have.
    // None keeps the gallery's own order. Name compares filenames as Finder
    // does, numbers by their value and case ignored; Episode goes by season,
    // then episode; Size puts the largest first. Each key keeps its own
    // direction, images without a value come last either way, and ties keep
    // the gallery's order. Reverse Order, at the end of the background menu's
    // Sort By, flips the key's direction, as picking the current key there
    // again does; picking another key sets it back. Grouped, every group is
    // in this order, as Binder groups a sorted list. A key is offered only
    // where some image has a value for it.
    const sortCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'accent' });
    const sidebarSortByList = document.getElementById('sidebar-sort-by-options');
    const viewOptionsSortBy = document.getElementById('view-options-sort-by');
    const compareNumbers = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
    const SORT_BY_OPTIONS = [
        { key: 'none', label: 'None' },
        {
            key: 'name',
            label: 'Name',
            value: figure => getFigureName(figure) || null,
            compare: (a, b) => sortCollator.compare(a, b)
        },
        {
            key: 'episode',
            label: 'Episode',
            value: figure => {
                const { season, episode, order } = getEpisodeOrder(figure.querySelector('img'));
                return season || episode ? order : null;
            },
            compare: (a, b) => compareNumbers(a[0], b[0]) || compareNumbers(a[1], b[1])
        },
        {
            key: 'size',
            label: 'Size',
            value: figure => parseFileSize(figure.querySelector('img').dataset.size),
            compare: (a, b) => b - a
        }
    ];
    let galleryOrder = [];

    function getSortByOption(key) {
        return SORT_BY_OPTIONS.find(option => option.key === key && option.isAvailable !== false) || null;
    }

    // The name the caption shows, whole even where it is cut short.
    function getFigureName(figure) {
        const name = figure.querySelector('.filename');
        return name ? name.dataset.name || name.textContent : '';
    }

    // "1,2 MB", "1.250 KB": the data's sizes, in decimal units.
    function parseFileSize(text) {
        const match = /^([\d.,]+)\s*([KMGT]?)B$/i.exec((text || '').trim());
        if (!match) return null;

        const value = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        return value * 1000 ** ' KMGT'.indexOf(match[2].toUpperCase() || ' ');
    }

    function sortGalleryFigures() {
        const option = getSortByOption(viewOptions.sortBy) || SORT_BY_OPTIONS[0];
        if (!option.value) return galleryOrder.slice();

        const direction = viewOptions.sortReversed ? -1 : 1;
        return galleryOrder
            .map((figure, index) => ({ figure, index, value: option.value(figure) }))
            .sort((a, b) => {
                if (a.value === null || b.value === null) {
                    return (a.value === null) - (b.value === null) || a.index - b.index;
                }
                return direction * option.compare(a.value, b.value) || a.index - b.index;
            })
            .map(entry => entry.figure);
    }

    // The figures go in the new order; grouped, the groups are built again.
    function applySortBy() {
        galleryFigures = sortGalleryFigures();
        if (isGalleryGrouped()) {
            applyGroupBy(groupBy);
        } else {
            const fragment = document.createDocumentFragment();
            galleryFigures.forEach(figure => fragment.appendChild(figure));
            gallery.appendChild(fragment);
            refreshIconGrid();
            window.dispatchEvent(new CustomEvent('galleryRearranged'));
        }
        syncSortByControls();
    }

    function setSortBy(key, reversed = false) {
        if (!getSortByOption(key)) return;
        if (key === viewOptions.sortBy && reversed === viewOptions.sortReversed) return;

        viewOptions.sortBy = key;
        viewOptions.sortReversed = key !== 'none' && reversed;
        saveViewOptions();
        applySortBy();
    }

    function renderSortByControls() {
        const options = SORT_BY_OPTIONS.filter(option => option.isAvailable !== false);

        if (sortByMenu) {
            const menuRows = [];
            options.forEach(option => {
                const row = document.createElement('li');
                row.dataset.sortBy = option.key;
                row.textContent = option.label;
                menuRows.push(row);
                if (option.key === 'none') menuRows.push(Object.assign(document.createElement('li'), { className: 'separator' }));
            });
            const reverse = document.createElement('li');
            reverse.dataset.sortReverse = '';
            reverse.textContent = 'Reverse Order';
            menuRows.push(Object.assign(document.createElement('li'), { className: 'separator' }), reverse);
            sortByMenu.querySelector('ul').replaceChildren(...menuRows);
        }

        if (sidebarSortByList) {
            sidebarSortByList.replaceChildren(...options.map(option => {
                const button = document.createElement('button');
                button.className = 'sidebar-option';
                button.type = 'button';
                button.dataset.sortBy = option.key;
                button.textContent = option.label;
                return button;
            }));
        }

        if (viewOptionsSortBy) {
            const popupItems = [];
            options.forEach(option => {
                popupItems.push(new Option(option.label, option.key));
                if (option.key === 'none') popupItems.push(document.createElement('hr'));
            });
            viewOptionsSortBy.replaceChildren(...popupItems);
        }

        syncSortByControls();
    }

    function syncSortByControls() {
        const key = viewOptions.sortBy;
        if (sortByMenu) {
            sortByMenu.querySelectorAll('[data-sort-by]').forEach(row => {
                row.classList.toggle('is-checked', row.dataset.sortBy === key);
            });
            const reverse = sortByMenu.querySelector('[data-sort-reverse]');
            reverse.classList.toggle('is-checked', viewOptions.sortReversed);
            reverse.classList.toggle('is-disabled', key === 'none');
        }

        if (sidebarSortByList) {
            sidebarSortByList.querySelectorAll('[data-sort-by]').forEach(button => {
                const isActive = button.dataset.sortBy === key;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
        }

        if (viewOptionsSortBy) viewOptionsSortBy.value = key;
    }

    // Called once the gallery has loaded, before Group By builds its groups.
    function loadSortBy() {
        galleryOrder = galleryFigures.slice();
        SORT_BY_OPTIONS.forEach(option => {
            option.isAvailable = !option.value || galleryOrder.some(figure => option.value(figure) !== null);
        });
        if (!getSortByOption(viewOptions.sortBy)) {
            viewOptions.sortBy = 'none';
            viewOptions.sortReversed = false;
        }

        renderSortByControls();
        if (viewOptions.sortBy !== 'none') applySortBy();
    }

    if (sortByMenu) {
        sortByMenu.addEventListener('click', event => {
            const row = event.target.closest('[data-sort-by], [data-sort-reverse]');
            if (!row || row.classList.contains('is-disabled')) return;

            if (galleryContextMenuElement) galleryContextMenuElement.style.display = 'none';
            hideContextSubmenus();
            if (row.dataset.sortBy === undefined) {
                setSortBy(viewOptions.sortBy, !viewOptions.sortReversed);
            } else if (row.dataset.sortBy === viewOptions.sortBy) {
                setSortBy(viewOptions.sortBy, !viewOptions.sortReversed && viewOptions.sortBy !== 'none');
            } else {
                setSortBy(row.dataset.sortBy);
            }
        });
    }

    if (sidebarSortByList) {
        sidebarSortByList.addEventListener('click', event => {
            const button = event.target.closest('[data-sort-by]');
            if (button && button.dataset.sortBy !== viewOptions.sortBy) setSortBy(button.dataset.sortBy);
        });
    }

    if (viewOptionsSortBy) {
        viewOptionsSortBy.addEventListener('change', () => setSortBy(viewOptionsSortBy.value));
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

    // --- Refactored Marquee and Auto-Scroll Functions ---

    const MARQUEE_SCROLL_EDGE_OVERSCAN = 1;
    const MARQUEE_EDGE_CONTACT_TOLERANCE = 1;
    const MARQUEE_EDGE_HIGHLIGHT_COLOR = 'rgba(var(--ink-rgb), 0.92)';
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    function getViewportBounds() {
        const viewport = window.visualViewport;

        if (viewport) {
            return {
                left: viewport.offsetLeft,
                top: viewport.offsetTop,
                right: viewport.offsetLeft + viewport.width,
                bottom: viewport.offsetTop + viewport.height
            };
        }

        return {
            left: 0,
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight
        };
    }

    function getSidebarGutterHighlightRect() {
        if (!sidebar || document.body.classList.contains('is-sidebar-collapsed')) {
            return null;
        }

        const sidebarRect = sidebar.getBoundingClientRect();
        const viewportBounds = getViewportBounds();
        const right = Math.min(viewportBounds.right, sidebarRect.right);

        if (right <= viewportBounds.left) {
            return null;
        }

        return {
            left: viewportBounds.left,
            top: viewportBounds.top,
            right: right,
            bottom: viewportBounds.bottom
        };
    }

    function hideMarqueeGutterHighlight() {
        if (!marqueeGutterHighlight) return;

        marqueeGutterHighlight.style.visibility = 'hidden';
        marqueeGutterHighlight.style.width = '0px';
        marqueeGutterHighlight.style.height = '0px';
        setMarqueeGutterHighlightEdges();
    }

    function setMarqueeGutterHighlightEdges(edgeContact = {}) {
        if (!marqueeGutterHighlight) return;

        marqueeGutterHighlight.style.setProperty(
            '--marquee-gutter-highlight-top',
            edgeContact.top ? MARQUEE_EDGE_HIGHLIGHT_COLOR : 'transparent'
        );
        marqueeGutterHighlight.style.setProperty(
            '--marquee-gutter-highlight-right',
            edgeContact.right ? MARQUEE_EDGE_HIGHLIGHT_COLOR : 'transparent'
        );
        marqueeGutterHighlight.style.setProperty(
            '--marquee-gutter-highlight-bottom',
            edgeContact.bottom ? MARQUEE_EDGE_HIGHLIGHT_COLOR : 'transparent'
        );
        marqueeGutterHighlight.style.setProperty(
            '--marquee-gutter-highlight-left',
            edgeContact.left ? MARQUEE_EDGE_HIGHLIGHT_COLOR : 'transparent'
        );
    }

    function getViewportEdgeContact(rect, viewportBounds) {
        return {
            left: Math.abs(rect.left - viewportBounds.left) <= MARQUEE_EDGE_CONTACT_TOLERANCE,
            top: Math.abs(rect.top - viewportBounds.top) <= MARQUEE_EDGE_CONTACT_TOLERANCE,
            right: Math.abs(rect.right - viewportBounds.right) <= MARQUEE_EDGE_CONTACT_TOLERANCE,
            bottom: Math.abs(rect.bottom - viewportBounds.bottom) <= MARQUEE_EDGE_CONTACT_TOLERANCE
        };
    }

    function hasViewportEdgeContact(edgeContact) {
        return edgeContact.left || edgeContact.top || edgeContact.right || edgeContact.bottom;
    }

    function updateMarqueeGutterHighlight(visibleMarqueeRect, galleryRect) {
        if (!marqueeGutterHighlight || visibleMarqueeRect.w <= 0 || visibleMarqueeRect.h <= 0) {
            hideMarqueeGutterHighlight();
            return;
        }

        const gutterRect = getSidebarGutterHighlightRect();

        if (!gutterRect) {
            hideMarqueeGutterHighlight();
            return;
        }

        const marqueeRect = {
            left: galleryRect.left + visibleMarqueeRect.x,
            top: galleryRect.top + visibleMarqueeRect.y,
            right: galleryRect.left + visibleMarqueeRect.x + visibleMarqueeRect.w,
            bottom: galleryRect.top + visibleMarqueeRect.y + visibleMarqueeRect.h
        };
        const viewportEdgeContact = getViewportEdgeContact(marqueeRect, getViewportBounds());

        if (!hasViewportEdgeContact(viewportEdgeContact)) {
            hideMarqueeGutterHighlight();
            return;
        }

        const intersection = {
            left: Math.max(marqueeRect.left, gutterRect.left),
            top: Math.max(marqueeRect.top, gutterRect.top),
            right: Math.min(marqueeRect.right, gutterRect.right),
            bottom: Math.min(marqueeRect.bottom, gutterRect.bottom)
        };

        if (intersection.right <= intersection.left || intersection.bottom <= intersection.top) {
            hideMarqueeGutterHighlight();
            return;
        }

        marqueeGutterHighlight.style.visibility = 'visible';
        marqueeGutterHighlight.style.left = `${marqueeRect.left}px`;
        marqueeGutterHighlight.style.top = `${marqueeRect.top}px`;
        marqueeGutterHighlight.style.width = `${marqueeRect.right - marqueeRect.left}px`;
        marqueeGutterHighlight.style.height = `${marqueeRect.bottom - marqueeRect.top}px`;
        marqueeGutterHighlight.style.setProperty('--marquee-gutter-mask-x', `${gutterRect.left - marqueeRect.left}px`);
        marqueeGutterHighlight.style.setProperty('--marquee-gutter-mask-y', `${gutterRect.top - marqueeRect.top}px`);
        marqueeGutterHighlight.style.setProperty('--marquee-gutter-mask-width', `${gutterRect.right - gutterRect.left}px`);
        setMarqueeGutterHighlightEdges(viewportEdgeContact);
        marqueeGutterHighlight.style.setProperty('--marquee-gutter-clip-top', `${intersection.top - marqueeRect.top}px`);
        marqueeGutterHighlight.style.setProperty('--marquee-gutter-clip-right', `${marqueeRect.right - intersection.right}px`);
        marqueeGutterHighlight.style.setProperty('--marquee-gutter-clip-bottom', `${marqueeRect.bottom - intersection.bottom}px`);
        marqueeGutterHighlight.style.setProperty('--marquee-gutter-clip-left', `${intersection.left - marqueeRect.left}px`);
    }

    // Where the gallery's own point (0, 0) is in the window. Sideways the
    // gallery scrolls inside itself, so its content moves under its box, and
    // gallery coordinates go with the content.
    function getGalleryOrigin() {
        const rect = gallery.getBoundingClientRect();
        return { left: rect.left - gallery.scrollLeft, top: rect.top - gallery.scrollTop };
    }

    function getClampedMarqueePoint(clientX, clientY, galleryRect) {
        const viewportBounds = getViewportBounds();

        return {
            x: clamp(clientX, viewportBounds.left, viewportBounds.right) - galleryRect.left,
            y: clamp(clientY, viewportBounds.top, viewportBounds.bottom) - galleryRect.top
        };
    }

    function updateMarqueeUpScrollState() {
        if (scrollSpeedY < 0) {
            hasAutoScrolledUpDuringMarquee = window.scrollY < marqueeStartScrollY;
            return;
        }

        if (hasAutoScrolledUpDuringMarquee && window.scrollY >= marqueeStartScrollY) {
            hasAutoScrolledUpDuringMarquee = false;
        }
    }

    // Items keep their place in the gallery while it scrolls, so a drag measures
    // them once. Reading every rect on every move forced a layout of the whole
    // grid each time the previous move had changed the selection. The range,
    // a top and bottom in the gallery, is what the caller needs; only the
    // grouped gallery measures by it.
    function getMarqueeItemRects(galleryRect, range) {
        if (isGalleryGrouped()) return getGroupedItemRects(galleryRect, range);
        if (marqueeItemRects) return marqueeItemRects;

        marqueeItemRects = [];
        for (const item of items) {
            if (item.style.display === 'none') continue;

            const itemRect = item.getBoundingClientRect();
            marqueeItemRects.push({
                item,
                left: itemRect.left - galleryRect.left,
                top: itemRect.top - galleryRect.top,
                right: itemRect.right - galleryRect.left,
                bottom: itemRect.bottom - galleryRect.top,
                hitBox: null
            });
        }

        return marqueeItemRects;
    }

    // --- Item Hit Boxes ---
    // As in Binder's icon view, after Finder, an item is hit where it draws: its
    // thumbnail, every pixel of the thumbnail's shadow with any alpha (Finder
    // tests QuickLook's thumbnail image, which has the shadow baked in), the
    // filename and the dimensions line. Until the thumbnail loads, the kind icon
    // drawn in its place is hit wherever it has any alpha. The rest of the
    // figure is background, like the space around a Finder icon. A selected
    // thumbnail trades its shadow for Photos' selection ring and the gold glow
    // cast from it, which play Finder's selection box: a click tests whichever
    // is drawn, the marquee always the shadow.

    // Safari, and every iOS browser, is WebKit, which leaves the shadows it
    // paints on screen to Core Graphics.
    const drawsShadowsLikeWebKit = navigator.vendor === 'Apple Computer, Inc.';
    const hitTextRange = document.createRange();
    const kindIconMasks = new Map();
    let thumbnailShadows = null;

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
        thumbnailShadows = null;
    });

    function isEmptyRect(rect) {
        return !rect || rect.right <= rect.left || rect.bottom <= rect.top;
    }

    function rectsIntersect(a, b) {
        return !isEmptyRect(a) && !isEmptyRect(b) &&
            a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }

    function rectContains(outer, inner) {
        return outer.left <= inner.left && outer.right >= inner.right &&
            outer.top <= inner.top && outer.bottom >= inner.bottom;
    }

    function rectContainsPoint(rect, x, y) {
        return !isEmptyRect(rect) && x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
    }

    // The first shadow of a computed box-shadow, such as
    // "rgba(0, 0, 0, 0.28) 0px 4px 14px 0px". An inset shadow falls inside the
    // thumbnail, which counts anyway.
    function parseBoxShadow(value) {
        const shadow = value.split(/,(?![^(]*\))/)[0];
        const color = shadow.match(/rgba?\(([^)]*)\)/);
        if (!color || /\binset\b/.test(shadow)) return null;

        const channels = color[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
        const alpha = channels.length > 3 ? channels[3] : 1;
        const [x = 0, y = 0, blur = 0, spread = 0] =
            shadow.replace(color[0], '').trim().split(/\s+/).map(parseFloat);
        return alpha > 0 ? { x, y, blur, spread, alpha } : null;
    }

    // The thumbnail shadow and the selection glow for the current appearance,
    // and how far the selection ring stands past the picture.
    // A probe in the gallery resolves the tokens as the gallery has them (its
    // background can give it the light ones), in px and rgba().
    function getThumbnailShadows() {
        if (thumbnailShadows) return thumbnailShadows;

        const probe = document.createElement('div');
        probe.style.display = 'none';
        gallery.appendChild(probe);
        const resolve = token => {
            probe.style.boxShadow = `var(${token})`;
            return parseBoxShadow(getComputedStyle(probe).boxShadow);
        };
        const artwork = resolve('--thumb-glow');
        const selection = resolve('--accent-glow');
        probe.remove();
        const style = getComputedStyle(gallery);
        const ring = parseFloat(style.getPropertyValue('--selection-ring-gap')) +
            parseFloat(style.getPropertyValue('--selection-ring-width'));

        // How far past its figure an item's hit box can reach: a blurred shadow
        // is gone 3σ (1.5 blur radii) past its rect, and a click is a pixel wide.
        const reachOf = shadow => shadow
            ? Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) + shadow.spread + 1.5 * shadow.blur
            : 0;
        thumbnailShadows = { artwork, selection, ring, reach: Math.max(reachOf(artwork), ring + reachOf(selection)) + 1 };
        return thumbnailShadows;
    }

    // Abramowitz and Stegun 7.1.26, good to 1.5e-7: far finer than the half
    // step of 8-bit alpha that decides whether a pixel is drawn.
    function erf(x) {
        const t = 1 / (1 + 0.3275911 * Math.abs(x));
        const y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 +
            t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
        return x < 0 ? -y : y;
    }

    // The card's corner radius as it is drawn. CSS scales a box's radii down
    // until adjacent ones fit along each side, which for four equal radii
    // clamps them to half the shorter side.
    function clampCardRadius(card, radius) {
        return clamp(radius, 0, Math.min(card.right - card.left, card.bottom - card.top) / 2);
    }

    // The thumbnail's radius, in px. CSS would take a percentage of each side,
    // an ellipse; this takes it of the shorter one, keeping the corner a circle.
    // A selected thumbnail's box takes in its ring, `inset` past the picture,
    // its radius grown by as much.
    function getCardRadius(img, card, inset = 0) {
        const value = getComputedStyle(img).borderTopLeftRadius;
        const shorter = Math.min(card.right - card.left, card.bottom - card.top);
        const radius = value.endsWith('%') ? parseFloat(value) / 100 * shorter : parseFloat(value);
        return clampCardRadius(card, (radius || 0) - inset);
    }

    // A selected thumbnail's box takes in its selection ring, as border and
    // padding around the picture, which stays its content box.
    function getSelectionRingInset(img) {
        const style = getComputedStyle(img);
        return parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
    }

    function insetRect(rect, inset) {
        return { left: rect.left + inset, top: rect.top + inset, right: rect.right - inset, bottom: rect.bottom - inset };
    }

    // A selected thumbnail draws out to its ring, whose edges are concentric
    // with the picture. The clear gap between counts with it: a click there is
    // on the item.
    function getSelectionRingHitBox(hitBox, ring) {
        if (!hitBox.isLoaded) return hitBox;
        return { ...hitBox, card: insetRect(hitBox.card, -ring), radius: hitBox.radius + ring };
    }

    // Whether `probe` touches the rounded card: between the corners the card is
    // its rect, in a corner the quarter circle. A pixel the curve only grazes
    // still draws some alpha, so touching counts.
    function roundedRectIntersects(probe, card, radius) {
        if (!rectsIntersect(probe, card)) return false;
        if (radius <= 0) return true;

        // How far the probe stays from the rect the corner circles are centred on.
        const dx = Math.max(card.left + radius - probe.right, probe.left - (card.right - radius), 0);
        const dy = Math.max(card.top + radius - probe.bottom, probe.top - (card.bottom - radius), 0);
        return dx * dx + dy * dy < radius * radius;
    }

    // 16-point Gauss-Legendre on [-1, 1], one half of its symmetric nodes.
    const legendreNodes = [0.0950125098376374, 0.2816035507792589, 0.4580167776572274, 0.6178762444026438,
        0.7554044083550030, 0.8656312023878318, 0.9445750230732326, 0.9894009349916499];
    const legendreWeights = [0.1894506104550685, 0.1826034150449236, 0.1691565193950025, 0.1495959888165767,
        0.1246289712555339, 0.0951585116824928, 0.0622535239386479, 0.0271524594117541];

    // What one corner cap of a blurred rounded rect gives a point: the cap's
    // rows, each a sharp span blurred across, weighted by the Gaussian down.
    // `offset` is how far past the cap's base line the point lies, toward the
    // cap. Rows rise d = r sin φ from the base, which keeps the integrand
    // smooth; only rows within the kernel's reach of the point count.
    function getGaussianCapCoverage(x, offset, left, right, radius, sigma, reach, coverage) {
        const from = Math.max(0, offset - reach);
        const to = Math.min(radius, offset + reach);
        if (to <= from) return 0;

        const start = Math.asin(from / radius);
        const end = Math.asin(Math.min(1, to / radius));
        const middle = (start + end) / 2;
        const half = (end - start) / 2;
        let sum = 0;
        for (let i = 0; i < 16; i++) {
            const angle = middle + half * (i < 8 ? -legendreNodes[i] : legendreNodes[i - 8]);
            const rise = radius * Math.sin(angle);
            const width = radius * Math.cos(angle);
            const z = (offset - rise) / sigma;
            sum += legendreWeights[i % 8] * Math.exp(-z * z / 2) * width *
                coverage(x, left + radius - width, right - radius + width);
        }
        return sum * half / (sigma * Math.sqrt(2 * Math.PI));
    }

    // How an engine blurs a shadow on screen: a Gaussian of σ = blur / 2, as
    // the spec has it, cut off `reach` σ out; whether the coverage becomes an
    // 8-bit mask before the colour's alpha scales it; and the least alpha, in
    // 255ths, that still draws. Measured against each, to a device px on a
    // straight edge.
    // Safari's layers paint into IOSurfaces, where WebKit leaves shadows to
    // Core Graphics (GraphicsContextCG::canUseShadowBlur is for bitmaps only):
    // CG works a rect's shadow out exactly, and blurs a rounded rect's from a
    // mask, floored. Chrome's Skia multiplies two 8-bit edge profiles for a
    // rect, and keeps a rounded rect's as an 8-bit mask.
    const shadowKernels = drawsShadowsLikeWebKit ? {
        rect: { reach: 2.85, mask: 'none', least: 0.5 },
        rounded: { reach: 3.1, mask: 'floor', least: 0.58 }
    } : {
        rect: { reach: Infinity, mask: 'axes', least: 0.5 },
        rounded: { reach: 3.2, mask: 'round', least: 0.5 }
    };

    // A shadow's 8-bit alpha at (x, y): its rounded rect blurred by the
    // engine's Gaussian. The straight band between the corners blurs one axis
    // at a time; the two corner caps are summed row by row.
    function getGaussianShadowAlpha(x, y, rect, shadow, radius = 0,
        kernel = radius > 0 ? shadowKernels.rounded : shadowKernels.rect) {
        if (shadow.blur === 0) {
            const dx = Math.max(rect.left + radius - x, x - (rect.right - radius), 0);
            const dy = Math.max(rect.top + radius - y, y - (rect.bottom - radius), 0);
            const isInside = x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom &&
                dx * dx + dy * dy <= radius * radius;
            return isInside ? Math.round(shadow.alpha * 255) : 0;
        }

        const sigma = shadow.blur / 2;
        const scale = sigma * Math.SQRT2;
        // Past 5σ an uncut Gaussian adds less than a 255th of a 255th. A cut
        // one is weighted up to sum to 1.
        const reach = Math.min(kernel.reach, 5) * sigma;
        const total = kernel.reach < 5 ? erf(kernel.reach / Math.SQRT2) : 1;
        const coverage = (u, from, to) => to <= from ? 0 :
            (erf(clamp(to - u, -reach, reach) / scale) - erf(clamp(from - u, -reach, reach) / scale)) / 2 / total;

        // Past the kernel's reach of the rect nothing is drawn.
        if (!roundedRectIntersects({ left: x - reach, top: y - reach, right: x + reach, bottom: y + reach }, rect, radius)) {
            return 0;
        }
        // Beside a straight edge, out of the corners' reach, only that edge counts.
        let across = 1;
        let down = 1;
        let sum;
        if (x >= rect.left + radius + reach && x <= rect.right - radius - reach) {
            sum = down = coverage(y, rect.top, rect.bottom);
        } else if (y >= rect.top + radius + reach && y <= rect.bottom - radius - reach) {
            sum = across = coverage(x, rect.left, rect.right);
        } else {
            across = coverage(x, rect.left, rect.right);
            down = coverage(y, rect.top + radius, rect.bottom - radius);
            sum = across * down;
            if (radius > 0) {
                sum += getGaussianCapCoverage(x, rect.top + radius - y, rect.left, rect.right, radius, sigma, reach, coverage) / total;
                sum += getGaussianCapCoverage(x, y - (rect.bottom - radius), rect.left, rect.right, radius, sigma, reach, coverage) / total;
            }
        }
        const covered =
            kernel.mask === 'axes' ? Math.round(255 * across) * Math.round(255 * down) / 255 :
            kernel.mask === 'floor' ? Math.floor(255 * sum + 1e-9) :
            kernel.mask === 'round' ? Math.round(255 * sum) : 255 * sum;
        return Math.floor(covered * shadow.alpha + 1 - kernel.least);
    }

    // Whether a shadow draws a device pixel with any alpha in `probe`. Its alpha
    // only falls off away from the middle of its rect, rounded or not, so the
    // probe's pixel nearest that middle decides.
    function shadowDrawsIn(probe, card, shadow, radius = 0) {
        if (!shadow) return false;

        const rect = {
            left: card.left + shadow.x - shadow.spread,
            top: card.top + shadow.y - shadow.spread,
            right: card.right + shadow.x + shadow.spread,
            bottom: card.bottom + shadow.y + shadow.spread
        };
        // A spread grows a rounded corner with it.
        const shadowRadius = radius > 0 ? clampCardRadius(rect, radius + shadow.spread) : 0;
        const half = 0.5 / window.devicePixelRatio;
        const nearest = (middle, from, to) => clamp(middle, from + half, Math.max(from + half, to - half));
        const x = nearest((rect.left + rect.right) / 2, probe.left, probe.right);
        const y = nearest((rect.top + rect.bottom) / 2, probe.top, probe.bottom);
        return getGaussianShadowAlpha(x, y, rect, shadow, shadowRadius) > 0;
    }

    // The kind icon a figure draws until its thumbnail loads: the figure's
    // background, a square concentric with the thumbnail's container.
    function getKindIconURL(style) {
        const url = style.backgroundImage.match(/url\("?(.*?)"?\)/);
        return url ? url[1] : null;
    }

    function getKindIconRect(item, canvas) {
        const style = getComputedStyle(item);
        const url = getKindIconURL(style);
        if (!url) return null;

        const half = parseFloat(style.backgroundSize) / 2;
        const x = (canvas.left + canvas.right) / 2;
        const y = (canvas.top + canvas.bottom) / 2;
        return { url, left: x - half, top: y - half, right: x + half, bottom: y + half };
    }

    // Which pixels of a kind icon have any alpha, as a summed-area table so a
    // band's whole overlap is counted at once. Finder tests an icon with
    // -[NSImage hitTestRect:withImageDestinationRect:...], alpha > 0. The table
    // is built once the image decodes; until then the icon is not hit.
    function getKindIconMask(url) {
        if (kindIconMasks.has(url)) return kindIconMasks.get(url);

        kindIconMasks.set(url, null);
        const image = new Image();
        image.onload = () => {
            const width = image.naturalWidth;
            const height = image.naturalHeight;
            const context = Object.assign(document.createElement('canvas'), { width, height })
                .getContext('2d', { willReadFrequently: true });
            context.drawImage(image, 0, 0);
            const pixels = context.getImageData(0, 0, width, height).data;
            const stride = width + 1;
            const sums = new Uint32Array(stride * (height + 1));
            // And the icon's ink, the bounds of its pixels at least half opaque,
            // for the download button to sit on (Binder's inkUnitRect).
            let inkLeft = width, inkTop = height, inkRight = 0, inkBottom = 0;
            for (let y = 0; y < height; y++) {
                let row = 0;
                for (let x = 0; x < width; x++) {
                    const alpha = pixels[(y * width + x) * 4 + 3];
                    if (alpha > 0) row++;
                    if (alpha >= 128) {
                        inkLeft = Math.min(inkLeft, x);
                        inkTop = Math.min(inkTop, y);
                        inkRight = Math.max(inkRight, x + 1);
                        inkBottom = Math.max(inkBottom, y + 1);
                    }
                    sums[(y + 1) * stride + x + 1] = sums[y * stride + x + 1] + row;
                }
            }
            const ink = { left: inkLeft / width, top: inkTop / height, right: inkRight / width, bottom: inkBottom / height };
            kindIconMasks.set(url, { width, height, sums, ink });
        };
        image.src = url;
        return null;
    }

    // The masks are ready by the first click: every kind in the gallery, at
    // the size drawn. A hidden figure of each kind tells which image that is,
    // since a figure showing its thumbnail draws none.
    function preloadKindIconMasks() {
        const kinds = new Set(Array.from(items, item => item.dataset.kind));
        const probe = document.createElement('figure');
        probe.style.display = 'none';
        gallery.appendChild(probe);
        kinds.forEach(kind => {
            probe.dataset.kind = kind;
            const url = getKindIconURL(getComputedStyle(probe));
            if (url) getKindIconMask(url);
        });
        probe.remove();
    }

    document.addEventListener('galleryLoaded', preloadKindIconMasks);

    // Whether a kind icon draws a pixel with any alpha in `probe`.
    function kindIconDrawsIn(probe, icon) {
        const mask = icon && getKindIconMask(icon.url);
        if (!mask) return false;

        const scaleX = mask.width / (icon.right - icon.left);
        const scaleY = mask.height / (icon.bottom - icon.top);
        const left = clamp(Math.floor((probe.left - icon.left) * scaleX), 0, mask.width);
        const right = clamp(Math.ceil((probe.right - icon.left) * scaleX), 0, mask.width);
        const top = clamp(Math.floor((probe.top - icon.top) * scaleY), 0, mask.height);
        const bottom = clamp(Math.ceil((probe.bottom - icon.top) * scaleY), 0, mask.height);
        if (right <= left || bottom <= top) return false;

        const stride = mask.width + 1;
        const sums = mask.sums;
        return sums[bottom * stride + right] - sums[top * stride + right] -
            sums[bottom * stride + left] + sums[top * stride + left] > 0;
    }

    // What an item draws, in gallery coordinates: its canvas (the thumbnail's
    // container), the thumbnail or, until it loads, the kind icon, the filename
    // and the dimensions text. Measured only for items a click or the band
    // comes near, and kept for the rest of the drag, until the thumbnail loads.
    function getItemHitBox(entry, galleryRect) {
        const item = entry.item;
        if (entry.hitBox && entry.hitBox.isLoaded === showsThumbnail(item)) {
            return entry.hitBox;
        }

        const toGallery = rect => ({
            left: rect.left - galleryRect.left,
            top: rect.top - galleryRect.top,
            right: rect.right - galleryRect.left,
            bottom: rect.bottom - galleryRect.top
        });
        // The thumbnail, and its shadow with it, is painted snapped to device
        // pixels of the viewport.
        const snap = u => Math.round(u * window.devicePixelRatio) / window.devicePixelRatio;
        const snapped = rect => ({
            left: snap(rect.left),
            top: snap(rect.top),
            right: snap(rect.right),
            bottom: snap(rect.bottom)
        });
        // The dimensions line is a block as wide as the caption; only its text draws.
        const textRect = element => {
            if (!element) return null;
            hitTextRange.selectNodeContents(element);
            return toGallery(hitTextRange.getBoundingClientRect());
        };
        const hitBox = {
            isLoaded: showsThumbnail(item),
            canvas: toGallery(item.querySelector('.image-container').getBoundingClientRect()),
            name: textRect(item.querySelector('.filename')),
            info: textRect(item.querySelector('.dimensions'))
        };
        if (hitBox.isLoaded) {
            // The card is the picture, without the ring a selected box takes in.
            const img = item.querySelector('img');
            const ring = getSelectionRingInset(img);
            hitBox.card = insetRect(toGallery(snapped(img.getBoundingClientRect())), ring);
            hitBox.radius = getCardRadius(img, hitBox.card, ring);
        } else {
            hitBox.icon = getKindIconRect(item, hitBox.canvas);
        }

        entry.hitBox = hitBox;
        return hitBox;
    }

    // Finder's image view: the band or click touches the rounded thumbnail or a
    // pixel of its shadow, or a pixel of the kind icon before the thumbnail
    // loads. A band around the whole canvas counts either way.
    function hitsArtwork(probe, hitBox, shadow) {
        if (rectContains(probe, hitBox.canvas)) return true;
        if (!hitBox.isLoaded) return kindIconDrawsIn(probe, hitBox.icon);
        return roundedRectIntersects(probe, hitBox.card, hitBox.radius) ||
            shadowDrawsIn(probe, hitBox.card, shadow, hitBox.radius);
    }

    // Finder's -[TIconView _hitTestWithLocalPoint:]: the thumbnail and its
    // shadow, or the selection ring and the glow cast from it, which replace
    // the shadow while they show, or the kind icon, the filename, the
    // dimensions.
    function isPointInItemHitBox(entry, x, y, galleryRect) {
        const hitBox = getItemHitBox(entry, galleryRect);
        const probe = { left: x, top: y, right: x + 1, bottom: y + 1 };
        const shadows = getThumbnailShadows();
        const isItemSelected = isSelected(entry.item);
        const artwork = isItemSelected ? getSelectionRingHitBox(hitBox, shadows.ring) : hitBox;
        const shadow = isItemSelected ? shadows.selection : shadows.artwork;
        return hitsArtwork(probe, artwork, shadow) ||
            rectContainsPoint(hitBox.name, x, y) ||
            rectContainsPoint(hitBox.info, x, y);
    }

    // Finder's -[TIconView isIconOrTextInRect:]. The selection glow never counts,
    // so what the band takes in doesn't change as it selects.
    function doesBandHitItem(band, entry, galleryRect) {
        // An item of a collapsed row is hit only where the row shows it.
        if (entry.clip) {
            band = intersectRects(band, entry.clip);
            if (isEmptyRect(band)) return false;
        }

        const shadows = getThumbnailShadows();
        if (band.left >= entry.right + shadows.reach || band.right <= entry.left - shadows.reach ||
            band.top >= entry.bottom + shadows.reach || band.bottom <= entry.top - shadows.reach) {
            return false;
        }
        // A band around the whole figure takes in its thumbnail or kind icon.
        if (rectContains(band, entry)) return true;

        const hitBox = getItemHitBox(entry, galleryRect);
        return rectsIntersect(band, hitBox.name) || rectsIntersect(band, hitBox.info) ||
            hitsArtwork(band, hitBox, shadows.artwork);
    }

    // The item a click at a viewport point hits, or null. Later figures paint on
    // top, so they are tried first. Outside a drag a search may have changed the
    // gallery since it was last measured, so it is measured afresh.
    function getItemAtPoint(clientX, clientY) {
        if (!isMarquee) marqueeItemRects = null;

        const galleryRect = getGalleryOrigin();
        const x = clientX - galleryRect.left;
        const y = clientY - galleryRect.top;
        const reach = getThumbnailShadows().reach;
        const entries = getMarqueeItemRects(galleryRect, { top: y - reach, bottom: y + reach });
        for (let i = entries.length - 1; i >= 0; i--) {
            const entry = entries[i];
            if (x < entry.left - reach || x >= entry.right + reach ||
                y < entry.top - reach || y >= entry.bottom + reach) {
                continue;
            }
            if (entry.clip && !rectContainsPoint(entry.clip, x, y)) continue;
            if (isPointInItemHitBox(entry, x, y, galleryRect)) return entry.item;
        }
        return null;
    }

    function updateMarqueeAndSelection(clientX, clientY, isModifier) {
        marquee.style.visibility = 'visible';

        const galleryRect = getGalleryOrigin();
        const viewportBounds = getViewportBounds();
        const viewportRect = {
            left: viewportBounds.left - galleryRect.left,
            top: viewportBounds.top - galleryRect.top,
            right: viewportBounds.right - galleryRect.left,
            bottom: viewportBounds.bottom - galleryRect.top
        };
        const currentPoint = getClampedMarqueePoint(clientX, clientY, galleryRect);
        const isDraggingRight = currentPoint.x >= startPos.x;
        const isDraggingDown = currentPoint.y >= startPos.y;
        const selectionLeft = isDraggingRight ? startPos.x : currentPoint.x;
        const selectionTop = isDraggingDown ? startPos.y : currentPoint.y;
        const selectionRight = isDraggingRight ? currentPoint.x + 1 : startPos.x + 1;
        const selectionBottom = isDraggingDown ? currentPoint.y + 1 : startPos.y + 1;
        const isAutoScrollingUp = scrollSpeedY < 0;
        const isSelectionPastViewportTop = selectionTop < viewportRect.top;
        const isSelectionAtOrPastViewportBottom = selectionBottom >= viewportRect.bottom;
        const shouldOverscanBottom =
            hasAutoScrolledUpDuringMarquee && isSelectionAtOrPastViewportBottom;
        const visibleLeft = clamp(selectionLeft, viewportRect.left, viewportRect.right);
        const visibleRight = clamp(selectionRight, viewportRect.left, viewportRect.right);
        const visibleTop = isAutoScrollingUp
            ? selectionTop - MARQUEE_SCROLL_EDGE_OVERSCAN
            : (isSelectionPastViewportTop ? selectionTop : clamp(selectionTop, viewportRect.top, viewportRect.bottom));
        const visibleBottom = shouldOverscanBottom
            ? selectionBottom + MARQUEE_SCROLL_EDGE_OVERSCAN
            : clamp(selectionBottom, viewportRect.top, viewportRect.bottom);

        const selectionRect = {
            x: selectionLeft,
            y: selectionTop,
            w: Math.max(0, selectionRight - selectionLeft),
            h: Math.max(0, selectionBottom - selectionTop)
        };

        const visibleMarqueeRect = {
            x: visibleLeft,
            y: visibleTop,
            w: Math.max(0, visibleRight - visibleLeft),
            h: Math.max(0, visibleBottom - visibleTop)
        };

        marquee.style.left = `${visibleMarqueeRect.x}px`;
        marquee.style.top = `${visibleMarqueeRect.y}px`;
        marquee.style.width = `${visibleMarqueeRect.w}px`;
        marquee.style.height = `${visibleMarqueeRect.h}px`;
        updateMarqueeGutterHighlight(visibleMarqueeRect, galleryRect);

        const band = {
            left: selectionRect.x,
            top: selectionRect.y,
            right: selectionRect.x + selectionRect.w,
            bottom: selectionRect.y + selectionRect.h
        };

        for (const itemRect of getMarqueeItemRects(galleryRect, band)) {
            const item = itemRect.item;
            const intersects = doesBandHitItem(band, itemRect, galleryRect);

            if (isModifier) {
                setSelection(item, intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item));
            } else {
                setSelection(item, intersects);
            }
        }

        // Grouped, a group the band hasn't reached isn't measured, and what is
        // selected in it is left as the band leaves any item it misses.
        if (isGalleryGrouped()) settleUnmeasuredSelection(isModifier);
    }

    function autoScrollLoop() {
        if (!isMarquee || !isAutoScrolling) {
            isAutoScrolling = false;
            return;
        }

        window.scrollBy(0, Math.round(scrollSpeedY));
        if (scrollSpeedX !== 0) gallery.scrollBy(Math.round(scrollSpeedX), 0);
        updateMarqueeUpScrollState();
        updateMarqueeAndSelection(lastClientX, lastClientY, lastClientModifierKey);

        requestAnimationFrame(autoScrollLoop);
    }


    // --- MouseDown Listener ---
    wrapper.addEventListener('mousedown', (e) => {
        if (e.target === searchInput) {
            return;
        }

        if (e.button !== 0 || header.contains(e.target) || footer.contains(e.target) ||
            e.target.closest('.all-people-match-row, .all-people-empty-state, .gallery-group-toggle, .item-download-button')) {
            isMarquee = false;
            return;
        }

        if(gallery.contains(e.target) || e.target === gallery) {
            e.preventDefault();
            if (searchInput) searchInput.blur();
        }

        hasDragged = false;
        isMarquee = true;
        hasAutoScrolledUpDuringMarquee = false;
        marqueeStartScrollY = window.scrollY;
        marqueeItemRects = null;
        mouseDownItem = getItemAtPoint(e.clientX, e.clientY);

        const galleryRect = getGalleryOrigin();
        startPos = getClampedMarqueePoint(e.clientX, e.clientY, galleryRect);

        preMarqueeSelectedItems = new Set(selectedItems);
    });

    // --- MouseMove Listener ---
    document.addEventListener('mousemove', (e) => {
        if (!isMarquee) return;
        
        hasDragged = true;
        document.body.classList.add('is-marquee-dragging');
    
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        lastClientModifierKey = e.metaKey || e.ctrlKey || e.shiftKey;

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

        // Sideways, the gallery scrolls along when the pointer nears its ends.
        scrollSpeedX = 0;
        if (isGallerySideways()) {
            const bounds = gallery.getBoundingClientRect();
            if (e.clientX > bounds.right - scrollThreshold) {
                const speedRatio = Math.min(1, (e.clientX - (bounds.right - scrollThreshold)) / scrollThreshold);
                scrollSpeedX = minScrollSpeed + (speedRatio * (maxScrollSpeed - minScrollSpeed));
            } else if (e.clientX < bounds.left + scrollThreshold) {
                const speedRatio = Math.min(1, (bounds.left + scrollThreshold - e.clientX) / scrollThreshold);
                scrollSpeedX = -(minScrollSpeed + (speedRatio * (maxScrollSpeed - minScrollSpeed)));
            }
        }

        updateMarqueeUpScrollState();
        updateMarqueeAndSelection(e.clientX, e.clientY, lastClientModifierKey);

        if ((scrollSpeedY !== 0 || scrollSpeedX !== 0) && !isAutoScrolling) {
            isAutoScrolling = true;
            autoScrollLoop();
        } else if (scrollSpeedY === 0 && scrollSpeedX === 0) {
            isAutoScrolling = false;
        }
    });

    const endDragAction = (e) => {
        isAutoScrolling = false;
        scrollSpeedY = 0;
        scrollSpeedX = 0;
        hasAutoScrolledUpDuringMarquee = false;
        marqueeStartScrollY = 0;

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
            const itemUnderMouse = getItemAtPoint(e.clientX, e.clientY);

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

        isMarquee = false;
        hasDragged = false;
        mouseDownItem = null;
        marquee.style.visibility = 'hidden';
        marquee.style.width = '0px';
        marquee.style.height = '0px';
        hideMarqueeGutterHighlight();
        preMarqueeSelectedItems.clear();
        marqueeItemRects = null;
    };

    document.addEventListener('mouseup', endDragAction);

    document.addEventListener('mousedown', (e) => {
        const itemMenu = document.getElementById('custom-context-menu');
        const galleryMenu = document.getElementById('gallery-context-menu');
        
        // Deselect search pills if clicking outside the search wrapper
        const selectedPill = searchWrapper.querySelector('.search-pill.selected');
        if (selectedPill && !searchWrapper.contains(e.target)) {
            selectedPill.classList.remove('selected');
        }

        const isInMenu = itemMenu.contains(e.target) || galleryMenu.contains(e.target) || isInContextSubmenu(e.target);

        if (e.button === 0 && !isInMenu) {
            itemMenu.style.display = 'none';
            galleryMenu.style.display = 'none';
            hideContextSubmenus();
        }

        if (!wrapper.contains(e.target) && !isInMenu && !isInViewOptions(e.target)) {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                clearSelection();
            }
        }
    });

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

        const figure = getItemAtPoint(e.clientX, e.clientY);

        itemContextMenu.style.display = 'none';
        galleryContextMenu.style.display = 'none';
        hideContextSubmenus();

        if (figure) {
            rightClickedItem = figure;

            if (!selectedItems.has(figure)) {
                clearSelection();
                toggleSelection(figure);
                selectionAnchor = figure;
                lastSelectedItem = figure;
            }

            document.getElementById('context-menu-save').textContent = getSaveImagesTitle(selectedItems);

            itemContextMenu.style.display = 'block';
            itemContextMenu.style.left = `${e.clientX}px`;
            itemContextMenu.style.top = `${e.clientY}px`;

        } else {
            rightClickedItem = null;
            galleryContextMenu.style.display = 'block';
            galleryContextMenu.style.left = `${e.clientX}px`;
            galleryContextMenu.style.top = `${e.clientY}px`;
        }
    });

    // =================================================================
    // START: UNIFIED DOWNLOAD LOGIC
    // =================================================================

    async function fetchImageBlob(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} for URL: ${url}`);
        }
        return response.blob();
    }

    function triggerDownload(blob, filename) {
        saveAs(blob, filename);
    }

    // The save's name, as the item menu and the download button give it. An
    // image shown in more than one group is saved once.
    function getSaveImagesTitle(figures) {
        const count = getDistinctImageItems(figures).length;
        return count > 1 ? `Save ${count} Images to "Downloads"` : 'Save Image to "Downloads"';
    }

    // Saves the images of `figures` to Downloads, each once, with the header's
    // progress ring; a save started while another runs cancels it.
    function saveImages(figures) {
        if (downloadAbortController) {
            downloadAbortController.abort();
        }
        
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

        const updateProgress = (percent) => {
            progressCircle.style.setProperty('--progress-angle', `${percent * 3.6}deg`);
        };
        
        updateProgress(0);

        const performDownloads = async () => {
            let totalDownloaded = 0;
            let totalDownloadSize = 0;

            try {
                const itemsToDownload = getDistinctImageItems(figures);
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
                        const response = await fetch(url, { signal, cache: 'no-store' });
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

                await new Promise(resolve => setTimeout(resolve, 400));
                
                indicator.classList.remove('is-active', 'is-downloading');

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Download canceled by user.');
                } else {
                    console.error("Download failed:", error);
                    alert(`An error occurred during the download: ${error.message}`);
                }
                indicator.classList.remove('is-downloading', 'is-active');
            } finally {
                downloadAbortController = null;
                setTimeout(() => updateProgress(0), 400);
            }
        };

        performDownloads();
    }

    itemContextMenu.addEventListener('click', async (e) => {
        const targetId = e.target.id;
        if (!targetId) return;

        itemContextMenu.style.display = 'none';

        const primaryTarget = rightClickedItem || Array.from(selectedItems)[0];
        if (!primaryTarget) return;

        switch (targetId) {
            case 'context-menu-open': {
                openItem(primaryTarget);
                break;
            }
            case 'context-menu-open-tab': {
                const img = primaryTarget.querySelector('img');
                const fullSrc = img.dataset.fullsrc;
                if (fullSrc) window.open(fullSrc, '_blank');
                break;
            }
            case 'context-menu-save': {
                saveImages(selectedItems);
                break;
            }
        }
        rightClickedItem = null;
    });

    // --- Download Button ---
    // Binder's like heart, which is Photos' favourite badge, as a download: the
    // pointer anywhere over an item's cell shows the button on its picture, and
    // a click saves that image, or the whole selection when the item is part of
    // it, as a heart likes the selection with it. The click doesn't reach the
    // gallery, so the selection stays as it was. One button serves the whole
    // gallery, moved to the cell under the pointer, as Binder makes a heart
    // only for a cell that shows one: thousands of cells gain nothing. A pointer
    // that can't hover, a finger, never shows it.
    const DOWNLOAD_BUTTON_WIDTH = 16;
    const DOWNLOAD_BUTTON_HEIGHT = 18;
    // -[IPXBadgesView badgeEdgeInsets]: 5pt in from each edge of the picture.
    const DOWNLOAD_BUTTON_INSET = 5;

    const downloadButton = document.createElement('button');
    downloadButton.type = 'button';
    downloadButton.className = 'item-download-button';
    downloadButton.tabIndex = -1;
    downloadButton.hidden = true;
    let downloadButtonItem = null;

    // The button follows its picture as the thumbnail lands and as the View
    // Options resize it or swap it for the kind icon.
    const downloadButtonObserver = new ResizeObserver(placeDownloadButton);

    // The picture the button sits on, in viewport coordinates: the thumbnail
    // card, inside a selected one's ring, or, until it loads, the kind icon's
    // ink, the bounds of its pixels at least half opaque, as a heart sits on
    // an icon's ink in Binder.
    function getDownloadButtonArt(item) {
        if (showsThumbnail(item)) {
            const img = item.querySelector('img');
            return insetRect(img.getBoundingClientRect(), getSelectionRingInset(img));
        }

        const icon = getKindIconRect(item, item.querySelector('.image-container').getBoundingClientRect());
        const mask = icon && getKindIconMask(icon.url);
        if (!mask) return null;

        const width = icon.right - icon.left;
        const height = icon.bottom - icon.top;
        return {
            left: icon.left + mask.ink.left * width,
            top: icon.top + mask.ink.top * height,
            right: icon.left + mask.ink.right * width,
            bottom: icon.top + mask.ink.bottom * height
        };
    }

    // Photos' badge frame: its 16×18 image, 5px in from the picture's
    // bottom-left corner, on whole device pixels, the same size at every icon
    // size, and left out where the picture, inset 5px, can't hold it.
    function placeDownloadButton() {
        const art = downloadButtonItem && getDownloadButtonArt(downloadButtonItem);
        if (!art || art.right - art.left - 2 * DOWNLOAD_BUTTON_INSET < DOWNLOAD_BUTTON_WIDTH ||
            art.bottom - art.top - 2 * DOWNLOAD_BUTTON_INSET < DOWNLOAD_BUTTON_HEIGHT) {
            downloadButton.hidden = true;
            return;
        }

        const snap = u => Math.round(u * window.devicePixelRatio) / window.devicePixelRatio;
        const container = downloadButton.parentElement.getBoundingClientRect();
        downloadButton.style.left = `${snap(art.left + DOWNLOAD_BUTTON_INSET) - container.left}px`;
        downloadButton.style.top = `${snap(art.bottom - DOWNLOAD_BUTTON_INSET - DOWNLOAD_BUTTON_HEIGHT) - container.top}px`;
        downloadButton.hidden = false;
    }

    function getDownloadButtonFigures() {
        return isSelected(downloadButtonItem) ? selectedItems : [downloadButtonItem];
    }

    // The tooltip names what a click saves, as the item menu does.
    function updateDownloadButtonTitle() {
        const title = getSaveImagesTitle(getDownloadButtonFigures());
        downloadButton.title = title;
        downloadButton.setAttribute('aria-label', title);
    }

    // One pointer hovers one item. The button goes into the thumbnail's box,
    // so it scrolls, and is clipped, with its cell.
    function setDownloadButtonItem(item) {
        if (item === downloadButtonItem) return;

        if (downloadButtonItem) {
            downloadButtonObserver.disconnect();
            downloadButtonItem.querySelector('img').removeEventListener('load', placeDownloadButton);
        }
        downloadButtonItem = item;
        if (!item) {
            downloadButton.hidden = true;
            return;
        }

        const container = item.querySelector('.image-container');
        const img = container.querySelector('img');
        container.appendChild(downloadButton);
        downloadButtonObserver.observe(container);
        downloadButtonObserver.observe(img);
        img.addEventListener('load', placeDownloadButton);
        updateDownloadButtonTitle();
        placeDownloadButton();
    }

    // Entries catch a cell scrolled under a still pointer; moves bring the
    // button back after a band is let go over a cell.
    function trackDownloadButtonItem(e) {
        // A tracking area takes no entries while the band is dragged.
        if (isMarquee && hasDragged) {
            setDownloadButtonItem(null);
            return;
        }
        setDownloadButtonItem(e.target.closest('#photo-gallery figure'));
    }

    if (window.matchMedia('(hover: hover)').matches) {
        gallery.addEventListener('mouseover', trackDownloadButtonItem);
        gallery.addEventListener('mousemove', trackDownloadButtonItem);
        gallery.addEventListener('mouseleave', () => setDownloadButtonItem(null));
    }

    downloadButton.addEventListener('mouseenter', updateDownloadButtonTitle);
    downloadButton.addEventListener('click', (e) => {
        // The second click of a double-click doesn't save it again.
        if (e.detail > 1 || !downloadButtonItem) return;
        saveImages(getDownloadButtonFigures());
    });

    galleryContextMenu.addEventListener('click', (e) => {
        // Group By and Sort By open their submenus; only a choice in one
        // closes the menu.
        if (e.target.closest('#gallery-context-group, #gallery-context-sort')) return;

        galleryContextMenu.style.display = 'none';
        const targetId = e.target.id;

        switch (targetId) {
            case 'gallery-context-add':
                if (imageUploadInput) {
                    imageUploadInput.click();
                }
                break;
            case 'gallery-context-view':
                toggleViewOptions();
                break;
        }
    });
    
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (!files.length) {
                return;
            }
    
            const UPLOAD_URL = 'https://r2-upload-presigner.witcherarchive.workers.dev';
            const uploadPromises = [];
    
            document.body.style.cursor = 'wait';
    
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
                        return response.text().then(text => { 
                            throw new Error(`Failed to upload ${file.name}: ${text}`); 
                        });
                    }
                    return response.json();
                });
    
                uploadPromises.push(uploadTask);
            }
    
            try {
                await Promise.all(uploadPromises);
                alert(`${files.length} image(s) uploaded successfully!`);
                location.reload(); 
            } catch (error) {
                console.error('An error occurred during one of the uploads:', error);
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

    const KEY_TO_LABEL_MAP = {
        season: 'Season',
        episode: 'Episode',
        cast: 'Cast',
        crew: 'Crew',
        castAndCrew: 'Cast & Crew',
        characters: 'Characters',
        location: 'Location',
        scene: 'Scene'
    };

    // Fields a gallery's data doesn't have are skipped, so one list serves every show.
    const primaryKeys = ['season', 'episode', 'cast', 'crew', 'castAndCrew', 'characters', 'location', 'scene'];


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

        downloadBtn.dataset.fullsrc = img.dataset.fullsrc; 

        modalImg.src = img.src;

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

        const url = event.currentTarget.dataset.fullsrc; 
        const filename = modalFilename.textContent || url.split('/').pop();

        if (!url || !filename) {
            console.error("Modal download failed: URL or filename not found.");
            alert("Could not download the image because its data is missing.");
            return;
        }

        const buttonText = downloadBtn.textContent;
        try {
            downloadBtn.textContent = 'Downloading...';
            downloadBtn.disabled = true;

            const blob = await fetchImageBlob(url);
            triggerDownload(blob, filename);

        } catch (error) {
            console.error("Modal download failed:", error);
            alert("An error occurred while trying to download the image.");
        } finally {
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

    function openItem(figure) {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        const index = visibleFigures.indexOf(figure);
        if (index > -1) {
            showImage(index);
        }
    }

    gallery.addEventListener('dblclick', function(event) {
        if (event.target.closest('.item-download-button')) return;
        const figure = getItemAtPoint(event.clientX, event.clientY);
        if (figure) openItem(figure);
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

    function updateThumbPosition() {
        const scrollableHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const trackHeight = track.offsetHeight;
        const thumbHeight = thumb.offsetHeight;

        if (scrollableHeight <= viewportHeight) return;

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
        thumb.classList.remove('is-near');
        track.style.top = `${headerHeight}px`;
        track.style.height = `calc(100% - ${headerHeight}px)`;

        const trackHeight = track.offsetHeight;
        const thumbHeight = Math.max((viewportHeight / scrollableHeight) * trackHeight, 20);
        thumb.style.height = `${thumbHeight}px`;

        updateThumbPosition();
    }

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

    window.addEventListener('resize', setupScrollbar);
    window.addEventListener('load', setupScrollbar);
    window.addEventListener('orientationchange', setupScrollbar);
    window.addEventListener('galleryFiltered', setupScrollbar);
    window.addEventListener('galleryRearranged', setupScrollbar);

    setupScrollbar();
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

    const proximity = 30;
    let ticking = false;

    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const thumbRect = thumb.getBoundingClientRect();

                const isHorizontallyNear = e.clientX >= thumbRect.left - proximity;
                const isVerticallyNear = (e.clientY >= thumbRect.top - proximity) && (e.clientY <= thumbRect.bottom + proximity);

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

/*
==================================================================
// Autocomplete Search Suggestions Logic (MODIFIED)
==================================================================
*/
document.addEventListener('galleryLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchWrapper = document.getElementById('search-wrapper');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const galleryItems = document.querySelectorAll('#photo-gallery figure img');

    if (!searchInput || !suggestionsContainer || galleryItems.length === 0) {
        return;
    }

    // Function to rebuild the search query and trigger filtering
    function runSearchFromPills() {
        const pills = searchWrapper.querySelectorAll('.search-pill');
        let pillQueries = [];
        pills.forEach(pill => {
            pillQueries.push(pill.dataset.value);
        });
        
        const fullQueryText = pillQueries.join(' ') + ' ' + searchInput.value;
        
        galleryFilters.searchTerms = buildGallerySearchTerms(fullQueryText);

        // Update placeholder based on pills
        searchInput.placeholder = pills.length > 0 ? '' : getDefaultSearchPlaceholder(searchInput);
        applyGalleryFilters();
    }

    // --- Pill Creation and Management ---
    function createPill(text) {
        const pill = document.createElement('span');
        pill.className = 'search-pill';
        pill.setAttribute('draggable', true);
        pill.dataset.value = text;

        const pillText = document.createElement('span');
        pillText.className = 'search-pill-text';
        pillText.textContent = text;
        
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-pill';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pill.remove();
            runSearchFromPills();
        });

        pill.appendChild(pillText);
        pill.appendChild(removeBtn);

        // Drag and Drop functionality
        pill.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.value);
            e.dataTransfer.effectAllowed = 'copy';
        });

        // Click to select functionality
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentlySelected = searchWrapper.querySelector('.search-pill.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            e.currentTarget.classList.add('selected');
            searchInput.focus();
        });

        return pill;
    }
    
    // --- Autocomplete data setup ---
    const searchTerms = new Set();
    galleryItems.forEach(img => {
        const peopleSources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew, img.dataset.characters, img.dataset.location, img.dataset.scene];
        peopleSources.forEach(source => {
            if (source) {
                source.split(',').forEach(term => {
                    const cleaned = term.trim();
                    if (cleaned) searchTerms.add(cleaned);
                });
            }
        });
    });
    const sortedSearchTerms = Array.from(searchTerms).sort((a, b) => a.localeCompare(b));
    let activeSuggestionIndex = -1;

    function updateSuggestions() {
        const query = searchInput.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        activeSuggestionIndex = -1;

        // --- NEW: Get the values of all pills that currently exist ---
        const existingPills = searchWrapper.querySelectorAll('.search-pill');
        const existingPillValues = new Set();
        existingPills.forEach(pill => {
            // Add the pill's value to a Set for quick lookups
            existingPillValues.add(pill.dataset.value.toLowerCase());
        });

        if (query.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        // --- MODIFIED: The filter now also checks if a term is already a pill ---
        const matches = sortedSearchTerms.filter(term => {
            const termLower = term.toLowerCase();
            // A term is a match if it starts with the query AND is not already an active pill
            return termLower.startsWith(query) && !existingPillValues.has(termLower);
        }).slice(0, 7);

        if (matches.length > 0) {
            matches.forEach(term => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = term;
                item.addEventListener('mousedown', (e) => { // mousedown to fire before blur
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
        searchWrapper.insertBefore(createPill(value), searchInput);
        searchInput.value = '';
        suggestionsContainer.style.display = 'none';
        runSearchFromPills();
        searchInput.focus();
    }

    function updateActiveSuggestion(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeSuggestionIndex);
            if (index === activeSuggestionIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    searchInput.addEventListener('input', () => {
        updateSuggestions();
        runSearchFromPills();
    });

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
                if (activeSuggestionIndex > -1) {
                    e.preventDefault();
                    selectSuggestion(items[activeSuggestionIndex].textContent);
                }
                break;
            case 'Escape':
                suggestionsContainer.style.display = 'none';
                break;
            case 'Backspace':
                if (searchInput.value === '') {
                    const selectedPill = searchWrapper.querySelector('.search-pill.selected');
                    if (selectedPill) {
                        selectedPill.remove();
                        runSearchFromPills();
                    } else {
                        const allPills = searchWrapper.querySelectorAll('.search-pill');
                        if (allPills.length > 0) {
                            allPills[allPills.length - 1].classList.add('selected');
                        }
                    }
                }
                break;
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
});

function normalizeSidebarNumberValue(value) {
    const rawValue = String(value ?? '').trim();
    if (!rawValue) return '';

    const numberValue = Number(rawValue);

    return Number.isFinite(numberValue) ? String(numberValue) : '';
}

function buildSidebarEpisodeIndex() {
    const episodesBySeason = new Map();
    const allEpisodes = new Set();
    const galleryItems = document.querySelectorAll('#photo-gallery figure img');

    galleryItems.forEach(img => {
        const season = normalizeSidebarNumberValue(img.dataset.season);
        const episode = normalizeSidebarNumberValue(img.dataset.episode);

        if (!episode) return;

        allEpisodes.add(episode);

        if (!season) return;

        if (!episodesBySeason.has(season)) {
            episodesBySeason.set(season, new Set());
        }

        episodesBySeason.get(season).add(episode);
    });

    episodesBySeason.set('all', allEpisodes);

    return episodesBySeason;
}

function buildSidebarSeasonList() {
    const seasons = new Set();

    document.querySelectorAll('#photo-gallery figure img').forEach(img => {
        const season = normalizeSidebarNumberValue(img.dataset.season);
        if (season) seasons.add(season);
    });

    return Array.from(seasons).sort((a, b) => Number(a) - Number(b));
}

function renderSidebarSeasonOptions(sidebar, seasons) {
    const seasonList = document.getElementById('sidebar-season-options');
    if (!seasonList) return;

    const selectedSeason = galleryFilters.sidebar.season || 'all';

    seasonList.replaceChildren(
        createSidebarFilterButton('season', 'all', 'All', selectedSeason === 'all', true),
        ...seasons.map(season => createSidebarFilterButton('season', season, season, selectedSeason === season))
    );
}

function getSortedSidebarEpisodes(episodesBySeason, season) {
    const episodeSet = episodesBySeason.get(season) || new Set();

    return Array.from(episodeSet).sort((a, b) => Number(a) - Number(b));
}

function createSidebarFilterButton(filter, value, label, isActive, isEmphasis = false) {
    const button = document.createElement('button');
    button.className = `sidebar-option${isEmphasis ? ' sidebar-option--emphasis' : ''}${isActive ? ' is-active' : ''}`;
    button.type = 'button';
    button.dataset.sidebarFilter = filter;
    button.dataset.sidebarValue = value;
    button.setAttribute('aria-pressed', String(isActive));
    button.textContent = label;

    return button;
}

function updateSidebarFilterActiveState(sidebar, filter) {
    const selectedValue = galleryFilters.sidebar[filter] || 'all';

    sidebar.querySelectorAll(`[data-sidebar-filter="${filter}"]`).forEach(option => {
        const isActive = option.dataset.sidebarValue === selectedValue;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-pressed', String(isActive));
    });
}

function renderSidebarEpisodeOptions(sidebar, episodesBySeason) {
    const episodeList = document.getElementById('sidebar-episode-options');
    if (!episodeList) return;

    const selectedSeason = galleryFilters.sidebar.season || 'all';
    const availableEpisodes = getSortedSidebarEpisodes(episodesBySeason, selectedSeason);
    const availableEpisodeValues = new Set(availableEpisodes);
    let selectedEpisode = galleryFilters.sidebar.episode || 'all';

    if (selectedEpisode !== 'all') {
        selectedEpisode = normalizeSidebarNumberValue(selectedEpisode);

        if (!availableEpisodeValues.has(selectedEpisode)) {
            selectedEpisode = 'all';
            galleryFilters.sidebar.episode = 'all';
        }
    }

    const episodeButtons = [
        createSidebarFilterButton('episode', 'all', 'All', selectedEpisode === 'all', true),
        ...availableEpisodes.map(episode => {
            const label = episode;
            return createSidebarFilterButton('episode', episode, label, selectedEpisode === episode);
        })
    ];
    const currentButtons = Array.from(episodeList.querySelectorAll('[data-sidebar-filter="episode"]'));
    const hasMatchingButtons =
        currentButtons.length === episodeButtons.length &&
        currentButtons.every((button, index) =>
            button.dataset.sidebarValue === episodeButtons[index].dataset.sidebarValue &&
            button.textContent === episodeButtons[index].textContent
        );

    if (!hasMatchingButtons) {
        episodeList.replaceChildren(...episodeButtons);
    }

    updateSidebarFilterActiveState(sidebar, 'episode');
}

document.addEventListener('galleryLoaded', () => {
    const sidebar = document.getElementById('finder-sidebar');
    if (!sidebar) return;

    const episodesBySeason = buildSidebarEpisodeIndex();

    renderSidebarSeasonOptions(sidebar, buildSidebarSeasonList());
    renderSidebarEpisodeOptions(sidebar, episodesBySeason);

    sidebar.addEventListener('click', event => {
        const allPeopleRow = event.target.closest('[data-sidebar-node="all-people"]');
        if (allPeopleRow && sidebar.contains(allPeopleRow)) {
            openAllPeopleNode();
            return;
        }

        const button = event.target.closest('[data-sidebar-filter]');
        if (!button || !sidebar.contains(button)) return;

        const filter = button.dataset.sidebarFilter;
        const value = button.dataset.sidebarValue;

        galleryFilters.sidebar[filter] = value;

        if (filter === 'season') {
            renderSidebarEpisodeOptions(sidebar, episodesBySeason);
        }

        // A person's own row leaves the All People node, as a tag row leaves All Tags.
        if (filter === 'person') {
            closeAllPeopleNode();
        }

        updateSidebarFilterActiveState(sidebar, filter);

        applyGalleryFilters({ scroll: true });
    });

    applyGalleryFilters();
});

/*
==================================================================
// START: ALL PEOPLE NODE
==================================================================
Binder's "All Tags…" node, for people. The last Cast & Crew row opens a
column of everyone this gallery credits, between the sidebar and the
photos. The row stays lit while names are picked in the column: one name
shows that person's images, several show the images with all of them (or
any one, from the Match row). A person's own sidebar row closes it again.
*/

const ALL_PEOPLE_WIDTH_STORAGE_KEY = 'allPeopleColumnWidth';
const ALL_PEOPLE_SCROLL_STORAGE_KEY = 'allPeopleColumnScrollTop';
const ALL_PEOPLE_SCROLL_SAVE_DELAY = 350;
const ALL_PEOPLE_TYPE_SELECT_RESET = 1000;
const ALL_PEOPLE_GALLERY_MIN_WIDTH = 320;

const allPeopleColumnState = {
    column: null,
    list: null,
    handle: null,
    names: null,
    selected: new Set(),
    anchor: -1,
    lead: -1,
    width: null,
    scrollTop: null,
    scrollSaveTimer: null,
    typeSelectText: '',
    typeSelectTimer: null
};

function readAllPeopleStoredNumber(key) {
    try {
        const value = parseFloat(localStorage.getItem(key));
        return Number.isFinite(value) ? value : null;
    } catch (error) {
        return null;
    }
}

function writeAllPeopleStoredNumber(key, value) {
    try {
        localStorage.setItem(key, String(Math.round(value)));
    } catch (error) {
        // Blocked storage only costs the memory across visits.
    }
}

// The scroll offset is per gallery, since each lists other people.
function getAllPeopleScrollStorageKey() {
    const gallery = document.getElementById('photo-gallery');
    const galleryId = gallery && gallery.dataset.galleryId ? gallery.dataset.galleryId : location.pathname;

    return `${ALL_PEOPLE_SCROLL_STORAGE_KEY}:${galleryId}`;
}

function getAllPeopleNames() {
    if (allPeopleColumnState.names) return allPeopleColumnState.names;

    const namesByKey = new Map();

    document.querySelectorAll('#photo-gallery figure img').forEach(img => {
        getGalleryImagePeople(img).forEach(name => {
            const key = foldGalleryPersonName(name);
            if (!namesByKey.has(key)) namesByKey.set(key, name);
        });
    });

    // By name in Finder's numeric collation, nothing pinned or grouped.
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    allPeopleColumnState.names = Array.from(namesByKey.values()).sort(collator.compare);

    return allPeopleColumnState.names;
}

function getAllPeopleRange(from, to) {
    const range = new Set();

    for (let index = Math.min(from, to); index <= Math.max(from, to); index++) {
        range.add(index);
    }

    return range;
}

function openAllPeopleNode() {
    // The row always opens the bare node, as All Tags… drops the column's picks.
    galleryFilters.sidebar.person = 'all';
    galleryFilters.sidebar.allPeople = { names: [], matchAny: false };

    showAllPeopleColumn();
    setAllPeopleColumnSelection(new Set(), -1);
    syncAllPeopleSidebarRows();

    applyGalleryFilters({ scroll: true });
}

function closeAllPeopleNode() {
    galleryFilters.sidebar.allPeople = null;

    hideAllPeopleColumn();
    syncAllPeopleSidebarRows();
}

// The node lights its own row only, whoever is picked in the column.
function syncAllPeopleSidebarRows() {
    const sidebar = document.getElementById('finder-sidebar');
    if (!sidebar) return;

    const isOpen = Boolean(galleryFilters.sidebar.allPeople);

    sidebar.querySelectorAll('[data-sidebar-node="all-people"]').forEach(row => {
        row.classList.toggle('is-active', isOpen);
        row.setAttribute('aria-pressed', String(isOpen));
    });

    updateSidebarFilterActiveState(sidebar, 'person');
}

function buildAllPeopleColumn() {
    const state = allPeopleColumnState;
    const column = document.createElement('div');
    column.id = 'all-people-column';

    const list = document.createElement('div');
    list.className = 'all-people-list';
    list.tabIndex = 0;
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'All People');
    list.setAttribute('aria-multiselectable', 'true');

    getAllPeopleNames().forEach((name, index) => {
        const row = document.createElement('div');
        row.className = 'all-people-row';
        row.id = `all-people-row-${index}`;
        row.dataset.index = String(index);
        row.setAttribute('role', 'option');
        row.setAttribute('aria-selected', 'false');

        const label = document.createElement('span');
        label.className = 'all-people-name';
        label.textContent = name;

        row.appendChild(label);
        list.appendChild(row);
    });

    const handle = document.createElement('div');
    handle.className = 'all-people-resize-handle';
    handle.tabIndex = 0;
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-label', 'Resize All People column');
    handle.setAttribute('aria-orientation', 'vertical');

    list.addEventListener('mousedown', handleAllPeopleListMouseDown);
    list.addEventListener('keydown', handleAllPeopleListKeyDown);
    list.addEventListener('scroll', () => {
        clearTimeout(state.scrollSaveTimer);
        state.scrollSaveTimer = setTimeout(saveAllPeopleColumnScroll, ALL_PEOPLE_SCROLL_SAVE_DELAY);
    });
    handle.addEventListener('pointerdown', startAllPeopleColumnResize);
    handle.addEventListener('keydown', handleAllPeopleResizeKeyDown);

    column.append(list, handle);

    state.column = column;
    state.list = list;
    state.handle = handle;
}

function isAllPeopleColumnShown() {
    return Boolean(allPeopleColumnState.column && allPeopleColumnState.column.isConnected);
}

// Inserted on open and removed on close, so no other view carries it.
function showAllPeopleColumn() {
    const state = allPeopleColumnState;
    const shell = document.getElementById('app-shell');
    const wrapper = document.getElementById('wrapper');

    if (isAllPeopleColumnShown() || !shell || !wrapper) return;
    if (!state.column) buildAllPeopleColumn();

    if (state.width === null) {
        state.width = readAllPeopleStoredNumber(ALL_PEOPLE_WIDTH_STORAGE_KEY);
    }
    if (state.scrollTop === null) {
        state.scrollTop = readAllPeopleStoredNumber(getAllPeopleScrollStorageKey()) || 0;
    }

    shell.insertBefore(state.column, wrapper);
    applyAllPeopleColumnWidth();
    state.list.scrollTop = state.scrollTop;
}

function hideAllPeopleColumn() {
    const state = allPeopleColumnState;
    if (!isAllPeopleColumnShown()) return;

    clearTimeout(state.scrollSaveTimer);
    saveAllPeopleColumnScroll();

    if (state.width !== null) {
        writeAllPeopleStoredNumber(ALL_PEOPLE_WIDTH_STORAGE_KEY, state.width);
    }

    state.column.remove();
}

function saveAllPeopleColumnScroll() {
    const state = allPeopleColumnState;
    if (!isAllPeopleColumnShown()) return;

    state.scrollTop = state.list.scrollTop;
    writeAllPeopleStoredNumber(getAllPeopleScrollStorageKey(), state.scrollTop);
}

function getAllPeopleColumnBounds() {
    const styles = getComputedStyle(document.documentElement);
    const min = parseFloat(styles.getPropertyValue('--all-people-column-min-width')) || 150;
    const left = isAllPeopleColumnShown() ? allPeopleColumnState.column.getBoundingClientRect().left : 0;
    const max = Math.max(min, window.innerWidth - left - ALL_PEOPLE_GALLERY_MIN_WIDTH);

    return { min, max };
}

// The width the user chose is kept; the window only clamps what is shown.
function applyAllPeopleColumnWidth() {
    const state = allPeopleColumnState;
    if (!isAllPeopleColumnShown()) return;

    const styles = getComputedStyle(document.documentElement);
    const defaultWidth = parseFloat(styles.getPropertyValue('--all-people-column-width')) || 190;
    const bounds = getAllPeopleColumnBounds();
    const width = Math.min(Math.max(state.width !== null ? state.width : defaultWidth, bounds.min), bounds.max);

    state.column.style.setProperty('--all-people-column-width', `${width}px`);
    state.handle.setAttribute('aria-valuemin', String(bounds.min));
    state.handle.setAttribute('aria-valuemax', String(Math.round(bounds.max)));
    state.handle.setAttribute('aria-valuenow', String(Math.round(width)));
}

function setAllPeopleColumnWidth(width) {
    const bounds = getAllPeopleColumnBounds();

    allPeopleColumnState.width = Math.min(Math.max(width, bounds.min), bounds.max);
    applyAllPeopleColumnWidth();
}

function startAllPeopleColumnResize(event) {
    if (event.button !== 0) return;

    event.preventDefault();

    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = allPeopleColumnState.column.getBoundingClientRect().width;
    let pendingWidth = startWidth;
    let frame = null;

    document.body.classList.add('is-resizing-all-people-column');
    handle.setPointerCapture(pointerId);

    function onPointerMove(moveEvent) {
        if (moveEvent.pointerId !== pointerId) return;

        // No collapse: the column only goes away with the node.
        pendingWidth = startWidth + moveEvent.clientX - startX;

        if (frame !== null) return;

        frame = requestAnimationFrame(() => {
            frame = null;
            setAllPeopleColumnWidth(pendingWidth);
        });
    }

    function onPointerUp(upEvent) {
        if (upEvent.pointerId !== pointerId) return;

        if (frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }

        setAllPeopleColumnWidth(pendingWidth);
        writeAllPeopleStoredNumber(ALL_PEOPLE_WIDTH_STORAGE_KEY, allPeopleColumnState.width);

        document.body.classList.remove('is-resizing-all-people-column');
        if (handle.hasPointerCapture(pointerId)) {
            handle.releasePointerCapture(pointerId);
        }
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
}

function handleAllPeopleResizeKeyDown(event) {
    const bounds = getAllPeopleColumnBounds();
    const currentWidth = allPeopleColumnState.column.getBoundingClientRect().width;
    const step = event.shiftKey ? 36 : 12;
    let width = null;

    if (event.key === 'ArrowLeft') {
        width = currentWidth - step;
    } else if (event.key === 'ArrowRight') {
        width = currentWidth + step;
    } else if (event.key === 'Home') {
        width = bounds.min;
    } else if (event.key === 'End') {
        width = bounds.max;
    }

    if (width === null) return;

    event.preventDefault();
    event.stopPropagation();
    setAllPeopleColumnWidth(width);
    writeAllPeopleStoredNumber(ALL_PEOPLE_WIDTH_STORAGE_KEY, allPeopleColumnState.width);
}

function setAllPeopleColumnSelection(selected, lead, anchor = lead) {
    const state = allPeopleColumnState;

    state.selected = selected;
    state.lead = lead;
    state.anchor = anchor;

    if (!state.list) return;

    Array.from(state.list.children).forEach((row, index) => {
        const isSelected = selected.has(index);
        row.classList.toggle('is-selected', isSelected);
        row.setAttribute('aria-selected', String(isSelected));
    });

    if (lead >= 0) {
        state.list.setAttribute('aria-activedescendant', `all-people-row-${lead}`);
    } else {
        state.list.removeAttribute('aria-activedescendant');
    }
}

// Every change of the column's selection is a new location for the gallery.
function pickAllPeopleRows(selected, lead, anchor = lead) {
    setAllPeopleColumnSelection(selected, lead, anchor);

    const allPeople = galleryFilters.sidebar.allPeople;
    if (!allPeople) return;

    const names = getAllPeopleNames();
    const picked = Array.from(selected).sort((a, b) => a - b).map(index => names[index]);
    const isUnchanged =
        picked.length === allPeople.names.length &&
        picked.every((name, index) => name === allPeople.names[index]);

    if (isUnchanged) return;

    allPeople.names = picked;
    applyGalleryFilters({ scroll: true });
}

function scrollAllPeopleRowIntoView(index) {
    const list = allPeopleColumnState.list;
    const row = list ? list.children[index] : null;
    if (!row) return;

    const styles = getComputedStyle(list);
    const topInset = parseFloat(styles.paddingTop) || 0;
    const bottomInset = parseFloat(styles.paddingBottom) || 0;
    const rowTop = row.offsetTop;
    const rowBottom = rowTop + row.offsetHeight;

    if (rowTop - topInset < list.scrollTop) {
        list.scrollTop = rowTop - topInset;
    } else if (rowBottom + bottomInset > list.scrollTop + list.clientHeight) {
        list.scrollTop = rowBottom + bottomInset - list.clientHeight;
    }
}

function handleAllPeopleListMouseDown(event) {
    if (event.button !== 0) return;

    const state = allPeopleColumnState;
    const row = event.target.closest('.all-people-row');
    const isToggle = event.metaKey || event.ctrlKey;

    if (!row) {
        // A click past the last name clears the picks, as in a table.
        if (!isToggle && !event.shiftKey) pickAllPeopleRows(new Set(), -1);
        return;
    }

    const index = Number(row.dataset.index);

    if (event.shiftKey && state.anchor >= 0) {
        pickAllPeopleRows(getAllPeopleRange(state.anchor, index), index, state.anchor);
    } else if (isToggle) {
        const selected = new Set(state.selected);

        if (selected.has(index)) {
            selected.delete(index);
        } else {
            selected.add(index);
        }

        pickAllPeopleRows(selected, index);
    } else {
        pickAllPeopleRows(new Set([index]), index);
    }
}

function handleAllPeopleListKeyDown(event) {
    const state = allPeopleColumnState;
    const lastIndex = getAllPeopleNames().length - 1;
    const isCommand = event.metaKey || event.ctrlKey;
    const keepFromGallery = () => {
        event.preventDefault();
        event.stopPropagation();
    };

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        keepFromGallery();
        if (lastIndex < 0) return;

        const step = event.key === 'ArrowDown' ? 1 : -1;
        const lead = state.lead < 0
            ? (step > 0 ? 0 : lastIndex)
            : Math.min(Math.max(state.lead + step, 0), lastIndex);

        if (event.shiftKey && state.anchor >= 0) {
            pickAllPeopleRows(getAllPeopleRange(state.anchor, lead), lead, state.anchor);
        } else {
            pickAllPeopleRows(new Set([lead]), lead);
        }

        scrollAllPeopleRowIntoView(lead);
        return;
    }

    // A table's Home/End and page keys scroll without moving the selection.
    if (event.key === 'Home' || event.key === 'End') {
        keepFromGallery();
        state.list.scrollTop = event.key === 'Home' ? 0 : state.list.scrollHeight;
        return;
    }

    if (event.key === 'PageUp' || event.key === 'PageDown') {
        keepFromGallery();
        const page = state.list.clientHeight - (parseFloat(getComputedStyle(state.list).paddingTop) || 0);
        state.list.scrollTop += event.key === 'PageDown' ? page : -page;
        return;
    }

    // Finder's tags column swallows Return and Enter: no rename, no open.
    if (event.key === 'Enter' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        keepFromGallery();
        return;
    }

    if (isCommand && event.key.toLowerCase() === 'a') {
        keepFromGallery();
        if (lastIndex >= 0) pickAllPeopleRows(getAllPeopleRange(0, lastIndex), Math.max(state.lead, 0), 0);
        return;
    }

    if (!isCommand && !event.altKey && event.key.length === 1) {
        keepFromGallery();
        typeSelectAllPeopleRow(event.key);
    }
}

// Type-select: the first name that starts with what was typed in the last second.
function typeSelectAllPeopleRow(character) {
    const state = allPeopleColumnState;

    if (character === ' ' && !state.typeSelectText) return;

    clearTimeout(state.typeSelectTimer);
    state.typeSelectText += character;
    state.typeSelectTimer = setTimeout(() => {
        state.typeSelectText = '';
    }, ALL_PEOPLE_TYPE_SELECT_RESET);

    const typed = simplifyGallerySearchText(state.typeSelectText.toLowerCase());
    const index = getAllPeopleNames().findIndex(name => foldGalleryPersonName(name).startsWith(typed));

    if (index < 0) return;

    pickAllPeopleRows(new Set([index]), index);
    scrollAllPeopleRowIntoView(index);
}

function setAllPeopleMatchAny(matchAny) {
    const allPeople = galleryFilters.sidebar.allPeople;
    if (!allPeople || allPeople.names.length < 2 || allPeople.matchAny === matchAny) return;

    allPeople.matchAny = matchAny;
    applyGalleryFilters({ scroll: true });
}

function createAllPeopleMatchRow() {
    const row = document.createElement('div');
    row.id = 'all-people-match-row';
    row.className = 'all-people-match-row';

    const label = document.createElement('span');
    label.className = 'all-people-match-label';
    label.textContent = 'Match:';

    const pills = document.createElement('div');
    pills.className = 'all-people-match-pills';
    pills.setAttribute('role', 'group');
    pills.setAttribute('aria-label', 'Match selected people');

    [
        ['all', 'All People', 'Show images with all selected people'],
        ['any', 'Any Person', 'Show images with any selected person']
    ].forEach(([match, title, tooltip]) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'all-people-match-pill';
        pill.dataset.allPeopleMatch = match;
        pill.title = tooltip;
        pill.textContent = title;
        pill.addEventListener('click', () => setAllPeopleMatchAny(match === 'any'));
        pills.appendChild(pill);
    });

    row.append(label, pills);

    return row;
}

function createAllPeopleEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.id = 'all-people-empty-state';
    emptyState.className = 'all-people-empty-state';

    const message = document.createElement('p');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'all-people-empty-button';
    button.textContent = 'Match Any Person';
    button.addEventListener('click', () => setAllPeopleMatchAny(true));

    emptyState.append(message, button);

    return emptyState;
}

// Two picks or more bring the Match row, and its empty state when nothing matches.
function syncAllPeopleMatchControls() {
    const wrapper = document.getElementById('wrapper');
    const gallery = document.getElementById('photo-gallery');
    if (!wrapper || !gallery) return;

    const sidebar = galleryFilters.sidebar;
    const allPeople = sidebar.allPeople;
    const showsMatch = Boolean(allPeople && allPeople.names.length > 1);
    let row = document.getElementById('all-people-match-row');

    if (showsMatch && !row) {
        row = createAllPeopleMatchRow();
        wrapper.insertBefore(row, gallery);
    } else if (!showsMatch && row) {
        row.remove();
        row = null;
    }

    if (row) {
        row.querySelectorAll('[data-all-people-match]').forEach(pill => {
            const isActive = (pill.dataset.allPeopleMatch === 'any') === allPeople.matchAny;
            pill.classList.toggle('is-active', isActive);
            pill.setAttribute('aria-pressed', String(isActive));
        });
    }

    const hasResults = Array.from(gallery.querySelectorAll('figure')).some(item => item.style.display !== 'none');
    let emptyState = document.getElementById('all-people-empty-state');

    if (!showsMatch || hasResults) {
        if (emptyState) emptyState.remove();
        return;
    }

    if (!emptyState) {
        emptyState = createAllPeopleEmptyState();
        wrapper.appendChild(emptyState);
    }

    let message;
    if (galleryFilters.searchTerms.length > 0) {
        message = 'No images match this search';
    } else if (sidebar.season !== 'all' || sidebar.episode !== 'all') {
        message = 'No images match these filters';
    } else {
        message = allPeople.matchAny ? 'No images have any selected person' : 'No images have all selected people';
    }

    emptyState.querySelector('p').textContent = message;
    emptyState.querySelector('button').hidden = allPeople.matchAny;
}

window.addEventListener('galleryFiltered', syncAllPeopleMatchControls);

window.addEventListener('resize', applyAllPeopleColumnWidth);

/*
==================================================================
// END: ALL PEOPLE NODE
==================================================================
*/


document.addEventListener('keydown', (e) => {
    // Check for Ctrl+C or Command+C
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const gallery = document.getElementById('photo-gallery');
        const searchInput = document.getElementById('search-input');
        const modal = document.getElementById('image-modal');

        if (document.activeElement === searchInput || (modal && modal.classList.contains('is-visible'))) {
            return;
        }

        const selectedFigures = gallery.querySelectorAll('figure.selected');

        if (selectedFigures.length > 0) {
            e.preventDefault();

            const filenames = Array.from(selectedFigures).map(figure => {
                const img = figure.querySelector('img');
                return img ? img.dataset.filename : '';
            }).filter(name => name); 

            if (filenames.length > 0) {
                const textToCopy = filenames.join(' ');

                navigator.clipboard.writeText(textToCopy).then(() => {
                    console.log(`${filenames.length} filenames copied to clipboard.`);
                }).catch(err => {
                    console.error('Could not copy filenames to clipboard: ', err);
                });
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('finder-sidebar');
    const handle = sidebar ? sidebar.querySelector('.sidebar-resize-handle') : null;
    const toggle = document.getElementById('sidebar-toggle');

    if (!sidebar || !handle) return;

    const getNumber = (value, fallback) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    let currentSidebarWidth = null;
    let pendingSidebarWidth = null;
    let resizeFrame = null;
    let resizeCursorState = null;
    let lastExpandedWidth = null;
    const dragCollapseThreshold = 65;

    function getSidebarBounds() {
        const styles = getComputedStyle(sidebar);
        const min = getNumber(styles.getPropertyValue('--sidebar-min-width'), 176);
        const max = getNumber(styles.getPropertyValue('--sidebar-max-width'), 420);
        const viewportMax = Math.max(min, Math.min(max, window.innerWidth - 320));

        return { min, max: viewportMax };
    }

    function clampWidth(width, bounds = getSidebarBounds()) {
        const { min, max } = bounds;
        return Math.min(Math.max(width, min), max);
    }

    function setSidebarWidth(width, bounds = getSidebarBounds()) {
        const nextWidth = clampWidth(width, bounds);

        if (nextWidth !== currentSidebarWidth) {
            document.documentElement.style.setProperty('--sidebar-width', `${nextWidth}px`);
            sidebar.style.setProperty('--sidebar-width', `${nextWidth}px`);
            currentSidebarWidth = nextWidth;
        }

        handle.setAttribute('aria-valuemin', String(bounds.min));
        handle.setAttribute('aria-valuemax', String(bounds.max));
        handle.setAttribute('aria-valuenow', String(Math.round(nextWidth)));
    }

    function isSidebarCollapsed() {
        return document.body.classList.contains('is-sidebar-collapsed');
    }

    function setSidebarCollapsed(collapsed, restoreWidth = null) {
        const bounds = getSidebarBounds();

        if (collapsed) {
            if (!isSidebarCollapsed()) {
                lastExpandedWidth = currentSidebarWidth || clampWidth(sidebar.getBoundingClientRect().width, bounds);
            }
            document.body.classList.add('is-sidebar-collapsed');
            sidebar.setAttribute('aria-hidden', 'true');
            handle.setAttribute('tabindex', '-1');
            handle.setAttribute('aria-valuenow', '0');
            toggle && toggle.setAttribute('aria-expanded', 'false');
            toggle && toggle.setAttribute('aria-label', 'Open sidebar');
            return;
        }

        setSidebarWidth(restoreWidth !== null ? restoreWidth : lastExpandedWidth || currentSidebarWidth || bounds.min, bounds);
        document.body.classList.remove('is-sidebar-collapsed');
        sidebar.removeAttribute('aria-hidden');
        handle.setAttribute('tabindex', '0');
        toggle && toggle.setAttribute('aria-expanded', 'true');
        toggle && toggle.setAttribute('aria-label', 'Close sidebar');
    }

    function setSidebarResizeCursor(width, bounds) {
        const nextState = width > bounds.max ? 'max' : 'free';

        if (nextState === resizeCursorState) return;

        document.body.classList.toggle('is-sidebar-resize-maxed', nextState === 'max');
        resizeCursorState = nextState;
    }

    function resetSidebarResizeCursor() {
        document.body.classList.remove('is-sidebar-resize-maxed');
        resizeCursorState = null;
    }

    function queueSidebarWidth(width, bounds) {
        pendingSidebarWidth = width;

        if (resizeFrame !== null) return;

        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            setSidebarWidth(pendingSidebarWidth, bounds);
        });
    }

    function flushQueuedSidebarWidth(bounds) {
        if (resizeFrame === null) return;

        cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
        setSidebarWidth(pendingSidebarWidth, bounds);
    }

    function cancelQueuedSidebarWidth() {
        if (resizeFrame !== null) {
            cancelAnimationFrame(resizeFrame);
            resizeFrame = null;
        }

        pendingSidebarWidth = null;
    }

    handle.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || isSidebarCollapsed()) return;

        event.preventDefault();

        const startX = event.clientX;
        const dragBounds = getSidebarBounds();
        const startWidth = clampWidth(sidebar.getBoundingClientRect().width, dragBounds);
        const pointerId = event.pointerId;

        document.body.classList.add('is-resizing-sidebar');
        handle.setPointerCapture(pointerId);

        function onPointerMove(moveEvent) {
            if (moveEvent.pointerId !== pointerId) return;

            const nextWidth = startWidth + moveEvent.clientX - startX;
            setSidebarResizeCursor(nextWidth, dragBounds);

            if (nextWidth < dragCollapseThreshold) {
                cancelQueuedSidebarWidth();
                setSidebarCollapsed(true);
                return;
            }

            if (isSidebarCollapsed()) {
                setSidebarCollapsed(false, nextWidth);
            }

            queueSidebarWidth(nextWidth, dragBounds);
        }

        function onPointerUp(upEvent) {
            if (upEvent.pointerId !== pointerId) return;

            if (!isSidebarCollapsed()) {
                flushQueuedSidebarWidth(dragBounds);
            } else {
                cancelQueuedSidebarWidth();
            }
            document.body.classList.remove('is-resizing-sidebar');
            resetSidebarResizeCursor();
            if (handle.hasPointerCapture(pointerId)) {
                handle.releasePointerCapture(pointerId);
            }
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
        }

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    });

    handle.addEventListener('keydown', (event) => {
        if (isSidebarCollapsed()) return;

        const bounds = getSidebarBounds();
        const currentWidth = clampWidth(sidebar.getBoundingClientRect().width, bounds);
        const step = event.shiftKey ? 36 : 12;

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setSidebarWidth(currentWidth - step, bounds);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            setSidebarWidth(currentWidth + step, bounds);
        } else if (event.key === 'Home') {
            event.preventDefault();
            setSidebarWidth(bounds.min, bounds);
        } else if (event.key === 'End') {
            event.preventDefault();
            setSidebarWidth(bounds.max, bounds);
        }
    });

    window.addEventListener('resize', () => {
        if (isSidebarCollapsed()) return;

        const bounds = getSidebarBounds();
        setSidebarWidth(sidebar.getBoundingClientRect().width, bounds);
    });

    const initialBounds = getSidebarBounds();
    setSidebarWidth(sidebar.getBoundingClientRect().width, initialBounds);

    if (toggle) {
        toggle.addEventListener('click', () => {
            setSidebarCollapsed(!isSidebarCollapsed());
        });
    }
});
