export function formatPrice(value) {
  return `\u20B9${Number(value).toLocaleString()}`;
}

export function buildWhatsAppMessage(items) {
  const safeItems = items.filter(Boolean);
  const lines = ["Assalamu Alaikum! I want to order:"];
  safeItems.forEach((item, idx) => {
    lines.push("");
    lines.push(`${idx + 1}. ${item.name}`);
    lines.push(`Product ID: ${item.id}`);
    lines.push(`Price: ${formatPrice(item.price)}`);
    lines.push(`Quantity: ${item.qty}`);
    if (item.size) lines.push(`Size: ${item.size}`);
    lines.push(`Image URL: ${item.imgUrl}`);
  });
  const total = safeItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  lines.push("");
  lines.push(`Total: ${formatPrice(total)}`);
  lines.push("Please confirm availability. JazakAllah khair.");
  return lines.join("\n");
}

export function buildOrderWhatsAppMessage(customer, item) {
  const lines = [
    "🛍 *New Order - Faraz Abaya*",
    `👤 Name: ${customer.name}`,
    `📞 Phone: ${customer.phone}`,
    `📧 Email: ${customer.email}`,
    `📍 Address: ${customer.address}`,
    "",
    `🧕 Product: ${item.name}`,
    `💰 Price: ${formatPrice(item.price)}`,
    `🆔 Product ID: ${item.id}`,
    `🖼 Image: ${item.imageUrl}`,
  ];
  return lines.join("\n");
}

export function buildCartOrderWhatsAppMessage(customer, items) {
  const lines = [
    "🛍 *New Order - Faraz Abaya*",
    `👤 Name: ${customer.name}`,
    `📞 Phone: ${customer.phone}`,
    `📧 Email: ${customer.email}`,
    `📍 Address: ${customer.address}`,
    "",
  ];

  items.forEach((item, idx) => {
    lines.push(`${idx + 1}. 🧕 Product: ${item.name}`);
    lines.push(`   💰 Price: ${formatPrice(item.price)}`);
    lines.push(`   🆔 Product ID: ${item.id}`);
    lines.push(`   🖼 Image: ${item.imageUrl}`);
    if (item.qty) lines.push(`   Qty: ${item.qty}`);
    if (item.size) lines.push(`   Size: ${item.size}`);
    lines.push("");
  });

  return lines.join("\n");
}
