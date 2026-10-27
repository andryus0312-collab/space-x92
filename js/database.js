import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let db = null;

export function initDatabase(app) {
    db = getDatabase(app);
    return db;
}

export function getDB() {
    return db;
}

// Setup de listeners
export function setupDatabaseListeners(callbacks) {
    const { onPostsChange, onGalleryChange, onCoversChange, onProfilesChange } = callbacks;

    // Posts
    onValue(ref(db, 'posts'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const posts = Object.keys(data).map(key => ({
                firebaseId: key,
                ...data[key]
            })).reverse();
            onPostsChange(posts);
        } else {
            onPostsChange([]);
        }
    });

    // Gallery
    onValue(ref(db, 'gallery'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const gallery = Object.keys(data).map(key => ({
                firebaseId: key,
                ...data[key]
            })).reverse();
            onGalleryChange(gallery);
        } else {
            onGalleryChange([]);
        }
    });

    // Cover Images
    onValue(ref(db, 'coverImages'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const covers = Object.keys(data).map(key => ({
                firebaseId: key,
                ...data[key]
            }));
            onCoversChange(covers);
        } else {
            // Crear portada por defecto si no existe
            const defaultCover = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80';
            import('https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js')
                .then(({ push }) => {
                    push(ref(db, 'coverImages'), { url: defaultCover });
                });
        }
    });

    // Profiles
    onValue(ref(db, 'profiles'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            onProfilesChange(data);
        } else {
            // Crear perfiles por defecto
            const defaultProfiles = {
                her: { name: 'Piggy 🐷', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
                him: { name: 'Bear 🐻', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' }
            };
            set(ref(db, 'profiles'), defaultProfiles);
        }
    });
        }
