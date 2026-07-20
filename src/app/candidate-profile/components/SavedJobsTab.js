'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProfileJobCard from "./ProfileJobCard";
import { getSavedJobs, saveJob } from "@/services/candidate/savedJobsService";
import { getAllJobs } from "@/services/candidate/allJobsService";
import { useToast } from "@/components/Toast";

const SavedJobsTab = () => {
  const showToast = useToast();
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
          const matchedJob = allJobs.find((item) => item.jobId === job.jobId);

          return {
            id: job.savedJobId,
            jobId: job.jobId,
            logo: matchedJob?.companyLogoUrl || "/assets2/imgs/brands/brand-1.png",
            company: job.companyName,
            employerId: job.employerId || matchedJob?.employerId || null,
            location:
              matchedJob?.jobLocation ||
              matchedJob?.companyLocation ||
              job.locationDisplay ||
              [job.city, job.state].filter(Boolean).join(", "),
            title: job.jobTitle,
            type: job.employmentType,
            experience: job.experienceDisplay || "Experience not specified",
            description:
              matchedJob?.description || job.role || "No description available",
            price: job.salaryDisplay,
            priceUnit: "",
            tags: job.keySkills?.length > 0 ? job.keySkills : job.tags || [],
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

useEffect(() => {
  // Perfect Scrollbar cached the page height on load; async content
  // (like this tab's saved-jobs list) grows after that, so ask it
  // to recalculate — otherwise scroll stops short of the footer.
  if (typeof window !== "undefined" && window.Ps) {
    const scrollContainer = document.querySelector(
      "[data-scroll], .ps, body"
    );
    if (scrollContainer) {
      window.Ps.update(scrollContainer);
    }
  }
}, [savedJobs, loading]);

  const handleUnsave = async (jobId) => {
    try {
      const response = await saveJob(jobId);
      if (response?.data?.success) {
        showToast(response.data.message || "Job unsaved", "success");
        loadSavedJobs();
      } else {
        showToast(response?.data?.message || "Unable to unsave this job", "error");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || error.message || "Failed to unsave job",
        "error"
      );
    }
  };

  const totalPages = Math.max(1, Math.ceil(savedJobs.length / jobsPerPage));

  const pagedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage;
    return savedJobs.slice(startIndex, startIndex + jobsPerPage);
  }, [savedJobs, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: "80px 0" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <p className="mt-15 color-text-paragraph-2">Loading your saved jobs…</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ minHeight: "40vh" }}>
      <h3 className="mt-0 color-brand-1 mb-50">Saved Jobs</h3>

      {savedJobs.length === 0 ? (
        <div
          className="text-center"
          style={{
            padding: "30px 20px",
            background: "#f8f9fc",
            borderRadius: "16px",
            border: "1px dashed #d8dde8",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#fff7ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "#ff9900",
            }}
          >
            <i className="fi-rr-bookmark" />
          </div>
          <h5 style={{ color: "#122359", fontWeight: 700, marginBottom: "8px" }}>
            No saved jobs yet
          </h5>
          <p className="color-text-paragraph-2 mb-25" style={{ maxWidth: "360px", margin: "0 auto 25px" }}>
            Jobs you bookmark while browsing will show up here so you can come
            back to them later.
          </p>
          <Link href="/jobs-list" className="btn btn-default">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <>
          <div className="row">
            {pagedJobs.map((job) => (
              <div
                key={job.id}
                className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12"
                style={{ marginBottom: "20px", display: "flex" }}
              >
                <ProfileJobCard
                  job={job}
                  isListView={false}
                  applyToDetails
                  onUnsave={handleUnsave}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="paginations pagination-center">
              <ul className="pager">
                <li>
                  <button
                    type="button"
                    className="pager-prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </li>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <li key={page}>
                      <button
                        type="button"
                        className={`pager-number ${currentPage === page ? "active" : ""}`}
                        onClick={() => handlePageChange(page)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </li>
              </ul>
            </div>
          )}
        </>
      )}
        </div>

    </>
  );
};

export default SavedJobsTab;