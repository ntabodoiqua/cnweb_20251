import apiClient from "../api/client";

const productService = {
  // Get all products with filters and pagination
  getProducts: async (params = {}) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const response = await apiClient.get("/products/search", {
      params: { q: query, ...params },
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await apiClient.get(`/products/category/${categoryId}`, {
      params,
    });
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await apiClient.get("/products/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    const response = await apiClient.get(`/products/${productId}/related`, {
      params: { limit },
    });
    return response.data;
  },

  // Create product (Admin)
  createProduct: async (productData) => {
    const response = await apiClient.post("/products", productData);
    return response.data;
  },

  // Update product (Admin)
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // Upload product image
  uploadProductImage: async (id, formData) => {
    const response = await apiClient.post(`/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete product image
  deleteProductImage: async (productId, imageId) => {
    const response = await apiClient.delete(
      `/products/${productId}/images/${imageId}`
    );
    return response.data;
  },

  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    const response = await apiClient.get(`/products/${productId}/reviews`, {
      params,
    });
    return response.data;
  },

  // Add product review
  addProductReview: async (productId, reviewData) => {
    const response = await apiClient.post(
      `/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  },
};

export default productService;
