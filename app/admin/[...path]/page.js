"use client";

import dynamic from "next/dynamic";

const AdminPageLoader = () => (
  <section style={{ padding: "2rem" }}>Loading admin page...</section>
);

const dynamicAdminPage = (loader) =>
  dynamic(loader, {
    ssr: false,
    loading: AdminPageLoader,
  });

const ADMIN_PAGE_MAP = {
  category_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Category")),
  item_department_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Department")),
  item_diseases_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Diseases")),
  item_diseases_banner_list: dynamicAdminPage(() => import("../../Components/ComponentPage/DiseasesBanner")),
  item_key_fetures_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Keyfetures")),
  item_type_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Types")),
  item_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Items")),
  item_category_banner_list: dynamicAdminPage(() => import("../../Components/ComponentPage/CategoryBanner")),
  item_certificate_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Certificatetype")),
  item_lab_list: dynamicAdminPage(() => import("../../Components/ComponentPage/Labs")),
  discount: dynamicAdminPage(() => import("../../Components/ComponentPage/CouponTable")),
  pagelist: dynamicAdminPage(() => import("../../Components/ComponentPage/PageList/Pages")),
  bannerlist: dynamicAdminPage(() => import("../../Components/Admin/AdminCarouselUpload")),
  customer_list: dynamicAdminPage(() => import("../../Components/ComponentPage/UsersPage/UserList")),
  newsletter_list: dynamicAdminPage(() => import("../../Components/ComponentPage/UsersPage/Newsletter")),
  help_list: dynamicAdminPage(() => import("../../Components/ComponentPage/UsersPage/ContactInquiry")),
  get_tuch_inq_list: dynamicAdminPage(() => import("../../Components/ComponentPage/UsersPage/GetInTouchInquiry")),
  collection_appointment_list: dynamicAdminPage(() => import("../../Components/ComponentPage/UsersPage/CollectionAppointment")),
  test_booking_enquiry_list: dynamicAdminPage(() => import("../../Components/ComponentPage/UsersPage/TestBookingEnquiry")),
  abandoned_cart: dynamicAdminPage(() => import("../../Components/ComponentPage/UsersPage/AbandonedCart")),
  sms_template: dynamicAdminPage(() => import("../../Components/ComponentPage/SmsPage/SMSTemplateManager")),
  sms_gateway: dynamicAdminPage(() => import("../../Components/ComponentPage/SmsPage/SMSHistory")),
  notification_logs: dynamicAdminPage(() => import("../../Components/ComponentPage/Notification/ManageNotification")),
  general_setting: dynamicAdminPage(() => import("../../Components/ComponentPage/SystemSetting/GeneralSettings")),
  admin_setting: dynamicAdminPage(() => import("../../Components/ComponentPage/SystemSetting/AdminUserManagement")),
  meta_setting: dynamicAdminPage(() => import("../../Components/ComponentPage/SystemSetting/MetaManagement")),
  login_history: dynamicAdminPage(() => import("../../Components/ComponentPage/SystemSetting/AdminLoginHistory")),
  sitemap_manager: dynamicAdminPage(() => import("../../Components/ComponentPage/SiteMapViewer/SitemapViewer")),
  manage_blogs: dynamicAdminPage(() => import("../../Components/ComponentPage/Blogs")),
  add_blog: dynamicAdminPage(() => import("../../Components/ComponentPage/Blogs")),
  blog_categories: dynamicAdminPage(() => import("../../Components/ComponentPage/Blogcategory")),
  blog_tags: dynamicAdminPage(() => import("../../Components/ComponentPage/BlogTags")),
  manage_states: dynamicAdminPage(() => import("../../Components/ComponentPage/MannageLocations/StateManagement")),
  manage_cities: dynamicAdminPage(() => import("../../Components/ComponentPage/MannageLocations/CityManagement")),
  manage_countries: dynamicAdminPage(() => import("../../Components/ComponentPage/MannageLocations/CountryManagement")),
};

export default function AdminPage({ params }) {
  const pathSegments = Array.isArray(params?.path) ? params.path : [params?.path];
  const slug = pathSegments[0] || "";
  const PageComponent = ADMIN_PAGE_MAP[slug];

  if (!PageComponent) {
    return (
      <section style={{ padding: "2rem" }}>
        <h1>Admin page not found</h1>
        <p>
          The admin path <strong>/admin/{slug}</strong> is not available yet.
        </p>
        <p>Please go back to the admin dashboard or use a supported menu item.</p>
      </section>
    );
  }

  return <PageComponent />;
}
