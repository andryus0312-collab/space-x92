// Reloj analógico y contador de tiempo
export function startClock(updateCallback) {
    const update = () => {
        const now = new Date();
        const sec = now.getSeconds();
        const min = now.getMinutes();
        const hr = now.getHours();
        
        updateCallback({
            seconds: sec * 6,
            minutes: min * 6 + sec * 0.1,
            hours: (hr % 12) * 30 + min * 0.5
        });
    };
    update();
    setInterval(update, 1000);
}

export function updateTimeElapsed(startDate, updateCallback) {
    setInterval(() => {
        const diff = new Date() - startDate;
        updateCallback({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
        });
    }, 1000);
                }
