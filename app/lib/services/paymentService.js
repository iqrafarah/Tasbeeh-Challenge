import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const API_BASE_URL = "https://api.lemonsqueezy.com/v1";
const API_KEY = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_API_KEY;

export const paymentService = {
  createOrder: async (customerEmail, productId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/orders`,
        {
          data: {
            type: "orders",
            attributes: {
              customer_email: customerEmail,
              product_id: productId,
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
        "Error creating order:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  getOrder: async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching order:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
};
