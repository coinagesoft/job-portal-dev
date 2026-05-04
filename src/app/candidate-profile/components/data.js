export const mockProfile = {
  salaryExpectation: 45000,
  isITI: true,
  passportNumber: "Z1234567",
  passportExpiry: "2028-05-15",
  id: 1,
  avatar: "/assets/imgs/page/candidates/candidate-profile.png",
  firstName: "Ramesh Kumar",
  lastName: "Sharma",
  fullName: "Ramesh Kumar Sharma",
  mobile: "+91 98765 43210",
  email: "ramesh@email.com",
  trade: "Senior Electrician",
  yearsOfExperience: 8,
  nationality: "Indian",
  dob: "1992-07-14",
  gender: "Male",
  city: "Pune",
  state: "Maharashtra",
  pin: "411001",
  address: "",
  role: "",
  category: "",
  hasDisability: false,
  disabilityNote: "",
  preferredWorkLocation: "",
  jobType: "",
  summary:
    "Experienced senior electrician with 8 years in industrial and commercial electrical work. Skilled in panel wiring, motor winding, and PLC basics.",

  availableForWork: true,
  completionHint: "Add work history to reach 80%",
  sidebarBadges: ["ID Verified", "ITI Certified", "Available"],
  workHistory: [
    {
      id: "work-1",
      title: "Senior Electrician",
      company: "ABC Engineering Pvt Ltd",
      startDate: "2020-01-01",
      endDate: "Present",
      period: "Jan 2020 - Present", // legacy
      location: "Pune, Maharashtra",
      current: true,
      description:
        "Installation and maintenance of industrial electrical systems, panel wiring, motor testing, and safety audits."
    },
    {
      id: "work-2",
      title: "Electrician",
      company: "XYZ Power Solutions",
      startDate: "2016-03-01",
      endDate: "2019-12-31",
      period: "Mar 2016 - Dec 2019", // legacy
      location: "Mumbai, Maharashtra",
      current: false,
      description:
        "Maintenance of electrical substations and residential wiring projects with periodic safety checks."
    }
  ],
  education: [
    {
      id: "edu-1",
      title: "ITI - Electrician Trade",
      institution: "Govt. Industrial Training Institute, Pune",
      meta: "Passed: 2014 | Cert No: ITI/2014/PUN/7823",
      verified: true
    },
    {
      id: "edu-2",
      title: "SSC - 10th Standard",
      institution: "Maharashtra State Board of Secondary Education",
      meta: "Passed: 2012",
      verified: false
    }
  ],
  suggestedSkills: [
    "Wiring",
    "Panel work",
    "Motor winding",
    "MCB / RCCB",
    "Transformer",
    "PLC basics",
    "HT / LT lines",
    "Earthing",
    "Safety",
    "Cable laying",
    "Solar PV",
    "SCADA"
  ],
  selectedSkills: ["Wiring", "Panel work", "Motor winding", "PLC basics", "Earthing", "Safety"],
  skillMatrix: [
    { id: "skill-1", name: "Wiring", proficiency: "Expert", years: 8 },
    { id: "skill-2", name: "Panel work", proficiency: "Expert", years: 6 },
    { id: "skill-3", name: "PLC basics", proficiency: "Intermediate", years: 2 },
    { id: "skill-4", name: "Motor winding", proficiency: "Expert", years: 7 }
  ],
  documents: {
    nationalId: {
      label: "National ID",
      status: "verified",
      type: "dual",
      description: "Aadhaar Card",
      metaLines: ["Uploaded: 01 Apr 2026", "Extracted name: Ramesh K. Sharma"],
      frontFile: { name: "aadhaar_front.jpg", size: "340 KB" },
      backFile: null,
      footerNote: "ID hash stored securely"
    },
    passport: {
      label: "Passport",
      status: "missing",
      type: "single",
      description: "Required for international jobs.",
      metaLines: ["Minimum 6 months validity needed."],
      file: null,
      footerNote: "Unlocks international job applications"
    },
    itiCertificate: {
      label: "ITI Certificate",
      status: "verified",
      type: "readonly",
      description: "Electrician Trade",
      metaLines: ["Year: 2014", "Cert: ITI/2014/PUN/7823", "AI extracted and verified"],
      file: { name: "iti_certificate_2014.pdf", size: "1.2 MB" },
      footerNote: "AI verified"
    },
    experienceLetter: {
      label: "Experience Letter",
      status: "optional",
      type: "single",
      description: "Upload experience or relieving letter from your previous employer.",
      metaLines: ["Adds credibility to work history."],
      file: null,
      footerNote: "Adds credibility to work history"
    },
    medicalFitness: {
      label: "Medical Fitness",
      status: "optional",
      type: "single",
      description: "Required for offshore and high-risk roles.",
      metaLines: ["Upload a valid medical fitness certificate."],
      file: null,
      footerNote: "Required for offshore jobs"
    }
  },
  customDocuments: [],
  languages: [
    { name: "Hindi", proficiency: "Native", reading: true, writing: true, speaking: true },
    { name: "English", proficiency: "Professional", reading: true, writing: true, speaking: true },
    { name: "Marathi", proficiency: "Native", reading: true, writing: false, speaking: true },
  ]
};

// Inject CV doc into mockProfile.documents
mockProfile.documents.cv = {
  label: "CV / Resume",
  status: "optional",
  type: "single",
  description: "Upload your latest CV or resume (PDF, DOC, DOCX).",
  metaLines: ["Accepted: PDF, DOC, DOCX", "Max size: 5 MB"],
  file: null,
  footerNote: "Your CV is shown to verified employers only"
};

export const mockMyJobs = [
  {
    id: 1,
    company: "Horizon Marine Services",
    logo: "/assets/imgs/brands/brand-5.png",
    title: "Marine Electrician",
    type: "Full time",
    time: "4 mins ago",
    experience: "4-6 years",
    location: "Mumbai",
    price: "55,000",
    priceUnit: "/month",
    tags: ["Panel Wiring", "Safety"],
    description: "Employer shortlisted your profile for electrical maintenance and panel troubleshooting tasks."
  },
  {
    id: 2,
    company: "Westbay Infrastructure",
    logo: "/assets/imgs/brands/brand-6.png",
    title: "Site Welder (6G)",
    type: "Contract",
    time: "5 mins ago",
    experience: "5-8 years",
    location: "Pune",
    price: "62,000",
    priceUnit: "/month",
    tags: ["6G Welding", "Fabrication"],
    description: "Application moved to interview stage after technical screening call."
  },
  {
    id: 3,
    company: "Metro Cargo Logistics",
    logo: "/assets/imgs/brands/brand-7.png",
    title: "Warehouse Supervisor",
    type: "Full time",
    time: "6 mins ago",
    experience: "3-5 years",
    location: "Delhi / NCR",
    price: "48,000",
    priceUnit: "/month",
    tags: ["Dispatch", "Inventory"],
    description: "Your profile is in review for shift leadership and dispatch planning."
  },
  {
    id: 4,
    company: "Apex Industrial Projects",
    logo: "/assets/imgs/brands/brand-8.png",
    title: "Mechanical Fitter",
    type: "Full time",
    time: "6 mins ago",
    experience: "3-6 years",
    location: "Chennai",
    price: "52,000",
    priceUnit: "/month",
    tags: ["Machine Assembly", "Alignment"],
    description: "Employer requested final document verification before offer release."
  }
];

export const mockSavedJobs = [
  ...mockMyJobs,
  {
    id: 5,
    company: "Portline Engineering",
    logo: "/assets/imgs/brands/brand-1.png",
    title: "Rigger",
    type: "Contract",
    time: "4 minutes ago",
    experience: "3-5 years",
    location: "Visakhapatnam",
    price: "58,000",
    priceUnit: "/month",
    tags: ["Heavy Lift", "Signal Handling"],
    description: "Saved role for next week application after document update."
  },
  {
    id: 6,
    company: "Prime Facility Works",
    logo: "/assets/imgs/brands/brand-2.png",
    title: "Plumbing Technician",
    type: "Full time",
    time: "5 minutes ago",
    experience: "2-4 years",
    location: "Bengaluru",
    price: "42,000",
    priceUnit: "/month",
    tags: ["Leak Testing", "Blueprint Reading"],
    description: "Saved job with immediate joining preference."
  },
  {
    id: 7,
    company: "TransCity Fleet",
    logo: "/assets/imgs/brands/brand-3.png",
    title: "Heavy Vehicle Driver",
    type: "Full time",
    time: "6 minutes ago",
    experience: "2-5 years",
    location: "Hyderabad",
    price: "36,000",
    priceUnit: "/month",
    tags: ["HMV License", "Fleet Safety"],
    description: "Role saved for alternate shift preference."
  },
  {
    id: 8,
    company: "BluePeak Fabricators",
    logo: "/assets/imgs/brands/brand-4.png",
    title: "TIG Welder",
    type: "Contract",
    time: "6 minutes ago",
    experience: "4-7 years",
    location: "Noida",
    price: "60,000",
    priceUnit: "/month",
    tags: ["TIG", "Quality Checks"],
    description: "Application readiness saved for later submission."
  },
  {
    id: 9,
    company: "Harbor Crew Services",
    logo: "/assets/imgs/brands/brand-5.png",
    title: "Deck Crew Assistant",
    type: "Contract",
    time: "4 minutes ago",
    experience: "1-3 years",
    location: "Goa",
    price: "44,000",
    priceUnit: "/month",
    tags: ["Deck Support", "Safety Drill"],
    description: "Saved for upcoming coastal deployment cycle."
  },
  {
    id: 10,
    company: "Skyline Structures",
    logo: "/assets/imgs/brands/brand-6.png",
    title: "Shuttering Carpenter",
    type: "Full time",
    time: "5 minutes ago",
    experience: "3-5 years",
    location: "Ahmedabad",
    price: "46,000",
    priceUnit: "/month",
    tags: ["Formwork", "Layout Reading"],
    description: "Role saved to apply after relocation confirmation."
  },
  {
    id: 11,
    company: "Thermal Utility Systems",
    logo: "/assets/imgs/brands/brand-7.png",
    title: "Boiler Operator",
    type: "Full time",
    time: "6 minutes ago",
    experience: "5-8 years",
    location: "Nagpur",
    price: "58,000",
    priceUnit: "/month",
    tags: ["Boiler Ops", "Log Sheets"],
    description: "Saved for interview preparation this month."
  },
  {
    id: 12,
    company: "Metroline Services",
    logo: "/assets/imgs/brands/brand-8.png",
    title: "HVAC Technician",
    type: "Full time",
    time: "6 minutes ago",
    experience: "2-5 years",
    location: "Lucknow",
    price: "50,000",
    priceUnit: "/month",
    tags: ["HVAC", "Troubleshooting"],
    description: "Saved to compare with current shortlisted roles."
  }
];

export const mockApplicationStatuses = [
  {
    id: 1,
    company: "Horizon Marine Services",
    logo: "/assets/imgs/brands/brand-1.png",
    title: "Marine Electrician",
    type: "Full time",
    location: "Mumbai",
    appliedOn: "02 Apr 2026",
    updatedOn: "08 Apr 2026",
    stage: "Profile Shortlisted",
    status: "Shortlisted",
    progress: 55,
    price: "55,000",
    priceUnit: "/month",
    tags: ["Panel Wiring", "Safety Compliance"],
    description:
      "Your profile matched the role requirements. Recruiter has shortlisted your application.",
    recruiterNote:
      "Strong technical match. Keep passport and electrical certificates ready for final discussion.",
    nextActionTitle: "Share latest certificate copies",
    nextActionDate: "Before 18 Apr 2026",
    nextActionType: "document",
    nextActionCta: {
      label: "Upload Documents",
      href: "/candidate-profile"
    }
  },
  {
    id: 2,
    company: "Westbay Infrastructure",
    logo: "/assets/imgs/brands/brand-2.png",
    title: "Site Welder (6G)",
    type: "Contract",
    location: "Pune",
    appliedOn: "29 Mar 2026",
    updatedOn: "10 Apr 2026",
    stage: "Interview Scheduled",
    status: "Interview",
    progress: 80,
    price: "62,000",
    priceUnit: "/month",
    tags: ["6G Welding", "Fabrication"],
    description:
      "Trade test and supervisor interview have been scheduled. Check your email for location and timing.",
    recruiterNote:
      "Please bring your original certification documents and arrive 20 minutes early.",
    nextActionTitle: "Attend welding trade test",
    nextActionDate: "16 Apr 2026, 11:30 AM IST",
    nextActionType: "interview",
    nextActionCta: {
      label: "View Interview Details",
      href: "/candidate-profile/application-status"
    }
  },
  {
    id: 3,
    company: "Metro Cargo Logistics",
    logo: "/assets/imgs/brands/brand-3.png",
    title: "Warehouse Supervisor",
    type: "Full time",
    location: "Delhi / NCR",
    appliedOn: "25 Mar 2026",
    updatedOn: "30 Mar 2026",
    stage: "Application Under Review",
    status: "In Review",
    progress: 35,
    price: "48,000",
    priceUnit: "/month",
    tags: ["Dispatch Planning", "Inventory"],
    description:
      "Hiring team is reviewing your profile, shift handling experience, and dispatch track record.",
    recruiterNote:
      "Profile appears relevant. Team may schedule a short operations round.",
    nextActionTitle: "Keep phone and documents ready",
    nextActionDate: "Expected update by 19 Apr 2026",
    nextActionType: "followup",
    nextActionCta: {
      label: "Update Contact Preferences",
      href: "/candidate-profile"
    }
  },
  {
    id: 4,
    company: "Apex Industrial Projects",
    logo: "/assets/imgs/brands/brand-4.png",
    title: "Mechanical Fitter",
    type: "Full time",
    location: "Chennai",
    appliedOn: "21 Mar 2026",
    updatedOn: "27 Mar 2026",
    stage: "Application Closed",
    status: "Rejected",
    progress: 100,
    price: "52,000",
    priceUnit: "/month",
    tags: ["Machine Assembly", "Alignment"],
    description:
      "Position has been closed for this hiring cycle. You can reapply when this role opens again.",
    recruiterNote:
      "Role is paused currently. You were close to shortlist and can apply to similar maintenance roles.",
    nextActionTitle: "Explore similar active roles",
    nextActionDate: "Available now",
    nextActionType: "closed",
    nextActionCta: {
      label: "Find Similar Jobs",
      href: "/jobs-list"
    }
  },
  {
    id: 5,
    company: "Portline Engineering",
    logo: "/assets/imgs/brands/brand-7.png",
    title: "Rigger",
    type: "Contract",
    location: "Visakhapatnam",
    appliedOn: "12 Apr 2026",
    updatedOn: "12 Apr 2026",
    stage: "Application Submitted",
    status: "Applied",
    progress: 20,
    price: "58,000",
    priceUnit: "/month",
    tags: ["Heavy Lift", "Signal Handling"],
    description:
      "Application was submitted successfully. Recruiter has not reviewed your profile yet.",
    recruiterNote:
      "Initial screening queue received. Keep your latest resume and contact details updated.",
    nextActionTitle: "No action required right now",
    nextActionDate: "Waiting for recruiter review",
    nextActionType: "pending",
    nextActionCta: {
      label: "View Submitted Profile",
      href: "/candidate-profile"
    }
  }
];


