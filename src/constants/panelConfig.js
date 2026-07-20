export const STATIC_ROLE_BY_MOBILE = {
  "1010101010": "candidate",
  "2020202020": "employer",
};

export const ROLE_DEFAULT_ROUTE = {
  candidate: "/",
  employer: "/employeer/cv-search",
};

// Candidate header: exactly 6 tabs (excluding profile & notification which are in profile dropdown)
export const CANDIDATE_HEADER_SECTIONS = [
  { label: "Home", href: "/" },
  { label: "Find Jobs", href: "/jobs-list" },
  { label: "My Applications", href: "/candidate-profile/application-status" },
  { label: "Saved Jobs", href: "/candidate-profile/saved-jobs" },
  { label: "Settings", href: "/candidate-profile/settings" },
  { label: "Help & Support", href: "/candidate-profile/settings/help-support" },
];

export const EMPLOYER_HEADER_TABS = [
  {
    key: "dashboard",
    label: "Home",
    links: [
      { label: "CV Search", href: "/employeer/cv-search" },
      { label: "Shortlisted", href: "/employeer/candidate-profile" },
    ],
  },
  {
    key: "jobs",
    label: "Jobs",
    links: [
      { label: "Job List", href: "/employeer/job-list" },
      { label: "Post a Job", href: "/dashboard/post-job" },
      { label: "Applicants", href: "/employeer/applicants" },
    ],
  },
  {
    key: "credits-wallets",
    label: "Credits & Wallets",
    links: [
      { label: "Credit Wallet", href: "/employeer/credit-wallet" },
      { label: "Buy Credits", href: "/employeer/buy-credits" },
      { label: "Invoices", href: "/employeer/invoices" },
    ],
  },
  {
    key: "account",
    label: "Account",
    links: [
      { label: "Company Profile", href: "/employeer/company-profile" },
      { label: "Verification & Badges", href: "/employeer/verification" },
      { label: "Sub-Users", href: "/employeer/sub-user" },
      { label: "Notifications", href: "/employeer/notifications" },
      { label: "Help & Support", href: "/employeer/help-support" },
      { label: "Settings", href: "/employeer/settings" },
    ],
  },
];

export const CANDIDATE_PROTECTED_PREFIXES = ["/candidate-profile"];
export const EMPLOYER_PROTECTED_PREFIXES = ["/employeer", "/dashboard"];

// Routes that fall under a protected prefix above (e.g. "/employeer") but
// must stay fully public — they're meant to be opened by someone who isn't
// logged in at all (or is logged in as a different account on that device).
// Used by both AuthRouteGuard (skip the login redirect) and Header (skip
// rendering the logged-in-session nav).
export const PUBLIC_ROUTE_EXCEPTIONS = ["/employeer/accept-invite"];

// Sub-user role string that's allowed to VIEW (but never edit — see
// SubUserViewOnlyGuard) the four "account owner" pages below. Must match
// the value coming back from GET /api/recruiter/sub-users/my-permissions
// — this is the backend SubUserRole enum member name ("HR_Manager", the
// same value used as the <option value="HR_Manager"> in the invite form),
// not the "HR Manager" display label shown to the user.
export const HR_MANAGER_ROLE = "HR_Manager";

// Pages that need a specific permission flag beyond just "logged in as
// employer" — a sub-user lacking the flag gets redirected away instead of
// seeing the page at all.
//
// `hrManagerViewOnly: true` — only a sub-user whose role is exactly
// HR_MANAGER_ROLE may even open the page; every other sub-user role is
// redirected away like `ownerOnly` below. An HR Manager sub-user who does
// get through still can't edit anything there — SubUserViewOnlyGuard
// (rendered inside the page itself) makes it read-only for any sub-user,
// HR Manager included.
export const ROUTE_PERMISSION_RULES = [
  { prefix: "/dashboard/post-job", permission: "canPostJobs" },
  { prefix: "/employeer/company-profile", hrManagerViewOnly: true },
  { prefix: "/employeer/verification", hrManagerViewOnly: true },
  { prefix: "/employeer/sub-user", hrManagerViewOnly: true },
  { prefix: "/employeer/buy-credits", hrManagerViewOnly: true },
  { prefix: "/employeer/settings", hrManagerViewOnly: true },
];