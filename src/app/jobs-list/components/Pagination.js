'use client';
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className="paginations">
      <ul className="pager">
        <li>
          <button
            type="button"
            className="pager-prev"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          />
        </li>
        {pages.map(page => (
          <li key={page}>
            <button
              type="button"
              className={`pager-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="pager-next"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          />
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
