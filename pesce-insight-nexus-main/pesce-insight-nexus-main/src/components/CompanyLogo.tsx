"use client";

import React, { useState, useMemo } from "react";
import { ensureAbsoluteUrl } from "@/utils/calculators";

interface CompanyLogoProps {
  name: string;
  logoUrl?: string;
  domain?: string;
  className?: string;
}

/**
 * CompanyLogo — A ultra-resilient, multi-source logo component.
 * It performs a "Logo Chase" across multiple providers:
 * 1. DB Semicolon-separated URLs
 * 2. Clearbit Logo API
 * 3. Google S2 Favicon API (Higher reliability)
 * 4. DuckDuckGo Icons API
 * 5. Initials Fallback
 */
export function CompanyLogo({ name, logoUrl, domain, className = "" }: CompanyLogoProps) {
  const [dbUrlIndex, setDbUrlIndex] = useState(0);
  const [fallbackStage, setFallbackStage] = useState<"db" | "clearbit" | "google" | "ddg" | "initials">("db");

  // Parse all possible URLs from the database field
  const allDbUrls = useMemo(() => {
    if (!logoUrl) return [];
    return logoUrl
      .split(";")
      .map(url => ensureAbsoluteUrl(url.trim()))
      .filter((url): url is string => !!url && url.includes("."));
  }, [logoUrl]);

  // Clean the domain aggressively: strip junk like "(formerly...)" or spaces
  const cleanDomain = useMemo(() => {
    const raw = domain || logoUrl?.split(";")[0] || "";
    if (!raw) return null;
    
    return raw
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, "") // Strip protocol
      .split(/[ \(\)\/]/)[0]                  // Stop at space, paren, or slash
      .trim();
  }, [domain, logoUrl]);

  // Fallback initials
  const initials = useMemo(() => {
    if (!name) return "?";
    return name
      .split(/\s+/)
      .map(word => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [name]);

  // STAGE 1: Try Database URLs
  if (fallbackStage === "db" && allDbUrls.length > 0 && dbUrlIndex < allDbUrls.length) {
    return (
      <div className={`relative overflow-hidden bg-white border border-[var(--border)] flex items-center justify-center ${className}`}>
        <img
          src={allDbUrls[dbUrlIndex]}
          alt={`${name} Logo`}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
          onError={() => {
            if (dbUrlIndex + 1 < allDbUrls.length) {
              setDbUrlIndex(dbUrlIndex + 1);
            } else {
              setFallbackStage("clearbit");
            }
          }}
        />
      </div>
    );
  }

  // STAGE 2: Try Clearbit API
  if ((fallbackStage === "clearbit" || (fallbackStage === "db" && allDbUrls.length === 0)) && cleanDomain) {
    return (
      <div className={`relative overflow-hidden bg-white border border-[var(--border)] flex items-center justify-center ${className}`}>
        <img
          src={`https://logo.clearbit.com/${cleanDomain}`}
          alt={`${name} Logo`}
          referrerPolicy="no-referrer"
          className="max-h-[85%] max-w-[85%] object-contain"
          onError={() => setFallbackStage("google")}
        />
      </div>
    );
  }

  // STAGE 3: Try Google S2 Favicon API (Very reliable fallback)
  if (fallbackStage === "google" && cleanDomain) {
    return (
      <div className={`relative overflow-hidden bg-white border border-[var(--border)] flex items-center justify-center ${className}`}>
        <img
          src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
          alt={`${name} Logo`}
          referrerPolicy="no-referrer"
          className="max-h-[70%] max-w-[70%] object-contain"
          onError={() => setFallbackStage("ddg")}
        />
      </div>
    );
  }

  // STAGE 4: Try DuckDuckGo Icons API
  if (fallbackStage === "ddg" && cleanDomain) {
    return (
      <div className={`relative overflow-hidden bg-white border border-[var(--border)] flex items-center justify-center ${className}`}>
        <img
          src={`https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`}
          alt={`${name} Logo`}
          referrerPolicy="no-referrer"
          className="max-h-[60%] max-w-[60%] object-contain"
          onError={() => setFallbackStage("initials")}
        />
      </div>
    );
  }

  // FINAL STAGE: Initials
  return (
    <div
      className={`bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] font-bold uppercase tracking-tighter shadow-inner ${className}`}
    >
      <span className="text-[0.75em] opacity-80">{initials}</span>
    </div>
  );
}
