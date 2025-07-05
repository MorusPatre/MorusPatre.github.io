document.addEventListener('DOMContentLoaded', function() {
    const jsonPath = '/the-witcher/gallery-data.json';
    const galleryContainerId = 'photo-gallery'; // Corrected from 'wrapper'
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

                // event listener to fade the image in on load
                img.addEventListener('load', () => {
                    img.classList.add('is-visible');
                });

                // 4. Add all the data attributes needed for the modal and search
                img.dataset.fullsrc = item.src;
                img.dataset.filename = item.filename;
                img.dataset.search = item.search;
                img.dataset.actors = item.actors;
                img.dataset.characters = item.characters;
                img.dataset.dimensions = item.dimensions;
                img.dataset.season = item.season;
                if (item.episode) { img.dataset.episode = item.episode; }
                for (const key in item) {
                    if (!img.dataset[key] && key !== 'src' && key !== 'thumbnail' && key !== 'alt') {
                        img.dataset[key] = item[key];
                    }
                }

                // 5. Create the <figcaption> for the filename and dimensions
                const figcaption = document.createElement('figcaption');
                const filenameNode = document.createTextNode(item.filename);
                figcaption.appendChild(filenameNode);

                const dimensionsSpan = document.createElement('span');
                dimensionsSpan.className = 'dimensions';
                dimensionsSpan.textContent = item.dimensions;
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
});
