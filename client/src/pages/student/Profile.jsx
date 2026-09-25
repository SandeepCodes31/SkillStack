import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { useGetMyStreakQuery, useGetMyBadgesQuery } from "@/features/api/streakApi";
import { useGetMyCertificatesQuery } from "@/features/api/certificateApi";
import { toast } from "sonner";
import {
  Flame,
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Calendar,
  BookOpen,
  ArrowRight,
  Camera,
  Pencil,
  Sparkles,
  Loader2,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Queries
  const { data, isLoading, isError, error, refetch } = useLoadUserQuery();
  const { data: streakResponse } = useGetMyStreakQuery();
  const { data: badgesResponse } = useGetMyBadgesQuery();
  const { data: certsResponse } = useGetMyCertificatesQuery();

  const streak = streakResponse?.data;
  const badges = badgesResponse?.data?.badges || [];
  const certsCount = certsResponse?.certificates?.length || 0;

  const [
    updateUser,
    { isLoading: updateUserIsLoading, isSuccess: updateIsSuccess, isError: updateIsError, error: updateError, data: updateData },
  ] = useUpdateUserMutation();

  const user = data?.user;

  // Sync initial user name into state
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Refetch user profile on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handle photo file change and instant preview
  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  // Submit profile updates
  const updateUserHandler = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    try {
      const res = await updateUser(formData).unwrap();
      toast.success(res?.message || "Profile updated successfully!");
      setIsEditDialogOpen(false);
      setProfilePhoto(null);
      setPhotoPreview(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Profile update failed");
    }
  };

  // Reset modal state when opening/closing
  const handleOpenChange = (open) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setProfilePhoto(null);
      setPhotoPreview(null);
      if (user?.name) setName(user.name);
    }
  };

  // High-fidelity Skeleton Loading State
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Error State
  if (isError || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 max-w-md text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Unable to Load Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error?.data?.message || "Please verify your session and try again."}
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 px-4 mt-2"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const enrolledCourses = user.enrolledCourses || [];

  return (
    <div className="min-h-screen bg-[#F8FBFF] dark:bg-slate-950 transition-colors pb-16">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#EFF7FF] via-[#F8FBFF]/80 to-transparent dark:from-slate-900/60 dark:via-slate-950/80 dark:to-transparent pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ==================================================== */}
        {/* 1. SECTION TITLE & BADGE */}
        {/* ==================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span>Learner Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              My Profile
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/student/dashboard")}
              className="rounded-xl border-[#DCEAF7] dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold h-9 px-3.5 cursor-pointer shadow-2xs gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. MODERN PROFILE HERO CARD */}
        {/* ==================================================== */}
        <section className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
          {/* Cover Header Banner */}
          <div className="h-28 sm:h-36 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Card Body */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
            {/* Avatar & Edit Action Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-16 gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              {/* Avatar with Camera Trigger */}
              <div className="relative group">
                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-xl bg-white dark:bg-slate-800 object-cover">
                  <AvatarImage
                    src={user?.photoURL || "https://github.com/shadcn.png"}
                    alt={user?.name || "@shadcn photo"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-tr from-blue-600 to-sky-500 text-white">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "SP"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-white dark:ring-slate-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Upload New Photo"
                  aria-label="Upload New Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Profile Button */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsEditDialogOpen(true)}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold h-10 px-5 rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all active:scale-98"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>

            {/* User Credentials & Metadata */}
            <div className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                    {user.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {user.email}
                  </p>
                </div>

                <div className="self-start sm:self-auto flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-200/70 dark:border-blue-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                    <span>Role: {user.role?.toUpperCase() || "STUDENT"}</span>
                  </span>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Name
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Member Since
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Active"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-center">
                  <p className="text-lg sm:text-xl font-black text-blue-600 dark:text-sky-400">
                    {enrolledCourses.length}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Enrolled Courses
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-center">
                  <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                    {streak?.currentStreak || 0}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Current Streak
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center">
                  <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {certsCount}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Certificates Earned
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 3. LEARNING STREAK & BADGES SECTION */}
        {/* ==================================================== */}
        <section className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xs p-6 sm:p-7 space-y-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <Flame className="w-7 h-7 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                    {streak?.currentStreak || 0} Day Learning Streak
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800">
                    {streak?.learnedToday ? "Active Today 🔥" : "Daily Goal"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Longest Streak: <strong>{streak?.longestStreak || 0} days</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>
                    Total Active Days: <strong>{streak?.totalLearningDays || 0}</strong>
                  </span>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/student/dashboard")}
              className="rounded-xl border-[#DCEAF7] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold h-9 px-3.5 gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>View Streak Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Badges Milestone Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Badges & Achievements
              </h3>
              <span className="text-xs font-semibold text-blue-600 dark:text-sky-400">
                {badges.filter((b) => b.isEarned).length} of {badges.length} Unlocked
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {badges.length === 0 ? (
                <p className="text-xs text-slate-400">No badges currently listed.</p>
              ) : (
                badges.map((b) => (
                  <div
                    key={b.badgeId}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                      b.isEarned
                        ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 shadow-2xs"
                        : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                    }`}
                    title={b.description}
                  >
                    <span className="text-base">{b.icon}</span>
                    <span className="font-bold">{b.name}</span>
                    {b.isEarned ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 4. COURSES YOU ARE ENROLLED IN */}
        {/* ==================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                  Courses you are Enrolled in
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800">
                  {enrolledCourses.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Pick up where you left off or review course lectures.
              </p>
            </div>

            {enrolledCourses.length > 0 && (
              <Link
                to="/my-learning"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-sky-400 transition-colors"
              >
                <span>Go to My Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                You haven't enrolled in any courses yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Discover our catalog of expert-led courses and start building your skills today.
              </p>
              <Button
                onClick={() => navigate("/course/search?query")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl h-9 px-4 gap-1.5 cursor-pointer mt-1"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Course course={course} key={course._id} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ==================================================== */}
      {/* 5. EDIT PROFILE DIALOG */}
      {/* ==================================================== */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Update your personal display name and avatar photo. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={updateUserHandler} className="space-y-5 py-3">
            {/* Photo Upload with Live Preview */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <Avatar className="h-16 w-16 rounded-full ring-2 ring-blue-500/30 object-cover shrink-0">
                <AvatarImage
                  src={photoPreview || user?.photoURL || "https://github.com/shadcn.png"}
                  alt="Profile Preview"
                  className="object-cover"
                />
                <AvatarFallback className="font-bold bg-blue-600 text-white">
                  {name ? name.slice(0, 2).toUpperCase() : "SP"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label htmlFor="photoUpload" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Profile Picture
                </Label>
                <Input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  onChange={onChangeHandler}
                  className="text-xs file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-2.5 file:py-1 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  PNG, JPG, or WEBP up to 5MB.
                </p>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <Label htmlFor="profileName" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <Input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="h-10 text-sm rounded-xl"
                required
              />
            </div>

            {/* Read-Only Account Details */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email
                </span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" title={user.email}>
                  {user.email}
                </p>
              </div>
              <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Account Role
                </span>
                <p className="text-xs font-bold text-blue-600 dark:text-sky-400 uppercase">
                  {user.role || "STUDENT"}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={updateUserIsLoading}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserIsLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                {updateUserIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;

/**
 * ProfileSkeleton: High-fidelity loading skeleton matching the profile layout.
 */
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FBFF] dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-44 rounded-lg" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <Skeleton className="h-32 w-full" />
          <div className="px-6 pb-6 pt-0 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <Skeleton className="h-32 w-32 rounded-full ring-4 ring-white dark:ring-slate-900" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-7 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <Skeleton className="h-48 w-full rounded-2xl" />

        <div className="space-y-4">
          <Skeleton className="h-6 w-56 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
