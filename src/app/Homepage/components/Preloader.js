'use client';
import React, { useState, useEffect } from 'react';

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Hide after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div id="preloader-active">
      <div className="preloader d-flex align-items-center justify-content-center">
        <div className="preloader-inner position-relative">
          <div className="text-center">
            <img 
              src="/assets/imgs/template/loading.gif" 
              alt="jobBox" 
              style={{ 
                filter: 'hue-rotate(195deg)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;

