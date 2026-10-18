-- Additive upgrade for databases originally created using EnsureCreated.
-- Run before deploying this version in production. Development applies it on startup.
IF COL_LENGTH('dbo.Orders', 'RequestKey') IS NULL
    ALTER TABLE [dbo].[Orders] ADD [RequestKey] nvarchar(64) NULL;
IF COL_LENGTH('dbo.Orders', 'RequestHash') IS NULL
    ALTER TABLE [dbo].[Orders] ADD [RequestHash] nvarchar(64) NULL;
IF COL_LENGTH('dbo.Orders', 'DeliveryFee') IS NULL
    ALTER TABLE [dbo].[Orders] ADD [DeliveryFee] decimal(18,2) NOT NULL CONSTRAINT [DF_Orders_DeliveryFee] DEFAULT 0;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Orders_RequestKey'
    AND object_id = OBJECT_ID('dbo.Orders'))
    EXEC('CREATE UNIQUE INDEX [IX_Orders_RequestKey] ON [dbo].[Orders] ([RequestKey]) WHERE [RequestKey] IS NOT NULL');

-- Correct the known legacy copy/paste error, preserving edited descriptions.
UPDATE [dbo].[Products]
SET [Description] = N'Traditional syrup-soaked sweet spirals, freshly prepared.'
WHERE [Name] = N'Jilebi' AND [Description] = N'Soft, flattened chhena patties soaked in sweet, thickened milk, flavored with saffron, cardamom, and chopped pistachios.';
