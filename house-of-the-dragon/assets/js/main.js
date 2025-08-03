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
// UNIFIED NATIVE JAVASCRIPT LOGIC
// ==========================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- Elements & State Variables ---
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    const searchInput = document.getElementById('search-input');
    const marquee = document.getElementById('marquee');
    const items = gallery.getElementsByTagName('figure');
    const track = document.getElementById('custom-scrollbar-track');
    const thumb = document.getElementById('custom-scrollbar-thumb');

    let selectedItems = new Set();
    let isMarquee = false;
    let startPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();
    let hasDragged = false;
    let mouseDownItem = null;
    let scrollInterval = null;
    let selectionAnchor = null;
    let lastSelectedItem = null;
    let gridMetrics = { cols: 0 };

    // ==================================================================
    // SEARCH
    // ==================================================================
    const clearSearchBtn = document.getElementById('clear-search');
    searchInput.addEventListener('keyup', function(event) {
        if (searchInput.value.length > 0) {
            clearSearchBtn.style.display = 'block';
            searchInput.style.paddingRight = '30px';
        } else {
            clearSearchBtn.style.display = 'none';
            searchInput.style.paddingRight = '';
        }
        const originalQuery = (searchInput.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const galleryItems = gallery.querySelectorAll('figure');
        const phraseRegex = /\b(s\d+e\d+|season\s*\d+|episode\s*\d+|s\d+|e\d+)\b/g;
        const phraseTerms = originalQuery.match(phraseRegex) || [];
        const remainingText = originalQuery.replace(phraseRegex, '').trim();
        const wordTerms = remainingText.split(' ').filter(term => term.length > 0);
        const searchTerms = [...phraseTerms, ...wordTerms];
        galleryItems.forEach(function(item) {
            const img = item.querySelector('img');
            const searchData = (img?.dataset.search || '').toLowerCase();
            const isMatch = searchTerms.every(term => searchData.includes(term));
            item.style.display = isMatch ? 'flex' : 'none';
        });
        window.dispatchEvent(new CustomEvent('galleryFiltered'));
    });
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
        searchInput.focus();
    });

    // ==================================================================
    // KEYBOARD NAVIGATION & SELECTION
    // ==================================================================
    const setSelection = (el, shouldBeSelected) => {
        if (shouldBeSelected && !selectedItems.has(el)) {
            selectedItems.add(el);
            el.classList.add('selected');
        } else if (!shouldBeSelected && selectedItems.has(el)) {
            selectedItems.delete(el);
            el.classList.remove('selected');
        }
    };
    const clearSelection = () => {
        selectedItems.forEach(item => item.classList.remove('selected'));
        selectedItems.clear();
    };
    const toggleSelection = (el) => setSelection(el, !selectedItems.has(el));
    const applyRangeSelection = () => {
        if (!selectionAnchor) return;
        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        const anchorIndex = visibleItems.indexOf(selectionAnchor);
        const focusIndex = visibleItems.indexOf(lastSelectedItem);
        if (anchorIndex === -1 || focusIndex === -1) return;
        const start = Math.min(anchorIndex, focusIndex);
        const end = Math.max(anchorIndex, focusIndex);
        const itemsToSelect = new Set(visibleItems.slice(start, end + 1));
        visibleItems.forEach(item => setSelection(item, itemsToSelect.has(item)));
    };
    document.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            if (isTyping) return;
            e.preventDefault();
            Array.from(items).filter(item => item.style.display !== 'none').forEach(item => setSelection(item, true));
            return;
        }

        if (isTyping || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

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

        if (newIndex >= 0 && newIndex < visibleItems.length) {
            const newItem = visibleItems[newIndex];
            if (e.shiftKey && selectionAnchor) {
                lastSelectedItem = newItem;
                applyRangeSelection();
            } else {
                clearSelection();
                setSelection(newItem, true);
                selectionAnchor = newItem;
                lastSelectedItem = newItem;
            }
            newItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });

    // ==================================================================
    // MOUSE & MARQUEE LOGIC
    // ==================================================================
    document.addEventListener('mousedown', (e) => {
        if (e.target === searchInput || e.button !== 0) return;
        
        const itemMenu = document.getElementById('custom-context-menu');
        const galleryMenu = document.getElementById('gallery-context-menu');
        if (itemMenu && !itemMenu.contains(e.target)) itemMenu.style.display = 'none';
        if (galleryMenu && !galleryMenu.contains(e.target)) galleryMenu.style.display = 'none';

        if (wrapper.contains(e.target) && !header.contains(e.target) && !footer.contains(e.target) && !thumb.contains(e.target)) {
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
        // --- SCROLLBAR PROXIMITY EFFECT ---
        if (!isMarquee && thumb) {
            const proximity = 30;
            const thumbRect = thumb.getBoundingClientRect();
            if (thumbRect.width > 0) {
                const isNear = e.clientX >= thumbRect.left - proximity &&
                               e.clientY >= thumbRect.top - proximity &&
                               e.clientY <= thumbRect.bottom + proximity &&
                               e.clientX < window.innerWidth - 2;
                thumb.classList.toggle('is-near', isNear);
            }
        }

        // --- MARQUEE DRAG LOGIC ---
        if (!isMarquee) return;
        
        if (!hasDragged) {
             hasDragged = true; // Set drag status on first move
             document.body.classList.add('is-marquee-dragging');
             if (thumb) thumb.classList.remove('is-near'); // Hide proximity effect during drag
             marquee.style.visibility = 'visible';
        }
        
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
            const intersects = marqueeRect.x < itemRect.right && marqueeRect.x + marqueeRect.w > itemRect.left &&
                               marqueeRect.y < itemRect.bottom && marqueeRect.y + marqueeRect.h > itemRect.top;
            setSelection(item, isModifier ? (intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item)) : intersects);
        }
    });

    document.addEventListener('mouseup', (e) => {
        clearInterval(scrollInterval);
        if (!isMarquee) return;

        if (!hasDragged) { // Handle Click
            const clickedOnItem = mouseDownItem;
            if (clickedOnItem) {
                if (e.shiftKey && selectionAnchor) {
                    lastSelectedItem = clickedOnItem;
                    applyRangeSelection();
                } else if (e.metaKey || e.ctrlKey) {
                    toggleSelection(clickedOnItem);
                    if (selectedItems.has(clickedOnItem)) {
                         selectionAnchor = clickedOnItem;
                         lastSelectedItem = clickedOnItem;
                    }
                } else {
                    const wasSelected = selectedItems.has(clickedOnItem);
                    const othersSelected = selectedItems.size > 1;
                    if (!wasSelected || othersSelected) {
                         clearSelection();
                         setSelection(clickedOnItem, true);
                    } else {
                         clearSelection();
                    }
                    selectionAnchor = lastSelectedItem = selectedItems.has(clickedOnItem) ? clickedOnItem : null;
                }
            } else { // Clicked on background
                 if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                     clearSelection();
                     selectionAnchor = lastSelectedItem = null;
                 }
            }
        }
        
        document.body.classList.remove('is-marquee-dragging');
        isMarquee = false;
        hasDragged = false;
        mouseDownItem = null;
        marquee.style.visibility = 'hidden';
        marquee.style.width = '0px';
        marquee.style.height = '0px';
    });

    // ==================================================================
    // CUSTOM SCROLLBAR
    // ==================================================================
    let scrollTicking = false;
    const setupScrollbar = () => {
        if (!track || !thumb || !header) return;
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
    };
    const updateThumbPosition = () => {
        if (!track || !thumb) return;
        const scrollableHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        if (scrollableHeight <= viewportHeight) return;
        const trackHeight = track.offsetHeight;
        const thumbHeight = thumb.offsetHeight;
        const scrollPercentage = window.scrollY / (scrollableHeight - viewportHeight);
        const thumbPosition = scrollPercentage * (trackHeight - thumbHeight);
        thumb.style.transform = `translateY(${thumbPosition}px)`;
    };
    document.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                updateThumbPosition();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });
    thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const startY = e.clientY;
        const startScrollTop = document.documentElement.scrollTop;
        const onDrag = (e) => {
            const deltaY = e.clientY - startY;
            const scrollableHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const trackHeight = track.offsetHeight;
            const thumbHeight = thumb.offsetHeight;
            if (trackHeight - thumbHeight === 0) return;
            const deltaScroll = (deltaY / (trackHeight - thumbHeight)) * (scrollableHeight - viewportHeight);
            window.scrollTo(0, startScrollTop + deltaScroll);
        };
        const onEnd = () => {
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', onEnd);
        };
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onEnd);
    });
    window.addEventListener('resize', setupScrollbar);
    window.addEventListener('galleryFiltered', setupScrollbar);
    const gridObserver = new ResizeObserver(() => {
        calculateGridMetrics();
        setupScrollbar();
    });
    if (gallery) gridObserver.observe(gallery);
    setupScrollbar();

    // ==================================================================
    // CONTEXT MENU & UPLOAD
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
                setSelection(figure, true);
                selectionAnchor = lastSelectedItem = figure;
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
                // Download logic here
                break;
        }
        rightClickedItem = null;
    });

    galleryContextMenu.addEventListener('click', (e) => {
        galleryContextMenu.style.display = 'none';
        if (e.target.id === 'gallery-context-add' && imageUploadInput) {
            imageUploadInput.click();
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
                    fetch(UPLOAD_URL, { method: 'PUT', headers: { 'Content-Type': file.type, 'X-Custom-Filename': file.name }, body: file })
                    .then(response => { if (!response.ok) throw new Error(`Upload failed for ${file.name}`); })
                ));
                alert(`${files.length} image(s) uploaded successfully!`);
                location.reload();
            } catch (error) {
                console.error('Upload error:', error);
                alert(`An error occurred during upload.`);
            } finally {
                document.body.style.cursor = 'default';
                event.target.value = '';
            }
        });
    }

    // ==================================================================
    // MODAL
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
        modalImg.src = img.src;
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
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok.');
            const blob = await response.blob();
            saveAs(blob, filename);
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
        if(visibleFigures.length > 0) showImage((currentImageIndex + 1) % visibleFigures.length);
    }
    function showPrevImage() {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        if(visibleFigures.length > 0) showImage((currentImageIndex - 1 + visibleFigures.length) % visibleFigures.length);
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

    // ==================================================================
    // AUTOCOMPLETE
    // ==================================================================
    const suggestionsContainer = document.getElementById('suggestions-container');
    document.addEventListener('galleryLoaded', () => {
        const galleryItems = document.querySelectorAll('#photo-gallery figure img');
        if (!searchInput || !suggestionsContainer || galleryItems.length === 0) return;
        const searchTerms = new Set();
        galleryItems.forEach(img => {
            const sources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew, img.dataset.characters];
            sources.forEach(source => {
                if (source) source.split(',').forEach(term => {
                    const cleaned = term.trim();
                    if (cleaned && cleaned.toLowerCase() !== 'red') searchTerms.add(cleaned);
                });
            });
        });
        const sortedSearchTerms = Array.from(searchTerms).sort((a, b) => a.localeCompare(b));
        let activeSuggestionIndex = -1;

        const updateSuggestions = () => {
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
                    item.addEventListener('mousedown', (e) => { e.preventDefault(); selectSuggestion(term); });
                    suggestionsContainer.appendChild(item);
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        };
        const selectSuggestion = (value) => {
            searchInput.value = value;
            suggestionsContainer.style.display = 'none';
            searchInput.dispatchEvent(new Event('keyup', { bubbles: true }));
        };
        const updateActiveSuggestion = (items) => {
            items.forEach((item, index) => item.classList.toggle('active', index === activeSuggestionIndex));
            if (items[activeSuggestionIndex]) items[activeSuggestionIndex].scrollIntoView({ block: 'nearest' });
        };
        searchInput.addEventListener('input', updateSuggestions);
        searchInput.addEventListener('keydown', (e) => {
            const items = suggestionsContainer.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex < items.length - 1) ? activeSuggestionIndex + 1 : 0;
                    updateActiveSuggestion(items);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex > 0) ? activeSuggestionIndex - 1 : items.length - 1;
                    updateActiveSuggestion(items);
                    break;
                case 'Enter':
                    if (activeSuggestionIndex > -1) {
                        e.preventDefault();
                        selectSuggestion(items[activeSuggestionIndex].textContent);
                    }
                    break;
                case 'Escape': suggestionsContainer.style.display = 'none'; break;
            }
        });
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) suggestionsContainer.style.display = 'none';
        });
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
            const modal = document.getElementById('image-modal');
            if (document.activeElement === searchInput || (modal && modal.classList.contains('is-visible'))) return;
            const selectedFigures = gallery.querySelectorAll('figure.selected');
            if (selectedFigures.length > 0) {
                e.preventDefault();
                const filenames = Array.from(selectedFigures).map(figure => figure.querySelector('img')?.dataset.filename).filter(Boolean);
                if (filenames.length > 0) navigator.clipboard.writeText(filenames.join(' ')).catch(err => console.error('Could not copy filenames:', err));
            }
        }
    });
});
