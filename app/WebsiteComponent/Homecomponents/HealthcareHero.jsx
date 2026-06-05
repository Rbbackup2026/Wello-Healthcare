import React, { useState, useEffect, useCallback, memo } from "react";
import {
  FaArrowRight,
  FaChevronRight,
} from "react-icons/fa";

// â”€â”€ Apna backend URL yahan set karo â”€â”€
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// â”€â”€ Quick Actions (static) â”€â”€
const quickActions = [
  {
    title: "Book a Lab Test",
    desc: "Home Sample Collection",
    icon: "/images/Colorcopy.png",
    href: "/lab-tests",
  },
  {
    title: "Book Scans",
    desc: "700+ Labs",
    icon: "/images/mriscan.png",
    href: "/download-report",
  },
  {
    title: "Book with Prescription",
    desc: "Upload your prescription to book tests.",
    icon: "/images/Group.png",
    href: "/lab-tests",
  },
  {
    title: "Download Reports",
    desc: "Check E-Reports Status",
    icon: "/images/note 1.png",
    href: "/download-report",
  },
];

// â”€â”€ Static Hero (default â€” always shown jab koi API banner nahi) â”€â”€
const StaticHero = () => (
  <div className="wello-hero-grid">
    <div className="wello-hero-copy">
      <h1 className="wello-hero-title">
        <span className="wello-hero-plain">Your</span> <span className="wello-accent">trusted partner</span>
        <br />
        <span className="wello-hero-plain">in digital healthcare.</span>
      </h1>
      <p className="wello-hero-text">
        <strong>Empowering Your Health at Every Step.</strong>{" "}
        Experience personalized medical care from the comfort of your home.
        Connect with <strong>certified doctors</strong>, or manage
        prescriptions, and schedule appointments with ease. Ready to take
        control of your health? <strong>Get Started</strong> or Book an
        Appointment today.
      </p>
    </div>
    <div className="wello-hero-media">
      <img
        src="/images/homepage-doctor-crop.png"
        alt="Doctor appointment booking"
        width="540"
        height="511"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  </div>
);

// â”€â”€ Main Component â”€â”€
const HeroBannerSlider = () => {
  const [slides, setSlides]       = useState([{ type: "static" }]);
  const [displayed, setDisplayed] = useState(0);
  const [current, setCurrent]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const AUTO_DELAY = 10000;

  // Fetch home banners from API
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/v1/api/banner/getall?display=home&status=Active`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const apiBanners = data.sort((a, b) => a.sortId - b.sortId);
          setSlides([{ type: "static" }, ...apiBanners]);
        }
      } catch (e) {
        console.error("Banner fetch error:", e);
      }
    };
    load();
  }, []);

  const total = slides.length;

  const goTo = useCallback(
    (index, dir = "next") => {
      if (animating || total === 0) return;
      const next = (index + total) % total;
      setDirection(dir);
      setAnimating(true);
      setCurrent(next);
      setTimeout(() => {
        setDisplayed(next);
        setAnimating(false);
      }, 320);
    },
    [animating, total]
  );

  const goNext = useCallback(() => goTo(current + 1, "next"), [current, goTo]);

  // Auto-play â€” sirf tab jab 1 se zyada banners ho
  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(goNext, AUTO_DELAY);
    return () => clearInterval(t);
  }, [goNext, total]);

  return (
    <section className="wello-hero">

        <div className="wello-banner-slider">
          <div
            className={`wello-banner-slide ${animating ? `exit-${direction}` : `enter-${direction}`}`}
            key={`slide-${displayed}`}
          >
            {slides[displayed]?.type === "static" ? (
              <div className="wello-hero-inner">
                <StaticHero />
              </div>
            ) : (
              <img
                src={slides[displayed].webImage?.startsWith("http")
                  ? slides[displayed].webImage
                  : `${API_BASE}${slides[displayed].webImage}`}
                alt={`banner-${displayed + 1}`}
                decoding="async"
                fetchPriority={displayed === 0 ? "high" : "auto"}
                onClick={() => slides[displayed]?.link && window.open(slides[displayed].link, "_self")}
                className={slides[displayed]?.link ? "wello-banner-clickable" : ""}
              />
            )}
          </div>
        </div>

        <div className="wello-hero-border" aria-hidden="true"></div>

        {total > 1 && (
          <div className="wello-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`wello-dot ${i === displayed ? "active" : ""}`}
                onClick={() => goTo(i, i > displayed ? "next" : "prev")}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Quick Actions â€” hamesha dikhte hain */}
        <div className="wello-hero-inner wello-hero-actions-inner">
          <div className="wello-actions">
            {quickActions.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`wello-action-card ${
                  item.title === "Book a Lab Test"
                    ? "lab-test-card"
                    : item.title === "Book Scans"
                    ? "book-scans-card"
                    : item.title === "Book with Prescription"
                    ? "prescription-card"
                    : item.title === "Download Reports"
                    ? "reports-card"
                    : ""
                }`}
              >
                <div className="wello-action-content">
                  <div className="wello-action-icon">
                    <img src={item.icon} alt={item.title} decoding="async" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <span className="wello-action-arrow">
                  <FaArrowRight />
                </span>
              </a>
            ))}
          </div>
        </div>

      </section>
  );
};

export default memo(HeroBannerSlider);
