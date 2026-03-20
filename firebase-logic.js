import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
getFirestore, doc, setDoc, serverTimestamp,
collection, query, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyA2...",
authDomain: "binary-ruthless-trader-26654.firebaseapp.com",
projectId: "binary-ruthless-trader-26654"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

signInAnonymously(auth);

// GLOBAL ADMIN SAVE
window.updateCloudConfig = async (path,data)=>{
await setDoc(doc(db,path.split('/')[0],path.split('/')[1]),{
...data,updatedAt:serverTimestamp()
});
};
