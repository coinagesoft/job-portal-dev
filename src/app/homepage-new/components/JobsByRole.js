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
        .box-swiper .swiper-button-next::after,
        .box-swiper .swiper-button-prev::after {
          content: "" !important;
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
                        <Link href={`/jobs-list?industry=${encodeURIComponent(role.industry)}`}>
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
                  style={{ display: showNav ? "block" : "none" }}
                ></div>
                <div
                  className="swiper-button-prev swiper-role-prev"
                  style={{ display: showNav ? "block" : "none" }}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
