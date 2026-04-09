import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArNEn6fMc8hIerIdf7XQLx6wle",
  authDomain: "takataka-b9371.firebaseapp.com",
  projectId: "takataka-b9371",
  storageBucket: "takataka-b9371.firebasestorage.app",
  messagingSenderId: "731110741221",
  appId: "1:731110741221:web:2fce5c66e2c332736bd4ec"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
