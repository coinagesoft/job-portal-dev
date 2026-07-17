"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { getAllJobs } from "@/services/candidate/allJobsService";
import { resolveCountry } from "@/utils/locationResolver";

export default function JobsByLocation() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getAllJobs();
        const allJobs = response.data || [];

        // Group by resolved country — every state/city rolls up into one
        // card per country (e.g. all Indian jobs across every state become
        // a single "India" card), now resolved dynamically for any country.
        const countryMap = {};
        allJobs.forEach((job) => {
          const country = resolveCountry(job.jobLocation);
          if (!country) return;

          if (!countryMap[country]) {
            countryMap[country] = {
              country,
              vacancies: 0,
              companies: new Set(),
            };
          }

          countryMap[country].vacancies += 1;
          if (job.companyName) {
            countryMap[country].companies.add(job.companyName);
          }
        });

        const activeLocations = Object.values(countryMap).map((loc, idx) => {
          const imgIndex = (idx % 6) + 1;
          return {
            country: loc.country,
            vacancies: loc.vacancies,
            companies: loc.companies.size,
            badge: loc.vacancies > 10 ? "Hot" : loc.vacancies > 5 ? "Trending" : "",
            img: `/assets/imgs/page/homepage1/location${imgIndex}.png`,
          };
        });

        // Sort locations by number of vacancies descending
        activeLocations.sort((a, b) => b.vacancies - a.vacancies);

        setLocations(activeLocations);
      } catch (error) {
        console.error("Error loading jobs for location counts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showNav = locations.length > 4;
  const loopMode = locations.length > 4;
  const slidesCount = Math.min(locations.length, 4);

  return (
    <section className="section-box mt-50 mb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        /* The theme's default .box-swiper arrow positioning floats the
           buttons 65px outside the container on each side, which only
           looks right when there's enough page whitespace around the
           section — here it pushes them past the edge of the viewport
           (or lets them collide with neighboring content). Overriding
           with a self-contained circular button that sits just inside
           the card row instead, so it never depends on outer page
           spacing. Scoped to this component's swiper only. */
        .swiper-location-next::after,
        .swiper-location-prev::after {
          content: "" !important;
        }
        .swiper-location-next,
        .swiper-location-prev {
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
        .swiper-location-next {
          left: auto !important;
          right: 0 !important;
          transform: translate(50%, -50%) !important;
        }
        .swiper-location-prev {
          left: 0 !important;
          transform: translate(-50%, -50%) !important;
        }
        .swiper-location-next:hover,
        .swiper-location-prev:hover,
        .swiper-location-next:active,
        .swiper-location-prev:active,
        .swiper-location-next:focus,
        .swiper-location-prev:focus {
          background: #ffa300 !important;
          color: #fff !important;
          top: 50% !important;
          margin-top: 0 !important;
        }
        .swiper-location-next:hover,
        .swiper-location-next:active,
        .swiper-location-next:focus {
          transform: translate(50%, -50%) !important;
        }
        .swiper-location-prev:hover,
        .swiper-location-prev:active,
        .swiper-location-prev:focus {
          transform: translate(-50%, -50%) !important;
        }
        .swiper-location-next.swiper-button-disabled,
        .swiper-location-prev.swiper-button-disabled {
          opacity: 0.35 !important;
          cursor: default;
        }
      `}} />
      <div className="container">
        <div className="text-start">
          <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">Jobs by Location</h2>
          <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
            Pick a country and go directly to matching openings
          </p>
        </div>
        <div className="box-swiper mt-50 position-relative">
          {loading ? (
            <div className="text-center py-5">
              <p className="font-lg color-text-paragraph-2">Loading available locations...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-5">
              <p className="font-lg color-text-paragraph-2">No locations found with active jobs.</p>
            </div>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={slidesCount}
                loop={loopMode}
                autoplay={loopMode ? { delay: 3000, disableOnInteraction: false } : false}
                navigation={{
                  nextEl: ".swiper-location-next",
                  prevEl: ".swiper-location-prev"
                }}
                breakpoints={{
                  320: { slidesPerView: 1 },
                  576: { slidesPerView: Math.min(locations.length, 2) },
                  768: { slidesPerView: Math.min(locations.length, 3) },
                  1200: { slidesPerView: slidesCount },
                }}
                className="swiper-group-location swiper"
                style={{ paddingBottom: "10px", paddingTop: "5px" }}
              >
                {locations.map((loc) => (
                  <SwiperSlide key={loc.country} className="hover-up">
                    <div className="card-image-top hover-up">
                      <Link
                        href={`/jobs-list?location=${encodeURIComponent(loc.country)}`}
                        className="d-block w-100 h-100"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="image" style={{ backgroundImage: `url(${loc.img})` }}>
                          {loc.badge ? <span className="lbl-hot">{loc.badge}</span> : null}
                        </div>
                        <div className="informations">
                          <h5>{loc.country}</h5>
                          <div className="row">
                            <div className="col-lg-6 col-6">
                              <span className="text-14 color-text-paragraph-2">
                                {loc.vacancies} {loc.vacancies === 1 ? "Job" : "Jobs"}
                              </span>
                            </div>
                            <div className="col-lg-6 col-6 text-end">
                              <span className="color-text-paragraph-2 text-14">
                                {loc.companies} {loc.companies === 1 ? "Company" : "Companies"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div
                className="swiper-button-next swiper-location-next"
                style={{ display: showNav ? "flex" : "none" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div
                className="swiper-button-prev swiper-location-prev"
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