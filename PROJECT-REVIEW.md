# Sweet shop project review — 15 October 2026

## Running locally

- Frontend: http://localhost:5174/
- API: https://localhost:7185/
- Both started successfully outside the restricted sandbox. The sandbox prevented access to SQL Server, local sockets, and the development certificate.

## Checks completed

- Frontend production build passed. Main JavaScript bundle: 691.59 kB, 203.37 kB gzip; build warns about bundle size and dependency annotations.
- ESLint failed: 31 errors and 5 warnings, including unused imports and React effect issues.
- API catalog and categories: HTTP 200.
- Search `/api/products?search=kaju`: HTTP 500. The SQL query uses `Contains` with `StringComparison`, which the provider cannot translate. Use a database-translatable comparison and define the intended case sensitivity through the database collation.
- Anonymous admin order list: HTTP 401.
- Invalid tracking reference: HTTP 404.
- Browser: home loads products and categories; adding an item opens a correct cart; proceeding to checkout shows matching total and delivery fields.
- Browser: selecting 500 Gm for Gulab Jamun on the home page reverted to 1 Kg. HomePage does not pass the variant change handler to ProductCard.
- No orders were submitted. Order submission, admin mutations, concurrent inventory updates, reconnect behavior, and mobile visual layout were not verified end to end.

## Priority 1: protect customers and inventory

1. `Hubs/OrderHub.cs`: JoinAdminDashboard has no admin authorization. Anonymous connections can join the Admins group and receive new orders, including customer details. Require the Admin role on this hub method and test anonymous, customer, and admin connections.
2. `Controllers/OrdersController.cs`: public tracking returns name, phone, email, address, and notes. References contain a date and four-digit random suffix. Require an unpredictable tracking token or authenticated ownership; restrict public responses to necessary tracking data. Address existing orders too.
3. Order quantities have no positive range validation in DTOs or controller. Negative quantities increase inventory and create negative totals. Validate positive IDs, positive bounded quantities, bounded item counts, and contact/address lengths before querying or modifying data.
4. Stock checks and updates are separate operations without concurrency protection. Simultaneous orders can oversell. Use an atomic conditional stock update or concurrency tokens with transaction handling; test two customers buying the last available unit.
5. JWT signing secret is committed in appsettings.json; the seeded admin password is hardcoded. Move production secrets to deployment secret storage, rotate exposed values, and provision the admin securely. README lists a different password from the initializer.
6. Program.cs permits every CORS origin with credentials. Restrict origins to the deployed storefront and explicitly configured development origins.
7. Add targeted abuse protection for login, order submission, review submission, and tracking. Reviews currently publish automatically without purchase verification or moderation approval.

## Priority 2: make purchasing reliable

- Fix product search and home-page pack selection first.
- Save the cart across refreshes, then reconcile price and availability against the API before checkout. Server totals already use database prices, which is a good foundation.
- Add an idempotency key for order submission so a retry after a lost response cannot create a duplicate order.
- Replace console-only catalog failures with a visible error and Retry action. A failed search should not silently leave stale products visible.
- Normalize Indian phone numbers consistently on both client and server. Current client regex accepts strings made only of spaces and plus signs; server only checks for nonempty values.
- Rejoin SignalR groups and refetch order status after reconnect; automatic reconnect alone does not restore group membership.
- Define allowed status transitions. Current API permits arbitrary transitions, and payment status can remain Completed or Cancelled when moving back to an active stage.
- Show serviceable pincodes, delivery estimates, minimum order, opening hours, and applicable delivery charges before submission. Verify current free-delivery and tax claims against actual shop policy.
- Replace placeholder contact details and verify product descriptions: the displayed Jilebi description describes a different sweet.
- Use URL-based navigation so refresh, Back, and shared links preserve the intended page.

## Remember customer details

Start with browser autofill (`name`, `tel`, `email`, and `street-address`) and correct mobile input types. Then add an optional, unchecked “Remember my details on this device” choice for name, phone, email, and address, with Edit and Forget controls. Do not save order notes automatically. Explain that this is intended for personal devices and handle unavailable or malformed browser storage safely.

For use across devices, introduce a customer account with verified sign-in, saved addresses, order history, and reorder. Protect every customer API by authenticated ownership; entering a phone number alone must never reveal an existing profile. Keep guest checkout available.

## Priority 3: speed and shop-specific usability

- Lazy-load admin pages and other infrequently used pages; the storefront currently imports all pages into one large bundle.
- Lazy-load below-the-fold product images, use appropriately sized optimized images, and reserve their dimensions. Measure actual load time before claiming a speed improvement.
- Paginate growing catalog, reviews, and admin orders; batch order item lookups rather than performing two database queries per item.
- Load independent admin data in parallel and prevent stale search responses from overwriting newer results.
- Add keyboard labels to icon-only controls and keyboard support to clickable categories and mobile summary toggles.
- Add allergen/ingredient information, shelf life, storage instructions, pickup, delivery slots, and gift options where the shop can fulfill them.

## Suggested implementation order

1. Close customer-data exposure and validate order quantities.
2. Fix search, pack selection, inventory concurrency, and duplicate-order handling.
3. Add autofill, opt-in remembered details, persisted cart, and clear error states.
4. Improve delivery information and reconnect behavior.
5. Split bundles and measure mobile performance; then add accounts and reorder.

This is the baseline review before implementation. The status below supersedes the original findings.

## Implementation status — 15 October 2026

Implemented and verified:

- Admin authorization and password-version-specific live notification groups; private customer tracking codes and redacted public receipts.
- Server-side quantity/contact validation, batch variant reads, atomic inventory deductions, serialized cancellation, and checkout idempotency/recovery.
- Valid fulfillment transitions and consistent payment state.
- Working product search and home-page pack selection.
- Restricted CORS, generated ignored development secrets, production secret/default-password checks, targeted request limits, and safe API error responses.
- Admin password changes that revoke previous HTTP sessions and prevent existing live connections from receiving new orders.
- Reviews awaiting admin approval, with publish/unpublish controls and pagination.
- Opt-in saved delivery details with Forget controls, browser autofill, persisted/reconciled cart, and visible errors.
- Hash-based page navigation, refresh restoration, mobile navigation, mobile checkout layout, accessible controls, and reconnect/refetch handling.
- Lazy-loaded pages/SignalR, lazy product images, paginated customer catalog/admin orders/reviews, and accurate aggregate dashboard metrics.
- The supplied shop address/phone/hours, pincode 232103, ₹50 minimum, ₹15 delivery below ₹100, free delivery from ₹100, and 15-minute estimate. Pricing and coverage are enforced by the API.
- Additive database upgrade preserving orders and inventory; narrowly corrected the legacy Jilebi description copied from Rasmalai.
- Patched vulnerable transitive .NET dependencies; current NuGet and production npm audits report no known package vulnerabilities.

Validation: 49 API integration checks passed in a disposable database, eight frontend tests passed, frontend lint passed, API build passed without warnings, and frontend production build passed. Browser checks reproduced and verified pack selection, search, cart/checkout totals, persistence after refresh, and mobile navigation/layout. The Vite build still emits a third-party SignalR annotation warning; it does not fail the build.

Before public deployment: replace the existing development admin password using the new dashboard control, configure production secrets/origins/HTTPS/proxy behavior, back up and upgrade the production database, and update the hosting runtime. The installed shared .NET runtime is 10.0.11; patching project packages does not update it. See [DEPLOYMENT.md](DEPLOYMENT.md).

Additional features remain future work: customer accounts and cross-device addresses, reorder, verified-purchase reviews, ingredient/allergen data, pickup, delivery slots, and an agreed policy for orders outside opening hours. Saved checkout details currently apply to a consenting customer's device.
