// Función para procesar imágenes (compress y convertir a base64)
export function processImage(file, callback, eventTarget = null) {
    if (!file || !file.type.match('image.*')) {
        alert('Por favor selecciona un archivo de imagen válido (JPG o PNG).');
        if (eventTarget) eventTarget.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxSize = 1200;
            if (width > height && width > maxSize) { 
                height *= maxSize / width; 
                width = maxSize; 
            } else if (height > maxSize) { 
                width *= maxSize / height; 
                height = maxSize; 
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            if (eventTarget) eventTarget.value = '';
            callback(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => {
            alert('No se pudo procesar la imagen. Intenta con otra.');
            if (eventTarget) eventTarget.value = '';
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        alert('Error al leer el archivo.');
        if (eventTarget) eventTarget.value = '';
    };
    reader.readAsDataURL(file);
        }
