"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "./BrowseByCategory.css";

export default function BrowseByCategory() {
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

              {/* Slide 1 */}
              <SwiperSlide className="hover-up">

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-helmet-safety"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Construction</h4>
                      <p className="font-xs">
                        1526<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-screwdriver-wrench"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Technician</h4>
                      <p className="font-xs">
                        185<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

              </SwiperSlide>

              {/* Slide 2 */}
              <SwiperSlide className="hover-up">

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                    <i className="fa-solid fa-gas-pump"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Oil & Gas</h4>
                      <p className="font-xs">
                        168<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-bolt"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Electrical</h4>
                      <p className="font-xs">
                        1856<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

              </SwiperSlide>

              {/* Slide 3 */}
              <SwiperSlide className="hover-up">

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-industry"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Factory Worker</h4>
                      <p className="font-xs">
                        165<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-clipboard-check"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Site Supervisor</h4>
                      <p className="font-xs">
                        965<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

              </SwiperSlide>

              {/* Slide 4 */}
              <SwiperSlide className="hover-up">

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-truck-fast"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Logistics</h4>
                      <p className="font-xs">
                        563<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-shield-halved"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Safety Officer</h4>
                      <p className="font-xs">
                        254<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

              </SwiperSlide>

              {/* Slide 5 */}
              <SwiperSlide className="hover-up">

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-fire-flame-curved"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Welder</h4>
                      <p className="font-xs">
                        142<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <i className="fa-solid fa-gears"></i>
                    </div>

                    <div className="text-info-right">
                      <h4>Mechanical</h4>
                      <p className="font-xs">
                        532<span> Jobs Available</span>
                      </p>
                    </div>
                  </div>
                </a>

              </SwiperSlide>

            </Swiper>

            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>

          </div>
        </div>
      </div>
    </section>
  );
}