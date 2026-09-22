import { initializeApp } from "firebase/app";
import './main.js';
import { getAnalytics } from "firebase/analytics";
import { t } from './i18n.js';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut
} from "firebase/auth";

console.log("Firebase Auth Script: Loading...");

// Check environment to warn user if they are not using a server
if (window.location.protocol === 'file:') {
    alert("Error: You are running this file directly. Please use 'npm run dev' to run the application server, otherwise authentication will not work.");
}

// Firebase Configuration
// Replace with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXmZvGMheJOg_1S-V2q5EzryRsqQGD5vE",
    authDomain: "somnextech.firebaseapp.com",
    projectId: "somnextech",
    storageBucket: "somnextech.firebasestorage.app",
    messagingSenderId: "370818110468",
    appId: "1:370818110468:web:695329a9a51bf01ae3d151",
    measurementId: "G-Y1MZHK3HLP"
};

// Initialize Firebase
let app, auth, analytics, googleProvider;

try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase Auth Script: Initialized.");
} catch (e) {
    console.error("Firebase Initialization Error:", e);
    alert(t('auth_system_error'));
}

// DOM Elements
const loginForm = document.querySelector('.auth-form');
const googleBtn = document.querySelector('.google-btn');

// Page Detection logic
// We look for '.auth-form' to confirm we are on a dedicated auth page (login or signup)
// We avoid false positives from the contact form on index.html
const isAuthPage = !!loginForm;
const nameInput = document.getElementById('name');
const isSignupPage = isAuthPage && !!nameInput;
const isLoginPage = isAuthPage && !isSignupPage;

// --- Helper: Loading State ---
function setLoading(isLoading, button) {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = 'Processing...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML;
        button.style.opacity = '1';
    }
}

// --- Google Sign In ---
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        console.log("Google login clicked");
        setLoading(true, googleBtn);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log("Google Sign In Success:", user);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Google Sign In Error:", error);
            alert(t('auth_google_failed') + error.message);
            setLoading(false, googleBtn);
        }
    });
}

// --- Email/Password Auth ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        setLoading(true, submitBtn);

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log(`Attempting auth on ${isSignupPage ? 'Signup' : 'Login'} page...`);

        try {
            if (isLoginPage) {
                // Login
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("Login Success:", userCredential.user);
                window.location.href = 'index.html';
            } else if (isSignupPage) {
                // Signup
                const name = nameInput ? nameInput.value : "User";
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Update profile
                await updateProfile(userCredential.user, {
                    displayName: name
                });

                console.log("Signup Success:", userCredential.user);
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error("Auth Error:", error);
            let message = error.message;
            if (error.code === 'auth/invalid-credential') message = t('auth_invalid_credential');
            if (error.code === 'auth/email-already-in-use') message = t('auth_email_in_use');
            if (error.code === 'auth/weak-password') message = t('auth_weak_password');

            alert(message);
            setLoading(false, submitBtn);
        }
    });
}

// --- Auth State Listener ---
// Handles UI updates on index.html and redirects on auth pages
onAuthStateChanged(auth, (user) => {
    // Select login buttons (navbar and mobile menu)
    const loginBtns = document.querySelectorAll('.login-btn');

    if (user) {
        console.log("User is signed in:", user.email);

        // 1. Redirect if on Login/Signup pages
        if (isAuthPage) {
            window.location.href = 'index.html';
            return;
        }

        // 2. Update Dashboard UI (Change Login to Logout)
        loginBtns.forEach(btn => {
            btn.textContent = 'Logout';
            // btn.classList.add('logout-mode'); // Optional

            // Remove old listeners by cloning or just overwriting property approach (simpler here)
            btn.onclick = async (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to logout?")) {
                    try {
                        await signOut(auth);
                        window.location.reload();
                    } catch (err) {
                        console.error(err);
                        alert("Logout failed");
                    }
                }
            };
            // Also kill the href so it doesn't navigate
            btn.removeAttribute('href');
        });

    } else {
        console.log("User is signed out");

        // Reset UI
        loginBtns.forEach(btn => {
            btn.textContent = 'Login';
            btn.onclick = null; // Remove inline handler
            btn.href = 'login.html';
        });
    }
});
