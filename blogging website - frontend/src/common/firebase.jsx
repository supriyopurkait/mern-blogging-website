// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC99ZpbVA7uhdDUB2iP0YXD4SVEqqziNIo",
  authDomain: "react-js-blog-website-c3587.firebaseapp.com",
  projectId: "react-js-blog-website-c3587",
  storageBucket: "react-js-blog-website-c3587.firebasestorage.app",
  messagingSenderId: "85765301070",
  appId: "1:85765301070:web:dea532773f982b067a741f",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Google auth
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return { 
      user: result.user,
      access_token: idToken 
    };
  } catch (err) {
    console.error("Google Auth Error:", err);
    throw err;
  }
};

export default auth;