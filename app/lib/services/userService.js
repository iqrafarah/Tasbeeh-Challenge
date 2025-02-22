import {
    getFirestore, doc, getDoc, getDocs, collection, writeBatch, setDoc, addDoc, deleteDoc, serverTimestamp, increment
} from "firebase/firestore";
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
                await setDoc(userRef, {
                    email: userData.email,
                    displayName: userData.displayName,
                    photoURL: userData.photoURL,
                    lastActive: serverTimestamp(),
                }, { merge: true });
            } else {
                // User does not exist, create a new user document
                const newUserDoc = {
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
                await setDoc(userRef, newUserDoc, { merge: true });
            }
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
                    }, { merge: true });

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
                { totalDhikr: increment(1) },
                { merge: true }
            );
        } catch (error) {
            console.error("Error updating totalDhikr:", error);
            throw error;
        }
    },

    addFriend: async (userUid, friendUid) => {
        if (userUid === friendUid) {
            return
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
        try {
            const userRef = doc(db, "users", uid);
            await deleteDoc(userRef);

            // Delete all related subcollections like friends and notifications
            const friendsSnapshot = await getDocs(collection(db, "users", uid, "friends"));
            const notificationsSnapshot = await getDocs(collection(db, "users", uid, "notifications"));

            const batch = writeBatch(db);
            friendsSnapshot.forEach((doc) => batch.delete(doc.ref));
            notificationsSnapshot.forEach((doc) => batch.delete(doc.ref));

            await batch.commit();
        } catch (error) {
            console.error("Error deleting user account:", error);
            throw error;
        }
    },

    sendNotification: async (userId, senderName, senderPhotoURL) => {
        console.log("Sending notification to:", userId, "from:", senderName, "photoURL:", senderPhotoURL);
        const db = getFirestore(app);
        try {
            await addDoc(collection(db, "users", userId, "notifications"), {
                body: `${senderName} has added you as a friend!`,
                url: "https://tasbeehchallenge.com/friends",
                timestamp: serverTimestamp(),
                read: false,
                photoURL: senderPhotoURL
            });
            console.log("Notification added successfully!");
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    },
   
    sendLeaderboardNotification: async (userId, senderName, senderPhotoURL, previousRank, newRank) => {
        const db = getFirestore(app);
        try {
           const body = `${senderName} took your place on the leaderboard!`;	
            await addDoc(collection(db, "users", userId, "notifications"), {
                body,
                url: "https://tasbeehchallenge.com/leaderboard",
                timestamp: serverTimestamp(),
                read: false,
                photoURL: senderPhotoURL
            });
            console.log("Leaderboard notification added successfully!");
        } catch (error) {
            console.error("Error adding leaderboard notification:", error);
        }
    },
};
