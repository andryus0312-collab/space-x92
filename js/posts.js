import { getDB } from './database.js';
import { ref, push, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export function createPost(authorKey, text, image, video, date) {
    const db = getDB();
    const newPost = {
        authorKey,
        text,
        image,
        video,
        date,
        likes: 0,
        liked: false
    };
    return push(ref(db, 'posts'), newPost);
}

export function deletePost(firebaseId) {
    const db = getDB();
    return remove(ref(db, `posts/${firebaseId}`));
}

export function toggleLike(post) {
    const db = getDB();
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    
    if (post.firebaseId) {
        return update(ref(db, `posts/${post.firebaseId}`), {
            likes: post.likes,
            liked: post.liked
        });
    }
}
