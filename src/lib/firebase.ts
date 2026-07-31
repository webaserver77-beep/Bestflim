import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Movie, SupportMessage, PlatformAd } from '../types';
import { MOVIES_DATA } from '../data/movies';
import { getStoredSupportMessages, getStoredAds } from '../data/adsAndMessages';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// COLLECTIONS
const MOVIES_COLLECTION = 'movies';
const ADS_COLLECTION = 'ads';
const MESSAGES_COLLECTION = 'support_messages';

let hasSeededMovies = false;

// Helper to seed initial data if Firestore is empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    if (localStorage.getItem('bestfilms_firestore_seeded') === 'true') {
      hasSeededMovies = true;
    } else {
      const movieSnap = await getDocs(collection(db, MOVIES_COLLECTION));
      if (movieSnap.empty) {
        console.log('Seeding initial movies to Firestore...');
        for (const movie of MOVIES_DATA) {
          await setDoc(doc(db, MOVIES_COLLECTION, movie.id), movie);
        }
      }
      localStorage.setItem('bestfilms_firestore_seeded', 'true');
      hasSeededMovies = true;
    }

    const adSnap = await getDocs(collection(db, ADS_COLLECTION));
    if (adSnap.empty) {
      console.log('Seeding initial ads to Firestore...');
      const initialAds = getStoredAds();
      for (const ad of initialAds) {
        await setDoc(doc(db, ADS_COLLECTION, ad.id), ad);
      }
    }

    const msgSnap = await getDocs(collection(db, MESSAGES_COLLECTION));
    if (msgSnap.empty) {
      console.log('Seeding initial support messages to Firestore...');
      const initialMsgs = getStoredSupportMessages();
      for (const msg of initialMsgs) {
        await setDoc(doc(db, MESSAGES_COLLECTION, msg.id), msg);
      }
    }
  } catch (err) {
    console.warn('Firestore seeding check error:', err);
  }
}

// ------------------- MOVIES CRUD -------------------
export function subscribeMovies(onData: (movies: Movie[]) => void, onError?: (err: any) => void) {
  const colRef = collection(db, MOVIES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Movie[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Movie);
      });
      if (items.length > 0 || hasSeededMovies || localStorage.getItem('bestfilms_firestore_seeded') === 'true') {
        onData(items);
      } else {
        onData(MOVIES_DATA);
      }
    },
    (err) => {
      console.error('Firestore subscribeMovies error:', err);
      if (onError) onError(err);
      onData(MOVIES_DATA);
    }
  );
}

export async function addMovieToFirestore(movie: Movie): Promise<void> {
  const docRef = doc(db, MOVIES_COLLECTION, movie.id);
  await setDoc(docRef, movie);
}

export async function updateMovieInFirestore(id: string, updates: Partial<Movie>): Promise<void> {
  const docRef = doc(db, MOVIES_COLLECTION, id);
  await updateDoc(docRef, updates as { [x: string]: any });
}

export async function deleteMovieFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, MOVIES_COLLECTION, id);
  await deleteDoc(docRef);
}

// ------------------- ADS CRUD -------------------
export function subscribeAds(onData: (ads: PlatformAd[]) => void, onError?: (err: any) => void) {
  const colRef = collection(db, ADS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: PlatformAd[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as PlatformAd);
      });
      if (items.length > 0) {
        onData(items);
      } else {
        onData(getStoredAds());
      }
    },
    (err) => {
      console.error('Firestore subscribeAds error:', err);
      if (onError) onError(err);
      onData(getStoredAds());
    }
  );
}

export async function addAdToFirestore(ad: PlatformAd): Promise<void> {
  const docRef = doc(db, ADS_COLLECTION, ad.id);
  await setDoc(docRef, ad);
}

export async function updateAdInFirestore(id: string, updates: Partial<PlatformAd>): Promise<void> {
  const docRef = doc(db, ADS_COLLECTION, id);
  await updateDoc(docRef, updates as { [x: string]: any });
}

export async function deleteAdFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, ADS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ------------------- SUPPORT MESSAGES CRUD -------------------
export function subscribeSupportMessages(onData: (msgs: SupportMessage[]) => void, onError?: (err: any) => void) {
  const colRef = collection(db, MESSAGES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: SupportMessage[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as SupportMessage);
      });
      if (items.length > 0) {
        // Sort descending by id or createdAt
        items.sort((a, b) => b.id.localeCompare(a.id));
        onData(items);
      } else {
        onData(getStoredSupportMessages());
      }
    },
    (err) => {
      console.error('Firestore subscribeSupportMessages error:', err);
      if (onError) onError(err);
      onData(getStoredSupportMessages());
    }
  );
}

export async function addSupportMessageToFirestore(msg: SupportMessage): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, msg.id);
  await setDoc(docRef, msg);
}

export async function updateSupportMessageInFirestore(id: string, updates: Partial<SupportMessage>): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  await updateDoc(docRef, updates as { [x: string]: any });
}

export async function deleteSupportMessageFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  await deleteDoc(docRef);
}
