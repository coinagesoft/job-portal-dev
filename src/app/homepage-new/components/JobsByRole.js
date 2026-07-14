"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { getAllJobs } from "@/services/candidate/allJobsService";

export default function JobsByRole() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getAllJobs();
        const allJobs = response.data || [];

        const categoryMap = {};
        allJobs.forEach((job) => {
          const category = job.tradeCategory;
          if (!category) return;

          if (!categoryMap[category]) {
            categoryMap[category] = 0;
          }
          categoryMap[category] += 1;
        });

        const activeRoles = Object.keys(categoryMap).map((catName) => {
          return {
            title: catName,
            jobs: categoryMap[catName],
            bg: "/assets/imgs/page/homepage2/img-big1.png",
            industry: catName,
          };
        });

        // Sort by number of vacancies descending
        activeRoles.sort((a, b) => b.jobs - a.jobs);

        setRoles(activeRoles);
      } catch (error) {
        console.error("Error loading jobs by role:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showNav = roles.length > 4;
  const loopMode = roles.length > 4;
  const slidesCount = Math.min(roles.length, 4);

  return (
    <section className="section-box mt-50">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Same fix as JobsByLocation: the theme's default arrow positioning
           floats 65px outside the container, which pushes it off-viewport
           or overlaps the card image. Buttons now straddle the container
           edge instead (half in, half out), scoped to this component's
           swiper only. */
        .swiper-role-next::after,
        .swiper-role-prev::after {
          content: "" !important;
        }
        .swiper-role-next,
        .swiper-role-prev {
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
          z-index: 5;
          cursor: pointer;
        }
        .swiper-role-next {
          left: auto !important;
          right: 0 !important;
          transform: translate(50%, -50%) !important;
        }
        .swiper-role-prev {
          left: 0 !important;
          transform: translate(-50%, -50%) !important;
        }
        .swiper-role-next:hover,
        .swiper-role-prev:hover,
        .swiper-role-next:active,
        .swiper-role-prev:active,
        .swiper-role-next:focus,
        .swiper-role-prev:focus {
          background: #ffa300 !important;
          color: #fff !important;
          top: 50% !important;
          margin-top: 0 !important;
        }
        .swiper-role-next:hover,
        .swiper-role-next:active,
        .swiper-role-next:focus {
          transform: translate(50%, -50%) !important;
        }
        .swiper-role-prev:hover,
        .swiper-role-prev:active,
        .swiper-role-prev:focus {
          transform: translate(-50%, -50%) !important;
        }
        .swiper-role-next.swiper-button-disabled,
        .swiper-role-prev.swiper-button-disabled {
          opacity: 0.35 !important;
          cursor: default;
        }
      `}} />
      <div className="section-box wow animate__animated animate__fadeIn">
        <div className="container">
          <div className="text-start">
            <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">Jobs by Role</h2>
            <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
              Openings grouped by job role and work category
            </p>
          </div>
          <div className="box-swiper mt-50 position-relative">
            {loading ? (
              <div className="text-center py-5">
                <p className="font-lg color-text-paragraph-2">Loading jobs by role...</p>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-5">
                <p className="font-lg color-text-paragraph-2">No roles found with active jobs.</p>
              </div>
            ) : (
              <>
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={slidesCount}
                  loop={loopMode}
                  autoplay={loopMode ? { delay: 3500, disableOnInteraction: false } : false}
                  navigation={{ nextEl: ".swiper-role-next", prevEl: ".swiper-role-prev" }}
                  breakpoints={{
                    320: { slidesPerView: 1 },
                    576: { slidesPerView: Math.min(roles.length, 2) },
                    768: { slidesPerView: Math.min(roles.length, 3) },
                    1200: { slidesPerView: slidesCount },
                  }}
                  className="swiper-group-role mh-none swiper"
                  style={{ paddingBottom: "70px", paddingTop: "5px" }}
                >
                  {roles.map((role) => (
                    <SwiperSlide key={`${role.title}-${role.industry}`} className="hover-up">
                      <div className="card-grid-5 card-category hover-up" style={{ backgroundImage: `url(${role.bg})` }}>
                        <Link href={`/jobs-list?tradeCategory=${encodeURIComponent(role.industry)}`}>
                          <div className="box-cover-img">
                            <div className="content-bottom">
                              <h6 className="color-white mb-5">{role.title}</h6>
                              <p className="color-white font-xs">
                                <span>{role.jobs}</span>
                                <span> {role.jobs === 1 ? "Job" : "Jobs"} Available</span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div
                  className="swiper-button-next swiper-role-next"
                  style={{ display: showNav ? "flex" : "none" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div
                  className="swiper-button-prev swiper-role-prev"
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
      </div>
    </section>
  );
}