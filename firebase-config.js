// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
  authDomain: "sporthealthdata.firebaseapp.com",
  projectId: "sporthealthdata",
  storageBucket: "sporthealthdata.firebasestorage.app",
  messagingSenderId: "789054240877",
  appId: "1:789054240877:web:04a400c9ea586523a86764",
  measurementId: "G-ZWS9C7P359"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
