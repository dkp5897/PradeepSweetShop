export const EMPTY_DETAILS = { name: "", phone: "", email: "", address: "", pincode: "", notes: "" };

export function normalizePhone(input) {
  if (typeof input !== "string" || !/^\+?[0-9 -]+$/.test(input)) return null;
  let number = input.replace(/[ -]/g, "");
  if (number.startsWith("+91")) number = number.slice(3);
  else if (number.length === 12 && number.startsWith("91")) number = number.slice(2);
  return /^[6-9][0-9]{9}$/.test(number) ? number : null;
}

export function savedDetails(value) {
  if (!value || typeof value !== "object") return { ...EMPTY_DETAILS };
  return Object.fromEntries(Object.keys(EMPTY_DETAILS).map(key =>
    [key, key !== "notes" && typeof value[key] === "string" ? value[key].slice(0, key === "address" ? 500 : 254) : ""]));
}

export function validCart(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && Number.isInteger(item.productId) && item.productId > 0 &&
    Number.isInteger(item.variantId) && item.variantId > 0 && Number.isInteger(item.quantity) &&
    item.quantity > 0 && item.quantity <= 100 && Number.isFinite(item.price) && item.price > 0 && item.price <= 1000000)
    .slice(0, 50).map(item => ({ productId: item.productId, variantId: item.variantId,
      quantity: item.quantity, price: item.price,
      productName: typeof item.productName === "string" ? item.productName : "Sweet",
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "",
      unit: typeof item.unit === "string" ? item.unit : "Pack",
      maxStock: Number.isInteger(item.maxStock) && item.maxStock >= 0 ? item.maxStock : item.quantity }));
}

export function reconcileCart(cart, products) {
  return cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    const variant = product?.prices?.find(p => p.id === item.variantId && p.isAvailable && p.stockQuantity > 0);
    if (!product?.isActive || !variant) return null;
    return { ...item, productName: product.name, imageUrl: product.imageUrl,
      unit: variant.unit, price: variant.price, maxStock: variant.stockQuantity,
      quantity: Math.min(item.quantity, variant.stockQuantity, 100) };
  }).filter(Boolean);
}

export function privateTrackingCode(order) {
  return order?.orderNumber && order?.trackingToken ? `${order.orderNumber}.${order.trackingToken}` : "";
}

export function deliveryFee(subtotal, shop) {
  return shop && subtotal < shop.freeDeliveryFrom ? shop.deliveryFee : 0;
}

export function parseTrackingCode(value) {
  const match = /^([A-Za-z0-9-]{1,100})\.([a-fA-F0-9]{64})$/.exec(value.trim());
  return match ? { orderNumber: match[1], token: match[2] } : null;
}
