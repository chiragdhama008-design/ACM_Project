// Centralized API base URL.
// - In local dev (`npm run dev`), Vite sets import.meta.env.DEV = true, so
//   this falls back to your local backend on port 5000.
// - In production (built via `npm run build`), it falls back to a
//   RELATIVE path "/api" — since the backend serves this built frontend
//   itself (single-origin deployment on Render), requests to "/api/..."
//   automatically go to the same server, no domain needed.
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

