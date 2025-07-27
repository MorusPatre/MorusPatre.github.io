document.addEventListener('DOMContentLoaded', function() {
    const jsonPath = 'gallery-data.json';
    const galleryContainerId = 'photo-gallery';
    const galleryContainer = document.getElementById(galleryContainerId);

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
            galleryData.forEach(item => {
                // 1. Create the <figure> element for each grid item
                const figure = document.createElement('figure');

                // 2. Create the container for the image
                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-container';
                
                // 3. Create the <img> element for the thumbnail
                const img = document.createElement('img');
                img.loading = 'lazy';
                img.src = item.thumbnail;
                img.alt = item.alt;
                img.addEventListener('load', () => {
                    figure.classList.add('is-visible');
                });

                // 4. Add all the data attributes needed for the modal and search
                img.dataset.fullsrc = item.src;
                img.dataset.filename = item.filename;
                img.dataset.search = item.search;
                
                // --- MODIFICATION START ---
                // Conditionally set data attributes only if they exist in the JSON item.
                // This prevents JavaScript's `undefined` value from becoming the string "undefined".
                if (item.actors) { img.dataset.actors = item.actors; }
                if (item.characters) { img.dataset.characters = item.characters; }
                if (item.size) { img.dataset.size = item.size; }
                if (item.dimensions) { img.dataset.dimensions = item.dimensions; }
                if (item.season) { img.dataset.season = item.season; }
                if (item.episode) { img.dataset.episode = item.episode; }
                // --- MODIFICATION END ---
                
                for (const key in item) {
                    if (!img.dataset[key] && key !== 'src' && key !== 'thumbnail' && key !== 'alt') {
                        img.dataset[key] = item[key];
                    }
                }

                // 5. Create the <figcaption> for the filename and dimensions
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

                // 6. Assemble the pieces
                imageContainer.appendChild(img); // Image goes into its container
                figure.appendChild(imageContainer); // Image container goes into the figure
                figure.appendChild(figcaption); // Caption goes into the figure

                // 7. Add the completed figure to the gallery
                galleryContainer.appendChild(figure);
            });
            
            // Send a custom event to let the other scripts know the gallery is ready
            document.dispatchEvent(new CustomEvent('galleryLoaded'));
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            galleryContainer.innerHTML = 'Error loading gallery. Please check the console.';
        });

    function truncateFilename(filename, maxLength = 48) {
        if (!filename || filename.length <= maxLength) {
            return filename;
        }

        const extension = filename.slice(filename.lastIndexOf('.'));
        const name = filename.slice(0, filename.lastIndexOf('.'));
        const remainingLength = maxLength - extension.length - 3; // 3 for '...'

        if (remainingLength <= 0) {
            return '...' + extension;
        }

        const startLength = Math.ceil(remainingLength / 2);
        const endLength = Math.floor(remainingLength / 2);

        return `${name.slice(0, startLength)}...${name.slice(name.length - endLength)}${extension}`;
    }
});
