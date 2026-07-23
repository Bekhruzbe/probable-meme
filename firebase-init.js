// ==========================================
// FIREBASE ULANISHI (Online Shop uzb loyihasi)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile as fbUpdateProfile,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCes7r3ObcgSEcXd4f3JMEzdjqYdiSaIrY",
  authDomain: "online-shop-uzb.firebaseapp.com",
  projectId: "online-shop-uzb",
  storageBucket: "online-shop-uzb.firebasestorage.app",
  messagingSenderId: "947450364735",
  appId: "1:947450364735:web:e0d07bd14e555e0917898a",
  measurementId: "G-NNSLR93NRZ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Login holatini shu brauzerda doim eslab qolish (qayta-qayta so'ramasin)
setPersistence(auth, browserLocalPersistence);

// ===== CLOUDINARY (rasm yuklash uchun) =====
window.CLOUDINARY_CLOUD_NAME = "mlolecem";
window.CLOUDINARY_UPLOAD_PRESET = "onlineshop";

// ===== TASDIQLANGAN (VERIFIED) BELGISI — Telegram/Instagram uslubida =====
// 12 qirrali "gul" shaklidagi nishon + ichida markazlashtirilgan oq galochka
window.OWNER_BADGE_SVG = `
<svg class="verifiedSvg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#2AABEE" d="M23,12l-2.44,-2.78 0.34,-3.68 -3.61,-0.82 -1.89,-3.18 -3.4,1.46 -3.4,-1.46 -1.89,3.18 -3.61,0.82 0.34,3.68 -2.44,2.78 2.44,2.78 -0.34,3.68 3.61,0.82 1.89,3.18 3.4,-1.46 3.4,1.46 1.89,-3.18 3.61,-0.82 -0.34,-3.68z"/>
  <path fill="#fff" d="M9.75,14.39l-3.09,-3.09 -1.41,1.41 4.5,4.5 9,-9 -1.41,-1.41z"/>
</svg>`;

// Boshqa fayllar (auth.js, reviews.js) shu narsalardan foydalanadi
window.Firebase = {
  app,
  auth,
  db,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  fbUpdateProfile,
  sendPasswordResetEmail,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
};

// auth.js/reviews.js "Firebase tayyor" signalini kutadi
window.dispatchEvent(new Event("firebase-ready"));
