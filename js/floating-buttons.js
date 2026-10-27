export function initFloatingButtons() {
    // Crear contenedor de botones flotantes
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'floating-controls hidden-before-login';
    controlsContainer.id = 'floatingControls';
    
    // Botón de modo oscuro/claro
    const themeBtn = document.createElement('button');
    themeBtn.className = 'floating-btn';
    themeBtn.innerHTML = '🌙';
    themeBtn.title = 'Cambiar modo (Oscuro/Claro)';
    
    // Botón de tamaño de texto
    const fontSizeBtn = document.createElement('button');
    fontSizeBtn.className = 'floating-btn';
    fontSizeBtn.innerHTML = '🔤';
    fontSizeBtn.title = 'Ajustar tamaño de texto';
    
    controlsContainer.appendChild(themeBtn);
    controlsContainer.appendChild(fontSizeBtn);
    document.body.appendChild(controlsContainer);
    
    // Estado inicial
    let isLightMode = false;
    let fontSizePercent = 100;
    const fontSizeStep = 10;
    const minFontSize = 50;
    const maxFontSize = 150;
    
    // Toggle modo oscuro/claro
    themeBtn.addEventListener('click', () => {
        isLightMode = !isLightMode;
        document.body.classList.toggle('light-mode', isLightMode);
        themeBtn.innerHTML = isLightMode ? '☀️' : '🌙';
        themeBtn.title = isLightMode ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
    });
    
    // Ajustar tamaño de texto
    fontSizeBtn.addEventListener('click', () => {
        fontSizePercent += fontSizeStep;
        if (fontSizePercent > maxFontSize) {
            fontSizePercent = minFontSize;
        }
        
        document.documentElement.style.fontSize = `${fontSizePercent}%`;
        fontSizeBtn.innerHTML = `${fontSizePercent}%`;
        fontSizeBtn.title = `Tamaño de texto: ${fontSizePercent}% (clic para cambiar)`;
    });
    
    // Función para mostrar botones (llamar después del login)
    window.showFloatingButtons = function() {
        controlsContainer.classList.remove('hidden-before-login');
    };
    
    // Función para ocultar botones (llamar al abrir lightbox)
    window.hideFloatingButtons = function() {
        controlsContainer.style.display = 'none';
    };
    
    // Función para mostrar botones (llamar al cerrar lightbox)
    window.showFloatingButtonsAfterLightbox = function() {
        controlsContainer.style.display = 'flex';
    };
    
    // Observar cambios en el lightbox para ocultar botones
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const lightbox = document.querySelector('[class*="z-\\[300\\]"]');
                if (lightbox && lightbox.style.display !== 'none') {
                    controlsContainer.style.display = 'none';
                } else {
                    controlsContainer.style.display = 'flex';
                }
            }
        });
    });
    
    observer.observe(document.body, { attributes: true, subtree: true });
}
