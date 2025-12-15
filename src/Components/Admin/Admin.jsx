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
  Flag as FlagIcon,
  Public as PublicIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import Profile from "../Profile/Profile";

const drawerWidth = 280;

/* ----------------------------- Drawer Styles ----------------------------- */

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

/* ----------------------------- MAIN EXPORT ----------------------------- */

export default function Admin() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const [itemsOpen, setItemsOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false); // FIXED
  const [userOpen, setUserOpen] = useState(false); // NEW FIXED

  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/admin", { replace: true });
    else setIsAuthenticated(true);
  }, [navigate]);

  const isActiveLink = (path) => location.pathname === path;

  /* ----------------------------- Submenus ----------------------------- */

  const itemsSubmenu = [
    { to: "/category_list", label: "Category" },
    { to: "/item_department_list", label: "Department" },
    { to: "/item_key_fetures_list", label: "Key Features" },
    { to: "/item_type_list", label: "Type" },
    { to: "/item_diseases_list", label: "Diseases" },
    { to: "/item_category_banner_list", label: "Category Banner" },
    { to: "/item_diseases_banner_list", label: "Diseases Banner" },
    { to: "/item_certificate_list", label: "Certificate Type" },
    { to: "/item_lab_list", label: "Lab" },
    { to: "/item_list", label: "Items" },
    { to: "/discount", label: "Discount COUPON" },
  ];

  const orderSubmenu = [
    { to: "/order_list", label: "Order Master" },
    { to: "/order_report", label: "Order Report" },
  ];

  const websiteSubmenu = [
    { to: "/bannerlist", label: "Banner List" },
    { to: "/pagelist", label: "Page List" },
    { to: "/manage_testimonials", label: "Testimonials" },
    { to: "/manage_faqs", label: "FAQs" },
  ];

  const blogSubmenu = [
    { to: "/manage_blogs", label: "All Blogs" },
    { to: "/manage_blogs", label: "Add Blog" },
    { to: "/blog_categories", label: "Blog Categories" },
    { to: "/blog_tags", label: "Tags" },
  ];

  const locationSubmenu = [
    { to: "/manage_countries", label: "Countries"},
    { to: "/manage_states", label: "States"},
    { to: "/manage_cities", label: "Cities" },
    { to: "/manage_areas", label: "Areas/Localities" },
    { to: "/manage_pincodes", label: "Pincodes" },
    { to: "/service_availability", label: "Service Availability" },
  ];

  const userSubmenu = [
    { to: "/customer_list", label: "User List "  },
    { to: "/newsletter_list", label: "Newsletter List"},
    { to: "/help_list", label: "Contact Inquiry" },
    { to: "/get_tuch_inq_list", label: "Get In Touch Inquiry"},
    { to: "/collection_appointment_list", label: "Collection Appointment" },
    { to: "/test_booking_enquiry_list", label: "Test Booking Enquiry" },
  ];

  /* ----------------------------- RENDER ----------------------------- */

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* ----------------------------- Top AppBar ----------------------------- */}
      <AppBar position="fixed" open={open} sx={{ bgcolor: "#8FCFD2", color: "black" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              onClick={() => setOpen(true)}
              sx={{ marginRight: 5, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: '1.1rem' }}>
              test
            </Typography>
          </Box>

          <Profile setIsAuthenticated={setIsAuthenticated} />
        </Toolbar>
      </AppBar>

      {/* ----------------------------- Sidebar Drawer ----------------------------- */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ bgcolor: "#8FCFD2" }}>
          <Typography variant="h5" sx={{ 
            fontWeight: "bold", 
            flex: 1, 
            ml: 4,
            fontSize: '1.1rem' // Smaller font size
          }}>
            Wello Healthcare
          </Typography>

          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />

        <List sx={{ bgcolor: "#8FCFD2", height: "100%" }}>

          {/* ----------------------------- Dashboard ----------------------------- */}
          <Link to="/admin" style={{ textDecoration: "none", color: "inherit" }}>
            <ListItem disablePadding>
              <ListItemButton sx={{ 
                color: isActiveLink("/admin") ? "#1E9C9D" : "black",
                py: 0.8 // Reduced padding
              }}>
                <ListItemIcon sx={{ 
                  color: "inherit",
                  minWidth: 40 // Smaller icon container
                }}>
                  <DashboardIcon sx={{ fontSize: '1.2rem' }} /> {/* Smaller icons */}
                </ListItemIcon>
                <ListItemText 
                  primary="Dashboard" 
                  primaryTypographyProps={{ 
                    fontSize: '0.85rem', // Smaller text
                    fontWeight: 500 
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Link>

          {/* ----------------------------- Items ----------------------------- */}
          <ListItem disablePadding onClick={() => setItemsOpen(!itemsOpen)}>
            <ListItemButton sx={{ py: 0.8 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CategoryIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Items" 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  fontWeight: 500 
                }}
              />
              {itemsOpen ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={itemsOpen}>
            <List component="div" disablePadding>
              {itemsSubmenu.map((i) => (
                <Link key={i.label} to={i.to} style={{ textDecoration: "none", color: "inherit" }}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ 
                      pl: 4, 
                      color: isActiveLink(i.to) ? "#1E9C9D" : "black",
                      py: 0.6 // Even smaller padding for subitems
                    }}>
                      <ListItemText 
                        primary={i.label} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem', // Smaller submenu text
                          fontWeight: 400 
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              ))}
            </List>
          </Collapse>

          {/* ----------------------------- Orders ----------------------------- */}
          <ListItem disablePadding onClick={() => setOrderOpen(!orderOpen)}>
            <ListItemButton sx={{ py: 0.8 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ShoppingCartIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Manage Orders" 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  fontWeight: 500 
                }}
              />
              {orderOpen ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={orderOpen}>
            <List component="div" disablePadding>
              {orderSubmenu.map((i) => (
                <Link key={i.label} to={i.to}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ 
                      pl: 4, 
                      color: isActiveLink(i.to) ? "#1E9C9D" : "black",
                      py: 0.6
                    }}>
                      <ListItemText 
                        primary={i.label} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          fontWeight: 400 
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              ))}
            </List>
          </Collapse>

          {/* ----------------------------- Website ----------------------------- */}
          <ListItem disablePadding onClick={() => setWebsiteOpen(!websiteOpen)}>
            <ListItemButton sx={{ py: 0.8 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <WebIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Manage Website" 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  fontWeight: 500 
                }}
              />
              {websiteOpen ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={websiteOpen}>
            <List disablePadding>
              {websiteSubmenu.map((i) => (
                <Link key={i.label} to={i.to}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4, py: 0.6 }}>
                      <ListItemText 
                        primary={i.label} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          fontWeight: 400 
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              ))}
            </List>
          </Collapse>

          {/* ----------------------------- Blog ----------------------------- */}
          <ListItem disablePadding onClick={() => setBlogOpen(!blogOpen)}>
            <ListItemButton sx={{ py: 0.8 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <WebIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Manage Blog" 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  fontWeight: 500 
                }}
              />
              {blogOpen ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={blogOpen}>
            <List disablePadding>
              {blogSubmenu.map((i) => (
                <Link key={i.label} to={i.to}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4, py: 0.6 }}>
                      <ListItemText 
                        primary={i.label} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          fontWeight: 400 
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              ))}
            </List>
          </Collapse>

          {/* ----------------------------- Locations ----------------------------- */}
          <ListItem disablePadding onClick={() => setLocationOpen(!locationOpen)}>
            <ListItemButton sx={{ py: 0.8 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LocationIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Manage Locations" 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  fontWeight: 500 
                }}
              />
              {locationOpen ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={locationOpen}>
            <List disablePadding>
              {locationSubmenu.map((i) => (
                <Link key={i.label} to={i.to}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4, py: 0.6 }}>
                      <ListItemText 
                        primary={i.label} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          fontWeight: 400 
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              ))}
            </List>
          </Collapse>

          {/* ----------------------------- Users ----------------------------- */}
          <ListItem disablePadding onClick={() => setUserOpen(!userOpen)}>
            <ListItemButton sx={{ py: 0.8 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PeopleIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Users" 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  fontWeight: 500 
                }}
              />
              {userOpen ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={userOpen}>
            <List disablePadding>
              {userSubmenu.map((i) => (
                <Link key={i.label} to={i.to}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ pl: 4, py: 0.6 }}>
                      <ListItemText 
                        primary={i.label} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          fontWeight: 400 
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              ))}
            </List>
          </Collapse>

        </List>
      </Drawer>

      {/* ----------------------------- Page Content ----------------------------- */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>

    </Box>
  );
}