document.addEventListener('DOMContentLoaded', () => {
    //
    // --- Element Variables ---
    //
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    const searchInput = document.getElementById('search-input');
    if (!gallery || !wrapper) return;

    //
    // --- Marquee & Selection Variables ---
    //
    const marquee = document.getElementById('marquee');
    const items = gallery.getElementsByTagName('figure');
    let selectedItems = new Set();
    let isMarquee = false;
    let startPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();

    //
    // --- Drag & Click Detection Variables ---
    //
    let hasDragged = false;
    let mouseDownItem = null;
    const DRAG_THRESHOLD = 5;
    let initialMousePos = { x: 0, y: 0 };

    /*
    ==================================================================
    // SEARCH LOGIC
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
            item.style.display = isMatch ? 'flex' : 'none';
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
    // SELECTION & NAVIGATION LOGIC
    ==================================================================
    */
    let selectionAnchor = null;
    let lastSelectedItem = null;
    let gridMetrics = { cols: 0 };

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

    // --- Mouse Down: The start of any interaction ---
    wrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || e.target === searchInput || header.contains(e.target) || footer.contains(e.target)) {
            return;
        }

        const clickedItem = e.target.closest('figure');
        initialMousePos = { x: e.clientX, y: e.clientY };
        hasDragged = false;

        if (clickedItem) {
            isMarquee = false;
            mouseDownItem = clickedItem;
        } else if (gallery.contains(e.target)) {
            e.preventDefault();
            if (searchInput) searchInput.blur();
            isMarquee = true;
            mouseDownItem = null;
            const galleryRect = gallery.getBoundingClientRect();
            startPos = { x: e.clientX - galleryRect.left, y: e.clientY - galleryRect.top };
            preMarqueeSelectedItems = new Set(selectedItems);
        }
    });

    // --- Mouse Move: Handles marquee drawing and drag detection ---
    document.addEventListener('mousemove', (e) => {
        if (!isMarquee && !mouseDownItem) return;

        if (!hasDragged) {
            const dx = Math.abs(e.clientX - initialMousePos.x);
            const dy = Math.abs(e.clientY - initialMousePos.y);
            if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                hasDragged = true;
            }
        }
        
        if (!isMarquee) return;
        
        e.preventDefault();
        document.body.classList.add('is-marquee-dragging');
        marquee.style.visibility = 'visible';
        
        const galleryRect = gallery.getBoundingClientRect();
        const currentX = Math.max(0, Math.min(e.clientX - galleryRect.left, galleryRect.width));
        const currentY = e.clientY - galleryRect.top;
        
        const marqueeRect = {
            x: Math.min(startPos.x, currentX),
            y: Math.min(startPos.y, currentY),
            w: Math.abs(startPos.x - currentX),
            h: Math.abs(startPos.y - currentY)
        };
        
        Object.assign(marquee.style, {
            left: `${marqueeRect.x}px`,
            top: `${marqueeRect.y}px`,
            width: `${marqueeRect.w}px`,
            height: `${marqueeRect.h}px`
        });
        
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
            
            const intersects = marqueeRect.x < relativeItemRect.right &&
                               marqueeRect.x + marqueeRect.w > relativeItemRect.left &&
                               marqueeRect.y < relativeItemRect.bottom &&
                               marqueeRect.y + marqueeRect.h > relativeItemRect.top;
            
            if (isModifier) {
                setSelection(item, intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item));
            } else {
                setSelection(item, intersects);
            }
        }
    });

    // --- Mouse Up: Finalizes clicks and marquee selections ---
    const endDragAction = (e) => {
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
            } else if (!isModifier && !isShift) {
                clearSelection();
                selectionAnchor = null;
                lastSelectedItem = null;
            }
        }

        document.body.classList.remove('is-marquee-dragging');
        isMarquee = false;
        hasDragged = false;
        mouseDownItem = null;
        Object.assign(marquee.style, { visibility: 'hidden', width: '0px', height: '0px' });
        preMarqueeSelectedItems.clear();
    };
    
    document.addEventListener('mouseup', endDragAction);

    // --- Drag Start: Handles dragging files out of the browser ---
    gallery.addEventListener('dragstart', (e) => {
        const figure = e.target.closest('figure');
        
        if (!figure) {
            e.preventDefault();
            return;
        }

        if (!selectedItems.has(figure)) {
            clearSelection();
            toggleSelection(figure);
        }

        const img = figure.querySelector('img');
        if (!img) {
            e.preventDefault();
            return;
        }
        
        const fullSrc = img.dataset.fullsrc;
        let filename = img.dataset.filename || fullSrc.split('/').pop();
        const extension = filename.split('.').pop().toLowerCase();
        let mimeType = 'application/octet-stream';
        if (['jpg', 'jpeg'].includes(extension)) mimeType = 'image/jpeg';
        if (extension === 'png') mimeType = 'image/png';
        if (extension === 'webp') mimeType = 'image/webp';
        
        const downloadUrl = `${mimeType}:${filename}:${fullSrc}`;
        e.dataTransfer.setData('DownloadURL', downloadUrl);
        e.dataTransfer.setData('text/uri-list', fullSrc);
        e.dataTransfer.setData('text/plain', fullSrc);
    });

    // --- Other Listeners ---
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
            if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
                return;
            }
            e.preventDefault();
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            visibleItems.forEach(item => setSelection(item, true));
        }
    });

    /*
    ==================================================================
    // CONTEXT MENU LOGIC
    ==================================================================
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
            saveMenuItem.textContent = selectedItems.size > 1 ? `Save ${selectedItems.size} Images as .zip` : 'Save Image to "Downloads"';
            
            Object.assign(itemContextMenu.style, { display: 'block', left: `${e.clientX}px`, top: `${e.clientY}px` });
        } else if (e.target === gallery) {
            rightClickedItem = null;
            Object.assign(galleryContextMenu.style, { display: 'block', left: `${e.clientX}px`, top: `${e.clientY}px` });
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
                const imgTab = primaryTarget.querySelector('img');
                if (imgTab && imgTab.dataset.fullsrc) window.open(imgTab.dataset.fullsrc, '_blank');
                break;
            case 'context-menu-save':
                try {
                    if (selectedItems.size > 1) {
                        const zip = new JSZip();
                        const promises = Array.from(selectedItems).map(item => {
                            const img = item.querySelector('img');
                            const url = img.dataset.fullsrc;
                            const filename = img.dataset.filename || url.split('/').pop();
                            return fetchImageBlob(url)
                                .then(blob => zip.file(filename, blob))
                                .catch(err => console.error(`Failed to fetch ${filename}:`, err));
                        });
                        await Promise.all(promises);
                        const zipBlob = await zip.generateAsync({ type: "blob" });
                        const date = new Date().toISOString().split('T')[0];
                        triggerDownload(zipBlob, `HOTD-Selection_${selectedItems.size}-images_${date}.zip`);
                    } else {
                        const item = Array.from(selectedItems)[0];
                        const img = item.querySelector('img');
                        const url = img.dataset.fullsrc;
                        const filename = img.dataset.filename || url.split('/').pop();
                        const blob = await fetchImageBlob(url);
                        triggerDownload(blob, filename);
                    }
                } catch (error) {
                    console.error("Download failed:", error);
                    alert("An error occurred while downloading. Please check the console.");
                }
                break;
        }
        rightClickedItem = null;
    });

    galleryContextMenu.addEventListener('click', (e) => {
        galleryContextMenu.style.display = 'none';
        const targetId = e.target.id;
        const messages = {
            'gallery-context-add': 'Functionality for "Add Image" is not yet implemented.',
            'gallery-context-sort': 'Functionality for "Sort By" is not yet implemented.',
            'gallery-context-view': 'Functionality for "Show View Options" is not yet implemented.'
        };
        if (messages[targetId]) alert(messages[targetId]);
    });

    /*
    ==================================================================
    // MODAL LOGIC
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
        
        downloadBtn.dataset.fullsrc = img.dataset.fullsrc;
        modalImg.src = img.src; // Show thumbnail immediately
        
        const highResImage = new Image();
        highResImage.src = img.dataset.fullsrc;
        highResImage.onload = () => { modalImg.src = highResImage.src; };
        modalImg.alt = img.alt;
        modalFilename.textContent = img.dataset.filename;
        
        let primaryHTML = '<dl class="info-grid">';
        let detailsHTML = '<dl class="info-grid">';
        let hasDetails = false;
        
        primaryKeys.forEach(key => {
            if (img.dataset[key] && img.dataset[key].trim() && img.dataset[key].trim() !== '-' && img.dataset[key].trim() !== '- (-)') {
                primaryHTML += `<div class="info-item"><dt>${KEY_TO_LABEL_MAP[key] || key}</dt><dd>${img.dataset[key]}</dd></div>`;
            }
        });
        
        const handledKeys = ['search', 'fullsrc', 'filename', ...primaryKeys];
        for (const key in img.dataset) {
            if (!handledKeys.includes(key) && img.dataset[key] && img.dataset[key].trim() !== '' && img.dataset[key].trim() !== '-') {
                hasDetails = true;
                let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                let value = img.dataset[key];
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

    function hideModal() {
        document.body.classList.remove('is-article-visible');
        modal.classList.remove('is-visible');
        currentImageIndex = -1;
        setTimeout(() => { modalImg.src = ""; modalFilename.textContent = ""; modalMetadata.innerHTML = ""; }, 250);
    }
    
    function showNextImage() {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        showImage((currentImageIndex + 1) % visibleFigures.length);
    }

    function showPrevImage() {
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        showImage((currentImageIndex - 1 + visibleFigures.length) % visibleFigures.length);
    }

    gallery.addEventListener('dblclick', (e) => {
        const figure = e.target.closest('figure');
        if (!figure) return;
        const visibleFigures = Array.from(gallery.querySelectorAll('figure:not([style*="display: none"])'));
        const index = visibleFigures.indexOf(figure);
        if (index > -1) showImage(index);
    });

    downloadBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = e.currentTarget.dataset.fullsrc;
        const filename = modalFilename.textContent || url.split('/').pop();
        if (!url || !filename) return;
        
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        downloadBtn.disabled = true;

        try {
            const blob = await fetchImageBlob(url);
            triggerDownload(blob, filename);
        } catch (error) {
            console.error("Modal download failed:", error);
            alert("An error occurred while downloading the image.");
        } finally {
            setTimeout(() => {
                downloadBtn.innerHTML = originalText.replace('Downloading...', 'Download');
                downloadBtn.disabled = false;
            }, 1000);
        }
    });

    closeModal.addEventListener('click', hideModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    modal.addEventListener('click', hideModal);
    modalContent.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('is-visible')) {
            if (e.key === 'Escape') hideModal();
            else if (e.key === 'ArrowRight') showNextImage();
            else if (e.key === 'ArrowLeft') showPrevImage();
        }
    });
});

/*
==================================================================
// CUSTOM SCROLLBAR LOGIC
==================================================================
*/
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

    ['resize', 'load', 'orientationchange', 'galleryFiltered'].forEach(event =>
        window.addEventListener(event, setupScrollbar)
    );
    
    setupScrollbar();
    setTimeout(setupScrollbar, 500);
});

/*
==================================================================
// SCROLLBAR PROXIMITY EFFECT
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
// AUTOCOMPLETE SEARCH SUGGESTIONS
==================================================================
*/
document.addEventListener('galleryLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const galleryItems = document.querySelectorAll('#photo-gallery figure img');
    
    if (!searchInput || !suggestionsContainer || galleryItems.length === 0) return;
    
    const searchTerms = new Set();
    galleryItems.forEach(img => {
        const peopleSources = [img.dataset.cast, img.dataset.crew, img.dataset.castAndCrew, img.dataset.characters];
        peopleSources.forEach(source => {
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

/*
==================================================================
// COPY FILENAMES TO CLIPBOARD
==================================================================
*/
document.addEventListener('keydown', (e) => {
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
            const filenames = Array.from(selectedFigures)
                .map(figure => figure.querySelector('img')?.dataset.filename)
                .filter(name => name);

            if (filenames.length > 0) {
                navigator.clipboard.writeText(filenames.join(' ')).catch(err => {
                    console.error('Could not copy filenames to clipboard: ', err);
                });
            }
        }
    }
});
