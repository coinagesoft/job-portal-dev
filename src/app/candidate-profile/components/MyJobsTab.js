'use client';
import React, { useMemo, useState } from "react";
import ProfileJobCard from "./ProfileJobCard";
import { mockMyJobs } from "./data";

const MyJobsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(mockMyJobs.length / jobsPerPage));
  const pagedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage;
    return mockMyJobs.slice(startIndex, startIndex + jobsPerPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <h3 className="mt-0 color-brand-1 mb-50">My Jobs</h3>
      <div className="row display-list">
        {pagedJobs.map((job) => (
          <div key={job.id} className="col-xl-12 col-12">
            <ProfileJobCard job={job} isListView={true} />
          </div>
        ))}
      </div>
      <div className="paginations">
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
    </>
  );
};

export default MyJobsTab;
