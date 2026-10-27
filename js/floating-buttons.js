export function initFloatingButtons(app) {
    // Crear contenedor de botones flotantes
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'floating-controls';
    
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
    let fontSizePercent = 100; // Porcentaje base
    const fontSizeStep = 10; // Incremento/decremento
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
    
    // Observar cambios en el lightbox para ocultar botones
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const lightbox = document.querySelector('[class*="z-\\[300\\]"]');
                if (lightbox && lightbox.style.display !== 'none') {
                    document.body.classList.add('lightbox-active');
                } else {
                    document.body.classList.remove('lightbox-active');
                }
            }
        });
    });
    
    observer.observe(document.body, { attributes: true, subtree: true });
                                 }
