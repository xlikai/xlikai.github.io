
document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".entry-cover img");

    images.forEach((img) => {
        // Handle images that are already loaded
        if (img.complete) {
            applyAdaptiveBackground(img);
        } else {
            // Handle images that load later
            img.addEventListener("load", () => {
                applyAdaptiveBackground(img);
            });
        }
    });

    function applyAdaptiveBackground(img) {
        // Create a hidden canvas to draw the image
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Set canvas dimensions to the image's natural dimensions
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Security check: If image is cross-origin, we might get a security error
        // try-catch block is essential
        try {
            // Draw the image onto the canvas
            context.drawImage(img, 0, 0, 1, 1);

            // Get the pixel data of the top-left corner (0,0)
            // We assume the background color is uniform and represented by the corner
            const pixelData = context.getImageData(0, 0, 1, 1).data;

            // Convert to RGBA string
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];
            const a = pixelData[3] / 255;

            const backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;

            // Apply the color to the parent container (.entry-cover)
            // Check if parent is indeed entry-cover to be safe
            if (img.parentElement.classList.contains("entry-cover")) {
                img.parentElement.style.backgroundColor = backgroundColor;
                // Also remove the transition specifically for background-color to avoid "flashing" from default to new color
                // or maybe keep it for smooth effect? Let's keep existing CSS transition.
            }

        } catch (e) {
            console.warn("Cannot extract color from image due to CORS or other error:", img.src);
        }
    }
});
