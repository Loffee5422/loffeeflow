import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyAM-SDBY4eSB1y-loWn5q298f5SQgcgGiE",
  authDomain: "fflow-830d8.firebaseapp.com",
  projectId: "fflow-830d8",
  storageBucket: "fflow-830d8.firebasestorage.app",
  messagingSenderId: "777579323220",
  appId: "1:777579323220:web:f7dcb9c6f9ce6fe3acb2c1",
  measurementId: "G-PSHPCWN4WX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with persistent cache (Offline Support)
// This is critical for a "Daily" task app so it works on subways/airplanes
// persistentMultipleTabManager allows the app to work in multiple tabs while offline
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { auth, db, googleProvider };