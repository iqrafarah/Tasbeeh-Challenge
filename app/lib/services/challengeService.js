import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../firebase.config";

export const challengeService = {
  getChallenges: async () => {
    const db = getFirestore(app);
    const auth = getAuth();

    // Wait for authentication to be ready
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
};
