// app/lib/config-server.ts v0.1.0
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function getServerConfig(key: string) {
  try {
    const docRef = doc(db, "config", key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting config:", error);
    throw error;
  }
}

export async function setServerConfig(key: string, data: any) {
  try {
    const docRef = doc(db, "config", key);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error setting config:", error);
    throw error;
  }
}
