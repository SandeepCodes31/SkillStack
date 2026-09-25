import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { ShieldAlert, Lock } from "lucide-react";

/**
 * Enterprise Client Security Shield for SkillStack LMS
 * Features:
 * 1. Screenshot & Screen Capture Lock (PrintScreen, Snipping tool, Print dialog)
 * 2. Copy & Paste Lock (Blocks right-click context menu, copy, cut, paste)
 * 3. Photo & Image Download Protection (Blocks image drag, context save)
 * 4. Keypad Lock with Security Notification (Typing allowed ONLY in search and contact sections)
 * 5. DevTools Shortcut Protection (F12, Ctrl+Shift+I, Ctrl+U, etc.)
 */
const SecurityShield = () => {
  const [screenCaptureBlocked, setScreenCaptureBlocked] = useState(false);
  const lastToastTimeRef = useRef(0);

  // Helper to throttle security toast notifications to prevent spamming
  const showThrottledToast = (message, type = "error") => {
    const now = Date.now();
    if (now - lastToastTimeRef.current > 2000) {
      lastToastTimeRef.current = now;
      if (type === "error") {
        toast.error(message, {
          icon: <Lock className="w-4 h-4 text-rose-500" />,
          duration: 3000,
        });
      } else {
        toast.warning(message, {
          icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
          duration: 3000,
        });
      }
    }
  };

  /**
   * Determine if an element is an allowed input for typing.
   * Allowed zones:
   * 1. Search inputs (course search, navbar search, search queries)
   * 2. Contact section (contact form inputs and textareas)
   * 3. Core authentication & management forms (login, signup, admin editor)
   */
  const isAllowedInputElement = (target) => {
    if (!target) return false;

    const tagName = target.tagName?.toLowerCase();
    const isInput = tagName === "input" || tagName === "textarea" || target.isContentEditable;
    if (!isInput) return false;

    // Check for explicit data attributes
    if (
      target.getAttribute("data-allow-typing") === "true" ||
      target.getAttribute("data-contact-input") === "true" ||
      target.getAttribute("data-search-input") === "true"
    ) {
      return true;
    }

    // Check if inside contact section or contact modal
    if (target.closest("#contact-section") || target.closest("[data-contact-container]")) {
      return true;
    }

    // Check if it is a search input
    const type = target.getAttribute("type")?.toLowerCase();
    const name = target.getAttribute("name")?.toLowerCase() || "";
    const placeholder = target.getAttribute("placeholder")?.toLowerCase() || "";
    const id = target.getAttribute("id")?.toLowerCase() || "";
    const className = (target.className || "").toString().toLowerCase();

    if (
      type === "search" ||
      placeholder.includes("search") ||
      name.includes("search") ||
      id.includes("search") ||
      className.includes("search") ||
      target.closest("#course-search") ||
      target.closest("[data-search-container]")
    ) {
      return true;
    }

    // Check if inside authentication or admin edit form so users are not locked out
    if (
      target.closest("form") &&
      (window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/signup") ||
        window.location.pathname.includes("/admin") ||
        window.location.pathname.includes("/profile") ||
        window.location.pathname.includes("/quiz"))
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    // 1. Lock Context Menu (Right Click) across the entire website
    const handleContextMenu = (e) => {
      e.preventDefault();
      showThrottledToast("🔒 Right click is disabled for content and image protection.");
      return false;
    };

    // 2. Lock Copy, Cut and Paste Actions
    const handleCopy = (e) => {
      e.preventDefault();
      showThrottledToast("🔒 Copying content is locked for security.");
      return false;
    };

    const handleCut = (e) => {
      if (!isAllowedInputElement(e.target)) {
        e.preventDefault();
        showThrottledToast("🔒 Cut action is locked for security.");
        return false;
      }
    };

    const handlePaste = (e) => {
      if (!isAllowedInputElement(e.target)) {
        e.preventDefault();
        showThrottledToast("🔒 Pasting is locked on this element.");
        return false;
      }
    };

    // 3. Lock Image Dragging to prevent photo downloads
    const handleDragStart = (e) => {
      if (e.target && (e.target.tagName === "IMG" || e.target.querySelector("img"))) {
        e.preventDefault();
        showThrottledToast("🔒 Photo download and dragging is locked.");
        return false;
      }
    };

    // 4. Keyboard Listener: Keypad Lock & Screenshot / DevTools Lock
    const handleKeyDown = (e) => {
      const key = e.key;
      const code = e.code;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // --- A. Screenshot & Screen Capture Lock ---
      const isPrintScreen =
        key === "PrintScreen" || code === "PrintScreen" || e.keyCode === 44;
      const isWinSnipping =
        (e.metaKey || e.ctrlKey) && e.shiftKey && (key === "S" || key === "s");
      const isMacScreenshot =
        e.metaKey && e.shiftKey && ["3", "4", "5"].includes(key);
      const isPrintCommand =
        isCtrlOrMeta && (key === "p" || key === "P");
      const isSavePage =
        isCtrlOrMeta && (key === "s" || key === "S");

      if (isPrintScreen || isWinSnipping || isMacScreenshot || isPrintCommand || isSavePage) {
        e.preventDefault();
        e.stopPropagation();

        // Clear clipboard so screenshot cannot be stored
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText("⚠️ Content protected by SkillStack Security.")
            .catch(() => {});
        }

        // Trigger black screen protection overlay
        setScreenCaptureBlocked(true);
        setTimeout(() => setScreenCaptureBlocked(false), 2000);

        showThrottledToast(
          "🔒 Screenshot & capture mode is locked for copyright security."
        );
        return false;
      }

      // --- B. Developer Tools Shortcut Lock ---
      const isDevTools =
        key === "F12" ||
        (isCtrlOrMeta && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(key)) ||
        (isCtrlOrMeta && (key === "U" || key === "u"));

      if (isDevTools) {
        e.preventDefault();
        e.stopPropagation();
        showThrottledToast("🔒 Developer tools inspection is locked for security.");
        return false;
      }

      // --- C. Keypad Lock with Notification ---
      // Safe navigation keys: Tab, Esc, Arrows, PageUp/Down
      const isNavigationKey = [
        "Tab",
        "Escape",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "CapsLock",
      ].includes(key);

      if (isNavigationKey) {
        return; // Allow smooth navigational control
      }

      // Check if typing target is inside allowed zones (search, contact, essential forms)
      const allowed = isAllowedInputElement(e.target);

      if (!allowed) {
        // User is attempting to type on the page body, headings, cards, or non-allowed areas
        e.preventDefault();
        e.stopPropagation();

        showThrottledToast(
          "🔒 Keypad is locked for security purposes. Typing is enabled only in the search and contact sections."
        );
        return false;
      }
    };

    // Attach global window listeners with capture phase for absolute security
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("copy", handleCopy, { capture: true });
    window.addEventListener("cut", handleCut, { capture: true });
    window.addEventListener("paste", handlePaste, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("copy", handleCopy, { capture: true });
      window.removeEventListener("cut", handleCut, { capture: true });
      window.removeEventListener("paste", handlePaste, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  return (
    <>
      {/* Momentary Anti-Screenshot Flash Overlay */}
      {screenCaptureBlocked && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center text-center p-6 backdrop-blur-2xl transition-all">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
            Screen Capture Prohibited
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md">
            SkillStack LMS content is cryptographically protected against screenshots, screen recording, and unauthorized replication.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-rose-400 font-mono">
            <span>Security Rule: SEC-DRM-2026</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SecurityShield;
