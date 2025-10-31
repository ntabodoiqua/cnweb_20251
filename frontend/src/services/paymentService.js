import apiClient from "../api/client";

const paymentService = {
  // Create payment
  createPayment: async (paymentData) => {
    const response = await apiClient.post("/payments", paymentData);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  // Get payment by order ID
  getPaymentByOrderId: async (orderId) => {
    const response = await apiClient.get(`/payments/order/${orderId}`);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentId, verificationData) => {
    const response = await apiClient.post(
      `/payments/${paymentId}/verify`,
      verificationData
    );
    return response.data;
  },

  // Process refund (Admin)
  processRefund: async (paymentId, refundData) => {
    const response = await apiClient.post(
      `/payments/${paymentId}/refund`,
      refundData
    );
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await apiClient.get("/payments/methods");
    return response.data;
  },
};

export default paymentService;
