import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getDatabase, ref as dbRef, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let db = null;
let storage = null;
let audioElement = null;
let currentSongIndex = 0;
let playlist = [];
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let currentRating = 0;

export function initMusicPlayer(database, storageInstance, audioEl) {
    db = database;
    storage = storageInstance;
    audioElement = audioEl;
    
    // Cargar playlist desde Firebase
    loadPlaylist();
    
    // Event listeners del audio
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleSongEnd);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    
    // Configurar controles
    setupControls();
}

function loadPlaylist() {
    onValue(dbRef(db, 'songs'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            playlist = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            renderPlaylist();
        } else {
            playlist = [];
            renderPlaylist();
        }
    });
}

function renderPlaylist() {
    const playlistContainer = document.getElementById('playlistContainer');
    if (!playlistContainer) return;
    
    playlistContainer.innerHTML = '';
    
    playlist.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = `playlist-item ${index === currentSongIndex ? 'active' : ''}`;
        item.innerHTML = `
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-duration">${formatTime(song.duration || 0)}</div>
            </div>
            <button class="playlist-item-delete" data-id="${song.id}" title="Eliminar canción">🗑️</button>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('playlist-item-delete')) {
                playSong(index);
            }
        });
        
        playlistContainer.appendChild(item);
    });
    
    // Event listeners para botones de eliminar
    document.querySelectorAll('.playlist-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = btn.dataset.id;
            deleteSong(songId);
        });
    });
}

function setupControls() {
    // Play/Pause
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    
    // Anterior
    document.getElementById('prevBtn').addEventListener('click', playPrevious);
    
    // Siguiente
    document.getElementById('nextBtn').addEventListener('click', playNext);
    
    // Aleatorio
    document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
    
    // Repetir
    document.getElementById('repeatBtn').addEventListener('click', toggleRepeat);
    
    // Barra de progreso
    document.getElementById('progressBar').addEventListener('click', seekToPosition);
    
    // Subir canción
    document.getElementById('uploadSongInput').addEventListener('change', handleSongUpload);
    
    // Calificación
    setupRating();
}

function togglePlayPause() {
    if (playlist.length === 0) return;
    
    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
        document.getElementById('playPauseBtn').innerHTML = '▶️';
        document.getElementById('equalizer').classList.remove('playing');
        document.getElementById('musicStatus').textContent = 'Pausado';
    } else {
        if (!audioElement.src) {
            playSong(currentSongIndex);
        } else {
            audioElement.play();
            isPlaying = true;
            document.getElementById('playPauseBtn').innerHTML = '⏸️';
            document.getElementById('equalizer').classList.add('playing');
            document.getElementById('musicStatus').textContent = 'Reproduciendo 🎧';
        }
    }
}

function playSong(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentSongIndex = index;
    const song = playlist[index];
    
    audioElement.src = song.url;
    audioElement.play();
    isPlaying = true;
    
    document.getElementById('playPauseBtn').innerHTML = '⏸️';
    document.getElementById('equalizer').classList.add('playing');
    document.getElementById('musicStatus').textContent = 'Reproduciendo 🎧';
    document.getElementById('songTitle').textContent = song.title;
    document.getElementById('songArtist').textContent = 'Canción personalizada';
    
    // Actualizar calificación
    currentRating = song.rating || 0;
    updateRatingDisplay();
    
    renderPlaylist();
}

function playPrevious() {
    if (playlist.length === 0) return;
    
    let newIndex;
    if (isShuffle) {
        newIndex = Math.floor(Math.random() * playlist.length);
    } else {
        newIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    }
    
    playSong(newIndex);
}

function playNext() {
    if (playlist.length === 0) return;
    
    let newIndex;
    if (isShuffle) {
        newIndex = Math.floor(Math.random() * playlist.length);
    } else {
        newIndex = (currentSongIndex + 1) % playlist.length;
    }
    
    playSong(newIndex);
}

function handleSongEnd() {
    if (isRepeat) {
        audioElement.currentTime = 0;
        audioElement.play();
    } else {
        playNext();
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    document.getElementById('shuffleBtn').classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    document.getElementById('repeatBtn').classList.toggle('active', isRepeat);
}

function updateProgress() {
    if (audioElement.duration) {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('currentTime').textContent = formatTime(audioElement.currentTime);
    }
}

function updateDuration() {
    document.getElementById('totalTime').textContent = formatTime(audioElement.duration);
    
    // Guardar duración en Firebase
    if (playlist[currentSongIndex]) {
        update(dbRef(db, `songs/${playlist[currentSongIndex].id}`), {
            duration: audioElement.duration
        });
    }
}

function seekToPosition(e) {
    const progressBar = document.getElementById('progressBar');
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    
    if (audioElement.duration) {
        audioElement.currentTime = percentage * audioElement.duration;
    }
}

function handleSongUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('audio/')) {
        alert('❌ Solo se permiten archivos de audio (MP3, WAV, OGG, etc.)');
        e.target.value = '';
        return;
    }
    
    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
        alert('❌ La canción es muy pesada. Máximo 10MB permitido.');
        e.target.value = '';
        return;
    }
    
    // Validar cantidad de canciones (máximo 10)
    if (playlist.length >= 10) {
        alert('❌ Ya tienes el máximo de 10 canciones. Elimina alguna para subir otra.');
        e.target.value = '';
        return;
    }
    
    // Subir a Firebase Storage
    const fileName = `songs/${Date.now()}_${file.name}`;
    const songRef = storageRef(storage, fileName);
    
    uploadBytes(songRef, file).then((snapshot) => {
        return getDownloadURL(snapshot.ref);
    }).then((url) => {
        // Guardar metadata en Realtime Database
        const newSong = {
            title: file.name.replace(/\.[^/.]+$/, ''), // Quitar extensión
            url: url,
            storagePath: fileName,
            duration: 0,
            rating: 0,
            uploadDate: new Date().toISOString()
        };
        
        return push(dbRef(db, 'songs'), newSong);
    }).then(() => {
        alert('✅ Canción subida exitosamente');
        e.target.value = '';
    }).catch((error) => {
        console.error('Error al subir canción:', error);
        alert('❌ Error al subir la canción. Intenta de nuevo.');
        e.target.value = '';
    });
}

function deleteSong(songId) {
    if (!confirm('¿Estás seguro de eliminar esta canción?')) return;
    
    const song = playlist.find(s => s.id === songId);
    if (!song) return;
    
    // Eliminar de Firebase Storage
    const songStorageRef = storageRef(storage, song.storagePath);
    deleteObject(songStorageRef).then(() => {
        // Eliminar de Realtime Database
        return remove(dbRef(db, `songs/${songId}`));
    }).then(() => {
        alert('✅ Canción eliminada exitosamente');
        
        // Si estaba reproduciendo esta canción, detener
        if (playlist[currentSongIndex]?.id === songId) {
            audioElement.pause();
            audioElement.src = '';
            isPlaying = false;
            document.getElementById('playPauseBtn').innerHTML = '▶️';
            document.getElementById('equalizer').classList.remove('playing');
            document.getElementById('musicStatus').textContent = 'Detenido';
            document.getElementById('songTitle').textContent = 'Sin canción';
            document.getElementById('songArtist').textContent = 'Sube una canción';
        }
    }).catch((error) => {
        console.error('Error al eliminar canción:', error);
        alert('❌ Error al eliminar la canción');
    });
}

function setupRating() {
    const heartButtons = document.querySelectorAll('.heart-btn');
    heartButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            currentRating = index + 1;
            updateRatingDisplay();
            
            // Guardar calificación en Firebase
            if (playlist[currentSongIndex]) {
                update(dbRef(db, `songs/${playlist[currentSongIndex].id}`), {
                    rating: currentRating
                });
            }
        });
    });
}

function updateRatingDisplay() {
    const heartButtons = document.querySelectorAll('.heart-btn');
    heartButtons.forEach((btn, index) => {
        btn.classList.toggle('filled', index < currentRating);
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
