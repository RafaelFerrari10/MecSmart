import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyD-moetp13fyL-1w8EmFiXdaCzI36KmpDs",
    authDomain: "mecsmart-9338b.firebaseapp.com",
    projectId: "mecsmart-9338b",
    storageBucket: "mecsmart-9338b.firebasestorage.app",
    messagingSenderId: "697602791479",
    appId: "1:697602791479:web:20bccd64f86852b85907b2",
    measurementId: "G-BD67FMD5FL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);