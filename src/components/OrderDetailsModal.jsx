import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const INITIAL_FORM = { name: "", phone: "", email: "", address: "" };

export default function OrderDetailsModal({ open, onClose, onSubmit, loading = false, error = "" }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setTouched({});
    }
  }, [open]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!/^\+?[0-9]{10,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email.";
    if (!form.address.trim()) e.address = "Address is required.";
    return e;
  }, [form]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, address: true });
    if (Object.keys(errors).length) return;
    await onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    });
  };

  const modalNode = (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal order-modal" role="dialog" aria-modal="true" aria-label="Order details form">
        <div className="admin-modal-header" style={{ padding: "18px 22px", borderBottom: "1px solid rgba(201,168,76,.2)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff" }}>
          <span className="font-display" style={{ fontSize: 24, color: "var(--charcoal)" }}>Customer Details</span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text-muted)" }}>
            &times;
          </button>
        </div>

        <form onSubmit={submit} className="order-modal-form" style={{ padding: 22, display: "grid", gap: 12 }}>
          {[
            ["Full Name", "name", "text", "Enter full name"],
            ["Phone Number", "phone", "tel", "e.g. 9876543210"],
            ["Email", "email", "email", "e.g. name@email.com"],
          ].map(([label, key, type, placeholder]) => (
            <div key={key}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontFamily: "'Jost',sans-serif", color: "var(--charcoal)", fontWeight: 600 }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
                placeholder={placeholder}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(201,168,76,.3)", fontFamily: "'Jost',sans-serif", fontSize: 14 }}
              />
              {touched[key] && errors[key] && <div style={{ marginTop: 4, color: "#b42318", fontSize: 12 }}>{errors[key]}</div>}
            </div>
          ))}

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontFamily: "'Jost',sans-serif", color: "var(--charcoal)", fontWeight: 600 }}>Address</label>
            <textarea
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              rows={3}
              placeholder="Enter delivery address"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(201,168,76,.3)", fontFamily: "'Jost',sans-serif", fontSize: 14, resize: "vertical" }}
            />
            {touched.address && errors.address && <div style={{ marginTop: 4, color: "#b42318", fontSize: 12 }}>{errors.address}</div>}
          </div>

          {error && <div style={{ color: "#b42318", fontSize: 13 }}>{error}</div>}

          <div className="order-modal-actions" style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" className="btn-outline" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 14, fontFamily: "'Jost',sans-serif" }}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 14, fontFamily: "'Jost',sans-serif", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Continue to WhatsApp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : modalNode;
}
