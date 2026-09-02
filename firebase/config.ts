import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCs46YjBnQFVFOUkMzMKvMIR11rE9ifQ4",
  authDomain: "mecsmart-e69c6.firebaseapp.com",
  projectId: "mecsmart-e69c6",
  storageBucket: "mecsmart-e69c6.firebasestorage.app",
  messagingSenderId: "667449621235",
  appId: "1:667449621235:web:22448cfd07f8e5f44e5586"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

