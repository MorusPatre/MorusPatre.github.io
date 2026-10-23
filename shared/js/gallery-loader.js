document.addEventListener('DOMContentLoaded', function() {
    const galleryContainerId = 'photo-gallery';
    const galleryContainer = document.getElementById(galleryContainerId);

    // This line now reads the JSON path from your HTML data-attribute
    const jsonPath = galleryContainer.dataset.galleryJson || 'gallery-data.json';

    const footer = document.getElementById('footer');
    let firstImageLoaded = false;

    if (!galleryContainer) {
        console.error(`Error: The element with ID '${galleryContainerId}' was not found.`);
        return;
    }

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(galleryData => {
            
            // If there are no images, show the footer immediately.
            if (galleryData.length === 0 && footer) {
                footer.style.opacity = '1';
                footer.style.pointerEvents = 'auto';
                return;
            }

            galleryData.forEach(item => {
                const figure = document.createElement('figure');
                // The original's type, which picks the kind icon the figure
                // shows until its thumbnail loads.
                const extension = item.src.split(/[?#]/)[0].split('.').pop().toLowerCase();
                figure.dataset.kind = extension === 'jpg' ? 'jpeg' : extension;
                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-container';
                
                const img = document.createElement('img');
                img.loading = 'lazy';
                img.src = item.thumbnail;
                img.alt = item.alt;
                img.addEventListener('load', () => {
                    figure.classList.add('is-visible');
                    
                    // When the first image loads, make the footer visible.
                    if (!firstImageLoaded && footer) {
                        footer.style.opacity = '1';
                        footer.style.pointerEvents = 'auto';
                        firstImageLoaded = true; // Ensure this only runs once
                    }
                });

                img.dataset.fullsrc = item.src;
                img.dataset.filename = item.filename;
                img.dataset.search = item.search;
                
                if (item.cast) { img.dataset.cast = item.cast; }
                if (item.crew) { img.dataset.crew = item.crew; }
                if (item.castAndCrew) { img.dataset.castAndCrew = item.castAndCrew; }
                if (item.characters) { img.dataset.characters = item.characters; }
                if (item.size) { img.dataset.size = item.size; }
                if (item.dimensions) { img.dataset.dimensions = item.dimensions; }
                if (item.season) { img.dataset.season = item.season; }
                if (item.episode) { img.dataset.episode = item.episode; }
                
                for (const key in item) {
                    if (!img.dataset[key] && key !== 'src' && key !== 'thumbnail' && key !== 'alt') {
                        img.dataset[key] = item[key];
                    }
                }

                const figcaption = document.createElement('figcaption');
                const filenameSpan = document.createElement('span');
                filenameSpan.className = 'filename';
                filenameSpan.textContent = item.filename;
                figcaption.appendChild(filenameSpan);

                const dimensionsSpan = document.createElement('span');
                dimensionsSpan.className = 'dimensions';
                if (item.dimensions && item.dimensions.includes('×')) {
                    const parts = item.dimensions.split('×');
                    const xSpan = document.createElement('span');
                    xSpan.className = 'dimensions-x';
                    xSpan.textContent = '×';
                    dimensionsSpan.appendChild(document.createTextNode(parts[0]));
                    dimensionsSpan.appendChild(xSpan);
                    dimensionsSpan.appendChild(document.createTextNode(parts[1]));
                } else {
                    dimensionsSpan.textContent = item.dimensions;
                }
                figcaption.appendChild(dimensionsSpan);

                imageContainer.appendChild(img);
                figure.appendChild(imageContainer);
                figure.appendChild(figcaption);
                galleryContainer.appendChild(figure);
            });
            
            document.dispatchEvent(new CustomEvent('galleryLoaded'));
            fitFilenamesToLines(galleryContainer);
            // Fitted again whenever the View Options change the caption's
            // font or width.
            document.addEventListener('galleryCaptionsChanged', () => fitFilenamesToLines(galleryContainer));
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            galleryContainer.innerHTML = 'Error loading gallery. Please check the console.';
            
            // If the gallery fails to load, still show the footer.
            if (footer) {
                footer.style.opacity = '1';
                footer.style.pointerEvents = 'auto';
            }
        });

    // Finder's title (TTitleBubbleView, Binder's TitleBubbleLayout.swift): a
    // name wraps at the caption's width onto as many lines as the cell keeps
    // whole, two at most and one below grid spacing 26. One that runs longer
    // keeps the lines before the last, and the rest, from where the last line
    // starts, is truncated in the middle to fit it. Names are laid out in a
    // hidden copy of the caption once its font has loaded; only a name wider
    // than one line can need it.
    function fitFilenamesToLines(gallery) {
        // Measured on a caption that is shown: the search or the sidebar may
        // hide the first.
        let firstName = null;
        for (const span of gallery.querySelectorAll('figure .filename')) {
            if (span.parentElement.clientWidth > 0) {
                firstName = span;
                break;
            }
        }
        if (!firstName) return;

        const caption = firstName.parentElement;
        const captionStyle = getComputedStyle(caption);
        const nameStyle = getComputedStyle(firstName);
        const font = `${nameStyle.fontStyle} ${nameStyle.fontWeight} ${nameStyle.fontSize} ${nameStyle.fontFamily}`;
        const width = caption.clientWidth - parseFloat(captionStyle.paddingLeft) - parseFloat(captionStyle.paddingRight);
        const lineHeight = parseFloat(nameStyle.lineHeight);
        const maxLines = Math.max(1, Math.floor(parseFloat(getComputedStyle(gallery).getPropertyValue('--name-lines')) || 2));

        document.fonts.load(font).then(() => {
            const context = document.createElement('canvas').getContext('2d');
            context.font = font;
            const measure = text => context.measureText(text).width;

            const probe = document.createElement('div');
            probe.setAttribute('aria-hidden', 'true');
            probe.style.cssText = 'position: absolute; top: 0; left: 0; visibility: hidden; pointer-events: none;';
            probe.style.font = font;
            probe.style.lineHeight = nameStyle.lineHeight;
            probe.style.width = `${width}px`;
            probe.style.overflowWrap = captionStyle.overflowWrap;
            probe.style.wordBreak = captionStyle.wordBreak;
            document.body.appendChild(probe);
            const range = document.createRange();

            // A name cut short before keeps its whole self, to fit again from.
            for (const span of gallery.querySelectorAll('figure .filename')) {
                const name = span.dataset.name || span.textContent;
                const restore = () => {
                    if (!span.dataset.name) return;
                    span.textContent = name;
                    delete span.dataset.name;
                };
                if (measure(name) <= width) {
                    restore();
                    continue;
                }

                probe.textContent = name;
                if (probe.getBoundingClientRect().height <= lineHeight * (maxLines + 0.5)) {
                    restore();
                    continue;
                }

                // Where the last line starts: the first character below the
                // lines before it.
                let low = 0;
                if (maxLines > 1) {
                    const text = probe.firstChild;
                    range.setStart(text, 0);
                    range.setEnd(text, 1);
                    const lastTop = range.getBoundingClientRect().top + lineHeight * (maxLines - 1.5);
                    low = 1;
                    let high = name.length - 1;
                    while (low < high) {
                        const middle = (low + high) >> 1;
                        range.setStart(text, middle);
                        range.setEnd(text, middle + 1);
                        if (range.getBoundingClientRect().top > lastTop) high = middle;
                        else low = middle + 1;
                    }
                }

                // The rest on one line: as CoreText truncates in the middle, as
                // much of its start and of its end as fit in half the room each.
                const rest = name.slice(low);
                const half = (width - measure('…')) / 2;
                let head = 0;
                while (head < rest.length - 1 && measure(rest.slice(0, head + 1)) <= half) head++;
                let tail = 0;
                while (tail < rest.length - head - 1 && measure(rest.slice(rest.length - tail - 1)) <= half) tail++;

                span.dataset.name = name;
                span.textContent = name.slice(0, low);
                if (low > 0) span.appendChild(document.createElement('br'));
                span.appendChild(document.createTextNode(`${rest.slice(0, head)}…${rest.slice(rest.length - tail)}`));
            }

            probe.remove();
        });
    }
});
