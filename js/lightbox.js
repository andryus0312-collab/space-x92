export function openLightbox(url, title, index = null) {
    return {
        active: true,
        url,
        title,
        currentIndex: index,
        zoomLevel: 1,
        rotation: 0,
        fitIndex: 0
    };
}

export function closeLightbox() {
    return {
        active: false,
        url: '',
        title: '',
        currentIndex: null,
        zoomLevel: 1,
        rotation: 0,
        fitIndex: 0
    };
}

export function nextImage(currentIndex, length) {
    return (currentIndex + 1) % length;
}

export function prevImage(currentIndex, length) {
    return (currentIndex - 1 + length) % length;
}
