import { mockJobs } from "@/app/jobs-list/components/data.js";

export const detailedJob = {
  id: 99,
  jobId: "9151d8d7-7367-4aaf-b986-0b99a55f03f7",
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

const asText = (value, fallback = "") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const joinText = (...values) =>
  values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");

export const mapApiJobToDetailedJob = (job = {}) => {
  const cityState = joinText(job.city, job.state);
  const companyName = asText(job.companyName, detailedJob.company);
  const fullCompanyName = asText(job.companyFullName || job.companyLegalName, companyName);
  const location = asText(
    job.location || cityState || job.workLocation,
    detailedJob.location
  );
  const roleTitle = asText(job.jobTitle, detailedJob.title);
  const employmentType = asText(job.jobType || job.employmentType, detailedJob.type);
  const timeAgo = asText(job.timeAgo || job.postedTimeAgo, detailedJob.time);
  const salary = asText(job.salaryDisplay || job.salaryRange, detailedJob.salary);
  const experience = job.experienceRequiredYears
    ? `${job.experienceRequiredYears} Years`
    : detailedJob.experience;
  const education = asText(job.educationQualification || job.education, detailedJob.education);
  const certifications = Array.isArray(job.certifications)
    ? job.certifications.join(", ")
    : asText(job.requiredCertification, detailedJob.requiredCertification);
  const languages = Array.isArray(job.languageRequirements)
    ? job.languageRequirements.join(", ")
    : asText(job.languagePreferred, detailedJob.languagePreferred);

  return {
    ...detailedJob,
    ...job,
    id: job.id || job.jobId || detailedJob.id,
    jobId: job.jobId || detailedJob.jobId,
    title: roleTitle,
    jobTitle: roleTitle,
    company: companyName,
    companyName,
    companyFull: fullCompanyName,
    location,
    type: employmentType,
    jobType: employmentType,
    time: timeAgo,
    salary,
    experience,
    industry: asText(job.tradeCategory || job.industry, detailedJob.industry),
    jobLevel: asText(job.jobLevel || job.seniorityLevel, detailedJob.jobLevel),
    minAgeMax: asText(job.ageRange || job.minAgeMax, detailedJob.minAgeMax),
    locationType: asText(job.workMode || job.locationType, detailedJob.locationType),
    education,
    requiredCertification: certifications,
    gender: asText(job.genderPreference || job.gender, detailedJob.gender),
    languagePreferred: languages,
    deadline: asText(job.applicationDeadline || job.deadline, detailedJob.deadline),
    updated: asText(job.updatedAt || job.updatedOn || job.updated, detailedJob.updated),
    openJobs: Number(job.openJobs || job.activeJobsCount || detailedJob.openJobs),
    address: asText(job.companyAddress || job.address, detailedJob.address),
    phone: asText(job.companyPhone || job.phone, detailedJob.phone),
    email: asText(job.companyEmail || job.email, detailedJob.email),
    bannerImg: asText(job.bannerImg || job.coverImageUrl, detailedJob.bannerImg),
    avatar: asText(job.companyLogoUrl || job.avatar, detailedJob.avatar),
    screeningQuestions: Array.isArray(job.screeningQuestions)
      ? job.screeningQuestions
      : detailedJob.employerQuestions,
    employerQuestions: Array.isArray(job.employerQuestions)
      ? job.employerQuestions
      : detailedJob.employerQuestions,
    verifications: job.verifications || detailedJob.verifications || {},
    description: asText(
      job.jobDescriptionHtml || job.descriptionHtml || job.description,
      detailedJob.description
    ),
  };
};


