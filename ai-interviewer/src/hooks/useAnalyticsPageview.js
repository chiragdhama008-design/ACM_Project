// src/hooks/useAnalyticsPageview.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fires a GA4 page_view event on every client-side route change.
 * The base gtag.js snippet in index.html only fires ONE page_view on
 * initial load (send_page_view: false), so without this, navigating
 * between /, /resume, /interviews etc. would be invisible in GA.
 *
 * Call this once, at the top level of App.jsx.
 */
export default function useAnalyticsPageview() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return; // GA script not loaded (blocked, or not yet ready)

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);
}
