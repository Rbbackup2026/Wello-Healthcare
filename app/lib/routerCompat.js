"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useParams as useNextParams, usePathname, useRouter } from "next/navigation";

export function Link({ to, href, children, ...props }) {
  return (
    <NextLink href={href || to || "#"} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return (target, options = {}) => {
    if (typeof target === "number") {
      if (target < 0) {
        router.back();
      }
      return;
    }

    if (!target) return;

    if (options.replace) {
      router.replace(target);
      return;
    }

    router.push(target);
  };
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
