// app/lib/metrics-server.ts v0.1.0
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export async function logMetric(name: string, value: number, tags: Record<string, string> = {}) {
  try {
    const colRef = collection(db, "metrics");
    await addDoc(colRef, {
      name,
      value,
      tags,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging metric:", error);
  }
}

export async function getRecentMetrics(name: string, limitCount: number = 100) {
  try {
    const colRef = collection(db, "metrics");
    const q = query(
      colRef,
      where("name", "==", name),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting metrics:", error);
    return [];
  }
}
