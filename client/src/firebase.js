import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPoRtmit5pUYdnAj9Z7UWVOyS11KSXHRc",
  authDomain: "chat-application-615b6.firebaseapp.com",
  projectId: "chat-application-615b6",
  storageBucket: "chat-application-615b6.firebasestorage.app",
  messagingSenderId: "536016826869",
  appId: "1:536016826869:web:bf625876e9ffc48245f0bc",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
