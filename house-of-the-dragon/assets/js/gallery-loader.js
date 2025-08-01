document.addEventListener('DOMContentLoaded', function() {
    const jsonPath = 'gallery-data.json';
    const galleryContainerId = 'photo-gallery';
    const galleryContainer = document.getElementById(galleryContainerId);
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
                filenameSpan.textContent = truncateFilename(item.filename);
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
            
            // ---- Enable drag-drop of full-res image ----
            img.draggable = true;
            img.addEventListener('dragstart', e => {
                // Fetch the hi-res URL
                const hiResURL = img.dataset.fullsrc;
                // Chrome / Firefox / Edge
                e.dataTransfer.setData('text/uri-list', hiResURL);
                e.dataTransfer.setData('text/plain',  hiResURL);
                // Optional: show the hi-res as the drag image
                const dragImg = new Image();
                dragImg.src = hiResURL;
                e.dataTransfer.setDragImage(dragImg, 20, 20);
            });
            
            document.dispatchEvent(new CustomEvent('galleryLoaded'));
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

    function truncateFilename(filename, maxLength = 48) {
        if (!filename || filename.length <= maxLength) {
            return filename;
        }
        const extension = filename.slice(filename.lastIndexOf('.'));
        const name = filename.slice(0, filename.lastIndexOf('.'));
        const remainingLength = maxLength - extension.length - 3;
        if (remainingLength <= 0) {
            return '...' + extension;
        }
        const startLength = Math.ceil(remainingLength / 2);
        const endLength = Math.floor(remainingLength / 2);
        return `${name.slice(0, startLength)}...${name.slice(name.length - endLength)}${extension}`;
    }
});
