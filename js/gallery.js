import { getDB } from './database.js';
import { ref, push, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { processImage } from './utils.js';

export function uploadGalleryImage(file, callback) {
    processImage(file, (base64Url) => {
        const db = getDB();
        push(ref(db, 'gallery'), { url: base64Url }).then(() => {
            if (callback) callback();
        });
    });
}

export function deleteGalleryImage(firebaseId) {
    const db = getDB();
    return remove(ref(db, `gallery/${firebaseId}`));
}
