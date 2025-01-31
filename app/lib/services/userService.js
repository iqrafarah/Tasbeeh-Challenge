import {
    getFirestore, doc, getDoc, setDoc, serverTimestamp, increment
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
                totalPoints: 0,
                pointsToNextLevel: 5,
                totalDhikr: 0,
                ChallengesCompleted: 0,
                longestStreak: 0,
                contributions: {},
                settings: {
                    theme: "light", notifications: true, soundEnabled: true, vibrationEnabled: true,
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

    updateLastActive: async (uid) => {
        const db = getFirestore(app);
        try {
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                let lastActive = userData.lastActive ? userData.lastActive.toDate() : null;
                const today = new Date();

                if (lastActive) {
                    lastActive.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

                    let newStreak = userData.streak || 0;
                    if (daysDiff === 1) newStreak += 1; else if (daysDiff > 1) newStreak = 1;

                    const longestStreak = userData.longestStreak || 0;
                    const newLongestStreak = newStreak > longestStreak ? newStreak : longestStreak;

                    await setDoc(userRef, {
                        streak: newStreak,
                        longestStreak: newLongestStreak,
                        lastActive: serverTimestamp(),
                    }, {merge: true});
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
                let pointsToNextLevel = userData.pointsToNextLevel || 5;

                const growthFactor = 1.5;
                let hasLevelChanged = false;
                let newLevel = level;

                // Level up logic
                while (totalPoints >= pointsToNextLevel) {
                    newLevel += 1;
                    pointsToNextLevel = Math.round(5 * Math.pow(newLevel, growthFactor));
                    hasLevelChanged = true; // Level has changed
                }

                // If the level changed, update the level in Firestore
                if (hasLevelChanged) {
                    level = newLevel;
                }

                // Update contribution data
                const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
                const contributions = userData.contributions || {};
                contributions[today] = (contributions[today] || 0) + 1; // Increment today's contribution count

                await setDoc(
                    userRef,
                    {
                        totalPoints: totalPoints,
                        level: level,
                        pointsToNextLevel: pointsToNextLevel,
                        ChallengesCompleted: (userData.ChallengesCompleted || 0) + 1,
                        contributions: contributions, // Update contributions
                    },
                    { merge: true }
                );

                // Return an object containing level change status and the new level
                return { hasLevelChanged, newLevel };
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
            await setDoc(
                userRef,
                {totalDhikr: increment(1)},
                {merge: true}
            );
        } catch (error) {
            console.error("Error updating totalDhikr:", error);
            throw error;
        }
    },
};
