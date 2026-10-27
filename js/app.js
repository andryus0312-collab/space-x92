import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { initMusicPlayer } from './music-player.js';
import { firebaseConfig } from './config.js';
import { initDatabase, setupDatabaseListeners } from './database.js';
import { startClock, updateTimeElapsed } from './clock.js';
import { checkPassword, triggerConfetti } from './auth.js';
import { createPost, deletePost, toggleLike } from './posts.js';
import { uploadGalleryImage, deleteGalleryImage } from './gallery.js';
import { uploadCoverImage, removeCoverImage } from './covers.js';
import { updateProfileImage } from './profiles.js';
import { toggleMusicPlay, initMusicPlayer } from './music.js';
import { getCalendarData, isToday } from './calendar.js';
import { openLightbox, closeLightbox, nextImage, prevImage } from './lightbox.js';
import { processImage } from './utils.js';

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = initDatabase(firebaseApp);

// Crear aplicación Vue
createApp({
    data() {
        return {
            isUnlocked: false,
            passwordInput: '',
            isMusicPlaying: false,
            
            coverImages: [],
            currentCoverIndex: 0,

            profiles: {
                her: { name: 'Piggy 🐷', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
                him: { name: 'Bear ', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' }
            },
            selectedAuthor: 'her',

            newPostText: '',
            postImagePreview: null,
            postVideoPreview: null,
            posts: [],

            showEmojiPicker: false,
            activeEmojiCategory: 'love',
            emojiCategories: {
                love: { icon: '❤️', list: ['❤️', '💖', '💕', '💗', '💓', '💞', '🌹', '👩‍❤️‍', '👩‍❤️💋‍👨', '💋', '💌', '🧸'] },
                happy: { icon: '😊', list: ['😊', '😀', '😃', '😄', '😁', '', '😍', '🤩', '😋', '😜', '😇', '🤗'] },
                gestures: { icon: '👋', list: ['👍', '🙌', '', '🤝', '🙏', '✌️', '🤟', '', '🖐️', '', '🤜', ''] }
            },

            gallery: [],

            clock: { hours: 0, minutes: 0, seconds: 0 },
            timeElapsed: { days: 0, hours: 0, minutes: 0, seconds: 0 },
            startDate: new Date('2022-07-01T00:00:00'),

            showCalendar: false,
            calDate: new Date(),

            activeLightbox: false,
            activeLightboxUrl: '',
            activeLightboxTitle: '',
            currentGalleryIndex: null,
            zoomLevel: 1,
            rotation: 0,
            fitModes: ['cover', 'contain', 'fill'],
            currentFitIndex: 0,
            isSlideshowActive: false,
            slideshowTimer: null
        }
    },

    computed: {
        currentFitMode() { return this.fitModes[this.currentFitIndex]; },
        calMonthName() { return this.calDate.toLocaleDateString('es-ES', { month: 'long' }); },
        calYear() { return this.calDate.getFullYear(); },
        calendarDays() {
            return getCalendarData(this.calDate.getFullYear(), this.calDate.getMonth());
        }
    },

    mounted() {
        // Iniciar reloj
        startClock((clockData) => {
            this.clock = clockData;
        });

        // Iniciar contador
        updateTimeElapsed(this.startDate, (timeData) => {
            this.timeElapsed = timeData;
        });

        // Setup listeners de Firebase
        setupDatabaseListeners({
            onPostsChange: (posts) => { this.posts = posts; },
            onGalleryChange: (gallery) => { this.gallery = gallery; },
            onCoversChange: (covers) => { 
                this.coverImages = covers;
                if (this.currentCoverIndex >= this.coverImages.length) {
                    this.currentCoverIndex = Math.max(0, this.coverImages.length - 1);
                }
            },
            onProfilesChange: (profiles) => { this.profiles = profiles; }
        });

        // Inicializar reproductor de música
        this.$nextTick(() => {
            const audio = this.$refs.bgMusic;
            if (audio) initMusicPlayer(audio);
        });
    },

    methods: {
        checkPassword() {
    if (checkPassword(this.passwordInput)) {
        this.isUnlocked = true;
        triggerConfetti();
        
        // Mostrar botones flotantes después del login
        if (window.showFloatingButtons) {
            window.showFloatingButtons();
        }
        
        this.$nextTick(() => {
            const audio = this.$refs.bgMusic;
            if (audio) {
                audio.volume = 0.5;
                audio.play().then(() => {
                    this.isMusicPlaying = true;
                }).catch(err => {
                    this.isMusicPlaying = false;
                });
            }
        });
    }
},

        toggleMusicPlay() {
            const audio = this.$refs.bgMusic;
            const result = toggleMusicPlay(audio, this.isMusicPlaying);
            if (result.isPlaying !== undefined) {
                this.isMusicPlaying = result.isPlaying;
            }
        },

        prevMonth() { 
            this.calDate = new Date(this.calDate.getFullYear(), this.calDate.getMonth() - 1, 1); 
        },
        
        nextMonth() { 
            this.calDate = new Date(this.calDate.getFullYear(), this.calDate.getMonth() + 1, 1); 
        },
        
        isToday(day) {
            return isToday(day, this.calDate.getMonth(), this.calDate.getFullYear());
        },

        prevCover() { 
            if (this.coverImages.length > 0) {
                this.currentCoverIndex = prevImage(this.currentCoverIndex, this.coverImages.length);
            }
        },
        
        nextCover() { 
            if (this.coverImages.length > 0) {
                this.currentCoverIndex = nextImage(this.currentCoverIndex, this.coverImages.length);
            }
        },
        
        uploadCoverImage(e) {
            const file = e.target.files[0];
            if (file) {
                uploadCoverImage(file, () => {
                    this.currentCoverIndex = this.coverImages.length;
                });
            }
        },
        
        removeCurrentCover() {
            if (this.coverImages.length > 1) {
                const target = this.coverImages[this.currentCoverIndex];
                if (target && target.firebaseId) {
                    removeCoverImage(target.firebaseId).then(() => {
                        this.currentCoverIndex = 0;
                    });
                }
            }
        },

        uploadSpecificProfile(e, key) {
            const file = e.target.files[0];
            if (file) {
                updateProfileImage(this.profiles, key, file);
            }
        },

        toggleEmojiPicker() { 
            this.showEmojiPicker = !this.showEmojiPicker; 
        },
        
        insertEmoji(e) { 
            this.newPostText += e; 
        },
        
        handlePostImage(e) {
            const file = e.target.files[0];
            if (file) {
                processImage(file, (base64Url) => {
                    this.postImagePreview = base64Url;
                    this.postVideoPreview = null;
                }, e.target);
            }
        },
        
        removePostImage() { 
            this.postImagePreview = null; 
        },

        handlePostVideo(e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.match('video.*')) {
                alert('Por favor selecciona un archivo de video válido.');
                e.target.value = '';
                return;
            }
            if (file.size > 8 * 1024 * 1024) {
                alert('El video es muy pesado (máximo 8 MB recomendado para Firebase). Intenta con uno más corto.');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.postVideoPreview = ev.target.result;
                this.postImagePreview = null;
                e.target.value = '';
            };
            reader.onerror = () => {
                alert('Error al leer el archivo de video.');
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        },
        
        removePostVideo() { 
            this.postVideoPreview = null; 
        },
        
        createPost() {
            if (!this.newPostText.trim() && !this.postImagePreview && !this.postVideoPreview) return;
            
            const date = new Date().toLocaleDateString('es-ES') + ' ' + 
                        new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            
            createPost(this.selectedAuthor, this.newPostText, this.postImagePreview, this.postVideoPreview, date);

            this.newPostText = '';
            this.postImagePreview = null;
            this.postVideoPreview = null;
            this.showEmojiPicker = false;
        },

        deletePost(index) {
            const post = this.posts[index];
            if (post && post.firebaseId) {
                deletePost(post.firebaseId);
            }
        },

        toggleLike(post) {
            toggleLike(post);
        },

        uploadGalleryImage(e) {
            const file = e.target.files[0];
            if (file) {
                uploadGalleryImage(file);
            }
        },

        deleteGalleryImage(idx) {
            const item = this.gallery[idx];
            if (item && item.firebaseId) {
                deleteGalleryImage(item.firebaseId);
            }
        },

        deleteCurrentGalleryImgFromLightbox() {
            if (this.currentGalleryIndex !== null && this.gallery.length > 0) {
                const idx = this.currentGalleryIndex;
                const item = this.gallery[idx];
                if (item && item.firebaseId) {
                    deleteGalleryImage(item.firebaseId).then(() => {
                        this.stopSlideshow();
                        if (this.gallery.length <= 1) {
                            this.closeLightbox();
                        } else {
                            let nextIdx = idx >= this.gallery.length - 1 ? this.gallery.length - 2 : idx;
                            this.openGalleryLightbox(nextIdx);
                        }
                    });
                }
            }
        },

        openMediaViewer(url, title = 'Visor de Imagen') {
            this.stopSlideshow();
            const lb = openLightbox(url, title);
            this.activeLightbox = lb.active;
            this.activeLightboxUrl = lb.url;
            this.activeLightboxTitle = lb.title;
            this.currentGalleryIndex = lb.currentIndex;
            this.resetTransforms();
        },

        openGalleryLightbox(idx) {
            this.stopSlideshow();
            if (this.gallery.length === 0) {
                this.closeLightbox();
                return;
            }
            this.currentGalleryIndex = Math.min(idx, this.gallery.length - 1);
            const lb = openLightbox(
                this.gallery[this.currentGalleryIndex].url,
                `Recuerdo ${this.currentGalleryIndex + 1} de ${this.gallery.length}`,
                this.currentGalleryIndex
            );
            this.activeLightbox = lb.active;
            this.activeLightboxUrl = lb.url;
            this.activeLightboxTitle = lb.title;
            this.resetTransforms();
        },
        
        closeLightbox() { 
            this.stopSlideshow();
            const lb = closeLightbox();
            this.activeLightbox = lb.active;
            this.activeLightboxUrl = lb.url;
            this.activeLightboxTitle = lb.title;
            this.currentGalleryIndex = lb.currentIndex;
        },
        
        prevGalleryImg() {
            if (this.currentGalleryIndex !== null && this.gallery.length > 0) {
                this.currentGalleryIndex = prevImage(this.currentGalleryIndex, this.gallery.length);
                this.openGalleryLightbox(this.currentGalleryIndex);
            }
        },
        
        nextGalleryImg() {
            if (this.currentGalleryIndex !== null && this.gallery.length > 0) {
                this.currentGalleryIndex = nextImage(this.currentGalleryIndex, this.gallery.length);
                this.openGalleryLightbox(this.currentGalleryIndex);
            }
        },
        
        toggleSlideshow() {
            if (this.isSlideshowActive) {
                this.stopSlideshow();
            } else {
                this.startSlideshow();
            }
        },
        
        startSlideshow() {
            if (this.gallery.length <= 1) return;
            this.isSlideshowActive = true;
            this.slideshowTimer = setInterval(() => {
                this.nextGalleryImg();
            }, 5000);
        },
        
        stopSlideshow() {
            if (this.slideshowTimer) {
                clearInterval(this.slideshowTimer);
                this.slideshowTimer = null;
            }
            this.isSlideshowActive = false;
        },
        
        zoomIn() { 
            this.zoomLevel += 0.2; 
        },
        
        zoomOut() { 
            if (this.zoomLevel > 0.4) this.zoomLevel -= 0.2; 
        },
        
        rotateImg() { 
            this.rotation = (this.rotation + 90) % 360; 
        },
        
        resetTransforms() {
            this.zoomLevel = 1;
            this.rotation = 0;
            this.currentFitIndex = 0;
        },

        cycleFitMode() {
            this.currentFitIndex = (this.currentFitIndex + 1) % this.fitModes.length;
        }
    }
}).mount('#app');
