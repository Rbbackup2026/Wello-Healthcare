"use client";

import React, { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  Web as WebIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Article as ArticleIcon,
  Map as MapIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "../../lib/routerCompat";
import Profile from "../Profile/Profile";
import AdminAxiosAuth from "./AdminAxiosAuth";

const drawerWidth = 260;

/* ─────────────────── Styled helpers ─────────────────── */

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

/* ─────────────────── Nav config ─────────────────── */

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon sx={{ fontSize: "1.2rem" }} />,
    to: "/admin",
  },
  {
    id: "items",
    label: "Items",
    icon: <CategoryIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "Items", to: "/admin/item_list" },
      { label: "Category", to: "/admin/category_list" },
      { label: "Diseases", to: "/admin/item_diseases_list" },
      { label: "Department", to: "/admin/item_department_list" },
      { label: "Key Features", to: "/admin/item_key_fetures_list" },
      { label: "Type", to: "/admin/item_type_list" },
      { label: "Category Banner", to: "/admin/item_category_banner_list" },
      { label: "Diseases Banner", to: "/admin/item_diseases_banner_list" },
      { label: "Certificate Type", to: "/admin/item_certificate_list" },
      { label: "Lab", to: "/admin/item_lab_list" },
      { label: "Discount COUPON", to: "/admin/discount" },
    ],
  },
  {
    id: "orders",
    label: "Manage Orders",
    icon: <ShoppingCartIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "Order Master", to: "/admin/order_list" },
      { label: "Order Report", to: "/admin/order_report" },
    ],
  },
  {
    id: "website",
    label: "Manage Website",
    icon: <WebIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "Banner List", to: "/admin/bannerlist" },
      { label: "Page List", to: "/admin/pagelist" },
      { label: "Testimonials", to: "/admin/manage_testimonials" },
      { label: "FAQs", to: "/admin/manage_faqs" },
    ],
  },
  {
    id: "blog",
    label: "Manage Blog",
    icon: <ArticleIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "All Blogs", to: "/admin/manage_blogs" },
      { label: "Add Blog", to: "/admin/add_blog" },
      { label: "Blog Categories", to: "/admin/blog_categories" },
      { label: "Tags", to: "/admin/blog_tags" },
    ],
  },
  {
    id: "location",
    label: "Manage Locations",
    icon: <LocationIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "Countries", to: "/admin/manage_countries" },
      { label: "States", to: "/admin/manage_states" },
      { label: "Cities", to: "/admin/manage_cities" },
      { label: "Areas/Localities", to: "/admin/manage_areas" },
      { label: "Pincodes", to: "/admin/manage_pincodes" },
      { label: "Service Availability", to: "/admin/service_availability" },
    ],
  },
  {
    id: "leads",
    label: "CRM / Leads",
    icon: <PersonAddIcon sx={{ fontSize: "1.2rem" }} />,
    to: "/admin/lead_list",
  },
  {
    id: "users",
    label: "Users",
    icon: <PeopleIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "User List", to: "/admin/customer_list" },
      { label: "CRM Leads", to: "/admin/lead_list" },
      { label: "Newsletter List", to: "/admin/newsletter_list" },
      { label: "Contact Inquiry", to: "/admin/help_list" },
      { label: "Get In Touch Inquiry", to: "/admin/get_tuch_inq_list" },
      { label: "Collection Appointment", to: "/admin/collection_appointment_list" },
      { label: "Test Booking Enquiry", to: "/admin/test_booking_enquiry_list" },
    ],
  },
  {
    id: "users-wallet",
    label: "Users & Wallet",
    icon: <AccountBalanceWalletIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "Users & Wallet", to: "/admin/customer_list" },
      { label: "Abandoned Cart", to: "/admin/abandoned_cart" },
      { label: "User Cart Notification", to: "/admin/notification_logs" },
    ],
  },
  {
    id: "sms",
    label: "SMS Setting",
    icon: <SmsIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "SMS Templates", to: "/admin/sms_template" },
      { label: "SMS Gateway Setting", to: "/admin/sms_gateway" },
    ],
  },
  {
    id: "notification",
    label: "Notification",
    icon: <NotificationsIcon sx={{ fontSize: "1.2rem" }} />,
    children: [{ label: "Notification Logs", to: "/admin/notification_logs" }],
  },
  {
    id: "system",
    label: "System Setting",
    icon: <SettingsIcon sx={{ fontSize: "1.2rem" }} />,
    children: [
      { label: "General Setting", to: "/admin/general_setting" },
      { label: "Admin Setting", to: "/admin/admin_setting" },
      { label: "Meta Setting", to: "/admin/meta_setting" },
      { label: "Login History", to: "/admin/login_history" },
      { label: "Sitemap Manager", to: "/admin/sitemap_manager" },
    ],
  },
];

/* ─────────────────── Sub-components ─────────────────── */

const ACTIVE_COLOR = "#4CE49D";
const ACTIVE_BG = "rgba(76, 228, 157, 0.1)";
const HOVER_BG = "rgba(76, 228, 157, 0.08)";

/** Single top-level nav item (no children) */
function NavLink({ item, open: drawerOpen, isActive }) {
  return (
    <Tooltip title={drawerOpen ? "" : item.label} placement="right">
      <Link to={item.to} style={{ textDecoration: "none", color: "inherit" }}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              py: 0.9,
              color: isActive ? ACTIVE_COLOR : "inherit",
              bgcolor: isActive ? ACTIVE_BG : "transparent",
              "&:hover": { bgcolor: HOVER_BG },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isActive ? ACTIVE_COLOR : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </Link>
    </Tooltip>
  );
}

/** Collapsible group with children */
function NavGroup({ item, open: drawerOpen, isActiveChild, expandedId, onToggle }) {
  const isExpanded = expandedId === item.id;

  return (
    <>
      <Tooltip title={drawerOpen ? "" : item.label} placement="right">
        <ListItem disablePadding onClick={() => onToggle(item.id)}>
          <ListItemButton
            sx={{
              py: 0.9,
              bgcolor: isActiveChild && !isExpanded ? ACTIVE_BG : "transparent",
              color: isActiveChild && !isExpanded ? ACTIVE_COLOR : "inherit",
              "&:hover": { bgcolor: HOVER_BG },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isActiveChild && !isExpanded ? ACTIVE_COLOR : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500 }}
            />
            {isExpanded ? (
              <ExpandLess sx={{ fontSize: "1rem" }} />
            ) : (
              <ExpandMore sx={{ fontSize: "1rem" }} />
            )}
          </ListItemButton>
        </ListItem>
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItemButton
                sx={{
                  pl: drawerOpen ? 4.5 : 2,
                  py: 0.65,
                  color: isActiveChild(child.to) ? ACTIVE_COLOR : "inherit",
                  bgcolor: isActiveChild(child.to) ? ACTIVE_BG : "transparent",
                  "&:hover": { bgcolor: HOVER_BG },
                }}
              >
                <ListItemText
                  primary={child.label}
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    fontWeight: isActiveChild(child.to) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Collapse>
    </>
  );
}

/* ─────────────────── Main export ─────────────────── */

export default function Admin({ children }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* Auth guard — also reject expired JWT (localStorage can outlive the token) */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const tokenExpiry = localStorage.getItem("adminTokenExpiry");
    const expired = tokenExpiry && Date.now() > parseInt(tokenExpiry, 10);

    if (!token || expired) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminTokenExpiry");
      localStorage.removeItem("adminLoginTime");
      navigate("/admin_index", { replace: true });
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  /* Auto-expand the group that owns the current route */
  useEffect(() => {
    const matched = NAV_ITEMS.find(
      (item) =>
        item.children &&
        item.children.some((c) => location.pathname === c.to)
    );
    if (matched) setExpandedId(matched.id);
  }, [location.pathname]);

  const isActivePath = (path) => location.pathname === path;

  const handleToggle = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <AdminAxiosAuth />
      <CssBaseline />

      {/* ── Top AppBar ── */}
      <AppBar
        position="fixed"
        open={drawerOpen}
        sx={{ bgcolor: "#4CE49D", color: "#fff" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen((v) => !v)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Admin Dashboard
            </Typography>
          </Box>
          <Profile setIsAuthenticated={setIsAuthenticated} />
        </Toolbar>
      </AppBar>

      {/* ── Side Drawer ── */}
      <Drawer variant="permanent" open={drawerOpen}>
        {/* Drawer header / brand */}
        <DrawerHeader sx={{ bgcolor: "#4CE49D", color: "#fff" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, flex: 1, ml: 2, fontSize: "0.95rem" }}
          >
            Wello Healthcare
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#fff" }}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider />

        {/* Nav list */}
        <List sx={{ py: 0.5 }}>
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <NavGroup
                key={item.id}
                item={item}
                open={drawerOpen}
                isActiveChild={(path) => isActivePath(path)}
                expandedId={expandedId}
                onToggle={handleToggle}
              />
            ) : (
              <NavLink
                key={item.id}
                item={item}
                open={drawerOpen}
                isActive={isActivePath(item.to)}
              />
            )
          )}
        </List>
      </Drawer>

      {/* ── Main content ── */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
