import axios from "axios";
import crypto from "crypto";
import ApiResponse from "../utils/ApiResponse.js";

const createPaymentOrder = async (email, amount) => {
  try {
    const timestamp = Date.now();
    const payload = new URLSearchParams({
      timestamp,
      totalAmount: amount, // Use amount from frontend
      currency: "USDT",
      merchantTradeNo: `REG_${timestamp}`,
      goodsName: "User Registration",
      goodsDetail: email,
      returnUrl: `${process.env.FRONTEND_URL}/registration/return`,
      cancelUrl: `${process.env.FRONTEND_URL}/registration/cancel`,
    }).toString();

    const signature = crypto
      .createHmac("sha256", process.env.BINANCE_SECRET_KEY)
      .update(payload)
      .digest("hex");

    const response = await axios.post(
      `${process.env.BINANCE_BASE_URL}/sapi/v1/payment/order`,
      payload,
      {
        headers: {
          "X-MBX-APIKEY": process.env.BINANCE_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: { signature },
      }
    );

    return response.data;
  } catch (error) {
    throw new ApiResponse(
      error.response?.status || 500,
      null,
      error.response?.data?.message || "Payment processing failed"
    );
  }
};

const verifyPayment = async (paymentId) => {
  try {
    const timestamp = Date.now();
    const payload = new URLSearchParams({
      timestamp,
      paymentId,
    }).toString();

    const signature = crypto
      .createHmac("sha256", process.env.BINANCE_SECRET_KEY)
      .update(payload)
      .digest("hex");

    const response = await axios.get(
      `${process.env.BINANCE_BASE_URL}/sapi/v1/payment/query`,
      {
        headers: { "X-MBX-APIKEY": process.env.BINANCE_API_KEY },
        params: { ...payload, signature },
      }
    );

    return response.data.status === "SUCCESS";
  } catch (error) {
    throw new ApiResponse(
      error.response?.status || 500,
      null,
      error.response?.data?.message || "Payment verification failed"
    );
  }
};

export { createPaymentOrder, verifyPayment };
