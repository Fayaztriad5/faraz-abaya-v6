import { useState } from "react";
import { BADGE_COLORS } from "../mockData";
import { useCart } from "../context/CartContext";

const Stars = ({ r }) => (
  <span style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} viewBox="0 0 20 20" fill={i <= Math.floor(r) ? "#C9A84C" : "#E5E5E5"} style={{ width: 12, height: 12 }}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" style={{ width: 17, height: 17 }} aria-hidden="true">
    <path
      d="M12 20.5l-1.3-1.2C5.5 14.6 2 11.4 2 7.5 2 4.4 4.4 2 7.5 2c1.8 0 3.5.8 4.5 2.1C13 2.8 14.7 2 16.5 2 19.6 2 22 4.4 22 7.5c0 3.9-3.5 7.1-8.7 11.8L12 20.5z"
      fill={filled ? "#9B1C1C" : "none"}
      stroke={filled ? "#9B1C1C" : "#7A5A10"}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ProductCard({ p, onView, prioritize = false }) {
  const [liked, setLiked] = useState(false);
  const [bc, tc] = BADGE_COLORS[p.badge] || ["#C9A84C", "#1C1C1E"];
  const { addItem, openCart } = useCart();

  const addToCart = () => {
    if (p.stockOut) return;
    addItem(p);
    openCart();
  };

  const src = p.imgs[0];
  const isUnsplash = typeof src === "string" && src.includes("images.unsplash.com/photo-");
  const buildUnsplashSrc = (w) =>
    `${src.split("?")[0]}?auto=format&fit=crop&crop=faces,entropy&w=${w}&h=${Math.round((w * 4) / 3)}&q=60`;

  return (
    <div className="card-hover" style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Image */}
      <div className="img-zoom" style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
        <img
          src={isUnsplash ? buildUnsplashSrc(360) : src}
          srcSet={isUnsplash ? `${buildUnsplashSrc(240)} 240w, ${buildUnsplashSrc(280)} 280w, ${buildUnsplashSrc(326)} 326w, ${buildUnsplashSrc(360)} 360w, ${buildUnsplashSrc(420)} 420w, ${buildUnsplashSrc(520)} 520w, ${buildUnsplashSrc(640)} 640w` : undefined}
          sizes="(max-width: 639px) 46vw, (max-width: 1099px) 30vw, 22vw"
          alt={p.name}
          loading={prioritize ? "eager" : "lazy"}
          fetchPriority={prioritize ? "high" : "auto"}
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: p.stockOut ? "grayscale(25%)" : "none", opacity: p.stockOut ? 0.88 : 1 }}
        />
        {p.stockOut && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.18)" }} />
        )}
        <span className="badge-pill" style={{ position: "absolute", top: 8, left: 8, background: bc, color: tc }}>{p.badge}</span>
        {p.stockOut && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
            <span style={{ background: "rgba(155,28,28,.92)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 999, fontFamily: "'Jost',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 6px 16px rgba(0,0,0,.2)" }}>
              Stock Out
            </span>
          </div>
        )}
        <button className="like-btn" onClick={() => setLiked(!liked)} aria-label="Wishlist">
          <HeartIcon filled={liked} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 10, color: "var(--gold-strong)", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif" }}>{p.category}</div>

        <div className="font-display card-name" style={{ fontWeight: 600, color: "var(--charcoal)", marginTop: 3, lineHeight: 1.28, minHeight: "2.56em" }}>{p.name}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "6px 0 10px" }}>
          <Stars r={p.rating} />
          <span style={{ fontSize: 12, color: "#4A4E54", fontFamily: "'Jost',sans-serif", fontWeight: 500 }}>({p.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          <div>
            {Number(p.mrp) > Number(p.price) && (
              <div className="font-display card-price" style={{ color: "#B22222", fontWeight: 700, textDecoration: "line-through", marginBottom: 2 }}>
                ₹{Number(p.mrp).toLocaleString()}
              </div>
            )}
            <span className="font-display card-price" style={{ fontWeight: 600, color: "var(--charcoal)" }}>₹{p.price.toLocaleString()}</span>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Jost',sans-serif", marginTop: 2 }}>{p.fabric}</div>
          </div>
        </div>

        {/* Full-width button on all sizes - cleaner on mobile */}
        <div style={{ display: "grid", gap: 9, marginTop: "auto", paddingTop: 10 }}>
          <button className="btn-gold btn-card-view" onClick={() => onView(p)}>
            View Details
          </button>
          <button className="btn-outline btn-card-view" onClick={addToCart} disabled={p.stockOut} style={{ opacity: p.stockOut ? 0.6 : 1, cursor: p.stockOut ? "not-allowed" : "pointer" }}>
            {p.stockOut ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
