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
            fitFilenamesToTwoLines(galleryContainer);
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
    // name wraps at the caption's width onto two lines at most. One that runs
    // longer keeps its first line, and the rest, from where the second line
    // starts, is truncated in the middle to fit the second. Names are laid out
    // in a hidden copy of the caption once its font has loaded; only a name
    // wider than one line can need it.
    function fitFilenamesToTwoLines(gallery) {
        const firstName = gallery.querySelector('figure .filename');
        if (!firstName) return;

        const caption = firstName.parentElement;
        const captionStyle = getComputedStyle(caption);
        const nameStyle = getComputedStyle(firstName);
        const font = `${nameStyle.fontStyle} ${nameStyle.fontWeight} ${nameStyle.fontSize} ${nameStyle.fontFamily}`;
        const width = caption.clientWidth - parseFloat(captionStyle.paddingLeft) - parseFloat(captionStyle.paddingRight);
        const lineHeight = parseFloat(nameStyle.lineHeight);

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

            for (const span of gallery.querySelectorAll('figure .filename')) {
                const name = span.textContent;
                if (measure(name) <= width) continue;

                probe.textContent = name;
                if (probe.getBoundingClientRect().height <= lineHeight * 2.5) continue;

                // Where the second line starts: the first character below the first line.
                const text = probe.firstChild;
                range.setStart(text, 0);
                range.setEnd(text, 1);
                const firstTop = range.getBoundingClientRect().top;
                let low = 1;
                let high = name.length - 1;
                while (low < high) {
                    const middle = (low + high) >> 1;
                    range.setStart(text, middle);
                    range.setEnd(text, middle + 1);
                    if (range.getBoundingClientRect().top > firstTop) high = middle;
                    else low = middle + 1;
                }

                // The rest on one line: as CoreText truncates in the middle, as
                // much of its start and of its end as fit in half the room each.
                const rest = name.slice(low);
                const half = (width - measure('…')) / 2;
                let head = 0;
                while (head < rest.length - 1 && measure(rest.slice(0, head + 1)) <= half) head++;
                let tail = 0;
                while (tail < rest.length - head - 1 && measure(rest.slice(rest.length - tail - 1)) <= half) tail++;

                span.textContent = name.slice(0, low);
                span.appendChild(document.createElement('br'));
                span.appendChild(document.createTextNode(`${rest.slice(0, head)}…${rest.slice(rest.length - tail)}`));
            }

            probe.remove();
        });
    }
});
