import React from "react";
import Accenture from "@/assets/images/Accenture.png";
import Oracle from "@/assets/images/Oracle_logo.svg.png";
import Adobe from "@/assets/images/Adobe-Logo.png";
import Meta from "@/assets/images/Meta-Logo.png";
import paypal from "@/assets/images/PayPal.svg.png";

const companies = [
  { name: "Meta", logo: Meta, height: "h-11 sm:h-13" },
  { name: "Oracle", logo: Oracle, height: "h-5 sm:h-6" },
  { name: "Accenture", logo: Accenture, height: "h-11 sm:h-13" },
  { name: "Adobe", logo: Adobe, height: "h-10 sm:h-12" },
  { name: "PayPal", logo: paypal, height: "h-7 sm:h-8.5" },
];

const TrustedCompanies = () => {
  return (
    <section className="py-7 sm:py-9 bg-white dark:bg-[#070d18] border-b border-[#DCEAF7]/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Compact, stylish headline with tight bottom margin */}
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-4">
          Trusted by learners building careers at leading companies
        </p>

        {/* Compact, cohesive logos row */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
          {companies.map((company, index) => (
            <div
              key={index}
              className="h-12 sm:h-14 w-28 sm:w-32 flex items-center justify-center transition-all duration-200 transform hover:scale-105"
              title={company.name}
            >
              <img
                src={company.logo}
                alt={company.name}
                className={`${company.height} w-auto max-w-full object-contain`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;
