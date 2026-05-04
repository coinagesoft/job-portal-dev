import { mockJobs } from "@/app/jobs-list/components/data.js";

export const detailedJob = {
  id: 99,
  title: "Senior Marine Electrician",
  company: "Horizon Marine Services",
  companyFull: "Horizon Marine Services Pvt. Ltd.",
  location: "Mumbai Dockyard, India",
  type: "Full time",
  time: "Posted 3 hours ago",
  bannerImg: "/assets/imgs/page/job-single/thumb.png",
  avatar: "/assets/imgs/page/job-single/avatar.png",
  salary: "$55,000 - $72,000 / month",
  experience: "5 - 8 years",
  industry: "Marine Operations / Industrial Maintenance",
  jobLevel: "Senior Technician",
  jobType: "Permanent",
  minAgeMax: "23 - 42 years",
  locationType: "On-site",
  education: "ITI / Diploma in Electrical trade",
  requiredCertification: "Passport, Electrical Safety, Marine Compliance",
  gender: "Any",
  languagePreferred: "English, Hindi",
  deadline: "30/05/2026",
  updated: "24/04/2026",
  openJobs: 6,
  address: "Dock Yard Unit 5, Ballard Estate, Mumbai, Maharashtra",
  phone: "+91 22 4000 8800",
  email: "hiring@horizonmarine.in",
  employerQuestions: [
    {
      id: "passport",
      label: "Do you have a valid passport with minimum 6 months validity?",
      type: "radio",
      options: ["Yes", "No"],
      required: true
    },
    {
      id: "marine-panel",
      label: "Describe your experience with marine distribution and control panels.",
      type: "text",
      placeholder: "Mention vessel type, systems handled, and years of exposure.",
      required: true
    },
    {
      id: "safety-shift",
      label: "Can you work rotational shifts and follow vessel safety protocols?",
      type: "radio",
      options: ["Yes", "No"],
      required: true
    }
  ],
  description: `
    <h4>Role Summary</h4>
    <p>
      Horizon Marine Services is hiring a Senior Marine Electrician to support vessel maintenance,
      electrical troubleshooting, and compliance-driven operations at dock and offshore locations.
    </p>

    <h4>Key Responsibilities</h4>
    <ul>
      <li>Inspect, repair, and maintain vessel electrical circuits, control panels, and cable routing systems</li>
      <li>Perform preventive checks and fault diagnostics for onboard electrical equipment</li>
      <li>Read technical drawings and execute safe isolation procedures before maintenance work</li>
      <li>Coordinate with mechanical and safety teams during turnaround and dry-dock schedules</li>
      <li>Maintain service logs, compliance records, and material usage reports</li>
    </ul>

    <h4>Must-Have Requirements</h4>
    <ul>
      <li>5+ years of practical electrical maintenance experience in marine or heavy industrial environments</li>
      <li>Strong knowledge of panel wiring, motor controls, and troubleshooting workflows</li>
      <li>Understanding of safety lockout-tagout practices and permit-to-work systems</li>
      <li>Ability to work in shift patterns and emergency response windows</li>
      <li>Passport validity and travel readiness for project deployment</li>
    </ul>

    <h4>Preferred Skills</h4>
    <ul>
      <li>Experience with offshore commissioning or dry-dock electrical upgrades</li>
      <li>Familiarity with marine compliance checklists and inspection protocols</li>
      <li>Prior exposure to PLC-assisted maintenance diagnostics</li>
    </ul>
  `
};

export const similarJobs = mockJobs.slice(0, 8);
export const featuredJobs = mockJobs.slice(0, 4);

export const mapEmbed =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.1940373635194!2d72.84876179999999!3d18.941284699999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce1f1b445f81%3A0x8d9cbe88dfb041e2!2sBallard%20Estate%2C%20Mumbai!5e0!3m2!1sen!2sin!4v1713951044000!5m2!1sen!2sin";


