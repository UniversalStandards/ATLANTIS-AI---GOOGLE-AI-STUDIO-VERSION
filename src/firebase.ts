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
  getDoc,
  getDocFromServer,
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { 
  MissionData, 
  AgentNodeData, 
  ImportedConversation, 
  UnconfirmedConversation,
  SwarmTask,
  SwarmTool,
  ExternalIntegrationConfig
} from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Deep sanitize data to strip undefined fields which Firestore rejects
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    return value === undefined ? null : value;
  }));
}

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
  const missionId = mission.id ? String(mission.id) : `m-${Date.now()}`;
  const path = `missions/${missionId}`;
  try {
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
      curiosityFactor: mission.curiosityFactor || '',
      treeSnapshot: mission.treeSnapshot ? sanitizeForFirestore(mission.treeSnapshot) : null
    }, { merge: true });
  } catch (err: any) {
    console.warn("Firestore cloud mission sync skipped:", err?.message);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export interface ActiveSessionData {
  userId: string;
  activeMission: MissionData | null;
  nodes: Record<string, AgentNodeData>;
  updatedAt: number;
}

// Persist active mission & nodes to Firestore
export async function persistActiveSessionToFirestore(
  activeMission: MissionData | null,
  nodes: Record<string, AgentNodeData>,
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) return;

  const path = `users/${targetUser.uid}/session/active`;
  try {
    const sessionRef = doc(dbFirestore, 'users', targetUser.uid, 'session', 'active');
    const sanitizedMission = activeMission ? sanitizeForFirestore(activeMission) : null;
    const sanitizedNodes = sanitizeForFirestore(nodes);

    await setDoc(sessionRef, {
      userId: targetUser.uid,
      activeMission: sanitizedMission,
      nodes: sanitizedNodes,
      updatedAt: Date.now()
    }, { merge: true });

    // Also keep mission document treeSnapshot updated in missions collection
    if (activeMission && activeMission.title) {
      const missionId = activeMission.id ? String(activeMission.id) : `m-${activeMission.timestamp}`;
      const missionRef = doc(dbFirestore, 'missions', missionId);
      await setDoc(missionRef, {
        id: missionId,
        title: activeMission.title,
        sector: activeMission.sector,
        topology: activeMission.topology,
        status: activeMission.status,
        result: activeMission.result || '',
        timestamp: activeMission.timestamp,
        userId: targetUser.uid,
        userEmail: targetUser.email || 'operator@atlantis.ai',
        executionTimeMs: activeMission.executionTimeMs || 0,
        nodesCount: Object.keys(nodes).length || activeMission.nodesCount || 1,
        curiosityFactor: activeMission.curiosityFactor || '',
        treeSnapshot: sanitizedNodes
      }, { merge: true });
    }
  } catch (err) {
    console.warn("Error persisting active session to Firestore:", err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch active mission & nodes from Firestore
export async function fetchActiveSessionFromFirestore(
  user?: User | null
): Promise<ActiveSessionData | null> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) return null;

  const path = `users/${targetUser.uid}/session/active`;
  try {
    const sessionRef = doc(dbFirestore, 'users', targetUser.uid, 'session', 'active');
    const snapshot = await getDoc(sessionRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        userId: data.userId || targetUser.uid,
        activeMission: data.activeMission || null,
        nodes: data.nodes || {},
        updatedAt: data.updatedAt || 0
      };
    }
    return null;
  } catch (err) {
    console.warn("Error fetching active session from Firestore:", err);
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// Sync imported conversation to Firestore
export async function syncImportedConversationToCloud(
  conv: ImportedConversation,
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser || !conv.id) return;

  const path = `users/${targetUser.uid}/imported_conversations/${conv.id}`;
  try {
    const convRef = doc(dbFirestore, 'users', targetUser.uid, 'imported_conversations', conv.id);
    await setDoc(convRef, {
      id: conv.id,
      userId: targetUser.uid,
      title: conv.title,
      platform: conv.platform,
      sourceFormat: conv.sourceFormat || 'api',
      messageCount: conv.messageCount || conv.messages?.length || 0,
      characterCount: conv.characterCount || 0,
      activeForContext: conv.activeForContext !== false,
      summary: conv.summary || '',
      keyTopics: conv.keyTopics || [],
      messages: sanitizeForFirestore(conv.messages || []),
      createdAt: conv.createdAt || Date.now(),
      importedAt: conv.importedAt || Date.now()
    }, { merge: true });
  } catch (err: any) {
    console.warn("Firestore imported conversation sync warning:", err?.message);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete imported conversation from Firestore
export async function deleteImportedConversationFromCloud(
  convId: string,
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser || !convId) return;

  const path = `users/${targetUser.uid}/imported_conversations/${convId}`;
  try {
    const convRef = doc(dbFirestore, 'users', targetUser.uid, 'imported_conversations', convId);
    await deleteDoc(convRef);
  } catch (err: any) {
    console.warn("Firestore imported conversation delete warning:", err?.message);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// UNCONFIRMED IMPORTED CONVERSATIONS (PERSISTENCE & STAGING FOR LATER REVIEW)
// ---------------------------------------------------------------------------

// Persist single unconfirmed conversation to Firestore
export async function saveUnconfirmedConversationToCloud(
  conv: ImportedConversation,
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser || !conv.id) return;

  const path = `users/${targetUser.uid}/unconfirmed_conversations/${conv.id}`;
  try {
    const convRef = doc(dbFirestore, 'users', targetUser.uid, 'unconfirmed_conversations', conv.id);
    await setDoc(convRef, {
      id: conv.id,
      userId: targetUser.uid,
      title: conv.title,
      platform: conv.platform,
      sourceFormat: conv.sourceFormat || 'json',
      messageCount: conv.messageCount || conv.messages?.length || 0,
      characterCount: conv.characterCount || 0,
      summary: conv.summary || '',
      keyTopics: conv.keyTopics || [],
      messages: sanitizeForFirestore(conv.messages || []),
      createdAt: conv.createdAt || Date.now(),
      importedAt: conv.importedAt || Date.now(),
      stagedAt: Date.now(),
      status: 'pending_review'
    }, { merge: true });
  } catch (err: any) {
    console.warn("Firestore unconfirmed conversation save warning:", err?.message);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Persist batch of unconfirmed conversations to Firestore
export async function saveUnconfirmedConversationsBatchToCloud(
  convs: ImportedConversation[],
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser || convs.length === 0) return;

  const path = `users/${targetUser.uid}/unconfirmed_conversations`;
  try {
    // Firestore writeBatch supports up to 500 operations
    const chunks: ImportedConversation[][] = [];
    for (let i = 0; i < convs.length; i += 400) {
      chunks.push(convs.slice(i, i + 400));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(dbFirestore);
      const now = Date.now();
      for (const conv of chunk) {
        if (!conv.id) continue;
        const ref = doc(dbFirestore, 'users', targetUser.uid, 'unconfirmed_conversations', conv.id);
        batch.set(ref, {
          id: conv.id,
          userId: targetUser.uid,
          title: conv.title,
          platform: conv.platform,
          sourceFormat: conv.sourceFormat || 'json',
          messageCount: conv.messageCount || conv.messages?.length || 0,
          characterCount: conv.characterCount || 0,
          summary: conv.summary || '',
          keyTopics: conv.keyTopics || [],
          messages: sanitizeForFirestore(conv.messages || []),
          createdAt: conv.createdAt || now,
          importedAt: conv.importedAt || now,
          stagedAt: now,
          status: 'pending_review'
        }, { merge: true });
      }
      await batch.commit();
    }
  } catch (err: any) {
    console.warn("Firestore unconfirmed batch save warning:", err?.message);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch all unconfirmed conversations from Firestore for current operator
export async function fetchUnconfirmedConversationsFromCloud(
  user?: User | null
): Promise<UnconfirmedConversation[]> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) return [];

  const path = `users/${targetUser.uid}/unconfirmed_conversations`;
  try {
    const collRef = collection(dbFirestore, 'users', targetUser.uid, 'unconfirmed_conversations');
    const snapshot = await getDocs(collRef);
    const results: UnconfirmedConversation[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: data.id || docSnap.id,
        userId: data.userId || targetUser.uid,
        title: data.title || 'Untitled Conversation',
        platform: data.platform || 'custom',
        sourceFormat: data.sourceFormat || 'json',
        messageCount: data.messageCount || (data.messages?.length ?? 0),
        characterCount: data.characterCount || 0,
        summary: data.summary || '',
        keyTopics: data.keyTopics || [],
        messages: data.messages || [],
        createdAt: data.createdAt || 0,
        importedAt: data.importedAt || 0,
        stagedAt: data.stagedAt || 0,
        status: data.status || 'pending_review',
        activeForContext: false
      });
    });
    // Sort newest staged first
    results.sort((a, b) => (b.stagedAt || 0) - (a.stagedAt || 0));
    return results;
  } catch (err: any) {
    console.warn("Firestore fetch unconfirmed conversations warning:", err?.message);
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

// Delete single unconfirmed conversation from Firestore (discard or after commit)
export async function deleteUnconfirmedConversationFromCloud(
  convId: string,
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser || !convId) return;

  const path = `users/${targetUser.uid}/unconfirmed_conversations/${convId}`;
  try {
    const convRef = doc(dbFirestore, 'users', targetUser.uid, 'unconfirmed_conversations', convId);
    await deleteDoc(convRef);
  } catch (err: any) {
    console.warn("Firestore unconfirmed conversation delete warning:", err?.message);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Clear all unconfirmed staging conversations from Firestore
export async function clearAllUnconfirmedConversationsFromCloud(
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) return;

  const path = `users/${targetUser.uid}/unconfirmed_conversations`;
  try {
    const collRef = collection(dbFirestore, 'users', targetUser.uid, 'unconfirmed_conversations');
    const snapshot = await getDocs(collRef);
    if (snapshot.empty) return;

    const batch = writeBatch(dbFirestore);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err: any) {
    console.warn("Firestore clear unconfirmed conversations warning:", err?.message);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Real-time listener for unconfirmed conversations in Firestore
export function subscribeUnconfirmedConversations(
  user: User | null,
  onUpdate: (convs: UnconfirmedConversation[]) => void
): () => void {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    onUpdate([]);
    return () => {};
  }

  const path = `users/${targetUser.uid}/unconfirmed_conversations`;
  const collRef = collection(dbFirestore, 'users', targetUser.uid, 'unconfirmed_conversations');

  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const items: UnconfirmedConversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id || docSnap.id,
          userId: data.userId || targetUser.uid,
          title: data.title || 'Untitled Conversation',
          platform: data.platform || 'custom',
          sourceFormat: data.sourceFormat || 'json',
          messageCount: data.messageCount || (data.messages?.length ?? 0),
          characterCount: data.characterCount || 0,
          summary: data.summary || '',
          keyTopics: data.keyTopics || [],
          messages: data.messages || [],
          createdAt: data.createdAt || 0,
          importedAt: data.importedAt || 0,
          stagedAt: data.stagedAt || 0,
          status: data.status || 'pending_review',
          activeForContext: false
        });
      });
      items.sort((a, b) => (b.stagedAt || 0) - (a.stagedAt || 0));
      onUpdate(items);
    },
    (error) => {
      console.warn("Firestore unconfirmed conversations snapshot error:", error?.message);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

// -----------------------------------------------------------------------------
// SWARM BLACKBOARD PERSISTENCE (Tasks, Tools, Integrations, Memory)
// -----------------------------------------------------------------------------

export async function fetchBlackboardDocFromCloud<T>(
  docId: 'tasks' | 'tools' | 'integrations' | 'memory',
  user?: User | null
): Promise<T | null> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) return null;

  const path = `users/${targetUser.uid}/blackboard/${docId}`;
  try {
    const docRef = doc(dbFirestore, 'users', targetUser.uid, 'blackboard', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (err: any) {
    console.warn(`Firestore blackboard fetch warning for ${docId}:`, err?.message);
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveBlackboardDocToCloud(
  docId: 'tasks' | 'tools' | 'integrations' | 'memory',
  payload: Record<string, any>,
  user?: User | null
): Promise<void> {
  const targetUser = user || auth.currentUser;
  if (!targetUser) return;

  const path = `users/${targetUser.uid}/blackboard/${docId}`;
  try {
    const docRef = doc(dbFirestore, 'users', targetUser.uid, 'blackboard', docId);
    await setDoc(docRef, {
      ...sanitizeForFirestore(payload),
      userId: targetUser.uid,
      type: docId,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err: any) {
    console.warn(`Firestore blackboard save warning for ${docId}:`, err?.message);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeBlackboardDoc<T>(
  docId: 'tasks' | 'tools' | 'integrations' | 'memory',
  user: User | null,
  onUpdate: (data: T | null) => void
): () => void {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    return () => {};
  }

  const path = `users/${targetUser.uid}/blackboard/${docId}`;
  const docRef = doc(dbFirestore, 'users', targetUser.uid, 'blackboard', docId);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as T);
      }
    },
    (error) => {
      console.warn(`Firestore blackboard snapshot error for ${docId}:`, error?.message);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}


