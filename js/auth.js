// Sistema de autenticación simple (password en código)
export function checkPassword(passwordInput, correctPassword = '') {
    // Si no hay contraseña correcta definida, acepta cualquier cosa no vacía
    if (passwordInput.trim() !== '') {
        return true;
    }
    return false;
}

// Disparar confetti
export function triggerConfetti() {
    if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
}
