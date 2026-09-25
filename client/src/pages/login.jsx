import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginUserMutation, useRegisterUserMutation } from "../features/api/authApi";
import { toast } from "sonner";
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  Loader2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const Login = ({ defaultTab = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const rightPanelRef = useRef(null);

  // Determine initial tab from props or route
  const getInitialTab = () => {
    if (location.pathname === "/signup" || location.search.includes("tab=signup")) {
      return "signup";
    }
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedRole, setSelectedRole] = useState("student"); // "student" | "admin"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync activeTab if location changes
  useEffect(() => {
    if (location.pathname === "/signup" || location.search.includes("tab=signup")) {
      setActiveTab("signup");
    } else if (location.pathname === "/login" && !location.search.includes("tab=signup")) {
      setActiveTab("login");
    }
  }, [location.pathname, location.search]);

  // Form states
  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });

  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // API mutations
  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === "signup" ? "/signup" : "/login", { replace: true });
    // Reset right authentication scroll container to top smoothly
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput((prev) => ({ ...prev, [name]: value }));
    } else {
      setLoginInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegistration = async (e) => {
    if (e) e.preventDefault();

    if (activeTab === "signup") {
      if (!signupInput.name.trim() || !signupInput.email.trim() || !signupInput.password) {
        toast.error("All signup fields are required");
        return;
      }
      if (signupInput.confirmPassword && signupInput.password !== signupInput.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const payload = {
        name: signupInput.name.trim(),
        email: signupInput.email.trim(),
        password: signupInput.password,
        role: selectedRole === "admin" ? "admin" : "student",
      };

      try {
        await registerUser(payload).unwrap();
        setLoginInput((prev) => ({ ...prev, email: signupInput.email.trim() }));
        setSignupInput({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        handleTabChange("login");
      } catch (err) {
        console.error("Signup error:", err);
      }
    } else {
      if (!loginInput.email.trim() || !loginInput.password) {
        toast.error("Email and password are required");
        return;
      }

      const payload = {
        email: loginInput.email.trim(),
        password: loginInput.password,
        role: selectedRole,
      };

      try {
        await loginUser(payload).unwrap();
      } catch (err) {
        console.error("Login error:", err);
      }
    }
  };

  // Toast notifications & redirects
  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Registered successfully! Please log in.");
    }
    if (registerError) {
      toast.error(registerError.data?.message || "Registration failed");
    }
    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Logged in successfully");
      const userRole = loginData?.user?.role;
      const isAdmin = userRole === "admin" || userRole === "instructor";
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }
    if (loginError) {
      const msg =
        loginError.data?.message ||
        (typeof loginError.data === "string" ? loginError.data : null) ||
        loginError.error ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    }
  }, [
    loginIsSuccess,
    loginData,
    loginError,
    registerIsSuccess,
    registerData,
    registerError,
    navigate,
  ]);

  const isBusy = loginIsLoading || registerIsLoading;

  return (
    <div className="relative h-full w-full bg-[#F7FAFF] dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Background Subtle Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EFF7FF] via-[#F7FAFF] to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />

      {/* Ambient Blurred Background Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[360px] bg-blue-400/8 dark:bg-blue-500/10 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-sky-300/10 dark:bg-sky-500/5 blur-[90px] rounded-full pointer-events-none" />

      {/* Split-Screen 2-Column Authentication Layout (Fixed viewport height, no document scroll) */}
      <div className="relative w-full max-w-[1100px] mx-auto h-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* ==================================================== */}
        {/* LEFT COLUMN: COMPLETELY FIXED BRAND PANEL (~48%)     */}
        {/* Fixed vertical anchor: NEVER shifts when tab changes */}
        {/* ==================================================== */}
        <div className="hidden lg:flex lg:col-span-6 h-full flex-col justify-center space-y-6 text-left py-6 overflow-hidden select-none">
          {/* Brand pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-[11px] font-semibold text-[#2563EB] dark:text-sky-400 uppercase tracking-wider w-fit">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>SkillStack Learning LMS</span>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.2]">
              Learn. Build.{" "}
              <span className="text-[#2563EB] dark:text-sky-400">Grow.</span>
            </h1>
            <p className="text-[15px] sm:text-base text-[#64748B] dark:text-slate-400 max-w-md leading-relaxed">
              Build practical skills through structured courses, real projects, and guided learning designed for your career.
            </p>
          </div>

          {/* 3 Benefit Points */}
          <div className="space-y-3 pt-1 max-w-md text-left">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-sky-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#334155] dark:text-slate-300">
                Learn at your own pace with lifetime course access
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-sky-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#334155] dark:text-slate-300">
                Build real-world projects and build practical skills
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-sky-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#334155] dark:text-slate-300">
                Track learning streaks and earn verified certificates
              </span>
            </div>
          </div>

          {/* Minimalist Abstract Learning Card (Brand Visual) */}
          <div className="pt-2">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-[#DCE8F5] dark:border-slate-800 rounded-2xl p-4 shadow-[0_4px_20px_rgba(37,99,235,0.05)] max-w-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                  Master Industry Technologies
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                  HTML5, React, Node.js, Next.js & Full Stack
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: SCROLLABLE AUTH PANEL (~52%)           */}
        {/* Only this panel scrolls when signup form is taller   */}
        {/* ==================================================== */}
        <div
          ref={rightPanelRef}
          className="col-span-1 lg:col-span-6 h-full overflow-y-auto overscroll-contain py-6 px-1.5 flex flex-col auth-scroll-area [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Mobile-Only Compact Brand Header */}
          <div className="lg:hidden text-center space-y-2 mb-4 pt-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-[11px] font-semibold text-[#2563EB] dark:text-sky-400 uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>SkillStack Learning LMS</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Learn. Build. <span className="text-[#2563EB] dark:text-sky-400">Grow.</span>
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-xs mx-auto">
              Build practical skills through structured courses and guided learning.
            </p>
          </div>

          {/* Auth Card: Natural height with my-auto for vertical centering */}
          <div className="my-auto mx-auto w-full max-w-[460px] bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-[18px] shadow-[0_12px_35px_rgba(15,23,42,0.07)] dark:shadow-none p-6 sm:p-8 space-y-5 shrink-0 transition-all">
            {/* 1. SEGMENTED CONTROL SWITCH */}
            <div className="bg-[#F1F5F9] dark:bg-slate-800/80 p-1 rounded-[10px] grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`h-9 rounded-[8px] text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === "login"
                    ? "bg-white dark:bg-slate-900 text-[#2563EB] dark:text-sky-400 shadow-[0_2px_6px_rgba(15,23,42,0.08)]"
                    : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("signup")}
                className={`h-9 rounded-[8px] text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === "signup"
                    ? "bg-white dark:bg-slate-900 text-[#2563EB] dark:text-sky-400 shadow-[0_2px_6px_rgba(15,23,42,0.08)]"
                    : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* 2. AUTH CARD HEADER */}
            <div className="space-y-1 text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                {activeTab === "login"
                  ? "Welcome back"
                  : selectedRole === "admin"
                  ? "Admin Registration"
                  : "Create your account"}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                {activeTab === "login"
                  ? selectedRole === "admin"
                    ? "Sign in with your admin credentials to access the portal."
                    : "Sign in to continue learning with SkillStack."
                  : selectedRole === "admin"
                  ? "Fill out your details for institutional verification & access."
                  : "Start learning, build skills, and grow your career."}
              </p>
            </div>

            {/* 3. STUDENT / ADMIN ROLE SELECTOR */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                Continue as
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Student Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                    selectedRole === "student"
                      ? "border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/40 dark:border-blue-500 shadow-2xs"
                      : "border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedRole === "student"
                        ? "bg-[#2563EB] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        selectedRole === "student"
                          ? "text-[#2563EB] dark:text-sky-400"
                          : "text-[#0F172A] dark:text-white"
                      }`}
                    >
                      Student
                    </p>
                    <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate">
                      Learner access
                    </p>
                  </div>
                </button>

                {/* Admin Option */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                    selectedRole === "admin"
                      ? "border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/40 dark:border-blue-500 shadow-2xs"
                      : "border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedRole === "admin"
                        ? "bg-[#2563EB] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        selectedRole === "admin"
                          ? "text-[#2563EB] dark:text-sky-400"
                          : "text-[#0F172A] dark:text-white"
                      }`}
                    >
                      Admin
                    </p>
                    <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate">
                      Management
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Admin Verification Notice (When Admin Signup is Active) */}
            {activeTab === "signup" && selectedRole === "admin" && (
              <div className="p-3.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-left flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold text-blue-950 dark:text-blue-200">
                    Account Verification Required
                  </p>
                  <p className="text-[11px] text-blue-900/85 dark:text-blue-300/85 leading-relaxed">
                    Your account will be verified by management and will be contacted for further process. Once verified, you can then log in.
                  </p>
                </div>
              </div>
            )}

            {/* 4. FORM FIELDS */}
            <form onSubmit={handleRegistration} className="space-y-3.5 text-left">
              {/* Full Name (Only on Signup) */}
              {activeTab === "signup" && (
                <div className="space-y-1">
                  <label
                    htmlFor="signup-name"
                    className="text-xs font-semibold text-[#0F172A] dark:text-slate-200"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                    <input
                      id="signup-name"
                      type="text"
                      name="name"
                      value={signupInput.name}
                      onChange={(e) => changeInputHandler(e, "signup")}
                      placeholder={selectedRole === "admin" ? "e.g. Alex Morgan" : "e.g. Sandeep Pal"}
                      disabled={isBusy}
                      required
                      className="w-full h-11 sm:h-12 pl-10 pr-3.5 rounded-[10px] border border-[#DCE4EE] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/10 focus:outline-none transition-all disabled:opacity-60"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label
                  htmlFor={activeTab === "signup" ? "signup-email" : "login-email"}
                  className="text-xs font-semibold text-[#0F172A] dark:text-slate-200"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <input
                    id={activeTab === "signup" ? "signup-email" : "login-email"}
                    type="email"
                    name="email"
                    value={activeTab === "signup" ? signupInput.email : loginInput.email}
                    onChange={(e) => changeInputHandler(e, activeTab)}
                    placeholder={
                      activeTab === "signup" && selectedRole === "admin"
                        ? "admin@institution.com"
                        : "name@example.com"
                    }
                    disabled={isBusy}
                    required
                    className="w-full h-11 sm:h-12 pl-10 pr-3.5 rounded-[10px] border border-[#DCE4EE] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/10 focus:outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor={activeTab === "signup" ? "signup-password" : "login-password"}
                  className="text-xs font-semibold text-[#0F172A] dark:text-slate-200"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <input
                    id={activeTab === "signup" ? "signup-password" : "login-password"}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={activeTab === "signup" ? signupInput.password : loginInput.password}
                    onChange={(e) => changeInputHandler(e, activeTab)}
                    placeholder={activeTab === "signup" ? "Create a strong password" : "Enter your password"}
                    disabled={isBusy}
                    required
                    className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-[10px] border border-[#DCE4EE] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/10 focus:outline-none transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Only on Signup) */}
              {activeTab === "signup" && (
                <div className="space-y-1">
                  <label
                    htmlFor="signup-confirm-password"
                    className="text-xs font-semibold text-[#0F172A] dark:text-slate-200"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={signupInput.confirmPassword}
                      onChange={(e) => changeInputHandler(e, "signup")}
                      placeholder="Re-enter your password"
                      disabled={isBusy}
                      className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-[10px] border border-[#DCE4EE] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/10 focus:outline-none transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 5. PRIMARY ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full h-11 sm:h-12 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 shadow-xs shadow-blue-600/20"
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {activeTab === "signup"
                          ? selectedRole === "admin"
                            ? "Submitting Application..."
                            : "Creating Account..."
                          : "Signing in..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {activeTab === "signup"
                          ? selectedRole === "admin"
                            ? "Submit for Admin Verification"
                            : "Create Student Account"
                          : selectedRole === "admin"
                          ? "Sign in as Admin"
                          : "Sign in to SkillStack"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 6. TRUST FOOTER */}
            <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800 text-center">
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Your account information is securely handled by SkillStack.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
