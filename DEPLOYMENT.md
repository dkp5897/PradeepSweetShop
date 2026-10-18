# Running and deploying the fixed shop

## Development

Use .NET 10, a current Node.js release compatible with Vite 8, and SQL Server.
From `PradeepSweetShop.Api`, run `dotnet run --launch-profile https`.
From `PradeepSweetShop.Client`, run `npm start -- --host localhost --port 5174`.

Vite proxies `/api` and `/hubs` to `http://localhost:5049`, including WebSockets.
The API also listens at `https://localhost:7185`. Browser-to-API requests use
the storefront origin by default, so no certificate bypass is needed in Vite.

The existing development database and admin password are retained. To replace
the admin password, sign in, select **Change password**, and enter the current
password and a new password of at least 12 characters. Previous tokens become
invalid, and their live-notification groups stop receiving new orders.

New development databases need `Bootstrap__AdminPassword` supplied through the
environment before their first start. No default password is created. The
development JWT secret is generated in `PradeepSweetShop.Api/.local/jwt-key`,
which Git ignores. Keep that file private and retain it across local restarts;
changing it invalidates local sessions and private tracking codes.

## Shop settings

`Shop` in `PradeepSweetShop.Api/appsettings.json` is the source of truth for
the public shop information, delivery pincodes, minimum order, delivery fee,
free-delivery threshold, and estimated delivery time. The frontend reads
`GET /api/shop`; it does not have a second copy of the pricing rules.

The configured shop serves **232103**. Sweets must total at least **₹50**.
Delivery costs **₹15** below **₹100**, and is free at **₹100 or above**.
The estimate is **15 minutes** and shop hours are **5 AM–10 PM daily**.
The opening hours are informational; there is no automatic closure or delivery
slot scheduler in this version. Confirm how overnight orders should be handled
before launch. Delivery time is an estimate, not a guaranteed timer.

## Database upgrade and existing orders

Development startup applies `PradeepSweetShop.Api/Data/upgrade-orders.sql`.
It adds nullable checkout-key/hash columns, a filtered unique key index, and a
delivery-fee column with zero for existing records. A narrowly matched legacy
Jilebi description copied from Rasmalai is also corrected; other descriptions
are preserved. The script does not remove orders,
reset stock, or replace existing customer details.

Production does not run schema creation or seed demo accounts. Back up the
database, apply the SQL upgrade using your normal deployment account, and then
start the new API. A new production database needs explicit schema and admin
provisioning; do not deploy the demonstration seed catalog as real inventory.

Old short references alone no longer grant tracking access. An administrator
can open an existing order and copy its **Customer private tracking code**,
sharing it only after verifying the customer. Public tracking and receipts
contain item/status/payment information and omit contact details and addresses.
Private receipt codes are bearer credentials: anyone with the complete code can
read its tracking information. Keep them out of logs and public messages.

## Production configuration

- Supply a new, random `JwtSettings__Secret` of at least 64 bytes from secret
  storage. Never deploy the old committed development secret. Production refuses
  that old secret and the known development admin passwords.
- Update the production .NET runtime to the current patched .NET 10 release.
  This computer currently has runtime 10.0.11; application dependency patches
  do not replace the machine's shared runtime.
- Replace the development admin password before starting production. The API
  refuses production startup while a known default password remains.
- Configure `ConnectionStrings__DefaultConnection` and production
  `Cors__AllowedOrigins__0` for your actual storefront origin. The default
  production CORS policy grants no cross-origin access.
- Serve the frontend over HTTPS. Reverse-proxy `/api` and `/hubs` to the API and
  enable WebSocket upgrades. Restrict access to the API's internal listener.
  Configure trusted proxy forwarding and client-IP handling for the chosen host
  so HTTPS redirection and per-IP rate limits work correctly behind the proxy.
- Set frontend response headers at the hosting layer: a content security policy,
  `frame-ancestors`, `X-Content-Type-Options: nosniff`, HSTS on HTTPS, and
  `Referrer-Policy: no-referrer`. Test the policy with MUI's generated styles and
  the actual image/font providers before enforcing it.
- Cache fingerprinted frontend assets for a long duration and keep `index.html`
  short-lived. Enable Brotli/gzip and retain a database backup/recovery process.
- Admin tokens use session storage instead of persistent local storage. Serve
  only trusted scripts; session storage and opted-in delivery details are still
  readable by scripts running on the storefront origin.

Never change the signing secret casually: it also protects private tracking
codes. A planned rotation must include reissuing private codes for existing
orders. Existing WebSocket sessions should be terminated during a security
deployment, as with the current local API restart.

## Verification

From the project root:

```powershell
dotnet build tests/ApiChecks/ApiChecks.csproj -p:NuGetAudit=false
dotnet run --project tests/ApiChecks/ApiChecks.csproj --no-build -- 'D:\NET Projects\PradeepSweetShop'
```

The harness launches a separate API with generated credentials and a newly
generated disposable SQL Server database. It removes that database afterward.
It never connects to the shop database. Run it with SQL Server privileges to
create and drop its own test database. A failure log is written to
`.local/api-checks.log`.

From `PradeepSweetShop.Client`, run `npm test`, `npm run lint`, and
`npm run build`. Browser QA covers pack selection, search, cart totals,
refresh persistence, mobile navigation, and mobile checkout. No test order is
submitted to the real shop database during browser QA.

Customer accounts, cross-device address books, reorder, verified-purchase
reviews, allergen/ingredient data, pickup, and delivery slots are additional
features. The current convenience feature is opt-in device-local details with
Forget controls, alongside guest checkout.

## Dependency security

The API explicitly pins patched Microsoft.OpenApi 2.7.5 and
System.Security.Cryptography.Pkcs 10.0.13 to override vulnerable transitive
versions. References: [OpenAPI advisory](https://github.com/advisories/GHSA-v5pm-xwqc-g5wc),
[PKCS advisory](https://github.com/advisories/GHSA-846f-f764-76mx), and
[additional PKCS advisory](https://github.com/advisories/GHSA-2fmv-rv2c-59x7).
Run dependency audits periodically; a passing scan describes the vulnerability
database available at scan time, not a guarantee of absence of vulnerabilities.
