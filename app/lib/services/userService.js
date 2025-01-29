import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import app from "../firebase.config";

export const userService = {
  // Save user to firestore
  saveUser: async (userData) => {
    const db = getFirestore(app);
    try {
      const userDoc = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        streak: 0,
        level: 1,
        LevelProgress: 0,
        levelPoints: 0,
        pointsToNextLevel: 100,
        totalDhikr: 0,
        ChallengesCompleted: 0,
        settings: {
          theme: "light",
          notifications: true,
          soundEnabled: true,
          vibrationEnabled: true,
        },
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      };
      await setDoc(doc(db, "users", userData.uid), userDoc, { merge: true });
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  },

  // Update last active timestamp
  updateLastActive: async (uid) => {
    const db = getFirestore(app);
    try {
      await setDoc(
        doc(db, "users", uid),
        { lastActive: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating last active:", error);
      throw error;
    }
  },

  // Get user data
  getUser: async (uid) => {
    if (!uid) return null;
    const db = getFirestore(app);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },

  updateUserStats: async (uid, points) => {
    const db = getFirestore(app);

    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exist()) {
        const userData = userDoc.data();
        await setDoc(
          userRef,
          {
            ChallengesCompleted: (userData.ChallengesCompleted || 0) + 1,
            levelPoints: (userData.levelPoints || 0) + points,
          },
          { merge: true }
        )
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  }
};
