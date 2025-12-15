import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CartProvider } from './CartContext';

import Dashboard from "../ComponentPage/Dashboard";
import Category from "../ComponentPage/Category";
import Department from "../ComponentPage/Department";
import Admin from "../Admin/Admin";
import Home from "../../WebsiteComponent/Homecomponents/Home";
import PrivateRoute from "./PrivateRoute";
import Forgot from "../../AdminLoginpage/Forgot";
import DiseasesBanner from "../ComponentPage/DiseasesBanner";
import Keyfetures from "../ComponentPage/Keyfetures";
import Types from "../ComponentPage/Types";
import Diseases from "../ComponentPage/Diseases";
import Items from "../ComponentPage/Items";
import CategoryBanner from "../ComponentPage/CategoryBanner";
import LoginPage from "../../AdminLoginpage/Login";
import OrderMaster from "../../Components/ComponentPage/CartPage/OrderMaster";
// import ShoppingCart from "../../WebsiteComponent/VeiwItemPage/ShoppingCart "; // fixed space
// import AddressPage from "../../WebsiteComponent/VeiwItemPage/AddressPage";
// import PaymentPage from "../../WebsiteComponent/VeiwItemPage/PaymentPage";
// import OrderConfirmation from "../../WebsiteComponent/VeiwItemPage/OrderConfirmation";
// import ViewItem from "../../WebsiteComponent/VeiwItemPage/ViewItem";
// import Register from "../../WebsiteComponent/CustomerResgister/Register";
// import Login from "../../WebsiteComponent/CustomerResgister/Login";
// import HomeBanner from "../ComponentPage/HomeBanner/HomeBanner";
// import Pagelist from "../ComponentPage/HomeBanner/Pagelist";
import Findlab from "../../WebsiteComponent/FindLabComponents/Findlab";
import LabTestsPage from "../../WebsiteComponent/FindLabComponents/FindTestlab/LabTestsPage";
import FullbodyHealthPackages from "../../WebsiteComponent/FindLabComponents/Fullbody/FullbodyHealthPackages";
import ReportsPage from "../../WebsiteComponent/FindLabComponents/REportDownload/ReportsPage";
import AdminCarouselUpload from "../Admin/AdminCarouselUpload";
import Pages from "../ComponentPage/PageList/Pages";
import Certificatetype from "../ComponentPage/Certificatetype";
import Labs from "../ComponentPage/Labs";
import StateManagement from "../ComponentPage/MannageLocations/StateManagement";
import CityManagement from "../ComponentPage/MannageLocations/CityManagement";
import CountryManagement from "../ComponentPage/MannageLocations/CountryManagement";
import Blogs from "../ComponentPage/Blogs";
import BlogDetail from "../../WebsiteComponent/Homecomponents/BlogDetail";
import BlogCategory from "../ComponentPage/Blogcategory";
import BlogTags from "../ComponentPage/BlogTags";
import BlogCategoryDetailPage from "../../WebsiteComponent/Homecomponents/BlogCategoryDetailPage";
import IteamDetail from "../../WebsiteComponent/Homecomponents/ItemDetail";
import CartPage from "../../WebsiteComponent/Homecomponents/CartPage";
import CouponTable from "../ComponentPage/CouponTable";
import { ToastContainer } from "react-toastify";
import UserList from "../ComponentPage/UsersPage/UserList";
import Newsletter from "../ComponentPage/UsersPage/Newsletter";
import ContactInquiry from "../ComponentPage/UsersPage/ContactInquiry";
import GetInTouchInquiry from "../ComponentPage/UsersPage/GetInTouchInquiry";
import CollectionAppointment from "../ComponentPage/UsersPage/CollectionAppointment";
import TestBookingEnquiry from "../ComponentPage/UsersPage/TestBookingEnquiry";


function MainRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthentication = (status) => {
    localStorage.setItem("isAuthenticated", status);
    setIsAuthenticated(status);
  };

  return (
    <CartProvider>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        theme="colored"
      />
      {/* <Nav /> */}
      <Routes>
        {/* Public Routes */}
       
        <Route path="/admin_index" element={<LoginPage setIsAuthenticated={handleAuthentication} />} />

        <Route path="/" element={<Home />} />
        {/* <Route path="/product/:id" element={<ViewItem />} />  */}

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/category_list" element={<Category />} />
        <Route path="/item_department_list" element={<Department />} />
        <Route path="/item_diseases_banner_list" element={<DiseasesBanner />} />
        <Route path="/item_key_fetures_list" element={<Keyfetures />} />
        <Route path="/item_type_list" element={<Types />} />
        <Route path="/item_diseases_list" element={<Diseases />} />
        <Route path="/item_list" element={<Items />} />
        <Route path="/item_category_banner_list" element={<CategoryBanner />} />
        {/* <Route path="/bannerlist" element={<HomeBanner />} /> */}
        <Route path="/forgot-password" element={<Forgot />} />
        {/* <Route path="/pagelist" element={<Pagelist/>} /> */}
        <Route path="/bannerlist" element={<AdminCarouselUpload/>} />
        <Route path="/pagelist" element={<Pages/>} />
        <Route path="/item_certificate_list" element={<Certificatetype/>} />
        <Route path="/item_lab_list" element={<Labs/>} />
        <Route path="/manage_states" element={<StateManagement/>} />
        <Route path="/manage_cities" element={<CityManagement/>} />
        <Route path="/manage_countries" element={<CountryManagement/>} />
        <Route path="/manage_blogs" element={<Blogs/>} />
        <Route path="/blog_categories" element={<BlogCategory/>} />
        <Route path="/blog_tags" element={<BlogTags/>} />
        <Route path="/discount" element={<CouponTable/>} />
        <Route path="/customer_list" element={<UserList/>} />
        <Route path="/newsletter_list" element={<Newsletter/>} />
        <Route path="/help_list" element={<ContactInquiry/>} />
        <Route path="/get_tuch_inq_list" element={<GetInTouchInquiry/>} />
        <Route path="/collection_appointment_list" element={<CollectionAppointment/>} />
        <Route path="/test_booking_enquiry_list" element={<TestBookingEnquiry/>} />


        {/* Cart Routes */}
        <Route path="/order_list" element={<OrderMaster />} />
        {/* <Route path="/cart/:id" element={<ShoppingCart />} /> */}
        {/* <Route path="/address" element={<AddressPage />} /> */}
        {/* <Route path="/payment" element={<PaymentPage />} /> */}
        {/* <Route path="/confirmation" element={<OrderConfirmation />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}


        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Admin />
            </PrivateRoute>
          }
        />

        {/* Website Router */}


                {/* <Route path="/labs/city/delhi" element={<Findlab/>} /> */}
                <Route path="/" element={<Home/>} />
                <Route path="/labs/city/delhi" element={<Findlab/>} />
                <Route path="/lab-tests" element={<LabTestsPage/>} />
                <Route path="/full-body-health-checkup" element={<FullbodyHealthPackages/>} />
                <Route path="/download-report" element={<ReportsPage/>} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/blog-category/:slug" element={<BlogCategoryDetailPage/>} />
                <Route path="/iteampage" element={<IteamDetail/>} />
                <Route path="/cart_section" element={<CartPage/>} />




      </Routes>
    </CartProvider>
  );
}

export default MainRoute;
