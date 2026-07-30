"use client";

import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import { useParams as useNextParams, usePathname, useRouter } from "next/navigation";
import { startNavigationLoader } from "../utils/navigationLoader";

export function Link({ to, href, children, ...props }) {
  return (
    <NextLink href={href || to || "#"} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return useCallback((target, options = {}) => {
    if (typeof target === "number") {
      if (target < 0) {
        router.back();
      }
      return;
    }

    if (!target) return;

    startNavigationLoader();

    if (options.replace) {
      router.replace(target);
      return;
    }

    router.push(target);
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSearch(window.location.search || "");
  }, [pathname]);

  return {
    pathname: pathname || "/",
    search,
    hash: "",
  };
}

export function useParams() {
  return useNextParams() || {};
}

export function Navigate({ to, replace = false }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}

export function Outlet({ children = null }) {
  return children;
}
