using System;
using System.Collections.Generic;
using System.Linq;
using PradeepSweetShop.Api.Helpers;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Data;

public static class DbInitializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        // Ensure database is created
        context.Database.EnsureCreated();

        // Check if database has been seeded
        if (context.Categories.Any())
        {
            return; // DB has been seeded
        }

        // Seed Admin User
        var (hash, salt) = PasswordHasher.HashPassword("admin123");
        var admin = new AdminUser
        {
            Username = "admin",
            PasswordHash = hash,
            Salt = salt,
            FullName = "Pradeep Kumar (Admin)",
            Role = "Admin"
        };
        context.AdminUsers.Add(admin);

        // Seed Categories
        var categories = new List<Category>
        {
            new() { Name = "Ghee Sweets", Description = "Rich and delicious sweets made with pure desi ghee" },
            new() { Name = "Bengali Sweets", Description = "Soft, spongy, and milk-based traditional Bengali delicacies" },
            new() { Name = "Milk Sweets", Description = "Creamy and delicious sweets prepared from condensed milk" },
            new() { Name = "Dry Fruit Sweets", Description = "Healthy and premium sweets loaded with cashews, almonds, and pistachios" },
            new() { Name = "Snacks & Savories", Description = "Crispy, spicy, and savory snacks to complement your sweet tooth" }
        };
        context.Categories.AddRange(categories);
        context.SaveChanges(); // Save to get Category Ics

        // Find categories by name to map products
        var gheeCat = categories.First(c => c.Name == "Ghee Sweets");
        var bengaliCat = categories.First(c => c.Name == "Bengali Sweets");
        var milkCat = categories.First(c => c.Name == "Milk Sweets");
        var dryFruitCat = categories.First(c => c.Name == "Dry Fruit Sweets");
        var snacksCat = categories.First(c => c.Name == "Snacks & Savories");

        // Seed Products & Prices
        var products = new List<Product>
        {
            // 1. Kaju Katli (Dry Fruit / Ghee)
            new()
            {
                Name = "Kaju Katli",
                Description = "A classic cashew fudge sweet, decorated with edible silver leaf. Perfect for festivals.",
                CategoryId = dryFruitCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1605197586541-89814806e0f6?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new() { Unit = "1 Kg", Price = 1000 },
                    new() { Unit = "500 Gm", Price = 500 },
                    new() { Unit = "250 Gm", Price = 250 }
                ]
            },
            // 2. Motichoor Laddoo (Ghee)
            new()
            {
                Name = "Motichoor Laddoo",
                Description = "Soft, melt-in-the-mouth laddoos made from tiny gram flour balls fried in pure ghee and soaked in cardamom syrup.",
                CategoryId = gheeCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new() { Unit = "1 Kg", Price = 400 },
                    new() { Unit = "500 Gm", Price = 200 },
                    new() { Unit = "Piece", Price = 15 }
                ]
            },
            // 3. Rasgulla (Bengali)
            new()
            {
                Name = "Rasgulla",
                Description = "Spongy, juicy traditional Bengali sweets made from fresh chhena (cottage cheese) cooked in light sugar syrup.",
                CategoryId = bengaliCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new() { Unit = "1 Kg (12-14 Pcs)", Price = 320 },
                    new() { Unit = "500 Gm (6-7 Pcs)", Price = 160 },
                    new() { Unit = "Piece", Price = 15 }
                ]
            },
            // 4. Gulab Jamun (Milk)
            new()
            {
                Name = "Gulab Jamun",
                Description = "Golden-brown milk-solid dumplings, deep-fried and soaked in a warm, fragrant rose and cardamom syrup.",
                CategoryId = milkCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new() { Unit = "1 Kg", Price = 360 },
                    new() { Unit = "500 Gm", Price = 180 },
                    new() { Unit = "Piece", Price = 15 }
                ]
            },
            // 5. Rasmalai (Bengali / Milk)
            new()
            {
                Name = "Rasmalai",
                Description = "Soft, flattened chhena patties soaked in sweet, thickened milk, flavored with saffron, cardamom, and chopped pistachios.",
                CategoryId = milkCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new() { Unit = "Piece", Price = 40 },
                    new() { Unit = "Plate (2 Pcs)", Price = 75 }
                ]
            },
            // 6. Premium Dry Fruit Laddu (Dry Fruit)
            new()
            {
                Name = "Premium Dry Fruit Laddu",
                Description = "A healthy and sugar-free mixture of dates, figs, almonds, cashews, and pistachios pressed into delicious energy bites.",
                CategoryId = dryFruitCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
                Prices =
                [
                    new() { Unit = "1 Kg", Price = 1200 },
                    new() { Unit = "500 Gm", Price = 600 }
                ]
            },
            // 7. Special Desi Ghee Soan Papdi (Ghee)
            new()
            {
                Name = "Special Soan Papdi",
                Description = "Flaky, crisp, and extremely light sweet made from gram flour, sugar, ghee, and milk, garnished with dry fruits.",
                CategoryId = gheeCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new ProductPrice { Unit = "1 Kg Box", Price = 380 },
                    new ProductPrice { Unit = "500 Gm Box", Price = 200 }
                ]
            },
            // 8. Punjabi Samosa (Snacks)
            new()
            {
                Name = "Punjabi Samosa",
                Description = "Crispy golden pastry triangles stuffed with a spicy mixture of mashed potatoes, green peas, and fragrant herbs.",
                CategoryId = snacksCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new ProductPrice { Unit = "Piece", Price = 15 },
                    new ProductPrice { Unit = "Plate (2 Pcs with Chutney)", Price = 30 }
                ]
            },
            // 9. Special Pyaz Kachori (Snacks)
            new()
            {
                Name = "Pyaz Kachori",
                Description = "A popular Rajasthani snack consisting of a flaky pastry stuffed with a spiced onion filling.",
                CategoryId = snacksCat.Id,
                ImageUrl = "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
                Prices = 
                [
                    new ProductPrice { Unit = "Piece", Price = 20 }
                ]
            }
        };

        context.Products.AddRange(products);
        context.SaveChanges();

        // Seed sample Orders
        var kajuKatli = products.First(p => p.Name == "Kaju Katli");
        var kajuPrice = kajuKatli.Prices.First(pr => pr.Unit == "1 Kg");

        var rasgulla = products.First(p => p.Name == "Rasgulla");
        var rasgullaPrice = rasgulla.Prices.First(pr => pr.Unit == "Piece");

        var samosa = products.First(p => p.Name == "Punjabi Samosa");
        var samosaPrice = samosa.Prices.First(pr => pr.Unit == "Plate (2 Pcs with Chutney)");

        var orders = new List<Order>
        {
            new()
            {
                OrderNumber = "PSH-20260614-1100",
                CustomerName = "Rajesh Verma",
                CustomerPhone = "9876543210",
                CustomerEmail = "rajesh.verma@example.com",
                DeliveryAddress = "Flat 402, Royal Apartments, Dwarka, Delhi",
                OrderDate = DateTime.UtcNow.AddHours(-3),
                OrderStatus = "Pending",
                TotalAmount = kajuPrice.Price * 1 + rasgullaPrice.Price * 10,
                PaymentMethod = "CashOnDelivery",
                PaymentStatus = "Pending",
                OrderNotes = "Please pack kaju katli in a festive box.",
                OrderItems =
                [
                    new(){
                        ProductId = kajuKatli.Id,
                        ProductPriceId = kajuPrice.Id,
                        Quantity = 1,
                        UnitPrice = kajuPrice.Price,
                        TotalPrice = kajuPrice.Price
                    },
                    new(){
                        ProductId = rasgulla.Id,
                        ProductPriceId = rasgullaPrice.Id,
                        Quantity = 10,
                        UnitPrice = rasgullaPrice.Price,
                        TotalPrice = rasgullaPrice.Price * 10
                    }
                ]
            },
            new(){
                OrderNumber = "PSH-20260614-1045",
                CustomerName = "Anjali Sharma",
                CustomerPhone = "9123456789",
                CustomerEmail = "anjali.sharma@example.com",
                DeliveryAddress = "C-56, Shanti Kunj, Vasant Kunj, New Delhi",
                OrderDate = DateTime.UtcNow.AddHours(-5),
                OrderStatus = "Confirmed",
                TotalAmount = samosaPrice.Price * 4,
                PaymentMethod = "CashOnDelivery",
                PaymentStatus = "Pending",
                OrderNotes = "Deliver hot and include extra chutney.",
                OrderItems = 
                [
                    new(){
                        ProductId = samosa.Id,
                        ProductPriceId = samosaPrice.Id,
                        Quantity = 4,
                        UnitPrice = samosaPrice.Price,
                        TotalPrice = samosaPrice.Price * 4
                    }
                ]
            },
            new(){
                OrderNumber = "PSH-20260614-0930",
                CustomerName = "Vikram Singh",
                CustomerPhone = "9988776655",
                CustomerEmail = "vikram.s@example.com",
                DeliveryAddress = "H.No 12, Gali No 3, Karol Bagh, Delhi",
                OrderDate = DateTime.UtcNow.AddDays(-1),
                OrderStatus = "Delivered",
                TotalAmount = kajuPrice.Price * 2,
                PaymentMethod = "CashOnDelivery",
                PaymentStatus = "Completed",
                OrderItems = 
                [
                    new(){
                        ProductId = kajuKatli.Id,
                        ProductPriceId = kajuPrice.Id,
                        Quantity = 2,
                        UnitPrice = kajuPrice.Price,
                        TotalPrice = kajuPrice.Price * 2
                    }
                ]
            }
        };

        // Deduct quantities
        kajuPrice.StockQuantity -= 3;
        rasgullaPrice.StockQuantity -= 10;
        samosaPrice.StockQuantity -= 4;

        context.Orders.AddRange(orders);
        context.SaveChanges();
    }
}
