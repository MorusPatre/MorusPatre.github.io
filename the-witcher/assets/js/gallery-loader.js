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
                const figure = document.createElement('figure');

                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-container';
                
                const img = document.createElement('img');
                img.loading = 'lazy';
                img.src = item.thumbnail;
                img.alt = item.alt;
                img.addEventListener('load', () => {
                    figure.classList.add('is-visible');
                });

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

                const figcaption = document.createElement('figcaption');
                const filenameNode = document.createTextNode(item.filename);
                figcaption.appendChild(filenameNode);

                const dimensionsSpan = document.createElement('span');
                dimensionsSpan.className = 'dimensions';
                dimensionsSpan.textContent = item.dimensions;
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
        });
});
