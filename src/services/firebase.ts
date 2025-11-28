import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCNLPlK6VqUI5MO2mp8qhgNLGxUIxxuRE",
  authDomain: "plataforma-de-investimen-882fd.firebaseapp.com",
  projectId: "plataforma-de-investimen-882fd",
  storageBucket: "plataforma-de-investimen-882fd.firebasestorage.app",
  messagingSenderId: "429705354476",
  appId: "1:429705354476:web:4227d3625f261bbdd019c9",
  measurementId: "G-D5X6YQY4BF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);