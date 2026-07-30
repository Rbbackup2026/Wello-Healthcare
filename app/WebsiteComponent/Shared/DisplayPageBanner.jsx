"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getBannerImageByViewport,
  MOBILE_BANNER_BREAKPOINT,
} from "../../utils/bannerImageUtils";
import {
  bannerHasDisplay,
  bannerMatchesCity,
  bannerMatchesPathologyContext,
  bannerMatchesRadiologyContext,
  categoryLabelsMatch,
  fetchActiveBannersByDisplay,
} from "../../utils/bannerApi";

const AUTO_DELAY = 10000;

const DisplayPageBanner = ({
  display,
  city,
  categoryId = "",
  categoryName = "",
  diseaseId = "",
  className = "",
  excludeCategoryNames = [],
}) => {
  const [banners, setBanners] = useState([]);
  const [displayed, setDisplayed] = useState(0);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BANNER_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchActiveBannersByDisplay(display);
        const filtered = data
          .filter((banner) => bannerHasDisplay(banner, display))
          .filter((banner) => bannerMatchesCity(banner, city))
          .filter((banner) => {
            if (display === "pathology") {
              const isExcludedCategory = excludeCategoryNames.some(
                (name) =>
                  banner.pathologyTarget === "category" &&
                  categoryLabelsMatch(banner.categoryName, name)
              );
              if (isExcludedCategory) return false;

              return bannerMatchesPathologyContext(banner, {
                categoryId,
                categoryName,
                diseaseId,
              });
            }
            if (display === "radiology") {
              return bannerMatchesRadiologyContext(banner, {
                categoryId,
                categoryName,
                diseaseId,
              });
            }
            return true;
          });
        setBanners(filtered);
        setDisplayed(0);
        setCurrent(0);
      } catch (error) {
        console.error(`${display} banner fetch error:`, error);
      }
    };

    load();
  }, [display, city, categoryId, categoryName, diseaseId, excludeCategoryNames]);

  const total = banners.length;

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

  const goNext = useCallback(() => goTo(current + 1, "next"), [current, goTo, total]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(goNext, AUTO_DELAY);
    return () => clearInterval(timer);
  }, [goNext, total]);

  if (banners.length === 0) return null;

  const banner = banners[displayed];
  const imageSrc = getBannerImageByViewport(banner, isMobile);
  if (!imageSrc) return null;

  return (
    <section
      className={`wello-hero page-display-banner ${className}`.trim()}
      aria-label="Promotional banners"
    >
      <div className="wello-banner-slider">
        <div
          className={`wello-banner-slide ${
            animating ? `exit-${direction}` : `enter-${direction}`
          }`}
          key={`banner-slide-${displayed}`}
        >
          <img
            src={imageSrc}
            alt={`${display} banner ${displayed + 1}`}
            decoding="async"
            fetchPriority={displayed === 0 ? "high" : "auto"}
            onClick={() => banner.link && window.open(banner.link, "_self")}
            className={banner.link ? "wello-banner-clickable" : ""}
          />
        </div>
      </div>

      {total > 1 ? (
        <div className="wello-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`wello-dot ${index === displayed ? "active" : ""}`}
              onClick={() => goTo(index, index > displayed ? "next" : "prev")}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default DisplayPageBanner;
