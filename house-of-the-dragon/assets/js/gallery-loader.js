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
                img.draggable = true;
                
                img.addEventListener('load', () => {
                    figure.classList.add('is-visible');
                    
                    if (!firstImageLoaded && footer) {
                        footer.style.opacity = '1';
                        footer.style.pointerEvents = 'auto';
                        firstImageLoaded = true;
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

                // Corrected drag-and-drop listener with fallback for missing filenames
                img.addEventListener('dragstart', (event) => {
                    const highResUrl = event.target.dataset.fullsrc;
                    let filename = event.target.dataset.filename;

                    // **THIS IS THE FIX:** If filename is missing or blank, extract it from the URL.
                    if (!filename || filename.trim() === '') {
                        try {
                            const url = new URL(highResUrl);
                            filename = url.pathname.split('/').pop();
                        } catch (e) {
                            // Fallback in case of a malformed URL
                            filename = 'downloaded-image.jpg';
                        }
                    }

                    if (highResUrl && filename) {
                        event.dataTransfer.setData('text/uri-list', highResUrl);
                        event.dataTransfer.setData('text/plain', highResUrl);

                        let mimeType = 'image/jpeg'; // Default MIME type
                        if (filename.endsWith('.png')) {
                            mimeType = 'image/png';
                        } else if (filename.endsWith('.webp')) {
                            mimeType = 'image/webp';
                        } else if (filename.endsWith('.avif')) {
                            mimeType = 'image/avif';
                        }

                        const downloadData = `${mimeType}:${filename}:${highResUrl}`;
                        event.dataTransfer.setData('DownloadURL', downloadData);
                    }
                });

                const figcaption = document.createElement('figcaption');
                const filenameSpan = document.createElement('span');
                filenameSpan.className = 'filename';
                // Use the same logic for the display filename
                let displayFilename = item.filename;
                if (!displayFilename || displayFilename.trim() === '') {
                    displayFilename = item.src.split('/').pop();
                }
                filenameSpan.textContent = truncateFilename(displayFilename);
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
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            galleryContainer.innerHTML = 'Error loading gallery. Please check the console.';
            
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
