export const STATIC_ROLE_BY_MOBILE = {
  "1010101010": "candidate",
  "2020202020": "employer",
};

export const ROLE_DEFAULT_ROUTE = {
  candidate: "/candidate-profile",
  employer: "/employeer/cv-search",
};

// Candidate header: exactly 6 tabs (excluding profile & notification which are in profile dropdown)
export const CANDIDATE_HEADER_SECTIONS = [
  { label: "Home", href: "/homepage-new" },
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