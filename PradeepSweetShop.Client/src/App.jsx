import React, { useState, useEffect, useRef } from "react";
import { ThemeProvider, CssBaseline, Box, Snackbar, Alert } from "@mui/material";

import theme from "./theme";
import { api, createHubConnection } from "./api";

// Shared Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

// Customer Pages
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminPortal from "./pages/admin/AdminPortal";

export default function App() {
  // Navigation State: 'home' | 'shop' | 'checkout' | 'track' | 'admin-login' | 'admin'
  const [currentPage, setCurrentPage] = useState("home");

  // Shop & Category State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Order Tracking State
  const [trackingOrderNumber, setTrackingOrderNumber] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Admin Auth State
  const [adminUser, setAdminUser] = useState(
    JSON.parse(localStorage.getItem("admin_user")) || null
  );
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("admin_token") || null
  );

  // Admin View State
  const [adminActiveTab, setAdminActiveTab] = useState("dashboard");
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [orderFilter, setOrderFilter] = useState("");

  // Real-Time Notifications
  const [notifications, setNotifications] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);

  // SignalR References
  const hubConnectionRef = useRef(null);

  // ---- Initial Data Load ----
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ---- Admin: SignalR + Data Sync on Auth Change ----
  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
      setupSignalRAdmin();
    } else {
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
        hubConnectionRef.current = null;
      }
    }
    return () => {
      if (hubConnectionRef.current) hubConnectionRef.current.stop();
    };
  }, [adminToken]);

  // ---- Customer: SignalR Order Tracking ----
  useEffect(() => {
    let customerHubConn = null;
    if (currentPage === "track" && trackedOrder) {
      customerHubConn = createHubConnection();
      customerHubConn
        .start()
        .then(() => {
          console.log("Customer SignalR connected");
          customerHubConn.invoke("JoinOrderTracker", trackedOrder.orderNumber);
        })
        .catch((err) => console.error("Customer SignalR failed to start:", err));

      customerHubConn.on("OrderStatusUpdated", (update) => {
        setTrackedOrder((prev) => {
          if (prev && prev.orderNumber === update.orderNumber) {
            return { ...prev, orderStatus: update.status, paymentStatus: update.paymentStatus };
          }
          return prev;
        });
        showStatusAlert(`Order ${update.orderNumber} status updated to: ${update.status}`);
      });
    }

    return () => {
      if (customerHubConn) {
        if (trackedOrder) {
          customerHubConn.invoke("LeaveOrderTracker", trackedOrder.orderNumber).catch(() => { });
        }
        customerHubConn.stop();
      }
    };
  }, [currentPage, trackedOrder?.orderNumber]);

  // ---- Admin: Refetch Orders when Filter Changes ----
  useEffect(() => {
    if (adminToken) {
      api.getAdminOrders(orderFilter).then(setAdminOrders).catch(console.error);
    }
  }, [orderFilter]);

  // ---- Alert Helpers ----
  const showStatusAlert = (message) => {
    setActiveAlert(message);
    setAlertOpen(true);
  };

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  // ---- Data Fetch Helpers ----
  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchProducts = async (catId = null, search = "") => {
    setLoadingProducts(true);
    try {
      const data = await api.getProducts(catId, search);
      const mapped = data.map((p) => ({
        ...p,
        selectedVariant: p.prices && p.prices.length > 0 ? p.prices[0] : null,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const orders = await api.getAdminOrders(orderFilter);
      setAdminOrders(orders);
      const prods = await api.getAdminProducts();
      setAdminProducts(prods);
      const cats = await api.getAdminCategories();
      setAdminCategories(cats);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  // ---- SignalR Admin Setup ----
  const setupSignalRAdmin = () => {
    if (hubConnectionRef.current) return;

    const connection = createHubConnection();
    hubConnectionRef.current = connection;

    connection
      .start()
      .then(() => {
        console.log("Admin SignalR Connected");
        connection.invoke("JoinAdminDashboard");
      })
      .catch((err) => console.error("Admin SignalR Connection Failed:", err));

    connection.on("NewOrderReceived", (newOrder) => {
      setNotifications((prev) => [newOrder, ...prev]);
      showStatusAlert(`🔔 New Order Received! Order Ref: ${newOrder.orderNumber}`);
      setAdminOrders((prev) => [newOrder, ...prev]);
    });
  };

  // ---- Auth Handlers ----
  const handleAdminLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdminToken(null);
    setAdminUser(null);
    setCurrentPage("home");
  };

  // ---- Cart Handlers ----
  const handleAddToCart = (product) => {
    const variant = product.selectedVariant;
    if (!variant) return;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.variantId === variant.id
      );
      if (existing) {
        if (existing.quantity >= variant.stockQuantity) {
          alert(`Sorry, only ${variant.stockQuantity} units available in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            imageUrl: product.imageUrl,
            variantId: variant.id,
            unit: variant.unit,
            price: variant.price,
            quantity: 1,
            maxStock: variant.stockQuantity,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId, variantId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) {
              alert(`Only ${item.maxStock} units available.`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const getCartTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ---- Shop Handlers ----
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    fetchProducts(catId, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(selectedCategory, searchQuery);
  };

  // ---- Order Track Handler ----
  const handleTrackSubmit = async (e, directNumber = "") => {
    if (e) e.preventDefault();
    const num = directNumber || trackingOrderNumber;
    if (!num) return;
    setTrackingLoading(true);
    try {
      const order = await api.trackOrder(num);
      setTrackedOrder(order);
      setCurrentPage("track");
    } catch (err) {
      alert("Order not found. Please verify the order number.");
      setTrackedOrder(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Live Status Alert Snackbar */}
        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={handleAlertClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleAlertClose}
            severity="info"
            variant="filled"
            sx={{ width: "100%", borderRadius: 2 }}
          >
            {activeAlert}
          </Alert>
        </Snackbar>

        {/* Top Navigation Bar */}
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cart={cart}
          setIsCartOpen={setIsCartOpen}
          fetchProducts={fetchProducts}
          adminToken={adminToken}
        />

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, py: currentPage === "home" ? 0 : 4 }}>
          {currentPage === "home" && (
            <HomePage
              setCurrentPage={setCurrentPage}
              categories={categories}
              handleCategorySelect={handleCategorySelect}
              products={products}
              handleAddToCart={handleAddToCart}
            />
          )}

          {currentPage === "shop" && (
            <ShopPage
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              handleCategorySelect={handleCategorySelect}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearchSubmit={handleSearchSubmit}
              loadingProducts={loadingProducts}
              setProducts={setProducts}
              handleAddToCart={handleAddToCart}
            />
          )}

          {currentPage === "checkout" && (
            <CheckoutPage
              cart={cart}
              setCart={setCart}
              getCartTotal={getCartTotal}
              setCurrentPage={setCurrentPage}
              setTrackedOrder={setTrackedOrder}
            />
          )}

          {currentPage === "track" && (
            <OrderTrackingPage
              trackedOrder={trackedOrder}
              setTrackedOrder={setTrackedOrder}
              trackingOrderNumber={trackingOrderNumber}
              setTrackingOrderNumber={setTrackingOrderNumber}
              handleTrackSubmit={handleTrackSubmit}
              trackingLoading={trackingLoading}
            />
          )}

          {currentPage === "admin-login" && (
            <AdminLoginPage
              setAdminUser={setAdminUser}
              setAdminToken={setAdminToken}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === "admin" && (
            <AdminPortal
              adminUser={adminUser}
              handleAdminLogout={handleAdminLogout}
              adminActiveTab={adminActiveTab}
              setAdminActiveTab={setAdminActiveTab}
              adminOrders={adminOrders}
              adminProducts={adminProducts}
              adminCategories={adminCategories}
              fetchAdminData={fetchAdminData}
              notifications={notifications}
              setNotifications={setNotifications}
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
            />
          )}
        </Box>

        {/* Footer */}
        <Footer setCurrentPage={setCurrentPage} />

        {/* Cart Slide-Out Drawer */}
        <CartDrawer
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cart={cart}
          handleUpdateCartQty={handleUpdateCartQty}
          getCartTotal={getCartTotal}
          setCurrentPage={setCurrentPage}
        />

      </Box>
    </ThemeProvider>
  );
}
