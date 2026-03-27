import { useEffect, useState } from "react";
import { CATS, BADGE_COLORS } from "../mockData";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const Stars = ({ r }) => (
  <span style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 20 20" fill={i <= Math.floor(r) ? "#C9A84C" : "#E5E5E5"} style={{ width: 13, height: 13 }}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

const StatIcon = ({ kind }) => {
  const style = { width: 13, height: 13, color: "#E2BF63", verticalAlign: "middle" };
  if (kind === "products") return <svg viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M11.47 1.43a1 1 0 0 1 1.06 0l8 4.5a1 1 0 0 1 0 1.74l-8 4.5a1 1 0 0 1-1.06 0l-8-4.5a1 1 0 0 1 0-1.74l8-4.5zM4 9.2l6.5 3.65v7.4L4.52 16.9A1 1 0 0 1 4 16V9.2zm16 0V16a1 1 0 0 1-.52.9L13.5 20.25v-7.4L20 9.2z" /></svg>;
  if (kind === "categories") return <svg viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M3 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm0 11a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3zm11-1a2 2 0 0 1 2-2h3a2 2 0 0 1 0 4h-3a2 2 0 0 1-2-2zm2-12h3a2 2 0 1 1 0 4h-3a2 2 0 1 1 0-4z" /></svg>;
  if (kind === "price") return <svg viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M7 3a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H10.24l3.72 6H18a1 1 0 1 1 0 2h-3.04L10.24 20H18a1 1 0 1 1 0 2H8a1 1 0 0 1-.86-1.5L11.6 12 7.14 4.5A1 1 0 0 1 7 4V3zM4 8a1 1 0 0 1 1-1h4.2a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm0 8a1 1 0 0 1 1-1h4.2a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M4 19a1 1 0 0 1-1-1V8a1 1 0 1 1 2 0v10a1 1 0 0 1-1 1zm5 0a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v6a1 1 0 0 1-1 1zm5 0a1 1 0 0 1-1-1V5a1 1 0 1 1 2 0v13a1 1 0 0 1-1 1zm5 0a1 1 0 0 1-1-1v-9a1 1 0 1 1 2 0v9a1 1 0 0 1-1 1z" /></svg>;
};

const RowActionIcon = ({ kind }) => {
  const style = { width: 15, height: 15, color: kind === "edit" ? "#E2BF63" : "#F3C1BD" };
  if (kind === "edit") return <svg viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M17.1 2.9a3 3 0 0 1 4.2 4.2L9.5 18.9a1 1 0 0 1-.46.26l-4.8 1.2a1 1 0 0 1-1.22-1.22l1.2-4.8a1 1 0 0 1 .26-.46L17.1 2.9zM15.7 6.3l2 2 1.2-1.2-2-2-1.2 1.2z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" style={style}><path d="M9 3a2 2 0 0 0-2 2v1H4a1 1 0 1 0 0 2h1l1 11a3 3 0 0 0 2.99 2.73h6.02A3 3 0 0 0 18 19L19 8h1a1 1 0 1 0 0-2h-3V5a2 2 0 0 0-2-2H9zm0 3V5h6v1H9zm1.5 4a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1z" /></svg>;
};

export default function AdminPanel({ products, setProducts, onBack, onOrders }) {
  const { logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", category: "Daily Wear", price: "", fabric: "", desc: "", imgUrl: "", badge: "New" });

  useEffect(() => {
    if (!showForm && !delConfirm) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showForm, delConfirm]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", category: "Daily Wear", price: "", fabric: "", desc: "", imgUrl: "", badge: "New" });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, price: p.price, fabric: p.fabric, desc: p.desc, imgUrl: p.imgs[0], badge: p.badge });
    setShowForm(true);
  };

  const save = () => {
    if (!form.name || !form.price) return;
    const data = {
      name: form.name,
      category: form.category,
      price: +form.price,
      fabric: form.fabric,
      desc: form.desc,
      badge: form.badge,
      rating: 4.8,
      reviews: 0,
      imgs: [form.imgUrl || "https://images.unsplash.com/photo-1594938298603-c8148c4b2a4e?w=600&q=80"],
    };

    if (editing) {
      setProducts((p) => p.map((x) => (x.id === editing.id ? { ...x, ...data } : x)));
      showToast("Product updated.");
    } else {
      setProducts((p) => [...p, { ...data, id: Date.now() }]);
      showToast("Product added.");
    }
    setShowForm(false);
  };

  const del = (id) => {
    setProducts((p) => p.filter((x) => x.id !== id));
    setDelConfirm(null);
    showToast("Product deleted.");
  };

  const avgPrice = products.length ? Math.round(products.reduce((a, p) => a + p.price, 0) / products.length) : 0;
  const avgRating = products.length ? (products.reduce((a, p) => a + p.rating, 0) / products.length).toFixed(1) : "0.0";

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3F0" }}>
      <div style={{ background: "var(--charcoal)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="admin-header" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={36} />
            <div>
              <span className="font-display" style={{ fontSize: 18, color: "#FAF8F5" }}>Admin Panel</span>
              <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "'Jost',sans-serif", letterSpacing: "0.1em" }}>FARAZ ABAYA</div>
            </div>
          </div>
          <div className="admin-actions-wrap">
            <div className="admin-primary">
              <button className="admin-btn admin-btn-add" onClick={openAdd}>+ Add Product</button>
            </div>
            <div className="admin-secondary">
              <button className="admin-btn admin-btn-ghost" onClick={onOrders}>Order Management</button>
              <button className="admin-btn admin-btn-ghost" onClick={onBack}>{"\u2190"} Store</button>
              <button className="admin-btn admin-btn-ghost" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {toast && <div style={{ background: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontFamily: "'Jost',sans-serif", fontSize: 14, color: "#276749" }}>{toast}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
          {[["Total Products", products.length, "products"], ["Categories", new Set(products.map((p) => p.category)).size, "categories"], ["Avg. Price", `\u20B9${avgPrice.toLocaleString()}`, "price"], ["Avg. Rating", `${avgRating} ★`, "rating"]].map(([l, v, icon]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Jost',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 23, height: 23, borderRadius: 999, border: "1px solid rgba(201,168,76,.45)", background: "linear-gradient(155deg, #1E1E22, #2A2A2F)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 2px 5px rgba(0,0,0,.18)" }}>
                  <StatIcon kind={icon} />
                </span>
                <span>{l}</span>
              </div>
              <div className="font-display" style={{ fontSize: 32, fontWeight: 600, color: "var(--charcoal)", marginTop: 6 }}>
                {typeof v === "string" && v.startsWith("\u20B9") ? (
                  <>
                    <span className="currency-symbol">{"\u20B9"}</span>{v.slice(1)}
                  </>
                ) : (
                  v
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 24 }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(201,168,76,.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="font-display" style={{ fontSize: 20, fontWeight: 600, color: "var(--charcoal)" }}>Product Inventory</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'Jost',sans-serif" }}>{products.length} items</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--pearl-dark)" }}>
                  {["Product", "Category", "Price", "Fabric", "Rating", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 18px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "'Jost',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className="admin-row" style={{ borderBottom: "1px solid rgba(201,168,76,.08)", background: i % 2 ? "rgba(250,248,245,.5)" : "#fff" }}>
                    <td data-label="Product" style={{ padding: "14px 18px" }}>
                      <div className="admin-product-cell" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={p.imgs[0]} alt={p.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover" }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--charcoal)", fontFamily: "'Jost',sans-serif" }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "'Jost',sans-serif", fontWeight: 600 }}>{p.badge}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category" style={{ padding: "14px 18px", fontFamily: "'Jost',sans-serif", fontSize: 13 }}>{p.category}</td>
                    <td data-label="Price" style={{ padding: "14px 18px" }}>
                      <span className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>
                        <span className="currency-symbol">{"\u20B9"}</span>{p.price.toLocaleString()}
                      </span>
                    </td>
                    <td data-label="Fabric" style={{ padding: "14px 18px", fontFamily: "'Jost',sans-serif", fontSize: 13, color: "var(--text-muted)" }}>{p.fabric}</td>
                    <td data-label="Rating" style={{ padding: "14px 18px" }}><div style={{ display: "flex", alignItems: "center", gap: 5 }}><Stars r={p.rating} /><span style={{ fontSize: 12, fontFamily: "'Jost',sans-serif" }}>{p.rating}</span></div></td>
                    <td data-label="Actions" style={{ padding: "14px 18px" }}>
                      <div className="admin-actions-cell" style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(p)} style={{ background: "linear-gradient(145deg, #1E1E22, #2A2A2F)", border: "1px solid rgba(201,168,76,.28)", cursor: "pointer", borderRadius: 10, width: 34, height: 34, display: "grid", placeItems: "center", boxShadow: "0 2px 5px rgba(0,0,0,.18)" }}>
                          <RowActionIcon kind="edit" />
                        </button>
                        <button onClick={() => setDelConfirm(p)} style={{ background: "linear-gradient(145deg, #3A2020, #522828)", border: "1px solid rgba(243,193,189,.28)", cursor: "pointer", borderRadius: 10, width: 34, height: 34, display: "grid", placeItems: "center", boxShadow: "0 2px 5px rgba(80,20,20,.18)" }}>
                          <RowActionIcon kind="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label={editing ? "Edit Product" : "Add Product"}>
            <div className="admin-modal-header" style={{ padding: "18px 22px", borderBottom: "1px solid rgba(201,168,76,.2)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff" }}>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 600, color: "var(--charcoal)" }}>{editing ? "Edit Product" : "Add New Product"}</span>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text-muted)" }}>&times;</button>
            </div>
            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Product Name *", "name", "text", "e.g., Nida Pearl Abaya"], ["Price (\u20B9) *", "price", "number", "e.g., 1999"], ["Fabric", "fabric", "text", "e.g., Premium Nida"], ["Image URL", "imgUrl", "text", "https://..."]].map(([lbl, key, type, ph]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--charcoal)", fontFamily: "'Jost',sans-serif", display: "block", marginBottom: 6 }}>{lbl}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={ph}
                    style={{ width: "100%", padding: "11px 15px", borderRadius: 12, border: "1.5px solid rgba(201,168,76,.3)", fontFamily: "'Jost',sans-serif", fontSize: 13 }}
                  />
                </div>
              ))}
              {[["Category", "category", CATS.slice(1)], ["Badge", "badge", Object.keys(BADGE_COLORS)]].map(([lbl, key, opts]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--charcoal)", fontFamily: "'Jost',sans-serif", display: "block", marginBottom: 6 }}>{lbl}</label>
                  <select
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "11px 15px", borderRadius: 12, border: "1.5px solid rgba(201,168,76,.3)", fontFamily: "'Jost',sans-serif", fontSize: 13 }}
                  >
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--charcoal)", fontFamily: "'Jost',sans-serif", display: "block", marginBottom: 6 }}>Description</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  placeholder="Describe the product..."
                  rows={3}
                  style={{ width: "100%", padding: "11px 15px", borderRadius: 12, border: "1.5px solid rgba(201,168,76,.3)", fontFamily: "'Jost',sans-serif", fontSize: 13, resize: "none" }}
                />
              </div>
            </div>
            <div style={{ padding: "0 22px 22px", display: "flex", gap: 10 }}>
              <button className="btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 13, borderRadius: 14, fontFamily: "'Jost',sans-serif", fontSize: 14 }}>Cancel</button>
              <button className="btn-gold" onClick={save} style={{ flex: 1, padding: 13, borderRadius: 14, fontFamily: "'Jost',sans-serif", fontSize: 14 }}>{editing ? "Save Changes" : "Add Product"}</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setDelConfirm(null)}>
          <div className="admin-modal admin-modal-sm" role="dialog" aria-modal="true" aria-label="Delete Product">
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#FFF5F5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <RowActionIcon kind="delete" />
              </div>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 600, color: "var(--charcoal)", marginBottom: 10 }}>Delete Product?</div>
              <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                Are you sure you want to delete <strong style={{ color: "var(--charcoal)" }}>{delConfirm.name}</strong>? This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-outline" onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: 13, borderRadius: 14, fontFamily: "'Jost',sans-serif", fontSize: 14 }}>Cancel</button>
                <button onClick={() => del(delConfirm.id)} style={{ flex: 1, padding: 13, borderRadius: 14, background: "#9B1C1C", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontSize: 14, fontWeight: 600 }}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
