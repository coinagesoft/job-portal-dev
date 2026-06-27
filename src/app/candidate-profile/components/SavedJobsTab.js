'use client';

import React, { useEffect, useMemo, useState } from "react";
import ProfileJobCard from "./ProfileJobCard";
import { getSavedJobs } from "@/services/candidate/savedJobsService";
import { getAllJobs } from "@/services/candidate/allJobsService";

const SavedJobsTab = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const jobsPerPage = 6;

  useEffect(() => {
    loadSavedJobs();
  }, []);

 const loadSavedJobs = async () => {
  try {
    setLoading(true);

    const [savedResponse, allJobsResponse] = await Promise.all([
      getSavedJobs(),
      getAllJobs(),
    ]);

    if (savedResponse?.data?.success) {
      const allJobs = allJobsResponse?.data || [];

      const formattedJobs = savedResponse.data.savedJobs.map((job) => {
        // Find matching job from All_Jobs API
        const matchedJob = allJobs.find(
          (item) => item.jobId === job.jobId
        );

        return {
          id: job.savedJobId,
          jobId: job.jobId,

          // Take logo from All_Jobs API
          logo:
            matchedJob?.companyLogoUrl ||
            "/assets2/imgs/brands/brand-1.png",

          company: job.companyName,

         location:
  matchedJob?.jobLocation ||
  matchedJob?.companyLocation ||
  job.locationDisplay ||
  [job.city, job.state].filter(Boolean).join(", "),

          title: job.jobTitle,

          type: job.employmentType,

          experience:
            job.experienceDisplay ||
            "Experience not specified",

       description:
  matchedJob?.description ||
  job.role ||
  "No description available",

          price: job.salaryDisplay,

          priceUnit: "",

          tags:
            job.keySkills?.length > 0
              ? job.keySkills
              : job.tags || [],

          time: job.timeAgo || "Recently",
        };
      });

      setSavedJobs(formattedJobs);
    }
  } catch (error) {
    console.error("Saved Jobs Error:", error);
  } finally {
    setLoading(false);
  }
};

  const totalPages = Math.max(
    1,
    Math.ceil(savedJobs.length / jobsPerPage)
  );

  const pagedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage;

    return savedJobs.slice(
      startIndex,
      startIndex + jobsPerPage
    );
  }, [savedJobs, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h3 className="mt-0 color-brand-1 mb-50">
        Saved Jobs
      </h3>

      <div className="row">
        {pagedJobs.map((job) => (
          <div
            key={job.id}
            className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12"
            style={{
              marginBottom: "0px",
              display: "flex",
            }}
          >
            <ProfileJobCard
              job={job}
              isListView={false}
              applyToDetails
            />
          </div>
        ))}
      </div>

      {savedJobs.length === 0 && (
        <p>No saved jobs found.</p>
      )}

      <div className="paginations pagination-center">
        <ul className="pager">
          <li>
            <button
              type="button"
              className="pager-prev"
              onClick={() =>
                handlePageChange(currentPage - 1)
              }
              disabled={currentPage === 1}
            />
          </li>

          {Array.from({
            length: totalPages,
          }).map((_, index) => {
            const page = index + 1;

            return (
              <li key={page}>
                <button
                  type="button"
                  className={`pager-number ${
                    currentPage === page
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePageChange(page)
                  }
                >
                  {page}
                </button>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              className="pager-next"
              onClick={() =>
                handlePageChange(currentPage + 1)
              }
              disabled={currentPage === totalPages}
            />
          </li>
        </ul>
      </div>
    </>
  );
};

export default SavedJobsTab;
