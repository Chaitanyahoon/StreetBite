import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, Firestore } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, Auth } from 'firebase/auth'
import { getAnalytics, Analytics } from 'firebase/analytics'

// Use provided Firebase config (falls back to existing env vars if you prefer)
const firebaseConfig = {
  apiKey: "AIzaSyDSGZMx__OvhECxf3mq69oi_2oUU5TbmbA",
  authDomain: "street-bite-v1.firebaseapp.com",
  projectId: "street-bite-v1",
  storageBucket: "street-bite-v1.firebasestorage.app",
  messagingSenderId: "1079217158988",
  appId: "1:1079217158988:web:3d3684e3842a090e7a6de9",
  measurementId: "G-WQYD7PQ34B"
}

// Initialize app only on client side
let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let analytics: Analytics | null = null

// Only initialize Firebase on client side (browser)
if (typeof window !== 'undefined') {
  // Initialize app once
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }

  // Initialize Firestore
  if (app) {
    db = getFirestore(app)
    
    // Initialize Auth
    auth = getAuth(app)
    
    // Initialize analytics (optional, may fail if not enabled)
    try {
      analytics = getAnalytics(app)
    } catch (e) {
      // Analytics not critical - ignore errors
      console.warn('Firebase analytics initialization failed (this is okay):', e)
    }
  }
}

// Fetch all vendors collection -> returns array of vendor objects
export async function fetchVendors() {
  if (!db) {
    throw new Error('Firestore is not initialized. Make sure you are in the browser environment.')
  }
  const col = collection(db, 'vendors')
  const snap = await getDocs(col)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Add a new vendor document
export async function addVendor(vendor: any) {
  if (!db) {
    throw new Error('Firestore is not initialized. Make sure you are in the browser environment.')
  }
  const col = collection(db, 'vendors')
  const docRef = await addDoc(col, vendor)
  return { id: docRef.id, ...vendor }
}

// Update vendor by id
export async function updateVendor(id: string, patch: Partial<any>) {
  if (!db) {
    throw new Error('Firestore is not initialized. Make sure you are in the browser environment.')
  }
  const docRef = doc(db, 'vendors', id)
  await updateDoc(docRef, patch)
  return true
}

// Helper function to get auth instance (throws error if not initialized)
export function getAuthInstance(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used on the client side')
  }
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Make sure you are in the browser environment.')
  }
  return auth
}

// Export app, db, and auth if other modules need direct access
export { app, db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAuthInstance }
export type { FirebaseUser }
