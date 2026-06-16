"use client";
import { useState, useEffect } from "react";
import { API_ORIGIN } from "../../../utils/api";


const BACKEND_URL = API_ORIGIN;

//css
const TYPE_CONFIG = {
  static: { color: "#3b82f6", bg: "#3b82f611", label: "Static" },
  product: { color: "#10b981", bg: "#10b98111", label: "Product" },
  category: { color: "#f59e0b", bg: "#f59e0b11", label: "Category" },
  blog: { color: "#a78bfa", bg: "#a78bfa11", label: "Blog" },
};

function getType(url) {
  if (url.includes("/product/")) return "product";
  if (url.includes("/blog/")) return "blog";
  if (url.includes("category=") || url.includes("/lab-tests")) return "category";
  return "static";
}

function parseXml(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const urls = doc.querySelectorAll("url");
  return Array.from(urls).map(url => ({
    loc: url.querySelector("loc")?.textContent || "",
    priority: url.querySelector("priority")?.textContent || "",
    lastmod: url.querySelector("lastmod")?.textContent || "",
    changefreq: url.querySelector("changefreq")?.textContent || "",
  }));
}

export default function SitemapViewer() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [xmlRaw, setXmlRaw] = useState("");
  const [showXml, setShowXml] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchSitemap = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/sitemap.xml`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setXmlRaw(text);
      const parsed = parseXml(text);
      setUrls(parsed);
      setLastFetched(new Date().toLocaleTimeString());
    } catch (err) {
      setError(`Sitemap load nahi hua: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSitemap(); }, []);

  const filtered = urls.filter(u => {
    const type = getType(u.loc);
    const matchType = filter === "all" || type === filter;
    const matchSearch = u.loc.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const counts = {
    all: urls.length,
    static: urls.filter(u => getType(u.loc) === "static").length,
    product: urls.filter(u => getType(u.loc) === "product").length,
    category: urls.filter(u => getType(u.loc) === "category").length,
    blog: urls.filter(u => getType(u.loc) === "blog").length,
  };

  const copyXml = () => {
    navigator.clipboard.writeText(xmlRaw);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "32px",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
              🗺️ Sitemap Manager
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              {lastFetched ? `Last updated: ${lastFetched}` : "Backend se live data"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowXml(!showXml)}
              style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
                padding: "9px 16px", fontSize: "13px", fontWeight: 600, color: "#475569",
                cursor: "pointer"
              }}
            >
              {showXml ? "🙈 Hide XML" : "👁️ View XML"}
            </button>
            <button
              onClick={fetchSitemap}
              disabled={loading}
              style={{
                background: loading ? "#94a3b8" : "#0f172a",
                border: "none", borderRadius: "8px",
                padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
            >
              {loading ? "⏳ Loading..." : "🔄 Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px",
          padding: "14px 18px", marginBottom: "20px", color: "#ef4444", fontSize: "13px"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {Object.entries(counts).map(([key, count]) => {
          const cfg = key === "all"
            ? { color: "#0f172a", bg: "#f1f5f9", label: "Total URLs" }
            : TYPE_CONFIG[key];
          return (
            <div
              key={key}
              onClick={() => setFilter(key)}
              style={{
                background: filter === key ? cfg.color : "#fff",
                border: `1px solid ${filter === key ? cfg.color : "#e2e8f0"}`,
                borderRadius: "12px", padding: "16px 18px",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: filter === key ? `0 4px 14px ${cfg.color}33` : "none"
              }}
            >
              <div style={{
                fontSize: "26px", fontWeight: 800,
                color: filter === key ? "#fff" : cfg.color
              }}>{count}</div>
              <div style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: filter === key ? "#ffffffaa" : "#94a3b8",
                marginTop: "2px"
              }}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* XML Raw View */}
      {showXml && xmlRaw && (
        <div style={{
          background: "#0f172a", borderRadius: "12px", padding: "20px",
          marginBottom: "24px", position: "relative"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>sitemap.xml</span>
            <button onClick={copyXml} style={{
              background: "#1e293b", border: "none", borderRadius: "6px",
              padding: "6px 14px", color: "#94a3b8", fontSize: "12px", cursor: "pointer"
            }}>📋 Copy</button>
          </div>
          <pre style={{
            color: "#7dd3fc", fontFamily: "monospace", fontSize: "11px",
            maxHeight: "280px", overflow: "auto", margin: 0, lineHeight: "1.6"
          }}>{xmlRaw}</pre>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 URL search karo..."
          style={{
            width: "100%", background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: "10px", padding: "11px 16px", fontSize: "13px",
            color: "#0f172a", outline: "none", boxSizing: "border-box"
          }}
        />
      </div>

      {/* URL Table */}
      <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {/* Table Head */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 80px 100px 100px",
          padding: "12px 20px", background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          fontSize: "11px", fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.08em"
        }}>
          <span>URL</span>
          <span>Type</span>
          <span>Priority</span>
          <span>Last Modified</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
            ⏳ Sitemap load ho raha hai...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
            Koi URL nahi mila
          </div>
        ) : (
          filtered.map((u, i) => {
            const type = getType(u.loc);
            const cfg = TYPE_CONFIG[type];
            const path = u.loc.replace(/^https?:\/\/[^/]+/, "");
            return (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 100px 100px",
                  padding: "13px 20px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <a
                    href={u.loc} target="_blank" rel="noreferrer"
                    style={{
                      color: "#0f172a", fontSize: "13px", fontFamily: "monospace",
                      textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", display: "block"
                    }}
                    title={u.loc}
                  >
                    {path || "/"}
                  </a>
                </div>
                <div>
                  <span style={{
                    background: cfg.bg, color: cfg.color,
                    padding: "3px 10px", borderRadius: "99px",
                    fontSize: "11px", fontWeight: 700
                  }}>{cfg.label}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#475569", fontWeight: 600 }}>
                  {u.priority || "—"}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {u.lastmod || "—"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "16px", textAlign: "right", fontSize: "12px", color: "#cbd5e1" }}>
        {filtered.length} / {urls.length} URLs showing
      </div>
    </div>
  );
}
