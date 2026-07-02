// ============================================================
// job-details/data.js
//
// This file previously contained a hardcoded mock job
// ("Senior Marine Electrician" / "Horizon Marine Services" /
// "Mumbai Dockyard, India") that silently leaked into the UI
// as a fallback whenever a real API field was missing or
// misnamed. That mock has been removed entirely — every value
// on this page now comes from the real API response, or is
// left blank/hidden if the API didn't provide it.
// ============================================================

const asText = (value, fallback = "") =>
  value === null || value === undefined || value === ""
    ? fallback
    : String(value);

const joinText = (...values) =>
  values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");

/**
 * Normalizes the raw job-details API response into the shape the
 * page components expect. Unlike before, this does NOT fall back
 * to any mock/dummy data — missing fields resolve to "" (empty
 * string) or null, and each component is responsible for hiding
 * a row/section when its value is empty.
 */
export const mapApiJobToDetailedJob = (job = {}) => {
  const cityState = joinText(job.city, job.state);

  const companyName = asText(job.companyName);
  const fullCompanyName = asText(
    job.companyFullName || job.companyLegalName,
    companyName
  );

  // Real field is `companyLocation` (already a formatted "City, State,
  // Country" string from the API). Previously this checked fields that
  // don't exist on the real response (job.location, job.workLocation),
  // which meant it always fell through to a hardcoded dummy location.
  const location = asText(
    job.companyLocation || cityState || job.jobLocation
  );

  const roleTitle = asText(job.jobTitle);

  // `employmentType` (Full_Time / Part_Time / ...) describes the job.
  // `jobType` (Normal_Job / Hot_Vacancy / Classified) is an internal
  // posting-priority flag and should never be shown as "job type" to
  // candidates. Previously this preferred jobType, which is why
  // "Normal_Job" leaked into the hero section.
  const employmentType = asText(job.employmentType);

  const timeAgo = asText(job.timeAgo || job.postedTimeAgo);

  return {
    ...job,

    jobId: job.jobId || null,

    title: roleTitle,
    jobTitle: roleTitle,

    company: companyName,
    companyName,
    companyFull: fullCompanyName,

    location,

    type: employmentType,
    time: timeAgo,

    // No real "banner image" field exists on the API yet — leave it
    // unset rather than showing a placeholder stock photo.
    bannerImg: job.bannerImg || job.coverImageUrl || null,

    avatar: job.companyLogoUrl || null,
  };
};