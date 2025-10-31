import apiClient from "../api/client";

const categoryService = {
  // Get all categories
  getAllCategories: async (params = {}) => {
    const response = await apiClient.get("/categories", { params });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Create category (Admin)
  createCategory: async (categoryData) => {
    const response = await apiClient.post("/categories", categoryData);
    return response.data;
  },

  // Update category (Admin)
  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (Admin)
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
