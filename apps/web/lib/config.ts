// Simple configuration for API URL
// In development, we use the env var or localhost
// In production (Vercel), we use relative paths since frontend/backend are on same domain

export const getApiUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: requires full URL
    // Vercel sets VERCEL_URL system env var
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
  
  // Client-side: use relative path if on same domain, or env var if set
  if (process.env.NODE_ENV === 'production') {
    return ""; // Relative path, e.g. "/api/..."
  }
  
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

