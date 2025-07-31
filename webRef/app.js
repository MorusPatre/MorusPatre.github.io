// --- 1. SETUP ---
const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight,
    draggable: false,
});

// Use 'let' for the layer, so we can reassign it when loading a new scene
let layer = new Konva.Layer();
stage.add(layer);

// --- 2. TRANSFORMER LOGIC ---
const tr = new Konva.Transformer({
    nodes: [],
    keepRatio: true,
    anchorStroke: 'dodgerblue',
    borderStroke: 'dodgerblue',
});
layer.add(tr);

// Improved click listener to select/deselect shapes
stage.on('click tap', function (e) {
    // If we click on the stage, but not on a shape, deselect all
    if (e.target === stage) {
        tr.nodes([]);
        return;
    }

    // Ignore clicks on anything that's not an image
    if (e.target.className !== 'Image') {
        return;
    }

    // Check for multi-selection keys (Shift/Ctrl/Cmd)
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
        // If no key is pressed and the image isn't selected, select only this one
        tr.nodes([e.target]);
    } else if (metaPressed && isSelected) {
        // If a key is pressed and the image is selected, remove it from selection
        const nodes = tr.nodes().slice(); // get a copy of the nodes
        nodes.splice(nodes.indexOf(e.target), 1); // remove it
        tr.nodes(nodes);
    } else if (metaPressed && !isSelected) {
        // If a key is pressed and the image isn't selected, add it to the selection
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
    }
});


// --- 3. IMAGE & FILE HANDLING ---
const container = stage.container();
container.addEventListener('dragover', (e) => e.preventDefault());

container.addEventListener('drop', (e) => {
    e.preventDefault();
    const pos = stage.getPointerPosition();

    for (const file of e.dataTransfer.files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                Konva.Image.fromURL(event.target.result, (konvaImage) => {
                    konvaImage.setAttrs({
                        x: pos.x,
                        y: pos.y,
                        draggable: true,
                        // --- 💡 KEY CHANGE ---
                        // Disable image smoothing for a pixelated look
                        imageSmoothingEnabled: false,
                    });
                    layer.add(konvaImage);
                });
            };
            reader.readAsDataURL(file);
        }
    }
});

// --- 4. NEW ZOOM & PAN LOGIC ---
const scaleBy = 1.05;
stage.on('wheel', (e) => {
    e.evt.preventDefault();
    const evt = e.evt;

    // Zooming: Check for Command (metaKey) or Ctrl (ctrlKey)
    if (evt.ctrlKey || evt.metaKey) {
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const newScale = evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
    }
    // Panning: If no modifier key is pressed
    else {
        const newPos = {
            x: stage.x() - evt.deltaX,
            y: stage.y() - evt.deltaY,
        };
        stage.position(newPos);
    }
});


// --- 5. SAVE & LOAD LOGIC ---
document.getElementById('save-btn').addEventListener('click', () => {
    tr.nodes([]);
    const json = layer.toJSON();
    const a = document.createElement('a');
    const file = new Blob([json], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'scene.json';
    a.click();
    URL.revokeObjectURL(a.href);
});

// --- 💡 MAJOR UPDATE TO LOAD LOGIC ---
document.getElementById('load-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const json = event.target.result;
        
        // Destroy the old layer and its children
        layer.destroy();
        
        // Create a new layer from the JSON
        const newLayer = Konva.Node.create(json);
        stage.add(newLayer);
        
        // Find all images in the loaded scene and disable smoothing
        newLayer.find('Image').forEach(image => {
            image.imageSmoothingEnabled(false);
        });

        // Add the transformer to the new layer
        newLayer.add(tr);
        tr.nodes([]);
        
        // Re-assign the global 'layer' variable to the new layer
        layer = newLayer;
    };
    reader.readAsText(file);
    e.target.value = '';
});
