import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocFromServer,
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { MissionData } from './types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth with Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore instance connected to custom or default database
export const dbFirestore = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Validate connection on boot as mandated by Firebase skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(dbFirestore, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or configuration pending.");
    }
  }
}

// Google Sign-In Helper
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Update or create user profile in Firestore
    if (user) {
      const userRef = doc(dbFirestore, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || 'anonymous@atlantis.ai',
        displayName: user.displayName || 'Operator',
        photoURL: user.photoURL || '',
        role: 'operator',
        createdAt: Date.now()
      }, { merge: true });
    }
    return user;
  } catch (err: any) {
    console.warn("Google sign-in popup bypassed, falling back to guest operator mode:", err.message);
    // Allow anonymous sign-in fallback if popup blocked in iframe
    try {
      const anonResult = await signInAnonymously(auth);
      return anonResult.user;
    } catch {
      return null;
    }
  }
}

// Sign out
export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Cloud Mission Synchronization
export async function syncMissionToCloud(mission: MissionData, user: User | null) {
  if (!user || !mission.title) return;
  try {
    const missionId = mission.id ? String(mission.id) : `m-${Date.now()}`;
    const missionRef = doc(dbFirestore, 'missions', missionId);
    
    await setDoc(missionRef, {
      id: missionId,
      title: mission.title,
      sector: mission.sector,
      topology: mission.topology,
      status: mission.status,
      result: mission.result || '',
      timestamp: mission.timestamp,
      userId: user.uid,
      userEmail: user.email || 'operator@atlantis.ai',
      executionTimeMs: mission.executionTimeMs || 0,
      nodesCount: mission.nodesCount || 1,
      curiosityFactor: mission.curiosityFactor || ''
    }, { merge: true });
  } catch (err: any) {
    console.warn("Firestore cloud mission sync skipped:", err?.message);
  }
}
