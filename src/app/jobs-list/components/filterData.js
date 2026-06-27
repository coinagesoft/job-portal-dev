export const filterCategories = [
  { label: "Work Mode", type: "employmentModes" },
  { label: "Department", type: "departments" },
  { label: "Industries", type: "tradeCategories" },
  { label: "Role", type: "roles" },
  { label: "Education", type: "educationLevels" },
  { label: "Location", type: "cities" },
  { label: "Skills", type: "skills" },
  { label: "Employment Type", type: "employmentTypes" },
  { label: "Location Type", type: "locationTypes" }
];

export const filterOptions = {
  workMode: [
    { label: "Remote", count: 34, selected: false },
    { label: "On-site", count: 1480, selected: false },
    { label: "Hybrid", count: 162, selected: false }
  ],
  department: [
    { label: "Maintenance", count: 420, selected: false },
    { label: "Fabrication", count: 260, selected: false },
    { label: "Operations", count: 350, selected: false },
    { label: "Safety", count: 140, selected: false },
    { label: "Construction", count: 280, selected: false },
    { label: "Transport", count: 90, selected: false }
  ],
  experience: [
    { label: "Fresher (0-1 yr)", count: 130, selected: false },
    { label: "1-3 Years", count: 460, selected: false },
    { label: "3-5 Years", count: 510, selected: false },
    { label: "5-10 Years", count: 340, selected: false },
    { label: "10+ Years", count: 90, selected: false }
  ],
  salary: [
    { label: "20K - 30K", count: 122, selected: false },
    { label: "30K - 45K", count: 418, selected: false },
    { label: "45K - 60K", count: 376, selected: false },
    { label: "60K - 80K", count: 204, selected: false },
    { label: "80K+", count: 68, selected: false }
  ],
  companies: [
    { label: "Horizon Marine Services", count: 28, selected: false },
    { label: "Westbay Infrastructure", count: 21, selected: false },
    { label: "Metro Cargo Logistics", count: 19, selected: false },
    { label: "Apex Industrial Projects", count: 24, selected: false },
    { label: "Portline Engineering", count: 33, selected: false }
  ],
  industries: [
    { label: "Construction", count: 420, selected: false },
    { label: "Marine", count: 360, selected: false },
    { label: "Manufacturing", count: 255, selected: false },
    { label: "Logistics", count: 310, selected: false },
    { label: "Hospitality", count: 118, selected: false },
    { label: "Oil and Gas", count: 98, selected: false }
  ],
  role: [
    { label: "Welder", count: 210, selected: false },
    { label: "Marine Electrician", count: 120, selected: false },
    { label: "Fitter", count: 165, selected: false },
    { label: "Driver", count: 175, selected: false },
    { label: "Technician", count: 238, selected: false },
    { label: "Supervisor", count: 104, selected: false }
  ],
  education: [
    { label: "10th / 12th", count: 540, selected: false },
    { label: "ITI / Diploma", count: 820, selected: false },
    { label: "Any Graduate", count: 260, selected: false },
    { label: "Trade Certificate", count: 490, selected: false }
  ],
  postedBy: [
    { label: "Company", count: 930, selected: false },
    { label: "Recruiter", count: 240, selected: false },
    { label: "Consultant", count: 130, selected: false }
  ],
  freshness: [
    { label: "Last 24 hours", count: 178, selected: false },
    { label: "Last 3 days", count: 394, selected: false },
    { label: "Last 7 days", count: 690, selected: false },
    { label: "Last 30 days", count: 1220, selected: false }
  ],
  sort: [
    { label: "Relevance", count: null, selected: true },
    { label: "Date (Newest)", count: null, selected: false },
    { label: "Salary (High-Low)", count: null, selected: false },
    { label: "Salary (Low-High)", count: null, selected: false }
  ],
  location: [
    { label: "Mumbai", count: 420, selected: false },
    { label: "Pune", count: 344, selected: false },
    { label: "Delhi / NCR", count: 236, selected: false },
    { label: "Chennai", count: 226, selected: false },
    { label: "Hyderabad", count: 212, selected: false },
    { label: "Bengaluru", count: 184, selected: false },
    { label: "Kochi", count: 92, selected: false },
    { label: "Noida", count: 88, selected: false },
    { label: "Kolkata", count: 156, selected: false },
    { label: "Ahmedabad", count: 132, selected: false }
  ]
};


