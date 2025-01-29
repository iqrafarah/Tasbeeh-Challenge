import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    increment
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
            await setDoc(doc(db, "users", userData.uid), userDoc, {merge: true});
        } catch (error) {
            console.error("Error saving user to Firestore:", error);
            throw error;
        }
    },

// Update last active timestamp and streak
    updateLastActive: async (uid) => {
        const db = getFirestore(app);
        try {
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Check if lastActive exists and is a valid Firestore timestamp
                let lastActive = userData.lastActive ? userData.lastActive.toDate() : null;
                const today = new Date();

                if (lastActive) {
                    // Reset time to compare only dates
                    lastActive.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    // Calculate the difference in days
                    const timeDiff = today - lastActive;
                    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                    let newStreak = userData.streak || 0;

                    if (daysDiff === 1) {
                        // User is active on consecutive days
                        newStreak += 1;
                    } else if (daysDiff > 1) {
                        // User missed a day, reset streak
                        newStreak = 1;
                    }

                    // Update Firestore with the new streak and last active date
                    await setDoc(
                        userRef,
                        {
                            streak: newStreak,
                            lastActive: serverTimestamp(), // Update the last active timestamp
                        },
                        { merge: true }
                    );
                } else {
                    // If lastActive doesn't exist, set the lastActive to today
                    await setDoc(
                        userRef,
                        {
                            lastActive: serverTimestamp(),
                        },
                        { merge: true }
                    );
                }
            }
        } catch (error) {
            console.error("Error updating last active and streak:", error);
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
            if (userDoc.exists()) {
                const userData = userDoc.data();
                await setDoc(
                    userRef,
                    {
                        ChallengesCompleted: (userData.ChallengesCompleted || 0) + 1,
                        levelPoints: (userData.levelPoints || 0) + points,
                    },
                    {merge: true}
                )
            }
        } catch (error) {
            console.error("Error updating user stats:", error);
            throw error;
        }
    },

    updateTotalDhikr: async (uid) => {
        const db = getFirestore(app);
        try {
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const currentDhikr = userDoc.data().totalDhikr || 0;
                console.log(`Current totalDhikr value: ${currentDhikr}`);
                await setDoc(
                    userRef,
                    {totalDhikr: increment(1)},
                    {merge: true}
                );
            }
        } catch (error) {
            console.error("Error updating totalDhikr:", error);
            throw error;
        }
    }
};
