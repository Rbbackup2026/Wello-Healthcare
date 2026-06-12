"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { startNavigationLoader } from "../utils/navigationLoader";

export const useAppRouter = () => {
  const router = useRouter();

  return useMemo(
    () => ({
      ...router,
      push: (...args) => {
        startNavigationLoader();
        return router.push(...args);
      },
      replace: (...args) => {
        startNavigationLoader();
        return router.replace(...args);
      },
    }),
    [router]
  );
};
