export function toggleMusicPlay(audioElement, isPlaying) {
    if (!audioElement) return { isPlaying: false };
    
    if (isPlaying) {
        audioElement.pause();
        return { isPlaying: false };
    } else {
        audioElement.play().then(() => {
            return { isPlaying: true };
        }).catch(() => {
            return { isPlaying: false };
        });
    }
}

export function initMusicPlayer(audioElement) {
    if (audioElement) {
        audioElement.volume = 0.5;
    }
}
