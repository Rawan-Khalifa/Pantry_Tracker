// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPH6bIK9B9WPLSbMKeJYXXlwzCxmFc_rA",
  authDomain: "inventory-management-c42a3.firebaseapp.com",
  projectId: "inventory-management-c42a3",
  storageBucket: "inventory-management-c42a3.appspot.com",
  messagingSenderId: "801097266767",
  appId: "1:801097266767:web:a1d3da4f91cd6f09a49c3a",
  measurementId: "G-YWTF9JTHYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };