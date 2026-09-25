import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SecurityShield from "@/components/SecurityShield";
import ContactModal from "@/components/ContactModal";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const isAdminPage = location.pathname.startsWith("/admin");

  // Listen to open-contact-modal custom event anywhere in the app
  useEffect(() => {
    const handleOpenContact = () => setIsContactOpen(true);
    window.addEventListener("open-contact-modal", handleOpenContact);
    return () => window.removeEventListener("open-contact-modal", handleOpenContact);
  }, []);

  return (
    <div
      className={`flex flex-col ${
        isAuthPage || isAdminPage ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Enterprise Security Shield: Locks screenshot, copy/paste, image downloads, and keypad */}
      <SecurityShield />

      <Navbar onOpenContact={() => setIsContactOpen(true)} />
      <div
        className={`flex-1 mt-16 ${
          isAuthPage || isAdminPage ? "h-[calc(100vh-4rem)] overflow-hidden" : ""
        }`}
      >
        <Outlet />
      </div>
      {!isAuthPage && !isAdminPage && (
        <Footer onOpenContact={() => setIsContactOpen(true)} />
      )}
      {!isAuthPage && !isAdminPage && <ScrollToTop />}

      {/* Global Interactive Contact Support Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
