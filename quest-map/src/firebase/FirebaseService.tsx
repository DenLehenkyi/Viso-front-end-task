import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./FirebaseConfig";

interface MarkerData {
  location: google.maps.LatLngLiteral;
  timestamp: any;
  next?: string | null;
}

export async function addMarkerToFirestore(
  location: google.maps.LatLngLiteral
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, "quests"), {
      location: location,
      timestamp: serverTimestamp(),
      next: null,
    } as MarkerData);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}

export async function updateMarkerInFirestore(
  docId: string,
  updatedData: Partial<MarkerData>
): Promise<void> {
  try {
    const docRef = doc(db, "quests", docId);
    await updateDoc(docRef, {
      ...updatedData,
      timestamp: serverTimestamp(),
    });
    console.log("Document updated with ID: ", docId);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

export async function deleteMarkerFromFirestore(docId: string): Promise<void> {
  try {
    const docRef = doc(db, "quests", docId);
    await deleteDoc(docRef);
    console.log("Document deleted with ID: ", docId);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}

export async function getMarkersFromFirestore(): Promise<
  (MarkerData & { docId: string })[]
> {
  try {
    const markersCollection = collection(db, "quests");
    const q = query(markersCollection, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    const markers: (MarkerData & { docId: string })[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as MarkerData;
      markers.push({
        ...data,
        docId: doc.id,
      });
    });

    console.log("Markers fetched from Firestore: ", markers);
    return markers;
  } catch (e) {
    console.error("Error fetching markers: ", e);
    return [];
  }
}
