import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

const missingKeys = requiredKeys.filter((key) => {
  const value = firebaseConfig[key];
  return value == null || value === "";
});

if (missingKeys.length > 0) {
  throw new Error(
    `Firebase configuration is incomplete. Missing: ${missingKeys.join(", ")}.` +
      "\nEnsure you have the required environment variables set in your .env file."
  );
}

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Unable to enable persistent auth state:", error);
});

auth.useDeviceLanguage();

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

export const beginGoogleSignIn = async () => {
  try {
    await signInWithRedirect(auth, provider);
    return null;
  } catch (error) {
    if (error?.code === "auth/operation-not-supported-in-this-environment") {
      return signInWithPopup(auth, provider);
    }
    throw error;
  }
};

export const completeRedirectSignIn = async () => {
  try {
    return await getRedirectResult(auth);
  } catch (error) {
    if (error?.code === "auth/no-auth-event") {
      return null;
    }
    throw error;
  }
};

export const signOutUser = () => signOut(auth);

export { auth };
export default firebaseApp;
