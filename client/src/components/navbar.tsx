import { RootState, store } from "@/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { logout } from "@/reducers/auth-reducer";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    store.dispatch(logout());
  };

  return (
    <div className="sticky w-full top-0 z-50 border shadow-md bg-white">
      <div className="max-w-5xl py-2 px-8 mx-auto flex justify-between items-center">
        <Link to="/">Home</Link>
        {user?.role === "admin" && <Link to="/manage-users">Manage Users</Link>}

        <div className="flex justify-between items-center gap-2">
          <p>Hi, {user?.name}</p>
          <Button onClick={handleLogout} size="sm">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
