import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { InviteDocument } from "@/types/game";

export async function createInvite(gameId: string, fromUid: string, fromName: string, toUid: string) {
  const inviteRef = await addDoc(collection(db, "invites"), {
    gameId,
    fromUid,
    fromName,
    toUid,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  await updateDoc(inviteRef, { inviteId: inviteRef.id });
}

export async function updateInviteStatus(inviteId: string, status: InviteDocument["status"]) {
  await updateDoc(doc(db, "invites", inviteId), { status });
}

export function subscribeToPendingInvites(uid: string, callback: (invites: InviteDocument[]) => void) {
  return onSnapshot(
    query(collection(db, "invites"), where("toUid", "==", uid), where("status", "==", "pending")),
    (snapshot) => {
      callback(snapshot.docs.map((entry) => entry.data() as InviteDocument));
    },
  );
}
