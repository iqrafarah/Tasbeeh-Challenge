import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import app from "../firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const challengeService = {
  getChallenges: async () => {
    const db = getFirestore(app);
    const auth = getAuth();

    await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error("User not authenticated"));
        }
      });
    });

    try {
      const challengesSnapshot = await getDocs(collection(db, "Challenges"));
      return challengesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching challenges:", error);
      throw error;
    }
  },

  saveChallenge: async (userData) => {
    const db = getFirestore(app);
    const userChallengeRef = collection(
      db,
      "userChallenges",
      userData.userId,
      "challenges"
    );

    try {
      const userChallengeDocRef = doc(userChallengeRef, userData.challengeId);
      // Check if the document already exists
      const challengeQuery = query(
        userChallengeRef,
        where("challengeId", "==", userData.challengeId)
      );
      const existingChallenges = await getDocs(challengeQuery);

      if (!existingChallenges.empty) {
        // Update the existing document
        const docId = existingChallenges.docs[0].id;
        await setDoc(
          doc(userChallengeRef, docId),
          {
            count: userData.count,
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // Create a new document
        await setDoc(userChallengeDocRef, {
          userId: userData.userId,
          challengeId: userData.challengeId,
          count: userData.count,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving challenge:", error);
      throw error;
    }
  },
};
