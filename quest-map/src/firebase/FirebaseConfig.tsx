import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZgTa0nCW9_om0Y_IeRZ0PGGoOny4aIE8",
  authDomain: "viso-front-end-task-54587.firebaseapp.com",
  projectId: "viso-front-end-task-54587",
  storageBucket: "viso-front-end-task-54587.appspot.com",
  messagingSenderId: "912712779497",
  appId: "1:912712779497:web:05ac8c606d54cd697f5278",
  measurementId: "G-G5KXB86NPW",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

interface Quest {
  location: string;
  timestamp?: any;
  next?: null | string;
}

async function addQuest(location: string): Promise<void> {
  try {
    const docRef = await addDoc(collection(db, "quests"), {
      location: location,
      timestamp: serverTimestamp(),
      next: null,
    } as Quest);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export { db, addQuest };
