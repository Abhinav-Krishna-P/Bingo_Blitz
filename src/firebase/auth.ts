import { GoogleAuthProvider, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import type { UserProfile } from "@/types/game";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await upsertUserProfile(user);
  return user;
}

export async function upsertUserProfile(user: User, extras?: Partial<UserProfile>) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName: user.displayName ?? "Unknown Player",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      currentGameId: null,
      online: true,
      gamesPlayed: 0,
      gamesWon: 0,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
      ...extras,
    },
    { merge: true },
  );
}

export async function logOut() {
  await signOut(auth);
}
