import { Outlet } from "react-router-dom";
import Navbar from "./navbar";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
