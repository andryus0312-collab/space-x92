export function initFloatingButtons() {
    // Crear contenedor de botones
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'floating-controls';
    controlsContainer.id = 'floatingControls';
    
    const themeBtn = document.createElement('button');
    themeBtn.className = 'floating-btn';
    themeBtn.innerHTML = '☀️';
    themeBtn.title = 'Cambiar a modo oscuro';
    
    const fontSizeBtn = document.createElement('button');
    fontSizeBtn.className = 'floating-btn';
    fontSizeBtn.innerHTML = '🔤';
    fontSizeBtn.title = 'Ajustar tamaño de texto';
    
    controlsContainer.appendChild(themeBtn);
    controlsContainer.appendChild(fontSizeBtn);
    document.body.appendChild(controlsContainer);
    
    // Crear popup del slider
    const sliderPopup = document.createElement('div');
    sliderPopup.className = 'font-size-slider-popup';
    sliderPopup.id = 'fontSizeSliderPopup';
    
    const valueLabel = document.createElement('div');
    valueLabel.className = 'font-size-value';
    valueLabel.textContent = '100%';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'vertical-slider';
    slider.min = '50';
    slider.max = '150';
    slider.value = '100';
    slider.step = '5';
    
    sliderPopup.appendChild(valueLabel);
    sliderPopup.appendChild(slider);
    document.body.appendChild(sliderPopup);
    
    // Estado
    let isDarkMode = false;
    let sliderVisible = false;
    
    // Toggle modo
    themeBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        themeBtn.innerHTML = isDarkMode ? '🌙' : '☀️';
        themeBtn.title = isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    });
    
    // Toggle slider
    fontSizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sliderVisible = !sliderVisible;
        sliderPopup.classList.toggle('visible', sliderVisible);
    });
    
    // Cambio de tamaño
    slider.addEventListener('input', (e) => {
        const percent = e.target.value;
        document.documentElement.style.fontSize = `${percent}%`;
        valueLabel.textContent = `${percent}%`;
    });
    
    // Cerrar slider al clic fuera
    document.addEventListener('click', (e) => {
        if (!sliderPopup.contains(e.target) && e.target !== fontSizeBtn) {
            sliderVisible = false;
            sliderPopup.classList.remove('visible');
        }
    });
    
    // Funciones globales para Vue
    window.showFloatingButtons = function() {
        controlsContainer.classList.add('visible');
    };
    
    window.hideFloatingButtons = function() {
        document.body.classList.add('lightbox-active');
    };
    
    window.restoreFloatingButtons = function() {
        document.body.classList.remove('lightbox-active');
    };
        }
