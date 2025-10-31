import apiClient from "../api/client";

const orderService = {
  // Get all orders for current user
  getMyOrders: async (params = {}) => {
    const response = await apiClient.get("/orders/my-orders", { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await apiClient.post("/orders", orderData);
    return response.data;
  },

  // Update order status (Admin)
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    const response = await apiClient.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Get all orders (Admin)
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get("/orders", { params });
    return response.data;
  },

  // Get order statistics (Admin)
  getOrderStatistics: async (params = {}) => {
    const response = await apiClient.get("/orders/statistics", { params });
    return response.data;
  },

  // Track order
  trackOrder: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}/tracking`);
    return response.data;
  },
};

export default orderService;
