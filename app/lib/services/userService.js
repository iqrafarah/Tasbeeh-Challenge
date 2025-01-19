import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
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

        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", userData.uid), userDoc, { merge: true });
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  },

  updateChallenge: async (uid, challengeProgress) => {
    const db = getFirestore(app);
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          currentChallenge: challengeProgress,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating challenge:", error);
      throw error;
    }
  },

  updateProgress: async (uid, progressData) => {
    const db = getFirestore(app);
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          totalPoints: progressData.points,
          level: progressData.level,
          levelProgress: progressData.progress,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  },
};
