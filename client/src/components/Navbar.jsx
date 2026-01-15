import React, { useEffect } from "react";
import { Menu, School, TypeOutline } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DarkMode from "../DarkMode";
// import { link } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { useSelector } from "react-redux";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth); //dummy user
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();

  const logoutHandler = async () => {
    await logoutUser();
  };
  console.log(user);

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Logged out Successfully");
      navigate("/login");
    }
  }, [isSuccess]);

  return (
    <div className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-b-gray-200 dark:border-b-gray-800 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* logo and title  */}
      <div className="max-w-7xl mx-auto  hidden md:flex  justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <School size={"30"} />
          <Link to="/">
            <h1 className="hidden md:block font-extrabold text-2xl">
              SkillStack
            </h1>
          </Link>
        </div>
        {/* //user icons and dark mode toggle */}

        <div className="flex items-center gap-6">
          <div>
            {user ? (
              // <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      src={user?.photoURL || "https://github.com/shadcn.png"}
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  {/* <Button variant="outline">Open</Button> */}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Link to="/my-learning">My Learning</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/profile">Edit Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logoutHandler}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {user.role === "instructor" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Dashboard</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/login")}>Sign Up</Button>
              </div>
            )}
          </div>
          <DarkMode />
        </div>
      </div>
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">SkillStack</h1>
        <MobileNavbar />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = () => {
  const role = "instructor"; //dummy role
  return (
    /* Mobile Navbar can be implemented here */
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col pl-5 pr-5 pb-1 ">
        <SheetHeader className="flex flex-row items-center justify-between mt-7">
          <SheetTitle>SkillStack</SheetTitle>
          <DarkMode />
        </SheetHeader>

        <Separator className="mr-2 " />
        <nav className="flex flex-col space-y-4  ">
          <span>My Learning</span>
          <span>Edit Profile</span>
          <p>Log Out</p>
        </nav>
        {role === "instructor" && (
          // <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Dashboard</Button>
          </SheetClose>
          // </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
