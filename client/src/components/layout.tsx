import { Outlet } from "react-router-dom";
import Navbar from "./navbar";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className="relative max-w-5xl mx-auto px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
