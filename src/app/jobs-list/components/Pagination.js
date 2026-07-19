"use client";
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, loading = false }) => {
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage || loading) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (totalPages <= 1) return null;

  const pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => {
      // Always show first, last, current, and neighbours;
      // collapse the rest so the bar stays readable even with many pages.
      return (
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1
      );
    })
    .reduce((acc, page, idx, arr) => {
      if (idx > 0 && page - arr[idx - 1] > 1) {
        acc.push("ellipsis-" + page);
      }
      acc.push(page);
      return acc;
    }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 30,
      }}
    >
      <button
        type="button"
        className="btn btn-border btn-sm"
        disabled={currentPage <= 1 || loading}
        onClick={() => goToPage(currentPage - 1)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <i className="fi fi-rr-angle-small-left" style={{ fontSize: 14, lineHeight: 1 }} />
        Prev
      </button>

      {pagesToShow.map((page) =>
        typeof page === "string" ? (
          <span key={page} style={{ padding: "0 4px", color: "#94a3b8" }}>
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`btn btn-sm ${page === currentPage ? "btn-default" : "btn-border"}`}
            disabled={loading}
            onClick={() => goToPage(page)}
            style={{ minWidth: 40 }}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className="btn btn-border btn-sm"
        disabled={currentPage >= totalPages || loading}
        onClick={() => goToPage(currentPage + 1)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        Next
        <i className="fi fi-rr-angle-small-right" style={{ fontSize: 14, lineHeight: 1 }} />
      </button>
    </div>
  );
};

export default Pagination;