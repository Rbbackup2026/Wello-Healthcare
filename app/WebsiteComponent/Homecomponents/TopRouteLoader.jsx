"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAVIGATION_START_EVENT } from "../../utils/navigationLoader";

const TopRouteLoader = () => {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef([]);
  const pendingRef = useRef(false);
  const pathnameRef = useRef(pathname);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => {
      clearInterval(timerId);
      clearTimeout(timerId);
    });
    timersRef.current = [];
  }, []);

  const start = useCallback(() => {
    clearTimers();
    pendingRef.current = true;
    setActive(true);
    setProgress(14);

    const intervalId = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 92) return value;
        return value + Math.random() * 10;
      });
    }, 180);
    timersRef.current.push(intervalId);
  }, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);

    const timeoutId = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
      pendingRef.current = false;
    }, 280);
    timersRef.current.push(timeoutId);
  }, [clearTimers]);

  useEffect(() => {
    const handleClick = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = event.target?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === pathnameRef.current && !url.search) return;
      } catch {
        return;
      }

      start();
    };

    const handleNavigationStart = () => start();

    document.addEventListener("click", handleClick, true);
    window.addEventListener(NAVIGATION_START_EVENT, handleNavigationStart);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener(NAVIGATION_START_EVENT, handleNavigationStart);
      clearTimers();
    };
  }, [clearTimers, start]);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;

    pathnameRef.current = pathname;

    if (pendingRef.current) {
      complete();
    }
  }, [pathname, complete]);

  if (!active && progress === 0) return null;

  return (
    <div
      className="wello-route-loader"
      role="progressbar"
      aria-hidden={!active}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div className="wello-route-loader-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default TopRouteLoader;
