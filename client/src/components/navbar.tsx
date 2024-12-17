import { RootState, store } from "@/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { logout } from "@/reducers/auth-reducer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    store.dispatch(logout());
  };

  return (
    <div className="sticky w-full top-0 z-50 border shadow-md bg-white">
      <div className="max-w-5xl py-2 px-8 mx-auto flex justify-between items-center">
        <div className="flex items-center justify-start gap-8">
          <Link to="/">
            <img src="/fshare.svg" alt="fshare logo" className="w-7 h-7" />
          </Link>
          <Link to="/">Home</Link>
          {user?.role === "admin" && <Link to="/manage-users">Manage Users</Link>}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer select-none">
              <AvatarFallback className="bg-gray-300">{user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="max-w-72 w-full">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">{user?.name}</h4>
                <div className="flex space-between items-center gap-3">
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge className="cursor-default">{user?.role}</Badge>
                </div>
              </div>
              <div className="grid gap-2">
                <Button variant="ghost" className="justify-start w-full no-ring" onClick={handleLogout}>
                  <LogOut /> Logout
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Navbar;
