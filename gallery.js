(function () {
    const mainImg = document.getElementById('gallery-main-img');
    const thumbs = document.querySelectorAll('.gallery-thumb');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    const images = Array.from(thumbs).map(t => t.dataset.src);
    let currentIndex = 0;

    function setActive(index) {
        currentIndex = index;
        mainImg.src = images[index];
        thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    }

    function openLightbox() {
        lightboxImg.src = images[currentIndex];
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.hidden = true;
        document.body.style.overflow = '';
    }

    function navigate(dir) {
        const next = (currentIndex + dir + images.length) % images.length;
        setActive(next);
        lightboxImg.src = images[next];
    }

    thumbs.forEach((thumb, i) => {
        thumb.addEventListener('click', () => setActive(i));
    });

    document.getElementById('gallery-main').addEventListener('click', openLightbox);
    document.getElementById('gallery-main').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
    });

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
    document.getElementById('lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
    });
})();
