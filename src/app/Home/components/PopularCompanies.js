"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { getPublicCompanies } from "@/services/candidate/companyService";

const FALLBACK_LOGO = "/assets/imgs/page/company/img.png";

export default function PopularCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getPublicCompanies({ pageSize: 12 });
        const raw = response.data;
        const list = Array.isArray(raw?.companies) ? raw.companies : [];
        const sorted = [...list].sort(
          (a, b) => (b.openJobsCount ?? 0) - (a.openJobsCount ?? 0)
        );
        setCompanies(sorted);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const showNav = companies.length > 5;
  const loopMode = companies.length > 5;
  const slidesCount = Math.min(companies.length, 5);

  return (
    <section className="section-box mt-70 mb-70">
      <style dangerouslySetInnerHTML={{ __html: `
        .swiper-company-next::after,
        .swiper-company-prev::after {
          content: "" !important;
        }
        .swiper-company-next,
        .swiper-company-prev {
          position: absolute !important;
          top: 50% !important;
          margin-top: 0 !important;
          width: 42px !important;
          height: 42px !important;
          border-radius: 50% !important;
          background: #fff !important;
          background-image: none !important;
          box-shadow: 0 4px 14px rgba(18,35,89,0.16) !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #122359;
          z-index: 20;
          cursor: pointer;
        }
        .swiper-company-next {
          left: auto !important;
          right: 0 !important;
          transform: translate(50%, -50%) !important;
        }
        .swiper-company-prev {
          left: 0 !important;
          transform: translate(-50%, -50%) !important;
        }
        .swiper-company-next:hover,
        .swiper-company-prev:hover,
        .swiper-company-next:active,
        .swiper-company-prev:active,
        .swiper-company-next:focus,
        .swiper-company-prev:focus {
          background: #ffa300 !important;
          color: #fff !important;
          top: 50% !important;
          margin-top: 0 !important;
        }
        .swiper-company-next:hover,
        .swiper-company-next:active,
        .swiper-company-next:focus {
          transform: translate(50%, -50%) !important;
        }
        .swiper-company-prev:hover,
        .swiper-company-prev:active,
        .swiper-company-prev:focus {
          transform: translate(-50%, -50%) !important;
        }
        .swiper-company-next.swiper-button-disabled,
        .swiper-company-prev.swiper-button-disabled {
          opacity: 0.35 !important;
          cursor: default;
        }

        /* Swiper sets overflow:hidden on .swiper and its .swiper-wrapper via
           inline styles at runtime, which beats a plain (non-important) CSS
           rule regardless of source order. Only !important here can win,
           which is why the vertical clip (and the resulting native scrollbar
           once content exceeded the clipped height) survived the last pass. */
        .box-swiper-company {
          overflow: visible;
          padding: 14px 4px 8px;
        }
        .swiper-group-company,
        .swiper-group-company.swiper {
          overflow: hidden !important;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
          margin-top: -16px !important;
          margin-bottom: -16px !important;
        }
        .swiper-group-company .swiper-wrapper {
          overflow: visible !important;
          align-items: stretch;
        }
        .swiper-group-company .swiper-slide {
          height: auto !important;
          overflow: visible !important;
          display: flex;
        }

        .company-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          text-decoration: none;
          background: #fff;
        }
        .company-card .card-block-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .company-logo-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid #e7eaf3;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          box-shadow: 0 2px 8px rgba(18,35,89,0.06);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .company-card:hover .company-logo-wrap {
          border-color: #ffa300;
          transform: scale(1.05);
        }
        .company-logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .company-name {
          font-size: 15px;
          font-weight: 700;
          color: #122359;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .company-location {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          color: #8a94a6;
          min-height: 18px;
        }
        .company-tab-count {
          display: inline-block;
          margin-top: auto;
          padding: 2px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(18,35,89,0.08);
          color: #122359;
          white-space: nowrap;
        }
      `}} />

      <div className="container">
        <div className="text-center">
          <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">
            Popular Companies
          </h2>

          <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
            Top employers hiring right now
          </p>
        </div>

        <div className="box-swiper box-swiper-company mt-50 position-relative">
          {loading ? (
            <div className="text-center py-5">
              <p className="font-lg color-text-paragraph-2">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-5">
              <p className="font-lg color-text-paragraph-2">No companies found.</p>
            </div>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={slidesCount}
                loop={loopMode}
                autoplay={loopMode ? { delay: 2800, disableOnInteraction: false } : false}
                navigation={{ nextEl: ".swiper-company-next", prevEl: ".swiper-company-prev" }}
                breakpoints={{
                  320: { slidesPerView: Math.min(companies.length, 1.5) },
                  576: { slidesPerView: Math.min(companies.length, 2) },
                  768: { slidesPerView: Math.min(companies.length, 3) },
                  992: { slidesPerView: Math.min(companies.length, 4) },
                  1200: { slidesPerView: slidesCount },
                }}
                className="swiper-group-company mh-none swiper"
              >
                {companies.map((company) => (
                  <SwiperSlide key={company.employerId}>
                    <Link
                      href={`/company-details?employerId=${company.employerId}`}
                      className="card-grid-2 grid-bd-16 hover-up company-card"
                    >
                      <div className="card-block-info pt-20 px-3 pb-3 text-center">
                        <div className="company-logo-wrap mx-auto mb-12">
                          <img
                            src={company.companyLogoUrl || FALLBACK_LOGO}
                            alt={company.companyName}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_LOGO;
                            }}
                          />
                        </div>

                        <h6 className="company-name mb-5">{company.companyName}</h6>

                        <span className="company-location mb-12">
                          {company.city && (
                            <>
                              <i className="fi-rr-marker"></i>
                              {company.city}
                            </>
                          )}
                        </span>

                        <span className="company-tab-count mt-2">
                          {company.openJobsCount ?? 0} open jobs
                        </span>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div
                className="swiper-button-next swiper-company-next"
                style={{ display: showNav ? "flex" : "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div
                className="swiper-button-prev swiper-company-prev"
                style={{ display: showNav ? "flex" : "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}