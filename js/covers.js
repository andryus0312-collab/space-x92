import { getDB } from './database.js';
import { ref, push, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { processImage } from './utils.js';

export function uploadCoverImage(file, callback) {
    processImage(file, (base64Url) => {
        const db = getDB();
        push(ref(db, 'coverImages'), { url: base64Url }).then(() => {
            if (callback) callback();
        });
    });
}

export function removeCoverImage(firebaseId) {
    const db = getDB();
    return remove(ref(db, `coverImages/${firebaseId}`));
}
