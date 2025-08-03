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
                if ($article.length == 0) return;

                if (locked || (typeof initial != 'undefined' && initial === true)) {
                    $body.addClass('is-switching');
                    $body.addClass('is-article-visible');
                    $main_articles.removeClass('active');
                    $header.hide();
                    $footer.hide();
                    $main.show();
                    $article.show();
                    $article.addClass('active');
                    locked = false;
                    setTimeout(function() {
                        $body.removeClass('is-switching');
                    }, (initial ? 1000 : 0));
                    return;
                }

                locked = true;

                if ($body.hasClass('is-article-visible')) {
                    var $currentArticle = $main_articles.filter('.active');
                    $currentArticle.removeClass('active');
                    setTimeout(function() {
                        $currentArticle.hide();
                        $article.show();
                        setTimeout(function() {
                            $article.addClass('active');
                            $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                            setTimeout(function() {
                                locked = false;
                            }, delay);
                        }, 25);
                    }, delay);
                }
                else {
                    $body.addClass('is-article-visible');
                    setTimeout(function() {
                        $header.hide();
                        $footer.hide();
                        $main.show();
                        $article.show();
                        setTimeout(function() {
                            $article.addClass('active');
                            $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
                            setTimeout(function() {
                                locked = false;
                            }, delay);
                        }, 25);
                    }, delay);
                }
            };

            $main._hide = function(addState) {
                var $article = $main_articles.filter('.active');
                if (!$body.hasClass('is-article-visible')) return;
                if (typeof addState != 'undefined' && addState === true)
                    history.pushState(null, null, '#');

                if (locked) {
                    $body.addClass('is-switching');
                    $article.removeClass('active');
                    $article.hide();
                    $main.hide();
                    $footer.show();
                    $header.show();
                    $body.removeClass('is-article-visible');
                    locked = false;
                    $body.removeClass('is-switching');
                    $window.scrollTop(0).triggerHandler('resize.flexbox-fix');
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
                        setTimeout(function() {
                            locked = false;
                        }, delay);
                    }, 25);
                }, delay);
            };

        // Articles.
            $main_articles.each(function() {
                var $this = $(this);
                $('<div class="close">Close</div>').appendTo($this).on('click', function() {
                    location.hash = '';
                });
                $this.on('click', function(event) {
                    event.stopPropagation();
                });
            });

        // Events.
            $body.on('click', function(event) {
                if ($body.hasClass('is-article-visible'))
                    $main._hide(true);
            });

            $window.on('keyup', function(event) {
                if (event.keyCode == 27 && $body.hasClass('is-article-visible'))
                    $main._hide(true);
            });

            $window.on('hashchange', function(event) {
                if (location.hash == '' || location.hash == '#') {
                    event.preventDefault();
                    event.stopPropagation();
                    $main._hide();
                } else if ($main_articles.filter(location.hash).length > 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    $main._show(location.hash.substr(1));
                }
            });

        // Scroll restoration.
            if ('scrollRestoration' in history)
                history.scrollRestoration = 'manual';
            else {
                var    oldScrollPos = 0,
                    scrollPos = 0,
                    $htmlbody = $('html,body');
                $window.on('scroll', function() {
                    oldScrollPos = scrollPos;
                    scrollPos = $htmlbody.scrollTop();
                }).on('hashchange', function() {
                    $window.scrollTop(oldScrollPos);
                });
            }

        // Initialize.
            $main.hide();
            $main_articles.hide();
            if (location.hash != '' && location.hash != '#')
                $window.on('load', function() {
                    $main._show(location.hash.substr(1), true);
                });
})(jQuery);


// ==========================================================================================
// NATIVE JAVASCRIPT LOGIC
// ==========================================================================================
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    const searchInput = document.getElementById('search-input');

    if (!gallery || !wrapper) return;

    const marquee = document.getElementById('marquee');
    const items = gallery.getElementsByTagName('figure');

    // --- State Variables ---
    let selectedItems = new Set();
    let isMarquee = false;
    let startPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();
    let hasDragged = false;
    let mouseDownItem = null;
    let scrollInterval = null;

    // --- Download Indicator ---
    let downloadAbortController = null;
    const indicator = document.getElementById('download-indicator');
    const cancelBtn = indicator.querySelector('.cancel-icon');
    cancelBtn.addEventListener('click', () => {
        if (downloadAbortController) {
            downloadAbortController.abort();
        }
    });

    // ==================================================================
    // SEARCH LOGIC
    // ==================================================================
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
            item.style.display = isMatch ? 'flex' : 'none';
        });
        window.scrollTo(0, 0);
        window.dispatchEvent(new CustomEvent('galleryFiltered'));
    });
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
        searchInput.focus();
    });

    // ==================================================================
    // KEYBOARD NAVIGATION & SELECTION LOGIC
    // ==================================================================
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
        for (const item of visibleItems) {
            if (itemsToSelect.has(item)) {
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
        const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            if (isTyping) {
                 // Allow default "select all" in text inputs
                return;
            }
            e.preventDefault();
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            visibleItems.forEach(item => setSelection(item, true));
            return;
        }

        if (isTyping) return; // Ignore other key presses while typing

        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

        e.preventDefault();
        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) return;

        let currentIndex = lastSelectedItem ? visibleItems.indexOf(lastSelectedItem) : -1;
        let newIndex = currentIndex;

        if (currentIndex === -1) {
            newIndex = 0;
        } else {
            switch (e.key) {
                case 'ArrowLeft': newIndex = Math.max(0, currentIndex - 1); break;
                case 'ArrowRight': newIndex = Math.min(visibleItems.length - 1, currentIndex + 1); break;
                case 'ArrowUp': newIndex = Math.max(0, currentIndex - gridMetrics.cols); break;
                case 'ArrowDown': newIndex = Math.min(visibleItems.length - 1, currentIndex + gridMetrics.cols); break;
            }
        }
        if (newIndex !== -1 && newIndex < visibleItems.length) {
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

    // --- Observers & Helpers ---
    calculateGridMetrics();
    const galleryObserver = new ResizeObserver(calculateGridMetrics);
    galleryObserver.observe(gallery);
    searchInput.addEventListener('keyup', () => setTimeout(calculateGridMetrics, 50));
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

    // ==================================================================
    // MOUSE DRAG / MARQUEE SELECTION
    // ==================================================================
    document.addEventListener('mousedown', (e) => {
        if (e.target === searchInput || e.button !== 0) return;

        const itemMenu = document.getElementById('custom-context-menu');
        const galleryMenu = document.getElementById('gallery-context-menu');
        if (itemMenu && !itemMenu.contains(e.target)) itemMenu.style.display = 'none';
        if (galleryMenu && !galleryMenu.contains(e.target)) galleryMenu.style.display = 'none';

        if (wrapper.contains(e.target) && !header.contains(e.target) && !footer.contains(e.target)) {
            e.preventDefault();
            if (searchInput) searchInput.blur();

            isMarquee = true;
            hasDragged = false;
            mouseDownItem = e.target.closest('figure');

            startPos = { x: e.clientX, y: e.clientY };

            preMarqueeSelectedItems = new Set(selectedItems);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMarquee) return;
        hasDragged = true;
        document.body.classList.add('is-marquee-dragging');
        marquee.style.visibility = 'visible';

        const scrollZone = 40;
        const scrollSpeed = 15;
        clearInterval(scrollInterval);
        if (e.clientY > window.innerHeight - scrollZone) {
            scrollInterval = setInterval(() => { window.scrollBy(0, scrollSpeed); }, 16);
        } else if (e.clientY < scrollZone) {
            scrollInterval = setInterval(() => { window.scrollBy(0, -scrollSpeed); }, 16);
        }

        const marqueeRect = {
            x: Math.min(startPos.x, e.clientX),
            y: Math.min(startPos.y, e.clientY),
            w: Math.abs(startPos.x - e.clientX),
            h: Math.abs(startPos.y - e.clientY)
        };
        marquee.style.left = `${marqueeRect.x}px`;
        marquee.style.top = `${marqueeRect.y}px`;
        marquee.style.width = `${marqueeRect.w}px`;
        marquee.style.height = `${marqueeRect.h}px`;

        const isModifier = e.metaKey || e.ctrlKey || e.shiftKey;

        for (const item of items) {
            if (item.style.display === 'none') continue;
            const itemRect = item.getBoundingClientRect();
            const intersects =
                marqueeRect.x < itemRect.right &&
                marqueeRect.x + marqueeRect.w > itemRect.left &&
                marqueeRect.y < itemRect.bottom &&
                marqueeRect.y + marqueeRect.h > itemRect.top;

            if (isModifier) {
                setSelection(item, intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item));
            } else {
                setSelection(item, intersects);
            }
        }
    });

    document.addEventListener('mouseup', (e) => {
        clearInterval(scrollInterval);
        
        if (isMarquee) {
            document.body.classList.remove('is-marquee-dragging');

            if (!hasDragged) {
                if (!header.contains(e.target) && !footer.contains(e.target)) {
                    const clickedOnItem = mouseDownItem;
                    const isShift = e.shiftKey;
                    const isModifier = e.metaKey || e.ctrlKey;
                    if (clickedOnItem) {
                        if (isShift && selectionAnchor) {
                             lastSelectedItem = clickedOnItem;
                             applyRangeSelection();
                        } else if (isModifier) {
                            toggleSelection(clickedOnItem);
                            selectionAnchor = isSelected(clickedOnItem) ? clickedOnItem : selectionAnchor;
                            lastSelectedItem = isSelected(clickedOnItem) ? clickedOnItem : null;
                        } else {
                            const wasSelectedAndOthers = isSelected(clickedOnItem) && selectedItems.size > 1;
                            if (!wasSelectedAndOthers) {
                                clearSelection();
                                toggleSelection(clickedOnItem);
                            } else {
                                clearSelection();
                                toggleSelection(clickedOnItem);
                            }
                            selectionAnchor = isSelected(clickedOnItem) ? clickedOnItem : null;
                            lastSelectedItem = isSelected(clickedOnItem) ? clickedOnItem : null;
                        }
                    } else {
                        if (!isModifier && !isShift) {
                            clearSelection();
                            selectionAnchor = null;
                            lastSelectedItem = null;
                        }
                    }
                }
            }
        }
        
        isMarquee = false;
        hasDragged = false;
        mouseDownItem = null;
        marquee.style.visibility = 'hidden';
        marquee.style.width = '0px';
        marquee.style.height = '0px';
    });


    // ==================================================================
    // CONTEXT MENU & UPLOAD LOGIC
    // ==================================================================
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
            saveMenuItem.textContent = `Save ${selectedItems.size > 1 ? selectedItems.size + ' Images' : 'Image'} to "Downloads"`;
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
                const updateProgress = (percent) => progressCircle.style.setProperty('--progress-angle', `${percent * 3.6}deg`);
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
                        const parseSizeToBytes = (s) => { const [v, u] = s.split(' '); const n = parseFloat(v); return isNaN(n) ? 0 : n * ({KB:1024, MB:1048576, GB:1073741824}[u.toUpperCase()] || 1); };
                        itemsToDownload.forEach(item => totalDownloadSize += parseSizeToBytes(item.querySelector('img').dataset.size || '0'));
                        
                        await Promise.all(itemsToDownload.map(async item => {
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
                            } catch (error) { if (error.name !== 'AbortError') console.error(`Could not download ${filename}:`, error); else throw error; }
                        }));
                        
                        updateProgress(100);
                        await new Promise(resolve => setTimeout(resolve, 400));
                        indicator.classList.remove('is-active', 'is-downloading');
                    } catch (error) {
                        if (error.name === 'AbortError') console.log('Download canceled.');
                        else console.error("Download failed:", error);
                        indicator.classList.remove('is-downloading', 'is-active');
                    } finally {
                        downloadAbortController = null;
                        setTimeout(() => updateProgress(0), 400);
                    }
                };
                performDownloads();
                break;
        }
        rightClickedItem = null;
    });

    galleryContextMenu.addEventListener('click', (e) => {
        galleryContextMenu.style.display = 'none';
        switch (e.target.id) {
            case 'gallery-context-add':
                if (imageUploadInput) imageUploadInput.click();
                break;
            case 'gallery-context-sort':
                alert('Sort functionality is not implemented.');
                break;
            case 'gallery-context-view':
                alert('View options functionality is not implemented.');
                break;
        }
    });

    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (!files.length) return;
            const UPLOAD_URL = 'https://r2-upload-presigner.witcherarchive.workers.dev';
            document.body.style.cursor = 'wait';
            try {
                await Promise.all(Array.from(files).map(file =>
                    fetch(UPLOAD_URL, {
                        method: 'PUT',
                        headers: { 'Content-Type': file.type, 'X-Custom-Filename': file.name },
                        body: file
                    }).then(response => {
                        if (!response.ok) return response.text().then(text => { throw new Error(`Upload failed for ${file.name}: ${text}`); });
                        return response.json();
                    })
                ));
                alert(`${files.length} image(s) uploaded successfully!`);
                location.reload();
            } catch (error) {
                console.error('Upload error:', error);
                alert(`An error occurred during upload: ${error.message}`);
            } finally {
                document.body.style.cursor = 'default';
                event.target.value = '';
            }
        });
    }

    // ==================================================================
    // MODAL LOGIC
    // ==================================================================
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

    const KEY_TO_LABEL_MAP = { season: 'Season', episode: 'Episode', cast: 'Cast', crew: 'Crew', castAndCrew: 'Cast & Crew', characters: 'Characters' };
    const primaryKeys = ['season', 'episode', 'cast', 'crew', 'castAndCrew', 'characters'];

    function showImage(index) {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        if (index < 0 || index >= visibleFigures.length) return;
        currentImageIndex = index;
        const figure = visibleFigures[currentImageIndex];
        const img = figure.querySelector('img');
        downloadBtn.dataset.fullsrc = img.dataset.fullsrc;
        modalImg.src = img.src; // Show thumb immediately
        const highResImage = new Image();
        highResImage.src = img.dataset.fullsrc;
        highResImage.onload = () => { modalImg.src = highResImage.src; };
        modalImg.alt = img.alt;
        modalFilename.textContent = img.dataset.filename;

        let primaryHTML = '<dl class="info-grid">';
        let detailsHTML = '<dl class="info-grid">';
        const dataset = img.dataset;
        primaryKeys.forEach(key => {
            if (dataset[key] && dataset[key].trim() && dataset[key].trim() !== '-' && dataset[key].trim() !== '- (-)') {
                primaryHTML += `<div class="info-item"><dt>${KEY_TO_LABEL_MAP[key] || key}</dt><dd>${dataset[key]}</dd></div>`;
            }
        });
        let hasDetails = false;
        const handledKeys = ['search', 'fullsrc', 'filename', ...primaryKeys];
        for (const key in dataset) {
            if (!handledKeys.includes(key) && dataset[key] && dataset[key].trim() && dataset[key].trim() !== '-') {
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
        modalMetadata.innerHTML = primaryHTML + (hasDetails ? '<h4 class="metadata-header">Metadata</h4>' + detailsHTML : '');
        document.body.classList.add('is-article-visible');
        modal.classList.add('is-visible');
    }

    downloadBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const url = event.currentTarget.dataset.fullsrc;
        const filename = modalFilename.textContent || url.split('/').pop();
        if (!url || !filename) return;
        const buttonText = downloadBtn.textContent;
        try {
            downloadBtn.textContent = 'Downloading...';
            downloadBtn.disabled = true;
            const blob = await fetchImageBlob(url);
            triggerDownload(blob, filename);
        } catch (error) {
            console.error("Modal download failed:", error);
        } finally {
            setTimeout(() => {
                downloadBtn.textContent = buttonText;
                downloadBtn.disabled = false;
            }, 1000);
        }
    });

    function showNextImage() {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        showImage((currentImageIndex + 1) % visibleFigures.length);
    }
    function showPrevImage() {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        showImage((currentImageIndex - 1 + visibleFigures.length) % visibleFigures.length);
    }
    gallery.addEventListener('dblclick', function(event) {
        const figure = event.target.closest('figure');
        if (!figure) return;
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        const index = visibleFigures.indexOf(figure);
        if (index > -1) showImage(index);
    });
    function hideModal() {
        document.body.classList.remove('is-article-visible');
        modal.classList.remove('is-visible');
        currentImageIndex = -1;
        setTimeout(() => { modalImg.src = ""; }, 250);
    }
    modalContent.addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('click', hideModal);
    closeModal.addEventListener('click', hideModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    document.addEventListener('keydown', function(event) {
        if (modal.classList.contains('is-visible')) {
            if (event.key === 'Escape') hideModal();
            else if (event.key === 'ArrowRight') showNextImage();
            else if (event.key === 'ArrowLeft') showPrevImage();
        }
    });
});

/* ==================================================================
// CUSTOM SCROLLBAR & PROXIMITY EFFECT
// ================================================================== */
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
        if (scrollableHeight <= viewportHeight) {
            track.style.display = 'none';
            return;
        }
        track.style.display = 'block';
        track.style.top = `${headerHeight}px`;
        track.style.height = `calc(100% - ${headerHeight}px)`;
        const trackHeight = track.offsetHeight;
        const thumbHeight = Math.max((viewportHeight / scrollableHeight) * trackHeight, 20);
        thumb.style.height = `${thumbHeight}px`;
        updateThumbPosition();
    }

    // LISTENER FOR SCROLLING: Only updates the thumb's position.
    document.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateThumbPosition();
                ticking = false;
            });
            ticking = true;
        }
    });

    // LISTENER FOR PROXIMITY: Only handles the 'is-near' class for widening.
    document.addEventListener('mousemove', (e) => {
        const proximity = 30;
        const thumbRect = thumb.getBoundingClientRect();
        if (thumbRect.width === 0) return; // Don't run if scrollbar is hidden

        const isHorizontallyNear = e.clientX >= thumbRect.left - proximity;
        const isVerticallyNear = (e.clientY >= thumbRect.top - proximity) && (e.clientY <= thumbRect.bottom + proximity);

        if (isHorizontallyNear && isVerticallyNear && e.clientX < window.innerWidth - 2) {
            thumb.classList.add('is-near');
        } else {
            thumb.classList.remove('is-near');
        }
    });

    // LISTENER FOR DRAGGING THE THUMB
    thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
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

    // Recalculate scrollbar on page changes
    window.addEventListener('resize', setupScrollbar);
    window.addEventListener('load', setupScrollbar);
    window.addEventListener('orientationchange', setupScrollbar);
    window.addEventListener('galleryFiltered', setupScrollbar);
    setupScrollbar();
    setTimeout(setupScrollbar, 500); // Recalculate after images load
});


/* ==================================================================
// AUTOCOMPLETE & OTHER LOGIC
// ================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    
    document.addEventListener('galleryLoaded', () => {
        const galleryItems = document.querySelectorAll('#photo-gallery figure img');
        if (!searchInput || !suggestionsContainer || galleryItems.length === 0) return;
        
        const searchTerms = new Set();
        galleryItems.forEach(img => {
            const sources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew, img.dataset.characters];
            sources.forEach(source => {
                if (source) {
                    source.split(',').forEach(term => {
                        const cleaned = term.trim();
                        if (cleaned && cleaned.toLowerCase() !== 'red') searchTerms.add(cleaned);
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
            searchInput.value = value;
            suggestionsContainer.style.display = 'none';
            searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
        }
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
        searchInput.addEventListener('input', updateSuggestions);
        searchInput.addEventListener('keydown', (e) => {
            const items = suggestionsContainer.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (activeSuggestionIndex < items.length - 1) activeSuggestionIndex++;
                    updateActiveSuggestion(items);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (activeSuggestionIndex > 0) activeSuggestionIndex--;
                    updateActiveSuggestion(items);
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
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
            const gallery = document.getElementById('photo-gallery');
            const searchInput = document.getElementById('search-input');
            const modal = document.getElementById('image-modal');
            if (document.activeElement === searchInput || (modal && modal.classList.contains('is-visible'))) return;
            
            const selectedFigures = gallery.querySelectorAll('figure.selected');
            if (selectedFigures.length > 0) {
                e.preventDefault();
                const filenames = Array.from(selectedFigures).map(figure => {
                    const img = figure.querySelector('img');
                    return img ? img.dataset.filename : '';
                }).filter(name => name);
                if (filenames.length > 0) {
                    navigator.clipboard.writeText(filenames.join(' ')).catch(err => {
                        console.error('Could not copy filenames to clipboard: ', err);
                    });
                }
            }
        }
    });
});

