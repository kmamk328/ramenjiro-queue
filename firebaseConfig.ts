// Import the functions you need from the SDKs you need
// import { initializeAuth } from 'firebase/auth';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { initializeApp } from "firebase/app";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth,initializeAuth, getReactNativePersistence,setPersistence,signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { getAuth, setPersistence, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// import * as SecureStore from "expo-secure-store";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzox4AdK3yeSeTYC_MZDpcYQ4cMo9fKlM",
  authDomain: "ramenjiro-queue.firebaseapp.com",
  projectId: "ramenjiro-queue",
  storageBucket: "ramenjiro-queue.firebasestorage.app",
  messagingSenderId: "245894701308",
  appId: "1:245894701308:web:88dd85f50a9b81e10ef779",
  measurementId: "G-CPTV9XQGHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized:", app);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
// const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});



export { db, auth };