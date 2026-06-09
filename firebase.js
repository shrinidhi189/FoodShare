// firebase.js
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "firebase/firestore";

// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Register User
export async function registerUser(email, password, userData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: userData.name,
            email: email,
            role: userData.role,
            phone: userData.phone || "",
            location: userData.location || "",
            createdAt: new Date().toISOString()
        });
        
        return { success: true, user: user };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: error.message };
    }
}

// Login User
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        // Store in localStorage for easy access
        localStorage.setItem("user", JSON.stringify({
            uid: user.uid,
            email: user.email,
            ...userData
        }));
        
        return { success: true, user: user, userData: userData };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
    }
}

// Logout User
export async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem("user");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Check if user is logged in
export function isAuthenticated() {
    return localStorage.getItem("user") !== null;
}