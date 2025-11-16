import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBYxpq5Pla3uOE9hsFllDmB-B32ozlRq8",
  authDomain: "trivium-72dd1.firebaseapp.com",
  projectId: "trivium-72dd1",
  storageBucket: "trivium-72dd1.firebasestorage.app",
  messagingSenderId: "326376249023",
  appId: "1:326376249023:web:4085d8a7852485e7f5180a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);