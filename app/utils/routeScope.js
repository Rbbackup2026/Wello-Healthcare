/** True on admin login and admin dashboard routes — hide customer-only UI here */
export const isAdminAppRoute = (pathname = "") => {
  if (!pathname) return false;
  return pathname === "/admin_index" || pathname.startsWith("/admin");
};
