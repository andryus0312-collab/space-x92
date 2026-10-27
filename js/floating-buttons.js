export function initFloatingButtons() {
    // Crear contenedor de botones flotantes
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'floating-controls hidden-before-login';
    controlsContainer.id = 'floatingControls';
    
    // Botón de modo oscuro/claro (inicia como sol porque el modo claro es por defecto)
    const themeBtn = document.createElement('button');
    themeBtn.className = 'floating-btn';
    themeBtn.innerHTML = '☀️';
    themeBtn.title = 'Cambiar a modo oscuro';
    
    // Botón de tamaño de texto
    const fontSizeBtn = document.createElement('button');
    fontSizeBtn.className = 'floating-btn';
    fontSizeBtn.innerHTML = '';
    fontSizeBtn.title = 'Ajustar tamaño de texto';
    
    controlsContainer.appendChild(themeBtn);
    controlsContainer.appendChild(fontSizeBtn);
    document.body.appendChild(controlsContainer);
    
    // ============================================
    // POPUP DEL SLIDER DE TAMAÑO DE TEXTO
    // ============================================
    const sliderPopup = document.createElement('div');
    sliderPopup.className = 'font-size-slider-popup hidden-before-login hidden';
    sliderPopup.id = 'fontSizeSliderPopup';
    
    const valueLabel = document.createElement('div');
    valueLabel.className = 'font-size-value';
    valueLabel.textContent = '100%';
    
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'vertical-slider-container';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'vertical-slider';
    slider.min = '50';
    slider.max = '150';
    slider.value = '100';
    slider.step = '5';
    
    sliderContainer.appendChild(slider);
    sliderPopup.appendChild(valueLabel);
    sliderPopup.appendChild(sliderContainer);
    document.body.appendChild(sliderPopup);
    
    // ============================================
    // ESTADO
    // ============================================
    let isDarkMode = false; // Por defecto modo claro
    let sliderVisible = false;
    
    // ============================================
    // TOGGLE MODO CLARO/OSCURO
    // ============================================
    themeBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        if (isDarkMode) {
            themeBtn.innerHTML = '🌙';
            themeBtn.title = 'Cambiar a modo claro';
        } else {
            themeBtn.innerHTML = '☀️';
            themeBtn.title = 'Cambiar a modo oscuro';
        }
    });
    
    // ============================================
    // SLIDER DE TAMAÑO DE TEXTO
    // ============================================
    fontSizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sliderVisible = !sliderVisible;
        sliderPopup.classList.toggle('hidden', !sliderVisible);
    });
    
    slider.addEventListener('input', (e) => {
        const percent = e.target.value;
        document.documentElement.style.fontSize = `${percent}%`;
        valueLabel.textContent = `${percent}%`;
    });
    
    // Cerrar slider al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!sliderPopup.contains(e.target) && e.target !== fontSizeBtn) {
            sliderVisible = false;
            sliderPopup.classList.add('hidden');
        }
    });
    
    // ============================================
    // FUNCIONES GLOBALES
    // ============================================
    
    // Mostrar botones (llamar después del login)
    window.showFloatingButtons = function() {
        controlsContainer.classList.remove('hidden-before-login');
        sliderPopup.classList.remove('hidden-before-login');
    };
    
    // Ocultar/mostrar botones en lightbox
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const lightbox = document.querySelector('[class*="z-\\[300\\]"]');
                if (lightbox && !lightbox.classList.contains('hidden')) {
                    document.body.classList.add('lightbox-active');
                } else {
                    document.body.classList.remove('lightbox-active');
                }
            }
        });
    });
    
    observer.observe(document.body, { attributes: true, subtree: true });
}
