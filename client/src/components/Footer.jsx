import React from "react";
import { Link } from "react-router-dom";
import { School, ShieldCheck, Github, Linkedin, Instagram, Youtube, ArrowUpRight, Star, Heart, Sparkles } from "lucide-react";

const Footer = ({ onOpenContact }) => {
  return (
    <footer className="bg-[#0F172A] text-slate-400 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 sm:pt-14 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission (2 cols wide on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-500 transition-colors">
                <School className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                SkillStack
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Learn practical skills. Build real projects. Grow your career from one comprehensive, industry-leading learning platform.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/SandeepCodes31/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/course/search?query" className="hover:text-white transition-colors">
                  Explore Courses
                </Link>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Learning Paths
                </a>
              </li>
              <li>
                <Link to="/my-learning" className="hover:text-white transition-colors">
                  My Learning
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/verify-certificate" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Certificates</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Instructor Program
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Careers
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Blog & Articles
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Help Center
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  FAQ
                </span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenContact) onOpenContact();
                    else window.dispatchEvent(new CustomEvent("open-contact-modal"));
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <Link to="/verify-certificate" className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credential</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Creator Attribution & GitHub Banner */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 py-2">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-800/80 text-blue-400 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Full-Stack LMS Project</span>
            </span>
            <span>
              Designed &amp; built by{" "}
              <a
                href="https://github.com/SandeepCodes31/"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-white hover:text-blue-400 underline underline-offset-4 decoration-blue-500 transition-colors"
              >
                Sandeep Pal
              </a>{" "}
              from scratch.
            </span>
          </div>

          <a
            href="https://github.com/SandeepCodes31/SkillStack"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all shadow-xs group cursor-pointer"
          >
            <Github className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
            <span>Star this repo on GitHub</span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SkillStack LMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
