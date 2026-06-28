"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfileSummary } from "@/services/candidate/profileSummaryService";
import { getWorkExperience } from "@/services/candidate/workExperienceService";
import { getEducation } from "@/services/candidate/educationService";
import { getSkills } from "@/services/candidate/skillsService";

const arr = (res) =>
  res?.data?.data ?? res?.data ?? [];

const CandidateProfilePreviewPage = () => {
  const [summary, setSummary] = useState(null);
  const [work, setWork] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, w, e, sk] = await Promise.all([
          getProfileSummary().catch(() => null),
          getWorkExperience().catch(() => null),
          getEducation().catch(() => null),
          getSkills().catch(() => null),
        ]);
        setSummary(s?.data?.data ?? s?.data ?? null);
        setWork(arr(w));
        setEducation(arr(e));
        setSkills(arr(sk));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fullName = summary?.fullName || "Your Name";
  const trade = summary?.role || summary?.primaryTrade || "—";
  const years = summary?.totalExperienceYears ?? 0;
  const city = summary?.currentCity || "";
  const state = summary?.currentState || "";
  const about = summary?.professionalSummary || summary?.about || "";

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="candidate-inner-panel">
            <div className="d-flex justify-content-between align-items-center mb-20">
              <h3 className="mt-0 color-brand-1 mb-0">Full CV Preview</h3>
              <Link href="/candidate-profile#cv" className="btn btn-border btn-sm">
                Back to Profile
              </Link>
            </div>

            {loading ? (
              <p className="font-sm color-text-paragraph-2">Loading your CV…</p>
            ) : (
              <div className="candidate-settings-card">
                <h4>{fullName}</h4>
                <p className="font-sm color-text-paragraph-2 mb-20">
                  {trade} · {years} years
                  {city || state ? ` · ${[city, state].filter(Boolean).join(", ")}` : ""}
                </p>

                <h6>Summary</h6>
                <p className="font-sm color-text-paragraph mb-20">
                  {about || "No summary added yet."}
                </p>

                <h6>Work Experience</h6>
                {work.length === 0 ? (
                  <p className="font-sm color-text-paragraph-2 mb-20">No work experience added.</p>
                ) : (
                  work.map((entry, i) => (
                    <div key={entry.workId || entry.id || i} className="candidate-ticket-item mb-10">
                      <strong>
                        {(entry.jobTitle || entry.title || "Role")} -{" "}
                        {(entry.companyName || entry.company || "Company")}
                      </strong>
                      <p className="mb-5">
                        {(entry.startDate || "-")} to{" "}
                        {(entry.isCurrent || entry.current) ? "Present" : (entry.endDate || "-")}
                        {entry.location ? ` · ${entry.location}` : ""}
                      </p>
                      <small>{entry.description || ""}</small>
                    </div>
                  ))
                )}

                <h6 className="mt-20">Education</h6>
                {education.length === 0 ? (
                  <p className="font-sm color-text-paragraph-2 mb-20">No education added.</p>
                ) : (
                  education.map((entry, i) => (
                    <div key={entry.educationId || entry.id || i} className="candidate-ticket-item mb-10">
                      <strong>{entry.degree || entry.title || entry.qualification || "Qualification"}</strong>
                      <p className="mb-0">{entry.institution || entry.instituteName || entry.schoolName || ""}</p>
                      <small>
                        {entry.meta ||
                          [entry.startYear, entry.endYear].filter(Boolean).join(" - ")}
                      </small>
                    </div>
                  ))
                )}

                <h6 className="mt-20">Skills</h6>
                <div className="candidate-profile-v2-cv-skills">
                  {skills.length === 0 ? (
                    <span className="font-sm color-text-paragraph-2">No skills added.</span>
                  ) : (
                    skills.map((skill, i) => (
                      <span
                        key={skill.skillId || skill.id || i}
                        className="candidate-profile-v2-badge is-brand"
                      >
                        {typeof skill === "string" ? skill : skill.skillName || skill.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CandidateProfilePreviewPage;