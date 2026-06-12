import Admin from "../Components/Admin/Admin";

export const metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }) {
  return <Admin>{children}</Admin>;
}