# 🍮 Pradeep Sweets House — E-Commerce Application

A full-stack e-commerce web application for **Pradeep Sweets House**, featuring a customer sweet shop, real-time order tracking, customer ratings & reviews, a modern admin management dashboard, and global Day/Night (Light/Dark) mode.

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Sweet Catalog**: Browse fresh sweets, traditional savories, and dry fruit items with real-time text search and category filter chips.
- **Multi-Variant Unit Pricing**: Flexible pricing per sweet item (e.g., 250g, 500g, 1 Kg, or per Box/Piece).
- **Cart Management**: Add items with preferred units and quantities, update amounts, or remove items seamlessly.
- **Cash on Delivery (COD) Checkout**: Simple, frictionless checkout with delivery address and special order instructions.
- **Real-Time Order Tracking**: Live 5-stage order status tracker (*Pending → Confirmed → Preparing → Out For Delivery → Delivered*), updated in real-time without refreshing.
- **Ratings & Reviews System**: Customer star ratings (1–5 stars) and reviews per sweet item, automatically calculating average ratings.

### 🛡️ Administrative Portal
- **Secure JWT Authentication**: Role-based authentication (`Admin`) protecting admin endpoints and dashboard views.
- **Operational Overview Dashboard**: Key performance metrics (Pending Orders, Preparing, Delivered Sales Revenue, Catalog Count) with gradient cards and live pulsing status.
- **SignalR Real-Time Notifications**: Instant WebSocket order alert notifications received live as customers place orders.
- **Order Management & Processing**: Filter orders by status state and transition orders through their fulfillment lifecycle.
- **Sweets & Pricing Unit CRUD**: Add, edit, or remove sweet products with dynamic addition, editing, and deletion of unit price variants (e.g., unit name, price, stock quantity).
- **Category Management**: Define and manage sweet categories.
- **Review Moderation**: Inspect and moderate customer reviews.

### 🌗 Modern UI & Day/Night Mode
- **Global Light/Dark Theme**: Toggle between warm amber/cream light mode and dark theme with persistent user preference in `localStorage`.
- **Modern Aesthetic**: Glassmorphism elements, subtle micro-animations, gradient overlays, and custom typography.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile screens.

---

## 🛠️ Technology Stack

### Backend (.NET Web API)
- **Framework**: ASP.NET Core (.NET 10)
- **Database**: SQL Server via Entity Framework Core (EF Core 10)
- **Real-Time Communication**: SignalR WebSockets (`OrderHub`)
- **Authentication**: JWT Bearer Tokens & Password Hashing
- **API Documentation**: OpenAPI / Scalar API Explorer

### Frontend (React Single Page Application)
- **Library**: React 19
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI v9) & `@mui/icons-material`
- **Styling**: Vanilla CSS & MUI Emotion Theme System
- **WebSockets**: `@microsoft/signalr` client

---

## 📁 Project Structure

```
PradeepSweetShop/
├── PradeepSweetShop.Api/           # ASP.NET Core Web API Backend
│   ├── Controllers/               # API Controllers (Products, Orders, Categories, Reviews, AdminAuth)
│   ├── Data/                      # ApplicationDbContext & DbInitializer (Seed Data)
│   ├── DTOs/                      # Data Transfer Objects
│   ├── Hubs/                      # SignalR OrderHub for WebSockets
│   ├── Models/                    # EF Core Entities (Product, ProductPrice, Category, Order, OrderItem, ProductReview, AdminUser)
│   ├── Program.cs                 # API Startup Configuration & Middleware
│   └── appsettings.json           # Database Connection Strings & JWT Settings
│
└── PradeepSweetShop.Client/        # React 19 Frontend Client
    ├── src/
    │   ├── assets/                # Static assets & images
    │   ├── components/            # Shared UI Components (Navbar, Footer, CartDrawer, ProductCard, ReviewModal)
    │   ├── context/               # ThemeContext (Light/Dark Mode Provider)
    │   ├── pages/                 # Customer Pages (HomePage, ShopPage, CheckoutPage, OrderTrackingPage)
    │   │   └── admin/             # Admin Portal Pages & Tabs (AdminPortal, AdminDashboardTab, AdminOrdersTab, etc.)
    │   ├── api.js                 # Centralized API service & SignalR hub factory
    │   ├── theme.js               # MUI Dual-Mode Theme Configuration
    │   ├── App.jsx                # Core App Component & Navigation Router
    │   └── main.jsx               # Client Entry Point
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v18+)](https://nodejs.org/) & [Yarn](https://yarnpkg.com/) or npm
- [SQL Server](https://www.microsoft.com/en-us/sql-server/) (LocalDB or SQL Express / Developer Instance)

---

### 1. Backend Setup (API)

1. Navigate to the API folder:
   ```bash
   cd PradeepSweetShop.Api
   ```

2. Configure database connection string in `appsettings.json` (if needed):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=PradeepSweetShopDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
   }
   ```

3. Apply Database Migrations and seed default data:
   ```bash
   dotnet ef database update
   ```

4. Run the backend API:
   ```bash
   dotnet run
   ```
   *The API will start at `https://localhost:7084` or `http://localhost:5222`.*

---

### 2. Frontend Setup (Client)

1. Navigate to the client folder:
   ```bash
   cd PradeepSweetShop.Client
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   yarn start
   # or
   npm run dev
   ```
   *The React app will launch at `http://localhost:5173`.*

---

## 🔑 Default Admin Credentials

Upon initial database migration & seeding, a default administrator account is created:

- **Username**: `admin`
- **Password**: `adminpassword123`

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get active sweet categories | Public |
| `GET` | `/api/products` | Get sweets catalog with category & search filter | Public |
| `POST` | `/api/orders` | Place a customer order (COD) | Public |
| `GET` | `/api/orders/track/{orderNumber}` | Track order status by order reference | Public |
| `POST` | `/api/reviews` | Submit product review & star rating | Public |
| `POST` | `/api/adminauth/login` | Authenticate admin user & receive JWT | Public |
| `GET` | `/api/products/admin` | Get all sweets catalog for administration | Admin |
| `POST` | `/api/products` | Create a new sweet product with pricing units | Admin |
| `PUT` | `/api/products/{id}` | Update product & unit pricing variants | Admin |
| `DELETE` | `/api/products/{id}` | Delete sweet product | Admin |
| `GET` | `/api/orders/admin` | Get all orders with status filter | Admin |
| `PUT` | `/api/orders/{id}/status` | Update order status state | Admin |
| `DELETE` | `/api/reviews/{id}` | Moderation delete customer review | Admin |

---

## 📝 License

This project is open-source and available for educational and commercial customization.
