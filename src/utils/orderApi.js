const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

export async function saveOrderToSheet(payload) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Unable to save order.");
  }
  return data;
}
