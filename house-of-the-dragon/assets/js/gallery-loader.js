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
                // **FIX #1: Add the crossorigin attribute to grant permission**
                img.crossOrigin = "anonymous";
                
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

                // **FIX #2: The robust drag-and-drop listener**
                img.addEventListener('dragstart', (event) => {
                    const highResUrl = event.target.dataset.fullsrc;
                    let filename = event.target.dataset.filename;

                    if (!filename || filename.trim() === '') {
                        filename = highResUrl.split('/').pop();
                    }
                
                    // Set the standard link format for compatibility
                    event.dataTransfer.setData('text/uri-list', highResUrl);
                    event.dataTransfer.setData('text/plain', highResUrl);

                    // Create an invisible helper image for the browser to "drag"
                    // This triggers the native download behavior with the high-res source
                    const dragImg = document.createElement('img');
                    dragImg.src = highResUrl;
                    dragImg.crossOrigin = "anonymous";
                    
                    // Style it to be off-screen
                    dragImg.style.position = 'absolute';
                    dragImg.style.top = '-1000px';
                    document.body.appendChild(dragImg);
                
                    // Use the invisible high-res image as the drag ghost
                    event.dataTransfer.setDragImage(dragImg, 0, 0);

                    // Clean up the helper image after the drag has started
                    setTimeout(() => {
                        document.body.removeChild(dragImg);
                    }, 0);
                });


                const figcaption = document.createElement('figcaption');
                const filenameSpan = document.createElement('span');
                filenameSpan.className = 'filename';

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
