import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import app from "../firebase.config";

export const subscriptionService = {
  /**
   * Update a user's subscription status to lifetime
   * @param {string} userId - The user's ID
   * @returns {Promise<void>}
   */
  updateToLifetime: async (userId) => {
    const db = getFirestore(app);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        subscription: {
          status: "lifetime",
          updatedAt: serverTimestamp(),
        },
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  },

  /**
   * Create a webhook handler for Lemon Squeezy events
   * This should be implemented as an API route
   */
  handleWebhook: async (req, res) => {
    const db = getFirestore(app);
    const { event, data } = req.body;

    try {
      const userId = data.meta.custom_data.user_id;

      if (event === "order.created") {
        await subscriptionService.updateToLifetime(userId);
      }

      res.status(200).send("Webhook handled successfully");
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).send("Error handling webhook");
    }
  },
};
