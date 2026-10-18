import { getAdminToken, clearAdminSession } from "./storage";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const HUB_URL = import.meta.env.VITE_HUB_URL || "/hubs/orders";

async function apiRequest(endpoint, options = {}) {
  const { includeTotal, ...requestOptions } = options;
  const token = getAdminToken();
  const headers = { ...options.headers };
  if (options.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions, headers, signal: options.signal || AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to reach the shop. Please check your connection and try again.", { cause: error });
  }
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAdminSession();
      window.dispatchEvent(new Event("admin-session-expired"));
    }
    const data = await response.json().catch(() => ({}));
    const validation = data.errors ? Object.values(data.errors).flat().join(" ") : "";
    const error = new Error(data.message || validation ||
      (response.status === 429 ? "Too many requests. Please wait a minute and try again." :
      response.status >= 500 ? "The shop could not complete this request. Please try again." : data.title || "Request failed."));
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  const items = await response.json();
  return includeTotal ? { items, total: Number(response.headers.get("X-Total-Count") || items.length) } : items;
}
const json = (method, data) => ({ method, body: JSON.stringify(data) });
export const api = {
  getCategories: () => apiRequest("/categories"),
  getShop: () => apiRequest("/shop"),
  getProducts: (categoryId = null, search = "", page = 1) => {
    const params = new URLSearchParams({ page, pageSize: 24 });
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("search", search);
    return apiRequest(`/products?${params}`, { includeTotal: true });
  },
  getProduct: id => apiRequest(`/products/${id}`),
  placeOrder: (data, key) => apiRequest("/orders", { ...json("POST", data), headers: { "Idempotency-Key": key } }),
  recoverOrder: key => apiRequest("/orders/receipt", { headers: { "X-Checkout-Key": key } }),
  trackOrder: (number, token) => apiRequest(`/orders/track/${encodeURIComponent(number)}`, {
    headers: { "X-Tracking-Token": token },
  }),
  loginAdmin: (username, password) => apiRequest("/auth/login", json("POST", { username, password })),
  changeAdminPassword: (currentPassword, newPassword) => apiRequest("/auth/password", json("PUT", { currentPassword, newPassword })),
  getAdminCategories: () => apiRequest("/categories/admin"),
  createCategory: data => apiRequest("/categories", json("POST", data)),
  updateCategory: (id, data) => apiRequest(`/categories/${id}`, json("PUT", data)),
  deleteCategory: id => apiRequest(`/categories/${id}`, { method: "DELETE" }),
  getAdminProducts: () => apiRequest("/products/admin"),
  createProduct: data => apiRequest("/products", json("POST", data)),
  updateProduct: (id, data) => apiRequest(`/products/${id}`, json("PUT", data)),
  deleteProduct: id => apiRequest(`/products/${id}`, { method: "DELETE" }),
  getProductReviews: (id, page = 1) => apiRequest(`/products/${id}/reviews?page=${page}&pageSize=10`, { includeTotal: true }),
  submitReview: (id, data) => apiRequest(`/products/${id}/reviews`, json("POST", data)),
  getAdminReviews: (page = 1) => apiRequest(`/reviews/admin?page=${page}&pageSize=20`, { includeTotal: true }),
  approveReview: (id, approved) => apiRequest(`/reviews/${id}/approval`, json("PUT", { isApproved: approved })),
  deleteReview: id => apiRequest(`/reviews/${id}`, { method: "DELETE" }),
  getAdminOrders: (status = "", page = 1) => apiRequest(`/orders?${new URLSearchParams({ status, page, pageSize: 50 })}`, { includeTotal: true }),
  getOrderSummary: () => apiRequest("/orders/summary"),
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, json("PUT", { status })),
};

export async function createHubConnection(admin = false) {
  const { HubConnectionBuilder } = await import("@microsoft/signalr");
  return new HubConnectionBuilder().withUrl(HUB_URL, {
    accessTokenFactory: () => admin ? getAdminToken() || "" : "",
  }).withAutomaticReconnect().build();
}
