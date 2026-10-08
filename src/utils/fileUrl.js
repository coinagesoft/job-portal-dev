// src/utils/fileUrl.js
// One place that turns whatever the API stored for a file/image into a URL the
// browser can load. Files live in S3 and are served by the API at /uploads/<key>,
// so we always point /uploads/... at the CURRENT API base URL. This also fixes
// old rows saved with http://<ec2-ip>/... or https://localhost:7011/...
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export function resolveFileUrl(url, { bustCache = false } = {}) {
  if (!url) return "";

  let out = url;
  const idx = url.toLowerCase().indexOf("/uploads/");

  if (/^https?:\/\//i.test(url)) {
    // absolute URL: only re-point our own /uploads/ files, leave external URLs alone
    if (idx > -1 && API_BASE) out = `${API_BASE}${url.slice(idx)}`;
  } else {
    // relative: "/uploads/x", "uploads/x" or "resumes/x.pdf"
    const path = url.startsWith("/") ? url : `/${url}`;
    out = `${API_BASE}${path}`;
  }

  if (bustCache) out += `${out.includes("?") ? "&" : "?"}t=${Date.now()}`;
  return out;
}