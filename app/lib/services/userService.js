import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  writeBatch,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import app from "../firebase.config";

export const userService = {
  // Save user to firestore
  saveUser: async (userData) => {
    const db = getFirestore(app);
    try {
      const userRef = doc(db, "users", userData.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // User already exists, update only necessary fields
        await setDoc(
          userRef,
          {
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // User does not exist, create a new user document
        const trialStartDate = new Date();
        const trialEndDate = new Date(
          trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000
        ); // 7 days from trialStartDate

        const newUserDoc = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          streak: 0,
          level: 1,
          totalPoints: 0,
          pointsToNextLevel: 100,
          totalDhikr: 0,
          ChallengesCompleted: 0,
          longestStreak: 0,
          contributions: {},
          settings: {
            theme: "light",
            notifications: true,
            soundEnabled: true,
            vibrationEnabled: true,
          },
          subscription: {
            status: "trial", // "trial", "free", "monthly", "lifetime"
            trialStartDate: trialStartDate,
            trialEndDate: trialEndDate,
            subscriptionId: null,
            orderId: null,
            planType: null,
          },
          onBoarded: false,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        };
        await setDoc(userRef, newUserDoc, { merge: true });
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  },

  updateUser: async (uid, data) => {
    const db = getFirestore(app);

    const userRef = doc(db, "users", uid);
    try {
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating user data:", error);
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

  updateLastActive: async (uid) => {
    const db = getFirestore(app);
    try {
      const userRef = doc(db, "users", uid);

      // Just update the lastActive timestamp without modifying streak
      await setDoc(
        userRef,
        {
          lastActive: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating last active:", error);
      throw error;
    }
  },

  updateUserStats: async (uid, earnedPoints) => {
    const db = getFirestore(app);
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const numericPoints = Number(earnedPoints);

        let totalPoints = (userData.totalPoints || 0) + numericPoints;
        let level = userData.level || 1;
        let pointsToNextLevel = userData.pointsToNextLevel || 100;

        const growthFactor = 1.5;
        let hasLevelChanged = false;
        let newLevel = level;

        // Level up logic
        while (totalPoints >= pointsToNextLevel) {
          newLevel += 1;
          pointsToNextLevel = Math.round(
            100 * Math.pow(newLevel, growthFactor)
          );
          hasLevelChanged = true;
        }

        // Update contribution data
        const today = new Date().toISOString().split("T")[0];
        const contributions = userData.contributions || {};
        contributions[today] = (contributions[today] || 0) + 1;

        // Track daily stats
        let dailyStats = userData.dailyStats || {};

        // Check if this is the first challenge completed today
        const isFirstChallengeToday =
          !dailyStats[today] || dailyStats[today].ChallengesCompleted === 0;

        dailyStats[today] = dailyStats[today] || {
          totalDhikr: 0,
          ChallengesCompleted: 0,
        };
        dailyStats[today].ChallengesCompleted += 1;
        dailyStats[today].totalDhikr += 1; // Increment totalDhikr for today

        // Handle streak logic
        let currentStreak = userData.streak || 0;
        let longestStreak = userData.longestStreak || 0;

        // Only update the streak if this is the first challenge completed today
        if (isFirstChallengeToday) {
          // Get yesterday's date
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          // Check if user completed any challenges yesterday
          const hadChallengeYesterday =
            dailyStats[yesterdayStr] &&
            dailyStats[yesterdayStr].ChallengesCompleted > 0;

          if (currentStreak === 0 || hadChallengeYesterday) {
            // If streak was 0 or user completed challenge yesterday, increment streak
            currentStreak += 1;
          } else {
            // Otherwise reset to 1 (start new streak)
            currentStreak = 0;
          }

          // Update longest streak if needed
          longestStreak = Math.max(currentStreak, longestStreak);
        }

        // Update the Firestore document with the new data
        await setDoc(
          userRef,
          {
            totalPoints: totalPoints,
            level: newLevel,
            pointsToNextLevel: pointsToNextLevel,
            ChallengesCompleted: (userData.ChallengesCompleted || 0) + 1,
            contributions: contributions,
            dailyStats: dailyStats,
            lastActive: serverTimestamp(),
            streak: currentStreak,
            longestStreak: longestStreak,
          },
          { merge: true }
        );

        return {
          hasLevelChanged,
          newLevel,
          newStreak: currentStreak,
        };
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  },

  getTodaysStats: async (uid) => {
    const db = getFirestore(app);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        const dailyStats = userData.dailyStats || {};
        return dailyStats[today] || { totalDhikr: 0, ChallengesCompleted: 0 };
      }
      return { totalDhikr: 0, ChallengesCompleted: 0 };
    } catch (error) {
      console.error("Error fetching today's stats:", error);
      throw error;
    }
  },

  updateTotalDhikr: async (uid, change) => {
    const numericChange = Number(change);

    if (isNaN(numericChange)) {
      console.error("Invalid change value for totalDhikr:", change);
      return null;
    }

    const db = getFirestore(app);
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const today = new Date().toISOString().split("T")[0];

        // Ensure dailyStats exists
        let dailyStats = userData.dailyStats || {};

        // Ensure today's stats exist
        if (!dailyStats[today]) {
          dailyStats[today] = {
            totalDhikr: 0, // Ensure it starts at 0 for today
            ChallengesCompleted: 0,
          };
        }

        // Calculate new values
        dailyStats[today].totalDhikr += numericChange;
        const newTotalDhikr = (userData.totalDhikr || 0) + numericChange;

        // Ensure Firestore update is done correctly
        await setDoc(
          userRef,
          {
            totalDhikr: newTotalDhikr, // Store all-time total correctly
            dailyStats, // Store today's updated dhikr correctly
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );

        return {
          totalDhikr: newTotalDhikr, // All-time total
          dailyDhikr: dailyStats[today].totalDhikr, // Today's total
        };
      }

      console.error("User not found");
      return null;
    } catch (error) {
      console.error("Error updating totalDhikr:", error);
      throw error;
    }
  },

  syncDhikrCounts: async (uid) => {
    const db = getFirestore(app);
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const today = new Date().toISOString().split("T")[0];

        // Get the current values
        const totalDhikr = userData.totalDhikr || 0;
        const dailyStats = userData.dailyStats || {};

        // Initialize today's entry if it doesn't exist
        if (!dailyStats[today]) {
          dailyStats[today] = {
            totalDhikr: 0, // Initialize with 0, not totalDhikr
            ChallengesCompleted: 0,
          };
        }

        // No need to check for discrepancy between daily and total
        // as they should be different values by design

        // Update Firestore if we added a new day's entry
        if (!userData.dailyStats || !userData.dailyStats[today]) {
          await setDoc(userRef, { dailyStats }, { merge: true });
        }

        return {
          totalDhikr,
          dailyDhikr: dailyStats[today].totalDhikr,
        };
      }

      return null;
    } catch (error) {
      console.error("Error syncing dhikr counts:", error);
      throw error;
    }
  },

  addFriend: async (userUid, friendUid) => {
    if (userUid === friendUid) {
      return;
    }

    const db = getFirestore(app);
    try {
      // Add friend to the user's 'friends' subcollection (requester adds receiver)
      const userFriendRef = doc(db, "users", userUid, "friends", friendUid);
      await setDoc(userFriendRef, {
        friendId: friendUid,
        addedAt: serverTimestamp(),
        status: "accepted",
      });

      // Add user to the friend's 'friends' subcollection (receiver adds requester)
      const friendUserRef = doc(db, "users", friendUid, "friends", userUid);
      await setDoc(friendUserRef, {
        friendId: userUid,
        addedAt: serverTimestamp(),
        status: "accepted",
      });
    } catch (error) {
      console.error("Error adding friend to Firestore:", error);
      throw error;
    }
  },

  deleteFriend: async (userUid, friendUid) => {
    const db = getFirestore(app);

    try {
      // Remove friend from the user's 'friends' subcollection
      const userFriendRef = doc(db, "users", userUid, "friends", friendUid);
      await deleteDoc(userFriendRef);

      // Remove user from the friend's 'friends' subcollection
      const friendUserRef = doc(db, "users", friendUid, "friends", userUid);
      await deleteDoc(friendUserRef);
    } catch (error) {
      console.error("Error deleting friend from Firestore:", error);
      throw error;
    }
  },

  handleDeleteAccount: async (uid) => {
    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;

    try {
      // Make sure user is authenticated and UID matches (additional security check)
      if (!user || user.uid !== uid) {
        throw new Error(
          "Authentication error: User not authenticated or UID mismatch"
        );
      }

      // Get user document reference
      const userRef = doc(db, "users", uid);

      // Delete user challenges
      try {
        const userChallengesRef = collection(
          db,
          "userChallenges",
          uid,
          "challenges"
        );
        const userChallengesSnapshot = await getDocs(userChallengesRef);
        const batch = writeBatch(db);

        userChallengesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        if (userChallengesSnapshot.size > 0) {
          await batch.commit();
        }
      } catch (error) {
        console.warn("Error deleting user challenges:", error);
        // Continue with deletion even if this fails
      }

      // Delete user subcollections (friends, notifications)
      const subcollections = ["friends", "notifications"];
      for (const subcollection of subcollections) {
        try {
          const subcollectionRef = collection(db, "users", uid, subcollection);
          const subcollectionSnapshot = await getDocs(subcollectionRef);

          if (subcollectionSnapshot.size > 0) {
            const batch = writeBatch(db);
            subcollectionSnapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });
            await batch.commit();
          }
        } catch (error) {
          console.warn(`Error deleting ${subcollection} subcollection:`, error);
          // Continue with deletion even if this fails
        }
      }

      // Delete user document from Firestore
      await deleteDoc(userRef);

      // Delete auth user
      await deleteUser(user);

      return { success: true };
    } catch (error) {
      console.error("Error deleting user account:", error);

      // Check if this is a requires-recent-login error
      if (error.code === "auth/requires-recent-login") {
        throw new Error("Please reauthenticate to delete your account.");
      }

      throw error;
    }
  },

  sendNotification: async (userId, senderName, senderPhotoURL) => {
    const db = getFirestore(app);
    try {
      await addDoc(collection(db, "users", userId, "notifications"), {
        body: `${senderName} has added you as a friend!`,
        url: "https://tasbeehchallenge.com/friends",
        timestamp: serverTimestamp(),
        read: false,
        photoURL: senderPhotoURL,
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  },

  sendLeaderboardNotification: async (userId, senderName, senderPhotoURL) => {
    const db = getFirestore(app);
    try {
      const body = `${senderName} took your place on the leaderboard!`;
      await addDoc(collection(db, "users", userId, "notifications"), {
        body,
        url: "https://tasbeehchallenge.com/leaderboard",
        timestamp: serverTimestamp(),
        read: false,
        photoURL: senderPhotoURL,
      });
    } catch (error) {
      console.error("Error adding leaderboard notification:", error);
    }
  },
};
