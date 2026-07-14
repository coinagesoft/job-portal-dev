"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { getAllJobs } from "@/services/candidate/allJobsService";

// Extract the state (and a display country) from a "City, State" style location string.
const getStateCountry = (location = "") => {
  if (!location) return null;
  const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 1) return null;

  // Prefer the second segment as the state; if only one segment exists, use it as-is.
  const state = parts.length > 1 ? parts[1] : parts[0];
  if (!state) return null;

  const indianStates = [
    "maharashtra", "tamil nadu", "delhi", "karnataka", "west bengal", "uttar pradesh",
    "telangana", "assam", "haryana", "punjab", "gujarat", "bihar", "rajasthan", "kerala",
    "tamilnadu", "chandigarh"
  ];
  const lowerState = state.toLowerCase();

  let country = "Global";
  if (indianStates.includes(lowerState)) {
    country = "India";
  } else if (["dubai", "abu dhabi", "sharjah"].includes(lowerState)) {
    country = "UAE";
  } else if (["saudi arabia", "saudi", "ksa", "riyadh", "jeddah", "dammam"].includes(lowerState)) {
    country = "Saudi Arabia";
  } else if (lowerState === "doha" || lowerState === "qatar") {
    country = "Qatar";
  } else if (lowerState === "singapore") {
    country = "Singapore";
  }

  return { state, country };
};

export default function JobsByLocation() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getAllJobs();
        const allJobs = response.data || [];

        const locationMap = {};
        allJobs.forEach((job) => {
          const parsed = getStateCountry(job.jobLocation);
          if (!parsed) return;
          const { state, country } = parsed;
          const key = `${state}-${country}`;

          if (!locationMap[key]) {
            locationMap[key] = {
              state,
              country,
              vacancies: 0,
              companies: new Set(),
            };
          }

          locationMap[key].vacancies += 1;
          if (job.companyName) {
            locationMap[key].companies.add(job.companyName);
          }
        });

        const activeLocations = Object.values(locationMap).map((loc, idx) => {
          const imgIndex = (idx % 6) + 1;
          return {
            state: loc.state,
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
        .box-swiper .swiper-button-next::after,
        .box-swiper .swiper-button-prev::after {
          content: "" !important;
        }
      `}} />
      <div className="container">
        <div className="text-start">
          <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">Jobs by Location</h2>
          <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
            Pick a state and go directly to matching openings
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
                  <SwiperSlide key={`${loc.state}-${loc.country}`} className="hover-up">
                    <div className="card-image-top hover-up">
                      <Link
                        href={`/jobs-list?location=${encodeURIComponent(loc.state)}`}
                        className="d-block w-100 h-100"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="image" style={{ backgroundImage: `url(${loc.img})` }}>
                          {loc.badge ? <span className="lbl-hot">{loc.badge}</span> : null}
                        </div>
                        <div className="informations">
                          <h5>
                            {loc.state}
                            <span className="font-sm color-text-paragraph-2 ml-5">, {loc.country}</span>
                          </h5>
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
                style={{ display: showNav ? "block" : "none" }}
              ></div>
              <div
                className="swiper-button-prev swiper-location-prev"
                style={{ display: showNav ? "block" : "none" }}
              ></div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}