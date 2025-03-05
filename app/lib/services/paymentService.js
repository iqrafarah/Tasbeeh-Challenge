import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const API_BASE_URL = "https://api.lemonsqueezy.com/v1";
const API_KEY = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_API_KEY;

export const paymentService = {
  createSubscription: async (customerEmail, planId, trialDays = 7) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions`,
        {
          data: {
            type: "subscriptions",
            attributes: {
              customer_email: customerEmail,
              plan_id: planId,
              trial_days: trialDays,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error creating subscription:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  getSubscription: async (subscriptionId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching subscription:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error cancelling subscription:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
};
