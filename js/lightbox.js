document.addEventListener('DOMContentLoaded', () => {
    const galleryBtn = document.getElementById('open-gallery-btn');
    if (!galleryBtn || !window.galleryImages || window.galleryImages.length === 0) {
        console.warn('Gallery button or gallery images array not found.');
        return;
    }

    let currentIndex = 0;
    const images = window.galleryImages;

    // Create lightbox HTML dynamically if it doesn't exist yet
    let lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'gallery-lightbox';
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <button class="lightbox-close" id="close-lightbox-btn" aria-label="Zavřít"><i class="fas fa-times"></i></button>
            <button class="lightbox-prev" id="prev-lightbox-btn" aria-label="Předchozí"><i class="fas fa-chevron-left"></i></button>
            <div class="lightbox-content">
                <img id="lightbox-img" src="" alt="Galerie" draggable="false">
                <div class="lightbox-caption" id="lightbox-caption"></div>
                <div class="lightbox-counter" id="lightbox-counter"></div>
            </div>
            <button class="lightbox-next" id="next-lightbox-btn" aria-label="Další"><i class="fas fa-chevron-right"></i></button>
        `;
        document.body.appendChild(lightbox);
    }

    const imgElement = lightbox.querySelector('#lightbox-img');
    const captionElement = lightbox.querySelector('#lightbox-caption');
    const counterElement = lightbox.querySelector('#lightbox-counter');
    const closeBtn = lightbox.querySelector('#close-lightbox-btn');
    const prevBtn = lightbox.querySelector('#prev-lightbox-btn');
    const nextBtn = lightbox.querySelector('#next-lightbox-btn');

    // Preload helper to avoid flash of empty image
    const preloadImage = (src) => {
        if (src) {
            const img = new Image();
            img.src = src;
        }
    };

    function updateLightbox() {
        const item = images[currentIndex];
        
        // Update elements
        imgElement.src = item.src;
        imgElement.alt = item.caption || '';
        captionElement.textContent = item.caption || '';
        counterElement.textContent = `${currentIndex + 1} / ${images.length}`;
        
        // Hide prev/next buttons if only 1 image
        if (images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }

        // Preload next and previous images
        if (images.length > 1) {
            const nextIdx = (currentIndex + 1) % images.length;
            const prevIdx = (currentIndex - 1 + images.length) % images.length;
            preloadImage(images[nextIdx].src);
            preloadImage(images[prevIdx].src);
        }
    }

    function openLightbox() {
        currentIndex = 0;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.classList.add('modal-open');
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.classList.remove('modal-open');
        // Clear src on close to stop downloading/free up memory
        imgElement.src = '';
    }

    function showNext() {
        if (images.length <= 1) return;
        currentIndex = (currentIndex + 1) % images.length;
        updateLightbox();
    }

    function showPrev() {
        if (images.length <= 1) return;
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightbox();
    }

    // Event Listeners
    galleryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox();
    });

    closeBtn.addEventListener('click', closeLightbox);
    
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });

    // Close on click outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight' || e.key === 'Right') {
            showNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            showPrev();
        }
    });

    // Touch events for mobile swiping
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
    }, { passive: true });

    function handleGesture() {
        const swipeThreshold = 50; // minimum distance in px
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe Left -> show next
            showNext();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe Right -> show prev
            showPrev();
        }
    }
});
