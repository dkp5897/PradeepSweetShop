using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.Data.SqlClient;

// Real SQL Server and HTTP tests. Only a newly generated disposable database is
// used; the shop database is never selected or modified by this harness.
var root = Path.GetFullPath(args.Length > 0 ? args[0] : Directory.GetCurrentDirectory());
var database = "PradeepSweetShop_Checks_" + Guid.NewGuid().ToString("N");
var connectionString = $"Server=localhost;Database={database};Trusted_Connection=True;TrustServerCertificate=True";
var apiDirectory = Path.Combine(root, "PradeepSweetShop.Api");
var dll = Path.Combine(apiDirectory, "bin", "Debug", "net10.0", "PradeepSweetShop.Api.dll");
var listener = new TcpListener(IPAddress.Loopback, 0);
listener.Start();
var port = ((IPEndPoint)listener.LocalEndpoint).Port;
listener.Stop();
var password = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
var start = new ProcessStartInfo("dotnet")
{
    WorkingDirectory = apiDirectory, UseShellExecute = false, CreateNoWindow = true,
    RedirectStandardOutput = true, RedirectStandardError = true
};
start.ArgumentList.Add(dll);
start.Environment["ASPNETCORE_ENVIRONMENT"] = "Development";
start.Environment["ASPNETCORE_URLS"] = $"http://127.0.0.1:{port}";
start.Environment["ConnectionStrings__DefaultConnection"] = connectionString;
start.Environment["JwtSettings__Secret"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
start.Environment["Bootstrap__AdminPassword"] = password;
start.Environment["RateLimits__orders"] = "100";
using var client = new HttpClient { BaseAddress = new Uri($"http://127.0.0.1:{port}"), Timeout = TimeSpan.FromSeconds(20) };
using var process = Process.Start(start)!;
var output = process.StandardOutput.ReadToEndAsync();
var errors = process.StandardError.ReadToEndAsync();
var passed = 0;
void Check(bool condition, string description)
{
    if (!condition) throw new Exception("FAIL: " + description);
    Console.WriteLine("PASS: " + description); passed++;
}
async Task<HttpResponseMessage> Send(string path, object? body = null, string? key = null, string? token = null, string method = "POST")
{
    using var request = new HttpRequestMessage(new HttpMethod(method), path);
    if (body is not null) request.Content = JsonContent.Create(body);
    if (key is not null) request.Headers.Add("Idempotency-Key", key);
    if (token is not null) request.Headers.Authorization = new("Bearer", token);
    return await client.SendAsync(request);
}
async Task<JsonNode> Json(HttpResponseMessage response) => JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
async Task<int> Stock(int variant)
{
    await using var connection = new SqlConnection(connectionString); await connection.OpenAsync();
    await using var command = new SqlCommand("SELECT StockQuantity FROM ProductPrices WHERE Id=@id", connection);
    command.Parameters.AddWithValue("@id", variant);
    return (int)(await command.ExecuteScalarAsync())!;
}
async Task SetStock(int variant, int value)
{
    await using var connection = new SqlConnection(connectionString); await connection.OpenAsync();
    await using var command = new SqlCommand("UPDATE ProductPrices SET StockQuantity=@stock WHERE Id=@id", connection);
    command.Parameters.AddWithValue("@id", variant); command.Parameters.AddWithValue("@stock", value);
    await command.ExecuteNonQueryAsync();
}
try
{
    var ready = false;
    for (var attempt = 0; attempt < 80; attempt++)
    {
        if (process.HasExited) throw new Exception("Test API exited during startup.");
        try { ready = (await client.GetAsync("/api/categories")).IsSuccessStatusCode; } catch (HttpRequestException) { }
        if (ready) break;
        await Task.Delay(500);
    }
    Check(ready, "API starts with an isolated database");
    var productsResponse = await client.GetAsync("/api/products?search=Kaju");
    Check(productsResponse.IsSuccessStatusCode, "SQL-translatable product search");
    var product = (await Json(productsResponse)).AsArray().First()!;
    var productId = product["id"]!.GetValue<int>();
    var variant = product["prices"]!.AsArray().First()!;
    var variantId = variant["id"]!.GetValue<int>();
    var price = variant["price"]!.GetValue<decimal>();
    var originalStock = await Stock(variantId);
    object Order(int quantity = 1, decimal? expected = null) => new
    {
        customerName = "Test Customer", customerPhone = "+91 98765-43210",
        customerEmail = "test@example.test", deliveryAddress = "Test address, Demo city, 110001",
        pincode = "232103",
        expectedTotal = expected,
        items = new[] { new { productId, productPriceId = variantId, quantity } }
    };
    foreach (var quantity in new[] { -1, 0, 101 })
        Check((await Send("/api/orders", Order(quantity), Guid.NewGuid().ToString())).StatusCode == HttpStatusCode.BadRequest,
            $"Reject quantity {quantity}");
    var nullItem = new { customerName = "Test", customerPhone = "9876543210", pincode = "232103", deliveryAddress = "Long enough address", items = new object?[] { null } };
    Check((await Send("/api/orders", nullItem, Guid.NewGuid().ToString())).StatusCode == HttpStatusCode.BadRequest, "Reject null order items");
    Check(await Stock(variantId) == originalStock, "Rejected quantities never change stock");
    Check((await Send("/api/orders", Order())).StatusCode == HttpStatusCode.BadRequest, "Require checkout idempotency key");
    Check((await Send("/api/orders", Order(expected: price + 1), Guid.NewGuid().ToString())).StatusCode == HttpStatusCode.Conflict, "Reject a changed total");
    Check(await Stock(variantId) == originalStock, "Price conflict rolls back stock changes");
    var key = Guid.NewGuid().ToString();
    var first = await Send("/api/orders", Order(expected: price), key);
    Check(first.StatusCode == HttpStatusCode.Created, "Create valid order");
    var receipt = await Json(first);
    var orderId = receipt["id"]!.GetValue<int>();
    var number = receipt["orderNumber"]!.GetValue<string>();
    var trackingToken = receipt["trackingToken"]!.GetValue<string>();
    Check(receipt["customerPhone"]!.GetValue<string>() == "" && receipt["deliveryAddress"]!.GetValue<string>() == "", "Customer receipts do not expose personal data");
    var retry = await Send("/api/orders", Order(expected: price), key);
    Check(retry.IsSuccessStatusCode && (await Json(retry))["id"]!.GetValue<int>() == orderId && await Stock(variantId) == originalStock - 1,
        "Retry returns the same order and deducts stock once");
    Check((await Send("/api/orders", Order(2, price * 2), key)).StatusCode == HttpStatusCode.Conflict, "Reject reuse of key with different payload");
    Check((await client.GetAsync($"/api/orders/track/{number}")).StatusCode == HttpStatusCode.NotFound, "Reference alone cannot track an order");
    using (var trackingRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/orders/track/{number}"))
    {
        trackingRequest.Headers.Add("X-Tracking-Token", trackingToken);
        var tracked = await client.SendAsync(trackingRequest);
        Check(tracked.IsSuccessStatusCode && (await Json(tracked))["customerEmail"] is null, "Private code tracks without disclosing contact information");
    }
    using (var recovery = new HttpRequestMessage(HttpMethod.Get, "/api/orders/receipt"))
    {
        recovery.Headers.Add("X-Checkout-Key", key);
        Check((await Json(await client.SendAsync(recovery)))["id"]!.GetValue<int>() == orderId, "Recover a receipt after a lost checkout response");
    }
    Check((await client.GetAsync("/api/orders")).StatusCode == HttpStatusCode.Unauthorized, "Anonymous admin list rejected");
    var login = await Send("/api/auth/login", new { username = "admin", password });
    Check(login.IsSuccessStatusCode, "Admin login with provisioned password");
    var adminToken = (await Json(login))["token"]!.GetValue<string>();
    var badPincode = System.Text.Json.JsonSerializer.SerializeToNode(Order())!;
    badPincode["pincode"] = "110001";
    Check((await Send("/api/orders", badPincode, Guid.NewGuid().ToString())).StatusCode == HttpStatusCode.BadRequest, "Reject orders outside delivery area");
    var badPhone = System.Text.Json.JsonSerializer.SerializeToNode(Order())!;
    badPhone["customerPhone"] = "++++++++++";
    Check((await Send("/api/orders", badPhone, Guid.NewGuid().ToString())).StatusCode == HttpStatusCode.BadRequest, "Reject invalid phone numbers on the server");
    foreach (var subtotal in new[] { 49m, 50m, 99m, 100m })
    {
        await using var priceConnection = new SqlConnection(connectionString); await priceConnection.OpenAsync();
        await using var priceUpdate = new SqlCommand("UPDATE ProductPrices SET Price=@price WHERE Id=@id", priceConnection);
        priceUpdate.Parameters.AddWithValue("@price", subtotal); priceUpdate.Parameters.AddWithValue("@id", variantId);
        await priceUpdate.ExecuteNonQueryAsync();
        var before = await Stock(variantId);
        var fee = subtotal < 100 ? 15 : 0;
        var response = await Send("/api/orders", Order(expected: subtotal + fee), Guid.NewGuid().ToString());
        if (subtotal < 50)
            Check(response.StatusCode == HttpStatusCode.BadRequest && await Stock(variantId) == before, "Minimum ₹50 excludes delivery and rejected checkout preserves stock");
        else
        {
            var charged = await Json(response);
            Check(response.IsSuccessStatusCode && charged["deliveryFee"]!.GetValue<decimal>() == fee && charged["totalAmount"]!.GetValue<decimal>() == subtotal + fee,
                $"Subtotal ₹{subtotal}: delivery ₹{fee}, total ₹{subtotal + fee}");
        }
        priceUpdate.Parameters["@price"].Value = price;
        await priceUpdate.ExecuteNonQueryAsync();
    }
    Check((await Send($"/api/orders/{orderId}/status", new { status = "Delivered" }, token: adminToken, method: "PUT")).StatusCode == HttpStatusCode.Conflict,
        "Reject skipped fulfillment stages");
    foreach (var status in new[] { "Confirmed", "Preparing", "OutForDelivery", "Delivered" })
        Check((await Send($"/api/orders/{orderId}/status", new { status }, token: adminToken, method: "PUT")).IsSuccessStatusCode, $"Advance to {status}");
    Check((await Send($"/api/orders/{orderId}/status", new { status = "Cancelled" }, token: adminToken, method: "PUT")).StatusCode == HttpStatusCode.Conflict,
        "Delivered orders cannot be cancelled or restock inventory");

    await SetStock(variantId, 1);
    var competing = await Task.WhenAll(Send("/api/orders", Order(), Guid.NewGuid().ToString()), Send("/api/orders", Order(), Guid.NewGuid().ToString()));
    Check(competing.Count(r => r.StatusCode == HttpStatusCode.Created) == 1 && competing.Count(r => r.StatusCode == HttpStatusCode.Conflict) == 1 && await Stock(variantId) == 0,
        "Two buyers competing for the last unit cannot oversell");
    var cancellable = (await Json(competing.Single(r => r.StatusCode == HttpStatusCode.Created)))["id"]!.GetValue<int>();
    var cancellations = await Task.WhenAll(Send($"/api/orders/{cancellable}/status", new { status = "Cancelled" }, token: adminToken, method: "PUT"),
        Send($"/api/orders/{cancellable}/status", new { status = "Cancelled" }, token: adminToken, method: "PUT"));
    Check(cancellations.All(r => r.IsSuccessStatusCode) && await Stock(variantId) == 1, "Concurrent cancellations restore stock exactly once");
    var duplicateKey = Guid.NewGuid().ToString();
    var duplicates = await Task.WhenAll(Send("/api/orders", Order(), duplicateKey), Send("/api/orders", Order(), duplicateKey));
    Check(duplicates.All(r => r.IsSuccessStatusCode) && await Stock(variantId) == 0, "Concurrent retries create one order");
    var reviewResponse = await Send($"/api/products/{productId}/reviews", new { customerName = "Test reviewer", rating = 5, comment = "Pending test review" });
    var reviewId = (await Json(reviewResponse))["review"]!["id"]!.GetValue<int>();
    var publicReviews = (await Json(await client.GetAsync($"/api/products/{productId}/reviews"))).AsArray();
    Check(!publicReviews.Any(r => r!["id"]!.GetValue<int>() == reviewId), "Unapproved reviews stay private");
    Check((await Send($"/api/reviews/{reviewId}/approval", new { isApproved = true }, token: adminToken, method: "PUT")).IsSuccessStatusCode,
        "Admin can approve a review");
    Check((await Json(await client.GetAsync($"/api/products/{productId}/reviews"))).AsArray().Any(r => r!["id"]!.GetValue<int>() == reviewId), "Approved review becomes visible");
    using (var cors = new HttpRequestMessage(HttpMethod.Options, "/api/orders"))
    {
        cors.Headers.Add("Origin", "https://untrusted.example"); cors.Headers.Add("Access-Control-Request-Method", "POST");
        Check(!(await client.SendAsync(cors)).Headers.Contains("Access-Control-Allow-Origin"), "Untrusted browser origin is rejected");
    }

    // Exercise the real SignalR JSON protocol without an additional test package.
    async Task<bool> HubCall(string method, object[] arguments, string? token = null,
        ClientWebSocket? retainedSocket = null, bool rejectOrderMessages = false)
    {
        var socket = retainedSocket ?? new ClientWebSocket();
        try
        {
        var connecting = socket.State != WebSocketState.Open;
        if (connecting) await socket.ConnectAsync(new Uri($"ws://127.0.0.1:{port}/hubs/orders" + (token is null ? "" : "?access_token=" + token)), CancellationToken.None);
        async Task Write(object value) => await socket.SendAsync(Encoding.UTF8.GetBytes(System.Text.Json.JsonSerializer.Serialize(value) + "\u001e"), WebSocketMessageType.Text, true, CancellationToken.None);
        var buffer = new byte[8192];
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        if (connecting)
        {
            await Write(new { protocol = "json", version = 1 });
            await socket.ReceiveAsync(buffer, timeout.Token);
        }
        await Write(new { type = 1, invocationId = "test", target = method, arguments });
        var text = "";
        while (true)
        {
            var received = await socket.ReceiveAsync(buffer, timeout.Token);
            text += Encoding.UTF8.GetString(buffer, 0, received.Count);
            var end = text.IndexOf('\u001e');
            while (end >= 0)
            {
                var message = JsonNode.Parse(text[..end]); text = text[(end + 1)..];
                if (rejectOrderMessages && message?["target"]?.GetValue<string>() == "NewOrderReceived")
                    throw new Exception("An expired admin connection received new customer data.");
                if (message?["invocationId"]?.GetValue<string>() == "test") return message["error"] is null;
                end = text.IndexOf('\u001e');
            }
        }
        }
        finally { if (retainedSocket is null) socket.Dispose(); }
    }
    Check(!await HubCall("JoinAdminDashboard", []), "Anonymous SignalR admin subscription rejected");
    Check(await HubCall("JoinAdminDashboard", [], adminToken), "Authenticated admin SignalR subscription accepted");
    Check(!await HubCall("JoinOrderTracker", [number, new string('0', 64)]), "Invalid private code cannot join tracking group");
    Check(await HubCall("JoinOrderTracker", [number, trackingToken]), "Valid private code can join tracking group");
    using var oldAdminSocket = new ClientWebSocket();
    Check(await HubCall("JoinAdminDashboard", [], adminToken, oldAdminSocket), "Establish admin connection before password rotation");
    var newPassword = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
    Check((await Send("/api/auth/password", new { currentPassword = password, newPassword }, token: adminToken, method: "PUT")).IsSuccessStatusCode,
        "Admin can replace the bootstrap password");
    Check((await Send("/api/orders", token: adminToken, method: "GET")).StatusCode == HttpStatusCode.Unauthorized,
        "Changing the password immediately revokes previous JWT sessions");
    Check((await Send("/api/auth/login", new { username = "admin", password = newPassword })).IsSuccessStatusCode,
        "New admin password can sign in");
    await SetStock(variantId, 1);
    Check((await Send("/api/orders", Order(), Guid.NewGuid().ToString())).IsSuccessStatusCode, "Create order after admin password rotation");
    Check(!await HubCall("JoinAdminDashboard", [], adminToken, oldAdminSocket, true),
        "Old live connection receives no new orders and cannot rejoin after password rotation");
    HttpResponseMessage? limited = null;
    for (var attempt = 0; attempt < 6; attempt++) limited = await Send("/api/auth/login", new { username = "wrong", password = "wrong" });
    Check(limited?.StatusCode == HttpStatusCode.TooManyRequests, "Login attempts are rate limited");
    Console.WriteLine($"Completed {passed} integration checks.");
}
finally
{
    if (!process.HasExited) { process.Kill(true); await process.WaitForExitAsync(); }
    var logDirectory = Path.Combine(root, ".local"); Directory.CreateDirectory(logDirectory);
    await File.WriteAllTextAsync(Path.Combine(logDirectory, "api-checks.log"), await output + await errors);
    // The database identifier is generated above, never supplied by user input.
    if (!System.Text.RegularExpressions.Regex.IsMatch(database, "^PradeepSweetShop_Checks_[a-f0-9]{32}$"))
        throw new InvalidOperationException("Unexpected disposable database name.");
    SqlConnection.ClearAllPools();
    await using var master = new SqlConnection("Server=localhost;Database=master;Trusted_Connection=True;TrustServerCertificate=True");
    await master.OpenAsync();
    await using var cleanup = new SqlCommand($"IF DB_ID('{database}') IS NOT NULL BEGIN ALTER DATABASE [{database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{database}]; END", master);
    await cleanup.ExecuteNonQueryAsync();
    Console.WriteLine("Disposable test database removed.");
}
