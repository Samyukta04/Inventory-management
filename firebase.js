// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEVde9LIILto_CRIbkMSlavkh9trpqbkM",
  authDomain: "inventory-management-1dc35.firebaseapp.com",
  projectId: "inventory-management-1dc35",
  storageBucket: "inventory-management-1dc35.appspot.com",
  messagingSenderId: "1077980473979",
  appId: "1:1077980473979:web:0e3f0f39d4e3e02eeb90de",
  measurementId: "G-2RHD5G60SD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app)
const auth = getAuth(app)

export {firestore, auth}