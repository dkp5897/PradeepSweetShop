import { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore, lazy, Suspense } from "react";
import { ThemeProvider, CssBaseline, Box, Snackbar, Alert, Button, CircularProgress } from "@mui/material";
import getTheme from "./theme";
import { ThemeModeProvider } from "./context/ThemeContext";
import { useThemeMode } from "./context/themeMode";
import { api, createHubConnection } from "./api";
import { readStored, writeStored, getAdminToken, clearAdminSession } from "./storage";
import { validCart, privateTrackingCode, parseTrackingCode } from "./checkout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./pages/HomePage";
const ShopPage = lazy(() => import("./pages/ShopPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminPortal = lazy(() => import("./pages/admin/AdminPortal"));

const PAGES = new Set(["home", "shop", "checkout", "track", "admin-login", "admin"]);
const route = () => {
  const page = window.location.hash.slice(2).split("?")[0];
  return PAGES.has(page) ? page : "home";
};
const subscribeRoute = listener => {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
};
function readReceipt() {
  const value = readStored("last_order", null, true);
  return value && parseTrackingCode(privateTrackingCode(value)) && Array.isArray(value.orderItems) ? value : null;
}

function AppContent() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);
  const currentPage = useSyncExternalStore(subscribeRoute, route);
  const setCurrentPage = useCallback(page => { window.location.hash = "/" + page; }, []);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shop, setShop] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const catalogRequest = useRef(0);
  const catalogCriteria = useRef({ category: null, search: "" });
  const [cart, setCart] = useState(() => validCart(readStored("sweet_cart", [])));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(readReceipt);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState(() => privateTrackingCode(readReceipt()));
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [trackingConnection, setTrackingConnection] = useState("offline");
  const [adminUser, setAdminUser] = useState(() => readStored("admin_user", null, true));
  const [adminToken, setAdminToken] = useState(getAdminToken);
  const [adminActiveTab, setAdminActiveTab] = useState("dashboard");
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [orderSummary, setOrderSummary] = useState({ pending: 0, preparing: 0, revenue: 0, products: 0 });
  const [orderFilter, updateOrderFilter] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const adminRequest = useRef(0);

  const showStatusAlert = useCallback(message => { setActiveAlert(message); setAlertOpen(true); }, []);
  const handleAlertClose = (event, reason) => { if (reason !== "clickaway") setAlertOpen(false); };
  const handleAdminLogout = useCallback(() => {
    clearAdminSession();
    setAdminToken(null); setAdminUser(null); setNotifications([]);
    setAdminOrders([]); setAdminProducts([]); setAdminCategories([]);
    setCurrentPage("home");
  }, [setCurrentPage]);
  const setOrderFilter = value => { updateOrderFilter(value); setOrderPage(1); };

  const fetchProducts = useCallback((catId = null, search = "", page = 1) => {
    const request = ++catalogRequest.current;
    catalogCriteria.current = { category: catId, search };
    return api.getProducts(catId, search, page).then(data => {
      if (request !== catalogRequest.current) return;
      setCatalogError(""); setCatalogPage(page);
      setCatalogTotal(data.total);
      setProducts(data.items.map(p => ({ ...p,
        selectedVariant: p.prices?.find(v => v.isAvailable && v.stockQuantity > 0) || null,
      })));
    }).catch(error => {
      if (request === catalogRequest.current) { setProducts([]); setCatalogError(error.message); }
    }).finally(() => {
      if (request === catalogRequest.current) setLoadingProducts(false);
    });
  }, []);

  const fetchCategories = useCallback(() => {
    return api.getCategories().then(setCategories).catch(error => setCatalogError(error.message));
  }, []);
  const fetchShop = useCallback(() => api.getShop().then(setShop).catch(error => setCatalogError(error.message)), []);

  const fetchAdminData = useCallback(() => {
    const request = ++adminRequest.current;
    return Promise.all([
        api.getAdminOrders(orderFilter, orderPage), api.getAdminProducts(), api.getAdminCategories(), api.getOrderSummary(),
      ]).then(([orders, prods, cats, summary]) => {
      if (request !== adminRequest.current || !getAdminToken()) return;
      setAdminOrders(orders.items); setOrderTotal(orders.total);
      setAdminProducts(prods); setAdminCategories(cats);
      setOrderSummary(summary);
      }).catch(error => showStatusAlert(error.message));
  }, [orderFilter, orderPage, showStatusAlert]);

  useEffect(() => { fetchCategories(); fetchProducts(); fetchShop(); }, [fetchCategories, fetchProducts, fetchShop]);
  useEffect(() => { writeStored("sweet_cart", cart); }, [cart]);
  useEffect(() => { writeStored("last_order", trackedOrder, true); }, [trackedOrder]);
  useEffect(() => {
    window.addEventListener("admin-session-expired", handleAdminLogout);
    return () => window.removeEventListener("admin-session-expired", handleAdminLogout);
  }, [handleAdminLogout]);
  useEffect(() => { if (adminToken) fetchAdminData(); }, [adminToken, fetchAdminData]);

  useEffect(() => {
    if (!adminToken) return;
    let connection, disposed = false;
    async function connect() {
      connection = await createHubConnection(true);
      if (disposed) return;
      const join = async () => {
        await connection.invoke("JoinAdminDashboard");
        await fetchAdminData();
      };
      connection.onreconnected(join);
      connection.on("NewOrderReceived", order => {
        setNotifications(prev => [order, ...prev].slice(0, 50));
        showStatusAlert(`New order received: ${order.orderNumber}`);
        fetchAdminData();
      });
      await connection.start();
      if (disposed) { await connection.stop(); return; }
      await join();
    }
    connect().catch(error => { if (!disposed) showStatusAlert("Live alerts are unavailable. Refresh orders to check for new orders. " + error.message); });
    return () => { disposed = true; connection?.stop().catch(() => {}); };
  }, [adminToken, fetchAdminData, showStatusAlert]);

  const trackedNumber = trackedOrder?.orderNumber;
  const trackedToken = trackedOrder?.trackingToken;
  useEffect(() => {
    if (currentPage !== "track" || !trackedNumber || !trackedToken) return;
    let connection, disposed = false;
    async function connect() {
      setTrackingConnection("connecting");
      connection = await createHubConnection();
      if (disposed) return;
      const sync = async () => {
        await connection.invoke("JoinOrderTracker", trackedNumber, trackedToken);
        const latest = await api.trackOrder(trackedNumber, trackedToken);
        if (!disposed) { setTrackedOrder(latest); setTrackingConnection("live"); }
      };
      connection.onreconnecting(() => { if (!disposed) setTrackingConnection("reconnecting"); });
      connection.onclose(() => { if (!disposed) setTrackingConnection("offline"); });
      connection.onreconnected(() => sync().catch(() => { if (!disposed) setTrackingConnection("offline"); }));
      connection.on("OrderStatusUpdated", update => {
        if (disposed) return;
        setTrackedOrder(prev => prev?.orderNumber === update.orderNumber
          ? { ...prev, orderStatus: update.status, paymentStatus: update.paymentStatus } : prev);
      });
      await connection.start();
      if (disposed) { await connection.stop(); return; }
      await sync();
    }
    connect().catch(() => { if (!disposed) setTrackingConnection("offline"); });
    return () => { disposed = true; connection?.stop().catch(() => {}); };
  }, [currentPage, trackedNumber, trackedToken]);

  const handleAddToCart = product => {
    const variant = product.selectedVariant;
    if (!variant || !variant.isAvailable || variant.stockQuantity <= 0) return;
    const existing = cart.find(i => i.productId === product.id && i.variantId === variant.id);
    if (existing && existing.quantity >= Math.min(variant.stockQuantity, 100)) {
      showStatusAlert(`Only ${Math.min(variant.stockQuantity, 100)} units can be ordered.`); return;
    }
    setCart(prev => existing
      ? prev.map(i => i.productId === product.id && i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...prev, { productId: product.id, productName: product.name, imageUrl: product.imageUrl,
        variantId: variant.id, unit: variant.unit, price: variant.price, quantity: 1, maxStock: variant.stockQuantity }]);
    showStatusAlert(`${product.name} (${variant.unit}) added to your cart.`);
  };
  const handleUpdateCartQty = (productId, variantId, delta) => {
    const item = cart.find(i => i.productId === productId && i.variantId === variantId);
    if (item && item.quantity + delta > Math.min(item.maxStock, 100)) {
      showStatusAlert(`Only ${Math.min(item.maxStock, 100)} units can be ordered.`); return;
    }
    setCart(prev => prev.map(i => i.productId === productId && i.variantId === variantId
      ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };
  const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const startCatalogLoad = (category = null, search = "", page = 1) => { setLoadingProducts(true); setCatalogError(""); return fetchProducts(category, search, page); };
  const handleCategorySelect = catId => { setSelectedCategory(catId); startCatalogLoad(catId, searchQuery); };
  const handleSearchSubmit = event => { event.preventDefault(); startCatalogLoad(selectedCategory, searchQuery); };
  const handleVariantChange = (id, variant) => setProducts(prev => prev.map(p =>
    p.id === id ? { ...p, selectedVariant: variant } : p));
  const handleTrackSubmit = async event => {
    event?.preventDefault();
    const receipt = parseTrackingCode(trackingOrderNumber);
    if (!receipt) { setTrackingError("Enter the complete private tracking code from your order confirmation."); return; }
    setTrackingLoading(true); setTrackingError("");
    try {
      setTrackedOrder(await api.trackOrder(receipt.orderNumber, receipt.token));
      setCurrentPage("track");
    } catch (error) { setTrackingError(error.message); setTrackedOrder(null); }
    finally { setTrackingLoading(false); }
  };


  const isAdmin = currentPage === "admin" || currentPage === "admin-login";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>

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
        {!isAdmin && (
          <Navbar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            cart={cart}
            setIsCartOpen={setIsCartOpen}
            fetchProducts={() => { setSelectedCategory(null); setSearchQuery(""); startCatalogLoad(); }}
            adminToken={adminToken}
          />
        )}

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, py: currentPage === "home" || isAdmin ? 0 : 4 }}>
          {catalogError && !isAdmin && <Alert severity="error" sx={{ m: 2 }} action={<Button color="inherit" onClick={() => { fetchShop(); fetchCategories(); startCatalogLoad(catalogCriteria.current.category, catalogCriteria.current.search, catalogPage); }}>Retry</Button>}>{catalogError}</Alert>}
          <Suspense fallback={<Box sx={{ p: 6, textAlign: "center" }}><CircularProgress aria-label="Loading page" /></Box>}>
          {currentPage === "home" && (
            <HomePage
              setCurrentPage={setCurrentPage}
              categories={categories}
              handleCategorySelect={handleCategorySelect}
              products={products}
              handleAddToCart={handleAddToCart}
              onVariantChange={handleVariantChange}
              loadingProducts={loadingProducts}
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
              catalogPage={catalogPage}
              catalogTotal={catalogTotal}
              onPageChange={page => startCatalogLoad(catalogCriteria.current.category, catalogCriteria.current.search, page)}
              clearFilters={() => { setSearchQuery(""); setSelectedCategory(null); startCatalogLoad(); }}
              handleAddToCart={handleAddToCart}
            />
          )}

          {currentPage === "checkout" && (
            <CheckoutPage
              shop={shop}
              onNotice={showStatusAlert}
              cart={cart}
              setCart={setCart}
              getCartTotal={getCartTotal}
              setCurrentPage={setCurrentPage}
              setTrackedOrder={setTrackedOrder}
              handleUpdateCartQty={handleUpdateCartQty}
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
              trackingError={trackingError}
              connectionStatus={trackingConnection}
            />
          )}

          {(currentPage === "admin-login" || (currentPage === "admin" && !adminToken)) && (
            <AdminLoginPage
              setAdminUser={setAdminUser}
              setAdminToken={setAdminToken}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === "admin" && adminToken && (
            <AdminPortal
              onNotice={showStatusAlert}
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
              orderPage={orderPage}
              setOrderPage={setOrderPage}
              orderTotal={orderTotal}
              orderSummary={orderSummary}
              setOrderFilter={setOrderFilter}
              setCurrentPage={setCurrentPage}
            />
          )}
          </Suspense>
        </Box>

        {/* Footer */}
        {!isAdmin && <Footer setCurrentPage={setCurrentPage} shop={shop} />}

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

export default function App() {
  return (
    <ThemeModeProvider>
      <AppContent />
    </ThemeModeProvider>
  );
}
