import test from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, savedDetails, validCart, reconcileCart, deliveryFee, parseTrackingCode } from "../src/checkout.js";
import { readStored, writeStored, getAdminToken } from "../src/storage.js";

test("Indian phone normalization rejects symbols and accepts the country prefix", () => {
  assert.equal(normalizePhone("+91 98765-43210"), "9876543210");
  assert.equal(normalizePhone("919876543210"), "9876543210");
  for (const invalid of ["++++++++++", "1234567890", "987654321", "9876543210x"])
    assert.equal(normalizePhone(invalid), null);
});
test("Saved details never restore order notes or unexpected fields", () => {
  const details = savedDetails({ name: "Customer", pincode: "232103", notes: "Private delivery instruction", token: "secret", phone: {} });
  assert.equal(details.name, "Customer"); assert.equal(details.pincode, "232103");
  assert.equal(details.notes, ""); assert.equal(details.phone, ""); assert.equal(details.token, undefined);
});
test("Corrupt carts are discarded or sanitized before rendering", () => {
  assert.deepEqual(validCart({}), []);
  assert.deepEqual(validCart([{ productId: 1, variantId: 2, quantity: -1, price: 50 }]), []);
  const items = validCart([{ productId: 1, variantId: 2, quantity: 1, price: 50, productName: {}, unit: {} }]);
  assert.equal(items[0].productName, "Sweet"); assert.equal(items[0].unit, "Pack");
});
test("Cart reconciliation removes unavailable products and refreshes price and stock", () => {
  const cart = [{ productId: 1, variantId: 2, price: 20, quantity: 4 }, { productId: 3, variantId: 4, price: 5, quantity: 1 }];
  const result = reconcileCart(cart, [{ id: 1, name: "Sweet", isActive: true, prices: [{ id: 2, unit: "Box", price: 25, stockQuantity: 2, isAvailable: true }] }]);
  assert.equal(result.length, 1); assert.equal(result[0].price, 25); assert.equal(result[0].quantity, 2);
});
test("Delivery fee switches exactly at ₹100", () => {
  const shop = { freeDeliveryFrom: 100, deliveryFee: 15 };
  assert.equal(deliveryFee(50, shop), 15); assert.equal(deliveryFee(99.99, shop), 15);
  assert.equal(deliveryFee(100, shop), 0); assert.equal(deliveryFee(150, shop), 0);
});
test("An order reference alone is not a private tracking code", () => {
  assert.equal(parseTrackingCode("PSH-20261015-1234"), null);
  assert.equal(parseTrackingCode("PSH-20261015-1234." + "a".repeat(64)).token.length, 64);
});
test("Malformed or blocked browser storage does not break checkout", t => {
  const prior = globalThis.window;
  t.after(() => { if (prior === undefined) delete globalThis.window; else globalThis.window = prior; });
  globalThis.window = { localStorage: { getItem: () => "{broken", setItem: () => { throw new Error("Blocked"); } } };
  assert.equal(readStored("delivery_details", null), null);
  assert.equal(writeStored("delivery_details", { name: "Test" }), false);
});
test("Admin token is read only from session storage", t => {
  const prior = globalThis.window;
  t.after(() => { if (prior === undefined) delete globalThis.window; else globalThis.window = prior; });
  globalThis.window = { localStorage: { getItem: () => JSON.stringify("old persistent token") }, sessionStorage: { getItem: () => JSON.stringify("session token") } };
  assert.equal(getAdminToken(), "session token");
});
