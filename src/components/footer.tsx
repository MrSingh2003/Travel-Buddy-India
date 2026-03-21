"use client";

import { Link } from "react-router-dom";
import { Mail, MapPinned, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function Footer() {
  const year = new Date().getFullYear();
  const { language, t } = useLanguage();

  const footerCopy = {
    en: {
      tagline:
        "A practical India travel planning platform focused on trip budgeting, route support, local language comfort, and day-by-day planning that feels useful on real trips.",
      quickLinks: "Quick links",
      contact: "Contact me",
      projectLine: "India travel and tourism planning project",
      rights: "All rights reserved. Personal project use only.",
      crafted: "Travel Buddy India. Crafted by Pranav Singh.",
      license: "License: All rights reserved.",
    },
    hi: {
      tagline:
        "यह एक व्यावहारिक भारत यात्रा योजना प्लेटफ़ॉर्म है जो बजट, रूट सहायता, स्थानीय भाषा सुविधा और दिन-प्रतिदिन की उपयोगी योजना पर केंद्रित है।",
      quickLinks: "त्वरित लिंक",
      contact: "संपर्क करें",
      projectLine: "भारत यात्रा और पर्यटन योजना परियोजना",
      rights: "सर्वाधिकार सुरक्षित। केवल व्यक्तिगत परियोजना उपयोग के लिए।",
      crafted: "Travel Buddy India. प्रणव सिंह द्वारा निर्मित।",
      license: "लाइसेंस: सर्वाधिकार सुरक्षित।",
    },
  } as const;

  const copy = footerCopy[language as keyof typeof footerCopy] ?? footerCopy.en;

  return (
    <footer className="border-t border-border/70 bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700 dark:text-orange-200">
              Travel Buddy India
            </p>
            <p className="text-sm leading-7 text-muted-foreground">{copy.tagline}</p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold">{copy.quickLinks}</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/trip-planner" className="hover:text-foreground">
                {t("nav.aiTripPlanner")}
              </Link>
              <Link to="/route-planner" className="hover:text-foreground">
                {t("features.routePlanner.title")}
              </Link>
              <Link to="/support" className="hover:text-foreground">
                {t("nav.support")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold">{copy.contact}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:pranavsingh703@gmail.com" className="hover:text-foreground">
                  pranavsingh703@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                <span>{copy.projectLine}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{copy.rights}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>(c) {year} {copy.crafted}</p>
          <p>{copy.license}</p>
        </div>
      </div>
    </footer>
  );
}
