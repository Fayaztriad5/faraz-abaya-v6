import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

const formatOrderDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export default function AdminOrders({ onBack, onStore }) {
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDate, setOrderDate] = useState("");

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (e) {
      setOrdersError(e.message || "Failed to fetch orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const dateISO = o.date ? new Date(o.date).toISOString().slice(0, 10) : "";
      const matchesSearch = !q || (o.name || "").toLowerCase().includes(q);
      const matchesDate = !orderDate || dateISO === orderDate;
      return matchesSearch && matchesDate;
    });
  }, [orders, orderSearch, orderDate]);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3F0" }}>
      <div style={{ background: "var(--charcoal)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="admin-header" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={36} />
            <div>
              <span className="font-display" style={{ fontSize: 18, color: "#FAF8F5" }}>Order Management</span>
              <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "'Jost',sans-serif", letterSpacing: "0.1em" }}>FARAZ ABAYA</div>
            </div>
          </div>
          <div className="admin-actions-wrap">
            <div className="admin-secondary">
              <button className="admin-btn admin-btn-ghost" onClick={onBack}>{"\u2190"} Admin</button>
              <button className="admin-btn admin-btn-ghost" onClick={onStore}>Store</button>
              <button className="admin-btn admin-btn-ghost" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(201,168,76,.15)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <span className="font-display" style={{ fontSize: 20, fontWeight: 600, color: "var(--charcoal)" }}>Google Sheet Orders</span>
            <div className="orders-toolbar">
              <input className="orders-input" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search by customer" />
              <input className="orders-input" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
              <button className="btn-outline" onClick={fetchOrders} style={{ padding: "8px 12px", borderRadius: 10 }}>Refresh</button>
            </div>
          </div>

          {ordersError && <div style={{ padding: 16, color: "#b42318", fontFamily: "'Jost',sans-serif" }}>{ordersError}</div>}
          {ordersLoading ? (
            <div style={{ padding: 16, color: "var(--text-muted)", fontFamily: "'Jost',sans-serif" }}>Loading orders...</div>
          ) : (
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    {["Date", "Name", "Phone", "Email", "Address", "Product", "Price", "Product ID", "Image"].map((h) => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: "22px 10px" }}>No orders found</td>
                    </tr>
                  ) : (
                    filteredOrders.map((o, idx) => (
                      <tr key={`${o.productId}-${o.date}-${idx}`}>
                        <td>{formatOrderDate(o.date)}</td>
                        <td>{o.name || "-"}</td>
                        <td>{o.phone || "-"}</td>
                        <td>{o.email || "-"}</td>
                        <td>{o.address || "-"}</td>
                        <td>{o.product || "-"}</td>
                        <td>
                          {o.price ? (
                            <>
                              <span className="currency-symbol">{"\u20B9"}</span>{Number(o.price).toLocaleString()}
                            </>
                          ) : "-"}
                        </td>
                        <td>{o.productId || "-"}</td>
                        <td>
                          {o.imageUrl ? <img src={o.imageUrl} alt={o.product || "order"} className="order-thumb" /> : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
