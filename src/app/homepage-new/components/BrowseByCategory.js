"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";
import { getAllJobs } from "@/services/candidate/allJobsService";
import "./BrowseByCategory.css";

const iconMap = {
  "Construction": "fa-helmet-safety",
  "Manufacturing": "fa-industry",
  "Warehouse & Logistics": "fa-truck-fast",
  "Warehouse & Material Handling": "fa-truck-fast",
  "Automotive Manufacturing": "fa-car",
  "Mechanical & Building Maintenance": "fa-gears",
  "Mechanical": "fa-gears",
  "Security & Safety Services": "fa-shield-halved",
  "Security & Surveillance Services": "fa-shield-halved",
  "Fire & Safety Services": "fa-fire-extinguisher",
  "Sales & Marketing": "fa-chart-line",
  "Administration & Office Support": "fa-clipboard",
  "Oil & Gas": "fa-gas-pump",
  "Oil and Gas": "fa-gas-pump",
  "Electrical": "fa-bolt",
  "Factory Worker": "fa-industry",
  "Site Supervisor": "fa-clipboard-check",
  "Logistics": "fa-truck-fast",
  "Safety Officer": "fa-shield-halved",
  "Welder": "fa-fire-flame-curved",
  "Other": "fa-briefcase"
};

export default function BrowseByCategory() {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllJobs();
        const jobs = response.data || [];
        
        // Group and count jobs by industryType
        const counts = {};
        jobs.forEach((job) => {
          const industry = job.industryType || "Other";
          counts[industry] = (counts[industry] || 0) + 1;
        });

        // Convert counts object to array of objects
const categoryList = Object.keys(counts).map((industry) => ({
  name: industry,
  count: counts[industry]
}));

const otherCategory = categoryList.find(
  (cat) => cat.name.trim().toLowerCase() === "other"
);

const filteredCategories = categoryList.filter(
  (cat) => cat.name.trim().toLowerCase() !== "other"
);

if (otherCategory) {
  filteredCategories.push(otherCategory);
}

console.log(filteredCategories.map((item) => item.name));

setCategories(filteredCategories);


      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Pair items horizontally: group by page of 10 items (5 top, 5 bottom) to fill the top row first
  const chunkedCategories = [];
  const itemsPerPage = 10;
  for (let i = 0; i < categories.length; i += itemsPerPage) {
    const pageItems = categories.slice(i, i + itemsPerPage);
    const topRow = pageItems.slice(0, 5);
    const bottomRow = pageItems.slice(5, 10);
    const maxSlides = Math.max(topRow.length, bottomRow.length);
    for (let j = 0; j < maxSlides; j++) {
      const slidePair = [];
      if (topRow[j]) slidePair.push(topRow[j]);
      if (bottomRow[j]) slidePair.push(bottomRow[j]);
      chunkedCategories.push(slidePair);
    }
  }

  return (
    <section className="section-box mt-80">
      <div className="section-box wow animate__animated animate__fadeIn">
        <div className="container">

          <div className="text-center">
            <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">
              Browse by category
            </h2>

            <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
              Find the perfect overseas opportunity from thousands of active jobs
            </p>
          </div>

          <div className="box-swiper mt-50">
            {loading ? (
              <div className="text-center py-5">
                <p className="font-lg color-text-paragraph-2">Loading available job categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-5">
                <p className="font-lg color-text-paragraph-2">No categories found.</p>
              </div>
            ) : (
              <>
                <Swiper
                  modules={[Navigation]}
                  slidesPerView={5}
                  navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }}
                  breakpoints={{
                    320: { slidesPerView: 1 },
                    576: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    992: { slidesPerView: 4 },
                    1200: { slidesPerView: 5 },
                  }}
                  className="swiper-container swiper-group-5 swiper"
                  wrapperClass="swiper-wrapper pb-70 pt-5"
                >
                  {chunkedCategories.map((pair, index) => (
                    <SwiperSlide key={index} className="hover-up">
                      {pair.map((cat) => (
                        <Link key={cat.name} href={`/jobs-list?industry=${encodeURIComponent(cat.name)}`}>
                          <div className="item-logo">
                            <div className="image-left">
                              <i className={`fa-solid ${iconMap[cat.name] || "fa-briefcase"}`}></i>
                            </div>

                            <div className="text-info-right">
                              <h4>{cat.name}</h4>
                              <p className="font-xs">
                                {cat.count}<span> Jobs Available</span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}