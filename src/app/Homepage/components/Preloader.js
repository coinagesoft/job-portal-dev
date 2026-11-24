'use client';
import React, { useState, useEffect } from 'react';

const Preloader = ({ isLoading, message, subMessage, overlayStyle = {} }) => {
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    // If not controlled via props, auto-hide after 3 seconds as before
    if (isLoading === undefined) {
      const timer = setTimeout(() => {
        setInternalLoading(false);
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const active = isLoading !== undefined ? Boolean(isLoading) : internalLoading;

  if (!active) return null;

  return (
    <div id="preloader-active">
      <div
        className="preloader d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: isLoading !== undefined ? "rgba(255, 255, 255, 0.9)" : "#fff",
          ...overlayStyle,
        }}
      >
        <div className="preloader-inner position-relative text-center">
          <div>
            <img 
              src="/assets/imgs/template/loading.gif" 
              alt="Loading" 
              style={{ 
                maxWidth: "200px",
                filter: 'hue-rotate(195deg)'
              }}
            />
            {message && (
              <h5 style={{ marginTop: 20, color: "#122359", fontWeight: 700 }}>
                {message}
              </h5>
            )}
            {subMessage && (
              <p style={{ marginTop: 8, color: "#66789c", fontSize: "14px", maxWidth: "420px", margin: "8px auto 0" }}>
                {subMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
