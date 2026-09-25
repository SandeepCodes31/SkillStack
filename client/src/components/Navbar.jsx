import React, { useEffect, useState } from "react";
import {
  Menu,
  GraduationCap,
  BookOpen,
  User,
  Award,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Layers,
  MessageSquare,
} from "lucide-react";
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
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { useSelector } from "react-redux";

const Navbar = ({ onOpenContact }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Logged out successfully");
      navigate("/login");
    }
  }, [isSuccess, data, navigate]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/course/search?query" },
    { label: "Learning Paths", href: "/#categories" },
    { label: "Why Us", href: "/#why-skillstack" },
    { label: "Contact", href: "#contact" },
  ];

  const handleNavClick = (href) => {
    if (href === "#contact" || href === "/#contact") {
      if (onOpenContact) onOpenContact();
      else window.dispatchEvent(new CustomEvent("open-contact-modal"));
      return;
    }
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "");
      if (location.pathname === "/") {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return;
    }
    navigate(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs border-b border-[#DCEAF7] dark:border-slate-800"
          : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-[#EAF4FF] dark:border-slate-800/80"
      } h-16`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* BRAND LOGO */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white transition-transform group-hover:scale-105">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                Skill<span className="text-blue-600">Stack</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                Learning LMS
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/" && !location.hash
                  : link.label === "Courses"
                  ? location.pathname.startsWith("/course/search")
                  : location.pathname + location.hash === link.href;

              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-slate-800/60 font-semibold"
                      : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle */}
          <DarkMode />

          {/* USER AUTH STATE */}
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-[#DCEAF7] dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-blue-50/60 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  <Avatar className="w-7 h-7 ring-2 ring-blue-500/20">
                    <AvatarImage
                      src={user?.photoURL || "https://github.com/shadcn.png"}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                      {user?.name?.substring(0, 2).toUpperCase() || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 p-2 shadow-xl border-[#DCEAF7] dark:border-slate-800 rounded-xl" align="end">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                    <span className="inline-flex items-center w-fit text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 capitalize">
                      {user?.role || "Student"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuGroup>
                  {user?.role !== "instructor" && user?.role !== "admin" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/my-learning")}
                      className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">My Learning</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/verify-certificate")}
                    className={`flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg ${
                      location.pathname.startsWith("/verify-certificate")
                        ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-slate-800 dark:text-sky-400 font-semibold"
                        : "hover:bg-blue-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">Verify Credential</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5" />

                {user?.role === "instructor" || user?.role === "admin" ? (
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => navigate("/admin/dashboard")}
                      className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium">Admin Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/admin/quizzes")}
                      className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Manage Quizzes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/admin/certificates")}
                      className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Certificates</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/admin/payments")}
                      className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">Transactions</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                ) : (
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => navigate("/student/dashboard")}
                      className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Dashboard & Badges</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}

                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem
                  onClick={logoutHandler}
                  className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-semibold">Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className={`text-xs sm:text-sm font-semibold rounded-lg px-3 transition-all cursor-pointer ${
                  location.pathname === "/login" && !location.search.includes("tab=signup")
                    ? "text-[#2563EB] dark:text-sky-400 bg-blue-50 dark:bg-slate-800/80 border border-blue-200/80 dark:border-blue-800"
                    : "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50/60 dark:hover:bg-slate-800"
                }`}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/signup")}
                className={`text-xs sm:text-sm font-semibold rounded-lg px-3.5 transition-all transform active:scale-98 cursor-pointer ${
                  location.pathname === "/signup" || location.search.includes("tab=signup")
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30"
                    : "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-md shadow-blue-500/20"
                }`}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <div className="lg:hidden flex items-center">
            <MobileNavbar user={user} logoutHandler={logoutHandler} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

const MobileNavbar = ({ user, logoutHandler }) => {
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="rounded-lg border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 flex flex-col justify-between">
        <div>
          <SheetHeader className="text-left pb-6 border-b border-slate-100 dark:border-slate-800">
            <SheetTitle>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  Skill<span className="text-blue-600">Stack</span>
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 mt-5">
            <SheetClose asChild>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 text-left"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                Home
              </button>
            </SheetClose>
            <SheetClose asChild>
              <button
                onClick={() => navigate("/course/search?query")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 text-left"
              >
                <BookOpen className="w-4 h-4 text-sky-500" />
                Explore Courses
              </button>
            </SheetClose>
            <SheetClose asChild>
              <button
                onClick={() => navigate("/verify-certificate")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                  location.pathname.startsWith("/verify-certificate")
                    ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-slate-800 dark:text-sky-400 font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verify Credential
              </button>
            </SheetClose>
            <SheetClose asChild>
              <button
                onClick={() => {
                  if (onOpenContact) onOpenContact();
                  else window.dispatchEvent(new CustomEvent("open-contact-modal"));
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 text-left cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Contact Support
              </button>
            </SheetClose>

            {user && (
              <>
                <div className="pt-3 pb-1">
                  <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    My Account
                  </p>
                </div>
                {user?.role !== "instructor" && user?.role !== "admin" && (
                  <SheetClose asChild>
                    <button
                      onClick={() => navigate("/my-learning")}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 text-left"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      My Learning
                    </button>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 text-left"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    Edit Profile
                  </button>
                </SheetClose>
                {user?.role === "instructor" || user?.role === "admin" ? (
                  <SheetClose asChild>
                    <button
                      onClick={() => navigate("/admin/dashboard")}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      Admin Dashboard
                    </button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <button
                      onClick={() => navigate("/student/dashboard")}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 text-left"
                    >
                      <Award className="w-4 h-4 text-blue-600" />
                      Student Dashboard
                    </button>
                  </SheetClose>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Mobile Drawer Bottom */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {user ? (
            <Button
              variant="outline"
              onClick={logoutHandler}
              className="w-full text-rose-600 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full text-sm"
                >
                  Sign In
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Sign Up
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
