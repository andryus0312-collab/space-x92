import { getDB } from './database.js';
import { set, ref } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { processImage } from './utils.js';

export function updateProfileImage(profiles, key, file, callback) {
    processImage(file, (base64Url) => {
        profiles[key].img = base64Url;
        const db = getDB();
        set(ref(db, 'profiles'), profiles).then(() => {
            if (callback) callback();
        });
    });
}
