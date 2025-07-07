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
        
})(jQuery);


document.addEventListener('DOMContentLoaded', () => {
    // --- Main Element References ---
    const wrapper = document.getElementById('wrapper');
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const gallery = document.getElementById('photo-gallery');
    const searchInput = document.getElementById('search-input');
    const marquee = document.getElementById('marquee');
    const itemContextMenu = document.getElementById('custom-context-menu');
    const galleryContextMenu = document.getElementById('gallery-context-menu');
    const scrollTrack = document.getElementById('custom-scrollbar-track');
    const scrollThumb = document.getElementById('custom-scrollbar-thumb');

    if (!gallery || !wrapper) {
        console.error("Core components #wrapper or #photo-gallery not found.");
        return;
    }
    
    // --- State Variables ---
    let items = gallery.getElementsByTagName('figure');
    let selectedItems = new Set();
    let isMarquee = false;
    let startPos = { x: 0, y: 0 };
    let preMarqueeSelectedItems = new Set();
    let hasDragged = false;
    let mouseDownItem = null;
    let rightClickedItem = null;
    
    // --- Keyboard Navigation State ---
    let selectionAnchor = null;
    let lastSelectedItem = null;
    let gridMetrics = { cols: 0 };

    // --- Helper Functions ---
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
    function getMimeType(filename) {
        if (!filename) return 'application/octet-stream';
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg': case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'webp': return 'image/webp';
            default: return 'application/octet-stream';
        }
    }

    // --- Keyboard Navigation and Grid Calculation ---
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
        const itemsToSelect = new Set();
        for (let i = start; i <= end; i++) itemsToSelect.add(visibleItems[i]);
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

    // --- Primary Event Listeners ---

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
        
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            visibleItems.forEach(item => setSelection(item, true));
            return;
        }

        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) return;
        let currentIndex = lastSelectedItem ? visibleItems.indexOf(lastSelectedItem) : -1;
        let newIndex = -1;
        if (currentIndex === -1) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') newIndex = 0;
            else newIndex = visibleItems.length - 1;
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

    // MouseDown Listener (for Marquee and Drag Initiation)
    wrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || header.contains(e.target) || footer.contains(e.target) || e.target === searchInput) return;
        const clickedOnItem = e.target.closest('figure');
        if (clickedOnItem) {
            isMarquee = false;
            hasDragged = false;
            mouseDownItem = clickedOnItem;
        } else if (gallery.contains(e.target)) {
            e.preventDefault();
            if (searchInput) searchInput.blur();
            isMarquee = true;
            hasDragged = false;
            mouseDownItem = null;
            const galleryRect = gallery.getBoundingClientRect();
            startPos = { x: e.clientX - galleryRect.left, y: e.clientY - galleryRect.top };
            preMarqueeSelectedItems = new Set(selectedItems);
        }
    });

    // MouseMove Listener (for drawing the marquee)
    document.addEventListener('mousemove', (e) => {
        if (!isMarquee) return;
        if (footer.contains(e.target)) { // Stop marquee if mouse enters footer
            isMarquee = false;
            hasDragged = false;
            marquee.style.visibility = 'hidden';
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
            const intersects = marqueeRect.x < relativeItemRect.right && marqueeRect.x + marqueeRect.w > relativeItemRect.left && marqueeRect.y < relativeItemRect.bottom && marqueeRect.y + marqueeRect.h > relativeItemRect.top;
            if (isModifier) {
                setSelection(item, intersects ? !preMarqueeSelectedItems.has(item) : preMarqueeSelectedItems.has(item));
            } else {
                setSelection(item, intersects);
            }
        }
    });

    // MouseUp Listener (handles selection logic)
    const endDragAction = (e) => {
        if (isMarquee && hasDragged) {
            const itemUnderMouse = e.target.closest('figure');
            if (mouseDownItem) selectionAnchor = mouseDownItem;
            if (itemUnderMouse && selectedItems.has(itemUnderMouse)) lastSelectedItem = itemUnderMouse;
            else {
                const visibleSelectedItems = Array.from(items).filter(item => item.style.display !== 'none' && selectedItems.has(item));
                if (visibleSelectedItems.length > 0) lastSelectedItem = visibleSelectedItems[visibleSelectedItems.length - 1];
            }
        } else if (!hasDragged) {
            const isShift = e.shiftKey;
            const isModifier = e.metaKey || e.ctrlKey;
            if (mouseDownItem) {
                if (isShift && selectionAnchor) {
                    lastSelectedItem = mouseDownItem;
                    applyRangeSelection();
                } else if (isModifier) {
                    toggleSelection(mouseDownItem);
                    if (isSelected(mouseDownItem)) {
                        selectionAnchor = mouseDownItem;
                        lastSelectedItem = mouseDownItem;
                    }
                } else {
                    if (!isSelected(mouseDownItem) || selectedItems.size > 1) {
                        clearSelection();
                        toggleSelection(mouseDownItem);
                    } else {
                        clearSelection();
                    }
                    selectionAnchor = mouseDownItem;
                    lastSelectedItem = mouseDownItem;
                }
            } else if (!isModifier && !isShift) {
                clearSelection();
                selectionAnchor = null;
                lastSelectedItem = null;
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

    // Global mousedown to clear context menus
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0 && !itemContextMenu.contains(e.target) && !galleryContextMenu.contains(e.target)) {
            itemContextMenu.style.display = 'none';
            galleryContextMenu.style.display = 'none';
        }
    });

    // Context Menu Logic
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
                primaryTarget.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
                break;
            }
            case 'context-menu-open-tab': {
                const img = primaryTarget.querySelector('img');
                if (img && img.dataset.fullsrc) window.open(img.dataset.fullsrc, '_blank');
                break;
            }
            case 'context-menu-save': {
                if (selectedItems.size > 1) {
                    document.body.style.cursor = 'wait';
                    const zip = new JSZip();
                    const promises = Array.from(selectedItems).map(figure => {
                        const itemImg = figure.querySelector('img');
                        const itemSrc = itemImg.dataset.fullsrc;
                        const itemFilename = figure.querySelector('figcaption').childNodes[0].nodeValue.trim();
                        if (!itemSrc) return Promise.resolve();
                        return fetch(itemSrc)
                            .then(response => response.ok ? response.blob() : Promise.reject(new Error(response.statusText)))
                            .then(blob => zip.file(itemFilename, blob))
                            .catch(error => console.error(`Failed to fetch ${itemFilename}:`, error));
                    });
                    Promise.all(promises).then(() => {
                        zip.generateAsync({ type: "blob" }).then(content => {
                            saveAs(content, "witcher_images.zip");
                            document.body.style.cursor = 'default';
                        });
                    });
                } else {
                    const img = primaryTarget.querySelector('img');
                    const fullSrc = img.dataset.fullsrc;
                    const filename = primaryTarget.querySelector('figcaption').childNodes[0].nodeValue.trim();
                    if (fullSrc && filename) downloadImage(fullSrc, filename);
                }
                break;
            }
        }
        rightClickedItem = null;
    });
    galleryContextMenu.addEventListener('click', (e) => {
        galleryContextMenu.style.display = 'none';
    });
    
    // --- Drag-to-Download ---
    document.addEventListener('galleryLoaded', () => {
        // Initial and responsive grid calculation
        calculateGridMetrics();
        const galleryObserver = new ResizeObserver(calculateGridMetrics);
        galleryObserver.observe(gallery);
        if(searchInput) searchInput.addEventListener('keyup', () => setTimeout(calculateGridMetrics, 50));

        // Keep a reference to the temporary URL to clean it up later.
        let temporaryObjectURL = null;

        // Note: The event listener is now ASYNC to allow for 'await'.
        gallery.addEventListener('dragstart', async (e) => {
            const figure = e.target.closest('figure');
            if (!figure) return;

            // Set a "waiting" cursor because we are now downloading the file.
            document.body.style.cursor = 'wait';

            // Handle selection logic.
            if (!selectedItems.has(figure)) {
                clearSelection();
                toggleSelection(figure);
                selectionAnchor = figure;
                lastSelectedItem = figure;
            }

            const img = figure.querySelector('img');
            const highResSrc = img.dataset.fullsrc;
            const filename = img.dataset.filename;

            if (highResSrc && filename) {
                try {
                    // 1. FETCH the image data and create a local Blob URL.
                    const response = await fetch(highResSrc);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    temporaryObjectURL = URL.createObjectURL(blob);

                    const mimeType = getMimeType(filename);
                    
                    // 2. SET the drag data using the local Blob URL.
                    e.dataTransfer.setData('DownloadURL', `${mimeType}:${filename}:${temporaryObjectURL}`);
                    e.dataTransfer.setData('text/uri-list', temporaryObjectURL);
                    e.dataTransfer.setData('text/plain', temporaryObjectURL);
                    
                    // A small touch: use the thumbnail as the drag ghost image.
                    e.dataTransfer.setDragImage(img, 20, 20);

                } catch (error) {
                    console.error("Drag-to-download setup failed:", error);
                    document.body.style.cursor = 'default';
                    e.preventDefault();
                }
            }
        });

        // Add a 'dragend' listener to clean up.
        gallery.addEventListener('dragend', (e) => {
            document.body.style.cursor = 'default';
            if (temporaryObjectURL) {
                URL.revokeObjectURL(temporaryObjectURL);
                temporaryObjectURL = null;
            }
        });
    });

    // --- Custom Scrollbar ---
    if (scrollTrack && scrollThumb) {
        let ticking = false;
        function updateThumbPosition() {
            const scrollableHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const trackHeight = scrollTrack.offsetHeight;
            const thumbHeight = scrollThumb.offsetHeight;
            if (scrollableHeight <= viewportHeight) return;
            const scrollPercentage = window.scrollY / (scrollableHeight - viewportHeight);
            const thumbPosition = scrollPercentage * (trackHeight - thumbHeight);
            scrollThumb.style.transform = `translateY(${thumbPosition}px)`;
        }
        function setupScrollbar() {
            const headerHeight = header.offsetHeight;
            const scrollableHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            if (scrollableHeight <= viewportHeight) {
                scrollTrack.style.display = 'none';
                return;
            }
            scrollTrack.style.display = 'block';
            scrollTrack.style.top = `${headerHeight}px`;
            scrollTrack.style.height = `calc(100% - ${headerHeight}px)`;
            const trackHeight = scrollTrack.offsetHeight;
            const thumbHeight = Math.max((viewportHeight / scrollableHeight) * trackHeight, 20);
            scrollThumb.style.height = `${thumbHeight}px`;
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
        scrollThumb.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startScrollTop = document.documentElement.scrollTop;
            function onMouseMove(e) {
                const deltaY = e.clientY - startY;
                const scrollableHeight = document.documentElement.scrollHeight;
                const viewportHeight = window.innerHeight;
                const trackHeight = scrollTrack.offsetHeight;
                const thumbHeight = scrollThumb.offsetHeight;
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
        
        // Scrollbar Proximity Effect
        let proximityTicking = false;
        document.addEventListener('mousemove', (e) => {
            if (!proximityTicking) {
                window.requestAnimationFrame(() => {
                    const thumbRect = scrollThumb.getBoundingClientRect();
                    const proximity = 30;
                    const isHorizontallyNear = e.clientX >= thumbRect.left - proximity;
                    const isVerticallyNear = (e.clientY >= thumbRect.top - proximity) && (e.clientY <= thumbRect.bottom + proximity);
                    if (isHorizontallyNear && isVerticallyNear && e.clientX < window.innerWidth - 2) {
                        scrollThumb.classList.add('is-near');
                    } else {
                        scrollThumb.classList.remove('is-near');
                    }
                    proximityTicking = false;
                });
                proximityTicking = true;
            }
        });

        // Initial and Responsive Setup
        window.addEventListener('resize', setupScrollbar);
        window.addEventListener('load', setupScrollbar);
        window.addEventListener('orientationchange', setupScrollbar);
        document.addEventListener('galleryLoaded', () => setTimeout(setupScrollbar, 100));
        setupScrollbar();
        setTimeout(setupScrollbar, 500);
    }
});
