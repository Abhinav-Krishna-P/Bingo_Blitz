import type { User } from "firebase/auth";
import { onDisconnect, ref, set } from "firebase/database";
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, rtdb } from "@/firebase/config";
import type { SessionPresence, SessionStatus } from "@/types/game";
import { getLocalIP, getSubnet } from "@/utils/network";

export async function registerPresence(user: User, status: SessionStatus = "idle") {
  const localIP = await getLocalIP();
  const subnet = getSubnet(localIP);

  const payload: SessionPresence = {
    uid: user.uid,
    displayName: user.displayName ?? "Unknown Player",
    photoURL: user.photoURL ?? "",
    localIP,
    subnet,
    online: true,
    status,
    currentGameId: null,
  };

  await setDoc(
    doc(db, "sessions", user.uid),
    {
      ...payload,
      lastPing: serverTimestamp(),
    },
    { merge: true },
  );

  const presenceRef = ref(rtdb, `presence/${user.uid}`);
  await set(presenceRef, { online: true, updatedAt: Date.now() });
  await onDisconnect(presenceRef).set({ online: false, updatedAt: Date.now() });
  return payload;
}

export async function updatePresence(userId: string, patch: Partial<SessionPresence>) {
  await updateDoc(doc(db, "sessions", userId), {
    ...patch,
    lastPing: serverTimestamp(),
  });
}

export async function markOffline(userId: string) {
  await updateDoc(doc(db, "sessions", userId), {
    online: false,
    lastPing: serverTimestamp(),
  });
}

export function subscribeToSession(userId: string, callback: (session: SessionPresence | null) => void) {
  return onSnapshot(doc(db, "sessions", userId), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as SessionPresence) : null);
  });
}
