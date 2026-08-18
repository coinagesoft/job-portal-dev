'use client';
import React, { useEffect, useState } from 'react';
import api from '@/services/api';

const StatsSection = () => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const response = await api.get('/api/public/homepage/data');
        const payload = response?.data ?? response;

        console.log('Homepage API payload:', payload);

        if (!payload?.success) {
          throw new Error('API responded but success was falsy');
        }

        if (isMounted) {
          const sortedStats = [...(payload.statistics || [])].sort(
            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
          );
          setStatistics(sortedStats);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          console.error('Failed to load homepage statistics:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && statistics.length > 0 && typeof window !== 'undefined') {
      if (window.initCounters) {
        window.initCounters();
      }
    }
  }, [loading, statistics]);

  if (loading) {
    return (
      <section className="section-box overflow-visible mt-50 mb-50">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p>Loading statistics...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || statistics.length === 0) {
    return null;
  }

  return (
    <section className="section-box overflow-visible mt-50 mb-50">
      <div className="container">
        <div className="row">
          {statistics.map((stat, index) => {
            const numericValue = parseInt(
              String(stat.value).replace(/[^0-9]/g, ''),
              10
            ) || 0;

            return (
              <div
                key={stat.id || `${stat.label}-${index}`}
                className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12"
              >
                <div className="text-center">
                  <h1 className="color-brand-2">
                    <span className="count" data-target={numericValue}>
                      {numericValue}
                    </span>
                    {stat.suffix && <span> {stat.suffix}</span>}
                  </h1>
                  <h5>{stat.label}</h5>
                  {stat.iconSlug && (
                    <p className="font-sm color-text-paragraph mt-10">
                      {stat.iconSlug}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;