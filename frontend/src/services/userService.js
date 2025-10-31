import apiClient from "../api/client";

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get("/users/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put("/users/profile", profileData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await apiClient.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get user addresses
  getAddresses: async () => {
    const response = await apiClient.get("/users/addresses");
    return response.data;
  },

  // Add address
  addAddress: async (addressData) => {
    const response = await apiClient.post("/users/addresses", addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (id, addressData) => {
    const response = await apiClient.put(`/users/addresses/${id}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id) => {
    const response = await apiClient.delete(`/users/addresses/${id}`);
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (id) => {
    const response = await apiClient.patch(`/users/addresses/${id}/default`);
    return response.data;
  },

  // Get all users (Admin)
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  // Get user by ID (Admin)
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin)
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin)
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
