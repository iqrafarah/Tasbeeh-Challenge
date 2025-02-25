import { getFirestore, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import app from "../firebase.config";

export const subscriptionService = {
    /**
     * Check if a user's trial has expired
     * @param {string} userId - The user's ID
     * @returns {Promise<boolean>} - Whether the trial has expired
     */
    checkTrialStatus: async (userId) => {
        const db = getFirestore(app);
        try {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
                return false;
            }
            
            const userData = userDoc.data();
            
            // If the user doesn't have subscription data or is already on a paid plan
            if (!userData.subscription || 
                userData.subscription.status === "monthly" || 
                userData.subscription.status === "lifetime") {
                return false;
            }
            
            // Check if trial has expired
            if (userData.subscription.status === "trial") {
                const trialEndDate = userData.subscription.trialEndDate instanceof Date 
                    ? userData.subscription.trialEndDate 
                    : userData.subscription.trialEndDate.toDate();
                    
                if (new Date() > trialEndDate) {
                    // Trial expired, update to free plan
                    await updateDoc(userRef, {
                        'subscription.status': 'free',
                        'subscription.updatedAt': serverTimestamp()
                    });
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error("Error checking trial status:", error);
            return false;
        }
    },
    
    /**
     * Update a user's subscription status
     * @param {string} userId - The user's ID
     * @param {object} subscriptionData - The subscription data
     * @returns {Promise<void>}
     */
    updateSubscription: async (userId, subscriptionData) => {
        const db = getFirestore(app);
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                'subscription': {
                    ...subscriptionData,
                    updatedAt: serverTimestamp()
                }
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

            switch (event) {
                case 'subscription.created':
                    await subscriptionService.updateSubscription(userId, {
                        status: 'monthly',
                        subscriptionId: data.id,
                        orderId: data.attributes.order_id,
                        planType: 'monthly'
                    });
                    break;
                case 'subscription.updated':
                    await subscriptionService.updateSubscription(userId, {
                        status: data.attributes.status,
                        subscriptionId: data.id,
                        orderId: data.attributes.order_id,
                        planType: data.attributes.plan_type
                    });
                    break;
                case 'subscription.cancelled':
                    await subscriptionService.updateSubscription(userId, {
                        status: 'free',
                        subscriptionId: null,
                        orderId: null,
                        planType: null
                    });
                    break;
                case 'order.created':
                    await subscriptionService.updateSubscription(userId, {
                        status: 'lifetime',
                        subscriptionId: data.id,
                        orderId: data.attributes.order_id,
                        planType: 'lifetime'
                    });
                    break;
                default:
            }

            res.status(200).send('Webhook handled successfully');
        } catch (error) {
            console.error("Error handling webhook:", error);
            res.status(500).send('Error handling webhook');
        }
    }
};