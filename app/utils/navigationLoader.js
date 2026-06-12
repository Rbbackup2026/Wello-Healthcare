export const NAVIGATION_START_EVENT = "wello:navigation-start";

export const startNavigationLoader = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
};
