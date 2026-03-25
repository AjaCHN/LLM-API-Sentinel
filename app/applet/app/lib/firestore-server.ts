// app/lib/firestore-server.ts v0.1.0
import { db } from "@/firebase";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function getDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

export async function createDocument(collectionName: string, data: any) {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}
