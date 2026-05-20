import React, { useEffect } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts, Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Preloader } from "@/components/ui/Preloader";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[var(--background)]">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-[var(--primary)]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>404</h1>
        <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Intelligence node not found</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          The intel you're looking for doesn't exist or has been re-indexed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold uppercase tracking-widest bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--primary)] hover:text-white transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PESCE Placement Intelligence" },
      { name: "description", content: "Enterprise placement intelligence platform for PES College of Engineering, Mandya." },
      { name: "theme-color", content: "#09090b" },
      { property: "og:title", content: "PESCE Placement Intelligence" },
      { property: "og:description", content: "Decision-grade company intelligence for PESCE placements." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const location = useLocation();
  const [booting, setBooting] = React.useState(true);

  useEffect(() => {
    // Check if we've already booted in this session
    const hasBooted = sessionStorage.getItem("nexus_booted");
    if (hasBooted) {
      setBooting(false);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem("nexus_booted", "true");
    setBooting(false);
  };
  
  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {booting ? (
          <Preloader key="preloader" onComplete={handleBootComplete} />
        ) : (
          <AuthProvider key="app">
            <AuthGate location={location} />
          </AuthProvider>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

function AuthGate({ location }: { location: any }) {
  const { session, loading } = useAuth();
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    console.log("[Auth] 🔑 Session Detected:", !!session);
  }, [session]);

  const content = (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="w-full"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="mx-auto max-w-[1600px] overflow-x-hidden">
      <ErrorBoundary>
        {isLoginPage ? (
          content
        ) : (
          <DashboardLayout>
            {content}
          </DashboardLayout>
        )}
      </ErrorBoundary>
    </div>
  );
}
