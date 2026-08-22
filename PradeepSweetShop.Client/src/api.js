import * as signalR from "@microsoft/signalr";

const API_BASE_URL = "https://localhost:7185/api";
const HUB_URL = "https://localhost:7185/hubs/orders";

// Helper for making API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, log out admin
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        if (window.location.hash.startsWith("#/admin")) {
          window.location.reload();
        }
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${response.status}`);
    }

    // For 204 No Content, return null or empty object
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Public API Endpoints
  getCategories: () => apiRequest("/categories"),
  getProducts: (categoryId = null, search = "") => {
    let query = "";
    if (categoryId) query += `?categoryId=${categoryId}`;
    if (search) query += `${query ? "&" : "?"}search=${encodeURIComponent(search)}`;
    return apiRequest(`/products${query}`);
  },
  getProduct: (id) => apiRequest(`/products/${id}`),
  placeOrder: (orderData) => apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData)
  }),
  trackOrder: (orderNumber) => apiRequest(`/orders/track/${orderNumber}`),

  // Auth Endpoints
  loginAdmin: (username, password) => apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  }),

  // Admin Category Endpoints
  getAdminCategories: () => apiRequest("/categories/admin"),
  createCategory: (catData) => apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(catData)
  }),
  updateCategory: (id, catData) => apiRequest(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(catData)
  }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, {
    method: "DELETE"
  }),

  // Admin Product Endpoints
  getAdminProducts: () => apiRequest("/products/admin"),
  createProduct: (prodData) => apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(prodData)
  }),
  updateProduct: (id, prodData) => apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(prodData)
  }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, {
    method: "DELETE"
  }),

  // Review Endpoints
  getProductReviews: (productId) => apiRequest(`/products/${productId}/reviews`),
  submitReview: (productId, reviewData) => apiRequest(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(reviewData)
  }),

  // Admin Review Endpoints
  getAdminReviews: () => apiRequest("/reviews/admin"),
  deleteReview: (id) => apiRequest(`/reviews/${id}`, {
    method: "DELETE"
  }),

  // Admin Order Endpoints
  getAdminOrders: (status = "") => {
    const query = status ? `?status=${status}` : "";
    return apiRequest(`/orders${query}`);
  },
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  })
};

// SignalR Service Helper
export function createHubConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => localStorage.getItem("admin_token") || ""
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();
}
